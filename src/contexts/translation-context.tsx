"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface TranslationContextType {
  locale: string
  messages: Record<string, any>
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: React.ReactNode
  initialLocale: string
  initialMessages: Record<string, any>
}

export function TranslationProvider({ children, initialLocale, initialMessages }: TranslationProviderProps) {
  console.log('TranslationProvider initialized with:', {
    initialLocale,
    hasInitialMessages: !!initialMessages,
    messageKeys: Object.keys(initialMessages || {}),
    hasPropertyMessages: !!(initialMessages as any)?.property,
    propertyKeys: Object.keys((initialMessages as any)?.property || {})
  });
  
  const [locale, setLocale] = useState(initialLocale)
  const [messages, setMessages] = useState(initialMessages)

  // Update locale and messages when localStorage changes
  useEffect(() => {
    const loadMessagesForLocale = async (newLocale: string) => {
      try {
        const allMessages: Record<string, any> = {}
        const messageFiles = [
          'common', 'auth', 'navigation', 'payment', 
          'dashboard', 'property', 'auction', 'host', 'admin'
        ]

        for (const file of messageFiles) {
          try {
            const moduleMessages = await import(`../locales/${newLocale}/${file}.json`)
            if (file === 'common') {
              Object.assign(allMessages, moduleMessages.default)
            } else {
              allMessages[file] = moduleMessages.default
            }
          } catch (error) {
            console.warn(`Failed to load ${file}.json for locale ${newLocale}`)
          }
        }

        setMessages(allMessages)
      } catch (error) {
        console.error('Failed to load messages for locale:', newLocale)
      }
    }

    // Listen for locale changes from localStorage
    const handleStorageChange = () => {
      const newLocale = localStorage.getItem('preferred-locale') || 'vi'
      if (newLocale !== locale) {
        setLocale(newLocale)
        loadMessagesForLocale(newLocale)
      }
    }

    // Listen for custom locale change events
    const handleLocaleChange = (event: CustomEvent) => {
      console.log('TranslationContext: Received localeChange event:', event.detail)
      const newLocale = event.detail.locale
      setLocale(newLocale)
      loadMessagesForLocale(newLocale)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localeChange', handleLocaleChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localeChange', handleLocaleChange as EventListener)
    }
  }, [locale])

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return (
    <TranslationContext.Provider value={{ locale, messages, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslations(namespace?: string) {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider')
  }

  if (namespace) {
    return (key: string) => context.t(`${namespace}.${key}`)
  }

  return context.t
} 