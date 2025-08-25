'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Define supported locales
const locales = ['en', 'vi'] as const;

export default function LocaleManager() {
    const router = useRouter();

    useEffect(() => {
        // Get stored locale preference
        const storedLocale = localStorage.getItem('preferred-locale');

        // If no stored preference, set Vietnamese as default
        if (!storedLocale) {
            localStorage.setItem('preferred-locale', 'vi');
            // Set cookie for middleware
            document.cookie = 'preferred-locale=vi; path=/; max-age=31536000'; // 1 year
            // Refresh to apply the new locale
            router.refresh();
            return;
        }

        // Update cookie to match localStorage
        document.cookie = `preferred-locale=${storedLocale}; path=/; max-age=31536000`;
    }, [router]);

    // Listen for locale changes (for language switcher)
    useEffect(() => {
        const handleLocaleChange = (event: CustomEvent) => {
            const newLocale = event.detail.locale;
            localStorage.setItem('preferred-locale', newLocale);
            document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000`;

            // Refresh the page to apply the new locale
            router.refresh();
        };

        window.addEventListener('localeChange', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('localeChange', handleLocaleChange as EventListener);
        };
    }, [router]);

    return null; // This component doesn't render anything
}