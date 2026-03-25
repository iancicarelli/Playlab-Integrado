export default class IController {
  init(scene) { throw new Error('init() no implementado'); }
  update() { throw new Error('update() no implementado'); }
  getDirection() { throw new Error('getDirection() no implementado'); }
  destroy() {}
}
