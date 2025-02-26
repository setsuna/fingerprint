'use client'

import { useState, useEffect } from 'react'
import FingerprintScanner from '@/app/components/FingerprintScanner'
import Header from '@/app/components/Header'
import Instructions from '@/app/components/Instructions'

export default function Home() {
  return (
    <main className="flex flex-col items-center p-8 min-h-screen max-w-5xl mx-auto">
      <Header />
      <Instructions />
      <FingerprintScanner />
    </main>
  )
}