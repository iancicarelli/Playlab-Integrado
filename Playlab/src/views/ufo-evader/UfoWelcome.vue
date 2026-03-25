<template>
  <div
    class="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#0a0c1c] text-white text-center px-6"
  >
    <canvas ref="starCanvas" class="absolute inset-0 w-full h-full z-0"></canvas>

    <!-- Boton de Menú -->
    <button
      @click="goToMenu"
      class="absolute top-6 left-6 bg-white text-blue-900 font-semibold py-2 px-4 rounded-full shadow-md hover:scale-105 cursor-pointer transition z-10"
    >
      Menú
    </button>

    <div
      class="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-3xl text-center space-y-8 border border-white/20"
    >
      <!-- Titulo -->
      <h1 class="text-5xl font-extrabold mb-4 drop-shadow-lg">¡Bienvenido/a a UFO Evader!</h1>

      <!-- Descripcion -->
      <p class="text-lg mb-8 opacity-90">Seleccione el tipo de control con el que desea jugar.</p>

      <!--  Eleccion de control -->
      <div class="flex flex-col md:flex-row gap-6 justify-center">
        <button
          @click="selectController('keyboard')"
          class="bg-white text-blue-900 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition"
        >
          <span class="text-3xl">🎮</span> <br />
          Usar Teclado
        </button>
        <button
          @click="selectController('voice')"
          class="bg-white text-blue-900 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition"
        >
          <span class="text-3xl">🗣️</span> <br />
          Control por Voz
        </button>
        <button
          @click="selectController('gesture')"
          class="bg-white text-blue-900 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 cursor-pointer transition"
        >
          <span class="text-3xl">✋</span> <br />
          Control por Gestos
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UfoWelcome',
  data() {
    return {
      stars: [],
      animationId: null,
    }
  },
  mounted() {
    this.initStars()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    cancelAnimationFrame(this.animationId)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initStars() {
      const canvas = this.$refs.starCanvas
      if (!canvas) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      this.stars = []
      const total = Math.floor((canvas.width * canvas.height) / 12000)

      for (let i = 0; i < total; i++) {
        this.stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1.5,
          speed: Math.random() * 1.5 + 0.5,
        })
      }

      this.animate()
    },
    handleResize() {
      const canvas = this.$refs.starCanvas
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        // Re-init stars to adjust density, or just keep existing ones
        // Let's re-init to keep density consistent
        this.stars = []
        const total = Math.floor((canvas.width * canvas.height) / 12000)
        for (let i = 0; i < total; i++) {
          this.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1.5,
            speed: Math.random() * 1.5 + 0.5,
          })
        }
      }
    },
    animate() {
      const canvas = this.$refs.starCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')

      // Clear with background color
      ctx.fillStyle = '#0a0c1c'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      this.stars.forEach((star) => {
        star.x -= star.speed
        if (star.x < 0) {
          star.x = canvas.width
          star.y = Math.random() * canvas.height
        }

        // Alpha calculation based on speed (0.5 to 2) -> (120 to 220)
        const alpha = ((star.speed - 0.5) / 1.5) * (220 - 120) + 120

        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha / 255})`
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      this.animationId = requestAnimationFrame(this.animate)
    },
    selectController(type) {
      // Navega hacia el juego pasando el tipo de control
      this.$router.push({ name: 'UfoEvader', query: { controller: type } })
    },
    goToMenu() {
      // Regresa a la landing page principal
      this.$router.push({ name: 'landing' })
    },
  },
}
</script>

<style scoped></style>
