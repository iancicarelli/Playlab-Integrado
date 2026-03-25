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
      <h2 class="text-3xl font-bold mb-6 text-center">Crear Cuenta</h2>

      <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
        <label>Nombre de usuario</label>
        <input
          v-model="username"
          type="text"
          placeholder="Elige un nombre de usuario"
          class="px-4 py-2 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/70 text-white"
          required
        />
        <label>Contraseña</label>
        <input
          v-model="password"
          type="password"
          placeholder="Crea una contraseña segura"
          class="px-4 py-2 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/70 text-white"
          required
        />
        <label>Repetir Contraseña</label>
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirma tu contraseña"
          class="px-4 py-2 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/70 text-white"
          required
        />

        <p v-if="error" class="text-red-300 text-sm text-center">{{ error }}</p>

        <button
          type="submit"
          class="bg-white text-purple-700 font-bold py-2 rounded-lg hover:scale-105 transition cursor-pointer shadow-md"
        >
          Registrarse
        </button>
      </form>

      <p class="mt-4 text-sm opacity-80 text-center">
        ¿Ya tienes cuenta?
        <RouterLink
          :to="{ name: 'Login' }"
          class="underline hover:text-purple-200 transition-colors duration-200"
        >
          Inicia sesión
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'

export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      error: '',
    }
  },
  mounted() {
    document.title = 'Registro - Motion Play Lab'
  },
  methods: {
    async handleRegister() {
      this.error = ''
      if (this.password !== this.confirmPassword) {
        this.error = 'Las contraseñas no coinciden.'
        return
      }

      if (this.password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres.'
        return
      }

      try {
        await api.register(this.username, this.password)
        alert(`¡Usuario "${this.username}" registrado con éxito!`)
        this.$router.push({ name: 'landing' })
      } catch (err) {
        this.error = 'Error al registrarse. Intenta con otro nombre de usuario.'
        console.error(err)
      }
    },
    goBack() {
      this.$router.push({ name: 'landing' })
    },
  },
}
</script>
