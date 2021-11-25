import { Application, Container } from "pixi.js";
import SceneManager from "../lib/engine/sceneManager";

export interface sceneInterface extends Container {
    app: Application | null;
    scenes: SceneManager | null;
    isInitialized: boolean;
    init(): void;
    destroy(): void;
    start(): void;
    stop(): void;
    update(delta: number): void;
}