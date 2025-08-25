'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const LanguageDebug: React.FC = () => {
  const [currentLocale, setCurrentLocale] = useState('');
  const [cookieValue, setCookieValue] = useState('');
  const [storageValue, setStorageValue] = useState('');

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem('preferred-locale') || 'not set';
    setStorageValue(stored);

    // Check cookie
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(c => c.trim().startsWith('preferred-locale='));
    setCookieValue(localeCookie ? localeCookie.split('=')[1] : 'not set');

    // Set current
    setCurrentLocale(stored !== 'not set' ? stored : 'vi');
  }, []);

  const testToggle = () => {
    const newLocale = currentLocale === 'en' ? 'vi' : 'en';
    localStorage.setItem('preferred-locale', newLocale);
    document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000`;
    
    // Dispatch event
    const event = new CustomEvent('localeChange', {
      detail: { locale: newLocale }
    });
    window.dispatchEvent(event);
    
    console.log('Language switched to:', newLocale);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white p-4 border rounded-lg shadow-lg text-sm">
      <h3 className="font-bold mb-2">Language Debug</h3>
      <div className="space-y-1">
        <div>Current: {currentLocale}</div>
        <div>Storage: {storageValue}</div>
        <div>Cookie: {cookieValue}</div>
      </div>
      <Button onClick={testToggle} size="sm" className="mt-2">
        Test Toggle ({currentLocale === 'en' ? 'VI' : 'EN'})
      </Button>
    </div>
  );
};