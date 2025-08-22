import { useReducedMotion } from 'framer-motion'

export const containerStagger = (stagger: number = 0.08, delayChildren: number = 0.1) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
})

export const itemFade = (distance: number = 20, duration: number = 0.5) => ({
  hidden: { opacity: 0, y: distance },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration },
  },
})

export const viewportOnce = { once: true, amount: 0.1 } as const

export function useMotionDurations() {
  const prefersReduced = useReducedMotion()
  return {
    base: prefersReduced ? 0 : 0.5,
    fast: prefersReduced ? 0 : 0.3,
    slow: prefersReduced ? 0 : 0.8,
  }
}


