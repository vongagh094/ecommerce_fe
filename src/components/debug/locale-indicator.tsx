'use client';

import React from 'react';
import { useTranslations } from '@/contexts/translation-context';

export const LocaleIndicator: React.FC = () => {
  const t = useTranslations();
  
  // Get current locale from context or localStorage
  const getCurrentLocale = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferred-locale') || 'vi';
    }
    return 'vi';
  };

  const currentLocale = getCurrentLocale();
  
  return (
    <div className="fixed top-16 right-4 z-40 bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
      <div>Locale: {currentLocale}</div>
      <div>Test: {t ? t('buttons.save') : 'No translation'}</div>
      <div>Language: {t ? t('language.current') : 'No language key'}</div>
    </div>
  );
};