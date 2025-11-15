import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Next Store',
  description: 'E-commerce sederhana dengan Next.js dan Supabase',
  icons: {
    icon: '/next-store.png',
    apple: '/next-store.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

