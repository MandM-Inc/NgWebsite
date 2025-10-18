import type { Metadata } from "next";
import { Space_Grotesk } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ClientErrorHandler from "@/components/ClientErrorHandler";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
 

export const metadata: Metadata = {
  title: "NeuroGeneration - Official Website",
  description: "The official website for the NG teens organization",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
              <ClientErrorHandler />
              <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-none focus:bg-white focus:text-white dark:focus:bg-black dark:focus:text-white focus:shadow-md"
            >
              Skip to content
            </a>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main id="main-content" className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
