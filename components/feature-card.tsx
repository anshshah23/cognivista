'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

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
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className='h-full'
    >
      <div
        className='feature-card h-full bg-white/50 dark:bg-slate-900/50 border-outline dark:border-slate-700/30'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className='h-3/4 p-2 md:p-4'>
          <div className='w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 mb-4'>
            <Icon className='h-6 w-6 text-primary' />
          </div>
          <h3 className='text-xl font-bold mb-2'>{title}</h3>
          <p className='text-muted-foreground mb-4'>{description}</p>
        </div>
        <Button
          asChild
          variant={isHovered ? 'default' : 'secondary'}
          className='w-full group justify-start mt-2'
        >
          <Link
            href={href}
            className='flex items-center justify-between w-full'
          >
            <span>Explore</span>
            <motion.div
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-4 w-4 ml-2'
              >
                <path d='M5 12h14'></path>
                <path d='m12 5 7 7-7 7'></path>
              </svg>
            </motion.div>
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
