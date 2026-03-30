import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Citas ya - Sistema de gestión de citas',
  description: 'Sistema de gestión de citas para locales de belleza y bienestar. Organiza tus citas, clientes y equipo en un solo lugar.',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full bg-gray-50" style={{ colorScheme: 'light' }}>
      <body className={`${inter.className} h-full bg-gray-50 text-gray-900`}>
        <Script id="remove-fusion" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: "try{document.documentElement.classList.remove('fusion-extension-loaded');document.body.classList.remove('fusion-extension-loaded');}catch(e){}" }} />
            {children}
      </body>
    </html>
  )
}
