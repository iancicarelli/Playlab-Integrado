<template>
  <div class="game-over-container">
    <div class="background-image"></div>
    <div class="content">
      <h1 class="title">¡JUEGO TERMINADO!</h1>
      <p v-if="score !== null" class="score-display">Puntuación final: {{ score }}</p>
      <router-link :to="{ name: 'SimonMenu' }" class="menu-button">VOLVER AL MENÚ</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'SimonGameOver',
  setup() {
    const route = useRoute()
    const score = ref(null)

    onMounted(() => {
      if (route.query.score) {
        score.value = parseInt(route.query.score, 10)
      }
    })

    return {
      score,
    }
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

.game-over-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/SimonGameOver.png');
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-family: 'Permanent Marker', cursive;
  font-size: 4rem;
  color: #ff0000;
  text-shadow:
    4px 4px 6px rgba(0, 0, 0, 0.7),
    -4px -4px 6px rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
  animation: pulse 1.5s infinite alternate;
}

.score-display {
  font-family: 'Permanent Marker', cursive;
  font-size: 2.5rem;
  color: #ffd700;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.7);
  margin-bottom: 40px;
}

.menu-button {
  font-family: 'Permanent Marker', cursive;
  font-size: 2rem;
  color: #2c2c2c;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
  text-decoration: none;
  border-radius: 50px;
  padding: 15px 40px;
  border: 4px solid #8f4d2a;
  background-color: #a95c32;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.menu-button:hover {
  transform: scale(1.1);
  color: #000000;
  background-color: #c26b3a;
  box-shadow:
    0 0 20px rgba(255, 229, 208, 0.8),
    0 0 30px rgba(255, 160, 0, 0.6);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}
</style>
