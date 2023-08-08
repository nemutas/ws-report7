export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function lerp(x: number, y: number, t: number) {
  return x * (1.0 - t) + y * t
}
