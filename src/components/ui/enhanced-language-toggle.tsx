'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/contexts/translation-context';

export const EnhancedLanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentLocale, setCurrentLocale] = useState('vi');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  // Load current locale from localStorage and context
  useEffect(() => {
    const storedLocale = localStorage.getItem('preferred-locale') || 'vi';
    setCurrentLocale(storedLocale);
    
    // Also check if the context has a different locale
    console.log('Current locale from storage:', storedLocale);
    console.log('Translation function available:', !!t);
  }, [t]);

  const toggleLanguage = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const newLocale = currentLocale === 'en' ? 'vi' : 'en';
    
    console.log('Switching from', currentLocale, 'to', newLocale);
    
    try {
      // Update localStorage first
      localStorage.setItem('preferred-locale', newLocale);
      console.log('Updated localStorage to:', newLocale);
      
      // Set cookie with proper attributes
      const cookieString = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = cookieString;
      console.log('Set cookie:', cookieString);
      
      // Verify cookie was set
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(c => c.trim().startsWith('preferred-locale='));
      console.log('Cookie verification:', localeCookie);
      
      // Store current scroll position
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      }
      
      // Update state immediately
      setCurrentLocale(newLocale);
      
      // Dispatch custom event
      const event = new CustomEvent('localeChange', {
        detail: { locale: newLocale }
      });
      window.dispatchEvent(event);
      console.log('Dispatched localeChange event');
      
      // Force a hard reload with cache busting
      const url = new URL(window.location.href);
      url.searchParams.set('_t', Date.now().toString());
      window.location.href = url.toString();
      
    } catch (error) {
      console.error('Error switching language:', error);
      setIsLoading(false);
    }
  };

  const currentFlag = currentLocale === 'en' ? '🇺🇸' : '🇻🇳';
  const currentText = currentLocale === 'en' ? 'EN' : 'VI';
  const nextLanguage = currentLocale === 'en' ? 'Tiếng Việt' : 'English';

  // Show current language in the button text
  const buttonText = t ? (
    currentLocale === 'en' ? 
      t('language.switch') || 'Switch Language' : 
      t('language.switch') || 'Chuyển ngôn ngữ'
  ) : 'Switch Language';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      disabled={isLoading}
      className={`flex items-center gap-2 ${className}`}
      title={`${buttonText} (${nextLanguage})`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <>
          <span className="text-base">{currentFlag}</span>
          <span className="font-medium">{currentText}</span>
          <span className="text-xs opacity-70">→ {currentLocale === 'en' ? 'VI' : 'EN'}</span>
        </>
      )}
    </Button>
  );
};