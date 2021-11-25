import { Graphics } from "pixi.js";


class Note extends Graphics {

  public vx;
  public vy;

  public colorTimer;
  public shouldColorChange;
  public colorChangeTime;
  public isPass?: boolean;

  constructor(vx: number, vy: number, xPos: number, isPass?: boolean) {
    super();
    this.vx = vx;
    this.vy = vy;

    this.beginFill(0xffffff);
    this.drawCircle(0, 0, 20);
    this.endFill();

    this.position.set(xPos, -100);

    this.tint = 0x000000;

    this.shouldColorChange = false;
    this.colorChangeTime = 3;
    this.colorTimer = 1;

    this.isPass = isPass ?? isPass;
  }


  public move(delta: number) {
    this.y += this.vy * delta;
  }

  public induceEpilepsy() {
    this.colorTimer = this.colorTimer > 0 ? --this.colorTimer : this.colorChangeTime;
    // console.log(this.colorTimer);

    if (this.colorTimer === 0 && this.y < 600 - 120) {
      this.shouldColorChange = !this.shouldColorChange;
    } else {
      this.shouldColorChange = false
    }

    if (this.shouldColorChange) {
      this.tint = 0xffffff;
    }

    else {
      this.tint = 0x000000;
    }
  }
}


export default Note;
