'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageSliderProps {
  images: string[]
  alt: string
  className?: string
}

export default function ImageSlider({ images, alt, className = '' }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(0)
  }, [images])

  if (!images || images.length === 0) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const goToPrevious = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index: number, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index)
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      goToNext()
    }
    if (distance < -minSwipeDistance) {
      goToPrevious()
    }
  }

  // Extract height from className if present
  const heightClass = className.match(/h-[\w-]+/)?.[0] || ''
  const containerClass = className.replace(/h-[\w-]+/, '').trim()

  return (
    <div className={`relative w-full ${containerClass}`}>
      {/* Main Image Container */}
      <div 
        className={`relative w-full ${heightClass || 'h-full'} overflow-hidden rounded-xl touch-pan-y`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-cover select-none"
          priority={currentIndex === 0}
          draggable={false}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => goToPrevious(e)}
              onTouchEnd={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goToPrevious(e)
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white p-2 sm:p-2.5 rounded-full transition-all z-10 touch-manipulation"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => goToNext(e)}
              onTouchEnd={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goToNext(e)
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white p-2 sm:p-2.5 rounded-full transition-all z-10 touch-manipulation"
              aria-label="Next image"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/60 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide relative z-0">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => goToSlide(index, e)}
              onTouchEnd={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goToSlide(index, e)
              }}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                index === currentIndex
                  ? 'border-primary-600 dark:border-primary-400 ring-2 ring-primary-300 dark:ring-primary-600 opacity-100'
                  : 'border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100 active:opacity-100'
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover select-none"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && images.length <= 10 && (
        <div className="flex justify-center gap-2 mt-3 sm:mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => goToSlide(index, e)}
              onTouchEnd={(e) => {
                e.preventDefault()
                e.stopPropagation()
                goToSlide(index, e)
              }}
              className={`h-2 rounded-full transition-all touch-manipulation ${
                index === currentIndex
                  ? 'bg-primary-600 dark:bg-primary-400 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

