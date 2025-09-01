"use client"

import Image from 'next/image'

interface BrainIconProps {
  className?: string
}

export default function BrainIcon({ className = "w-8 h-8" }: BrainIconProps) {
  return <Image src='/NGLogoDarkMode.png' alt="NG Logo" width={32} height={32} className={className} />
}