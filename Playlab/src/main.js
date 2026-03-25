import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAudioStore } from './games/simon-gesture/Logic/AudioStore'

const app = createApp(App)

const audioStore = useAudioStore()

router.afterEach((to) => {
  console.log("Cambio de ruta:", to.name)
  audioStore.playMusicForRoute(to.name)
})

app.use(router)

app.mount('#app')
