'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface CommentsProps {
  pageKey: string;
  pageTitle: string;
}

export default function Comments({ pageKey, pageTitle }: CommentsProps) {
  useEffect(() => {
    // 确保 Artalk 已加载
    if (window.Artalk) {
      window.Artalk.init({
        el: '#comments',
        pageKey: pageKey,
        pageTitle: pageTitle,
        server: 'http://data.24kwebgames.com',
        site: 'Rivals Codes',
      });
    }
  }, [pageKey, pageTitle]);

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/artalk/2.9.1/Artalk.js"
        strategy="lazyOnload"
      />
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/artalk/2.9.1/Artalk.css" 
        rel="stylesheet"
      />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">评论</h2>
        <div id="comments"></div>
      </div>
    </>
  );
} 