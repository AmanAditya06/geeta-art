"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLACEHOLDER, handleImageError, getHeroOverlayFallback } from "@/lib/placeholders"
import type { BannerData } from "@/lib/fetch-banners"
import type { Product } from "@/components/product-card"

interface Props {
  banners: BannerData[]
  overlayImage?: string
  featuredProducts?: Product[]
}

export function HeroCarousel({ banners, overlayImage, featuredProducts }: Props) {
  const [current, setCurrent] = useState(0)
  const slideCount = banners.length

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slideCount)
  }, [slideCount])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slideCount) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (slideCount <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, slideCount])

  const hero = banners[current]
  const overlaySrc = overlayImage || featuredProducts?.[0]?.image

  return (
    <section className="relative overflow-hidden bg-wood-dark h-[500px] lg:h-[560px]">
      {banners.length > 0 ? banners.map((b, i) => (
        <div
          key={b.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${b.image || PLACEHOLDER.banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
          }}
        />
      )) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${PLACEHOLDER.banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />

      {slideCount > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid gap-8 lg:grid-cols-2 h-full">
          <div className="flex flex-col justify-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {hero?.title || "Handcrafted"}{" "}
              <span className="text-accent">Wooden Furniture</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-wood-border/80">
              {hero?.subtitle || "Where tradition meets modern living"}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={hero?.link || "/shop"}>
                <Button size="lg" variant="accent">
                  Explore Collection
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white border border-white/30 hover:bg-white/20">
                  Our Story
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm text-wood-border/60">
              <div className="flex items-center gap-2">
                <Star className="size-4 fill-accent text-accent" />
                <span>4.8/5 Rating</span>
              </div>
              <div>5000+ Happy Customers</div>
              <div>All India Delivery</div>
            </div>
          </div>
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative size-80">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute inset-4 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={overlaySrc || getHeroOverlayFallback()}
                  alt="Featured furniture"
                  className="size-full object-cover"
                  onError={(e) => handleImageError(e, "product")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {slideCount > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`size-2 rounded-full transition-all ${i === current ? "bg-accent w-6" : "bg-white/40 hover:bg-white/60"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
