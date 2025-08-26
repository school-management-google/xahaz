'use strict';

/*
 * Part of ON.OFF
 */

class Context {
    constructor(renderer) {
        this.renderer = renderer;
        this.elapsedSeconds = 0;
        this.totalSeconds = 0;
        this.mouseClicked = false;
    }
}
