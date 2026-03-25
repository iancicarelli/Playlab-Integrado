<template>
  <div class="snake-game-container">
    <GameSnakeHUD />
    <div id="snake-game"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, defineProps, defineEmits } from 'vue'
import createPhaserGame from './core/Game'
import GameSnakeHUD from './components/GameSnakeHUD.vue'

const props = defineProps({
  controller: {
    type: String,
    default: 'keyboard'
  }
})

const emit = defineEmits(['voice-direction', 'voice-listening'])
let gameInstance = null

function handleVoiceDirection(event) {
  emit('voice-direction', event.detail)
}

function handleVoiceListening(event) {
  emit('voice-listening', event.detail)
}

onMounted(() => {
  gameInstance = createPhaserGame('snake-game', {
    gameData: { controllerType: props.controller }
  })

  if (props.controller === 'voice') {
    window.addEventListener('voice-direction', handleVoiceDirection)
    window.addEventListener('voice-listening', handleVoiceListening)
  }
})

onBeforeUnmount(() => {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }

  if (props.controller === 'voice') {
    window.removeEventListener('voice-direction', handleVoiceDirection)
    window.removeEventListener('voice-listening', handleVoiceListening)
  }
})
</script>

<style scoped>
.snake-game-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  height: 100%;
}

#snake-game {
  z-index: 1;
}
</style>
