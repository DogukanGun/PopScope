import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "./components/common/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PopScope - Population Trends Dashboard",
  description: "Interactive dashboard to visualize and analyze population trends across different countries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
