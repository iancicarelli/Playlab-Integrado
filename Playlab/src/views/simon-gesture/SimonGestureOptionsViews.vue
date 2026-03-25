<template>
  <div class="options-container">
    <h1 class="page-title">Opciones</h1>

    <div class="options-list">
      <div class="option-item">
        <label for="volume-slider">Volumen del Juego</label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="100"
          v-model="audioStore.volume.value"
          class="chalk-slider"
        />
        <span class="slider-value">{{ audioStore.volume.value }}%</span>
      </div>

      <div class="option-item">
        <label for="camera-select">Posición de la Cámara</label>
        <select id="camera-select" v-model="cameraPosition" class="chalk-select">
          <option value="left">Izquierda</option>
          <option value="right">Derecha</option>
        </select>
      </div>
    </div>

    <button class="back-button" @click="goBack">Volver al Menú</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAudioStore } from '@/games/simon-gesture/Logic/AudioStore.js'

const router = useRouter()
const audioStore = useAudioStore()

const cameraPosition = ref('right')
const micSensitivity = ref(50)

watch(cameraPosition, (newValue) => {
  console.log(`Posición de cámara: ${newValue}`)
})

watch(micSensitivity, (newValue) => {
  console.log(`Sensibilidad de Micrófono: ${newValue}`)
})

const goBack = () => {
  console.log('Guardando opciones y volviendo al menú...')
  router.push({ name: 'SimonMenu' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

.options-container {
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
  margin-bottom: 50px;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.5),
    3px 3px 2px rgba(234, 255, 208, 0.5),
    /* Verde */
    -3px -3px 2px rgba(255, 253, 208, 0.5),
    /* Amarillo */
    3px -3px 2px rgba(255, 229, 208, 0.5); /* Naranja */
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 35px;
  width: 90%;
  max-width: 600px;

  background-color: rgba(0, 0, 0, 0.25);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 40px;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.option-item label {
  font-size: 2rem;
  color: #e0e0e0;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  margin-bottom: 20px;
}

.chalk-select {
  font-family: 'Permanent Marker', cursive;
  font-size: 1.5rem;
  color: #e0e0e0;
  background: rgba(0, 0, 0, 0.4);

  border: 3px solid #b0a030;
  border-radius: 10px;

  padding: 10px 15px;
  cursor: pointer;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23E0E0E0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2013l128%20128c3.6%203.6%207.8%205.4%2013%205.4s9.4-1.8%2013-5.4l128-128c3.6-3.6%205.4-7.8%205.4-13%200-5-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 15px top 50%;
  background-size: 0.65em auto;
}

.chalk-select:hover {
  border-color: #fffdd0;
  box-shadow: 0 0 10px rgba(255, 253, 208, 0.5);
}

.chalk-select option {
  background: #2f4f4f;
  color: #e0e0e0;
  font-size: 1.2rem;
}

.chalk-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80%;
  height: 10px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #a0a0a0;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
}

.chalk-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 30px;
  background: #ffffff;
  border: 2px solid #a0a0a0;
  border-radius: 5px;
  margin-top: -12px;
  transition: 0.2s;
}

.chalk-slider::-moz-range-thumb {
  width: 20px;
  height: 30px;
  background: #ffffff;
  border: 2px solid #a0a0a0;
  border-radius: 5px;
  cursor: pointer;
}

.chalk-slider:hover::-webkit-slider-thumb,
.chalk-slider:hover::-moz-range-thumb {
  background: #f0f0f0;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}

.slider-value {
  margin-top: 10px;
  font-size: 1.2rem;
  color: #c0c0c0;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
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
}

.back-button:hover {
  color: #ffffff;
  transform: scale(1.1);
  text-shadow:
    0 0 6px rgba(255, 255, 255, 0.8),
    1px 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
