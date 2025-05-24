"use client";

import { useState, useMemo } from "react";
import {
  Copy,
  Plus,
  Trash2,
  Tag,
  X,
  Code,
  ListOrdered,
  Search,
  XCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCode } from "../lib/code-formatter";
import { CodeEditor } from "../components/code-editor";
import { Toggle } from "@/components/ui/toggle";
import { SearchInput } from "@/components/search-input";
import { ThemeToggle } from "@/components/theme-toggle";
interface MemoBlock {
  id: string;
  title: string;
  content: string;
  tags: string[];
  format: string;
  showLineNumbers: boolean;
  height: number;
}
interface MemoAppProps {
  initialMemos: MemoBlock[];
  onMemosUpdate: (memos: MemoBlock[]) => void;
}
const FORMAT_OPTIONS = [
  { value: "auto", label: "自動檢測" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "shell", label: "Shell" },
  { value: "groovy", label: "Groovy" },
  { value: "plaintext", label: "純文本" },
];

export function MemoApp({ initialMemos, onMemosUpdate }: MemoAppProps) {
  const [memoBlocks, setMemoBlocks] = useState<MemoBlock[]>(initialMemos);
  // 更新 memoBlocks 的函數，同時呼叫 onMemosUpdate
  const updateMemos = (newMemos: MemoBlock[]) => {
    setMemoBlocks(newMemos);
    onMemosUpdate(newMemos);
  };
  // 更新現有備忘錄的函數
  const updateMemo = (id: string, updates: Partial<MemoBlock>) => {
    const updatedMemos = memoBlocks.map((memo) =>
      memo.id === id ? { ...memo, ...updates } : memo
    );
    updateMemos(updatedMemos);
  };
  const [availableTags, setAvailableTags] = useState<string[]>(["未分類"]);
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScope, setSearchScope] = useState<
    "all" | "content" | "title" | "tags"
  >("all");

  const addNewBlock = (tag: string) => {
    const newId = Date.now().toString();
    setMemoBlocks([
      ...memoBlocks,
      {
        id: newId,
        title: "新備忘錄",
        content: "",
        tags: [tag],
        format: "auto",
        showLineNumbers: false,
        height: 200,
      },
    ]);
    const updatedMemos = [
      ...memoBlocks,
      {
        id: newId,
        title: "新備忘錄",
        content: "",
        tags: [tag],
        format: "auto",
        showLineNumbers: false,
        height: 200,
      },
    ];
    updateMemos(updatedMemos);
  };

  const updateBlockContent = (id: string, content: string) => {
    setMemoBlocks(
      memoBlocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
    updateMemo(id, { content });
  };

  const updateBlockTitle = (id: string, title: string) => {
    setMemoBlocks(
      memoBlocks.map((block) => (block.id === id ? { ...block, title } : block))
    );
    updateMemo(id, { title });
  };

  const updateBlockFormat = (id: string, format: string) => {
    setMemoBlocks(
      memoBlocks.map((block) =>
        block.id === id ? { ...block, format } : block
      )
    );
    updateMemo(id, { format });
  };

  const toggleLineNumbers = (id: string) => {
    setMemoBlocks(
      memoBlocks.map((block) =>
        block.id === id
          ? { ...block, showLineNumbers: !block.showLineNumbers }
          : block
      )
    );
  };

  const updateBlockHeight = (id: string, height: number) => {
    setMemoBlocks(
      memoBlocks.map((block) =>
        block.id === id ? { ...block, height: Math.max(100, height) } : block
      )
    );
    updateMemo(id, { height });
  };

  const deleteBlock = (id: string) => {
    setMemoBlocks(memoBlocks.filter((block) => block.id !== id));
    const updatedMemos = memoBlocks.filter((memo) => memo.id !== id);
    updateMemos(updatedMemos);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "已複製到剪貼簿",
      duration: 2000,
    });
  };

  const beautifyCode = async (id: string) => {
    try {
      const block = memoBlocks.find((block) => block.id === id);
      if (!block) return;

      const format =
        block.format === "auto" ? detectFormat(block.content) : block.format;
      const beautified = await formatCode(block.content, format);

      updateBlockContent(id, beautified);

      toast({
        description: `${getFormatLabel(format)} 格式化成功`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: `格式化失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`,
        duration: 2000,
      });
    }
  };

  const detectFormat = (content: string): string => {
    // 用於空內容的情況
    if (!content.trim()) return "plaintext";

    // 標準化內容（針對檢測）
    const trimmedContent = content.trim();

    // 嘗試檢測 JSON
    try {
      JSON.parse(trimmedContent);
      return "json";
    } catch (e) {
      // 不是 JSON
    }

    // YAML 檢測
    if (
      /^[\w\s]+:[\s\w]/.test(trimmedContent) &&
      /:\s*[\w\s\.]+(\n|$)/.test(trimmedContent)
    ) {
      return "yaml";
    }

    // JavaScript 檢測
    if (
      /(let|const|function|=>|\bif\s*\(|\bfor\s*\(|console\.log|document\.|window\.)/.test(
        trimmedContent
      ) &&
      !/(^\s*<|^\s*#include|^\s*import\s+[\w\.]+;|^\s*package\s+[\w\.]+;)/.test(
        trimmedContent
      )
    ) {
      return "javascript";
    }

    // TypeScript 檢測
    if (
      /(interface|type|:[\s]*(string|number|boolean)|<[\w<>]+>)/.test(
        trimmedContent
      )
    ) {
      return "typescript";
    }

    // HTML 檢測
    if (
      /<\/?[a-z][\s\S]*>/i.test(trimmedContent) &&
      /<(html|body|div|span|h1|p|a|img)[\s>]/.test(trimmedContent)
    ) {
      return "html";
    }

    // CSS 檢測
    if (
      /([\.\#][\w-]+\s*\{|body\s*\{|@media|@keyframes|margin:|padding:|color:|background:)/.test(
        trimmedContent
      ) &&
      /\{[\s\S]*\}/.test(trimmedContent)
    ) {
      return "css";
    }

    // SQL 檢測
    if (
      /(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)[\s\S]*(FROM|INTO|TABLE|DATABASE)/i.test(
        trimmedContent
      )
    ) {
      return "sql";
    }
    // Shell 腳本檢測（增強版）
    if (
      /(^|\n\s*)(#!\/bin\/(ba)?sh|apt|sudo|echo|export|cd|ls|grep|mkdir|rm|cp|chmod|chown|if\s+\[|for\s+\w+\s+in|while\s+\[|function\s+\w+\(\)|source|\.\/|\$\{|\$\(|&&|\|\|)/.test(
        trimmedContent
      )
    ) {
      return "shell";
    }
    // Python 檢測
    if (
      /(def |import |from .+ import|class .+:|if __name__ == ['"]__main__['"]|print\()/.test(
        trimmedContent
      ) &&
      !/\{|\}|;$/.test(trimmedContent)
    ) {
      return "python";
    }

    // Java 檢測
    if (
      /(public\s+(class|interface)|import\s+java\.|package\s+[\w\.]+;|@Override|class\s+\w+\s+(\{|extends))/.test(
        trimmedContent
      )
    ) {
      return "java";
    }

    // C++ 檢測
    if (
      /(#include\s*<[\w\.]+>|using namespace|std::|int main\(\))/.test(
        trimmedContent
      )
    ) {
      return "cpp";
    }

    // Go 檢測
    if (
      /(package\s+[\w\.]+|func\s+\w+\(|import\s+\(|type\s+\w+\s+struct)/.test(
        trimmedContent
      )
    ) {
      return "go";
    }

    // Rust 檢測
    if (
      /(fn\s+\w+|let\s+mut|impl\s+|use\s+[\w:]+;|\->\s*[\w:<>]+)/.test(
        trimmedContent
      ) &&
      /[\w\s]+\{\s*$/.test(trimmedContent)
    ) {
      return "rust";
    }

    // PHP 檢測
    if (
      /(<\?php|\$\w+\s*=|function\s+\w+\s*\(|namespace\s+[\w\\]+;|use\s+[\w\\]+;)/.test(
        trimmedContent
      )
    ) {
      return "php";
    }

    // Groovy 檢測
    if (
      /(def\s+\w+\s*=|class\s+\w+|import\s+[\w\.]+|@\w+)/.test(
        trimmedContent
      ) &&
      !/<\?php/.test(trimmedContent)
    ) {
      return "groovy";
    }

    // 無法檢測，默認為純文本
    return "plaintext";
  };
  const getFormatLabel = (format: string): string => {
    const option = FORMAT_OPTIONS.find((opt) => opt.value === format);
    return option ? option.label : format.toUpperCase();
  };

  const canBeautify = (content: string, format: string): boolean => {
    if (!content.trim()) return false;

    if (format === "auto") {
      // Try to detect if content can be beautified
      const detectedFormat = detectFormat(content);
      return detectedFormat !== "plaintext";
    }

    return true;
  };

  const addTagToBlock = (blockId: string, tag: string) => {
    if (!tag.trim()) return;

    // 檢查區塊是否存在，以及標籤是否已存在
    const block = memoBlocks.find((block) => block.id === blockId);
    if (!block) return;

    // 如果標籤已存在，則不添加
    if (block.tags.includes(tag)) return;

    // 計算更新後的標籤列表
    const updatedTags = [...block.tags, tag];

    // 更新本地狀態
    setMemoBlocks(
      memoBlocks.map((b) =>
        b.id === blockId ? { ...b, tags: updatedTags } : b
      )
    );

    // 清空新標籤輸入框
    setNewTag("");

    // 使用已計算的標籤列表更新持久化狀態
    updateMemo(blockId, { tags: updatedTags });
  };

  const removeTagFromBlock = (blockId: string, tagToRemove: string) => {
    // 找到要修改的區塊
    const block = memoBlocks.find((block) => block.id === blockId);
    if (!block) return;

    // 計算更新後的標籤
    let updatedTags = block.tags.filter((tag) => tag !== tagToRemove);
    if (updatedTags.length === 0) {
      updatedTags = ["未分類"];
    }

    // 更新本地狀態
    setMemoBlocks(
      memoBlocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, tags: updatedTags };
        }
        return block;
      })
    );

    // 更新持久化狀態，使用已計算的標籤
    updateMemo(blockId, { tags: updatedTags });
  };

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // If search is active, switch to "all" tab to show all searchable content
    if (term) {
      setActiveTab("all");
    }
  };

  // Export data to JSON file
  const exportToJson = () => {
    try {
      // Create a data object with all the memo blocks
      const data = {
        memoBlocks: memoBlocks.map((block) => ({
          id: block.id,
          title: block.title,
          content: block.content,
          tags: block.tags,
          format: block.format,
          showLineNumbers: block.showLineNumbers,
          height: block.height,
        })),
        availableTags,
      };

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(data, null, 2);

      // Create a blob with the JSON data
      const blob = new Blob([jsonString], { type: "application/json" });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = "store.json";

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the URL object
      URL.revokeObjectURL(url);

      toast({
        description: "已將資料匯出至 store.json",
        duration: 2000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: `匯出失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`,
        duration: 2000,
      });
    }
  };

  // Filter blocks based on search and active tab
  const filteredBlocks = useMemo(() => {
    let blocks = memoBlocks;

    // First apply tag filter if not in search mode
    if (!searchTerm && activeTab !== "all") {
      blocks = blocks.filter((block) => block.tags.includes(activeTab));
    }

    // Then apply search filter if search term exists
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      blocks = blocks.filter((block) => {
        // Search in title
        if (searchScope === "title" || searchScope === "all") {
          if (block.title.toLowerCase().includes(term)) {
            return true;
          }
        }

        // Search in content
        if (searchScope === "content" || searchScope === "all") {
          if (block.content.toLowerCase().includes(term)) {
            return true;
          }
        }

        // Search in tags
        if (searchScope === "tags" || searchScope === "all") {
          if (block.tags.some((tag) => tag.toLowerCase().includes(term))) {
            return true;
          }
        }

        return false;
      });
    }

    return blocks;
  }, [memoBlocks, activeTab, searchTerm, searchScope]);
  // 使用 useMemo 從當前的 memoBlocks 中提取所有唯一標籤
  const uniqueTags = useMemo(() => {
    // 收集所有標籤
    const allTags = memoBlocks.flatMap((block) => block.tags);
    // 去重並排序
    return [...new Set(allTags)].sort();
  }, [memoBlocks]);
  return (
    <div className="container mx-auto p-4 max-w-[800px] min-h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Frog MEMO</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={exportToJson}
            title="匯出到 JSON"
          >
            <Download className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">匯出到 JSON</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={handleSearch}
          scope={searchScope}
          onScopeChange={setSearchScope}
          placeholder="搜索備忘錄..."
        />
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="mb-2 flex flex-wrap h-auto">
          <TabsTrigger value="all">全部</TabsTrigger>
          {uniqueTags.map((tag) => (
            <TabsTrigger key={tag} value={tag} disabled={!!searchTerm}>
              {tag}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search Results Summary */}
      {searchTerm && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm">
            搜索結果:{" "}
            <span className="font-semibold">{filteredBlocks.length}</span>{" "}
            個備忘錄
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
            <XCircle className="h-4 w-4 mr-1" />
            清除搜索
          </Button>
        </div>
      )}

      {/* No Results Message */}
      {searchTerm && filteredBlocks.length === 0 && (
        <div className="text-center p-8 border rounded-md bg-gray-50 dark:bg-gray-900">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">未找到結果</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            沒有找到與 "{searchTerm}" 相符的備忘錄。請嘗試其他關鍵詞。
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {filteredBlocks.map((block) => (
          <Card key={block.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Input
                  value={block.title}
                  onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                  className="font-semibold text-base border-0 p-0 h-7 focus-visible:ring-0"
                  placeholder="備忘錄標題"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => deleteBlock(block.id)}
                  disabled={memoBlocks.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {block.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`flex items-center gap-1 ${
                      searchTerm &&
                      searchScope !== "content" &&
                      searchScope !== "title" &&
                      tag.toLowerCase().includes(searchTerm.toLowerCase())
                        ? "bg-yellow-100 dark:bg-yellow-900"
                        : ""
                    }`}
                  >
                    {tag}
                    <button
                      onClick={() => removeTagFromBlock(block.id, tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex items-center">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="新增標籤..."
                    className="h-6 text-xs w-24"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTagToBlock(block.id, newTag);
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => addTagToBlock(block.id, newTag)}
                  >
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="flex flex-wrap items-center gap-2 mt-3 border-t pt-2">
                <Select
                  value={block.format}
                  onValueChange={(value) => updateBlockFormat(block.id, value)}
                >
                  <SelectTrigger className="h-8 w-[130px]">
                    <SelectValue placeholder="選擇格式" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Toggle
                    aria-label="顯示行號"
                    pressed={block.showLineNumbers}
                    onPressedChange={() => toggleLineNumbers(block.id)}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    <ListOrdered className="h-4 w-4 mr-1" />
                    行號
                  </Toggle>

                  {canBeautify(block.content, block.format) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => beautifyCode(block.id)}
                      className="h-8"
                    >
                      <Code className="h-4 w-4 mr-1" />
                      美化
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(block.content)}
                    className="h-8"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    複製
                  </Button>
                </div>

                {block.format === "auto" && block.content.trim() && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    檢測到: {getFormatLabel(detectFormat(block.content))}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="relative">
                <CodeEditor
                  value={block.content}
                  onChange={(value) => updateBlockContent(block.id, value)}
                  language={
                    block.format === "auto"
                      ? detectFormat(block.content)
                      : block.format
                  }
                  placeholder="在此輸入文字..."
                  showLineNumbers={block.showLineNumbers}
                  height={block.height}
                  searchTerm={
                    searchScope !== "tags" && searchScope !== "title"
                      ? searchTerm
                      : ""
                  }
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center"
                  onMouseDown={(e) => {
                    e.preventDefault();

                    const startY = e.clientY;
                    const startHeight = block.height;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaY = moveEvent.clientY - startY;
                      updateBlockHeight(block.id, startHeight + deltaY);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener(
                        "mousemove",
                        handleMouseMove
                      );
                      document.removeEventListener("mouseup", handleMouseUp);
                    };

                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                  }}
                >
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              {/* Footer content if needed */}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={() =>
            addNewBlock(activeTab === "all" ? "未分類" : activeTab)
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          新增區塊
        </Button>
      </div>

      <Toaster />
    </div>
  );
}
