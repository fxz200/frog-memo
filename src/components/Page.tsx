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
import { v4 as uuidv4 } from "uuid";
import { detectFormat, canBeautify } from "@/lib/detectFormat";
import { FORMAT_OPTIONS } from "@/constants/formats";

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
export function MemoApp({ initialMemos, onMemosUpdate }: MemoAppProps) {
  const [memoBlocks, setMemoBlocks] = useState<MemoBlock[]>(initialMemos);
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScope, setSearchScope] = useState<
    "all" | "content" | "title" | "tags"
  >("all");

  const updateMemos = (newMemos: MemoBlock[]) => {
    setMemoBlocks(newMemos);
    onMemosUpdate(newMemos);
  };

  const updateMemo = (id: string, updates: Partial<MemoBlock>) => {
    const updatedMemos = memoBlocks.map((memo) =>
      memo.id === id ? { ...memo, ...updates } : memo
    );
    updateMemos(updatedMemos);
  };

  const addNewBlock = (tag: string) => {
    const newId = uuidv4();
    const newBlock = {
      id: newId,
      title: "新備忘錄",
      content: "",
      tags: [tag],
      format: "auto",
      showLineNumbers: false,
      height: 200,
    };
    updateMemos([...memoBlocks, newBlock]);
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

  const getFormatLabel = (format: string): string => {
    const option = FORMAT_OPTIONS.find((opt) => opt.value === format);
    return option ? option.label : format.toUpperCase();
  };

  const addTagToBlock = (blockId: string, tag: string) => {
    if (!tag.trim()) return;
    const block = memoBlocks.find((block) => block.id === blockId);
    if (!block) return;
    if (block.tags.includes(tag)) return;
    const updatedTags = [...block.tags, tag];
    setMemoBlocks(
      memoBlocks.map((b) =>
        b.id === blockId ? { ...b, tags: updatedTags } : b
      )
    );
    setNewTag("");
    updateMemo(blockId, { tags: updatedTags });
  };

  const removeTagFromBlock = (blockId: string, tagToRemove: string) => {
    const block = memoBlocks.find((block) => block.id === blockId);
    if (!block) return;
    let updatedTags = block.tags.filter((tag) => tag !== tagToRemove);
    if (updatedTags.length === 0) {
      updatedTags = ["未分類"];
    }
    setMemoBlocks(
      memoBlocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, tags: updatedTags };
        }
        return block;
      })
    );
    updateMemo(blockId, { tags: updatedTags });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      setActiveTab("all");
    }
  };

  const exportToJson = () => {
    try {
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
        uniqueTags,
      };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "store.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  const filteredBlocks = useMemo(() => {
    let blocks = memoBlocks;
    if (!searchTerm && activeTab !== "all") {
      blocks = blocks.filter((block) => block.tags.includes(activeTab));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      blocks = blocks.filter((block) => {
        if (searchScope === "title" || searchScope === "all") {
          if (block.title.toLowerCase().includes(term)) {
            return true;
          }
        }
        if (searchScope === "content" || searchScope === "all") {
          if (block.content.toLowerCase().includes(term)) {
            return true;
          }
        }
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
  const uniqueTags = useMemo(() => {
    const allTags = memoBlocks.flatMap((block) => block.tags);
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
