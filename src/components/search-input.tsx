"use client"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  scope: "all" | "content" | "title" | "tags"
  onScopeChange: (scope: "all" | "content" | "title" | "tags") => void
  placeholder?: string
}

export function SearchInput({ value, onChange, scope, onScopeChange, placeholder = "搜索..." }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-10 h-10"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Select value={scope} onValueChange={(value) => onScopeChange(value as any)}>
        <SelectTrigger className="w-[120px] ml-2 h-10">
          <SelectValue placeholder="搜索範圍" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="content">內容</SelectItem>
          <SelectItem value="title">標題</SelectItem>
          <SelectItem value="tags">標籤</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
