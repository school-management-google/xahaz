'use strict';

/*
 * Part of ON.OFF
 */

class Audio {
    static _init() {
        Audio._sounds = new Map();
        Audio._byTag = new Map();
    }

    static registerAudio(name, audio, baseVolume = 1) {
        Audio._sounds.set(name, { audio, baseVolume });
    }

    static play(soundName, volume = 1, tag = null, loop = false, stopTag = true, ignoreIfSame = true) {
        const sound = Audio._sounds.get(soundName);

        if (sound === undefined) {
            throw new Error(`Sound "${soundName}" does not exist`);
        }
        if (tag !== null) {
            if (Audio._byTag.get(tag) === sound && ignoreIfSame) {
                return;
            }
            if (stopTag) {
                Audio.stop(tag);
            }
            Audio._byTag.set(tag, sound);
        }
        sound.audio.currentTime = 0;
        sound.audio.volume = volume * sound.baseVolume;
        sound.audio.loop = loop;
        sound.audio.play();
    }

    static stop(tag) {
        const sound = Audio._byTag.get(tag);
        Audio._byTag.delete(tag);
        if (sound !== undefined) {
            sound.audio.pause();
        }
    }
}

Audio._init();
