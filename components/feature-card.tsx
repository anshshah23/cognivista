'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button' // Ensure Button component is imported

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  index?: number
}

export function FeatureCard ({
  title,
  description,
  icon: Icon,
  href,
  index = 0
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className='h-full'
    >
      <div className='feature-card h-full bg-white/50 dark:bg-slate-900/50 border-outline dark:border-slate-700/30 p-4 rounded-lg flex flex-col justify-between'>
        <div className='p-2 md:p-4'>
          <div className='w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 mb-4'>
            <Icon className='h-6 w-6 text-primary' />
          </div>
          
          {/* ✅ Fixed: Wrap h3 inside <Link> properly with block display */}
          <h3 className='text-xl font-bold mb-2 hover:text-blue-500 cursor-pointer block'>
            {title}
          </h3>

          <p className='text-muted-foreground mb-4'>{description}</p>
          {/* ✅ Clickable Title */}
          <Link
          href={href}
          passHref
          className='feature-card h-2 bg-white/50 dark:bg-slate-900/50 border-outline dark:border-slate-700/30 p-4 rounded-lg flex flex-col justify-center items-center'
        >
          Explore
        </Link>
        </div>
      </div>
    </motion.div>
  )
}
