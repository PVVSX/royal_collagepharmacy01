import type { Metadata } from "next";
import { Geist, Kanit } from "next/font/google";
import { Toaster } from "sonner";
import { MockDbProvider } from "@/providers/mock-db-provider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย — Royal Pharmacy College",
    template: "%s — Royal Pharmacy College",
  },
  description:
    "ระบบสารสนเทศสถาบัน ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย สภาเภสัชกรรม",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "27x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "13x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geist.variable} ${kanit.variable} h-full antialiased`}
    >
      <head>
        {/* App Router root layout makes this icon font global. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <MockDbProvider>
          {children}
        </MockDbProvider>
        <Toaster richColors position="bottom-right" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
