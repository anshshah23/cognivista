'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ImageIcon,
  MessageSquare,
  PenTool,
  Video,
  BarChart,
  ArrowRight,
  Users,
  Award,
  Lightbulb,
  Brain,
  Zap,
  GraduationCap
} from 'lucide-react'
import HomeImg from "@/public/homeImg.jpg"
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatedCounter } from '@/components/animated-counter'
import { FeatureCard } from '@/components/feature-card'
import { AnimatedBackground } from '@/components/animated-background'

export default function Home () {
  const features = [
    {
      title: 'Interactive Whiteboard',
      description:
        'Create, save, and collaborate on digital whiteboards in real-time',
      icon: PenTool,
      href: '/whiteboard'
    },
    {
      title: 'Image-Based Learning',
      description: 'Upload and annotate images for visual learning',
      icon: ImageIcon,
      href: '/image-learning'
    },
    {
      title: 'Video Learning',
      description: 'Watch educational videos with note-taking capabilities',
      icon: Video,
      href: '/video'
    },
    {
      title: 'Quizzes & Assessments',
      description: 'Test your knowledge with interactive quizzes',
      icon: BookOpen,
      href: '/quizzes'
    },
    {
      title: 'Live Collaboration',
      description: 'Work together in real-time with peers and instructors',
      icon: MessageSquare,
      href: '/collaboration'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track your productivity and learning progress',
      icon: BarChart,
      href: '/analytics'
    }
  ]

  const benefits = [
    {
      title: 'Personalized Learning',
      description:
        'Adaptive content that adjusts to your learning style and pace',
      icon: Brain
    },
    {
      title: 'Collaborative Environment',
      description: 'Learn together with peers through shared workspaces',
      icon: Users
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics',
      icon: Award
    },
    {
      title: 'Interactive Content',
      description: 'Engage with material through multiple learning modalities',
      icon: Lightbulb
    }
  ]

  const stats = [
    { value: 50000, label: 'Active Students', icon: GraduationCap },
    { value: 1200, label: 'Courses Created', icon: BookOpen },
    { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: Award },
    { value: 24, suffix: '/7', label: 'Support Available', icon: Zap }
  ]

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className='flex flex-col min-h-screen scroll-smooth'>
      <AnimatedBackground />

      {/* Theme toggle in top right */}
      <div className='fixed top-12 right-3 z-50'>
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className='w-full relative overflow-hidden min-h-screen flex items-center'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-12 lg:grid-cols-2 lg:gap-16 items-center'>
            <motion.div
              className='space-y-6 mt-8 md:mt-0'
              initial='hidden'
              animate='visible'
              variants={fadeInUpVariants}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
                </span>
                <span>CogniVista</span>
              </div>
              <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl'>
                Learn <span className='gradient-text mr-2'>Smarter</span>, Not
                Harder
              </h1>
              <hr className='border-foreground border-2 my-4' />
              <p className='max-w-[600px] text-muted-foreground text-lg md:text-xl'>
                A comprehensive suite of educational tools designed to transform
                how students learn and educators teach. Empower your journey
                with cutting-edge features tailored to modern education needs.
              </p>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Button
                  asChild
                  size='lg'
                  className='bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full'
                >
                  <Link href='/whiteboard'>
                    Get Started
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  asChild
                  className='rounded-full border-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-primary hover:bg-gradient-to-r hover:from-green-500 hover:via-teal-500 hover:to-blue-500 hover:text-white'
                >
                  <Link href='/analytics'>View Demo</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              className='relative h-[300px] sm:h-[400px] lg:h-[80vh] rounded-lg overflow-hidden bg-muted mb-8 md:mb-0'
              variants={fadeInUpVariants}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <img
                src={HomeImg.src}
                alt='Educational platform dashboard'
                className='absolute inset-0 w-full h-full object-cover'
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='w-full py-12 gradient-bg text-white'>
        <div className='container px-4 md:px-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className='flex flex-col items-center'
              >
                <div className='mb-2 p-2 rounded-full bg-white/10'>
                  <stat.icon className='h-6 w-6 text-white' />
                </div>
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix || ''}
                />
                <p className='text-sm md:text-base text-white/80 mt-1'>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='w-full py-16 md:py-24 bg-background'>
        <div className='container px-4 md:px-6'>
          <motion.div
            className='flex flex-col items-center justify-center space-y-4 text-center mb-12'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
                <span className='gradient-text'>Powerful</span> Learning Tools
              </h2>
              <p className='max-w-[700px] text-muted-foreground md:text-xl/relaxed'>
                Our platform offers a variety of interactive tools to enhance
                your learning experience.
              </p>
            </div>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='w-full py-16 md:py-24 bg-muted'>
        <div className='container px-4 md:px-6'>
          <motion.div
            className='flex flex-col items-center justify-center space-y-4 text-center mb-12'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
                Why Choose <span className='gradient-text'>CogniVista</span>
              </h2>
              <p className='max-w-[700px] text-muted-foreground md:text-xl/relaxed'>
                Discover the benefits of our integrated educational ecosystem.
              </p>
            </div>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-12'>
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className='flex items-start space-x-4'
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className='bg-primary/10 p-3 rounded-full'>
                  <benefit.icon className='h-6 w-6 text-primary' />
                </div>
                <div>
                  <h3 className='text-xl font-bold'>{benefit.title}</h3>
                  <p className='text-muted-foreground'>{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='w-full py-16 md:py-24 gradient-bg text-white'>
        <div className='container px-4 md:px-6'>
          <motion.div
            className='flex flex-col items-center justify-center space-y-4 text-center'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
                Ready to Transform Your Learning Experience?
              </h2>
              <p className='max-w-[700px] md:text-xl/relaxed'>
                Join thousands of students and educators already using our
                platform.
              </p>
            </div>
            <div className='flex flex-col sm:flex-row gap-3 mt-6'>
              <Button
                asChild
                size='lg'
                className='bg-white text-primary hover:bg-white/90 rounded-full'
              >
                <Link href='/signup'>
                  Sign Up Now
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <Button
                asChild
                size='lg'
                variant='outline'
                className='border-white bg-black/30 text-white hover:bg-white/10 rounded-full'
              >
                <Link href='/login'>Log In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className='w-full py-6 bg-background border-t'>
        <div className='container px-4 md:px-6'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='flex items-center space-x-2'>
              <div className='relative h-8 w-8 overflow-hidden rounded-full bg-primary'>
                <div className='absolute inset-0 flex items-center justify-center text-white font-bold'>
                  CV
                </div>
              </div>
              <span className='font-bold text-xl gradient-text'>CogniVista</span>
            </div>
            <div className='flex items-center gap-6 text-sm text-muted-foreground'>
              <Link href='/privacy' className='hover:text-foreground'>
                Privacy
              </Link>
              <Link href='/terms' className='hover:text-foreground'>
                Terms
              </Link>
              <Link href='/contact' className='hover:text-foreground'>
                Contact
              </Link>
              <span>© 2025 CogniVista</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
