import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    this.add.text(width / 2, height / 2 - 50, 'Snake Eater', {
      fontSize: '32px',
      color: '#fff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20, 'Presiona ENTER para jugar', {
      fontSize: '18px',
      color: '#0f0'
    }).setOrigin(0.5);

    const controllerType = this.registry.get('controllerType') || 'keyboard';
    console.log('Tipo de control recibido:', controllerType);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene', { controllerType: controllerType });
    });
  }
}
