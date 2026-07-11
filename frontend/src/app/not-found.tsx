import Link from "next/link"
import { Frown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="text-wood-muted/20 mb-6">
        <Frown className="size-28 mx-auto" />
      </div>
      <h1 className="font-serif text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="font-serif text-2xl font-bold text-wood-dark mb-3">
        Page Not Found
      </h2>
      <p className="text-wood-muted mb-8 max-w-md mx-auto">
        Looks like this page wandered off into the woods. Let&apos;s get you back to safer ground.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button size="lg">Go Home</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" size="lg">Browse Furniture</Button>
        </Link>
      </div>
    </div>
  )
}
