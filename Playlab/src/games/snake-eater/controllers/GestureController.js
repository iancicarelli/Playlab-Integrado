import IController from './IController'

export default class GestureController extends IController {
  constructor() {
    super()
    this.scene = null
    this.hands = null
    this.video = null
    this.currentDirection = null
    this.isListening = false
  }

  async init(scene) {
    this.scene = scene
    this.isListening = true

    try {
      const mpHands = await import('@mediapipe/hands')
      const { Hands } = mpHands
      const { Camera } = await import('@mediapipe/camera_utils')

      this.video = document.createElement('video')
      this.video.style.display = 'none'
      document.body.appendChild(this.video)

      // Configurar MediaPipe Hands
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
      })

      // Registrar callback de resultados
      this.hands.onResults((results) => this.handleResults(results))

      // Iniciar camara
      const camera = new Camera(this.video, {
        onFrame: async () => {
          await this.hands.send({ image: this.video })
        },
        width: 320,
        height: 240,
      })

      await camera.start()
      window.dispatchEvent(new CustomEvent('gesture-listening', { detail: true }))
      console.log('🖐 GestureController iniciado.')
    } catch (error) {
      console.error('Error al iniciar GestureController:', error)
      alert('No se pudo acceder a la cámara o inicializar MediaPipe Hands.')
    }
  }

  /**
   * Procesa los resultados del modelo MediaPipe
   */
  handleResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return

    const landmarks = results.multiHandLandmarks[0]
    const gesture = this.detectGesture(landmarks)

    if (gesture && gesture !== this.currentDirection) {
      this.currentDirection = gesture
      window.dispatchEvent(new CustomEvent('gesture-direction', { detail: this.currentDirection }))
    }
  }

  /**
   * Detecta el tipo de gesto basado en la posicion de los dedos.
   */
  detectGesture(landmarks) {
    // Indices de referencia segun MediaPipe
    const fingerTips = [8, 12, 16, 20]
    const fingerPips = [6, 10, 14, 18]
    const thumbTip = landmarks[4]
    const thumbIp = landmarks[3]

    // Deteccion simple de dedos extendidos
    const isFingerExtended = (tipIndex, pipIndex) =>
      landmarks[tipIndex].y < landmarks[pipIndex].y

    const extended = fingerTips.map((tip, i) => isFingerExtended(tip, fingerPips[i]))
    const extendedCount = extended.filter((x) => x).length

    // Deteccion del pulgar (horizontal)
    const isThumbExtended = thumbTip.x < thumbIp.x - 0.05 || thumbTip.x > thumbIp.x + 0.05

    // Puño cerrado → "abajo"
    if (extendedCount === 0 && !isThumbExtended) return 'down'

    // Mano abierta (todos extendidos) → "arriba"
    if (extendedCount === 4 && isThumbExtended) return 'up'

    // Señal de paz (indice y medio extendidos) → "izquierda"
    if (extended[0] && extended[1] && !extended[2] && !extended[3]) return 'left'

    // Apuntar arriba (solo indice extendido) → "derecha"
    if (extended[0] && !extended[1] && !extended[2] && !extended[3]) return 'right'

    return null
  }

  getDirection() {
    return this.currentDirection
  }

  update() {}

  destroy() {
    this.isListening = false
    window.dispatchEvent(new CustomEvent('gesture-listening', { detail: false }))

    if (this.video) {
      this.video.pause()
      if (this.video.srcObject) {
        const tracks = this.video.srcObject.getTracks()
        tracks.forEach((t) => t.stop())
      }
      document.body.removeChild(this.video)
      this.video = null
    }

    if (this.hands) {
      this.hands.close()
      this.hands = null
    }
  }
}
