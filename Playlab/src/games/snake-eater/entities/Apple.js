export default class Apple {
  constructor(x, y, type = 'normal', ttl = null) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.ttl = ttl;
    this.spawnAt = Date.now();
  }

  isExpired() {
    if (!this.ttl) return false;
    return (Date.now() - this.spawnAt) > this.ttl;
  }
}
