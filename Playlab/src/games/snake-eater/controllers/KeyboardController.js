import IController from './IController'

export default class KeyboardController extends IController {
  constructor() {
    super()
    this.currentDirection = null
    this.keyListener = null
  }

  init(scene) {
    this.scene = scene

    // Escuchar eventos de teclado inmediatamente
    this.keyListener = scene.input.keyboard.on('keydown', (event) => {
      switch (event.code) {
        case 'ArrowUp':
          if (this.currentDirection !== 'down') this.currentDirection = 'up'
          break
        case 'ArrowDown':
          if (this.currentDirection !== 'up') this.currentDirection = 'down'
          break
        case 'ArrowLeft':
          if (this.currentDirection !== 'right') this.currentDirection = 'left'
          break
        case 'ArrowRight':
          if (this.currentDirection !== 'left') this.currentDirection = 'right'
          break
      }
    })
  }

  update() {}

  getDirection() {
    // Devuelve la última dirección presionada
    return this.currentDirection
  }

  destroy() {
    // Limpia el listener para evitar fugas de memoria
    if (this.keyListener) {
      this.scene.input.keyboard.off('keydown', this.keyListener)
    }
  }
}
