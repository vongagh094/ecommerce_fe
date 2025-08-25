# Internationalization (i18n) Implementation Guide

## Overview

This project now supports full internationalization with English and Vietnamese languages. The implementation uses `next-intl` for a robust, type-safe translation system.

## Features

- ✅ **Complete Translation Coverage**: All UI text, labels, buttons, and messages
- ✅ **Language Switcher**: Easy switching between English and Vietnamese
- ✅ **URL-based Localization**: `/en/` and `/vi/` URL prefixes
- ✅ **Type-safe Translations**: Full TypeScript support
- ✅ **Automatic Locale Detection**: Based on browser preferences
- ✅ **SEO Friendly**: Proper locale handling for search engines
- ✅ **Maintainable Structure**: Organized translation files by feature

## File Structure

```
src/
├── locales/
│   ├── en/
│   │   ├── common.json      # Common UI elements
│   │   ├── navigation.json  # Header, footer, menus
│   │   ├── auth.json        # Authentication flows
│   │   ├── payment.json     # Payment processes
│   │   ├── property.json    # Property listings
│   │   ├── auction.json     # Auction features
│   │   ├── dashboard.json   # User dashboard
│   │   ├── host.json        # Host features
│   │   └── admin.json       # Admin panel
│   └── vi/
│       └── [same structure as en/]
├── hooks/
│   └── use-translations.ts  # Translation hooks
├── components/
│   └── shared/
│       └── language-switcher.tsx
├── lib/
│   └── utils/
│       └── translation-utils.ts
├── i18n.ts                  # i18n configuration
└── middleware.ts            # Locale routing
```

## Usage Examples

### Basic Translation

```tsx
import { useCommonTranslations } from '@/hooks/use-translations';

function MyComponent() {
  const t = useCommonTranslations();
  
  return (
    <button>{t('buttons.save')}</button>
  );
}
```

### Translations with Parameters

```tsx
import { useFormattedTranslation } from '@/hooks/use-translations';

function WelcomeMessage({ userName }: { userName: string }) {
  const t = useFormattedTranslation();
  
  return (
    <h1>{t('welcome.message', { name: userName })}</h1>
  );
}
```

### Feature-specific Translations

```tsx
import { usePaymentTranslations } from '@/hooks/use-translations';

function PaymentButton() {
  const t = usePaymentTranslations();
  
  return (
    <button>{t('buttons.payWithZaloPay')}</button>
  );
}
```

## Translation Keys Structure

### Common Keys (`common.json`)
- `buttons.*` - All button labels
- `status.*` - Status messages
- `validation.*` - Form validation messages
- `messages.*` - General user messages

### Navigation Keys (`navigation.json`)
- `header.*` - Header elements
- `menu.*` - User menu items
- `footer.*` - Footer sections and links

### Feature-specific Keys
Each feature has its own namespace to avoid conflicts and improve maintainability.

## Adding New Translations

### 1. Add to Translation Files

**English** (`src/locales/en/[category].json`):
```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}
```

**Vietnamese** (`src/locales/vi/[category].json`):
```json
{
  "newFeature": {
    "title": "Tính năng mới",
    "description": "Đây là một tính năng mới"
  }
}
```

### 2. Use in Components

```tsx
import { useTranslations } from 'next-intl';

function NewFeatureComponent() {
  const t = useTranslations('category');
  
  return (
    <div>
      <h2>{t('newFeature.title')}</h2>
      <p>{t('newFeature.description')}</p>
    </div>
  );
}
```

## Language Switcher

The language switcher is available in the header and allows users to switch between languages seamlessly:

- Maintains current page context
- Preserves scroll position
- Updates URL with locale prefix
- Saves preference automatically

## URL Structure

- English: `https://yoursite.com/en/dashboard`
- Vietnamese: `https://yoursite.com/vi/dashboard`

## Best Practices

### 1. Translation Key Naming
- Use descriptive, hierarchical keys
- Group related translations
- Use camelCase for consistency

```json
{
  "payment": {
    "buttons": {
      "payNow": "Pay Now",
      "cancelPayment": "Cancel Payment"
    },
    "status": {
      "pending": "Payment Pending",
      "completed": "Payment Completed"
    }
  }
}
```

### 2. Handling Pluralization

```tsx
// For simple pluralization
const t = useTranslations();
const nights = 3;
const message = t('booking.nights', { count: nights });

// In translation file:
{
  "booking": {
    "nights": "{count, plural, =1 {# night} other {# nights}}"
  }
}
```

### 3. Date and Currency Formatting

```tsx
import { formatCurrency, formatDate } from '@/lib/utils/translation-utils';

function PriceDisplay({ amount, date }: { amount: number, date: string }) {
  const locale = useLocale();
  
  return (
    <div>
      <span>{formatCurrency(amount, locale)}</span>
      <span>{formatDate(date, locale)}</span>
    </div>
  );
}
```

## Migration Status

### ✅ Completed Components
- App Header with Language Switcher
- User Menu
- Footer
- Home Page
- Payment Components (partial)

### 🔄 In Progress
- Dashboard Pages
- Property Details
- Auction Components
- Host Dashboard
- Admin Panel

### 📋 TODO
- Search Components
- Booking Flow
- Review System
- Messaging Interface

## Testing Translations

### 1. Manual Testing
- Switch languages using the language switcher
- Verify all text is translated
- Check formatting (dates, currency)
- Test URL routing

### 2. Automated Testing
```tsx
// Example test
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

test('renders translated content', () => {
  const messages = {
    common: {
      buttons: {
        save: 'Save'
      }
    }
  };
  
  render(
    <NextIntlClientProvider messages={messages} locale="en">
      <MyComponent />
    </NextIntlClientProvider>
  );
  
  expect(screen.getByText('Save')).toBeInTheDocument();
});
```

## Performance Considerations

- Translation files are loaded on-demand
- Messages are cached after first load
- Minimal bundle size impact
- Server-side rendering support

## Future Enhancements

1. **Additional Languages**: Easy to add more locales
2. **RTL Support**: Framework ready for right-to-left languages
3. **Translation Management**: Integration with translation services
4. **A/B Testing**: Different translations for testing
5. **Dynamic Loading**: Load translations based on user preferences

## Troubleshooting

### Common Issues

1. **Missing Translation Key**
   - Check if key exists in both language files
   - Verify correct namespace usage

2. **Locale Not Switching**
   - Check middleware configuration
   - Verify URL structure

3. **Formatting Issues**
   - Use translation utility functions
   - Check locale-specific formatting

### Debug Mode

Enable debug mode to see missing translations:

```tsx
// In development
const messages = await getMessages();
console.log('Available translations:', Object.keys(messages));
```

## Contributing

When adding new features:

1. Add translations to both `en/` and `vi/` files
2. Use appropriate translation hooks
3. Test with both languages
4. Update this documentation if needed

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [Vietnamese Translation Guidelines](https://vi.wikipedia.org/wiki/Tiếng_Việt)