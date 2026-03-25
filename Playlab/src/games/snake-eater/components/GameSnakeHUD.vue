<template>
  <div class="hud">
    <div class="score">Puntaje: {{ score }}</div>

    <div v-if="gameOver" class="game-over">
      <strong>GAME OVER</strong>
      <div class="final-score">Puntaje final: {{ score }}</div>
      <div class="restart">Presiona ENTER para volver a jugar</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ScoreService from '../services/ScoreService'
import { api, GAME_IDS } from '@/services/api'

const score = ref(0)
const gameOver = ref(false)

function handleScoreUpdate(newScore) {
  score.value = newScore
}

async function handleGameOver() {
  gameOver.value = true
  if (api.isAuthenticated()) {
    try {
      await api.postScore(GAME_IDS.SNAKE, score.value)
      console.log('Score submitted successfully')
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }
}

function handleGameReset() {
  gameOver.value = false
  score.value = 0
}

function handleRestart(event) {
  if (gameOver.value && event.code === 'Enter') {
    window.dispatchEvent(new CustomEvent('snake-restart-game'))
    gameOver.value = false
  }
}

onMounted(() => {
  ScoreService.onChange(handleScoreUpdate)
  window.addEventListener('snake-game-over', handleGameOver)
  window.addEventListener('snake-game-reset', handleGameReset)
  window.addEventListener('keydown', handleRestart)
})

onBeforeUnmount(() => {
  window.removeEventListener('snake-game-over', handleGameOver)
  window.removeEventListener('snake-game-reset', handleGameReset)
  window.removeEventListener('keydown', handleRestart)
})
</script>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: 'Courier New', monospace;
  color: #fff;
  z-index: 10;
}

.score {
  font-size: 26px;
  margin: 20px;
  font-weight: bold;
  -webkit-text-stroke: 0.5px black;
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #ff0000;
  font-size: 32px;
  background: rgba(0, 0, 0, 0.7);
  padding: 25px 35px;
  border-radius: 10px;
  animation: fadeIn 0.8s ease-in-out;
  pointer-events: auto;
}

.final-score {
  color: #00ff00;
  margin-top: 10px;
  font-size: 22px;
  font-weight: bold;
}

.restart {
  color: #cccccc;
  font-size: 18px;
  margin-top: 8px;
  font-weight: bold;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style>
