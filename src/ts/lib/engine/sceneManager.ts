import { Application } from "pixi.js";
import { sceneInterface } from "../../interfaces/";

export default class SceneManager {

    private app: Application;
    private scenes: { [name: string]: sceneInterface };
    private current: string | null;

    constructor(app: Application) {
        this.app = app;
        this.scenes = {};
        this.current = null;
        app.ticker.add(this.update.bind(this));
    }

    private update(delta: number): void {
        let active: sceneInterface | null = this.active;
        if (active) {
            active.update(delta);
        }
    }

    /**
     * Adds a scene to the scene manager.
     * @param name Name of the scene to be added
     * @param scene The scene object to be added
     * @returns nothing
     */
    public add(name: string, scene: sceneInterface): void {
        if (!name || this.sceneExists(name)) {
            console.error("Scene with same name already exists!!");
            return
        };

        this.scenes[name] = scene;
        // scene.app = this.app;
        // scene.scenes = this;
    }

    /**
     * 
     * @param name Remove a scene from the manager
     * @returns {boolean} whether the operation was successful
     */
    public remove(name: string): boolean {
        if (!name || !this.sceneExists(name)) {
            console.error("Scene doesn't exist!")
            return false;
        };

        if (this.current === name) this.stop();

        const scene = this.scenes[name];
        scene.app = null;
        scene.scenes = null;

        if (scene.isInitialized) {
            scene.destroy();
            scene.isInitialized = false;
        }

        delete this.scenes[name];
        return true;
    }

    /**
     * 
     * @param {string} name name of the new scene to be started;
     */
    public start(name: string): void {
        if (!name || !this.sceneExists(name) || this.current === name) return;

        this.stop();

        this.current = name;
        const newScene = this.scenes[this.current];
        if (newScene) {
            if (!newScene.isInitialized) {
                newScene.init();
                newScene.isInitialized = true;
            }
            this.app.stage.addChild(newScene);
            newScene.start();
        }
    }

    /**
     * Stops the active scene from running and un sets it from the manager.
     */
    public stop(): void {
        let active: sceneInterface | null = this.active;
        if (active) {
            this.current = null;
            active.stop();
            this.app.stage.removeChild(active);
        }
    }

    private sceneExists(name: string): boolean {
        return name in this.scenes;
    }

    public get active(): sceneInterface | null {
        return this.current ? this.scenes[this.current] : null;
    }
}