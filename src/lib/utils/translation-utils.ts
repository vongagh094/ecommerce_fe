/**
 * Translation utility functions
 * Helper functions for working with translations and formatting
 */

import { useState, useEffect } from 'react';

/**
 * Format currency based on locale
 */
export const formatCurrency = (amount: number, locale?: string) => {
  const currentLocale = locale || 'vi-VN';
  
  if (currentLocale === 'vi' || currentLocale === 'vi-VN') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 25000); // Rough VND to USD conversion for display
};

/**
 * Format date based on locale
 */
export const formatDate = (date: string | Date, locale?: string) => {
  const currentLocale = locale || 'vi-VN';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (currentLocale === 'vi' || currentLocale === 'vi-VN') {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date, locale?: string) => {
  const currentLocale = locale || 'vi-VN';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(currentLocale === 'vi' ? 'vi' : 'en', {
    numeric: 'auto'
  });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
};

/**
 * Get plural form for a given count
 */
export const getPlural = (count: number, singular: string, plural?: string) => {
  if (count === 1) {
    return singular;
  }
  return plural || `${singular}s`;
};

/**
 * Hook to get current locale
 */
export const useCurrentLocale = () => {
  const [locale, setLocale] = useState('vi');
  
  useEffect(() => {
    const currentLocale = localStorage.getItem('preferred-locale') || 'vi';
    setLocale(currentLocale);
    
    const handleStorageChange = () => {
      const newLocale = localStorage.getItem('preferred-locale') || 'vi';
      setLocale(newLocale);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return locale;
};

/**
 * Check if current locale is Vietnamese
 */
export const useIsVietnamese = () => {
  const locale = useCurrentLocale();
  return locale === 'vi';
};

/**
 * Get direction for current locale (for RTL support in future)
 */
export const getTextDirection = (locale: string) => {
  // Vietnamese and English are both LTR
  return 'ltr';
};

/**
 * Format number based on locale
 */
export const formatNumber = (number: number, locale?: string) => {
  const currentLocale = locale || 'vi-VN';
  
  return new Intl.NumberFormat(currentLocale === 'vi' ? 'vi-VN' : 'en-US').format(number);
};

/**
 * Get appropriate font family for locale
 */
export const getFontFamily = (locale: string) => {
  if (locale === 'vi') {
    return 'Inter, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
  }
  return 'Inter, system-ui, -apple-system, sans-serif';
};