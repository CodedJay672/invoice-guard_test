import Topbar from '@/components/topbar'
import React from 'react'

function LandingpageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-page text-content relative">
      <Topbar />
      {children}
    </main>

  )
}

export default LandingpageLayout