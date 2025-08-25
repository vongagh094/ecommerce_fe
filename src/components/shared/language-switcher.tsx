"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

// Define supported locales
const locales = ['en', 'vi'] as const

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
]

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('vi')
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  
  // Debug logging
  console.log('LanguageSwitcher rendered with currentLocale:', currentLocale)

  // Load current locale from localStorage
  useEffect(() => {
    const storedLocale = localStorage.getItem('preferred-locale') || 'vi'
    setCurrentLocale(storedLocale)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) {
      setIsOpen(false)
      return
    }

    console.log('Switching language from', currentLocale, 'to', newLocale)

    // Update localStorage and cookie
    localStorage.setItem('preferred-locale', newLocale)
    
    // Set cookie with proper attributes - make sure it's properly formatted
    document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    
    console.log('Updated localStorage and cookie:', {
      localStorage: localStorage.getItem('preferred-locale'),
      cookie: document.cookie
    })
    
    // Verify cookie was set
    const cookies = document.cookie.split(';').map(c => c.trim())
    const localeCookie = cookies.find(c => c.startsWith('preferred-locale='))
    console.log('Cookie verification:', {
      allCookies: cookies,
      localeCookie: localeCookie,
      expectedValue: `preferred-locale=${newLocale}`
    })
    
    // Update current locale state
    setCurrentLocale(newLocale)
    
    // Store current scroll position
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString())
    }
    
    // Dispatch custom event for locale change
    const event = new CustomEvent('localeChange', {
      detail: { locale: newLocale }
    })
    window.dispatchEvent(event)
    
    // Small delay to ensure cookie is set, then reload
    setTimeout(() => {
      console.log('Reloading page with new locale:', newLocale)
      // Force a hard navigation to the current URL to ensure the new cookie is picked up by middleware
      window.location.href = window.location.href.split('?')[0] + '?locale=' + newLocale + '&t=' + Date.now()
    }, 100)
    
    setIsOpen(false)
  }

  // Restore scroll position after language change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scrollPosition = sessionStorage.getItem('scrollPosition')
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition))
        sessionStorage.removeItem('scrollPosition')
      }
    }
  }, [currentLocale])

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.name}</span>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] py-2">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            Select Language
          </div>
          
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                language.code === currentLocale ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              
              {language.code === currentLocale && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
          
          <div className="border-t border-gray-100 mt-2 pt-2 px-3">
            <p className="text-xs text-gray-500">
              Language preference is saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  )
}