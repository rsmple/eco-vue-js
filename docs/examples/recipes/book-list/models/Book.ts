import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

export enum Genre {
  NOVEL = 'novel',
  SCIENCE = 'science',
  HISTORY = 'history',
  POETRY = 'poetry',
}

export type Book = {
  id: number
  title: string
  author: string
  genre: Genre
  year: number
  available: boolean
  /** Average reader rating, from 1 to 5. */
  rating: number
  /** How many times the book has been borrowed. */
  loans: number
  pages: number
  /** When a borrowed book is due back; `null` while it is available. */
  dueAt: Date | null
  description: string
}

const SOURCE: [string, string, Genre, number][] = [
  ['Moby-Dick', 'Herman Melville', Genre.NOVEL, 1851],
  ['Pride and Prejudice', 'Jane Austen', Genre.NOVEL, 1813],
  ['On the Origin of Species', 'Charles Darwin', Genre.SCIENCE, 1859],
  ['Leaves of Grass', 'Walt Whitman', Genre.POETRY, 1855],
  ['The History of the Decline and Fall of the Roman Empire', 'Edward Gibbon', Genre.HISTORY, 1776],
  ['Frankenstein', 'Mary Shelley', Genre.NOVEL, 1818],
  ['Middlemarch', 'George Eliot', Genre.NOVEL, 1871],
  ['Principia', 'Isaac Newton', Genre.SCIENCE, 1687],
  ['The Waste Land', 'T. S. Eliot', Genre.POETRY, 1922],
  ['The Histories', 'Herodotus', Genre.HISTORY, -430],
  ['Jane Eyre', 'Charlotte Brontë', Genre.NOVEL, 1847],
  ['Wuthering Heights', 'Emily Brontë', Genre.NOVEL, 1847],
  ['Dialogue Concerning the Two Chief World Systems', 'Galileo Galilei', Genre.SCIENCE, 1632],
  ['Songs of Innocence and of Experience', 'William Blake', Genre.POETRY, 1789],
  ['The Prince', 'Niccolò Machiavelli', Genre.HISTORY, 1532],
  ['Great Expectations', 'Charles Dickens', Genre.NOVEL, 1861],
  ['Anna Karenina', 'Leo Tolstoy', Genre.NOVEL, 1878],
  ['Micrographia', 'Robert Hooke', Genre.SCIENCE, 1665],
  ['The Raven', 'Edgar Allan Poe', Genre.POETRY, 1845],
  ['History of the Peloponnesian War', 'Thucydides', Genre.HISTORY, -400],
  ['Don Quixote', 'Miguel de Cervantes', Genre.NOVEL, 1605],
  ['Crime and Punishment', 'Fyodor Dostoevsky', Genre.NOVEL, 1866],
  ['The Descent of Man', 'Charles Darwin', Genre.SCIENCE, 1871],
  ['Paradise Lost', 'John Milton', Genre.POETRY, 1667],
  ['The Annals', 'Tacitus', Genre.HISTORY, 109],
  ['Madame Bovary', 'Gustave Flaubert', Genre.NOVEL, 1857],
  ['The Picture of Dorian Gray', 'Oscar Wilde', Genre.NOVEL, 1890],
  ['Opticks', 'Isaac Newton', Genre.SCIENCE, 1704],
  ['Sonnets', 'William Shakespeare', Genre.POETRY, 1609],
  ['The Gallic War', 'Julius Caesar', Genre.HISTORY, -50],
  ['War and Peace', 'Leo Tolstoy', Genre.NOVEL, 1869],
  ['The Brothers Karamazov', 'Fyodor Dostoevsky', Genre.NOVEL, 1880],
  ['Les Misérables', 'Victor Hugo', Genre.NOVEL, 1862],
  ['The Count of Monte Cristo', 'Alexandre Dumas', Genre.NOVEL, 1844],
  ['Emma', 'Jane Austen', Genre.NOVEL, 1815],
  ['Bleak House', 'Charles Dickens', Genre.NOVEL, 1853],
  ['Vanity Fair', 'William Makepeace Thackeray', Genre.NOVEL, 1848],
  ['The Scarlet Letter', 'Nathaniel Hawthorne', Genre.NOVEL, 1850],
  ['Dracula', 'Bram Stoker', Genre.NOVEL, 1897],
  ['Fathers and Sons', 'Ivan Turgenev', Genre.NOVEL, 1862],
  ['The Mill on the Floss', 'George Eliot', Genre.NOVEL, 1860],
  ['Robinson Crusoe', 'Daniel Defoe', Genre.NOVEL, 1719],
  ['Gulliver\'s Travels', 'Jonathan Swift', Genre.NOVEL, 1726],
  ['Tess of the d\'Urbervilles', 'Thomas Hardy', Genre.NOVEL, 1891],
  ['The Portrait of a Lady', 'Henry James', Genre.NOVEL, 1881],
  ['Treasure Island', 'Robert Louis Stevenson', Genre.NOVEL, 1883],
  ['Elements', 'Euclid', Genre.SCIENCE, -300],
  ['On the Revolutions of the Heavenly Spheres', 'Nicolaus Copernicus', Genre.SCIENCE, 1543],
  ['Astronomia Nova', 'Johannes Kepler', Genre.SCIENCE, 1609],
  ['Two New Sciences', 'Galileo Galilei', Genre.SCIENCE, 1638],
  ['Elements of Chemistry', 'Antoine Lavoisier', Genre.SCIENCE, 1789],
  ['Principles of Geology', 'Charles Lyell', Genre.SCIENCE, 1830],
  ['Experiments on Plant Hybridization', 'Gregor Mendel', Genre.SCIENCE, 1866],
  ['A Treatise on Electricity and Magnetism', 'James Clerk Maxwell', Genre.SCIENCE, 1873],
  ['The Interpretation of Dreams', 'Sigmund Freud', Genre.SCIENCE, 1899],
  ['Relativity: The Special and General Theory', 'Albert Einstein', Genre.SCIENCE, 1916],
  ['De Humani Corporis Fabrica', 'Andreas Vesalius', Genre.SCIENCE, 1543],
  ['The Voyage of the Beagle', 'Charles Darwin', Genre.SCIENCE, 1839],
  ['The Iliad', 'Homer', Genre.POETRY, -750],
  ['The Odyssey', 'Homer', Genre.POETRY, -725],
  ['The Aeneid', 'Virgil', Genre.POETRY, -19],
  ['Metamorphoses', 'Ovid', Genre.POETRY, 8],
  ['The Divine Comedy', 'Dante Alighieri', Genre.POETRY, 1320],
  ['The Canterbury Tales', 'Geoffrey Chaucer', Genre.POETRY, 1400],
  ['The Faerie Queene', 'Edmund Spenser', Genre.POETRY, 1590],
  ['Lyrical Ballads', 'William Wordsworth', Genre.POETRY, 1798],
  ['Don Juan', 'Lord Byron', Genre.POETRY, 1819],
  ['Eugene Onegin', 'Alexander Pushkin', Genre.POETRY, 1833],
  ['Les Fleurs du mal', 'Charles Baudelaire', Genre.POETRY, 1857],
  ['Poems', 'Emily Dickinson', Genre.POETRY, 1890],
  ['Gitanjali', 'Rabindranath Tagore', Genre.POETRY, 1910],
  ['The Twelve Caesars', 'Suetonius', Genre.HISTORY, 121],
  ['Parallel Lives', 'Plutarch', Genre.HISTORY, 100],
  ['The Anabasis', 'Xenophon', Genre.HISTORY, -370],
  ['The History of Rome', 'Livy', Genre.HISTORY, -27],
  ['The Ecclesiastical History of the English People', 'Bede', Genre.HISTORY, 731],
  ['The Muqaddimah', 'Ibn Khaldun', Genre.HISTORY, 1377],
  ['The History of England', 'Thomas Babington Macaulay', Genre.HISTORY, 1848],
  ['Democracy in America', 'Alexis de Tocqueville', Genre.HISTORY, 1835],
  ['The French Revolution', 'Thomas Carlyle', Genre.HISTORY, 1837],
]

/** In-memory stand-in for a REST collection. */
export const books: Book[] = SOURCE.map(([title, author, genre, year], index) => ({
  id: index + 1,
  title,
  author,
  genre,
  year,
  available: index % 3 !== 0,
  rating: 3 + (index * 13 % 21) / 10,
  loans: 40 + index * 7919 % 4800,
  pages: 120 + index * 97 % 900,
  // Some borrowed books are overdue.
  dueAt: index % 3 === 0 ? addDay(getStartOfDay(), index * 5 % 30 - 7) : null,
  description: `${ title } by ${ author }, first published ${ year < 0 ? `around ${ -year } BC` : `in ${ year }` }.`,
}))
