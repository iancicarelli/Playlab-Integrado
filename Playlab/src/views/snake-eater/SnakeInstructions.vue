<template>
    <div
        class="relative flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center bg-snake text-white text-center px-6">
        <div class="absolute inset-0 bg-black/50 z-0"></div>
        <!-- Boton de regreso -->
        <button @click="goBack"
            class="absolute top-6 left-6 bg-white text-green-700 font-semibold py-2 px-4 rounded-full shadow-md hover:scale-105 cursor-pointer transition">
            ← Volver
        </button>
        <div class="relative z-10 flex flex-col items-center justify-center space-y-6 max-w-3xl">
            <!-- Titulo -->
            <h1 class="text-5xl font-extrabold mb-4 drop-shadow-lg">Instrucciones</h1>
            <h2 class="text-2xl font-bold mb-6 capitalize">
                Modo de control: {{ controlLabel }}
            </h2>

            <!-- Bloque de instrucciones -->
            <div class="bg-white text-green-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-left text-xl space-y-4">
                <div v-if="controllerType === 'keyboard'">
                    <p>Usa las flechas del teclado para mover la serpiente:</p>
                    <ul class="list-disc ml-6 space-y-1">
                        <li>⬆️ Arriba</li>
                        <li>⬇️ Abajo</li>
                        <li>⬅️ Izquierda</li>
                        <li>➡️ Derecha</li>
                    </ul>
                    <p class="mt-3">Evita chocar contra las paredes o contigo mismo.</p>
                </div>

                <div v-else-if="controllerType === 'voice'">
                    <p>Controla la serpiente con comandos de voz simples:</p>
                    <ul class="list-disc ml-6 space-y-1">
                        <li>Di <b>“arriba”</b> para moverte hacia arriba</li>
                        <li>Di <b>“abajo”</b> para moverte hacia abajo</li>
                        <li>Di <b>“izquierda”</b> o <b>“derecha”</b> según la dirección</li>
                    </ul>
                    <p class="mt-3">
                        Asegúrate de permitir acceso al micrófono en tu navegador.
                    </p>
                </div>

                <div v-else-if="controllerType === 'gesture'">
                    <p>Usa gestos detectados por la cámara:</p>
                    <ul class="list-disc mt-2.5 ml-6 space-y-1">
                        <li><span class=" text-3xl">✋</span> Mano abierta → Mover hacia arriba</li>
                        <li><span class=" text-3xl">✌️</span> Señal de paz → Mover hacia la izquierda</li>
                        <li><span class=" text-3xl">👆</span> Apuntar arriba → Mover hacia la derecha</li>
                        <li><span class=" text-3xl">✊</span> Mano cerrada → Mover hacia abajo</li>
                    </ul>
                    <p class="mt-3">
                        La cámara se activará al comenzar el juego. Asegúrate de tener buena
                        iluminación.
                    </p>
                </div>
            </div>

            <!-- Boton de iniciar -->
            <button @click="startGame"
                class="mt-10 bg-white text-green-700 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 cursor-pointer transition">
                Iniciar Juego
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SnakeInstructions',
    data() {
        return {
            controllerType: this.$route.query.controller || 'keyboard'
        }
    },
    computed: {
        controlLabel() {
            const map = {
                keyboard: 'Teclado',
                voice: 'Comandos de voz',
                gesture: 'Gestos'
            }
            return map[this.controllerType] || 'Desconocido'
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        startGame() {
            this.$router.push({
                name: 'SnakeGame',
                query: { controller: this.controllerType }
            })
        }
    }
}
</script>

<style scoped>
.bg-snake {
    background-image: url('@/assets/bg-snake-vistas.jpg');
    background-size: cover;
    background-position: center;
    background-color: black;
    background-repeat: no-repeat;
}
</style>