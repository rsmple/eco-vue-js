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
  {id: 7, name: 'Joseph Banks', role: 'Gardener', tone: 'tone-data-blue', week: [true, true, true, true, false, false, true]},
  {id: 8, name: 'Alexander von Humboldt', role: 'Volunteer', tone: 'tone-data-orange', week: [false, true, false, false, true, false, false]},
  {id: 9, name: 'Marianne North', role: 'Greenhouse', tone: 'tone-data-fuchsia', week: [true, false, true, true, true, false, true]},
  {id: 10, name: 'Jane Colden', role: 'Herbs', tone: 'tone-data-red', week: [true, true, false, true, false, true, true]},
  {id: 11, name: 'Asa Gray', role: 'Gardener', tone: 'tone-data-gray', week: [false, true, true, true, true, true, false]},
  {id: 12, name: 'John Bartram', role: 'Orchard', tone: 'tone-data-green', week: [true, false, false, true, true, false, true]},
  {id: 13, name: 'Ynes Mexia', role: 'Seedlings', tone: 'tone-data-violet', week: [true, true, true, true, true, true, false]},
  {id: 14, name: 'Joseph Dalton Hooker', role: 'Greenhouse', tone: 'tone-data-pink', week: [false, false, true, true, false, true, true]},
  {id: 15, name: 'Charles Darwin', role: 'Volunteer', tone: 'tone-data-amber', week: [false, true, false, false, false, true, false]},
  {id: 16, name: 'Maria Sibylla Merian', role: 'Herbs', tone: 'tone-data-teal', week: [true, true, false, true, true, false, true]},
  {id: 17, name: 'Gertrude Jekyll', role: 'Gardener', tone: 'tone-data-cyan', week: [true, true, true, false, true, true, true]},
  {id: 18, name: 'Vita Sackville-West', role: 'Gardener', tone: 'tone-data-blue', week: [false, true, true, true, false, true, true]},
  {id: 19, name: 'Kate Brandegee', role: 'Seedlings', tone: 'tone-data-orange', week: [true, false, true, false, true, true, false]},
  {id: 20, name: 'Eloise Butler', role: 'Volunteer', tone: 'tone-data-fuchsia', week: [false, false, false, true, false, true, true]},
  {id: 21, name: 'Liberty Hyde Bailey', role: 'Orchard', tone: 'tone-data-red', week: [true, true, false, false, true, true, true]},
  {id: 22, name: 'David Douglas', role: 'Gardener', tone: 'tone-data-gray', week: [true, false, true, true, true, true, false]},
  {id: 23, name: 'Ernest Wilson', role: 'Greenhouse', tone: 'tone-data-green', week: [false, true, true, false, true, false, true]},
  {id: 24, name: 'Frank Kingdon-Ward', role: 'Volunteer', tone: 'tone-data-violet', week: [true, false, false, false, true, false, false]},
  {id: 25, name: 'Janaki Ammal', role: 'Seedlings', tone: 'tone-data-pink', week: [true, true, true, true, false, true, true]},
  {id: 26, name: 'Agnes Arber', role: 'Herbs', tone: 'tone-data-amber', week: [false, true, true, false, true, true, false]},
  {id: 27, name: 'Nikolai Vavilov', role: 'Seedlings', tone: 'tone-data-teal', week: [true, false, true, true, false, true, true]},
  {id: 28, name: 'Masanobu Fukuoka', role: 'Orchard', tone: 'tone-data-cyan', week: [false, false, true, true, true, false, true]},
  {id: 29, name: 'Katherine Esau', role: 'Greenhouse', tone: 'tone-data-blue', week: [true, true, false, true, true, true, false]},
  {id: 30, name: 'John Muir', role: 'Volunteer', tone: 'tone-data-orange', week: [false, true, false, true, false, false, true]},
  {id: 31, name: 'Rachel Carson', role: 'Gardener', tone: 'tone-data-fuchsia', week: [true, true, true, false, false, true, true]},
  {id: 32, name: 'Norman Borlaug', role: 'Seedlings', tone: 'tone-data-red', week: [true, false, true, true, true, true, true]},
  {id: 33, name: 'Wangari Maathai', role: 'Orchard', tone: 'tone-data-gray', week: [true, true, false, true, false, true, false]},
  {id: 34, name: 'Piet Oudolf', role: 'Gardener', tone: 'tone-data-green', week: [false, true, true, true, true, false, true]},
  {id: 35, name: 'Lancelot Brown', role: 'Gardener', tone: 'tone-data-violet', week: [true, false, false, true, true, true, false]},
  {id: 36, name: 'Hildegard of Bingen', role: 'Herbs', tone: 'tone-data-pink', week: [false, true, true, false, true, true, true]},
]

/** First and last initials, which fit the round avatar. */
export const initials = (name: string) => {
  const parts = name.split(' ')

  return parts.length > 1 ? parts[0]![0]! + parts.at(-1)![0]! : name.slice(0, 2)
}
