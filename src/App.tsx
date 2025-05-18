import { useState } from "react";
import { load } from "@tauri-apps/plugin-store";

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
  return (
    <div className="p-4 text-white bg-gray-900 h-screen">
      <h1 className="text-xl font-bold mb-4">常用指令</h1>
      <div className="bg-gray-800 p-4 rounded shadow">
        <code>{command}</code>
        <button
          onClick={handleCopy}
          className="ml-4 px-3 py-1 bg-blue-500 rounded hover:bg-blue-600"
        >
          {copied ? "已複製" : "複製"}
        </button>
      </div>
    </div>
  );
}

export default App;
