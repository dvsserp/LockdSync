import { MapPin, Clock, ArrowUpRight } from "lucide-react"
import type { Activity } from "@/lib/activities"

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={activity.image || "/placeholder.svg"}
          alt={`${activity.name} at ${activity.venue}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-card-foreground backdrop-blur">
          {activity.category}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold leading-tight text-card-foreground text-balance">
            {activity.name}
          </h2>

          <a
            href={activity.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{activity.venue}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
          </a>

          <p className="text-sm text-muted-foreground">{activity.neighborhood}</p>
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {activity.duration}
          </span>

          <span className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-card-foreground">
              ${activity.priceMin}
              {"\u2013"}${activity.priceMax}
            </span>
            <span className="text-xs text-muted-foreground">/person</span>
          </span>
        </div>
      </div>
    </article>
  )
}
