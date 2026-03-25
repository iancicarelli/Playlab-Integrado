<template>
  <div class="ufo-game">
    <div id="webcam-container" ref="webcamContainer" v-if="controllerType === 'gesture'">
      <video ref="videoElement" class="input_video" playsinline style="display: none"></video>
      <canvas ref="canvasElement" class="output_canvas" width="320" height="240"></canvas>
    </div>
    <div id="label-container" ref="labelContainer" v-if="controllerType === 'gesture'"></div>
    <div id="p5-container" ref="p5Container"></div>
    <button
      v-if="!gameStarted && modelLoaded"
      @click="startGame"
      class="start-button"
      :style="startButtonStyle"
    >
      ¡Iniciar!
    </button>
    <button v-if="gameOver" @click="restartGame" class="restart-button">¡REINICIAR!</button>
    <router-link to="/" class="back-button">MENÚ</router-link>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { api, GAME_IDS } from '@/services/api'

export default {
  name: 'UfoEvader',
  setup() {
    const route = useRoute()
    const controllerType = ref(route.query.controller || 'keyboard')

    const webcamContainer = ref(null)
    const labelContainer = ref(null)
    const p5Container = ref(null)
    const videoElement = ref(null)
    const canvasElement = ref(null)

    const gameStarted = ref(false)
    const gameOver = ref(false)
    const modelLoaded = ref(false)
    const score = ref(0)
    const bestScore = ref(0)

    const startButtonStyle = ref({
      position: 'absolute',
      left: '50%',
      top: '75%',
      transform: 'translate(-50%, -50%)',
      fontSize: '24px',
      padding: '15px 30px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
      zIndex: 200,
    })

    const submitScore = async (finalScore) => {
      if (api.isAuthenticated()) {
        try {
          await api.postScore(GAME_IDS.UFO_EVADER, finalScore)
          console.log('Score submitted successfully')
        } catch (error) {
          console.error('Error submitting score:', error)
        }
      }
    }

    let p5Instance = null
    let ufo = null
    let asteroids = []
    let stars = []
    let spawnCounter = 0
    let controlState = 'idle'

    // MediaPipe variables
    let hands = null
    let camera = null
    let canvasCtx = null

    // Voice control variables
    let audioContext = null
    let analyser = null
    let microphone = null
    let dataArray = null

    let ufoSprites = {
      happy: null,
      squinting: null,
    }
    let asteroidSprite = null

    class UFO {
      constructor(p) {
        this.p = p
        this.x = p.width * 0.2
        this.y = p.height / 2
        this.radius = 35
        this.velocity = 0
        this.gravity = 0.55
        this.thrust = 0.9
        this.maxVelocity = 12
      }

      applyThrust() {
        this.velocity -= this.thrust
      }

      update(bounds) {
        this.velocity += this.gravity
        this.velocity = this.p.constrain(this.velocity, -this.maxVelocity, this.maxVelocity)
        this.y += this.velocity

        if (this.y < bounds.top + this.radius) {
          this.y = bounds.top + this.radius
          this.velocity = 0
        }
        if (this.y > bounds.bottom - this.radius) {
          this.y = bounds.bottom - this.radius
          this.velocity = 0
        }
      }

      hits(asteroid) {
        const { top, bottom, left, right } = asteroid.getBounds()
        const nearestX = Math.max(left, Math.min(this.x, right))
        const nearestY = Math.max(top, Math.min(this.y, bottom))
        const dx = this.x - nearestX
        const dy = this.y - nearestY
        return dx * dx + dy * dy < this.radius * this.radius
      }

      show(p, sprite) {
        p.push()
        p.translate(this.x, this.y)
        if (sprite) {
          p.imageMode(p.CENTER)
          const scaleX = this.radius * 2.2
          const scaleY = this.radius * 1.8
          p.image(sprite, 0, 0, scaleX, scaleY)
        } else {
          p.noStroke()
          p.fill(180, 220, 255)
          p.ellipse(0, -12, this.radius, this.radius * 0.7)
          p.fill(120, 200, 255)
          p.ellipse(0, 0, this.radius * 1.8, this.radius)
          p.fill(90, 120, 160)
          p.ellipse(0, 10, this.radius * 1.5, this.radius * 0.4)
        }
        p.pop()
      }
    }

    class Asteroid {
      constructor(p, difficulty) {
        this.p = p
        const baseRadius = p.map(difficulty, 0, 1, 120, 220)
        this.radius = baseRadius * p.random(0.95, 1.15)
        this.hitRadius = this.radius * 0.45
        this.x = p.width + this.radius
        const verticalMargin = p.map(difficulty, 0, 1, 20, 10)
        this.y = p.random(this.radius + verticalMargin, p.height - this.radius - verticalMargin)
        this.speed = p.map(difficulty, 0, 1, 3.2, 6.5)
        this.angle = p.random(p.TWO_PI)
        this.spin = p.random(-0.04, 0.04)
        this.passed = false
      }

      update() {
        this.x -= this.speed
        this.angle += this.spin
      }

      offscreen() {
        return this.x < -this.radius
      }

      hits(ufo) {
        const dx = ufo.x - this.x
        const dy = ufo.y - this.y
        const combinedRadius = this.hitRadius + ufo.radius * 0.55
        return dx * dx + dy * dy < combinedRadius * combinedRadius
      }

      show(p) {
        p.push()
        p.translate(this.x, this.y)
        p.rotate(this.angle)
        const size = this.radius * 2
        if (asteroidSprite) {
          p.imageMode(p.CENTER)
          p.image(asteroidSprite, 0, 0, size, size)
        } else {
          p.noStroke()
          p.fill(140)
          p.circle(0, 0, size)
        }
        p.pop()
      }
    }

    // Removed loadMediaPipeLibraries as we are using npm imports

    const isHandOpen = (landmarks) => {
      // Simple heuristic: Check if finger tips are above PIP joints (assuming hand is upright)
      // Landmarks: 8 (Index Tip), 6 (Index PIP)
      // 12 (Middle Tip), 10 (Middle PIP)
      // 16 (Ring Tip), 14 (Ring PIP)
      // 20 (Pinky Tip), 18 (Pinky PIP)

      // Note: Y coordinates increase downwards in MediaPipe (0 is top, 1 is bottom)
      // So "above" means y is smaller.

      const fingers = [
        { tip: 8, pip: 6 },
        { tip: 12, pip: 10 },
        { tip: 16, pip: 14 },
        { tip: 20, pip: 18 },
      ]

      let extendedCount = 0
      for (const f of fingers) {
        if (landmarks[f.tip].y < landmarks[f.pip].y) {
          extendedCount++
        }
      }

      // If at least 3 fingers are extended, it's open.
      return extendedCount >= 3
    }

    const onResults = (results) => {
      if (!canvasElement.value) return

      canvasCtx.save()
      canvasCtx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height)
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.value.width,
        canvasElement.value.height,
      )

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 5,
          })
          drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 })

          // Check for open hand
          if (isHandOpen(landmarks)) {
            controlState = 'open'
            if (labelContainer.value) {
              labelContainer.value.innerHTML =
                '<span style="color: #00FF00; font-weight: bold;">MANO ABIERTA (SUBIR)</span>'
            }
          } else {
            controlState = 'idle'
            if (labelContainer.value) {
              labelContainer.value.innerHTML =
                '<span style="color: white;">MANO CERRADA (BAJAR)</span>'
            }
          }
        }
      } else {
        controlState = 'idle'
        if (labelContainer.value) {
          labelContainer.value.innerHTML = '<span style="color: gray;">NO SE DETECTA MANO</span>'
        }
      }
      canvasCtx.restore()
    }

    const initVoiceControl = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        analyser = audioContext.createAnalyser()
        microphone = audioContext.createMediaStreamSource(stream)
        microphone.connect(analyser)
        analyser.fftSize = 256
        const bufferLength = analyser.frequencyBinCount
        dataArray = new Uint8Array(bufferLength)
        modelLoaded.value = true
      } catch (err) {
        console.error('Error accessing microphone', err)
        alert('Microphone access denied. Switching to keyboard.')
        controllerType.value = 'keyboard'
        modelLoaded.value = true
      }
    }

    const initKeyboardControl = () => {
      modelLoaded.value = true
    }

    const initMediaPipe = async () => {
      console.log('Initializing MediaPipe...')
      try {
        hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          },
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        hands.onResults(onResults)

        if (videoElement.value && canvasElement.value) {
          console.log('Video and Canvas elements found. Starting camera...')
          canvasCtx = canvasElement.value.getContext('2d')
          camera = new Camera(videoElement.value, {
            onFrame: async () => {
              await hands.send({ image: videoElement.value })
            },
            width: 320,
            height: 240,
          })
          await camera.start()
          console.log('Camera started.')
        } else {
          console.error('Video or Canvas element not found in DOM.')
        }

        modelLoaded.value = true
      } catch (error) {
        console.error('Error initializing MediaPipe:', error)
        alert('Error initializing camera controls. Please use keyboard.')
        modelLoaded.value = true
      }
    }

    const createStars = (p) => {
      stars = []
      const total = Math.floor((p.width * p.height) / 12000)
      for (let i = 0; i < total; i++) {
        stars.push({
          x: p.random(p.width),
          y: p.random(p.height),
          radius: p.random(1.5, 3.5),
          speed: p.random(0.5, 2),
        })
      }
    }

    const updateStars = (p) => {
      p.push()
      p.noStroke()
      stars.forEach((star) => {
        star.x -= star.speed
        if (star.x < 0) {
          star.x = p.width
          star.y = p.random(p.height)
        }
        const alpha = p.map(star.speed, 0.5, 2, 120, 220)
        p.fill(255, 255, 255, alpha)
        p.circle(star.x, star.y, star.radius)
      })
      p.pop()
    }

    const sketch = (p) => {
      p.preload = () => {
        ufoSprites.happy = p.loadImage('/images/ufo-happy.png')
        ufoSprites.squinting = p.loadImage('/images/ufo-squinting.png')
        asteroidSprite = p.loadImage('/images/asteroid.png')
      }

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        p.frameRate(60)
        ufo = new UFO(p)
        asteroids = []
        createStars(p)
      }

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
        createStars(p)
        if (ufo) {
          ufo.y = p.constrain(ufo.y, 120, p.height - 120)
        }
      }

      p.draw = () => {
        p.clear()
        p.background(10, 12, 28)
        updateStars(p)

        if (!gameStarted.value) {
          drawIntroScreen(p)
          return
        }

        if (gameOver.value) {
          drawGameOver(p)
          return
        }

        drawHUD(p)

        // Input handling
        if (controllerType.value === 'voice' && analyser) {
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const average = sum / dataArray.length
          if (average > 20) {
            controlState = 'open'
          } else {
            controlState = 'idle'
          }
        } else if (controllerType.value === 'keyboard') {
          if (p.keyIsDown(32) || p.keyIsDown(p.UP_ARROW)) {
            controlState = 'open'
          } else {
            controlState = 'idle'
          }
        }

        if (controlState === 'open') {
          ufo.applyThrust()
        }

        ufo.update({ top: 0, bottom: p.height })
        ufo.show(p, ufoSprites.happy)

        handleAsteroids(p)

        if (ufo.y <= ufo.radius || ufo.y >= p.height - ufo.radius) {
          endGame()
        }
      }

      const drawHUD = (p) => {
        p.push()
        p.fill(255)
        p.textAlign(p.LEFT, p.TOP)
        p.textSize(24)
        p.text(`Score: ${score.value}`, 20, 20)
        p.text(`Mejor: ${bestScore.value}`, 20, 50)
        p.pop()
      }

      const drawIntroScreen = (p) => {
        drawHUD(p)
        let instructions = []

        if (controllerType.value === 'gesture') {
          instructions = [
            '¡Bienvenido/a a UFO Evader!',
            'Mantén la mano abierta para impulsar la nave hacia arriba.',
            'Relaja la mano para que la nave descienda.',
            'Evita los asteroides que se acercan y supera tu mejor puntuación.',
          ]
        } else if (controllerType.value === 'voice') {
          instructions = [
            '¡Bienvenido/a a UFO Evader!',
            '¡Haz ruido (aaaaah) para impulsar la nave hacia arriba!',
            'Guarda silencio para que la nave descienda.',
            'Evita los asteroides que se acercan y supera tu mejor puntuación.',
          ]
        } else {
          instructions = [
            '¡Bienvenido/a a UFO Evader!',
            'Mantén ESPACIO o FLECHA ARRIBA para subir.',
            'Suelta para descender.',
            'Evita los asteroides que se acercan y supera tu mejor puntuación.',
          ]
        }

        p.push()
        p.fill(255)
        p.textAlign(p.CENTER, p.CENTER)
        p.textSize(30)
        instructions.forEach((line, idx) => {
          p.text(line, p.width / 2, p.height / 2 - 120 + idx * 45)
        })
        p.pop()

        if (ufo) {
          ufo.show(p, ufoSprites.happy)
        }
      }

      const drawGameOver = (p) => {
        drawHUD(p)

        asteroids.forEach((asteroid) => asteroid.show(p))

        p.push()
        p.noStroke()
        p.fill(0, 0, 0, 160)
        p.rect(0, 0, p.width, p.height)
        p.pop()

        if (ufo) {
          ufo.show(p, ufoSprites.squinting)
        }

        p.push()
        p.fill(255, 100, 100)
        p.textAlign(p.CENTER, p.CENTER)
        p.textSize(48)
        p.text('GAME OVER', p.width / 2, p.height / 2 - 40)
        p.textSize(24)
        p.fill(255)
        p.text(
          'Pulsa "Reiniciar" o la tecla R para intentarlo de nuevo.',
          p.width / 2,
          p.height / 2 + 20,
        )
        p.pop()
      }

      const handleAsteroids = (p) => {
        spawnCounter++
        const difficulty = p.constrain(score.value / 25, 0, 1)
        const spawnInterval = Math.floor(p.map(difficulty, 0, 1, 140, 70))

        if (spawnCounter >= spawnInterval) {
          asteroids.push(new Asteroid(p, difficulty))
          spawnCounter = 0
        }

        for (let i = asteroids.length - 1; i >= 0; i--) {
          const asteroid = asteroids[i]
          asteroid.update()
          asteroid.show(p)

          if (!asteroid.passed && asteroid.x + asteroid.hitRadius < ufo.x - ufo.radius * 0.3) {
            asteroid.passed = true
            score.value++
            bestScore.value = Math.max(bestScore.value, score.value)
          }

          if (!gameOver.value && asteroid.hits(ufo)) {
            endGame()
            break
          }

          if (asteroid.offscreen()) {
            asteroids.splice(i, 1)
          }
        }
      }

      const endGame = () => {
        if (!gameOver.value) {
          gameOver.value = true
          submitScore(score.value)
          controlState = 'idle'
          if (labelContainer.value) {
            const gameOverDiv = document.createElement('div')
            gameOverDiv.style.color = 'red'
            gameOverDiv.style.fontWeight = 'bold'
            gameOverDiv.innerHTML = 'GAME OVER'
            labelContainer.value.appendChild(gameOverDiv)
          }
        }
      }

      p.keyPressed = () => {
        if (p.key === ' ' || p.keyCode === p.UP_ARROW) {
          if (gameStarted.value && !gameOver.value) {
            ufo.applyThrust()
          }
        }

        if (p.key === 'r' || p.key === 'R') {
          if (gameOver.value) {
            restartGame()
          }
        }
      }
    }

    const startGame = () => {
      gameStarted.value = true
      gameOver.value = false
      score.value = 0
      controlState = 'idle'
      asteroids = []
      spawnCounter = 0
      if (p5Instance) {
        ufo = new UFO(p5Instance)
      }
      if (labelContainer.value) {
        labelContainer.value.innerHTML = ''
      }
    }

    const restartGame = () => {
      gameOver.value = false
      gameStarted.value = true
      score.value = 0
      controlState = 'idle'
      asteroids = []
      spawnCounter = 0
      if (p5Instance) {
        ufo = new UFO(p5Instance)
      }

      if (labelContainer.value) {
        labelContainer.value.innerHTML = ''
      }
    }

    onMounted(async () => {
      await loadP5()
      p5Instance = new window.p5(sketch, p5Container.value)

      if (controllerType.value === 'gesture') {
        await initMediaPipe()
      } else if (controllerType.value === 'voice') {
        await initVoiceControl()
      } else {
        initKeyboardControl()
      }
    })

    onUnmounted(() => {
      if (p5Instance) {
        p5Instance.remove()
      }
      if (camera) {
        camera.stop()
      }
      if (hands) {
        hands.close()
      }
      if (audioContext) {
        audioContext.close()
      }
    })

    const loadP5 = async () => {
      const loadScript = (src, globalReady) => {
        return new Promise((resolve, reject) => {
          if (globalReady()) {
            resolve()
            return
          }

          const existing = document.querySelector(`script[src="${src}"]`)
          if (existing) {
            if (globalReady()) {
              resolve()
              return
            }
            existing.addEventListener(
              'load',
              () => {
                if (globalReady()) {
                  resolve()
                }
              },
              { once: true },
            )
            existing.addEventListener(
              'error',
              () => reject(new Error(`No se pudo cargar el script: ${src}`)),
              { once: true },
            )
            return
          }

          const script = document.createElement('script')
          script.src = src
          script.async = false
          script.onload = () => {
            if (globalReady()) {
              resolve()
            } else {
              reject(new Error(`El script se cargó pero la librería no está disponible: ${src}`))
            }
          }
          script.onerror = () => reject(new Error(`No se pudo cargar el script: ${src}`))
          document.head.appendChild(script)
        })
      }

      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.js',
        () => !!window.p5,
      )

      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js',
        () => !!(window.p5 && window.p5.Element),
      )
    }

    return {
      webcamContainer,
      labelContainer,
      p5Container,
      videoElement,
      canvasElement,
      controllerType,
      gameStarted,
      gameOver,
      modelLoaded,
      score,
      bestScore,
      startButtonStyle,
      startGame,
      restartGame,
    }
  },
}
</script>

<style scoped>
.ufo-game {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#webcam-container {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 240px;
  height: 180px;
  border: 3px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow: hidden;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.output_canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#label-container {
  position: fixed;
  top: 230px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 5px;
  font-family: Arial, sans-serif;
  z-index: 100;
}

.restart-button {
  position: absolute;
  top: 200px;
  left: 20px;
  font-size: 20px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 200;
}

.back-button {
  position: absolute;
  top: 100px;
  left: 20px;
  font-size: 20px;
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 200;
  text-decoration: none;
}

.back-button:hover {
  background-color: #1976d2;
}

.restart-button:hover,
.start-button:hover {
  background-color: #45a049;
}

#p5-container {
  width: 100%;
  height: 100%;
}
</style>
