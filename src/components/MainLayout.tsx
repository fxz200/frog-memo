import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
