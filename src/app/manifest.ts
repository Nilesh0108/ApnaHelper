import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeServ Connect',
    short_name: 'HomeServ',
    description: 'Expert home services at your doorstep.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#3b82f6',
    icons: [
      {
        src: 'https://picsum.photos/seed/icon/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/icon/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
