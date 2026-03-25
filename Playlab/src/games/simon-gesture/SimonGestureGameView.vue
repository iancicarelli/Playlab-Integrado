<template>
  <div class="simon-game">
    <div id="webcam-container" ref="webcamContainer"></div>
    <div id="label-container" ref="labelContainer"></div>
    <div id="p5-container" ref="p5Container"></div>

    <button v-if="!gameStarted && modelLoaded" @click="startGame" class="start-button">
      ¡Iniciar!
    </button>

    <router-link :to="{ name: 'SimonMenu' }" class="back-button">MENÚ</router-link>
  </div>
</template>

<script src="./Logic/SimonGestureGame.js"></script>

<style scoped src="./style/SimonGestureGame.css"></style>
