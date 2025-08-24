'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Languages } from 'lucide-react';
import { useTranslations } from '@/contexts/translation-context';

interface LanguageToggleButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  showFlag?: boolean;
  className?: string;
}

const languages = {
  en: { name: 'English', flag: '🇺🇸', shortName: 'EN' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳', shortName: 'VI' }
};

export const LanguageToggleButton: React.FC<LanguageToggleButtonProps> = ({
  variant = 'ghost',
  size = 'default',
  showText = true,
  showFlag = true,
  className = ''
}) => {
  const [currentLocale, setCurrentLocale] = useState('vi');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  // Load current locale from localStorage
  useEffect(() => {
    const storedLocale = localStorage.getItem('preferred-locale') || 'vi';
    setCurrentLocale(storedLocale);
  }, []);

  const toggleLanguage = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const newLocale = currentLocale === 'en' ? 'vi' : 'en';
    
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
      
      // Small delay to show loading state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error switching language:', error);
      setIsLoading(false);
    }
  };

  const currentLanguage = languages[currentLocale as keyof typeof languages];
  const nextLanguage = languages[currentLocale === 'en' ? 'vi' : 'en'];

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLanguage}
      disabled={isLoading}
      className={`flex items-center gap-2 transition-all duration-200 ${className}`}
      title={`${t('language.switch')} (${nextLanguage.name})`}
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
        </>
      )}
    </Button>
  );
};

// Compact version for headers/navbars
export const CompactLanguageToggle: React.FC<{ className?: string }> = ({ className }) => (
  <LanguageToggleButton
    variant="ghost"
    size="sm"
    showText={false}
    showFlag={true}
    className={className}
  />
);

// Text version for menus
export const TextLanguageToggle: React.FC<{ className?: string }> = ({ className }) => (
  <LanguageToggleButton
    variant="ghost"
    size="default"
    showText={true}
    showFlag={false}
    className={className}
  />
);

// Icon only version
export const IconLanguageToggle: React.FC<{ className?: string }> = ({ className }) => (
  <LanguageToggleButton
    variant="ghost"
    size="icon"
    showText={false}
    showFlag={false}
    className={className}
  />
);