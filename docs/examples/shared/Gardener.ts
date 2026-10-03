/** A person who looks after the plants. Shared by the docs examples, so the same people show up everywhere. */
export type Gardener = {
  id: number
  name: string
  role: string
  /** Tone class of the avatar. */
  tone: string
  /** The last seven days, oldest first: whether they watered that day. */
  week: boolean[]
}

export const gardeners: Gardener[] = [
  {id: 1, name: 'Carl Linnaeus', role: 'Head gardener', tone: 'tone-data-green', week: [true, true, false, true, true, true, true]},
  {id: 2, name: 'Gregor Mendel', role: 'Gardener', tone: 'tone-data-violet', week: [true, false, true, true, false, true, true]},
  {id: 3, name: 'Barbara McClintock', role: 'Gardener', tone: 'tone-data-pink', week: [false, true, true, true, true, false, true]},
  {id: 4, name: 'Luther Burbank', role: 'Volunteer', tone: 'tone-data-amber', week: [false, false, true, false, false, true, false]},
  {id: 5, name: 'Beatrix Potter', role: 'Greenhouse', tone: 'tone-data-teal', week: [true, true, true, false, true, true, false]},
  {id: 6, name: 'George Washington Carver', role: 'Seedlings', tone: 'tone-data-cyan', week: [false, true, false, true, true, true, true]},
]

/** First and last initials, which fit the round avatar. */
export const initials = (name: string) => {
  const parts = name.split(' ')

  return parts.length > 1 ? parts[0]![0]! + parts.at(-1)![0]! : name.slice(0, 2)
}
