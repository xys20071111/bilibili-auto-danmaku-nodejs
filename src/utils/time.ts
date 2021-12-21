function getTimeString(): string {
  const time = new Date()
  const year = time.getFullYear()
  const month = time.getMonth()
  const day = time.getDay()
  const hour = time.getHours()
  const second = time.getSeconds()

  return `${year}-${month}-${day}-${hour}-${second}`
}

export { getTimeString }