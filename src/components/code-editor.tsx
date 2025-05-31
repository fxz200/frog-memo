import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { cpp } from "@codemirror/lang-cpp";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { yaml } from "@codemirror/lang-yaml";
import { go } from "@codemirror/lang-go";
import { rust } from "@codemirror/lang-rust";
import { java } from "@codemirror/lang-java";
import { php } from "@codemirror/lang-php";
import { StreamLanguage } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { groovy } from "@codemirror/legacy-modes/mode/groovy";

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
  showLineNumbers = false,
  height = 150,
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
      case "groovy":
        return StreamLanguage.define(groovy);
      case "shell":
        return StreamLanguage.define(shell);
      case "css":
        return css();
      case "cpp":
        return cpp();
      case "python":
        return python();
      case "html":
        return html();
      case "yaml":
        return yaml();
      case "go":
        return go();
      case "rust":
        return rust();
      case "java":
        return java();
      case "php":
        return php();
      case "javascript":
        return javascript();
      case "markdown":
        return markdown();
      case "sql":
        return sql();
      case "json":
        return json();
      default:
        return javascript();
    }
  };

  const getCustomTheme = () => {
    return EditorView.theme({
      // basic
      ".ͼq": {
        color: theme === "dark" ? "#e06c" : "",
      },
      // 關鍵字
      ".ͼl": {
        color: theme === "dark" ? "#569cd6" : "#d73a49",
      },
      // bool
      ".ͼc": {
        color: theme === "dark" ? "#b5cea8" : "#005cc5",
      },
      // 設置註釋的顏色
      ".ͼm": {
        color: theme === "dark" ? "#6a9955" : "#008000",
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
        <CodeMirror
          value={value}
          height={`${height}px`}
          onChange={onChange}
          extensions={[getLanguageExtension(), getCustomTheme()]}
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
