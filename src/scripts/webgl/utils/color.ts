export type RGBA = [number, number, number, number]
export type HEX = `#${string}`

/**
 * hexカラーコードを数値変換する
 * @param hex #f1a, #ff11aa
 * @param normalize 0-1に正規化するかどうか
 * @returns
 */
export function hexToRgb(hex: HEX, normalize: boolean = true) {
  if (!hex.startsWith('#')) return

  let len = hex.length === 7 ? 2 : hex.length === 4 ? 1 : undefined
  if (!len) return

  const result = new RegExp(`^#?([a-f\\d]{${len}})([a-f\\d]{${len}})([a-f\\d]{${len}})$`, 'i').exec(hex)
  if (!result) return

  const norm = normalize ? (len === 2 ? 255 : 15) : 1
  return {
    r: parseInt(result[1], 16) / norm,
    g: parseInt(result[2], 16) / norm,
    b: parseInt(result[3], 16) / norm,
  }
}
