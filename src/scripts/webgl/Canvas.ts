import vs from './shader/vertexShader.glsl'
import fs from './shader/fragmentShader.glsl'
import { Plane } from './core/Plane'
import { loadImages } from '@scripts/utils'
import { Texture } from './core/Texture'
import { webgl } from './core/WebGL'

export class Canvas {
  private plane?: Plane
  private textures: Texture[] = []

  constructor(canvas: HTMLCanvasElement) {
    webgl.setup(canvas)

    const paths = ['/images/unsplash1.webp', '/images/unsplash2.webp']
    loadImages(paths).then((images) => {
      webgl.background = '#012'
      this.addEvents()
      this.createScreen(images)
      webgl.animation(this.render)
    })
  }

  private addEvents() {
    window.addEventListener('resize', this.resize)
  }

  private resize = () => {
    this.plane?.setUniform('uAspect', webgl.size.aspect)
  }

  private createScreen(images: HTMLImageElement[]) {
    this.plane = new Plane(vs, fs, { width: 2, height: 2 })

    // texture作成時にbindを解除している関係上、先にtextureを作ってからuniformに登録する。
    this.textures = images.map((image) => new Texture({ source: image }))
    this.textures.forEach((texture, i) => {
      this.plane?.addUniform(`uTextures[${i}].data`, 't', texture)
      this.plane?.addUniform(`uTextures[${i}].aspect`, '1f', texture.size.aspect)
    })

    this.plane.addUniform('uAspect', '1f', webgl.size.aspect)
  }

  private render = () => {
    this.plane?.render()
  }

  dispose() {
    webgl.dispose()
    this.plane?.dispose()
    this.textures.forEach((t) => t.dispose())
    window.removeEventListener('resize', this.resize)
  }
}
