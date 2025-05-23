"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { search, searchKeymap } from "@codemirror/search";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  showLineNumbers?: boolean;
  height?: number;
  searchTerm?: string;
  isDarkMode?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "json",
  placeholder,
  showLineNumbers = false,
  height = 200,
  searchTerm = "",
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // 同步滾動
  const handleScroll = () => {
    if (textareaRef.current) {
      if (highlightRef.current) {
        highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }

      if (lineNumbersRef.current && showLineNumbers) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  };

  const searchHighlighter = (searchTerm: string) => {
    if (!searchTerm) return [];

    return [
      // 使用 EditorView 設置高亮樣式
      EditorView.theme({
        ".cm-highlight": {
          backgroundColor: "rgba(255, 255, 0, 0.3)",
        },
        "&dark .cm-highlight": {
          backgroundColor: "rgba(255, 255, 0, 0.2)",
        },
      }),
      // 使用 EditorView.updateListener 自動高亮匹配
      EditorView.updateListener.of((update) => {
        if (update.docChanged && searchTerm) {
          const view = update.view;
          const doc = view.state.doc.toString();
          const regex = new RegExp(
            searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
            "gi"
          );

          // 查找並高亮所有匹配項
          let match;
          const ranges = [];
          while ((match = regex.exec(doc)) !== null) {
            ranges.push(
              EditorSelection.range(match.index, match.index + match[0].length)
            );
          }

          // 應用高亮
          if (ranges.length > 0) {
            view.dispatch({
              selection: EditorSelection.create(ranges),
              effects: EditorView.scrollIntoView(ranges[0]),
            });
          }
        }
      }),
    ];
  };

  // 響應大小變化
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });

    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const getLanguageExtension = () => {
    switch (language) {
      case "javascript":
      case "js":
        return javascript();
      case "markdown":
      case "md":
        return markdown();
      case "sql":
        return sql();
      case "json":
        return json();
      default:
        return javascript();
    }
  };
  const mappedTheme = theme === "dark" ? oneDark : "light";

  // 在 getLanguageExtension 函數後添加這個新函數
  const getCustomTheme = () => {
    return EditorView.theme({
      // 設置編輯器文本的主色調
      "&": {
        color: theme === "dark" ? "#a31515" : "#333333",
      },
      // 設置註釋的顏色
      // 設置字符串的顏色
      ".cm-string": {
        color: theme === "dark" ? "#a31515" : "#a31515",
      },
      // 設置關鍵字的顏色
      ".cm-keyword": {
        color: "magenta",
        fontWeight: "bold", // 添加粗體以更明顯
      },
      // 設置數字的顏色
      ".cm-number": {
        color: theme === "dark" ? "#a31515" : "#098658",
      },
      // 設置運算符的顏色
      ".cm-operator": {
        color: theme === "dark" ? "#a31515" : "#000000",
      },
      // 設置變量名的顏色
      ".cm-variableName": {
        color: theme === "dark" ? "#a31515" : "#001080",
      },
      // 設置函數名的顏色
      ".cm-propertyName": {
        color: theme === "dark" ? "#a31515" : "#795e26",
      },
    });
  };
  const isDarkMode = theme === "dark";
  const combinedTheme = isDarkMode
    ? [oneDark, getCustomTheme()]
    : [getCustomTheme()];
  return (
    <div
      ref={editorContainerRef}
      className="relative font-mono text-sm border rounded-md flex"
      style={{ height: `${height}px` }}
    >
      <div
        className={`relative flex-grow ${showLineNumbers ? "border-l" : ""}`}
      >
        {/* 可編輯的文本區域 */}
        <CodeMirror
          value={value}
          height={`${height}px`}
          onChange={onChange}
          extensions={[
            getLanguageExtension(),
            getCustomTheme(),
            //  ...searchHighlighter(searchTerm),
          ]}
          // theme={mappedTheme}
          theme={combinedTheme}
          basicSetup={{
            lineNumbers: showLineNumbers,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            syntaxHighlighting: true,
          }}
        />
      </div>
    </div>
  );
}
