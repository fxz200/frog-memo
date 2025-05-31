import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { Store } from "@tauri-apps/plugin-store";
import { MemoApp } from "./components/Page";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { v4 as uuidv4 } from "uuid";
interface MemoBlock {
  id: string;
  title: string;
  content: string;
  tags: string[];
  format: string;
  showLineNumbers: boolean;
  height: number;
}
function App() {
  const [store, setStore] = useState<Store | null>(null);
  const [memos, setMemos] = useState<MemoBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化 store
  useEffect(() => {
    const initStore = async () => {
      try {
        const storeInstance = await load("store.json", { autoSave: false });
        const savedMemos = await storeInstance.get("memos");
        if (savedMemos) {
          setMemos(savedMemos as MemoBlock[]);
        } else {
          const defaultMemos: MemoBlock[] = [
            {
              id: uuidv4(),
              title: "新備忘錄",
              content: "",
              tags: ["未分類"],
              format: "auto",
              showLineNumbers: false,
              height: 150,
            },
          ];
          setMemos(defaultMemos);
          await storeInstance.set("memos", defaultMemos);
          await storeInstance.save();
        }
        setStore(storeInstance);
        setIsLoading(false);
      } catch (error) {
        console.error("初始化 store 時發生錯誤:", error);
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  const saveMemos = async (updatedMemos: MemoBlock[]) => {
    if (!store) return;
    try {
      setMemos(updatedMemos);
      await store.set("memos", updatedMemos);
      await store.save();
    } catch (error) {
      console.error("保存備忘錄時發生錯誤:", error);
      toast.error("保存備忘錄時發生錯誤: " + error);
    }
  };

  if (isLoading) {
    return <div>載入中...</div>;
  }

  return (
    <>
      <MemoApp initialMemos={memos} onMemosUpdate={saveMemos} />
      <Toaster />
    </>
  );
}

export default App;
