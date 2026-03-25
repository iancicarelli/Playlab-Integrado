import { createRouter, createWebHistory } from 'vue-router'
import LandingpageView from '@/views/LandingpageView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import SimonMenuView from '@/views/simon-gesture/SimonMenuView.vue'
import SimonGestureInfoView from '@/views/simon-gesture/SimonGestureInfoView.vue'
import SimonGestureOptionsView from '@/views/simon-gesture/SimonGestureOptionsViews.vue'
import SimonGestureGameView from '@/games/simon-gesture/SimonGestureGameView.vue'
import SimonGameOverView from '@/games/simon-gesture/SimonGameOverView.vue'
import UfoWelcome from '@/views/ufo-evader/UfoWelcome.vue'
import UfoEvader from '@/games/ufo-evader/UfoEvader.vue'
import SnakeWelcomeView from '@/views/snake-eater/SnakeWelcomeView.vue'
import SnakeInstructions from '@/views/snake-eater/SnakeInstructions.vue'
import SnakeGameView from '@/views/snake-eater/SnakeGameView.vue'
import DinoGestureRush from '@/games/dino-rush/DinoGestureRush.vue'
import DinoWelcome from '@/views/dino-rush/DinoWelcome.vue'
import SimonGesturePostureView from '@/games/simon-gesture/SimonGesturePostureView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingpageView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
    },
    {
      path: '/games/simon-gesture',
      name: 'SimonMenu',
      component: SimonMenuView,
    },
    {
      path: '/games/simon-gesture/info',
      name: 'SimonInfo',
      component: SimonGestureInfoView,
    },
    {
      path: '/games/simon-gesture/play',
      name: 'SimonGame',
      component: SimonGestureGameView,
    },
    {
      path: '/games/simon-gesture/options',
      name: 'SimonOptions',
      component: SimonGestureOptionsView,
    },
    {
      path: '/games/simon-gesture/game-over',
      name: 'SimonGameOver',
      component: SimonGameOverView,
    },
    {
      path: '/games/simon-gesture/PlayPosture',
      name: 'SimonPosture',
      component: SimonGesturePostureView,
    },
    {
      path: '/games/ufo-evader',
      name: 'UfoWelcome',
      component: UfoWelcome,
    },
    {
      path: '/games/ufo-evader/play',
      name: 'UfoEvader',
      component: UfoEvader,
    },
    {
      path: '/games/snake-eater',
      name: 'SnakeWelcome',
      component: SnakeWelcomeView,
    },
    {
      path: '/games/snake-eater/instructions',
      name: 'SnakeInstructions',
      component: SnakeInstructions,
    },
    {
      path: '/games/snake-eater/play',
      name: 'SnakeGame',
      component: SnakeGameView,
    },
    {
      path: '/games/dino-rush/play',
      name: 'DinoGestureRush',
      component: DinoGestureRush,
    },
    {
      path: '/games/dino-rush',
      name: 'DinoWelcome',
      component: DinoWelcome,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
