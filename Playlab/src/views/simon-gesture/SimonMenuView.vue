<template>
  <div class="menu-container">
    <h1 class="game-title">Simone Gesture</h1>

      <button class="music-toggle" @click="resumeAudio">
      🔊
      </button>


    <nav class="menu-buttons">
      <RouterLink :to="{ name: 'SimonInfo' }" class="menu-button">Jugar</RouterLink>
      <RouterLink :to="{ name: 'SimonOptions' }" class="menu-button">Opciones</RouterLink>
      <RouterLink :to="{ name: 'landing' }" class="menu-button">Salir</RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { useAudioStore } from '@/games/simon-gesture/Logic/AudioStore.js'

const { resumeAudio } = useAudioStore()
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
}

.game-title {
  font-size: 5rem;
  color: #ffffff;
  margin-bottom: 40px;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.5),
    3px 3px 2px rgba(234, 255, 208, 0.5),
    -3px -3px 2px rgba(255, 253, 208, 0.5),
    3px -3px 2px rgba(255, 229, 208, 0.5);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-top: 20px;
}

.menu-button {
  color: #2c2c2c;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);

  font-family: 'Permanent Marker', cursive;
  font-size: 2.5rem;
  border-radius: 50px;
  padding: 15px 50px;

  background: transparent;
  border: 3px solid transparent;
  box-shadow: none;
  text-decoration: none;

  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.menu-button:hover {
  transform: scale(1.1);
  color: #000000;
}


.menu-button:nth-child(1) {
  background-color: #6a8a4c;
  border-color: #58743f;
}
.menu-button:nth-child(1):hover {
  background-color: #7b9e59;
  box-shadow: 0 0 15px rgba(234, 255, 208, 0.8);
}

.menu-button:nth-child(2) {
  background-color: #b0a030;
  border-color: #9c8e2a;
}
.menu-button:nth-child(2):hover {
  background-color: #c7b539;
  box-shadow: 0 0 15px rgba(255, 253, 208, 0.8);
}

.menu-button:nth-child(3) {
  background-color: #a95c32;
  border-color: #8f4d2a;
}
.menu-button:nth-child(3):hover {
  background-color: #c26b3a;
  box-shadow: 0 0 15px rgba(255, 229, 208, 0.8);
}

/* --- Nuevo botón de música --- */
.music-toggle {
  position: absolute;
  top: 20px;
  right: 20px;

  font-size: 2.2rem;
  background-color: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;

  border-radius: 50%;
  width: 60px;
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: all 0.2s ease-in-out;

  font-family: 'Permanent Marker', cursive;
  text-shadow: 2px 2px 2px #00000055;
}

.music-toggle:hover {
  transform: scale(1.15);
  background-color: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 10px rgba(255, 253, 208, 0.8);
}
</style>
