import type { Metadata } from "next";
import { Poppins, Nunito_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Navbar from "@/components/Navbar"; // 🔹 import Navbar
import ClientOnly from "@/components/ClientOnly";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${nunitoSans.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased">
        <ClientOnly fallback={
          <div className="min-h-screen bg-white">
            <Navbar />
            <main>{children}</main>
          </div>
        }>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {/* 🔹 Navbar luôn hiển thị trên mọi trang */}
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
