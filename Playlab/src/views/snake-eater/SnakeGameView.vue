<template>
    <div
        class="relative flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center bg-snake text-white text-center px-6">
        <div class="absolute inset-0 bg-black/50"></div>

        <!-- Botón menú -->
        <button @click="goBack"
            class="absolute top-6 left-6 bg-white text-green-700 font-semibold py-2 px-4 rounded-full shadow-md hover:scale-105 cursor-pointer transition">
            Menú
        </button>

        <!-- Indicador de control por voz -->
        <div v-if="controllerType === 'voice'" class="absolute top-6 right-6 flex flex-col items-center space-y-2 z-10">
            <div :class="[
                'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
                isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
            ]">
                🎤
            </div>
            <p class="text-sm text-white font-semibold">
                {{ currentDirectionLabel }}
            </p>
        </div>

        <!-- Indicador de control por gestos -->
        <div v-if="controllerType === 'gesture'"
            class="absolute top-6 right-6 flex flex-col items-center space-y-2 z-20">
            <!-- Vista de camara -->
            <div class="relative border-2 border-lime-500 rounded-xl overflow-hidden shadow-lg">
                <video ref="gestureVideo" autoplay playsinline muted class="w-58 h-35 object-cover"></video>

                <!-- Overlay con gesto detectado -->
                <div v-if="gestureDirection"
                    class="absolute bottom-0 left-0 right-0 bg-black/60 text-lg py-1 text-center font-semibold">
                    {{ gestureEmoji }} {{ gestureDirectionLabel }}
                </div>
            </div>
        </div>


        <!-- Contenedor del juego -->
        <SnakeGame class="border-4 border-lime-500" :controller="controllerType" @voice-direction="handleVoiceDirection"
            @voice-listening="handleVoiceListening" />
    </div>
</template>

<script>
import SnakeGame from '@/games/snake-eater/SnakeGame.vue'

export default {
    name: 'SnakeGameView',
    components: { SnakeGame },
    data() {
        return {
            controllerType: this.$route.query.controller || 'keyboard',
            // --- Voice ---
            currentDirection: null,
            isListening: false,
            // --- Gesture ---
            isCameraActive: false,
            gestureDirection: null,
        }
    },
    computed: {
        // === VOICE ===
        currentDirectionLabel() {
            const map = {
                up: '⬆️ Arriba',
                down: '⬇️ Abajo',
                left: '⬅️ Izquierda',
                right: '➡️ Derecha',
            }
            return this.currentDirection
                ? map[this.currentDirection]
                : 'Esperando comando...'
        },

        // === GESTURE ===
        cameraStatusLabel() {
            return this.isCameraActive ? 'Cámara activa' : 'Cámara inactiva'
        },
        gestureDirectionLabel() {
            const map = {
                up: 'Arriba',
                down: 'Abajo',
                left: 'Izquierda',
                right: 'Derecha',
            }
            return map[this.gestureDirection] || ''
        },
        gestureEmoji() {
            const map = {
                up: '✋',
                down: '✊',
                left: '✌️',
                right: '👆',
            }
            return map[this.gestureDirection] || ''
        },
    },
    mounted() {
        // === Eventos de voz ===
        window.addEventListener('voice-direction', this.onVoiceDirection)
        window.addEventListener('voice-listening', this.onVoiceListening)

        // === Eventos de gestos ===
        window.addEventListener('gesture-listening', this.onGestureCamera)
        window.addEventListener('gesture-direction', this.onGestureDirection)
        if (this.controllerType === 'gesture') {
            this.$nextTick(() => {
                this.setupGestureCameraFeed()
            })
        }
    },
    beforeUnmount() {
        window.removeEventListener('voice-direction', this.onVoiceDirection)
        window.removeEventListener('voice-listening', this.onVoiceListening)
        window.removeEventListener('gesture-listening', this.onGestureCamera)
        window.removeEventListener('gesture-direction', this.onGestureDirection)
        // Desactivar camara si esta activa
        const videoEl = this.$refs.gestureVideo
        if (videoEl && videoEl.srcObject) {
            const stream = videoEl.srcObject
            stream.getTracks().forEach(track => track.stop())
            videoEl.srcObject = null
        }
    },
    methods: {
        goBack() {
            this.$router.push({ name: 'SnakeWelcome' })
        },

        // === Control por voz ===
        handleVoiceDirection(dir) {
            this.currentDirection = dir
        },
        handleVoiceListening(state) {
            this.isListening = state
        },
        onVoiceDirection(e) {
            this.currentDirection = e.detail
        },
        onVoiceListening(e) {
            this.isListening = e.detail
        },

        // === Control por gestos ===
        onGestureCamera(e) {
            this.isCameraActive = e.detail
        },
        onGestureDirection(e) {
            this.gestureDirection = e.detail
        },
        async setupGestureCameraFeed() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                this.$refs.gestureVideo.srcObject = stream
            } catch (err) {
                console.error('No se pudo acceder a la cámara:', err)
            }
        },
    }
}
</script>

<style scoped>
.bg-snake {
    background-image: url('@/assets/bg-snake-vistas.jpg');
    background-size: cover;
    background-position: center;
}
</style>
