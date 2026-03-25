import { ref, onMounted, watch } from 'vue';

const globalVolume = ref(80);

const musicMap = {
  'SimonMenu': '/audio/simonMusic.mp3',
  'SimonInfo': '/audio/simonMusic.mp3',
  'SimonGame': '/audio/simonMusic.mp3',
  'SimonOptions': '/audio/simonMusic.mp3',
  'SimonGameOver': '/audio/simonMusic.mp3',
  'SimonPosture': '/audio/simonMusic.mp3',
};


const audio = ref(null);
const currentRouteName = ref('');

export function useAudioStore() {

  onMounted(() => {
    if (!audio.value) {
      audio.value = new Audio();
      audio.value.loop = true;

      audio.value.volume = globalVolume.value / 100;

      audio.value.addEventListener('ended', () => {
        if (audio.value.loop) {
          audio.value.currentTime = 0;
          audio.value.play().catch(e => console.error("Error re-reproduciendo audio:", e));
        }
      });
    }
  });


  watch(globalVolume, (newVolumePercentage) => {
    if (audio.value) {

      audio.value.volume = newVolumePercentage / 100;
    }
  }, { immediate: true });


  /**
   * Carga y reproduce el tema musical para la ruta dada.
   * Si la ruta no está en musicMap, pausa la reproducción.
   * @param {string} routeName - El nombre de la ruta de Vue Router.
   */
  const playMusicForRoute = async (routeName) => {
    if (!audio.value) return;


    if (routeName === currentRouteName.value) {
      return;
    }

    const newSrc = musicMap[routeName];

    if (newSrc) {
      if (audio.value.src !== newSrc) {
        audio.value.src = newSrc;
        audio.value.currentTime = 0;
      }

      try {
        await audio.value.play();
        currentRouteName.value = routeName;
      } catch (error) {
        console.warn("La reproducción automática falló. El usuario debe interactuar con la página.", error);
      }
    } else {
      if (currentRouteName.value !== '') {
        audio.value.pause();
      }
      currentRouteName.value = '';
    }
  };


  const resumeAudio = async () => {
    if (audio.value && audio.value.paused) {
      try {
        await audio.value.play();
        console.log("Audio reanudado por interacción del usuario.");
      } catch (error) {
        console.error("No se pudo reanudar el audio:", error);
      }
    }
  };


  const setVolume = (newVolume) => {

    globalVolume.value = newVolume;
  }


  return {
    playMusicForRoute,
    resumeAudio,
    audio,
    volume: globalVolume,
    setVolume
  };
}
