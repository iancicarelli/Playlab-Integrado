<template>
    <div
        class="relative flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center bg-snake text-white text-center px-6">
        <div class="absolute inset-0 bg-black/50 z-0"></div>
        <!-- Boton de Menú -->
        <button @click="goToMenu"
            class="absolute top-6 left-6 bg-white text-green-700 font-semibold py-2 px-4 rounded-full shadow-md hover:scale-105 cursor-pointer transition">
            Menú
        </button>


        <div class="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-3xl text-center space-y-8">
            <!-- Titulo -->
            <h1 class="text-5xl font-extrabold mb-4 drop-shadow-lg">¡Bienvenido/a a Snake Eater!</h1>

            <!-- Descripcion -->
            <p class="text-lg mb-8 opacity-90">
                Seleccione el tipo de control con el que desea jugar.
            </p>

            <!--  Eleccion de control -->
            <div class="flex flex-col md:flex-row gap-6 justify-center">
                <button @click="selectController('keyboard')"
                    class="bg-white text-green-700 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition">
                    <span class="text-3xl">🎮</span> <br>
                    Usar Teclado
                </button>
                <button @click="selectController('voice')"
                    class="bg-white text-green-700 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition">
                    <span class="text-3xl">🗣️</span> <br>
                    Control por Voz
                </button>
                <button @click="selectController('gesture')"
                    class="bg-white text-green-700 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition">
                    <span class="text-3xl">✋</span> <br>
                    Control por Gestos
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SnakeWelcome',
    methods: {
        selectController(type) {
            // Navega hacia el juego pasando el tipo de control
            this.$router.push({ name: 'SnakeInstructions', query: { controller: type } })
        },
        goToMenu() {
            // Regresa a la landing page principal
            this.$router.push({ name: 'landing' })
        }
    }
}
</script>

<style scoped>
.bg-snake {
    background-image: url('@/assets/bg-snake-vistas.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
</style>
