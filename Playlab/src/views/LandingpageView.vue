<template>
  <div id="app">
    <header class="header">
      <button
        @click="goToLogin"
        class="absolute top-6 left-6 bg-linear-to-br from-amber-700 via-amber-500 to-amber-700 text-white font-semibold w-1/16 h-10 rounded-2xl shadow-2xl hover:scale-105 cursor-pointer transition"
      >
        Log in
      </button>

      <h1>🎮 PlayLab</h1>
      <p>Selecciona tu juego favorito</p>
    </header>

    <main class="games-container">
      <div v-for="game in games" :key="game.id" class="game-card">
        <div class="game-icon">{{ game.icon }}</div>
        <h2 class="game-title">{{ game.name }}</h2>
        <p class="game-description">{{ game.description }}</p>
        <button @click="accessGame(game.id)" class="play-button">Jugar Ahora</button>
        <button @click="openRanking(game.id)" class="ranking-button">Ver Ranking</button>
      </div>
    </main>

    <RankingModal
      v-if="showRanking"
      :title="rankingTitle"
      :entries="currentRanking"
      @close="closeRanking"
    />

    <footer class="footer">
      <p>© 2025 Playlab - Todos los derechos reservados</p>
    </footer>
  </div>
</template>

<script>
import RankingModal from '@/components/RankingModal.vue'
import { api, GAME_IDS } from '@/services/api'

export default {
  name: 'App',
  components: {
    RankingModal,
  },
  data() {
    return {
      games: [
        {
          id: 'dino-rush',
          name: 'Dino Rush',
          icon: '🦖',
          description: 'Corre y salta con el dinosaurio',
        },
        {
          id: 'snake-eater',
          name: 'Snake Eater',
          icon: '🐍',
          description: 'Come y crece sin chocarte',
        },
        {
          id: 'simon-gesture',
          name: 'Simon Gesture',
          icon: '🎨',
          description: 'Memoriza y repite la secuencia',
        },
        {
          id: 'ufo-evader',
          name: 'UFO Evader',
          icon: '🛸',
          description: 'Esquiva los obstáculos espaciales',
        },
      ],
      showRanking: false,
      rankingGame: null,
      rankingTitle: '',
      currentRanking: [],
    }
  },
  methods: {
    accessGame(gameId) {
      switch (gameId) {
        case 'dino-rush':
          this.$router.push({ name: 'DinoWelcome' })
          break
        case 'snake-eater':
          this.$router.push({ name: 'SnakeWelcome' })
          break
        case 'simon-gesture':
          this.$router.push({ name: 'SimonMenu' })
          break
        case 'ufo-evader':
          this.$router.push({ name: 'UfoWelcome' })
          break
        default:
          alert(`Próximamente: ${gameId}`)
      }
    },
    async openRanking(gameId) {
      const g = this.games.find((g) => g.id === gameId)
      this.rankingGame = gameId
      this.rankingTitle = g ? `${g.name} — Puntajes` : 'Ranking'
      this.currentRanking = []
      this.showRanking = true

      let numericGameId = 0
      switch (gameId) {
        case 'dino-rush':
          numericGameId = GAME_IDS.DINO_RUSH
          break
        case 'snake-eater':
          numericGameId = GAME_IDS.SNAKE
          break
        case 'simon-gesture':
          numericGameId = GAME_IDS.SIMON_GESTURE
          break
        case 'ufo-evader':
          numericGameId = GAME_IDS.UFO_EVADER
          break
      }

      if (numericGameId) {
        try {
          const data = await api.getLeaderboard(numericGameId)
          if (data && data.entries) {
            this.currentRanking = data.entries.map((e) => ({
              name: e.username,
              score: e.score,
            }))
          }
        } catch (error) {
          console.warn('Could not fetch leaderboard (likely empty):', error)
          this.currentRanking = []
        }
      }
    },
    closeRanking() {
      this.showRanking = false
      this.rankingGame = null
      this.currentRanking = []
      this.rankingTitle = ''
    },
    goToLogin() {
      this.$router.push({ name: 'Login' })
    },
  },
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
  display: flex;
  flex-direction: column;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/landing.png');
}

.header {
  text-align: center;
  padding: 3rem 1rem;
  color: white;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.games-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.game-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.game-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.game-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.game-description {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.play-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.play-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.play-button:active {
  transform: scale(0.95);
}

.ranking-button {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.ranking-button:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.ranking-button:active {
  transform: scale(0.95);
}

.footer {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .games-container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>
