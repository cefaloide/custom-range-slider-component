import type { Metadata } from "next";
import { Navbar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custom Range Slider Component",
  description: "A custom range slider component",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
