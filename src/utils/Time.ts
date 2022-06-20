function getTimeString(): string {
	const time = new Date()
	const year = time.getFullYear()
	const month = time.getMonth() + 1
	const day = time.getDate()
	const hour = time.getHours()
	const minutes = time.getMinutes()
	const second = time.getSeconds()

	return `${year}-${month}-${day}-${hour}-${minutes}-${second}`
}

export { getTimeString }