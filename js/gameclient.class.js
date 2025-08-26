'use strict';

/*
 * Part of ON.OFF
 */

class GameClient {
    constructor() {
        Audio.registerAudio('sound__creaking_door', document.querySelector('#sound__creaking_door'), 1);
        Audio.registerAudio('sound__creaking_floor', document.querySelector('#sound__creaking_floor'), 1);
        Audio.registerAudio('sound__monster', document.querySelector('#sound__monster'), 1);
        Audio.registerAudio('sound__rain', document.querySelector('#sound__rain'), 1);
        Audio.registerAudio('sound__risset', document.querySelector('#sound__risset'), 1);
        Audio.registerAudio('sound__scrape', document.querySelector('#sound__scrape'), 1);
        Audio.registerAudio('sound__switch', document.querySelector('#sound__switch'), 1);
        Audio.registerAudio('sound__thunder_1', document.querySelector('#sound__thunder_1'), 1);
        Audio.registerAudio('sound__thunder_2', document.querySelector('#sound__thunder_2'), 1);
        Audio.registerAudio('sound__scare', document.querySelector('#sound__scare'), 1);

        const loader = new THREE.FBXLoader();
        new Promise((resolve, reject) => {
            return loader.load('models/world.fbx', model => {
                this._worldModel = model;
                resolve();
            }, () => {}, error => reject(error))
        }).then(() => {
            setTimeout(this._init.bind(this), 1000);
        });
    }

    _init() {
        const width = 640;
        const height = 320;

        this._clock = new THREE.Clock(false);

        this._canvas = document.querySelector('canvas');

        this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas });
        this._renderer.setSize(width, height);
        this._renderer.shadowMap.enabled = true;

        this._letterboxedCanvas = new LetterboxedCanvas(this._canvas);

        this._context = new Context(this._renderer);

        const credits = document.getElementById('credits');
        const showCredits = document.getElementById('show-credits');

        credits.style.visibility = 'hidden';

        this._canvas.addEventListener('click', () => {
            if (credits.style.visibility === 'hidden') {
                this._context.mouseClicked = true
                showCredits.style.visibility = 'hidden';
            }
        }, false);

        document.getElementById('show-credits').addEventListener('click', e => {
            if (credits.style.visibility === 'hidden') {
                credits.style.visibility = 'visible';
            } else {
                credits.style.visibility = 'hidden';
            }
            e.stopPropagation();
        });

        this._world = new World(this._worldModel);

        this._clock.start();

        this._render();
    }

    _render() {
        requestAnimationFrame(this._render.bind(this));

        this._context.elapsedSeconds = this._clock.getDelta();
        this._context.totalSeconds += this._context.elapsedSeconds;

        this._world.update(this._context);

        this._context.mouseClicked = false;
    }
}
