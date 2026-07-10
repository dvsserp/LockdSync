import { activities } from "@/lib/activities"
import { ActivityCard } from "@/components/activity-card"

export default function ActivitiesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 px-5 pb-4 pt-6 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          New York City
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-balance">
          Things to do
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Can{"\u2019"}t decide? Scroll through hangout ideas and pick one together.
        </p>
      </header>

      <section
        aria-label="Activities"
        className="no-scrollbar flex-1 overflow-y-auto px-5 py-5"
      >
        <ul className="flex flex-col gap-5">
          {activities.map((activity) => (
            <li key={activity.id}>
              <ActivityCard activity={activity} />
            </li>
          ))}
        </ul>

        <p className="py-8 text-center text-sm text-muted-foreground">
          That{"\u2019"}s everything for now {"\u2014"} more spots added weekly.
        </p>
      </section>
    </main>
  )
}
