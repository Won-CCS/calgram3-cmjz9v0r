import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Calorie Vision",
  description: "Auto-detect meal components and calories from a photo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
