import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Providers } from "@/components/providers"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Geeta Art - Handcrafted Wooden Furniture",
  description:
    "Discover handcrafted wooden furniture at Geeta Art. Premium quality sofas, dining tables, chairs, beds, cabinets and more. Made with love in India.",
  keywords: ["wooden furniture", "handcrafted", "sheesham wood", "Indian furniture", "home decor"],
  openGraph: {
    title: "Geeta Art - Handcrafted Wooden Furniture",
    description: "Premium handcrafted wooden furniture made in India.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
