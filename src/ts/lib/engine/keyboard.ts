export class keyboard {

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

export class Keyboard {

  public static state: Map<string, boolean> = new Map();

  public static initialize() {
    document.addEventListener("keydown", Keyboard.keyDown);
    document.addEventListener("keyup", Keyboard.keyUp);
  }

  public static keyDown(e: KeyboardEvent) {
    Keyboard.state.set(e.code, true);
  }

  public static keyUp(e: KeyboardEvent) {
    Keyboard.state.set(e.code, false);
  }

}
