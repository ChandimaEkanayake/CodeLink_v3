import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { DebugPanel } from "@/components/debug-panel"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CodeLink",
  description: "A tool for exploring code versions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
            <DebugPanel />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'