// pages/index.js
import React, { Suspense } from 'react'; // 确保导入 React
import { getSortedPostsData } from '@/lib/posts'
import { getCategories } from '@/lib/data';

import { ToolsList } from '@/components/ToolsList';
import { ArticleList } from '@/components/ArticleList'

import { Search } from '@/components/Search';
import {getTranslations, getLocale} from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('home');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}


type categoryType = { 
  name: string; 
  src: string; 
  description: string;
  link: string; 
}


export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  // categories data
  const categories = getCategories(locale);
  console.log('categories: ', categories)

  const allPostsData = getSortedPostsData().slice(0, 6)
  
  // deployment

  return (
    <div className="container mx-auto py-12 space-y-16 ">
      <section className="flex flex-col items-center justify-center text-center space-y-6">
        <h1 className="mx-auto max-w-3xl text-3xl font-bold lg:text-7xl tracking-tighter">
          <span className="inline-block">RivalsCodes</span>
        </h1>
        <h2 className="text-2xl tracking-tight sm:text-3xl md:text-3xl lg:text-3xl">{t("h2")}</h2>
        <p className="mx-auto max-w-[700px] md:text-xl tracking-tight">
          {t("description")}
        </p>
        <div className='w-full px-2 pt-10 lg:w-1/2'>
          <Search />
        </div>
        <div className="w-full px-2 pt-10">
          <div className="space-y-8">
            <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-100 dark:bg-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Roblox Rivals Active Codes</h3>
              </div>
              <div className="relative w-full h-[600px]">
                <iframe 
                  src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9MIlba01kbxOhx7lpOpW3Evaw8GmhKECz9hJRCvJy8_PtmdgHHEhbj9EAmb7KL8WZThc-KlHnPIEX/pubhtml?widget=true&amp;headers=false"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] border-0"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-100 dark:bg-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Roblox Blue Lock: Rivals Active Codes</h3>
              </div>
              <div className="relative w-full h-[350px]">
                <iframe 
                  src="https://docs.google.com/spreadsheets/d/e/2PACX-1vT_JA3eWKjNM80dmUYzJVlbSuZkRJ_tKvMBWapWdDodo2dmvwS0Hr9L3mIPyByrJ4weLeA2V4PgGXVK/pubhtml?widget=true&amp;headers=false"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] border-0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {categories.map((category: categoryType, index: React.Key | null | undefined) => (
        <ToolsList key={index} category={category} locale={locale} />
      ))}
      <div className='border-t'></div>
      <Suspense fallback={<div>Loading editor...</div>}>
        <ArticleList articles={allPostsData} />
      </Suspense>
    </div>
  )
}