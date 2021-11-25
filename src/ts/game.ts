import hourGlass from "../../static/images/hour.png";
import SceneManager from "./lib/engine/sceneManager";
import { gameConfig } from "../data/config.json";
import { StartScene, GameScene, OverScene, FinishScene } from "./scenes";
import { Application, BitmapFont, SCALE_MODES, settings, utils } from "pixi.js";

let type = "WebGL";
if (!utils.isWebGLSupported()) {
  type = "canvas";
}

utils.sayHello(`${type}`);

let app = new Application(gameConfig);
settings.SCALE_MODE = SCALE_MODES.NEAREST;
settings.ROUND_PIXELS = true;

BitmapFont.from("Defont", {
  fill: "#ffffff",
  fontSize: 24
}, {
  // @ts-expect-error
  chars: [['a', 'z'], ['A', 'Z'], ['0', '9'], " _-:."],
});

BitmapFont.from("Defont_two", {
  fill: "#ffffff",
  fontSize: 64
}, {
  // @ts-expect-error
  chars: [['a', 'z'], ['A', 'Z'], ['0', '9'], " _-:."],
});

app.ticker.maxFPS = 60;

app.loader
  .add("hour", hourGlass)
  .load(setup);

function setup() {
  const scenes = new SceneManager(app);

  scenes.add("start", new StartScene(app, scenes));
  scenes.add("game",  new GameScene(app, scenes));
  scenes.add("over",  new OverScene(app, scenes));
  scenes.add("finish", new FinishScene(app, scenes));

  scenes.start("start");
}

export default app;
