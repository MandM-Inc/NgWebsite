"use client"

import Image from 'next/image'
import { useTheme } from '@/lib/theme'

interface BrainIconProps {
  className?: string
}

export default function BrainIcon({ className = "w-8 h-8" }: BrainIconProps) {
  const { theme } = useTheme()
  const src = theme === 'dark' ? '/NGLogoDarkMode.png' : '/NGLogoWhiteMode.png'
  return <Image src={src} alt="NG Logo" width={32} height={32} className={className} />
}