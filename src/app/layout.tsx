import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ClientErrorHandler from "@/components/ClientErrorHandler";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <ClientErrorHandler />
              <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-white focus:text-gray-900 dark:focus:bg-gray-900 dark:focus:text-white focus:shadow-md"
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
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}