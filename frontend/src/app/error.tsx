"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="text-red-200 mb-6">
        <AlertTriangle className="size-28 mx-auto" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-wood-dark mb-3">
        Something Went Wrong
      </h1>
      <p className="text-wood-muted mb-8 max-w-md mx-auto">
        We encountered an unexpected error. Please try again or contact support if the issue persists.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" onClick={reset}>
          Try Again
        </Button>
        <a href="/">
          <Button variant="outline" size="lg">
            Go Home
          </Button>
        </a>
      </div>
    </div>
  )
}
