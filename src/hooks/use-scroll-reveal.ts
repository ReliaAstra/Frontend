'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // No IntersectionObserver (older browsers / no-JS) — keep content visible.
    if (typeof IntersectionObserver === 'undefined') {
      const id = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(id)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(element)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}

export function useStaggerReveal(count: number, options: ScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', once = true } = options
  const containerRef = useRef<HTMLElement>(null)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    if (typeof IntersectionObserver === 'undefined') {
      const all = new Set<number>()
      for (let i = 0; i < count; i++) all.add(i)
      const id = setTimeout(() => setVisibleItems(all), 0)
      return () => clearTimeout(id)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const newVisible = new Set<number>()
          for (let i = 0; i < count; i++) {
            newVisible.add(i)
          }
          setVisibleItems(newVisible)
          if (once) observer.unobserve(element)
        } else if (!once) {
          setVisibleItems(new Set())
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [count, threshold, rootMargin, once])

  return { containerRef, visibleItems }
}
