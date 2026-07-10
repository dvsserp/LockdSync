import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Activities — plan the perfect hangout",
  description:
    "Discover things to do around NYC. Browse activities, see where they happen, and check the price per person before you commit.",
}

export const viewport: Viewport = {
  themeColor: "#ff5a3c",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  )
}
