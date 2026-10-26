import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custom Range Slider Component",
  description: "A custom range slider component",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
