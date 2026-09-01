import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { I18nProvider } from "@/components/i18n-provider";
import FeedbackBanner from "@/components/feedback-banner";
import AssistantChat from "@/components/ai/assistant-chat";
import { getLocale, getMessages } from "@/lib/i18n";
import OfflineBanner from "@/components/offline-banner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const seoLocale = locale === "fr" ? "fr_FR" : "en_US";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: messages.seo.title, template: `%s | GabonConnect` },
    description: messages.seo.description,
    applicationName: "GabonConnect",
    keywords: ["Gabon", "GabonConnect", "diaspora", "associations", "community", "networking", "profiles", "Gabonese"],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: seoLocale,
      url: siteUrl,
      siteName: "GabonConnect",
      title: messages.seo.title,
      description: messages.seo.ogDescription,
      images: [{ url: "/globe.svg", width: 512, height: 512, alt: "GabonConnect" }],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.seo.title,
      description: messages.seo.ogDescription,
      images: ["/globe.svg"],
    },
    icons: { icon: [{ url: "/globe.svg", type: "image/svg+xml" }], shortcut: "/globe.svg", apple: "/globe.svg" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} messages={getMessages(locale)}>
          <Header locale={locale} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer locale={locale} />
          <FeedbackBanner locale={locale} />
          <AssistantChat locale={locale} />
          <OfflineBanner labels={getMessages(locale).offline} />
        </I18nProvider>
      </body>
    </html>
  );
}