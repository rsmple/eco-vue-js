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
  description: string
}

export type QueryParamsBooks = {
  page?: number
  ordering?: string
  search?: string
  /** Comma-separated ids — how async selects look up the items behind their model value. */
  id__in?: string
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
]

/** In-memory stand-in for a REST collection. */
export const books: Book[] = SOURCE.map(([title, author, genre, year], index) => ({
  id: index + 1,
  title,
  author,
  genre,
  year,
  available: index % 3 !== 0,
  description: `${ title } by ${ author }, first published ${ year < 0 ? `around ${ -year } BC` : `in ${ year }` }.`,
}))
