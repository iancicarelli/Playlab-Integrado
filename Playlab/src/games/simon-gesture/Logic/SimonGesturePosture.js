import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'


const MODEL_JSON_URL = '/src/games/simon-gesture/Model/model.json'

export default {
  name: 'SimonBodyPostures',
  setup() {
    const router = useRouter()

    const webcamContainer = ref(null)
    const labelContainer = ref(null)
    const p5Container = ref(null)

    const gameStarted = ref(false)
    const gameOver = ref(false)
    const modelLoaded = ref(false)
    const score = ref(0)

    let p5Instance = null
    let model = null
    let maxPredictions = 0
    let bgImgs = {}
    let detector = null
    let videoElement = null


    const VALUES_PER_KEYPOINT = 2;
    const NUM_KEYPOINTS = 17;
    const FRAME_VECTOR_SIZE = NUM_KEYPOINTS * VALUES_PER_KEYPOINT; // 34


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
    const turnTimeLimit = 10000 // 10 segundos total por turno.


    let stableGesture = 'no'
    let gestureFrameCounter = 0
    const FRAMES_TO_STABILIZE = 10
    const gestureHoldDuration = 3000 // 3 segundos de hold

    let currentHeldGesture = 'no'
    let gestureHoldStartTime = 0
    let isHoldingGesture = false
    let holdProgress = 0
    let isHoldingCorrectGesture = false


    const gestureNames = [
      'Manos arriba',
      'Manos en la cabeza',
      'Manos apegadas',
      'Manos victoria',
      'Baile faraon',
      'Estirando',
      'Baile',
      'Interrogacion',
      'KungFu',
      'Rezando',
    ]


    const gestureLabels = [
      'Manos Arriba 🙋‍♂️',
      'Manos en la Cabeza 🙆‍♀️',
      'Manos Apegadas (Firme)🧍',
      'Manos Victoria V ✌️',
      'Baile Faraón 🕺',
      'Estirando 🧘',
      'Baile (Pose) 💃',
      'Interrogación 🤔',
      'KungFu 🥋',
      'Rezando 🙏',
    ]

    const gestureEmojis = gestureLabels
    let gestureColors = []

    watch(gameOver, (isOver) => {
      if (isOver) {
        console.log(`Juego terminado. Score: ${score.value}.`)
        router.push({ name: 'SimonGameOver', query: { score: score.value } })
      }
    })

    const drawGestureHoldProgress = (p) => {
      if (!waitingForInput || currentStep >= sequence.length) return

      p.push()

      const barWidth = 300
      const barHeight = 20
      const barX = p.width / 2 - barWidth / 2
      const barY = p.height - 100


      p.fill(100, 100, 100, 150)
      p.stroke(255)
      p.strokeWeight(2)
      p.rect(barX, barY, barWidth, barHeight, 5)

      const progressWidth = barWidth * holdProgress

      let progressColor
      if (isHoldingCorrectGesture) {
        progressColor = p.color(100, 255, 100)
      } else if (currentHeldGesture !== 'no' && currentHeldGesture !== gestureNames[sequence[currentStep]]) {
        progressColor = p.color(255, 100, 100)
      } else {
        progressColor = p.color(255, 165, 0)
      }


      p.fill(progressColor)
      p.noStroke()
      p.rect(barX, barY, progressWidth, barHeight, 5)

      p.fill(255)
      p.stroke(0)
      p.strokeWeight(1)
      p.textAlign(p.CENTER, p.CENTER)
      p.textSize(14)
      const progressPercent = Math.floor(holdProgress * 100)
      p.text(`Mantener: ${progressPercent}%`, p.width / 2, barY + barHeight / 2)

      const totalElapsedTime = Date.now() - turnStartTime
      const totalRemainingTime = Math.max(0, turnTimeLimit - totalElapsedTime)
      const totalSeconds = (totalRemainingTime / 1000).toFixed(1)

      p.textSize(16)
      p.text(`Tiempo Total Restante: ${totalSeconds}s`, p.width / 2, barY - 30)
      p.pop()
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

    async function loadTensorFlowLibraries() {
      try {
          console.log("🟢 Cargando TensorFlow.js...");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.13.0/dist/tf.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@3.13.0/dist/tf-backend-webgl.min.js");

          console.log("🔹 Cargando @tensorflow-models/pose-detection...");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.0.0/dist/pose-detection.min.js");

          // eslint-disable-next-line no-undef
          await tf.setBackend('webgl');
          // eslint-disable-next-line no-undef
          await tf.ready();

          console.log("🟩 Librerías de Pose Detection y TFJS listas.");
          return true;

      } catch (err) {
          console.error("❌ ERROR cargando librerías:", err)
          return false;
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
        throw new Error('Fallo al cargar P5.js.')
      }
    }


    const keypointIndices = {
        NOSE: 0, LEFT_EYE: 1, RIGHT_EYE: 2, LEFT_EAR: 3, RIGHT_EAR: 4,
        LEFT_SHOULDER: 5, RIGHT_SHOULDER: 6, LEFT_ELBOW: 7, RIGHT_ELBOW: 8,
        LEFT_WRIST: 9, RIGHT_WRIST: 10, LEFT_HIP: 11, RIGHT_HIP: 12,
        LEFT_KNEE: 13, RIGHT_KNEE: 14, LEFT_ANKLE: 15, RIGHT_ANKLE: 16
    };

    const vectorFromPose = (keypoints) => {
        if (!keypoints || keypoints.length < 17) {
            return Array(FRAME_VECTOR_SIZE).fill(0.0);
        }

        const featureVector = [];
        const leftHip = keypoints[keypointIndices.LEFT_HIP];
        const rightHip = keypoints[keypointIndices.RIGHT_HIP];

        const center = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2,
        };

        const leftShoulder = keypoints[keypointIndices.LEFT_SHOULDER];
        const torsoLength = Math.sqrt(
            Math.pow(leftShoulder.x - leftHip.x, 2) +
            Math.pow(leftShoulder.y - leftHip.y, 2)
        ) || 1;

        const scale = torsoLength;

        keypoints.forEach(kp => {
            const normX = (kp.x - center.x) / scale;
            const normY = (kp.y - center.y) / scale;

            featureVector.push(normX);
            featureVector.push(normY);
        });

        return featureVector.slice(0, FRAME_VECTOR_SIZE);
    }

    const initModel = async () => {
      try {
        await loadTensorFlowLibraries()


        videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsinline = true;
        videoElement.width = 300;
        videoElement.height = 300;
        videoElement.style.transform = 'scaleX(-1)';

        if (webcamContainer.value) {
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';
            while (webcamContainer.value.firstChild) {
                webcamContainer.value.removeChild(webcamContainer.value.firstChild);
            }
            webcamContainer.value.appendChild(videoElement);
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
        videoElement.srcObject = stream;
        await new Promise((resolve) => { videoElement.onloadedmetadata = resolve; });
        videoElement.play();
        console.log('🔵 Cámara inicializada.');


        console.log("🔵 Cargando MoveNet...");
        // eslint-disable-next-line no-undef
        detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
            // eslint-disable-next-line no-undef
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });


        console.log(`🔵 Cargando modelo local desde: ${MODEL_JSON_URL}`);
        // eslint-disable-next-line no-undef
        model = await tf.loadLayersModel(MODEL_JSON_URL);

        model.summary();

        maxPredictions = gestureNames.length;

        for (let i = 0; i < maxPredictions; i++) {
          const div = document.createElement('div')
          labelContainer.value.appendChild(div)
        }
        modelLoaded.value = true

        predictLoop()

      } catch (error) {
        console.error('❌ Error cargando modelo o cámara:', error)
        if (webcamContainer.value) {
            webcamContainer.value.innerHTML = '<div style="color: red; padding: 10px; text-align: center;">Error. Revisa consola.</div>'
        }
        modelLoaded.value = true
      }
    }

    const predictLoop = async () => {
      if (videoElement && detector && model) {
        await predict()
      }
      requestAnimationFrame(predictLoop)
    }

    const predict = async () => {
      if (!model || !detector || !videoElement) return;

      let prediction = [];
      let highestProb = 0;
      let highestIndex = -1;

      try {
        const poses = await detector.estimatePoses(videoElement, { flipHorizontal: true });
        const pose = poses && poses.length > 0 ? poses[0] : null;

        if (pose && pose.score > 0.3) {
          const currentFrameVector = vectorFromPose(pose.keypoints);

          // eslint-disable-next-line no-undef
          const predictionData = tf.tidy(() => {
            // eslint-disable-next-line no-undef
            const inputTensor = tf.tensor2d([currentFrameVector], [1, FRAME_VECTOR_SIZE]);
            const predictionTensor = model.predict(inputTensor);
            const data = predictionTensor.dataSync();
            return Array.from(data);
          });

          prediction = predictionData.map((prob, i) => ({
            className: gestureNames[i],
            probability: prob,
          }));

        } else {
          prediction = gestureNames.map(name => ({ className: name, probability: 0 }));
        }

      } catch (e) {
        console.error("❌ Error en predicción:", e);
        prediction = gestureNames.map(name => ({ className: name, probability: 0 }));
      }

      let predictedGesture = 'no';
      for (let i = 0; i < gestureNames.length; i++) {
        const probability = prediction[i]?.probability || 0;

        if (labelContainer.value && labelContainer.value.childNodes[i]) {
          const labelElement = labelContainer.value.childNodes[i];
          const gestureName = gestureEmojis[i] || gestureNames[i];
          const color = probability > 0.5 ? 'green' : 'black';
          const weight = probability > 0.5 ? 'bold' : 'normal';
          labelElement.innerHTML = `<span style="color:${color}; font-weight:${weight}">${gestureName}: ${(probability * 100).toFixed(1)}%</span>`;
        }

        if (probability > 0.5 && probability > highestProb) {
          highestProb = probability;
          highestIndex = i;
        }
      }

      if (highestIndex !== -1) {
        predictedGesture = gestureNames[highestIndex];
      }

      if (waitingForInput) {
        handleGestureHold(predictedGesture);
      }
    };

    const handleGestureHold = (gesture) => {
      const currentTime = Date.now()
      const expectedGestureIndex = sequence[currentStep]
      const expectedGestureName = gestureNames[expectedGestureIndex]
      const currentStableGesture = stableGesture

      if (currentTime - turnStartTime > turnTimeLimit) {
        if (waitingForInput && currentStep < sequence.length) {
          waitingForInput = false
          displayMessage = '¡Tiempo agotado!'
          setTimeout(() => gameOver.value = true, 100);
        }
        return
      }

      if (gesture === stableGesture) {
        gestureFrameCounter++
      } else {
        stableGesture = gesture
        gestureFrameCounter = 0
        resetGestureHold()
        return
      }

      if (gestureFrameCounter < FRAMES_TO_STABILIZE) return;

      if (currentStableGesture === 'no' || !gestureNames.includes(currentStableGesture)) {
        if (isHoldingGesture) resetGestureHold();
        return;
      }

      const isCurrentGestureCorrect = currentStableGesture === expectedGestureName

      if (!isHoldingGesture || currentHeldGesture !== currentStableGesture) {
          currentHeldGesture = currentStableGesture
          gestureHoldStartTime = currentTime
          isHoldingGesture = true
          isHoldingCorrectGesture = isCurrentGestureCorrect
          holdProgress = 0

          if (!isHoldingCorrectGesture) {
              displayMessage = `Detectado: ${currentHeldGesture}. ¡Incorrecto!`
              messageTimer = 30
          } else {
               displayMessage = `¡Correcto: ${currentHeldGesture}! Mantén...`
               messageTimer = 30
          }
      } else {
        if (isHoldingCorrectGesture) {
             const elapsedTime = currentTime - gestureHoldStartTime
             holdProgress = Math.min(elapsedTime / gestureHoldDuration, 1)

             if (elapsedTime >= gestureHoldDuration) {
                handleGestureSuccess()
                resetGestureHold()
             }
        } else {
             holdProgress = 0;
             const elapsedTime = currentTime - gestureHoldStartTime
             if (elapsedTime > 1000) {
                 displayMessage = `Incorrecto: ${currentHeldGesture}. Busca: ${expectedGestureName}`
                 messageTimer = 10
             }
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

      if (currentStep >= sequence.length) {
        score.value++
        turnNumber++
        displayMessage = '¡Bien hecho!'
        messageTimer = 120
        waitingForInput = false

        setTimeout(() => {
          nextRound()
        }, 1500)
      }
    }

    const nextRound = () => {
      sequence = []
      sequence.push(Math.floor(Math.random() * gestureNames.length))

      playerSequence = []
      currentStep = 0
      sequenceIndex = 0
      showingSequence = true
      displayMessage = `Atento al gesto (Turno ${turnNumber})...`
      messageTimer = 60
      resetGestureHold()
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
      displayMessage = '¡Comenzando!'
      messageTimer = 60
      resetGestureHold()
      setTimeout(() => {
        nextRound()
      }, 1000)
    }

    const sketch = (p) => {
      let gestureImages = [];

      const generateColors = (count) => {
        const colors = []
        const goldenRatioConjugate = 0.61803398875
        let h = Math.random()
        for (let i = 0; i < count; i++) {
          h = (h + goldenRatioConjugate) % 1
          const hue = h * 360
          const sat = 70 + Math.floor(Math.random() * 20)
          const light = 50 + Math.floor(Math.random() * 10)
          const c = p.color(hue, sat, light, 255)
          colors.push([p.hue(c), p.saturation(c), p.brightness(c)])
        }
        return colors
      }

      p.preload = () => {
        bgImgs.normal = p.loadImage('/images/simon-background.png', () => {}, () => {
          console.log("Fondo normal no encontrado, usando color solido.")
        })
        bgImgs.gameOver = p.loadImage('/images/SimonGameOver.png', () => {}, () => {
            console.log("Fondo gameover no encontrado.")
        })

        gestureNames.forEach((name, index) => {
          gestureImages[index] = p.loadImage(`/images/Posture/${name}.png`, () => {
             // Éxito
          }, (err) => {
             console.error(`Error cargando imagen de gesto: /images/Posture/${name}.png`, err)
          })
        })
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

        if (gameOver.value) {
          if (bgImgs.gameOver && bgImgs.gameOver.width > 0) p.image(bgImgs.gameOver, 0, 0, p.width, p.height)
          else p.background(0);
        } else {
          if (bgImgs.normal && bgImgs.normal.width > 0) p.image(bgImgs.normal, 0, 0, p.width, p.height)
          else p.background(30);
        }

        if (!gameStarted.value) {
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(32)
          p.fill(255)
          p.stroke(0)
          p.strokeWeight(3)
          p.text('¡Bienvenido/a a tu aventura en Simon Gestures!', p.width / 2, p.height / 2 - 100)
          p.textSize(20)
          p.text('Imita el gesto por 3 segundos.', p.width / 2, p.height / 2 - 150)
          p.noStroke()
          return
        }

        p.push()
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
            if (p.frameCount % 60 === 0) {
              if (sequenceIndex < sequence.length) {
                sequenceIndex++
              } else {
                showingSequence = false
                waitingForInput = true
                turnStartTime = Date.now()
                displayMessage = `¡Tu turno!`
                messageTimer = 180
                resetGestureHold()
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
          p.fill(255, 255, 255, Math.min(255, messageTimer * 5))
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
        const imgSize = 250

        let gestureToShow = -1

        if (showingSequence && sequenceIndex > 0) {
          gestureToShow = sequence[sequenceIndex - 1]
        } else if (waitingForInput && currentStep < sequence.length) {
          gestureToShow = sequence[currentStep]
        }

        if (gestureToShow !== -1) {
          const currentGesture = gestureToShow
          const colorData = gestureColors[currentGesture]
          p.push()
          p.colorMode(p.HSB, 360, 100, 100, 255)
          p.stroke(255, 255, 0)
          p.strokeWeight(5)
          p.fill(p.color(colorData[0], colorData[1], colorData[2], 80))
          p.ellipse(centerX, centerY, imgSize + 40, imgSize + 40)
          p.pop()
          if (gestureImages[currentGesture] && gestureImages[currentGesture].width > 1) {
             p.push()
             p.drawingContext.save();
             p.drawingContext.beginPath();
             p.drawingContext.arc(centerX, centerY, imgSize / 2, 0, 2 * Math.PI);
             p.drawingContext.closePath();
             p.drawingContext.clip();
             p.imageMode(p.CENTER)
             p.image(gestureImages[currentGesture], centerX, centerY, imgSize, imgSize)
             p.drawingContext.restore();

             p.pop()
          }
        }
      }
    }

    onMounted(async () => {
      await loadP5()
      // eslint-disable-next-line no-undef
      p5Instance = new window.p5(sketch, p5Container.value)
      await initModel()
    })

    onUnmounted(() => {
      if (p5Instance) p5Instance.remove()

      if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }

      if (webcamContainer.value) {
        while (webcamContainer.value.firstChild) {
            webcamContainer.value.removeChild(webcamContainer.value.firstChild);
        }
      }

      if (detector && detector.dispose) detector.dispose()
      if (model && model.dispose) model.dispose()
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
