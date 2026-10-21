import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Prueba técnica Mango",
  description: "Prueba técnica para el puesto de desarrollador en Mango",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
    >
      <body>{children}</body>
    </html>
  );
}
