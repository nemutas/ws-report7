import { loadImages } from './utils'

export class Counter {
	constructor() {
		console.log('create counter instance!')

		loadImages(['images/sample.png']).then(res => {
			console.log(res[0].src)
		})
	}
}
