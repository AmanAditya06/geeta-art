import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "sm",
  showValue = false,
}: StarRatingProps) {
  const sizeMap = { sm: "size-3.5", md: "size-4", lg: "size-5" }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeMap[size],
            i < Math.floor(rating)
              ? "fill-accent text-accent"
              : i < rating
                ? "fill-accent/50 text-accent"
                : "fill-wood-border/30 text-wood-border/50"
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1.5 text-sm text-wood-muted">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
