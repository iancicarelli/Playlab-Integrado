<template>
    <div
        class="dino-welcome-bg relative flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center text-white text-center px-6">
        <div class="absolute inset-0 bg-black/50 z-0"></div>
        <!-- Boton de Menú -->
        <button @click="goToMenu"
            class="absolute top-6 left-6 bg-white text-green-700 font-semibold py-2 px-4 rounded-full shadow-md hover:scale-105 cursor-pointer transition">
            Menú
        </button>


        <div class="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-3xl text-center space-y-8">
            <!-- Titulo -->
            <h1 class="text-5xl font-extrabold mb-4 drop-shadow-lg">¡Bienvenido/a a Dino Rush!</h1>

            <!-- Descripcion -->
            <p class="text-lg mb-8 opacity-90">
                Seleccione el tipo de control con el que desea jugar.
            </p>

            <!--  Eleccion de control -->
            <div class="flex flex-col md:flex-row gap-6 justify-center">
                <button @click="selectController('keyboard')"
                    class="bg-white text-green-700 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition">
                    <span class="text-3xl">🎮</span> <br>
                    <span class="text-3xl">Teclado</span> <br>
                    <span class="text-black">
                      ¡Utiliza la barra espaciadora para saltar y evita que nuestro dinosaurio choque con los obstáculos!
                    </span> <br>
                </button>
                <button @click="selectController('voice')"
                    class="bg-white text-green-700 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition">
                    <span class="text-3xl">🗣️</span> <br>
                    <span class="text-3xl">Voz</span> <br>
                    <span class="text-black">
                      ¡Con tu voz, di cualquier letra para saltar y ayuda a nuestro dinosaurio a evitar los obstáculos!
                    </span> <br>
                </button>
                <button @click="selectController('gesture')"
                    class="bg-white text-green-700 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition">
                    <span class="text-3xl">✋</span> <br>
                    <span class="text-3xl">Gestos</span> <br>
                    <span class="text-black">
                      ¡Utiliza tu mano abierta frente a la cámara para saltar y evitar que nuestro dinosaurio termine chocando con los cactus!
                    </span> <br>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DinoWelcome',
    methods: {
        selectController(type) {
            // Navega hacia el juego pasando el tipo de control
            this.$router.push({ name: 'DinoGestureRush', query: { control: type } })
        },
        goToMenu() {
            // Regresa a la landing page principal
            this.$router.push({ name: 'landing' })
        }
    }
}
</script>

<style scoped>
.dino-welcome-bg {
    background-image: url('/images/dino-background.png');
}
</style>
