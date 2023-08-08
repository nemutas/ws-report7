import { Texture } from './Texture'
import { webgl } from './WebGL'

type Attributes = {
  position: Float32Array
  normal: Float32Array
  uv: Float32Array
  index?: Uint16Array
}

type UniformType = '1f' | '1i' | '2fv' | 'm4' | 't'

export abstract class Program {
  private program: WebGLProgram
  private uniforms: { [name in string]: { location: WebGLUniformLocation | null; type: UniformType; texture?: Texture; unit?: number } } = {}
  private vbo: { [name in string]: { buffer: WebGLBuffer | null; location: number; size: number } } = {}
  private ibo?: WebGLBuffer | null
  private textureUnit = 0

  constructor(
    private vertexShader: string,
    private fragmentShader: string,
    private attributes: Attributes,
  ) {
    const vs = this.createShaderObject(this.vertexShader, 'vertex')
    const fs = this.createShaderObject(this.fragmentShader, 'fragment')
    this.program = this.createProgramObject(vs, fs)

    this.createBuffers()
  }

  /**
   * シェーダオブジェクトを生成する
   */
  private createShaderObject(shaderSource: string, type: 'vertex' | 'fragment') {
    const gl = webgl.gl
    const _type = type === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
    const shader = gl.createShader(_type)
    if (!shader) throw new Error('cannot created shader')

    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'error')

    return shader
  }

  /**
   * プログラムオブジェクトを生成する
   */
  private createProgramObject(vs: WebGLShader, fs: WebGLShader) {
    const gl = webgl.gl
    const program = gl.createProgram()
    if (!program) throw new Error('cannot created program')

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'error')

    gl.useProgram(program)
    return program
  }

  private createBuffers() {
    Object.entries(this.attributes).forEach(([key, value]) => {
      if (key === 'index') {
        this.createIBO(value as Uint16Array)
      } else {
        const count = key === 'uv' ? 2 : 3
        this.createVBO(key, value, count)
      }
    })
  }

  /**
   * vboを作成する
   * @param name 一意な名前
   * @param datas BufferArray
   * @param count 1組になるデータの数
   * @param usage データの扱い方（attributeの更新頻度）
   */
  createVBO(name: string, datas: BufferSource, count: number, usage: 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' = 'STATIC_DRAW') {
    const gl = webgl.gl
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, datas, gl[usage])
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    this.vbo[name] = { buffer: vbo, location: gl.getAttribLocation(this.program, name), size: count }
  }

  /**
   * iboを作成する
   */
  createIBO(datas: Uint16Array) {
    const gl = webgl.gl

    const ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, datas, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    this.ibo = ibo
  }

  /**
   * bufferを有効化する
   */
  enableBuffer() {
    const gl = webgl.gl

    Object.values(this.vbo).forEach((vbo) => {
      if (0 <= vbo.location) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo.buffer)
        gl.enableVertexAttribArray(vbo.location)
        gl.vertexAttribPointer(vbo.location, vbo.size, gl.FLOAT, false, 0, 0)
      }
    })

    this.ibo && gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo)
  }

  /**
   * attributeを更新する
   * @param name 名前
   * @param datas 更新データ
   */
  updateAttribute(name: string, datas: BufferSource) {
    const gl = webgl.gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[name])
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, datas)
  }

  protected get indexSize() {
    return this.attributes.index?.length ?? 0
  }

  protected get vertexCount() {
    return this.attributes.position.length / this.vbo.position.size
  }

  // =====================================================
  // uniform

  /**
   * uniformを設定する
   * @param name
   * @param value データ型に対応した値
   */
  setUniform(name: string, value?: any) {
    const gl = webgl.gl
    const { location, type, texture, unit } = this.uniforms[name]

    switch (type) {
      case '1f':
        value && gl.uniform1f(location, value)
        break
      case '1i':
        value && gl.uniform1i(location, value)
        break
      case '2fv':
        value && gl.uniform2fv(location, value)
        break
      case 'm4':
        value && gl.uniformMatrix4fv(location, false, value)
        break
      case 't':
        if (value && value instanceof Texture) {
          this.uniforms[name].texture = value
        }
        gl.activeTexture(gl.TEXTURE0 + unit!)
        gl.bindTexture(gl.TEXTURE_2D, texture!.texture)
        gl.uniform1i(location, unit!)
        break
    }
  }

  /**
   * uniformを追加する
   * @param name 一意な名前
   * @param type データ型
   * @param value 初期値
   */
  addUniform(name: string, type: UniformType, value?: any) {
    const gl = webgl.gl
    const location = gl.getUniformLocation(this.program, name)

    if (type === 't' && value instanceof Texture) {
      this.uniforms[name] = { location, type: 't', texture: value, unit: this.textureUnit++ }
      this.setUniform(name)
    } else if (type !== 't') {
      this.uniforms[name] = { location, type }
      this.setUniform(name, value)
    }
  }

  /**
   * uniformの値を取得する
   */
  getUniformValue(name: string): any | null {
    if (!this.uniforms[name]?.location) return null
    return webgl.gl.getUniform(this.program, this.uniforms[name].location!)
  }

  /**
   * 数値uniformに加算する
   */
  addUniformValue(name: string, value: number) {
    const origin = this.getUniformValue(name)
    if (typeof origin === 'number') {
      this.setUniform(name, origin + value)
    }
  }

  // =====================================================
  // render

  render() {
    this.enableBuffer()
  }

  // =====================================================
  // dispose

  private deleteProgram() {
    webgl.gl.deleteProgram(this.program)
  }

  private deleteVBO() {
    Object.values(this.vbo).forEach((vbo) => webgl.gl.deleteBuffer(vbo))
  }

  private deleteIBO() {
    this.ibo && webgl.gl.deleteBuffer(this.ibo)
  }

  dispose() {
    this.deleteProgram()
    this.deleteVBO()
    this.deleteIBO()
  }
}
