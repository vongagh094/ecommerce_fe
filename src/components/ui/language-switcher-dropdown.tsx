'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslations } from '@/contexts/translation-context';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  shortName: string;
}

const languages: Language[] = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    flag: '🇺🇸', 
    shortName: 'EN' 
  },
  { 
    code: 'vi', 
    name: 'Vietnamese', 
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳', 
    shortName: 'VI' 
  }
];

interface LanguageSwitcherDropdownProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
  showFlag?: boolean;
  className?: string;
  align?: 'left' | 'right';
}

export const LanguageSwitcherDropdown: React.FC<LanguageSwitcherDropdownProps> = ({
  variant = 'ghost',
  size = 'default',
  showText = true,
  showFlag = true,
  className = '',
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('vi');
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  // Load current locale from localStorage
  useEffect(() => {
    const storedLocale = localStorage.getItem('preferred-locale') || 'vi';
    setCurrentLocale(storedLocale);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const switchLanguage = async (newLocale: string) => {
    if (newLocale === currentLocale || isLoading) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Update localStorage and cookie
      localStorage.setItem('preferred-locale', newLocale);
      document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000`;
      
      // Update current locale state
      setCurrentLocale(newLocale);
      
      // Store current scroll position
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      }
      
      // Dispatch custom event for locale change
      const event = new CustomEvent('localeChange', {
        detail: { locale: newLocale }
      });
      window.dispatchEvent(event);
      
      setIsOpen(false);
      
      // Small delay to show loading state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error switching language:', error);
      setIsLoading(false);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[1];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 ${className}`}
        title={t('language.selectLanguage')}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <>
            {showFlag && (
              <span className="text-base">{currentLanguage.flag}</span>
            )}
            {!showFlag && (
              <Globe className="h-4 w-4" />
            )}
            {showText && (
              <span className="font-medium">
                {currentLanguage.shortName}
              </span>
            )}
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}>
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            {t('language.selectLanguage')}
          </div>
          
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              disabled={isLoading}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 ${
                language.code === currentLocale ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{language.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-500">{language.name}</div>
                </div>
              </div>
              
              {language.code === currentLocale && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
          
          <div className="border-t border-gray-100 mt-2 pt-2 px-3">
            <p className="text-xs text-gray-500">
              {currentLocale === 'en' 
                ? 'Language preference is saved automatically'
                : 'Tùy chọn ngôn ngữ được lưu tự động'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};