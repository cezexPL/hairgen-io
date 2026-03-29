import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "hairgen.io — AI Hairstyle Try-On",
  description:
    "Try new hairstyles with AI. Upload your photo, pick a style from our catalog or describe your own, and see photorealistic results instantly.",
  keywords: ["hairstyle", "AI", "try-on", "hair", "beard", "virtual makeover"],
  openGraph: {
    title: "hairgen.io — AI Hairstyle Try-On",
    description: "See your new look before the salon. AI-powered hairstyle previews.",
    type: "website",
    url: "https://hairgen.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#a855f7" },
      }}
    >
      <html lang="en" className="dark">
        <body className={inter.className}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
