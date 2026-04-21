import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import { I18nProvider } from '@/lib/i18n'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProviderWrapper } from '@/components/AuthProviderWrapper'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const materialSymbols = {
  variable: '--font-material',
  subsets: ['latin'],
  display: 'swap',
}

export const metadata: Metadata = {
  title: 'OmniDoc | Clinical Operating System',
  description:
    'The sovereign operating system for clinical growth. AI-powered scheduling, smart triage, and HIPAA-compliant healthcare management.',
  keywords: [
    'medical software',
    'healthcare management',
    'appointment scheduling',
    'clinic management',
    'HIPAA compliant',
    'medical SaaS',
  ],
  authors: [{ name: 'OmniDoc Clinical Systems' }],
  openGraph: {
    title: 'OmniDoc | Clinical Operating System',
    description:
      'The sovereign operating system for clinical growth. AI-powered scheduling and smart healthcare management.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} antialiased min-h-screen flex flex-col light`}
      >
        <AuthProviderWrapper>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}
