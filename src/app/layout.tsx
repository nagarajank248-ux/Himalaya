import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CRMProvider } from "../context/CRMContext";

// Offline-safe system font fallbacks to bypass sandboxed network constraints
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "Builder CRM - Lead Management",
  description: "Construction builder lead and pipeline management CRM application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950">
        <AuthProvider>
          <CRMProvider>
            {children}
          </CRMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

