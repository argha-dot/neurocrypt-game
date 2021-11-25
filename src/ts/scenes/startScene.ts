import { Application, Sprite, Text, Texture } from "pixi.js";
import { userInterface } from "../interfaces";
import { createText } from "../lib/engine/helper";
import { Keyboard } from "../lib/engine/keyboard";
import Scene, { propType } from "../lib/engine/scene";
import SceneManager from "../lib/engine/sceneManager";
import { store } from "../redux";


export default class StartScene extends Scene {

  private background: Sprite;
  private button: Sprite;
  private user: userInterface;
  private title: Text;


  constructor(app: Application, sceneManager: SceneManager, props?: propType) {
    super(app, sceneManager, props);

    this.background = new Sprite(Texture.WHITE);
    this.background.tint = 0x333333; // #333
    this.background.width = this.app.view.width;
    this.background.height = this.app.view.height;

    this.button = new Sprite(Texture.WHITE);
    this.button.width = 48 + 16;
    this.button.height = 32;
    this.button.anchor.set(0.5);

    this.button.position.set(this.app.view.width / 2, this.app.view.height / 2 + 25)
    this.title = createText(this.app.view.width / 2, 200, "SASTA GUITAR HERO PRO", this);
    this.title.anchor.set(0.5);

    this.user = store.getState().user.value;
    store.subscribe(() => {
      this.user = store.getState().user.value;
    });
  }

  public init(): void {
    this.addChild(this.background);
    this.addChild(this.button);
    this.addChild(this.title);

    const buttonText = createText(0, 0, "START", this.button);
    buttonText.anchor.set(0.5);
    buttonText.width = 15;
    buttonText.height = 15;

    this.button.addChild(buttonText);
    this.button.interactive = true;

    Keyboard.initialize();

    this.button.on('pointerup', () => {
      if (this.user.uid) this.scenes.start("game");
      else alert("Please Login");
    });
  }

  public start(): void {
  }

  public update(_delta: number): void {
    if (Keyboard.state.get("ArrowRight")) {
      console.log("hello")
    }

  }
}
