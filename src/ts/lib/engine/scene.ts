import { Application, Container } from "pixi.js";
import { sceneInterface } from "../../interfaces/";
import SceneManager from "./sceneManager";


export interface propType {
    [index: string]: any;
}

export default class Scene extends Container implements sceneInterface {

    public app;
    public scenes;
    public isInitialized: boolean;
    public props?: propType;

    constructor(app: Application, sceneManager: SceneManager, props?: propType) {
        super();
        this.app = app;
        this.scenes = sceneManager;
        this.isInitialized = false;
        this.props = props;
    }

    public init(): void { }

    public destroy(): void { }

    public start(): void { }

    public stop(): void { }

    public update(_delta: number): void { }
}