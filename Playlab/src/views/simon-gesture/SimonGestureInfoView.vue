<template>
  <div class="menu-container">
    <h1 class="page-title">¿Cómo Jugar?</h1>

    <div class="mode-selection">
      <div class="mode-box" @click="selectMode('camera')">
        <h2 class="mode-title">Con Cámara</h2>
        <p class="mode-description">
          El juego te mostrará un gesto. Para responder, haz el gesto que se muestra, como "OK" o
          "PULGAR ARRIBA". ¡Así el juego sabrá que acertaste!
        </p>
      </div>

      <div class="mode-box" @click="selectMode('voice')">
        <h2 class="mode-title">Con Voz</h2>
        <p class="mode-description">
          El juego te mostrará gestos. Para responder, di el nombre del gesto en voz alta, como "OK"
          o "PULGAR ARRIBA". ¡Así el juego sabrá que acertaste!
        </p>
      </div>
    </div>
    <RouterLink :to="{ name: 'SimonMenu' }" class="back-button">Volver al Menú</RouterLink>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function selectMode(mode) {
  if (mode === 'camera') {
    router.push({ name: 'SimonGame' })
  }if (mode === 'voice') {
    router.push({ name: 'SimonPosture' })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

.menu-container {
  background-image: url('/images/simon-background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #2f4f4f;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100vw;
  height: 100vh;

  font-family: 'Permanent Marker', cursive;
  color: #f0f0f0;

  padding: 20px;
  box-sizing: border-box;
}

.page-title {
  font-size: 4rem;
  color: #ffffff;
  margin-bottom: 40px;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.5),
    3px 3px 2px rgba(234, 255, 208, 0.5),
    -3px -3px 2px rgba(255, 253, 208, 0.5);
}

.mode-selection {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  width: 90%;
  max-width: 1000px;
}

.mode-box {
  background-color: rgba(0, 0, 0, 0.25);

  border: 4px solid #b0a030;
  border-radius: 20px;

  padding: 25px;
  width: 45%;

  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
}

.mode-box:hover {
  transform: scale(1.05);
  border-color: #fffdd0;

  box-shadow: 0 0 15px rgba(255, 253, 208, 0.7);
}

.mode-title {
  font-size: 2.5rem;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
}

.mode-description {
  font-family: 'Arial', sans-serif;

  font-size: 1.1rem;
  color: #e0e0e0;

  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);

  line-height: 1.5;
  text-align: left;
}

.back-button {
  background: none;
  border: none;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.8rem;
  color: #e0e0e0;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-top: 20px;
  text-decoration: none;
}

.back-button:hover {
  color: #ffffff;
  transform: scale(1.1);
  text-shadow:
    0 0 6px rgba(255, 255, 255, 0.8),
    1px 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
