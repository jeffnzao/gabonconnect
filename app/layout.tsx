import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { I18nProvider } from "@/components/i18n-provider";
import FeedbackBanner from "@/components/feedback-banner";
import { getLocale, getMessages } from "@/lib/i18n";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GabonConnect | The 10th Province of Gabon",
    template: "%s | GabonConnect",
  },
  description:
    "Discover and connect Gabonese professionals, associations, and communities around the world with GabonConnect.",
  applicationName: "GabonConnect",
  keywords: [
    "Gabon",
    "GabonConnect",
    "diaspora",
    "associations",
    "community",
    "networking",
    "profiles",
    "Gabonese",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GabonConnect",
    title: "GabonConnect | The 10th Province of Gabon",
    description:
      "A trusted platform connecting Gabonese people, communities, and organizations across the globe.",
    images: [{ url: "/globe.svg", width: 512, height: 512, alt: "GabonConnect" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GabonConnect | The 10th Province of Gabon",
    description:
      "A trusted platform connecting Gabonese people, communities, and organizations across the globe.",
    images: ["/globe.svg"],
  },
  icons: {
    icon: [{ url: "/globe.svg", type: "image/svg+xml" }],
    shortcut: "/globe.svg",
    apple: "/globe.svg",
  },
};

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
        </I18nProvider>
      </body>
    </html>
  );
}