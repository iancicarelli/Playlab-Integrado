class ScoreService {
  constructor() {
    this.score = 0;
    this.listeners = [];
  }

  add(points) {
    this.score += points;
    this._emit();
  }

  get() {
    return this.score;
  }

  reset() {
    this.score = 0;
    this._emit();
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  _emit() {
    this.listeners.forEach(fn => fn(this.score));
  }
}

export default new ScoreService();