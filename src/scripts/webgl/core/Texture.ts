import { convertTo2nImage } from '../utils/convert'
import { webgl } from './WebGL'

type Wrap = 'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT'
type Filter = 'NEAREST' | 'LINEAR' | 'NEAREST_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_LINEAR'

type Params = {
  source: HTMLImageElement
  wrapS?: Wrap
  wrapT?: Wrap
  mipmap?: boolean
  magFilter?: Filter
  minFilter?: Filter
}

export class Texture {
  private _texture: WebGLTexture | null

  constructor(private params: Params) {
    this._texture = this.createTexture()
  }

  private createTexture() {
    const gl = webgl.gl
    const data = convertTo2nImage(this.params.source)
    const wrapS = this.params.wrapS ?? 'CLAMP_TO_EDGE'
    const wrapT = this.params.wrapT ?? 'CLAMP_TO_EDGE'
    const mipmap = this.params.mipmap === undefined ? true : this.params.mipmap
    const magFilter = this.params.magFilter ?? 'NEAREST'
    const minFilter = this.params.minFilter ?? 'NEAREST'

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data)

    if (mipmap) {
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[minFilter])
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[magFilter])
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[wrapS])
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[wrapT])

    gl.bindTexture(gl.TEXTURE_2D, null)

    return texture
  }

  get texture() {
    return this._texture
  }

  get size() {
    const { width, height } = this.params.source
    return { width, height, aspect: width / height }
  }

  dispose() {
    webgl.gl.deleteTexture(this._texture)
  }
}
