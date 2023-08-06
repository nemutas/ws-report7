function get2n(size: number) {
  let s = 2048
  if (size < 128) s = 128
  else if (size < 256) s = 256
  else if (size < 512) s = 512
  else if (size < 1024) s = 1024
  return s
}

export function convertTo2nImage(image: HTMLImageElement) {
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.canvas.width = get2n(image.width)
  ctx.canvas.height = get2n(image.height)
  ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height)
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  return data
}
