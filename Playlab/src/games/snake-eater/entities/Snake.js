export default class Snake {
  constructor(x, y, gridSize = 1, maxLength = 5) {
    this.gridSize = gridSize;
    this.segments = [{ x, y }];
    this.direction = 'right';
    this.pendingDirection = null;
    this.maxLength = maxLength;
    this.alive = true;
  }

  setDirection(dir) {
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (opposites[dir] === this.direction) return;
    this.pendingDirection = dir;
  }

  step() {
    if (!this.alive) return;
    if (this.pendingDirection) {
      this.direction = this.pendingDirection;
      this.pendingDirection = null;
    }

    const head = { ...this.segments[0] };
    if (this.direction === 'up') head.y -= 1;
    if (this.direction === 'down') head.y += 1;
    if (this.direction === 'left') head.x -= 1;
    if (this.direction === 'right') head.x += 1;

    this.segments.unshift(head);
    if (this.segments.length > this.maxLength) this.segments.pop();
  }

  grow(amount = 1) {
    this.maxLength += amount;
  }

  checkSelfCollision() {
    const [head, ...body] = this.segments;
    return body.some(seg => seg.x === head.x && seg.y === head.y);
  }

  headPosition() {
    return this.segments[0];
  }
}
