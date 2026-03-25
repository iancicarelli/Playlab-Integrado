<template>
  <div class="dino-game">
    <div v-if="controlType === 'gesture'" id="webcam-container" ref="webcamContainer">
      <video ref="videoElement" class="input_video" playsinline style="display: none"></video>
      <canvas ref="canvasElement" class="output_canvas" width="320" height="240"></canvas>
    </div>
    <div v-if="controlType === 'gesture'" id="label-container" ref="labelContainer"></div>
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
  name: 'DinoGestureRush',
  props: {
    control: {
      type: String,
      default: 'gesture',
    },
  },
  setup(props) {
    const route = useRoute()
    const controlType = route.query.control || props.control
    const webcamContainer = ref(null)
    const labelContainer = ref(null)
    const p5Container = ref(null)
    const videoElement = ref(null)
    const canvasElement = ref(null)

    const gameStarted = ref(false)
    const gameOver = ref(false)
    const modelLoaded = ref(false)
    const score = ref(0)

    let p5Instance = null
    let dino = null
    let obstacles = []
    let groundY = 0

    // MediaPipe variables
    let hands = null
    let camera = null
    let canvasCtx = null
    let lastHandState = 'closed' // 'open' or 'closed'

    let dinoImg,
      treeImg,
      bgImgs = {}

    const startButtonStyle = ref({
      position: 'absolute',
      left: '50%',
      top: '50%',
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

    class Dino {
      constructor(groundY) {
        this.r = 120
        this.x = 50
        this.groundY = groundY
        this.y = groundY - this.r
        this.vy = 0
        this.gravity = 2
        this.jumpCount = 0
      }

      jump() {
        if (this.y === this.groundY - this.r) {
          this.vy = -40
          this.jumpCount++
        }
      }

      update() {
        this.y += this.vy
        this.vy += this.gravity

        if (this.y > this.groundY - this.r) {
          this.y = this.groundY - this.r
          this.vy = 0
        }
      }

      show(p) {
        p.image(dinoImg, this.x, this.y, this.r, this.r)
      }
    }

    class Obstacle {
      constructor(groundY, p) {
        this.w = 70
        this.h = 120
        this.x = p.width
        this.groundY = groundY
        this.y = groundY - this.h
        this.speed = 7
        this.counted = false
      }

      update() {
        this.x -= this.speed
      }

      offscreen() {
        return this.x < -this.w
      }

      show(p) {
        p.image(treeImg, this.x, this.y, this.w, this.h)
      }

      hits(dino) {
        return (
          dino.x < this.x + this.w * 0.8 &&
          dino.x + dino.r * 0.8 > this.x &&
          dino.y < this.y + this.h &&
          dino.y + dino.r > this.y
        )
      }
    }

    const initModel = async () => {
      if (controlType === 'gesture') {
        await initMediaPipe()
        modelLoaded.value = true
      } else if (controlType === 'voice') {
        initVoiceControl()
        modelLoaded.value = true
      } else {
        modelLoaded.value = true
      }
    }

    const initMediaPipe = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        })

        if (videoElement.value) {
          videoElement.value.srcObject = stream
          await videoElement.value.play()
        }

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

        camera = new Camera(videoElement.value, {
          onFrame: async () => {
            if (hands && videoElement.value) {
              await hands.send({ image: videoElement.value })
            }
          },
          width: 320,
          height: 240,
        })

        camera.start()

        canvasCtx = canvasElement.value.getContext('2d')
      } catch (error) {
        console.error('Error initializing MediaPipe:', error)
        alert('Error initializing camera. Falling back to keyboard.')
      }
    }

    const onResults = (results) => {
      if (!canvasElement.value || !canvasCtx) return

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
        const landmarks = results.multiHandLandmarks[0]
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 })
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 })

        const open = isHandOpen(landmarks)

        // Logic: Open hand makes character jump once.
        // If hand transitions from closed to open, jump.
        if (open && lastHandState === 'closed') {
          if (dino && gameStarted.value && !gameOver.value) {
            dino.jump()
          }
        }

        lastHandState = open ? 'open' : 'closed'

        // Update label
        if (labelContainer.value) {
          labelContainer.value.innerHTML = open ? 'JUMP!' : 'Wait...'
          labelContainer.value.style.color = open ? '#00FF00' : 'white'
          labelContainer.value.style.fontSize = '24px'
          labelContainer.value.style.fontWeight = 'bold'
        }
      }
      canvasCtx.restore()
    }

    const isHandOpen = (landmarks) => {
      // Simple heuristic: Check if finger tips are above PIP joints (assuming hand is upright)
      // Landmarks: 8 (Index Tip), 6 (Index PIP)
      // 12 (Middle Tip), 10 (Middle PIP)
      // 16 (Ring Tip), 14 (Ring PIP)
      // 20 (Pinky Tip), 18 (Pinky PIP)

      // Note: Y coordinates increase downwards in canvas/image
      // So "above" means y is smaller

      const tips = [8, 12, 16, 20]
      const pips = [6, 10, 14, 18]

      let openFingers = 0
      for (let i = 0; i < tips.length; i++) {
        if (landmarks[tips[i]].y < landmarks[pips[i]].y) {
          openFingers++
        }
      }

      // Thumb is tricky, let's just use the 4 fingers for now or check x distance
      // For simplicity, if 3 or more fingers are extended, it's open
      return openFingers >= 3
    }

    const initVoiceControl = () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const audioContext = new AudioContext()
          const analyser = audioContext.createAnalyser()
          const microphone = audioContext.createMediaStreamSource(stream)
          const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1)

          analyser.smoothingTimeConstant = 0.8
          analyser.fftSize = 1024

          microphone.connect(analyser)
          analyser.connect(scriptProcessor)
          scriptProcessor.connect(audioContext.destination)

          scriptProcessor.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(array)
            const average = array.reduce((a, b) => a + b, 0) / array.length

            if (average > 30) {
              // Threshold for detecting voice
              if (dino && gameStarted.value && !gameOver.value) {
                dino.jump()
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error)
          alert(
            'Error accessing microphone. The game will work with keyboard controls (spacebar to jump).',
          )
        })
    }

    const submitScore = async (finalScore) => {
      if (api.isAuthenticated()) {
        try {
          await api.postScore(GAME_IDS.DINO_RUSH, finalScore)
          console.log('Score submitted successfully')
        } catch (error) {
          console.error('Error submitting score:', error)
        }
      }
    }

    const sketch = (p) => {
      p.preload = () => {
        dinoImg = p.loadImage('/images/dino.png')
        treeImg = p.loadImage('/images/tree.png')
        bgImgs.normal = p.loadImage('/images/dino-background.png')
        bgImgs.gameOver = p.loadImage('/images/dino-background2.png')
      }

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        groundY = p.height - 100
        dino = new Dino(groundY)
        obstacles.push(new Obstacle(groundY, p))
      }

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
        groundY = p.height - 100
      }

      p.draw = () => {
        p.clear()

        if (!gameStarted.value) {
          p.image(bgImgs.normal, 0, 0, p.width, p.height)
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(28)
          p.fill(255)
          p.stroke(0)
          p.strokeWeight(3)
          p.text(
            '¡Bienvenido/a a tu aventura en Dino Gesture Rush!',
            p.width / 2,
            p.height / 2 - 100,
          )
          p.noStroke()
          return
        }

        if (gameOver.value) {
          p.image(bgImgs.gameOver, 0, 0, p.width, p.height)
        } else {
          p.image(bgImgs.normal, 0, 0, p.width, p.height)
        }

        p.push()
        p.fill(0)
        p.textSize(24)
        p.textAlign(p.LEFT, p.TOP)
        p.text(`Score: ${score.value}`, 20, 20)
        p.pop()

        if (!gameOver.value) {
          dino.update()
          dino.show(p)

          if (p.frameCount % 90 === 0) {
            obstacles.push(new Obstacle(groundY, p))
          }

          for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update()
            obstacles[i].show(p)

            if (!obstacles[i].counted && obstacles[i].x + obstacles[i].w < dino.x) {
              obstacles[i].counted = true
              score.value++
            }

            if (obstacles[i].hits(dino)) {
              gameOver.value = true
              submitScore(score.value)
              if (labelContainer.value) {
                const gameOverDiv = document.createElement('div')
                gameOverDiv.style.color = 'red'
                gameOverDiv.style.fontWeight = 'bold'
                gameOverDiv.innerHTML = 'GAME OVER'
                labelContainer.value.appendChild(gameOverDiv)
              }
            }

            if (obstacles[i].offscreen()) {
              obstacles.splice(i, 1)
            }
          }
        } else {
          // dino.show(p)
          // obstacles.forEach((o) => o.show(p))
        }

        // p.stroke(0)
        // p.line(0, groundY, p.width, groundY)
      }

      p.keyPressed = () => {
        if (p.key === ' ' || p.keyCode === p.UP_ARROW) {
          if (gameStarted.value && !gameOver.value) {
            dino.jump()
          }
        }
      }
    }

    const startGame = () => {
      gameStarted.value = true
      score.value = 0
      obstacles = []
      if (dino) {
        dino = new Dino(groundY)
      }
    }

    const restartGame = () => {
      gameOver.value = false
      gameStarted.value = true
      obstacles = []
      dino = new Dino(groundY)
      score.value = 0

      if (labelContainer.value) {
        labelContainer.value.innerHTML = ''
      }
    }

    onMounted(async () => {
      await loadP5()

      p5Instance = new window.p5(sketch, p5Container.value)

      await initModel()
    })

    onUnmounted(() => {
      if (p5Instance) {
        p5Instance.remove()
      }
      if (camera) {
        // camera.stop() // Camera utils might not have stop, but we can stop the stream
      }
      if (videoElement.value && videoElement.value.srcObject) {
        const tracks = videoElement.value.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }
      if (hands) {
        hands.close()
      }
    })

    const loadP5 = () => {
      return new Promise((resolve) => {
        if (window.p5) {
          resolve()
          return
        }

        const scripts = [
          'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js',
          'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.dom.min.js',
        ]

        let loadedScripts = 0

        scripts.forEach((src) => {
          const script = document.createElement('script')
          script.src = src
          script.onload = () => {
            loadedScripts++
            if (loadedScripts === scripts.length) {
              resolve()
            }
          }
          document.head.appendChild(script)
        })
      })
    }

    return {
      webcamContainer,
      labelContainer,
      p5Container,
      gameStarted,
      gameOver,
      modelLoaded,
      score,
      startButtonStyle,
      startGame,
      restartGame,
      controlType,
      videoElement,
      canvasElement,
    }
  },
}
</script>

<style scoped>
.dino-game {
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
  top: 120px;
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
  top: 60px;
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
