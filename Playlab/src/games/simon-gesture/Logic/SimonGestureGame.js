import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api, GAME_IDS } from '@/services/api'

export default {
  name: 'SimonGestures',
  setup() {
    const router = useRouter()

    const webcamContainer = ref(null)
    const labelContainer = ref(null)
    const p5Container = ref(null)

    const gameStarted = ref(false)
    const gameOver = ref(false)
    const modelLoaded = ref(false)
    const score = ref(0)

    const submitScore = async (finalScore) => {
      if (api.isAuthenticated()) {
        try {
          await api.postScore(GAME_IDS.SIMON_GESTURE, finalScore)
          console.log('Score submitted successfully')
        } catch (error) {
          console.error('Error submitting score:', error)
        }
      }
    }

    let p5Instance = null
    let model = null
    let webcam = null
    let maxPredictions = 0
    let bgImgs = {}

    let sequence = []
    let playerSequence = []
    let currentStep = 0
    let showingSequence = false
    let waitingForInput = false
    let sequenceIndex = 0
    let displayMessage = ''
    let messageTimer = 0
    let turnNumber = 1
    let turnStartTime = 0
    let turnTimeLimit = 10000 // 10 segundos total.

    let stableGesture = 'no'
    let gestureFrameCounter = 0
    const FRAMES_TO_STABILIZE = 10 // 10 frames = ~150ms aprox

    let currentHeldGesture = 'no'
    let gestureHoldStartTime = 0

    let gestureHoldDuration = 3000
    let isHoldingGesture = false
    let holdProgress = 0
    let isHoldingCorrectGesture = false

    const URL = 'https://teachablemachine.withgoogle.com/models/JQgfg8yOL/'

    const gestureNames = [
      '✊', // 0
      '✋', // 1
      '✌️', // 2
      '👍', // 3
      '👎', // 4
      '👌', // 5
      '🤞', // 6
      '🤘', // 7
      '🤙', // 8
      '🤏', // 9
      '👈', // 10
      '👉', // 11
      '👆', // 12
      '👇', // 13
      '🙌', // 14
      '🙏', // 15
      '🤝', // 16
    ]

    // Etiquetas descriptivas para la visualización (en orden)
    const gestureLabels = [
      'Puño Levantado',
      'Palma Abierta',
      'Símbolo Paz',
      'Pulgar Arriba',
      'Pulgar Abajo',
      'Símbolo OK',
      'Dedos Cruzados',
      'Símbolo Rock',
      'Símbolo Surf',
      'Pellizcar',
      'Flecha Izquierda',
      'Flecha Derecha',
      'Flecha Arriba',
      'Flecha Abajo',
      'Manos en Alto',
      'Manos Juntas',
      'Apretón de Manos',
    ]

    const gestureEmojis = gestureNames

    const generateColors = (count) => {
      const colors = []
      const goldenRatioConjugate = 0.61803398875
      let h = Math.random()
      for (let i = 0; i < count; i++) {
        h = (h + goldenRatioConjugate) % 1

        const hue = h * 360
        const sat = 70 + Math.floor(Math.random() * 20)
        const light = 50 + Math.floor(Math.random() * 10)
        const c = p5Instance.color(hue, sat * 2.55, light * 2.55, 255)
        colors.push([p5Instance.red(c), p5Instance.green(c), p5Instance.blue(c)])
      }
      return colors
    }

    let gestureColors = []

    watch(gameOver, (isOver) => {
      if (isOver) {
        console.log(`Juego terminado. Puntaje: ${score.value}. Navegando...`)
        router.push({ name: 'SimonGameOver', query: { score: score.value } })
      }
    })

    const drawGestureHoldProgress = (p) => {
      if (!waitingForInput || currentStep >= sequence.length) return
      p.push()
      p.fill(255, 255, 255, 200)
      p.stroke(0)
      p.strokeWeight(2)
      p.textAlign(p.CENTER, p.CENTER)
      p.textSize(20)

      const barWidth = 300
      const barHeight = 20
      const barX = p.width / 2 - barWidth / 2
      const barY = p.height - 100

      p.pop()
      p.push()
      p.fill(100, 100, 100, 150)
      p.stroke(255)
      p.strokeWeight(2)
      p.rect(barX, barY, barWidth, barHeight, 5)

      const progressWidth = barWidth * holdProgress

      let progressColor = isHoldingCorrectGesture
        ? p.color(100, 255, 100)
        : currentHeldGesture !== 'no' && currentHeldGesture !== gestureNames[sequence[currentStep]]
          ? p.color(255, 100, 100)
          : p.color(255, 165, 0)

      p.fill(progressColor)
      p.noStroke()
      p.rect(barX, barY, progressWidth, barHeight, 5)

      p.fill(255)
      p.stroke(0)
      p.strokeWeight(1)
      p.textAlign(p.CENTER, p.CENTER)
      p.textSize(14)
      const progressPercent = Math.floor(holdProgress * 100)

      const totalElapsedTime = Date.now() - turnStartTime
      const totalRemainingTime = Math.max(0, turnTimeLimit - totalElapsedTime)
      const totalSeconds = (totalRemainingTime / 1000).toFixed(1)

      p.text(`Hold: ${progressPercent}%`, p.width / 2, barY + barHeight / 2)

      p.textSize(16)
      p.text(`Tiempo Total Restante: ${totalSeconds}s`, p.width / 2, barY - 30)
      p.pop()
    }

    const initModel = async () => {
      try {
        const modelURL = URL + 'model.json'
        const metadataURL = URL + 'metadata.json'
        await loadTensorFlowLibraries()

        model = await window.tmImage.load(modelURL, metadataURL)

        maxPredictions = model.getTotalClasses()

        const flip = true
        webcam = new window.tmImage.Webcam(200, 200, flip)
        await webcam.setup({ facingMode: 'user' })
        await webcam.play()
        webcamContainer.value.appendChild(webcam.canvas)

        for (let i = 0; i < maxPredictions; i++) {
          const div = document.createElement('div')
          labelContainer.value.appendChild(div)
        }
        modelLoaded.value = true
        predictLoop()
      } catch (error) {
        console.error('Error loading model:', error)

        console.warn(
          'Error loading AI model. The game will work with keyboard controls (only the first 4 gestures are mapped).',
        )
        modelLoaded.value = true
      }
    }

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = (err) => {
          console.error(`Error loading script: ${src}`, err)
          reject(err)
        }
        document.head.appendChild(script)
      })
    }

    const loadTensorFlowLibraries = async () => {
      if (window.tf && window.tmImage) {
        return
      }
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js')
        await loadScript(
          'https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js',
        )
      } catch (error) {
        console.error('Error cargando TensorFlow/TM:', error)
      }
    }

    const loadP5 = async () => {
      if (window.p5) {
        return
      }
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.js')
      } catch (error) {
        console.error('Error cargando P5:', error)
      }
    }

    const predictLoop = async () => {
      if (webcam && model) {
        webcam.update()
        await predict()
      }
      requestAnimationFrame(predictLoop)
    }

    const predict = async () => {
      if (!model || !webcam) return
      const prediction = await model.predict(webcam.canvas)
      let highestProb = 0
      let predictedGesture = 'no'
      let highestIndex = -1

      for (let i = 0; i < maxPredictions; i++) {
        const probability = prediction[i].probability
        if (labelContainer.value && labelContainer.value.childNodes[i]) {
          const labelElement = labelContainer.value.childNodes[i]
          labelElement.innerHTML = `${gestureEmojis[i]} - ${gestureLabels[i]}: ${(
            probability * 100
          ).toFixed(1)}%`
        }
        // Umbral de 0.7 para la detección estable
        if (probability > 0.7 && probability > highestProb) {
          highestProb = probability
          highestIndex = i // Guardamos el índice
        }
      }

      if (highestIndex !== -1) {
        predictedGesture = gestureNames[highestIndex]
      }

      if (waitingForInput) {
        handleGestureHold(predictedGesture)
      }
    }

    const handleGestureHold = (gesture) => {
      if (gesture === stableGesture) {
        gestureFrameCounter++
      } else {
        stableGesture = gesture
        gestureFrameCounter = 0
      }

      if (gestureFrameCounter < FRAMES_TO_STABILIZE) {
        return
      }

      const currentTime = Date.now()
      const expectedGestureIndex = sequence[currentStep]
      const expectedGestureName = gestureNames[expectedGestureIndex]
      const currentStableGesture = stableGesture
      if (currentStableGesture === 'no' || !gestureNames.includes(currentStableGesture)) {
        if (isHoldingGesture) {
          resetGestureHold()
          displayMessage = 'Intenta de nuevo...'
          messageTimer = 30
        }
        return
      }

      const isCurrentGestureCorrect = currentStableGesture === expectedGestureName

      if (!isHoldingGesture || currentHeldGesture !== currentStableGesture) {
        currentHeldGesture = currentStableGesture
        gestureHoldStartTime = currentTime
        isHoldingGesture = true
        isHoldingCorrectGesture = isCurrentGestureCorrect
        holdProgress = 0
      } else {
        const elapsedTime = currentTime - gestureHoldStartTime
        holdProgress = Math.min(elapsedTime / gestureHoldDuration, 1)

        if (elapsedTime >= gestureHoldDuration) {
          if (isHoldingCorrectGesture) {
            handleGestureSuccess()
          } else {
            handleIncorrectHold()
          }

          resetGestureHold()
        }
      }
    }

    const resetGestureHold = () => {
      isHoldingGesture = false
      currentHeldGesture = 'no'
      gestureHoldStartTime = 0
      holdProgress = 0
      isHoldingCorrectGesture = false
    }

    const handleGestureSuccess = () => {
      playerSequence.push(sequence[currentStep])
      currentStep++

      displayMessage = '¡Correcto!'
      messageTimer = 60

      if (currentStep >= sequence.length) {
        score.value++
        turnNumber++
        displayMessage = '¡Muy bien! Preparando siguiente...'
        messageTimer = 120
        waitingForInput = false

        setTimeout(() => {
          nextRound()
        }, 2000)
      } else {
        resetGestureHold()
        displayMessage = `Siguiente Gesto: ${gestureLabels[sequence[currentStep]]}`
        messageTimer = 90
      }
    }

    const handleIncorrectHold = () => {
      displayMessage = 'Gesto INCORRECTO. ¡Intenta de nuevo!'
      messageTimer = 90
    }

    const nextRound = () => {
      const requiredSequenceLength = turnNumber % 2 !== 0 ? 1 : 2
      sequence = []
      for (let i = 0; i < requiredSequenceLength; i++) {
        sequence.push(Math.floor(Math.random() * gestureNames.length))
      }

      playerSequence = []
      currentStep = 0
      sequenceIndex = 0
      showingSequence = true
      displayMessage = `Observa la secuencia (Turno ${turnNumber})...`
      messageTimer = 60
      resetGestureHold()
    }

    const sketch = (p) => {
      p.preload = () => {
        bgImgs.normal = p.loadImage('/images/simon-background.png')
        bgImgs.gameOver = p.loadImage('/images/SimonGameOver.png')
      }
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        p.frameRate(60)
        p.colorMode(p.HSB, 360, 100, 100, 255)
        gestureColors = generateColors(gestureNames.length)
      }
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
      }
      p.draw = () => {
        p.clear()
        if (!gameStarted.value) {
          if (bgImgs.normal) p.image(bgImgs.normal, 0, 0, p.width, p.height)
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(28)
          p.fill(255)
          p.stroke(0)
          p.strokeWeight(3)
          try {
            p.textFont('Permanent Marker')
          } catch {
            /* ignore font load issues */
          }
          p.text('¡Bienvenido/a a tu aventura en Simon Gestures!', p.width / 2, p.height / 2 - 100)
          p.noStroke()
          return
        }
        if (gameOver.value) {
          if (bgImgs.gameOver) p.image(bgImgs.gameOver, 0, 0, p.width, p.height)
        } else {
          if (bgImgs.normal) p.image(bgImgs.normal, 0, 0, p.width, p.height)
        }
        p.push()
        try {
          p.textFont('Permanent Marker')
        } catch {
          /* ignore font load issues */
        }
        p.fill(255)
        p.stroke(0)
        p.strokeWeight(2)
        p.textSize(32)
        p.textAlign(p.LEFT, p.TOP)

        p.text(`Puntaje: ${score.value}`, 20, 160)
        p.text(`Turno: ${turnNumber}`, 20, 200)
        p.pop()

        if (!gameOver.value) {
          if (showingSequence) {
            if (p.frameCount % 90 === 0) {
              if (sequenceIndex < sequence.length) {
                sequenceIndex++
              } else {
                showingSequence = false
                waitingForInput = true

                turnStartTime = Date.now()
                displayMessage = `Tu turno: ${gestureLabels[sequence[currentStep]]}`

                messageTimer = 180
                resetGestureHold()
              }
            }
          }

          if (waitingForInput) {
            if (Date.now() - turnStartTime > turnTimeLimit) {
              if (currentStep < sequence.length) {
                gameOver.value = true
                submitScore(score.value)
                waitingForInput = false
                displayMessage = '¡Tiempo agotado!'
              }
            }
          }

          drawGestureVisualization(p)
          if (waitingForInput) {
            drawGestureHoldProgress(p)
          }
        }
        if (messageTimer > 0) {
          p.push()
          try {
            p.textFont('Permanent Marker')
          } catch {
            /* ignore font load issues */
          }
          p.fill(255, 255, 255, Math.min(255, messageTimer * 4))
          p.stroke(0)
          p.strokeWeight(3)
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(40)
          p.text(displayMessage, p.width / 2, p.height / 2 + 180)
          p.pop()
          messageTimer--
        }
      }
      const drawGestureVisualization = (p) => {
        const centerX = p.width / 2
        const centerY = p.height / 2
        const emojiSize = 120
        let gestureToShow = -1

        if (showingSequence && sequenceIndex > 0) {
          gestureToShow = sequence[sequenceIndex - 1]
        } else if (waitingForInput && currentStep < sequence.length) {
          gestureToShow = sequence[currentStep]
        }

        if (gestureToShow !== -1) {
          const currentGesture = gestureToShow
          const color = gestureColors[currentGesture]

          p.push()
          p.stroke(255, 255, 0)
          p.strokeWeight(5)
          p.fill(p.color(color[0], color[1], color[2], 100))
          p.ellipse(centerX, centerY, emojiSize + 40, emojiSize + 40)
          p.pop()

          p.push()
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(emojiSize)
          p.fill(255)
          p.noStroke()
          p.text(gestureEmojis[currentGesture], centerX, centerY)
          p.pop()

          p.push()
          try {
            p.textFont('Permanent Marker')
          } catch {
            /* ignore font load issues */
          }
          p.fill(255)
          p.stroke(0)
          p.strokeWeight(2)
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(30)
          p.text(gestureLabels[currentGesture], centerX, centerY + 100)
          p.pop()
        }

        if (sequence.length > 0) {
          const startX = centerX - (sequence.length * 25) / 2
          const indicatorY = centerY - 150
          for (let i = 0; i < sequence.length; i++) {
            const x = startX + i * 30
            const color = gestureColors[sequence[i]]
            p.push()
            if (showingSequence && i < sequenceIndex) {
              p.fill(p.color(color[0], color[1], color[2]))
            } else if (waitingForInput && i < currentStep) {
              p.fill(100, 255, 100)
            } else if (waitingForInput && i === currentStep) {
              p.fill(255, 255, 100)
            } else {
              p.fill(100)
            }
            p.stroke(255)
            p.strokeWeight(2)
            p.ellipse(x, indicatorY, 20, 20)
            p.pop()
          }
        }
      }
      p.keyPressed = () => {
        if (gameStarted.value && !gameOver.value && waitingForInput) {
          let keyGesture = ''
          if (p.key === 'q' || p.key === 'Q') {
            keyGesture = gestureNames[0] // ✊
          } else if (p.key === 'w' || p.key === 'W') {
            keyGesture = gestureNames[1] // ✋
          } else if (p.key === 'e' || p.key === 'E') {
            keyGesture = gestureNames[2] // ✌️
          } else if (p.key === 'r' || p.key === 'R') {
            keyGesture = gestureNames[3] // 👍
          }
          if (keyGesture) {
            handleGestureHold(keyGesture)
          }
        }
      }
    }

    const startGame = () => {
      gameStarted.value = true
      gameOver.value = false
      score.value = 0
      turnNumber = 1
      sequence = []
      playerSequence = []
      currentStep = 0
      showingSequence = false
      waitingForInput = false
      sequenceIndex = 0
      displayMessage = 'Comenzando...'
      messageTimer = 60
      resetGestureHold()
      setTimeout(() => {
        nextRound()
      }, 1000)
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
      if (webcam) {
        webcam.stop()
      }
    })

    return {
      webcamContainer,
      labelContainer,
      p5Container,
      gameStarted,
      gameOver,
      modelLoaded,
      score,
      startGame,
    }
  },
}
