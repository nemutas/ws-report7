export function resolvePath(path: string) {
	const p = path.startsWith('/') ? path.substring(1) : path
	return import.meta.env.BASE_URL + p
}

export function loadImage(path: string) {
	return new Promise(resolve => {
		const img = new Image()
		img.src = resolvePath(path)
		img.onload = () => resolve(img)
	}) as Promise<HTMLImageElement>
}

export async function loadImages(paths: string[]) {
	return await Promise.all(paths.map(async path => await loadImage(path)))
}
