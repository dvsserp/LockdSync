export type Activity = {
  id: string
  name: string
  category: string
  venue: string
  neighborhood: string
  /** Google Maps search URL for the venue */
  mapsUrl: string
  priceMin: number
  priceMax: number
  duration: string
  image: string
}

function maps(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export const activities: Activity[] = [
  {
    id: "bowling",
    name: "Bowling Night",
    category: "Games",
    venue: "Bowlero Chelsea Piers",
    neighborhood: "Chelsea, Manhattan",
    mapsUrl: maps("Bowlero Chelsea Piers, New York"),
    priceMin: 18,
    priceMax: 30,
    duration: "~2 hrs",
    image: "/activities/bowling.png",
  },
  {
    id: "karaoke",
    name: "Private Karaoke",
    category: "Music",
    venue: "Karaoke Duet 35",
    neighborhood: "Koreatown, Manhattan",
    mapsUrl: maps("Karaoke Duet 35, New York"),
    priceMin: 15,
    priceMax: 25,
    duration: "~1.5 hrs",
    image: "/activities/karaoke.png",
  },
  {
    id: "skating",
    name: "Ice Skating",
    category: "Outdoors",
    venue: "The Rink at Rockefeller Center",
    neighborhood: "Midtown, Manhattan",
    mapsUrl: maps("The Rink at Rockefeller Center, New York"),
    priceMin: 20,
    priceMax: 40,
    duration: "~1 hr",
    image: "/activities/skating.png",
  },
  {
    id: "arcade",
    name: "Retro Arcade & Drinks",
    category: "Games",
    venue: "Barcade Chelsea",
    neighborhood: "Chelsea, Manhattan",
    mapsUrl: maps("Barcade Chelsea, New York"),
    priceMin: 10,
    priceMax: 25,
    duration: "flexible",
    image: "/activities/arcade.png",
  },
  {
    id: "ramen",
    name: "Ramen Run",
    category: "Food",
    venue: "Ippudo NY (East Village)",
    neighborhood: "East Village, Manhattan",
    mapsUrl: maps("Ippudo East Village, New York"),
    priceMin: 18,
    priceMax: 28,
    duration: "~1 hr",
    image: "/activities/ramen.png",
  },
  {
    id: "minigolf",
    name: "Glow Mini Golf",
    category: "Games",
    venue: "Shipwrecked Mini Golf",
    neighborhood: "DUMBO, Brooklyn",
    mapsUrl: maps("Shipwrecked Mini Golf, Brooklyn"),
    priceMin: 12,
    priceMax: 18,
    duration: "~1 hr",
    image: "/activities/minigolf.png",
  },
]
