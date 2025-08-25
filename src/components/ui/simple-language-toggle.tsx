'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const SimpleLanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentLocale, setCurrentLocale] = useState('vi');
  const [isLoading, setIsLoading] = useState(false);

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
      // Update localStorage first
      localStorage.setItem('preferred-locale', newLocale);
      
      // Set cookie with proper attributes
      document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Store current scroll position
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      }
      
      // Force a hard reload to ensure the middleware picks up the new cookie
      window.location.href = window.location.href;
      
    } catch (error) {
      console.error('Error switching language:', error);
      setIsLoading(false);
    }
  };

  const currentFlag = currentLocale === 'en' ? '🇺🇸' : '🇻🇳';
  const currentText = currentLocale === 'en' ? 'EN' : 'VI';
  const nextLanguage = currentLocale === 'en' ? 'Tiếng Việt' : 'English';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      disabled={isLoading}
      className={`flex items-center gap-2 ${className}`}
      title={`Switch to ${nextLanguage}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <>
          <span className="text-base">{currentFlag}</span>
          <span className="font-medium">{currentText}</span>
        </>
      )}
    </Button>
  );
};