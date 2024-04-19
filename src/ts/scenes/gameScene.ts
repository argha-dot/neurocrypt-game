import Note from "../lib/note";
import oneSound from "../../../static/audio/one.mp3";
import twoSound from "../../../static/audio/two.mp3";
import threeSound from "../../../static/audio/three.mp3";
import noiseSound from "../../../static/audio/noise.mp3";
import SceneManager from "../lib/engine/sceneManager";
import Scene, { propType } from "../lib/engine/scene";

import { db } from "../lib/firebase";
import { Howl } from "howler";
import { store } from "../redux";
import { subBlockGen, authBlockGen } from "../lib/sequenceGen";
import { collisionCheck, randomInt } from "../lib/engine/helper";
import {
  dataToSend,
  fretInterface,
  gameDataInterface,
  userInterface,
} from "../interfaces";
import {
  Application,
  BitmapText,
  Container,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";
import { Keyboard } from "../lib/engine/keyboard";

interface propInterface {
  app: Application;
  sceneManager: SceneManager;
  props?: propType;
}

const typeIsTrain = (type: string): boolean => {
  return type.includes("TRAIN");
};

const typeIsAuth = (type: string): boolean => {
  return type.includes("AUTH");
};

class GameScene extends Scene {
  private gameSpace;
  private scoreSpace;
  private pauseSpace;

  private hitsText;
  private missesText;
  private hitRateText;

  private WINDOW_WIDTH = this.app.view.width; // 800
  private WINDOW_HEIGHT = this.app.view.height; // 600
  private GAME_WIDTH = this.WINDOW_WIDTH - 200; // 600
  private KEYS = "sdfjkl";
  private FONT_SETTINGS = {
    fontName: "Defont",
    tint: 0x000000,
    fontSize: 24,
  };

  private NOISE_SOUND = new Howl({
    src: [noiseSound],
    loop: true,
    volume: 0.2,
  });
  private FRET_SOUND = {
    one: new Howl({ src: [oneSound], volume: 0.4 }),
    two: new Howl({ src: [twoSound], volume: 0.4 }),
    three: new Howl({ src: [threeSound], volume: 0.4 }),
  };
  private GAME_DATA!: gameDataInterface;
  private TOTAL_GAMES!: number;
  private gameNunber = 0;

  private user: userInterface;

  private noteInterval!: NodeJS.Timer;
  private frets: fretInterface[];
  private fretKeys: string[]; // Keyboard objects
  private isPaused: boolean = true;

  private noteTimer = 0;
  private noteGenerateLag = 30;
  private noteSpeed = 4;

  private noise_vol = 0.3;

  private notes: Note[];
  private indexOfNote = 0;
  private prevIndexOfNote = 0;
  private noteSequence: string[] = [];

  private subBlockMetrics = {
    misses: 0,
    hits: 0,
    hitRate: 0,
  };

  private passMetrics = {
    misses: 0,
    hits: 0,
    hitRate: 0,
  };

  private noiseMetrics = {
    misses: 0,
    hits: 0,
    hitRate: 0,
  };

  private misses = 0;
  private hits = 0;
  private hitRate = 0;

  private dataToSend: dataToSend;

  constructor(
    app: Application,
    sceneManager: SceneManager,
    props?: propInterface
  ) {
    super(app, sceneManager, props);

    this.gameSpace = new Container();
    this.scoreSpace = new Container();
    this.pauseSpace = new Container();

    this.user = store.getState().user.value;
    store.subscribe(() => {
      this.user = store.getState().user.value;
      console.log(this.user);
      this.GAME_DATA = store.getState().gameData.value;
      console.log(
        typeIsTrain(this.GAME_DATA.SESSION)
          ? "[TRAINING MODE]"
          : "[AUTHENTICATION MODE]"
      );

      this.noteSequence = typeIsTrain(this.GAME_DATA.SESSION)
        ? subBlockGen(this.user.passSeq)
        : authBlockGen(this.user.passSeq);
      this.TOTAL_GAMES = typeIsTrain(this.GAME_DATA.SESSION) ? 7 : 1;
    });

    this.hitsText = new BitmapText(`Hits - ${this.hits}`, this.FONT_SETTINGS);
    this.missesText = new BitmapText(
      `Misses - ${this.misses}`,
      this.FONT_SETTINGS
    );
    this.hitRateText = new BitmapText(
      `Hit Rate: ${this.hitRate.toFixed(2)}`,
      this.FONT_SETTINGS
    );

    this.frets = [];
    this.fretKeys = ["KeyS", "KeyD", "KeyF", "KeyJ", "KeyK", "KeyL"];
    this.notes = [];

    this.dataToSend = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      block: [],
      session: "",
    };
  }

  private _keyToIndex = (key: string): number => {
    const obj: { [index: string]: number } = {
      S: 0,
      D: 1,
      F: 2,
      J: 4,
      K: 5,
      L: 6,
    };

    return obj[key.toUpperCase()];
  };

  private _blockOver = () => {
    console.log("[BLOCK OVER]");
    this.dataToSend = {
      ...this.dataToSend,
      block: [
        ...this.dataToSend.block,
        {
          gameNunber: this.gameNunber,
          noiseMetrics: this.noiseMetrics,
          subBlockMetrics: this.subBlockMetrics,
          passMetrics: this.passMetrics,
        },
      ],
    };

    this.scenes.start("over");
  };

  private _gameOver(): void {
    console.log("[GAME OVER]");

    this.dataToSend = {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hitRate,
      session: this.GAME_DATA.SESSION,
      block: [
        ...this.dataToSend.block,
        {
          gameNunber: this.gameNunber,
          noiseMetrics: this.noiseMetrics,
          subBlockMetrics: this.subBlockMetrics,
          passMetrics: this.passMetrics,
        },
      ],
    };

    const ref = db.ref(this.user.uid);
    ref.push(this.dataToSend).then(() => console.log("[DATA PUSHED]"));
    ref.child("noteSpeed").set(this.noteSpeed);
    ref.child("noteGenerateLag").set(this.noteGenerateLag);

    this.scenes.start("finish");
  }

  private _setupPause = () => {
    const pauseBg = new Sprite(Texture.WHITE);
    pauseBg.tint = 0x333333;
    pauseBg.width = this.GAME_WIDTH;
    pauseBg.height = this.WINDOW_HEIGHT;
    pauseBg.alpha = 0.5;

    const press = new BitmapText("press", this.FONT_SETTINGS);
    const space = new BitmapText("SPACE", {
      fontName: "Defont_two",
      tint: 0x000000,
      fontSize: 64,
    });
    const to = new BitmapText("to", this.FONT_SETTINGS);
    const play = new BitmapText("PLAY", {
      fontName: "Defont_two",
      tint: 0x000000,
      fontSize: 64,
    });

    press.position.set(
      pauseBg.width / 2 - press.width / 2,
      pauseBg.height / 2 - space.height - press.height
    );
    space.position.set(
      pauseBg.width / 2 - space.width / 2,
      pauseBg.height / 2 - space.height
    );
    to.position.set(pauseBg.width / 2 - to.width / 2, pauseBg.height / 2);
    play.position.set(
      pauseBg.width / 2 - play.width / 2,
      pauseBg.height / 2 + to.height
    );

    this.pauseSpace.addChild(pauseBg);
    this.pauseSpace.addChild(press, space, to, play);
    this.addChild(this.pauseSpace);
  };

  private _setupScene = () => {
    const gameBg = new Sprite(Texture.WHITE);
    gameBg.width = this.GAME_WIDTH;
    gameBg.height = this.WINDOW_HEIGHT;

    const scoreBg = new Sprite(Texture.WHITE);
    scoreBg.tint = 0x444444;
    scoreBg.width = this.WINDOW_WIDTH - this.GAME_WIDTH - 10;
    scoreBg.height = this.WINDOW_HEIGHT - 10;
    scoreBg.position.set(5, 5);

    this.gameSpace.addChild(gameBg);
    this.scoreSpace.addChild(scoreBg);

    this.scoreSpace.position.set(this.GAME_WIDTH, 0);

    const scoreBoardTitle = new BitmapText("SCORES", this.FONT_SETTINGS);
    scoreBoardTitle.position.set(
      scoreBg.width / 2 - scoreBoardTitle.width / 2,
      50
    );
    this.scoreSpace.addChild(scoreBoardTitle);

    this.hitsText.position.set(
      scoreBg.width / 2 - this.hitsText.width / 2,
      100
    );
    this.scoreSpace.addChild(this.hitsText);

    this.missesText.position.set(
      scoreBg.width / 2 - this.missesText.width / 2,
      150
    );
    this.scoreSpace.addChild(this.missesText);

    this.hitRateText.position.set(
      scoreBg.width / 2 - this.hitRateText.width / 2,
      200
    );
    this.scoreSpace.addChild(this.hitRateText);

    this.addChild(this.gameSpace);
    this.addChild(this.scoreSpace);
  };

  private _createFrets = () => {
    const keyFonts = this.KEYS.split("").map(
      (k) => new BitmapText(k, this.FONT_SETTINGS)
    );

    for (let i = 0; i < 7; i++) {
      const offsetX = 20 + 15;
      const gap = 80;

      if (i === 3) continue;

      const fret = new Sprite(Texture.WHITE);
      fret.width = 60;
      fret.height = 20;
      fret.tint = 0x000000;

      const keyFont = keyFonts[i > 2 ? i - 1 : i];
      keyFont.position.set(
        offsetX + i * gap + fret.width / 2 + keyFont.width / 2,
        this.WINDOW_HEIGHT - 55
      );

      fret.position.set(
        offsetX + i * gap + (gap - fret.width) / 2,
        this.WINDOW_HEIGHT - 80
      );
      this.frets.push({ fret, isPressed: false });
      this.gameSpace.addChild(fret, keyFont);
    }
  };

  private _createLines = () => {
    for (let i = 0; i < 8; i++) {
      const offsetX = 20 + 15;
      const gap = 80;

      const line = new Graphics();
      if (this.GAME_DATA.VIS) {
        line.lineStyle(12, 0x000000, 1);
      } else {
        line.lineStyle(12, 0x000000, 1);
      }

      line.moveTo(offsetX + i * gap, 100);
      line.lineTo(offsetX + i * gap, this.WINDOW_HEIGHT - 40);

      if (i === 0 || i === 7) {
        line.lineStyle(2, 0x000000, 1);

        line.moveTo(offsetX + i * gap, 40);
        line.lineTo(offsetX + i * gap, this.WINDOW_HEIGHT - 20);
      }

      this.gameSpace.addChild(line);
    }
  };

  private _keyInputs = (): void => {
    this.fretKeys.forEach((key, i, arr) => {
      if (Keyboard.state.get(key)) {
        let isOtherKeyDown = false;
        arr
          .filter((otherKey) => otherKey !== key)
          .forEach((otherKey) => {
            if (Keyboard.state.get(otherKey)) {
              isOtherKeyDown = true;
            }
          });

        if (!isOtherKeyDown) {
          // if (this.GAME_DATA.AUD) {
          //   switch (i) {
          //     case 0:
          //       if (!this.frets[i].isPressed) this.FRET_SOUND.one.play();
          //       break;
          //     case 1:
          //       if (!this.frets[i].isPressed) this.FRET_SOUND.two.play();
          //       break;
          //     case 2:
          //       if (!this.frets[i].isPressed) this.FRET_SOUND.three.play();
          //       break;
          //     case 3:
          //       if (!this.frets[i].isPressed) this.FRET_SOUND.two.play();
          //       break;
          //     case 4:
          //       if (!this.frets[i].isPressed) this.FRET_SOUND.three.play();
          //       break;
          //     case 5:
          //       if (!this.frets[i].isPressed) this.FRET_SOUND.one.play();
          //       break;
          //
          //     default:
          //       this.FRET_SOUND.one.play();
          //       break;
          //   }
          // }

          this.frets[i].isPressed = true;
        }
      } else {
        this.frets[i].isPressed = false;
      }
    });

    /* const escKey = new keyboard("Escape");
    escKey.release = () => {
      this.NOISE_SOUND.stop();
      this.isPaused = true;
      this._blockOver();
    } */

    /* const spaceKey = new keyboard(" ");
    spaceKey.release = () => {
      this.isPaused = false;

      if (this.GAME_DATA.AUD) {
        if (!this.NOISE_SOUND.playing())
          this.NOISE_SOUND.play()
        else
          this.NOISE_SOUND.pause();
      }
    } */
  };

  private _generateNote(n: number, isPass?: boolean): void {
    let noteOffsetX = 60 + 15,
      noteGapX = 80;

    let x;
    while (true) {
      x = n === -1 || n === 3 ? randomInt(0, 6) : n;

      if (x !== 3) break;
    }

    const note = new Note(
      0,
      this.noteSpeed,
      noteOffsetX + x * noteGapX,
      isPass
    );
    this.notes.push(note);
    this.gameSpace.addChild(note);
  }

  private _genNoteSequence(): void {
    // console.log(this.indexOfNote, this.noteSequence.length - 1);

    if (this.indexOfNote > this.noteSequence.length - 1) {
      if (this.indexOfNote < 5 * 108 - 1 && this.user.passSeq) {
        const subBlock = typeIsAuth(this.GAME_DATA.SESSION)
          ? authBlockGen(this.user.passSeq)
          : subBlockGen(this.user.passSeq);
        this.noteSequence = [...this.noteSequence, ...subBlock];
      } else {
        if (!this.notes.length) {
          if (this.TOTAL_GAMES - this.gameNunber) {
            this._blockOver();
          } else {
            this._gameOver();
          }
        }
      }
    } else {
      if (this.noteSequence.length >= this.indexOfNote) {
        const currentNote = this.noteSequence[this.indexOfNote];
        this._generateNote(
          this._keyToIndex(currentNote),
          currentNote === currentNote.toUpperCase()
        );

        this.indexOfNote += 1;
      }
    }
  }

  private _killNotes(note: Note, index: number) {
    note.clear();
    this.notes.splice(index, 1);
  }

  private _noiseControl(): void {
    if (this.hitRate < 0.69) {
      this.noise_vol += 0.05;
    } else if (this.hitRate > 0.71) {
      this.noise_vol -= 0.05;
    }

    if (this.noise_vol < 0.05) {
      this.noise_vol = 0.05;
    } else if (this.noise_vol > 0.6) {
      this.noise_vol = 0.5;
    }

    this.NOISE_SOUND.volume(this.noise_vol);
  }

  private _noteSpeedControl() {
    const alpha = 10;
    const beta = 25;
    const desiredHitRate = 0.7;

    this.noteSpeed = Math.floor(
      this.noteSpeed - (desiredHitRate - this.hitRate) * alpha
    );
    this.noteGenerateLag = Math.floor(
      this.noteGenerateLag + (desiredHitRate - this.hitRate) * beta
    );

    if (this.noteSpeed < 3) {
      this.noteSpeed = 3;
    } else if (this.noteSpeed > 12) {
      this.noteSpeed = 12;
    }

    if (this.noteGenerateLag > 55) {
      this.noteGenerateLag = 55;
    } else if (this.noteGenerateLag < 20) {
      this.noteGenerateLag = 20;
    }
  }

  private _isIthBlock(i: number, callback: () => void) {
    if (
      this.indexOfNote !== this.prevIndexOfNote &&
      this.indexOfNote % i === 0 &&
      this.indexOfNote !== 0
    ) {
      callback();
    }

    this.prevIndexOfNote = this.indexOfNote;
  }

  public init() {
    this._setupScene();
    this._createFrets();
    this._createLines();
    this._setupPause();
  }

  public start(): void {
    this.gameNunber += 1;
    /* this.noteInterval = setInterval(() => {
      if (!this.isPaused) this._genNoteSequence();
    }, 500); */

    this.noteSpeed = typeIsAuth(this.GAME_DATA.SESSION)
      ? this.user.noteSpeed
      : this.noteSpeed;
    this.noteGenerateLag = typeIsAuth(this.GAME_DATA.SESSION)
      ? this.user.noteGenerateLag
      : this.noteGenerateLag;

    console.log("Game Number", this.gameNunber);
  }

  public update(_delta: number): void {
    if (!this.user.uid) this.scenes.start("start");

    if (Keyboard.state.get("Space")) {
      this.isPaused = false;

      // if (this.GAME_DATA.AUD) {
      //   if (!this.NOISE_SOUND.playing()) this.NOISE_SOUND.play();
      // }
    }

    if (!this.isPaused) {
      // console.log(_delta)
      this.pauseSpace.visible = false;

      this.noteTimer =
        this.noteTimer > 0 ? --this.noteTimer : this.noteGenerateLag;
      if (this.noteTimer === 0) {
        this._genNoteSequence();
      }

      this._isIthBlock(20, () => {
        this._noiseControl();
        this._noteSpeedControl();
        // console.log("[CALLBACK SUCCESS]")
      });

      this.frets.forEach((fret) => {
        if (fret.isPressed) {
          fret.fret.tint = 0x555555;
        } else {
          fret.fret.tint = 0x000000;
        }
      });

      this.notes.forEach((note, index): void => {
        note.move(_delta);

        note.induceEpilepsy();

        this.frets.forEach((fret) => {
          if (collisionCheck(fret, note)) {
            if (fret.isPressed) {
              this._killNotes(note, index);

              this.hits += 1;
              this.subBlockMetrics.hits += 1;

              this.hitRate = this.hits / (this.misses + this.hits);
              this.subBlockMetrics.hitRate =
                this.subBlockMetrics.hits /
                (this.subBlockMetrics.misses + this.subBlockMetrics.hits);

              this.hitsText.text = `Hits: ${this.hits}`;
              this.hitRateText.text = `Hit Rate: ${this.hitRate.toFixed(2)}`;

              if (note.isPass) {
                this.passMetrics.hits += 1;
                this.passMetrics.hitRate =
                  this.passMetrics.hits /
                  (this.passMetrics.misses + this.passMetrics.hits);
              } else {
                this.noiseMetrics.hits += 1;
                this.noiseMetrics.hitRate =
                  this.noiseMetrics.hits /
                  (this.noiseMetrics.misses + this.noiseMetrics.hits);
              }
            }
          }
        });

        if (note.y > this.WINDOW_HEIGHT + 50) {
          this._killNotes(note, index);

          this.misses += 1;
          this.subBlockMetrics.misses += 1;

          this.hitRate = this.hits / (this.misses + this.hits);
          this.subBlockMetrics.hitRate =
            this.subBlockMetrics.hits /
            (this.subBlockMetrics.misses + this.subBlockMetrics.hits);

          if (note.isPass) {
            this.passMetrics.misses += 1;
            this.passMetrics.hitRate =
              this.passMetrics.hits /
              (this.passMetrics.misses + this.passMetrics.hits);
          } else {
            this.noiseMetrics.misses += 1;
            this.noiseMetrics.hitRate =
              this.noiseMetrics.hits /
              (this.noiseMetrics.misses + this.noiseMetrics.hits);
          }

          this.hitsText.text = `Hits: ${this.hits}`;
          this.missesText.text = `Misses: ${this.misses}`;
          this.hitRateText.text = `Hit Rate: ${this.hitRate.toFixed(2)}`;
        }
      });

      this._keyInputs();
    } else {
      this.pauseSpace.visible = true;
    }
  }

  public stop(): void {
    clearInterval(this.noteInterval);

    this.NOISE_SOUND.stop();
    this.isPaused = true;

    console.table(this.passMetrics);
    console.table(this.noiseMetrics);
    console.table(this.subBlockMetrics);

    this.notes.forEach((note) => {
      note.clear();
    });
    this.notes = [];
    this.indexOfNote = 0;
    this.prevIndexOfNote = 0;
    this.noteSequence = [];

    this.subBlockMetrics = {
      misses: 0,
      hits: 0,
      hitRate: 0,
    };

    this.noiseMetrics = {
      misses: 0,
      hits: 0,
      hitRate: 0,
    };

    this.passMetrics = {
      misses: 0,
      hits: 0,
      hitRate: 0,
    };
  }
}

export default GameScene;
