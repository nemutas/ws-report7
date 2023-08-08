import { Canvas } from './webgl/Canvas'

const canvas = new Canvas(document.querySelector<HTMLCanvasElement>('.home__canvas')!)

window.addEventListener('beforeunload', () => canvas.dispose())
