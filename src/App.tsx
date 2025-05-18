import { useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { MemoApp } from "./components/Page";

function App() {
  const [copied, setCopied] = useState(false);
  const command = "docker compose up -d";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initializeStore = async () => {
    const store = await load("store.json", { autoSave: false });
    const val = await store.get<{ value: number }>("some-key");
    console.log(val); // { value: 5 }
    await store.save();
  };

  initializeStore();
  ///
  return <MemoApp></MemoApp>;
}

export default App;
