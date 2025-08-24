import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from 'next/headers';
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import ServiceWorkerLayout from "./service-worker-layout"
import { ToastProvider } from "@/components/ui/toast"
import { Auth0Provider } from "@/contexts/auth0-context"
import LocaleManager from "@/components/locale-manager"
import { TranslationProvider } from "@/contexts/translation-context"
import { ChatbotProvider } from "@/components/providers/chatbot-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sky-high - Find your perfect stay",
  description: "Discover amazing places to stay around the world",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get locale from middleware header
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'vi';
  
  console.log('Layout - Received locale from middleware:', locale);
  console.log('Layout - All headers:', Object.fromEntries(headersList.entries()));
  console.log('Layout - Loading messages for locale:', locale);

  // Load messages directly from the locale files with error handling
  let allMessages = {};
  
  try {
    const messages = await import(`../locales/${locale}/common.json`).then(m => m.default);
    const authMessages = await import(`../locales/${locale}/auth.json`).then(m => m.default);
    const navigationMessages = await import(`../locales/${locale}/navigation.json`).then(m => m.default);
    const paymentMessages = await import(`../locales/${locale}/payment.json`).then(m => m.default);
    const dashboardMessages = await import(`../locales/${locale}/dashboard.json`).then(m => m.default);
    const propertyMessages = await import(`../locales/${locale}/property.json`).then(m => m.default);
    const auctionMessages = await import(`../locales/${locale}/auction.json`).then(m => m.default);
    const hostMessages = await import(`../locales/${locale}/host.json`).then(m => m.default);
    const adminMessages = await import(`../locales/${locale}/admin.json`).then(m => m.default);

    allMessages = {
      ...messages,
      auth: authMessages,
      navigation: navigationMessages,
      payment: paymentMessages,
      dashboard: dashboardMessages,
      property: propertyMessages,
      auction: auctionMessages,
      host: hostMessages,
      admin: adminMessages,
    };
    
    console.log(`Loaded messages for locale ${locale}:`, {
      locale,
      hasPropertyMessages: !!propertyMessages,
      propertyKeys: Object.keys(propertyMessages || {}),
      allMessageKeys: Object.keys(allMessages)
    });
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to English if there's an error
    if (locale !== 'en') {
      try {
        const fallbackMessages = await import(`../locales/en/common.json`).then(m => m.default);
        const fallbackAuthMessages = await import(`../locales/en/auth.json`).then(m => m.default);
        const fallbackNavigationMessages = await import(`../locales/en/navigation.json`).then(m => m.default);
        const fallbackPaymentMessages = await import(`../locales/en/payment.json`).then(m => m.default);
        const fallbackDashboardMessages = await import(`../locales/en/dashboard.json`).then(m => m.default);
        const fallbackPropertyMessages = await import(`../locales/en/property.json`).then(m => m.default);
        const fallbackAuctionMessages = await import(`../locales/en/auction.json`).then(m => m.default);
        const fallbackHostMessages = await import(`../locales/en/host.json`).then(m => m.default);
        const fallbackAdminMessages = await import(`../locales/en/admin.json`).then(m => m.default);

        allMessages = {
          ...fallbackMessages,
          auth: fallbackAuthMessages,
          navigation: fallbackNavigationMessages,
          payment: fallbackPaymentMessages,
          dashboard: fallbackDashboardMessages,
          property: fallbackPropertyMessages,
          auction: fallbackAuctionMessages,
          host: fallbackHostMessages,
          admin: fallbackAdminMessages,
        };
      } catch (fallbackError) {
        console.error('Failed to load fallback messages:', fallbackError);
      }
    }
  }

  return (
    <html lang={locale}>
      <ToastProvider />
      <body className={inter.className}>
        <TranslationProvider initialLocale={locale} initialMessages={allMessages}>
          <AuthProvider>
            <Auth0Provider>
              <ChatbotProvider>
                <ServiceWorkerLayout>
                  <LocaleManager />
                  {children}
                </ServiceWorkerLayout>
              </ChatbotProvider>
            </Auth0Provider>
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}
