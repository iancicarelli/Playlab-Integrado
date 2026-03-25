<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-purple-700 via-indigo-600 to-purple-800 text-white p-6"
  >
    <!-- Botón volver -->
    <button
      @click="goBack"
      class="absolute top-6 left-6 bg-white text-purple-700 font-semibold py-2 px-4 rounded-2xl shadow-md hover:scale-105 cursor-pointer transition"
    >
      ← Volver
    </button>

    <!-- Contenedor del formulario -->
    <div class="bg-white/15 backdrop-blur-md rounded-2xl p-8 shadow-xl max-w-sm w-full">
      <h2 class="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h2>

      <form @submit.prevent="login" class="flex flex-col gap-4">
        <label>Nombre de usuario</label>
        <input
          v-model="username"
          type="text"
          placeholder="UserName111"
          class="px-4 py-2 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/70 text-white"
          required
        />
        <label>Contraseña</label>
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="px-4 py-2 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/70 text-white"
          required
        />

        <p v-if="error" class="text-red-300 text-sm text-center">{{ error }}</p>

        <button
          type="submit"
          class="bg-white text-purple-700 font-bold py-2 rounded-lg hover:scale-105 transition cursor-pointer shadow-md"
        >
          Entrar
        </button>
      </form>

      <p class="mt-4 text-sm opacity-80 text-center">
        ¿No tienes cuenta?
        <RouterLink
          :to="{ name: 'Register' }"
          class="underline hover:text-purple-200 transition-colors duration-200"
        >
          Regístrate
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      error: '',
    }
  },
  methods: {
    async login() {
      try {
        this.error = ''
        await api.login(this.username, this.password)
        this.$router.push({ name: 'landing' })
      } catch (err) {
        this.error = 'Error al iniciar sesión. Verifica tus credenciales.'
        console.error(err)
      }
    },
    goBack() {
      this.$router.push({ name: 'landing' })
    },
  },
}
</script>
