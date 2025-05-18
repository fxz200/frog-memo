import jsBeautify from "js-beautify";

/**
 * Format code based on the specified language
 */
export async function formatCode(
  code: string,
  language: string
): Promise<string> {
  // Return original if empty
  if (!code.trim()) {
    return code;
  }

  try {
    switch (language) {
      case "json":
        return formatJson(code);
      case "yaml":
        return formatYaml(code);
      case "javascript":
        return formatJavaScript(code);
      case "typescript":
        return formatTypeScript(code);
      case "html":
        return formatHtml(code);
      case "css":
        return formatCss(code);
      case "sql":
        return formatSql(code);
      case "xml":
        return formatXml(code);
      case "markdown":
        return formatMarkdown(code);
      case "python":
        return formatPython(code);
      default:
        // If we can't determine the format, return the original
        return code;
    }
  } catch (error) {
    console.error("Error formatting code:", error);
    throw new Error(`無法格式化此${language}代碼`);
  }
}

function formatJson(code: string): string {
  try {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error("無效的 JSON 格式");
  }
}

function formatYaml(code: string): string {
  // Basic YAML formatting - indentation and spacing
  // For a real app, you'd use a proper YAML library
  const lines = code.split("\n");
  let formatted = "";
  let currentIndent = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      formatted += "\n";
      continue;
    }

    // Check if line ends with a colon (new section)
    if (trimmedLine.endsWith(":")) {
      formatted += " ".repeat(currentIndent) + trimmedLine + "\n";
      currentIndent += 2;
    }
    // Check if line is a list item
    else if (trimmedLine.startsWith("-")) {
      formatted += " ".repeat(currentIndent) + trimmedLine + "\n";
    }
    // Regular key-value pair
    else {
      formatted += " ".repeat(currentIndent) + trimmedLine + "\n";
    }
  }

  return formatted;
}

function formatJavaScript(code: string): string {
  return jsBeautify.js(code, {
    indent_size: 2,
    space_in_empty_paren: true,
  });
}

function formatTypeScript(code: string): string {
  // TypeScript formatting is similar to JavaScript
  return formatJavaScript(code);
}

function formatHtml(code: string): string {
  return jsBeautify.html(code, {
    indent_size: 2,
    wrap_line_length: 80,
    unformatted: ["code", "pre"],
  });
}

function formatCss(code: string): string {
  return jsBeautify.css(code, {
    indent_size: 2,
  });
}

function formatSql(code: string): string {
  // Basic SQL formatting
  // For a real app, you'd use a proper SQL formatter library
  const formatted = "";
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "ORDER BY",
    "HAVING",
    "JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "LIMIT",
    "OFFSET",
    "INSERT INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE FROM",
    "CREATE TABLE",
    "ALTER TABLE",
    "DROP TABLE",
  ];

  // Convert to uppercase for keywords
  let formattedCode = code;
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    formattedCode = formattedCode.replace(regex, keyword);
  });

  // Add newlines after keywords
  keywords.forEach((keyword) => {
    formattedCode = formattedCode.replace(
      new RegExp(`${keyword}`, "g"),
      `\n${keyword}\n  `
    );
  });

  // Clean up multiple newlines
  formattedCode = formattedCode.replace(/\n\s*\n/g, "\n");

  return formattedCode.trim();
}

function formatXml(code: string): string {
  return jsBeautify.html(code, {
    indent_size: 2,
    wrap_line_length: 80,
  });
}

function formatMarkdown(code: string): string {
  // Basic markdown formatting
  // Add a space after # for headers
  let formatted = code.replace(/^(#+)([^\s#])/gm, "$1 $2");

  // Ensure blank line before headers
  formatted = formatted.replace(/^(?!#|$)(.+)\n(#+)/gm, "$1\n\n$2");

  // Ensure blank line before lists
  formatted = formatted.replace(
    /^(?!-|\d+\.|$)(.+)\n([-*]|\d+\.)/gm,
    "$1\n\n$2"
  );

  return formatted;
}

function formatPython(code: string): string {
  // Basic Python formatting
  // For a real app, you'd use a proper Python formatter
  const lines = code.split("\n");
  let formatted = "";
  let indentLevel = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      formatted += "\n";
      continue;
    }

    // Check for indentation decrease
    if (
      trimmedLine.startsWith("}") ||
      trimmedLine.startsWith(")") ||
      trimmedLine.startsWith("]") ||
      trimmedLine === "else:" ||
      trimmedLine === "elif:" ||
      trimmedLine === "except:" ||
      trimmedLine === "finally:"
    ) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add the line with proper indentation
    formatted += " ".repeat(indentLevel * 4) + trimmedLine + "\n";

    // Check for indentation increase
    if (
      trimmedLine.endsWith(":") ||
      trimmedLine.endsWith("{") ||
      trimmedLine.endsWith("(") ||
      trimmedLine.endsWith("[")
    ) {
      indentLevel += 1;
    }
  }

  return formatted;
}
