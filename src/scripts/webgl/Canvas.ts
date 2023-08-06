import { WebGL } from './core/WebGL'
import vs from './shader/vertexShader.glsl'
import fs from './shader/fragmentShader.glsl'
import { Plane } from './Plane'

export class Canvas extends WebGL {
  private plane?: Plane

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.background = '#012'
    this.createScreen()
    this.animation(this.render)
  }

  private createScreen() {
    this.plane = new Plane(this.gl, vs, fs, { width: 2, height: 2 })
  }

  private render = () => {
    this.plane?.render()
  }
}
