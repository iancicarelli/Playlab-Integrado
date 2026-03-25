import IController from './IController'

export default class VoiceController extends IController {
  constructor() {
    super()
    this.recognition = null
    this.currentDirection = null
    this.isListening = false
    this.retryTimeout = null
    this.retryDelay = 150 // ms, reinicio rápido para reducir tiempo muerto
    this.directionRegex = /\b(arriba|abajo|izquierda|derecha)\b/ // precompilado para velocidad
  }

  init(scene) {
    this.scene = scene
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta control por voz.')
      return
    }

    // Crear instancia y configurar
    this.recognition = new SpeechRecognition()
    // Intentar usar una gramática cerrada para reducir latencia y mejorar precisión
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
    if (SpeechGrammarList) {
      try {
        const grammar = '#JSGF V1.0; grammar directions; public <direction> = arriba | abajo | izquierda | derecha ;'
        const grList = new SpeechGrammarList()
        grList.addFromString(grammar, 1)
        this.recognition.grammars = grList
      } catch (err) {
        // algunos navegadores pueden no soportar addFromString
        void err
      }
    }

    this.recognition.lang = 'es-ES'
    this.recognition.continuous = true
    this.recognition.interimResults = true // usar intermedios para respuestas rápidas
    this.recognition.maxAlternatives = 1
    this.isListening = true

    const map = { arriba: 'up', abajo: 'down', izquierda: 'left', derecha: 'right' }

    // Procesar cada resultado (incluyendo intermedios) y actuar tan pronto se detecte una dirección
    this.recognition.onresult = (event) => {
      try {
        // recorrer desde el índice del evento para procesar rápidamente intermedios
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i]
          const transcript = (res[0] && res[0].transcript) ? res[0].transcript.trim().toLowerCase() : ''
          if (!transcript) continue

          const match = transcript.match(this.directionRegex)
          if (match) {
            const dir = map[match[0]]
            if (dir && dir !== this.currentDirection) {
              this.currentDirection = dir
              // dispatch lo más pronto posible
              window.dispatchEvent(new CustomEvent('voice-direction', { detail: dir }))
              // una vez que tenemos una dirección válida, rompemos para evitar sobrecarga
              break
            }
          }
        }
      } catch (err) {
        console.warn('Error procesando resultado de voz:', err)
      }
    }

    // Manejo de errores: reinicios rápidos sólo para errores recuperables
    this.recognition.onerror = (e) => {
      console.warn('Error en reconocimiento de voz:', e)
      const recoverable = ['network', 'no-speech', 'aborted', 'not-allowed']
      if (e && e.error && recoverable.includes(e.error)) {
        this.restartRecognitionWithDelay(this.retryDelay)
      }
    }

    // Reiniciar rápidamente al terminar para minimizar tiempo muerto
    this.recognition.onend = () => {
      if (this.isListening) this.restartRecognitionWithDelay(this.retryDelay)
    }

    // Intentar precalentar / iniciar reconocimiento de forma robusta
    this.startRecognition()
  }

  startRecognition() {
    try {
      // asegurar estado limpio: abortar antes de iniciar para evitar InvalidStateError
      try {
        if (this.recognition.abort) this.recognition.abort()
      } catch (e) {
        void e
      }
      this.recognition.start()
      window.dispatchEvent(new CustomEvent('voice-listening', { detail: true }))
    } catch (e) {
      console.warn('No se pudo iniciar reconocimiento de voz:', e)
      this.restartRecognitionWithDelay(this.retryDelay)
    }
  }

  restartRecognitionWithDelay(ms = 300) {
    clearTimeout(this.retryTimeout)
    this.retryTimeout = setTimeout(() => {
      if (this.isListening) this.startRecognition()
    }, ms)
  }

  getDirection() {
    return this.currentDirection
  }

  update() {}

  destroy() {
    if (this.recognition) {
      this.isListening = false
      clearTimeout(this.retryTimeout)
      this.recognition.stop()
      this.recognition = null
      window.dispatchEvent(new CustomEvent('voice-listening', { detail: false }))
    }
  }
}
