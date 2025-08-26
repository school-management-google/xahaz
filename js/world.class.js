'use strict';

/*
 * Part of ON.OFF
 */

class World {
    constructor(worldModel) {
        this._scene = new THREE.Scene();

        this._objects = {};

        this._world = worldModel;
        this._world.traverse(node => this._objects[node.name] = node);
        this._world.traverse(node => {
            if (node.material !== undefined) {
                node.material.shininess = 0;
                node.frustumCulled = false;
            }
        });

        this._scene.add(this._world);

        this._humanMixer = new THREE.AnimationMixer(this._objects.HumanRig);
        this._monsterMixer = new THREE.AnimationMixer(this._objects.MonsterRig);
        this._humanMixer.addEventListener('finished', e => e.action.callback());
        this._monsterMixer.addEventListener('finished', e => e.action.callback());

        this._objects.AmbientLight = new THREE.AmbientLight(0xffffff, 0);
        this._world.add(this._objects.AmbientLight);

        this._objects.Camera.fov = 28;
        this._objects.Camera.aspect = 2;
        this._objects.Camera.updateProjectionMatrix();

        this._objects.SwitchLight.distance = 0.055;

        this._objects.Lamp.castShadow = true;
        this._objects.Lamp.target = this._objects.Switch;
        this._objects.Lamp.shadow.mapSize.width = 2048;
        this._objects.Lamp.shadow.mapSize.height = 2048;

        this._objects.Wall.receiveShadow = true;
        this._objects.SwitchCover.receiveShadow = true;
        this._objects.Switch.receiveShadow = true;
        this._objects.Cable.receiveShadow = true;
        this._objects.HumanArm.receiveShadow = true;

        this._objects.Wall.material.normalScale.set(5, 5);

        this._objects.HumanHead.castShadow = true;
        this._objects.HumanArm.castShadow = true;
        this._objects.MonsterBody.castShadow = true;
        this._objects.MonsterArm.castShadow = true;
        this._objects.MonsterRightArm.castShadow = true;
        this._objects.MonsterHead.castShadow = true;
        this._objects.MonsterRoofHead.castShadow = true;

        this._objects.Title.material = new THREE.MeshBasicMaterial({ map: this._objects.Title.material.map });

        this._readyForInput = true;
        this._switchOn = false;
        this._lightOn = false;
        this._switchMoveDuration;
        this._switchMoveTimeLeft = 0;
        this._progress = 0;
        this._timeInDark = 0;
        this._timeUntilLightning = 0;
        this._lightningDuration;
        this._lightningTimeLeft = 0;
        this._monsterJitter = false;
    }

    _playAction(mixer, actionName, fadeInDuration = 0.5, timeScale = 1, callback = () => {}) {
        mixer.stopAllAction();
        const action = mixer.clipAction(this._world.animations.find(animation => animation.name === actionName));
        action.callback = callback;
        action.repetitions = 1;
        action.time = 0;
        action.timeScale = timeScale;
        action.clampWhenFinished = true;
        action.fadeIn(fadeInDuration).play();
    }

    _switchLight() {
        this._lightOn = !this._lightOn;
        this._objects.SwitchLight.intensity = this._lightOn ? 0 : 1;

        this._readyForInput = true;
        this._timeInDark = 0;

        Audio.stop('hidden');

        switch (this._progress) {
            case 0:
                Audio.play('sound__rain', 1, 'rain', true);

                this._objects.Title.visible = false;
                this._timeUntilLightning = 3;

                this._progress = 1;
                break;
            case 2:
                this._progress = 3;
                break;
            case 4:
                this._progress = 5;
                break;
            case 8:
                this._objects.MonsterBody.position.set(0, 0, 0);

                this._progress = 9;
                break;
            case 10:
                Audio.play('sound__risset', 1, 'risset');

                this._objects.MonsterBodyContainer2.getWorldPosition(this._objects.MonsterBody.position);

                this._timeUntilLightning = Infinity;
                this._readyForInput = false;
                this._monsterJitter = true;

                this._progress = 11;

                setTimeout(() => {
                    Audio.play('sound__thunder_1');

                    this._timeUntilLightning = 5;
                    this._lightningDuration = 1.5;
                    this._lightningTimeLeft = this._lightningDuration;
                    this._switchOn = false;
                    this._switchMoveDuration = 0.5;
                    this._switchMoveTimeLeft = this._switchMoveDuration;
                    this._switchLight();

                    this._progress = 12;

                    setTimeout(() => Audio.stop('risset', 0.7), 1500);
                    setTimeout(() => {
                        this._objects.MonsterBody.position.set(0, 0, 0);

                        this._monsterJitter = false;
                    }, 2000);
                }, 1000);
                break;
            case 14:
                this._objects.SwitchLight.intensity = 0;

                this._readyForInput = false;

                this._progress = 15;
                break;
        }
    }

    update(context) {
        if (!this._lightOn) {
            this._timeInDark += context.elapsedSeconds;
        }

        switch (this._progress) {
            case 1:
                if (this._timeInDark > 3) {
                    Audio.play('sound__creaking_door', 0.5);

                    this._progress = 2;
                }
                break;
            case 3:
                if (this._timeInDark > 4) {
                    Audio.play('sound__creaking_floor', 0.5, 'hidden');

                    this._timeInDark = 0;

                    this._progress = 5;
                }
                break;
            case 5:
                if (this._timeInDark > 4) {
                    Audio.play('sound__creaking_floor', 0.8, 'hidden');

                    this._timeInDark = 0;

                    this._progress = 6;
                }
                break;
            case 6:
                if (this._timeInDark > 5) {
                    Audio.play('sound__scrape', 0.4);

                    this._timeInDark = 0;

                    this._progress = 7;
                }
                break;
            case 7:
                if (this._timeInDark > 3) {
                    Audio.play('sound__thunder_1')

                    this._objects.MonsterBodyContainer1.getWorldPosition(this._objects.MonsterBody.position);

                    this._timeUntilLightning = 8;
                    this._lightningDuration = 1;
                    this._lightningTimeLeft = this._lightningDuration;

                    this._progress = 8;

                    setTimeout(() => this._objects.MonsterBody.position.set(0, 0, 0), 1600);
                }
                break;
            case 9:
                if (this._timeInDark > 0.5) {
                    this._progress = 10;
                }
                break;
            case 12:
                if (this._timeInDark > 2) {
                    this._objects.Wall.material.map = this._objects.BloodyWallTexture.material.map;

                    this._progress = 13;
                }
                break;
            case 15:
                if (this._timeInDark > 9) {
                    Audio.stop('rain');

                    this._objects.Wall.material.map = this._objects.BloodiedWallTexture.material.map;
                    this._objects.MonsterRoofHead.position.copy(this._objects.MonsterHeadContainer.position);
                    this._objects.MonsterArm.visible = false;

                    this._lightningDuration = 2;
                    this._lightningTimeLeft = this._lightningDuration;

                    this._progress = 16;

                    setTimeout(() => {
                        this._objects.MonsterRoofHead.visible = false;
                        document.getElementById('credits').style.visibility = 'visible';
                        document.getElementsByTagName('canvas')[0].style.visibility = 'hidden';
                    }, 8500);
                }
                break;
            case 16:
                this._objects.MonsterRoofHead.rotateZ(-context.elapsedSeconds * 0.1);
                break;
        }

        if (this._timeUntilLightning > 0) {
            this._timeUntilLightning -= context.elapsedSeconds;
            if (this._timeUntilLightning <= 0) {
                this._timeUntilLightning = 20 + Math.random() * 30;
                this._lightningDuration = 1;
                this._lightningTimeLeft = this._lightningDuration;

                setTimeout(() => Audio.play('sound__thunder_2'), Math.random() * 2000);
            }
        }

        let lightningStrength = 0;
        if (this._lightningTimeLeft > 0) {
            this._lightningTimeLeft = Math.max(0, this._lightningTimeLeft - context.elapsedSeconds);
            lightningStrength = this._lightningTimeLeft / this._lightningDuration;
        }

        this._objects.Lamp.color = new THREE.Color(0xee5b29).lerp(new THREE.Color(0x185dff), lightningStrength);
        this._objects.Lamp.intensity = (this._lightOn ? 0.2 : 0) + lightningStrength * 2;
        this._objects.AmbientLight.color = new THREE.Color(0xffffff).lerp(new THREE.Color(0x185dff), lightningStrength);
        this._objects.AmbientLight.intensity = (this._lightOn ? 0.2 : 0) + lightningStrength * 0.5;

        if (this._readyForInput && context.mouseClicked) {
            this._readyForInput = false;
            if (this._progress === 13 && this._lightOn) {
                this._progress = 14;

                setTimeout(() => Audio.play('sound__scare', 0.5), 600);
                setTimeout(() => Audio.play('sound__monster', 0.3), 10000);
                setTimeout(() => Audio.play('sound__thunder_1'), 11500);

                this._timeUntilLightning = Infinity;

                this._playAction(this._humanMixer, 'HumanRig|HumanTurnOffInterupted');
                this._playAction(this._monsterMixer, 'MonsterRig|MonsterTurnOffStart', 0.5, 1,
                    () => {
                        Audio.play('sound__switch', 0.8);

                        this._playAction(this._monsterMixer, 'MonsterRig|MonsterTurnOffEnd', 0.5, 1.5);

                        this._switchMoveDuration = 0.25;
                        this._switchMoveTimeLeft = this._switchMoveDuration;
                        this._switchOn = !this._switchOn;

                        setTimeout(this._switchLight.bind(this), 150);
                    }
                );
            } else {
                this._playAction(this._humanMixer, this._lightOn ? 'HumanRig|HumanTurnOffStart' : 'HumanRig|HumanTurnOnStart', 0.5, 1,
                    () => {
                        Audio.play('sound__switch', 0.8);

                        this._playAction(this._humanMixer, this._lightOn ? 'HumanRig|HumanTurnOffEnd' : 'HumanRig|HumanTurnOnEnd', 0.5, 1.5);

                        this._switchMoveDuration = 0.25;
                        this._switchMoveTimeLeft = this._switchMoveDuration;
                        this._switchOn = !this._switchOn;

                        setTimeout(this._switchLight.bind(this), 150);
                    }
                );
            }
        }

        if (this._switchMoveTimeLeft > 0) {
            this._switchMoveTimeLeft = Math.max(0, this._switchMoveTimeLeft - context.elapsedSeconds);
            const l = this._switchMoveTimeLeft / this._switchMoveDuration;
            this._objects.Switch.rotation.set((this._switchOn ? 1 : -1) * (0.36 - 0.72 * l), 0, 0);
        }

        if (this._progress < 16) {
            this._objects.HumanHead.position.set(Math.sin(context.totalSeconds) * 0.01, 0, 0);
        }

        if (this._monsterJitter) {
            this._objects.MonsterHead.rotation.set(0, 0, Math.random() * 0.6 - 0.3);
            this._objects.MonsterRightArm.rotation.set(0, 0, Math.random() * 0.2 - 0.1);
        }

        const switchPosition = new THREE.Vector3();
        this._objects.Switch.getWorldPosition(switchPosition);
        this._objects.Camera.lookAt(switchPosition);

        this._humanMixer.update(context.elapsedSeconds);
        this._monsterMixer.update(context.elapsedSeconds);

        context.renderer.render(this._scene, this._objects.Camera);
    }
}
