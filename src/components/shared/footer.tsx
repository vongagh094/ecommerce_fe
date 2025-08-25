"use client"

import { useTranslations } from "@/contexts/translation-context"
import { LanguageSwitcher } from "./language-switcher"

export function Footer() {
  const t = useTranslations()
  
  const footerSections = [
    {
      title: t('navigation.footer.support.title'),
      links: [
        { key: 'helpCenter', text: t('navigation.footer.support.helpCenter') },
        { key: 'airCover', text: t('navigation.footer.support.airCover') },
        { key: 'antiDiscrimination', text: t('navigation.footer.support.antiDiscrimination') },
        { key: 'disabilitySupport', text: t('navigation.footer.support.disabilitySupport') },
        { key: 'cancellationOptions', text: t('navigation.footer.support.cancellationOptions') },
        { key: 'reportConcern', text: t('navigation.footer.support.reportConcern') },
      ],
    },
    {
      title: t('navigation.footer.hosting.title'),
      links: [
        { key: 'airbnbYourHome', text: t('navigation.footer.hosting.airbnbYourHome') },
        { key: 'airCoverForHosts', text: t('navigation.footer.hosting.airCoverForHosts') },
        { key: 'hostingResources', text: t('navigation.footer.hosting.hostingResources') },
        { key: 'communityForum', text: t('navigation.footer.hosting.communityForum') },
        { key: 'hostingResponsibly', text: t('navigation.footer.hosting.hostingResponsibly') },
        { key: 'joinHostingClass', text: t('navigation.footer.hosting.joinHostingClass') },
      ],
    },
    {
      title: t('navigation.footer.company.title'),
      links: [
        { key: 'newsroom', text: t('navigation.footer.company.newsroom') },
        { key: 'newFeatures', text: t('navigation.footer.company.newFeatures') },
        { key: 'careers', text: t('navigation.footer.company.careers') },
        { key: 'investors', text: t('navigation.footer.company.investors') },
        { key: 'giftCards', text: t('navigation.footer.company.giftCards') },
        { key: 'emergencyStays', text: t('navigation.footer.company.emergencyStays') },
      ],
    },
  ]
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.key}>
                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">{t('navigation.footer.copyright')}</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-600">{t('navigation.footer.language')}</span>
              <span className="text-sm text-gray-600">{t('navigation.footer.currency')}</span>
            </div>
          </div>
        </div>
        
        {/* Language Switcher Section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('navigation.footer.language')}</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
