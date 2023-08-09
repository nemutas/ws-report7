type Callback = (e: any) => void

export class Events {
  private callbacks: { [key in string]: Callback } = {}

  private addEvent(name: string, callback: Callback) {
    this.callbacks[name] = callback
    window.addEventListener(name, callback)
  }

  set resize(callback: Callback) {
    this.addEvent('resize', callback)
  }

  set mousemove(callback: Callback) {
    this.addEvent('mousemove', callback)
  }

  set mousedown(callback: Callback) {
    this.addEvent('mousedown', callback)
  }

  set mouseup(callback: Callback) {
    this.addEvent('mouseup', callback)
  }

  set touchmove(callback: Callback) {
    this.addEvent('touchmove', callback)
  }

  set touchstart(callback: Callback) {
    this.addEvent('touchstart', callback)
  }

  set touchend(callback: Callback) {
    this.addEvent('touchend', callback)
  }

  remove() {
    Object.entries(this.callbacks).forEach(([name, callback]) => {
      window.removeEventListener(name, callback)
    })
  }
}
