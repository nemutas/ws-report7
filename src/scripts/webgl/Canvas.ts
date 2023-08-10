import vs from './shader/vertexShader.glsl'
import fs from './shader/fragmentShader.glsl'
import { Plane } from './core/Plane'
import { isTouch, loadImages } from '@scripts/utils'
import { Texture } from './core/Texture'
import { webgl } from './core/WebGL'
import { lerp } from './utils/math'
import VirtualScroll from 'virtual-scroll'
import { Events } from './Events'

export class Canvas {
  private plane?: Plane
  private textures: Texture[] = []
  private mouse = {
    move: {
      target: [0, 0],
      curret: [0, 0],
    },
    drag: {
      isDrag: false,
      prev: [0, 0],
      target: [0, 0],
      curret: [0, 0],
    },
  }
  private scroll = { curret: 0, target: 0 }
  private scroller?: VirtualScroll
  private events?: Events

  constructor(canvas: HTMLCanvasElement) {
    webgl.setup(canvas)

    const paths = ['/images/webgl.jpg', '/images/matcap.png']
    loadImages(paths).then((images) => {
      webgl.background = '#012'
      this.addEvents()
      this.createScreen(images)
      webgl.animation(this.render)
    })
  }

  private addEvents() {
    const touchSpeed = 1.5

    const events = new Events()
    events.resize = () => this.handleResize()
    events.mousemove = (e: MouseEvent) => this.handleMove(e.clientX, e.clientY)
    events.mousedown = (e: MouseEvent) => this.handleStart(e.clientX, e.clientY)
    events.mouseup = () => this.handleEnd()
    events.touchmove = (e: TouchEvent) => this.handleMove(e.touches[0].clientX * touchSpeed, e.touches[0].clientY * touchSpeed)
    events.touchstart = (e: TouchEvent) => this.handleStart(e.touches[0].clientX * touchSpeed, e.touches[0].clientY * touchSpeed)
    events.touchend = () => this.handleEnd()
    this.events = events

    if (!isTouch()) {
      this.scroller = new VirtualScroll()
      this.scroller.on((event) => {
        this.scroll.target = event.y
      })
    }
  }

  private handleResize() {
    this.plane?.setUniform('uAspect', webgl.size.aspect)
  }

  private handleMove(x: number, y: number) {
    this.mouse.move.target = [(x / webgl.size.width) * 2 - 1, (1 - y / webgl.size.height) * 2 - 1]

    if (this.mouse.drag.isDrag) {
      const dx = x - this.mouse.drag.prev[0]
      const dy = y - this.mouse.drag.prev[1]
      this.mouse.drag.target[0] += dx
      this.mouse.drag.target[1] += dy
      this.mouse.drag.prev = [x, y]
    }
  }

  private handleStart(x: number, y: number) {
    this.mouse.drag.isDrag = true
    this.mouse.drag.prev = [x, y]
  }

  private handleEnd() {
    this.mouse.drag.isDrag = false
  }

  private createScreen(images: HTMLImageElement[]) {
    this.plane = new Plane(vs, fs, { width: 2, height: 2 })

    // texture作成時にbindを解除している関係上、先にtextureを作ってからuniformに登録する。
    this.textures = images.map((image) => new Texture({ source: image }))
    this.textures.forEach((texture, i) => {
      this.plane?.addUniform(`uTextures[${i}].data`, 't', texture)
      this.plane?.addUniform(`uTextures[${i}].aspect`, '1f', texture.size.aspect)
      this.plane?.addUniform(`uTextures[${i}].flipY`, '1i', true)
    })

    this.plane.addUniform('uAspect', '1f', webgl.size.aspect)
    this.plane.addUniform('uMouseMove', '2fv', Float32Array.from([0, 0]))
    this.plane.addUniform('uMouseDrag', '2fv', Float32Array.from([0, 0]))
    this.plane.addUniform('uTime', '1f', 0)
    this.plane.addUniform('uScroll', '1f', 0)
    this.plane.addUniform('uProgress', '1f', 0)

    // const obj = { progress: 0 }
    // gui.add(obj, 'progress', 0, 1, 0.001).onChange((v: number) => {
    //   this.plane?.setUniform('uProgress', v)
    // })
  }

  private render = () => {
    const { move, drag } = this.mouse

    move.curret[0] = lerp(move.curret[0], move.target[0], 0.07)
    move.curret[1] = lerp(move.curret[1], move.target[1], 0.07)
    this.plane?.setUniform('uMouseMove', Float32Array.from(move.curret))

    drag.curret[0] = lerp(drag.curret[0], drag.target[0], 0.07)
    drag.curret[1] = lerp(drag.curret[1], drag.target[1], 0.07)
    this.plane?.setUniform('uMouseDrag', Float32Array.from(drag.curret))

    this.scroll.curret = lerp(this.scroll.curret, this.scroll.target, 0.06)
    this.plane?.setUniform('uScroll', this.scroll.curret)

    this.plane?.addUniformValue('uTime', 0.01)

    this.plane?.render()
  }

  dispose() {
    webgl.dispose()
    this.plane?.dispose()
    this.textures.forEach((t) => t.dispose())
    this.events?.remove()
    this.scroller?.destroy()
  }
}
