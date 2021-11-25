import { Application, BitmapText } from "pixi.js";
import Scene, { propType } from "../lib/engine/scene";
import SceneManager from "../lib/engine/sceneManager";


export default class FinishScene extends Scene {

  private WINDOW_WIDTH = this.app.view.width;       // 800
  private WINDOW_HEIGHT = this.app.view.height;     // 600

  private header;
  private FONT_SETTINGS = {
    fontName: "Defont",
    tint: 0xffffff,
    fontSize: 24
  }
  

  constructor(app: Application, sceneManager: SceneManager, props?: propType) {
    super(app, sceneManager, props);
    this.header = new BitmapText("Thanks for playing!!", this.FONT_SETTINGS);

  }

  public init(): void {
    this.position.set(this.WINDOW_WIDTH / 2 - this.header.width / 2, this.WINDOW_HEIGHT / 2 - this.header.height / 2)

    this.addChild(this.header);
  }

  public start(): void {
  }

  public update(): void {

  }
}
