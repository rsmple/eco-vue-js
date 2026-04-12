const monthFormatter = new Intl.DateTimeFormat('en', {month: 'short'})

export const dateToKey = (date: Date): string => {
  return `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(2, '0') }-${ String(date.getDate()).padStart(2, '0') }`
}

export const weekGrid = (() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(today)
  startDate.setFullYear(startDate.getFullYear() - 1)

  const gridStart = new Date(startDate)
  const startDay = (gridStart.getDay() + 6) % 7
  gridStart.setDate(gridStart.getDate() - startDay)

  const gridEnd = new Date(today)
  const endDay = (gridEnd.getDay() + 6) % 7
  if (endDay < 6) gridEnd.setDate(gridEnd.getDate() + (6 - endDay))

  const result: Array<{days: Array<string | null>, monthLabel: string | undefined}> = []
  const current = new Date(gridStart)
  let lastMonth = -1

  while (current <= gridEnd) {
    const days: Array<string | null> = []
    let firstVisibleDate: Date | undefined

    for (let i = 0; i < 7; i++) {
      if (current < startDate || current > today) {
        days.push(null)
      } else {
        if (!firstVisibleDate) firstVisibleDate = new Date(current)
        days.push(dateToKey(current))
      }

      current.setDate(current.getDate() + 1)
    }

    let monthLabel: string | undefined

    if (firstVisibleDate) {
      const month = firstVisibleDate.getMonth()
      if (month !== lastMonth) {
        monthLabel = monthFormatter.format(firstVisibleDate)
        lastMonth = month
      }
    }

    result.push({days, monthLabel})
  }

  return result
})()