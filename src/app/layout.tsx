import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo/metadata";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { WalletProvidersWrapper } from "@/components/wallet/WalletProvidersWrapper";
import { ReferralCapture } from "@/components/referral/ReferralCapture";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, softwareApplicationSchema } from "@/components/seo/schemas";

// Bold, rounded geometric sans — closest freely-licensed match to Phantom's brand type.
const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  keywords: [...siteConfig.keywords],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationSchema(), softwareApplicationSchema()]} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WalletProvidersWrapper>
            <ReferralCapture />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="bottom-right" />
          </WalletProvidersWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
