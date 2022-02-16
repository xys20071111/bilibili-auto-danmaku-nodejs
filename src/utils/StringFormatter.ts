// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormatString(str: string, args: any): string {
	let result: string = str;
	for(const arg in args) {
		result = result.replace(new RegExp(`{${arg}}`, 'g'), args[arg])
	}
	return result;
}