import { Sprite } from "pixi.js";
import { dataToSend } from "./dataToSend";
import { sceneInterface } from "./sceneInterface";

interface gameDataInterface {
  gameVer: number;
  AUD: boolean;
  VIS: boolean;
  SESSION: string;
  [index: string]: any;
}

interface userInterface {
  uid: string;
  passSeq: string[];
  noteSpeed: number;
  noteGenerateLag: number;
  [index: string]: any;
}

/**
 * A 2D rectangle, consists of x co-ord, y co-ord, width and height
 */
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  [index: string]: any;
}

interface fretInterface {
  fret: Sprite;
  isPressed: boolean;
}

export {
  dataToSend,
  gameDataInterface,
  sceneInterface,
  userInterface,
  fretInterface,
  Box,
};
