import React from 'react'
import { cn } from '@/lib/utils'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Section({ children, className, ...props }: SectionProps) {
  return (
    <section
      className={cn('container mx-auto px-4 py-8 md:py-16', className)}
      {...props}
    >
      {children}
    </section>
  )
}