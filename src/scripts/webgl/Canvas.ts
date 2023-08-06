import vs from './shader/vertexShader.glsl'
import fs from './shader/fragmentShader.glsl'
import { Plane } from './core/Plane'
import { loadImages } from '@scripts/utils'
import { Texture } from './core/Texture'
import { webgl } from './core/WebGL'

export class Canvas {
  private plane?: Plane
  private texture?: Texture

  constructor(canvas: HTMLCanvasElement) {
    webgl.setup(canvas)

    const paths = ['/images/unsplash.webp']
    loadImages(paths).then((images) => {
      webgl.background = '#012'
      this.addEvents()
      this.createScreen(images[0])
      webgl.animation(this.render)
    })
  }

  private addEvents() {
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    this.plane?.setUniform('uAspect', webgl.size.aspect)
  }

  private createScreen(image: HTMLImageElement) {
    this.plane = new Plane(vs, fs, { width: 2, height: 2 })

    this.texture = new Texture({ source: image })
    this.plane.addUniform('uTexture', 't', this.texture)
    this.plane.addUniform('uAspect', '1f', webgl.size.aspect)
    this.plane.addUniform('uImageAspect', '1f', this.texture.size.aspect)
  }

  private render = () => {
    this.plane?.render()
  }

  dispose() {
    webgl.dispose()
    this.plane?.dispose()
    this.texture?.dispose()
    window.removeEventListener('resize', this.resize)
  }
}
