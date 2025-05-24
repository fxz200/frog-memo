import { useState, useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { Store } from "@tauri-apps/plugin-store";
import { MemoApp } from "./components/Page";
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
        // 建立 store 實例
        const storeInstance = await load("store.json", { autoSave: false });

        // 載入已儲存的 memos
        const savedMemos = await storeInstance.get("memos");

        // 如果有已儲存的 memos，則使用它們
        if (savedMemos) {
          setMemos(savedMemos as MemoBlock[]);
        } else {
          // 否則設定預設值
          const defaultMemos: MemoBlock[] = [
            {
              id: "1",
              title: "新備忘錄",
              content: "",
              tags: ["未分類"],
              format: "auto",
              showLineNumbers: false,
              height: 200,
            },
          ];
          setMemos(defaultMemos);

          // 儲存預設值
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

  // 保存 memos 到 store
  const saveMemos = async (updatedMemos: MemoBlock[]) => {
    if (!store) return;

    try {
      setMemos(updatedMemos);
      await store.set("memos", updatedMemos);
      await store.save();
      console.log("備忘錄已保存");
    } catch (error) {
      console.error("保存備忘錄時發生錯誤:", error);
    }
  };

  if (isLoading) {
    return <div>載入中...</div>;
  }
  ///
  return <MemoApp initialMemos={memos} onMemosUpdate={saveMemos} />;
}

export default App;
