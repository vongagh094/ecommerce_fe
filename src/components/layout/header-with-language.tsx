'use client';

import React from 'react';
import { SimpleLanguageToggle } from '@/components/ui/simple-language-toggle';
import { LanguageSwitcherDropdown } from '@/components/ui/language-switcher-dropdown';

interface HeaderWithLanguageProps {
  showBoth?: boolean;
  position?: 'fixed' | 'relative';
  className?: string;
}

export const HeaderWithLanguage: React.FC<HeaderWithLanguageProps> = ({
  showBoth = false,
  position = 'fixed',
  className = ''
}) => {
  const positionClasses = position === 'fixed' 
    ? 'fixed top-4 right-4 z-40' 
    : 'relative';

  return (
    <div className={`${positionClasses} flex gap-2 ${className}`}>
      {showBoth ? (
        <>
          <SimpleLanguageToggle />
          <LanguageSwitcherDropdown />
        </>
      ) : (
        <SimpleLanguageToggle />
      )}
    </div>
  );
};

// Preset components for common use cases
export const FixedLanguageToggle: React.FC<{ className?: string }> = ({ className }) => (
  <HeaderWithLanguage position="fixed" className={className} />
);

export const InlineLanguageToggle: React.FC<{ className?: string }> = ({ className }) => (
  <HeaderWithLanguage position="relative" className={className} />
);