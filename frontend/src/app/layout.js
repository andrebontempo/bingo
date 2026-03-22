import { Syncopate, Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "../providers";
import ThemeToggle from "@/components/ThemeToggle";

const syncopate = Syncopate({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-syncopate",
});

const inter = Inter({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "BINGO | Futuristic Edition V2",
  description: "Full-Stack SPA Bingo Application with Next.js and Socket.IO",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={`${syncopate.variable} ${inter.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          ::placeholder { color: rgba(255,255,255,0.6) !important; opacity: 1 !important; }
        `}} />
      </head>
      <body>
        <ThemeToggle />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
