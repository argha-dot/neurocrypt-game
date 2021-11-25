import { Container, Graphics, Sprite, Spritesheet, TextStyle, Texture, Text } from "pixi.js";
import { Box, fretInterface } from "../../interfaces";
import Note from "../note";

class keyboard {

  private code: string;

  public isDown: boolean;
  public isUp: boolean;
  public press?: () => void;
  public release?: () => void;


  constructor(keyCode: string) {
    this.code = keyCode;
    this.isDown = false;
    this.isUp = true;

    this.addListeners();
  }

  private downHandler = (e: KeyboardEvent) => {
    if (e.key === this.code) {
      if (this.isUp && this.press) this.press();
      this.isDown = true;
      this.isUp = false;
    }

    e.preventDefault();
  }

  private upHandler = (e: KeyboardEvent) => {
    if (e.key === this.code) {
      if (this.isDown && this.release) this.release();
      this.isDown = false;
      this.isUp = true;
    }

    e.preventDefault();
  }

  private addListeners = () => {
    window.addEventListener("keydown", this.downHandler.bind(this), false);
    window.addEventListener("keyup", this.upHandler.bind(this), false);
  }

  public removeListners = () => {
    window.removeEventListener("keydown", this.downHandler.bind(this));
    window.removeEventListener("keyup", this.upHandler.bind(this));
  } 
}

/**
 * Commonly used keys, contains `arrow keys`, `w a s d`, `space`, `shift` and `esc`
 * @returns map of keys
 */
const consoleKeys = () => {
  return {
    right: new keyboard("ArrowRight"),
    left: new keyboard("ArrowLeft"),
    up: new keyboard("ArrowUp"),
    down: new keyboard("ArrowDown"),
    w: new keyboard("w"),
    s: new keyboard("s"),
    a: new keyboard("a"),
    d: new keyboard("d"),
    space: new keyboard(" "),
    shift: new keyboard("Shift"),
    esc: new keyboard("Escape")
  }
}

/**
 * 
 * @param entity The entity which collides
 * @param container The box with which it collides
 * @returns The direction of collision.
 */
const contains = (entity: Box, container: Box): string | undefined => {

  let collision = undefined;

  // Left
  if (entity.x < container.x) {
    collision = "left";
  }

  // Right
  if (entity.x + entity.width > container.x + container.width) {
    collision = "right";
  }

  // Top
  if (entity.y < container.y) {
    collision = "top";
  }

  // Bottom
  if (entity.y + entity.height > container.y + container.height) {
    collision = "bottom";
  }

  return collision;
}

/**
 * 
 * @param min minimum number
 * @param max maximum number
 * @returns A random number between both of 'em
 */
const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gives the distance between two objects
 * @param x1 x co-ord of object 1
 * @param y1 y co-ord of object 1
 * @param x2 x co-ord of object 2
 * @param y2 y co-ord of object 2
 * @returns the distance between object 1 and object 2
 */
const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function circleCollisionCheck(c1: Box | Sprite, c2: Box | Sprite) {
  let hit = false;

  if (getDistance(c1.x, c1.y, c2.x, c2.y) < c1.width / 2 + c2.width / 2) {
    hit = true;
  }

  return hit;
}

const rectCollisionCheck = (rect1: Box | Sprite, rect2: Box | Sprite) => {
  let hit = false;

  let vx = (rect1.x + rect1.width / 2) - (rect2.x + rect2.width / 2);
  let vy = (rect1.y + rect1.height / 2) - (rect2.y + rect2.height / 2);

  let combinedHalfWidth = rect1.width / 2 + rect2.width / 2;
  let combinedHalfHeight = rect1.height / 2 + rect2.height / 2;

  if (Math.abs(vx) < combinedHalfWidth) {
    if (Math.abs(vy) < combinedHalfHeight) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }

  return hit;
}

/**
 * Creates a blank sprite with origin at top-left
 * @param x The x co-ord of the sprite
 * @param y The y co-ord of the sprite
 * @param width the width of the sprite
 * @param height the height of the sprite
 * @param color the color of the sprite, defaults to white
 * @returns Sprite object
 */
const createBlankSprite = (x: number, y: number, width: number, height: number, color: number = 0x000000) => {
  let sprite = new Sprite(Texture.WHITE);
  sprite.width = width;
  sprite.height = height;

  sprite.tint = color;
  sprite.position.set(x, y);

  return sprite;
}

const createCircle = (x: number, y: number, radius: number, color: number) => {
  let circle = new Graphics();
  circle.beginFill(color);
  circle.drawCircle(0, 0, radius);
  circle.endFill();

  circle.position.set(x, y);

  return circle;
}

/**
 * 
 * @param baseTexture Base texture from the png. Use `app.loader.resources["sprite"].texture.baseTexture` to get the baseTexture
 * @param jsonData Json data of the sprite map
 * @returns a map of all the sprites to there name
 */
const loadTextures = (baseTexture: Texture["baseTexture"], jsonData: any) => {
  let id!: Spritesheet["textures"];
  const sheet = new Spritesheet(baseTexture, jsonData);

  sheet.parse(() => {
    id = sheet.textures;
  });

  return id;
}

function createText(x: number, y: number, text: string, container: Container | Sprite, style?: TextStyle) {
  let message = new Text(text, style);

  container.addChild(message);
  message.position.set(x, y);

  return message;
}

function collisionCheck(fret: fretInterface, note: Note) {
  return getDistance(
    fret.fret.x + fret.fret.width / 2,
    fret.fret.y + fret.fret.height / 2,
    note.x,
    note.y
  ) < fret.fret.height / 2 + note.width / 2;

}


export {
  keyboard,
  consoleKeys,
  contains,
  randomInt,
  getDistance,
  circleCollisionCheck,
  collisionCheck,
  rectCollisionCheck,
  createBlankSprite,
  createCircle,
  loadTextures,
  createText,
}
