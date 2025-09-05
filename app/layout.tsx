import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import AdminStatusRefresher from "@/components/AdminStatusRefresher";
import AdminStatusDebug from "@/components/AdminStatusDebug";
import AdminTestPanel from "@/components/AdminTestPanel";
import DebugPanelToggle from "@/components/DebugPanelToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UK Travel Agency Directory - Luxury Travel Services",
  description: "Discover and connect with the world's most prestigious travel agencies across the United Kingdom. Experience luxury travel planning with trusted partners.",
  keywords: "luxury travel, UK travel agencies, premium travel services, exclusive travel experiences",
  authors: [{ name: "SLC Travel Marketing" }],
  openGraph: {
    title: "UK Travel Agency Directory - Luxury Travel Services",
    description: "Discover and connect with the world's most prestigious travel agencies across the United Kingdom.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AdminStatusRefresher />
            <DebugPanelToggle />
            <AdminStatusDebug />
            <AdminTestPanel />
            <Navbar />
            <main className="pt-20">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
