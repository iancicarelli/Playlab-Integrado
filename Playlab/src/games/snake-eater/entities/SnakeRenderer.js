export default class SnakeRenderer {
  constructor(scene, snake, gridSize) {
    this.scene = scene;
    this.snake = snake;
    this.gridSize = gridSize;

    this.segmentSprites = [];

    // Frames del spritesheet
    this.frames = {
      head: 321,       // único frame, se rota según dirección
      tail: 265,       // cola
      bodyRect: 257,   // cuerpo recto
      bodyCurve: 258,  // curva
    };

    // Mapa de rotaciones para curvas según prev->next
    this.curveRotationMap = {
      'up-right': Math.PI,
      'right-up': 0,
      'right-down': -Math.PI / 2,
      'down-right': Math.PI / 2,
      'down-left': 0,
      'left-down': Math.PI,
      'left-up': Math.PI / 2,
      'up-left': -Math.PI / 2,
    };

    this.createSprites();
  }

  createSprites() {
    this.snake.segments.forEach((seg) => {
      const sprite = this.scene.add.sprite(
        seg.x * this.gridSize + this.gridSize / 2,
        seg.y * this.gridSize + this.gridSize / 2,
        'snake',
        this.frames.bodyRect
      );
      sprite.setOrigin(0.5, 0.5);
      sprite.setDisplaySize(this.gridSize, this.gridSize);
      this.segmentSprites.push(sprite);
    });
  }

  update() {
    // Ajustar cantidad de sprites
    while (this.segmentSprites.length < this.snake.segments.length) {
      const sprite = this.scene.add.sprite(0, 0, 'snake', this.frames.bodyRect);
      sprite.setOrigin(0.5, 0.5);
      sprite.setDisplaySize(this.gridSize, this.gridSize);
      this.segmentSprites.push(sprite);
    }

    while (this.segmentSprites.length > this.snake.segments.length) {
      const sprite = this.segmentSprites.pop();
      sprite.destroy();
    }

    // Actualizar posiciones y rotaciones
    for (let i = 0; i < this.snake.segments.length; i++) {
      const seg = this.snake.segments[i];
      const sprite = this.segmentSprites[i];

      // Centrar sprite en la celda
      sprite.setPosition(
        seg.x * this.gridSize + this.gridSize / 2,
        seg.y * this.gridSize + this.gridSize / 2
      );
      sprite.setDisplaySize(this.gridSize, this.gridSize);

      // Cabeza
      if (i === 0) {
        const rotationMap = { up: -Math.PI / 2, right: 0, down: Math.PI / 2, left: Math.PI };
        sprite.setFrame(this.frames.head);
        sprite.setRotation(rotationMap[this.snake.direction]);
        continue;
      }

      // Cola
      if (i === this.snake.segments.length - 1) {
        const prev = this.snake.segments[i - 1];
        const dx = prev.x - seg.x;
        const dy = prev.y - seg.y;

        if (dx === 1) sprite.setRotation(0);
        else if (dx === -1) sprite.setRotation(Math.PI);
        else if (dy === 1) sprite.setRotation(Math.PI / 2);
        else if (dy === -1) sprite.setRotation(-Math.PI / 2);

        sprite.setFrame(this.frames.tail);
        continue;
      }

      // Cuerpo
      const prev = this.snake.segments[i - 1];
      const next = this.snake.segments[i + 1];

      const dxPrev = seg.x - prev.x;
      const dyPrev = seg.y - prev.y;
      const dxNext = next.x - seg.x;
      const dyNext = next.y - seg.y;

      // Determinar direcciones prev->seg y seg→next
      const dirPrev = dxPrev === 1 ? 'right' : dxPrev === -1 ? 'left' : dyPrev === 1 ? 'down' : 'up';
      const dirNext = dxNext === 1 ? 'right' : dxNext === -1 ? 'left' : dyNext === 1 ? 'down' : 'up';

      // Recto si la dirección no cambia
      if (dirPrev === dirNext || (dirPrev === 'up' && dirNext === 'down') || (dirPrev === 'down' && dirNext === 'up') || (dirPrev === 'left' && dirNext === 'right') || (dirPrev === 'right' && dirNext === 'left')) {
        sprite.setFrame(this.frames.bodyRect);
        sprite.setRotation(dirPrev === 'left' || dirPrev === 'right' ? 0 : Math.PI / 2);
      }
      // Curva
      else {
        sprite.setFrame(this.frames.bodyCurve);
        const key = `${dirPrev}-${dirNext}`;
        sprite.setRotation(this.curveRotationMap[key] ?? 0);
      }
    }
  }
}
