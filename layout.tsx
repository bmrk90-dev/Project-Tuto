import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Micro Tutorials", description: "Learn something useful in under 90 seconds." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="no"><body className="min-h-screen antialiased">{children}</body></html>);
}
