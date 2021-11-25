import { Application, BitmapText, Sprite } from "pixi.js";

import Scene, { propType } from "../lib/engine/scene";
import SceneManager from "../lib/engine/sceneManager";


class OverScene extends Scene {

  private WINDOW_WIDTH = this.app.view.width;       // 800
  private WINDOW_HEIGHT = this.app.view.height;     // 600

  private timer;
  private timerText;
  private hourGlass;
  private BREAK_TIME = 20; // in seconds

  private timerInterval!: NodeJS.Timer;

  private FONT_SETTINGS = {
    fontName: "Defont_two",
    tint: 0xffffff,
    fontSize: 64
  }
  

  constructor(app: Application, sceneManager: SceneManager, props?: propType) {
    super(app, sceneManager, props);
    this.timer = 0;
    this.timerText = new BitmapText(`${this.BREAK_TIME - this.timer}`, this.FONT_SETTINGS);
    this.hourGlass = new Sprite( app.loader.resources["hour"].texture );
  }

  private _createTimer(): void {
    this.hourGlass.scale.set(0.5);
    this.hourGlass.anchor.set(0.5);
    this.hourGlass.position.set(this.WINDOW_WIDTH / 2, this.WINDOW_HEIGHT / 3);

    this.timerText.position.set(this.WINDOW_WIDTH / 2 - this.timerText.height / 2, 2 * this.WINDOW_HEIGHT / 3)

    this.addChild(this.hourGlass, this.timerText);
  }

  init() {
    this._createTimer();
  }

  start() {
    this.timerInterval = setInterval(() => {
      this.timer += 1;
    }, 1000);
  }

  update(_delta: number): void {
    this.timerText.text = `${this.BREAK_TIME - this.timer}`
    if (this.timer >= this.BREAK_TIME) {
      this.scenes.start("game");
    }
  }

  stop() {
    clearInterval(this.timerInterval);
    this.timer = 0;
  }
}

export default OverScene;
