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
  { value: "xml", label: "XML" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "plaintext", label: "純文本" },
];

export function MemoApp() {
  const [memoBlocks, setMemoBlocks] = useState<MemoBlock[]>([
    {
      id: "1",
      title: "新備忘錄",
      content: "",
      tags: ["未分類"],
      format: "auto",
      showLineNumbers: false,
      height: 200,
    },
  ]);
  const [availableTags, setAvailableTags] = useState<string[]>(["未分類"]);
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScope, setSearchScope] = useState<
    "all" | "content" | "title" | "tags"
  >("all");

  const addNewBlock = () => {
    const newId = Date.now().toString();
    setMemoBlocks([
      ...memoBlocks,
      {
        id: newId,
        title: "新備忘錄",
        content: "",
        tags: ["未分類"],
        format: "auto",
        showLineNumbers: false,
        height: 200,
      },
    ]);
  };

  const updateBlockContent = (id: string, content: string) => {
    setMemoBlocks(
      memoBlocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const updateBlockTitle = (id: string, title: string) => {
    setMemoBlocks(
      memoBlocks.map((block) => (block.id === id ? { ...block, title } : block))
    );
  };

  const updateBlockFormat = (id: string, format: string) => {
    setMemoBlocks(
      memoBlocks.map((block) =>
        block.id === id ? { ...block, format } : block
      )
    );
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
  };

  const deleteBlock = (id: string) => {
    setMemoBlocks(memoBlocks.filter((block) => block.id !== id));
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
    // Try to detect JSON
    try {
      JSON.parse(content);
      return "json";
    } catch (e) {
      // Not JSON
    }

    // Simple YAML detection (starts with key: value pattern)
    if (/^[\w\s]+:[\s\w]/.test(content)) {
      return "yaml";
    }

    // Simple JavaScript detection
    if (/(function|const|let|var|=>)/.test(content)) {
      return "javascript";
    }

    // Simple TypeScript detection
    if (/(interface|type|:[\s]*(string|number|boolean))/.test(content)) {
      return "typescript";
    }

    // Simple HTML detection
    if (/<\/?[a-z][\s\S]*>/i.test(content)) {
      return "html";
    }

    // Simple CSS detection
    if (/{[\s\S]*:[\s\S]*;[\s\S]*}/.test(content)) {
      return "css";
    }

    // Simple SQL detection
    if (
      /(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)[\s\S]*(FROM|INTO|TABLE|DATABASE)/i.test(
        content
      )
    ) {
      return "sql";
    }

    // Default to plain text if can't detect
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

    // Add to available tags if it's new
    if (!availableTags.includes(tag)) {
      setAvailableTags([...availableTags, tag]);
    }

    // Add tag to the block if it doesn't already have it
    setMemoBlocks(
      memoBlocks.map((block) => {
        if (block.id === blockId && !block.tags.includes(tag)) {
          return { ...block, tags: [...block.tags, tag] };
        }
        return block;
      })
    );

    setNewTag("");
  };

  const removeTagFromBlock = (blockId: string, tagToRemove: string) => {
    setMemoBlocks(
      memoBlocks.map((block) => {
        if (block.id === blockId) {
          // Ensure at least one tag remains
          const updatedTags = block.tags.filter((tag) => tag !== tagToRemove);
          if (updatedTags.length === 0) {
            return { ...block, tags: ["未分類"] };
          }
          return { ...block, tags: updatedTags };
        }
        return block;
      })
    );
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

  return (
    <div className="container mx-auto p-4 max-w-[800px] min-h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">frog MEMO</h1>
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
          {availableTags.map((tag) => (
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
        <Button onClick={addNewBlock}>
          <Plus className="h-4 w-4 mr-2" />
          新增區塊
        </Button>
      </div>

      <Toaster />
    </div>
  );
}
