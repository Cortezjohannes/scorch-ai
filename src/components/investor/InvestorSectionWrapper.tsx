'use client'

import React from 'react'

interface InvestorSectionWrapperProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function InvestorSectionWrapper({ 
  title, 
  children, 
  className = '' 
}: InvestorSectionWrapperProps) {
  return (
    <div className={`${className}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

