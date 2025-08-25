import { useTranslations } from '@/contexts/translation-context';

// Common translations hook
export const useCommonTranslations = () => {
  return useTranslations('common');
};

// Navigation translations hook
export const useNavigationTranslations = () => {
  const t = useTranslations();
  return {
    t: (key: string) => t(key),
    // Add specific methods for common navigation keys
    header: {
      logo: () => t('header.logo'),
      tagline: () => t('header.tagline'),
      switchToHosting: () => t('header.switchToHosting'),
      switchToTravelling: () => t('header.switchToTravelling'),
      adminLogin: () => t('header.adminLogin'),
      adminDashboard: () => t('header.adminDashboard'),
      goToAdmin: () => t('header.goToAdmin'),
    },
    menu: {
      userInformation: () => t('menu.userInformation'),
      notifications: () => t('menu.notifications'),
      wishlists: () => t('menu.wishlists'),
      yourTrips: () => t('menu.yourTrips'),
      messages: () => t('menu.messages'),
      logIn: () => t('menu.logIn'),
      signUp: () => t('menu.signUp'),
      logOut: () => t('menu.logOut'),
    },
    footer: {
      support: {
        title: () => t('footer.support.title'),
        helpCenter: () => t('footer.support.helpCenter'),
        airCover: () => t('footer.support.airCover'),
        antiDiscrimination: () => t('footer.support.antiDiscrimination'),
        disabilitySupport: () => t('footer.support.disabilitySupport'),
        cancellationOptions: () => t('footer.support.cancellationOptions'),
        reportConcern: () => t('footer.support.reportConcern'),
      },
      hosting: {
        title: () => t('footer.hosting.title'),
        airbnbYourHome: () => t('footer.hosting.airbnbYourHome'),
        airCoverForHosts: () => t('footer.hosting.airCoverForHosts'),
        hostingResources: () => t('footer.hosting.hostingResources'),
        communityForum: () => t('footer.hosting.communityForum'),
        hostingResponsibly: () => t('footer.hosting.hostingResponsibly'),
        joinHostingClass: () => t('footer.hosting.joinHostingClass'),
      },
      company: {
        title: () => t('footer.company.title'),
        newsroom: () => t('footer.company.newsroom'),
        newFeatures: () => t('footer.company.newFeatures'),
        careers: () => t('footer.company.careers'),
        investors: () => t('footer.company.investors'),
        giftCards: () => t('footer.company.giftCards'),
        emergencyStays: () => t('footer.company.emergencyStays'),
      },
      copyright: () => t('footer.copyright'),
      language: () => t('footer.language'),
      currency: () => t('footer.currency'),
    }
  };
};

// Authentication translations hook
export const useAuthTranslations = () => {
  return useTranslations('auth');
};

// Payment translations hook
export const usePaymentTranslations = () => {
  return useTranslations('payment');
};

// Property translations hook
export const usePropertyTranslations = () => {
  return useTranslations('property');
};

// Auction translations hook
export const useAuctionTranslations = () => {
  return useTranslations('auction');
};

// Dashboard translations hook
export const useDashboardTranslations = () => {
  return useTranslations('dashboard');
};

// Host translations hook
export const useHostTranslations = () => {
  return useTranslations('host');
};

// Admin translations hook
export const useAdminTranslations = () => {
  return useTranslations('admin');
};

// Utility hook for formatting messages with parameters
export const useFormattedTranslation = () => {
  const t = useTranslations();
  
  return (key: string, params?: Record<string, string | number>) => {
    // Simple parameter replacement for now
    let result = t(key);
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  };
};

// Hook for pluralization
export const usePluralTranslation = () => {
  const t = useTranslations();
  
  return (key: string, count: number, params?: Record<string, string | number>) => {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    let result = t(pluralKey);
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  };
};