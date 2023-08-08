import { Program } from './Program'
import { webgl } from './WebGL'

type Params = {
  width: number
  height: number
}

export class Plane extends Program {
  constructor(vs: string, fs: string, params: Params) {
    super(vs, fs, Plane.createIndexBufferAttributes(params))
  }

  private static createIndexBufferAttributes(params: Params) {
    const [w, h] = [params.width / 2, params.height / 2]
    // prettier-ignore
    const position = [
      -w,  h, 0,
       w,  h, 0,
      -w, -h, 0,
       w, -h, 0,
    ]
    // prettier-ignore
    const normal = [
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ]
    // prettier-ignore
    const uv = [
      0, 1,
      1, 1,
      0, 0,
      1, 0,
    ]
    // prettier-ignore
    const index = [
      0, 2, 1,
      1, 2, 3,
    ]

    return {
      position: Float32Array.from(position),
      normal: Float32Array.from(normal),
      uv: Float32Array.from(uv),
      index: Uint16Array.from(index),
    }
  }

  render() {
    super.render()

    const gl = webgl.gl
    webgl.gl.drawElements(gl.TRIANGLES, this.indexSize, gl.UNSIGNED_SHORT, 0)
  }
}
