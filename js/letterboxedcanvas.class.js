'use strict';

/*
 * Part of ON.OFF
 */

function LetterboxedCanvas(canvas, manualUpdate = false) {
    this._canvas = canvas;
    this._scale = 1;
    this._barSize = [0, 0];

    if (!manualUpdate) {
        window.addEventListener('resize', this.updateLetterboxing.bind(this));
        this.updateLetterboxing();
    }
}

LetterboxedCanvas.prototype.updateLetterboxing = function() {
    const windowAspectRatio = window.innerWidth / window.innerHeight;
    const canvasAspectRatio = this._canvas.width / this._canvas.height;

    if (windowAspectRatio > canvasAspectRatio) {
        this._scale = window.innerHeight / this._canvas.height;
        this._barSize[0] = (window.innerWidth - (window.innerHeight * canvasAspectRatio)) / 2;
        this._barSize[1] = 0;
    } else {
        this._scale = window.innerWidth / this._canvas.width;
        this._barSize[0] = 0;
        this._barSize[1] = (window.innerHeight - (window.innerWidth / canvasAspectRatio)) / 2;
    }

    this._canvas.style.width = `${this._canvas.width * this._scale}px`;
    this._canvas.style.height = `${this._canvas.height * this._scale}px`;
    this._canvas.style.left = `${this._barSize[0]}px`;
    this._canvas.style.top = `${this._barSize[1]}px`;
}

LetterboxedCanvas.prototype.getCanvas = function() {
    return this._canvas;
}

LetterboxedCanvas.prototype.getCanvasScale = function() {
    return this._scale;
}

LetterboxedCanvas.prototype.getBarSize = function() {
    return this._barSize.slice(0);
}

LetterboxedCanvas.prototype.windowToCanvasPosition = function(position) {
    return [
        (position[0] - this._barSize[0]) / this._scale,
        (position[1] - this._barSize[1]) / this._scale];
}

LetterboxedCanvas.prototype.canvasToWindowPosition = function(position) {
    return [
        (position[0] * this._scale + this._barSize[0]),
        (position[1] * this._scale + this._barSize[1])];
}
