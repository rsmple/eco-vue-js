import {addDay, addMonth, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

export enum Kind {
  TROPICAL = 'tropical',
  SUCCULENT = 'succulent',
  FERN = 'fern',
  HERB = 'herb',
}

export enum Light {
  FULL_SUN = 'full_sun',
  BRIGHT = 'bright',
  PARTIAL = 'partial',
  SHADE = 'shade',
}

export type Caretaker = {
  name: string
  /** Tone class of the avatar. */
  tone: string
}

export type Task = {
  title: string
  due: Date
}

export type Plant = {
  id: number
  name: string
  species: string
  kind: Kind
  /** Grown height, in centimetres. */
  height: number
  watered: boolean
  /** Air humidity the plant prefers, in percent. */
  humidity: number
  /** How many seeds are in stock. */
  seeds: number
  /** Water per watering, in millilitres. */
  water: number
  /** When a thirsty plant needs water by; `null` while it is watered. */
  waterBy: Date | null
  light: Light
  /** Health score, from 0 to 100. */
  health: number
  /** Height a month apart over the last six months, oldest first; the last is today's. */
  growth: {date: number, height: number}[]
  /** Days it was watered over the last four weeks, newest first. */
  waterings: Date[]
  /** Temperature range it is happy in, in °C. */
  temperature: [number, number]
  caretaker: Caretaker
  tasks: Task[]
  description: string
}

export const caretakers: Caretaker[] = [
  {name: 'Ivy Moss', tone: 'tone-data-green'},
  {name: 'Rowan Oak', tone: 'tone-data-amber'},
  {name: 'Fern Ash', tone: 'tone-data-violet'},
  {name: 'Hazel Reed', tone: 'tone-data-pink'},
]

const LIGHTS = [Light.BRIGHT, Light.FULL_SUN, Light.PARTIAL, Light.SHADE] as const

/** Days between waterings. */
const INTERVAL: Record<Kind, number> = {
  [Kind.TROPICAL]: 5,
  [Kind.SUCCULENT]: 10,
  [Kind.FERN]: 3,
  [Kind.HERB]: 2,
}

const TEMPERATURE: Record<Kind, [number, number]> = {
  [Kind.TROPICAL]: [18, 29],
  [Kind.SUCCULENT]: [10, 32],
  [Kind.FERN]: [16, 24],
  [Kind.HERB]: [12, 26],
}

const SOURCE: [string, string, Kind, number][] = [
  ['Monstera', 'Monstera deliciosa', Kind.TROPICAL, 300],
  ['Aloe vera', 'Aloe barbadensis', Kind.SUCCULENT, 60],
  ['Boston fern', 'Nephrolepis exaltata', Kind.FERN, 90],
  ['Basil', 'Ocimum basilicum', Kind.HERB, 60],
  ['Fiddle-leaf fig', 'Ficus lyrata', Kind.TROPICAL, 300],
  ['Jade plant', 'Crassula ovata', Kind.SUCCULENT, 90],
  ['Maidenhair fern', 'Adiantum raddianum', Kind.FERN, 45],
  ['Rosemary', 'Salvia rosmarinus', Kind.HERB, 150],
  ['Rubber plant', 'Ficus elastica', Kind.TROPICAL, 250],
  ['Snake plant', 'Dracaena trifasciata', Kind.SUCCULENT, 90],
  ['Bird\'s nest fern', 'Asplenium nidus', Kind.FERN, 90],
  ['Thyme', 'Thymus vulgaris', Kind.HERB, 30],
  ['Golden pothos', 'Epipremnum aureum', Kind.TROPICAL, 200],
  ['Zebra haworthia', 'Haworthiopsis attenuata', Kind.SUCCULENT, 15],
  ['Staghorn fern', 'Platycerium bifurcatum', Kind.FERN, 90],
  ['Mint', 'Mentha spicata', Kind.HERB, 60],
  ['Heartleaf philodendron', 'Philodendron hederaceum', Kind.TROPICAL, 120],
  ['Echeveria', 'Echeveria elegans', Kind.SUCCULENT, 15],
  ['Rabbit\'s foot fern', 'Davallia fejeensis', Kind.FERN, 45],
  ['Lavender', 'Lavandula angustifolia', Kind.HERB, 60],
  ['Peace lily', 'Spathiphyllum wallisii', Kind.TROPICAL, 60],
  ['String of pearls', 'Curio rowleyanus', Kind.SUCCULENT, 90],
  ['Blue star fern', 'Phlebodium aureum', Kind.FERN, 60],
  ['Sage', 'Salvia officinalis', Kind.HERB, 60],
  ['Calathea', 'Goeppertia orbifolia', Kind.TROPICAL, 90],
  ['Panda plant', 'Kalanchoe tomentosa', Kind.SUCCULENT, 45],
  ['Kangaroo fern', 'Microsorum diversifolium', Kind.FERN, 45],
  ['Oregano', 'Origanum vulgare', Kind.HERB, 45],
  ['Prayer plant', 'Maranta leuconeura', Kind.TROPICAL, 30],
  ['Burro\'s tail', 'Sedum morganianum', Kind.SUCCULENT, 60],
  ['Holly fern', 'Cyrtomium falcatum', Kind.FERN, 60],
  ['Parsley', 'Petroselinum crispum', Kind.HERB, 30],
  ['Bird of paradise', 'Strelitzia reginae', Kind.TROPICAL, 180],
  ['Golden barrel cactus', 'Echinocactus grusonii', Kind.SUCCULENT, 60],
  ['Button fern', 'Pellaea rotundifolia', Kind.FERN, 30],
  ['Chives', 'Allium schoenoprasum', Kind.HERB, 30],
  ['Areca palm', 'Dypsis lutescens', Kind.TROPICAL, 250],
  ['Christmas cactus', 'Schlumbergera bridgesii', Kind.SUCCULENT, 30],
  ['Lemon button fern', 'Nephrolepis cordifolia', Kind.FERN, 30],
  ['Coriander', 'Coriandrum sativum', Kind.HERB, 50],
  ['Parlour palm', 'Chamaedorea elegans', Kind.TROPICAL, 120],
  ['Bunny ear cactus', 'Opuntia microdasys', Kind.SUCCULENT, 60],
  ['Silver lace fern', 'Pteris ensiformis', Kind.FERN, 45],
  ['Dill', 'Anethum graveolens', Kind.HERB, 90],
  ['Chinese evergreen', 'Aglaonema commutatum', Kind.TROPICAL, 90],
  ['Ponytail palm', 'Beaucarnea recurvata', Kind.SUCCULENT, 180],
  ['Asparagus fern', 'Asparagus setaceus', Kind.FERN, 90],
  ['Lemon balm', 'Melissa officinalis', Kind.HERB, 60],
  ['Anthurium', 'Anthurium andraeanum', Kind.TROPICAL, 60],
  ['ZZ plant', 'Zamioculcas zamiifolia', Kind.SUCCULENT, 90],
  ['Japanese painted fern', 'Athyrium niponicum', Kind.FERN, 45],
  ['Tarragon', 'Artemisia dracunculus', Kind.HERB, 90],
  ['Elephant ear', 'Alocasia amazonica', Kind.TROPICAL, 120],
  ['Living stones', 'Lithops lesliei', Kind.SUCCULENT, 5],
  ['Ostrich fern', 'Matteuccia struthiopteris', Kind.FERN, 150],
  ['Chamomile', 'Matricaria chamomilla', Kind.HERB, 60],
  ['Croton', 'Codiaeum variegatum', Kind.TROPICAL, 150],
  ['Hens and chicks', 'Sempervivum tectorum', Kind.SUCCULENT, 15],
  ['Tree fern', 'Dicksonia antarctica', Kind.FERN, 450],
  ['Lemongrass', 'Cymbopogon citratus', Kind.HERB, 150],
  ['Moth orchid', 'Phalaenopsis amabilis', Kind.TROPICAL, 60],
  ['Century plant', 'Agave americana', Kind.SUCCULENT, 180],
  ['Hart\'s tongue fern', 'Asplenium scolopendrium', Kind.FERN, 60],
  ['Bay laurel', 'Laurus nobilis', Kind.HERB, 300],
]

/** In-memory stand-in for a REST collection. */
export const plants: Plant[] = SOURCE.map(([name, species, kind, height], index) => {
  const today = getStartOfDay()
  const watered = index % 3 !== 0
  // Some thirsty plants are overdue.
  const waterBy = watered ? null : addDay(today, index * 5 % 10 - 4)
  // Plants that grow fast gained up to a third of their height in six months.
  const gain = 0.08 + index * 7 % 25 / 100
  // The last watering was a while ago for thirsty plants.
  const lastWatered = (watered ? index % INTERVAL[kind] : INTERVAL[kind] + 1 + index % 3)

  return {
    id: index + 1,
    name,
    species,
    kind,
    height,
    watered,
    humidity: 40 + index * 13 % 41,
    seeds: 40 + index * 7919 % 4800,
    water: 50 * (1 + index * 7 % 16),
    waterBy,
    light: LIGHTS[index * 3 % LIGHTS.length]!,
    health: Math.max(12, 60 + index * 17 % 41 - (waterBy && waterBy < today ? 35 : 0)),
    growth: Array.from({length: 6}, (_, month) => ({
      date: +addMonth(today, month - 5),
      height: month === 5 ? height : Math.round(height * (1 - gain * (5 - month) / 5) * (1 + (month * index % 3 - 1) / 100)),
    })),
    waterings: Array.from({length: 28}, (_, day) => addDay(today, -day))
      .filter((_, day) => day >= lastWatered && (day - lastWatered) % INTERVAL[kind] === 0),
    temperature: TEMPERATURE[kind],
    caretaker: caretakers[index % caretakers.length]!,
    tasks: [
      {title: 'Fertilize', due: addDay(today, index * 3 % 14 - 2)},
      {title: 'Prune', due: addDay(today, 7 + index * 5 % 30)},
      {title: 'Repot', due: addDay(today, 20 + index * 11 % 90)},
    ],
    description: `${ name } (${ species }), a ${ kind } plant that grows to about ${ height } cm.`,
  }
})
