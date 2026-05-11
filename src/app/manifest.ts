import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShadMini AI',
    short_name: 'ShadMini',
    description: 'مساعد ذكي متعدد النماذج',
    start_url: '/',
    display: 'standalone',
    background_color: '#212121',
    theme_color: '#10a37f',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}