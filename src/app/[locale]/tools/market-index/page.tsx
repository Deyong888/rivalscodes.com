import React from 'react'
import { MarketIndex } from '@/components/MarketIndex'
import { getAssets } from '@/lib/data'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getTranslations, getLocale } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketIndex')
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: t('meta_keywords'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      type: 'website',
    },
  }
}

export default async function MarketIndexPage() {
  const locale = await getLocale()
  const t = await getTranslations('marketIndex')
  const assets = getAssets(locale)

  // 结构化数据（JSON-LD）用于SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": t('pageTitle'),
    "description": t('meta_description'),
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Asset value search",
      "Inventory calculator",
      "Price history tracking",
      "Trading assistant",
      "Value comparison"
    ]
  }

  return (
    <div className="container mx-auto py-12">
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t('homeBtn')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('pageTitle')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 space-y-6">
        {/* 页面标题和描述 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            {t('pageTitle')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('pageDescription')}
          </p>
        </div>

        {/* SEO内容区域 */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="space-y-4 text-muted-foreground">
            <h2 className="text-2xl font-semibold text-foreground">{t('seoSection1Title')}</h2>
            <p>{t('seoSection1Content')}</p>
            
            <h2 className="text-2xl font-semibold text-foreground">{t('seoSection2Title')}</h2>
            <p>{t('seoSection2Content')}</p>
            
            <h2 className="text-2xl font-semibold text-foreground">{t('seoSection3Title')}</h2>
            <p>{t('seoSection3Content')}</p>
          </div>
        </div>

        {/* Market Index组件 */}
        <MarketIndex assets={assets} />

        {/* FAQ部分 */}
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">{t('faqTitle')}</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">{t('faq1Question')}</h3>
              <p className="text-sm text-muted-foreground">{t('faq1Answer')}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">{t('faq2Question')}</h3>
              <p className="text-sm text-muted-foreground">{t('faq2Answer')}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">{t('faq3Question')}</h3>
              <p className="text-sm text-muted-foreground">{t('faq3Answer')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

