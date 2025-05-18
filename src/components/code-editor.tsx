"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  showLineNumbers?: boolean;
  height?: number;
  searchTerm?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder,
  showLineNumbers = false,
  height = 200,
  searchTerm = "",
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [lineCount, setLineCount] = useState<number>(1);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Count lines and apply syntax highlighting
  useEffect(() => {
    // Count lines
    const lines = value ? value.split("\n").length : 1;
    setLineCount(lines);

    let formattedCode = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Apply language-specific highlighting
    switch (language) {
      case "javascript":
      case "typescript":
      case "jsx":
      case "tsx":
        formattedCode = highlightJsTs(formattedCode);
        break;
      case "html":
      case "xml":
        formattedCode = highlightHtml(formattedCode);
        break;
      case "css":
        formattedCode = highlightCss(formattedCode);
        break;
      case "json":
        formattedCode = highlightJson(formattedCode);
        break;
      case "python":
        formattedCode = highlightPython(formattedCode);
        break;
      case "sql":
        formattedCode = highlightSql(formattedCode);
        break;
      case "yaml":
        formattedCode = highlightYaml(formattedCode);
        break;
      // Add more languages as needed
    }

    // Highlight search term if provided
    if (searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, "gi");
      formattedCode = formattedCode.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
      );
    }

    setHighlightedCode(formattedCode);
  }, [value, language, searchTerm]);

  // Generate line numbers
  const renderLineNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= lineCount; i++) {
      numbers.push(
        <div
          key={i}
          className="text-right pr-2 text-gray-500 select-none leading-[1.5]"
        >
          {i}
        </div>
      );
    }
    return numbers;
  };

  // Sync scrolling between textarea, highlighted code, and line numbers
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;

      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  };

  // Update line numbers when text changes or editor is resized
  useEffect(() => {
    // Create a ResizeObserver to detect changes in the editor's size
    const resizeObserver = new ResizeObserver(() => {
      // Force a re-render of line numbers
      setLineCount((prev) => {
        const lines = value ? value.split("\n").length : 1;
        return lines === prev ? prev + 0.1 : lines; // Trick to force re-render
      });

      // Ensure scroll sync after resize
      handleScroll();
    });

    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [value]);

  // Handle tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div
      ref={editorContainerRef}
      className="relative font-mono text-sm border rounded-md flex"
      style={{ height: `${height}px` }}
    >
      {showLineNumbers && (
        <div
          ref={lineNumbersRef}
          className="overflow-hidden bg-gray-100 dark:bg-gray-800 text-xs py-3 w-10 flex-shrink-0 flex flex-col"
          style={{ lineHeight: "1.5" }}
        >
          {renderLineNumbers()}
        </div>
      )}
      <div
        className={`relative flex-grow ${showLineNumbers ? "border-l" : ""}`}
      >
        <pre
          ref={preRef}
          className="absolute top-0 left-0 right-0 bottom-0 p-3 m-0 overflow-auto whitespace-pre-wrap break-words bg-transparent pointer-events-none leading-[1.5]"
          aria-hidden="true"
          style={{ lineHeight: "1.5" }}
        >
          {highlightedCode ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          ) : (
            <div className="text-muted-foreground">{placeholder}</div>
          )}
        </pre>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="absolute top-0 left-0 right-0 bottom-0 w-full h-full p-3 m-0 resize-none overflow-auto text-transparent caret-black dark:caret-white bg-transparent border-none focus:ring-0 focus:outline-none leading-[1.5]"
          placeholder={placeholder}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{ lineHeight: "1.5" }}
        />
      </div>
    </div>
  );
}

// Helper functions for syntax highlighting
function highlightJsTs(code: string): string {
  return (
    code
      // Keywords
      .replace(
        /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g,
        '<span class="text-purple-500">$1</span>'
      )
      // Strings
      .replace(/(['"`])(.*?)\1/g, '<span class="text-green-500">$1$2$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-orange-500">$1</span>')
      // Comments
      .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
      // Function names
      .replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        '<span class="text-blue-500">$1</span>('
      )
  );
}

function highlightHtml(code: string): string {
  return (
    code
      // Tags
      .replace(
        /(&lt;\/?)([a-zA-Z0-9]+)(\s|&gt;)/g,
        '$1<span class="text-red-500">$2</span>$3'
      )
      // Attributes
      .replace(
        /\s([a-zA-Z0-9-]+)=/g,
        ' <span class="text-yellow-500">$1</span>='
      )
      // Attribute values
      .replace(/=(['"])(.*?)\1/g, '=<span class="text-green-500">$1$2$1</span>')
  );
}

function highlightCss(code: string): string {
  return (
    code
      // Selectors
      .replace(/([.#][a-zA-Z0-9_-]+)/g, '<span class="text-red-500">$1</span>')
      // Properties
      .replace(/\b([a-zA-Z-]+):/g, '<span class="text-blue-500">$1</span>:')
      // Values
      .replace(/:\s*([^;]+);/g, ': <span class="text-green-500">$1</span>;')
  );
}

function highlightJson(code: string): string {
  return (
    code
      // Keys
      .replace(/(".*?"):/g, '<span class="text-blue-500">$1</span>:')
      // String values
      .replace(/:\s*(".*?")(,?)/g, ': <span class="text-green-500">$1</span>$2')
      // Numbers
      .replace(/:\s*(\d+)(,?)/g, ': <span class="text-orange-500">$1</span>$2')
      // Boolean and null
      .replace(
        /:\s*(true|false|null)(,?)/g,
        ': <span class="text-purple-500">$1</span>$2'
      )
  );
}

function highlightPython(code: string): string {
  return (
    code
      // Keywords
      .replace(
        /\b(def|class|import|from|as|return|if|elif|else|for|while|try|except|with|in|is|not|and|or|True|False|None)\b/g,
        '<span class="text-purple-500">$1</span>'
      )
      // Strings
      .replace(/(['"])(.*?)\1/g, '<span class="text-green-500">$1$2$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-orange-500">$1</span>')
      // Comments
      .replace(/(#.*)/g, '<span class="text-gray-500">$1</span>')
      // Function names
      .replace(
        /\b(def)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        '<span class="text-purple-500">$1</span> <span class="text-blue-500">$2</span>'
      )
  );
}

function highlightSql(code: string): string {
  return (
    code
      // Keywords
      .replace(
        /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|INTO|VALUES|SET)\b/gi,
        '<span class="text-purple-500">$1</span>'
      )
      // Strings
      .replace(/(['"])(.*?)\1/g, '<span class="text-green-500">$1$2$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-orange-500">$1</span>')
      // Functions
      .replace(
        /\b([A-Z][A-Z0-9_]*)\s*\(/gi,
        '<span class="text-blue-500">$1</span>('
      )
  );
}

function highlightYaml(code: string): string {
  return (
    code
      // Keys
      .replace(/^([a-zA-Z0-9_-]+):/gm, '<span class="text-blue-500">$1</span>:')
      // Values
      .replace(/:\s*(.+)$/gm, ': <span class="text-green-500">$1</span>')
      // Lists
      .replace(
        /^(\s*)-\s+(.+)$/gm,
        '$1- <span class="text-green-500">$2</span>'
      )
      // Comments
      .replace(/(#.*)/g, '<span class="text-gray-500">$1</span>')
  );
}
