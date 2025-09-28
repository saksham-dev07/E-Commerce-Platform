import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { Footer } from '../components/Footer'
import { FloatingActions } from '../components/FloatingActions'
import { AuthProvider } from '../contexts/AuthContext'
import { StatsProvider } from '../contexts/StatsContext'
import { LoadingWrapper } from '../components/LoadingWrapper'
import { ToastProvider } from '../components/ui/use-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Commerce Store',
  description: 'A modern e-commerce platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            <StatsProvider>
              <LoadingWrapper>
                <Navbar />
                <main className="min-h-screen ">
                  {children}
                </main>
                <Footer />
                <FloatingActions />
              </LoadingWrapper>
            </StatsProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
