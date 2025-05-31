/**
 * 自動檢測代碼內容的格式/語言
 * @param content 要檢測格式的代碼內容
 * @returns 檢測到的格式名稱
 */
export const detectFormat = (content: string): string => {
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
    /(def\s+\w+\s*=|class\s+\w+|import\s+[\w\.]+|@\w+)/.test(trimmedContent) &&
    !/<\?php/.test(trimmedContent)
  ) {
    return "groovy";
  }

  // 無法檢測，默認為純文本
  return "plaintext";
};

/**
 * 檢查內容是否可以美化
 * @param content 代碼內容
 * @param format 格式
 * @returns 是否可以美化
 */
export const canBeautify = (content: string, format: string): boolean => {
  if (!content.trim()) return false;

  if (format === "auto") {
    // 嘗試檢測內容是否可以美化
    const detectedFormat = detectFormat(content);
    return detectedFormat !== "plaintext";
  }

  return true;
};
