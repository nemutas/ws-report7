import { HEX, RGBA, hexToRgb } from '../utils/color'
import { clamp } from '../utils/math'

export abstract class WebGL {
  protected gl: WebGLRenderingContext
  private backgroundColor: RGBA = [1, 1, 1, 1]
  private animeId?: number

  constructor(private canvas: HTMLCanvasElement) {
    this.gl = this.getContext()
    this.clearColor()
    this.clearDepth()
    this.addEvents()
    this.resize()
  }

  private getContext() {
    const gl = this.canvas.getContext('webgl')
    if (gl) {
      gl.enable(gl.DEPTH_TEST)
      return gl
    } else {
      throw new Error('webgl not supported')
    }
  }

  private addEvents() {
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  }

  private clearDepth() {
    this.gl.clearDepth(1)
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT)
  }

  private clearColor() {
    this.gl.clearColor(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], this.backgroundColor[3])
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  protected set background(color: RGBA | HEX) {
    if (typeof color === 'string') {
      const c = hexToRgb(color)
      if (c) {
        this.backgroundColor = [c.r, c.g, c.b, this.backgroundColor[3]]
      }
    } else {
      const c = (v: number) => clamp(v, 0, 1)
      this.backgroundColor = [c(color[0]), c(color[1]), c(color[2]), c(color[3])]
    }

    this.clearColor()
  }

  protected animation(anime: () => void) {
    this.animeId = requestAnimationFrame(this.animation.bind(this, anime))

    this.clearColor()
    this.clearDepth()
    anime()
  }

  protected cancelAnimation() {
    this.animeId && cancelAnimationFrame(this.animeId)
  }

  dispose() {
    window.removeEventListener('resize', this.resize)
    this.cancelAnimation()
  }
}
