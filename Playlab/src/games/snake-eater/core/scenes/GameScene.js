import Phaser from 'phaser'
import Snake from '../../entities/Snake'
import Apple from '../../entities/Apple'
import KeyboardController from '../../controllers/KeyboardController'
import VoiceController from '../../controllers/VoiceController'
import GestureController from '../../controllers/GestureController'
import ScoreService from '../../services/ScoreService'
import { GRID_SIZE, GRID_COLS, GRID_ROWS } from '../../utils/constants'
import SnakeRenderer from '../../entities/SnakeRenderer'

// Impotacion de assets
import appleNormalSprite from '../../assets/apples/apple_regular.png'
import appleGoldSprite from '../../assets/apples/apple_golden.png'
import appleRottenSprite from '../../assets/apples/apple_rotten.png'
import snakeSpriteSheet from '../../assets/snake/Snake.png'
import backgroundImage from '../../assets/background/background.jpg'
import eatSound from '../../assets/sounds/bite.wav'
import yuckSound from '../../assets/sounds/yuck.wav'
import punchesSound from '../../assets/sounds/punches.wav'
import backgroundkMusic from '../../assets/sounds/background_music.mp3'
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    this.load.spritesheet('snake', snakeSpriteSheet, {
      frameWidth: 16,
      frameHeight: 16,
    })

    this.load.image('apple_normal', appleNormalSprite)
    this.load.image('apple_gold', appleGoldSprite)
    this.load.image('apple_rotten', appleRottenSprite)
    this.load.image('background', backgroundImage)
    this.load.audio('eat', eatSound)
    this.load.audio('yuck', yuckSound)
    this.load.audio('punches', punchesSound)
    this.load.audio('background_music', backgroundkMusic)
  }

  init(data) {
    this.controllerType = data.controllerType || 'keyboard'
    window.dispatchEvent(new Event('snake-game-reset'))
  }

  create() {
    this.add
      .image(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'background')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(this.sys.game.canvas.width, this.sys.game.canvas.height)

    this.gridSize = GRID_SIZE
    this.columns = GRID_COLS
    this.rows = GRID_ROWS
    this.soundEat = this.sound.add('eat', { volume: 0.5 })
    this.soundYuck = this.sound.add('yuck', { volume: 1 })
    this.soundPunches = this.sound.add('punches', { volume: 0.5 })
    this.backgroundMusic = this.sound.add('background_music', { volume: 0.3 })
    this.backgroundMusic.play({ loop: true })
    this.snake = new Snake(5, 5)
    this.snakeRenderer = new SnakeRenderer(this, this.snake, this.gridSize)

    this.setupController()

    this.spawnApple('normal')
    ScoreService.reset()

    this.tickTime = 150
    this.lastTick = 0
    this.graphics = this.add.graphics()

    window.addEventListener('snake-restart-game', this.handleRestart)
  }

  update(time) {
    this.controller?.update()
    if (time - this.lastTick > this.tickTime) {
      this.lastTick = time
      const dir = this.controller?.getDirection()
      if (dir) this.snake.setDirection(dir)
      this.snake.step()
      this.snakeRenderer.update()

      const collisionType = this.checkCollisions()

      if (collisionType === 'wall' || collisionType === 'self' || collisionType === 'rotten') {
        this.gameOver()
        return
      }

      this.render()
    }
  }

  setupController() {
    // Destruye el controlador previo si existe
    if (this.controller?.destroy) this.controller.destroy()
    console.log('Controlador recibido en GameScene:', this.controllerType)
    switch (this.controllerType) {
      case 'keyboard':
        this.controller = new KeyboardController()
        break

      case 'voice':
        this.controller = new VoiceController()
        break
      // TODO: probar controlador de voz con otros modelos
      case 'gesture':
        this.controller = new GestureController()
        break

      default:
        this.controller = new KeyboardController()
    }

    this.controller.init(this)
  }

  checkCollisions() {
    const head = this.snake.headPosition()

    // colision con muros
    if (head.x < 0 || head.x >= this.columns || head.y < 0 || head.y >= this.rows) {
      this.soundPunches.play()
      return 'wall'
    }

    // colision con manzanas
    if (head.x === this.apple.x && head.y === this.apple.y) {
      return this.handleAppleCollision()
    }

    // colision consigo misma
    if (this.snake.checkSelfCollision()) {
      this.soundPunches.play()
      return 'self'
    }

    // expiracion de manzanas
    if (this.apple.isExpired()) {
      this.spawnApple()
    }

    return null // sin colisiones relevantes
  }

  handleAppleCollision() {
    const type = this.apple.type

    switch (type) {
      case 'normal':
        this.soundEat.play()
        ScoreService.add(100)
        this.snake.grow(1)
        this.spawnApple()
        break

      case 'gold':
        this.soundEat.play()
        ScoreService.add(500)
        this.spawnApple()
        break

      case 'rotten':
        this.soundYuck.play()
        return 'rotten' // derrota inmediata
    }

    return 'apple'
  }

  spawnApple(forcedType = null) {
    if (this.appleSprite) this.appleSprite.destroy()

    const rand = Math.random()
    let type = 'normal'
    if (forcedType) type = forcedType
    else if (rand < 0.15) type = 'gold'
    else if (rand < 0.25) type = 'rotten'

    const x = Phaser.Math.Between(0, this.columns - 1)
    const y = Phaser.Math.Between(0, this.rows - 1)
    const ttl = type === 'gold' ? 3000 : type === 'rotten' ? 5000 : null
    this.apple = new Apple(x, y, type, ttl)

    const spriteKey = `apple_${type}`
    const size = this.gridSize
    this.appleSprite = this.add.image(x * size + size / 2, y * size + size / 2, spriteKey)
    this.appleSprite.setDisplaySize(size, size)
  }

  handleRestart = () => {
    this.scene.restart({ controllerType: this.controllerType })
  }

  gameOver() {
    this.controller?.destroy()
    this.scene.pause()
    this.backgroundMusic.stop()

    window.dispatchEvent(new Event('snake-game-over'))
  }

  shutdown() {
    window.removeEventListener('snake-restart-game', this.handleRestart)
  }

  render() {
    const size = this.gridSize
    this.graphics.clear()

    // carga el sprite de la manzana
    if (this.appleSprite) {
      this.appleSprite.setPosition(this.apple.x * size + size / 2, this.apple.y * size + size / 2)
    }
  }
}
