'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/contexts/translation-context';
import { EnhancedLanguageToggle } from '@/components/ui/enhanced-language-toggle';

export default function LanguageTestPage() {
  const [currentLocale, setCurrentLocale] = useState('');
  const [cookieValue, setCookieValue] = useState('');
  const [storageValue, setStorageValue] = useState('');
  const t = useTranslations();

  useEffect(() => {
    const updateValues = () => {
      // Check localStorage
      const stored = localStorage.getItem('preferred-locale') || 'not set';
      setStorageValue(stored);

      // Check cookie
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(c => c.trim().startsWith('preferred-locale='));
      setCookieValue(localeCookie ? localeCookie.split('=')[1] : 'not set');

      // Set current
      setCurrentLocale(stored !== 'not set' ? stored : 'vi');
    };

    updateValues();
    
    // Update every second to see changes
    const interval = setInterval(updateValues, 1000);
    return () => clearInterval(interval);
  }, []);

  const testDirectSwitch = (newLocale: string) => {
    localStorage.setItem('preferred-locale', newLocale);
    document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Force reload
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Language Switching Test</h1>
        
        {/* Current State */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Current Locale:</strong> {currentLocale}
            </div>
            <div>
              <strong>Storage Value:</strong> {storageValue}
            </div>
            <div>
              <strong>Cookie Value:</strong> {cookieValue}
            </div>
            <div>
              <strong>Translation Available:</strong> {t ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Translation Tests */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Translation Tests</h2>
          <div className="space-y-2">
            <div><strong>buttons.save:</strong> {t ? t('buttons.save') : 'Not available'}</div>
            <div><strong>language.switch:</strong> {t ? t('language.switch') : 'Not available'}</div>
            <div><strong>language.english:</strong> {t ? t('language.english') : 'Not available'}</div>
            <div><strong>language.vietnamese:</strong> {t ? t('language.vietnamese') : 'Not available'}</div>
          </div>
        </div>

        {/* Language Switchers */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Language Switchers</h2>
          <div className="flex gap-4 mb-4">
            <EnhancedLanguageToggle />
          </div>
          
          <div className="flex gap-4">
            <Button onClick={() => testDirectSwitch('en')} variant="outline">
              Force Switch to English
            </Button>
            <Button onClick={() => testDirectSwitch('vi')} variant="outline">
              Force Switch to Vietnamese
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="text-sm space-y-1">
            <div><strong>User Agent:</strong> {navigator.userAgent}</div>
            <div><strong>Current URL:</strong> {window.location.href}</div>
            <div><strong>Document Cookie:</strong> {document.cookie || 'No cookies'}</div>
            <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}