import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import MenuScene from './scenes/MenuScene'
import GameScene from './scenes/GameScene'
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants'

export default function createPhaserGame(containerId, configOverrides = {}) {
  const baseConfig = {
    type: Phaser.AUTO,
    parent: containerId,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#111',
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scene: [BootScene, MenuScene, GameScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  }

  const game = new Phaser.Game({
    ...baseConfig,
    ...configOverrides,
  })

  if (configOverrides.gameData?.controllerType) {
    game.registry.set('controllerType', configOverrides.gameData.controllerType)
  }

  return game
}
