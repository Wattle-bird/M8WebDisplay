// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Launchpad from "./launchpad.js"

export const background = []

for (let x = 0; x < 9; x++) {
    background.push([]);
    for (let y = 0; y < 9; y++) {
        background[x].push([0, 0, 0]);
    }
}

export function set(x, y, color) {
    const cell = x + 10*y + 11;
    color = color.map(c => Math.min(c, 127))
    Launchpad.sendSysex([3, 3, cell, ...color]); // Sysex event 3, lighting type 3 (RGB)
}

export function highlight(x, y) {
    const bg = background[x][y];
    const color = bg.map(c => Math.min(c*2, 127));
    if (color[0] + color[1] + color[2] < 64) {
        color[0] += 48
        color[1] += 48
        color[2] += 48
    }
    set(x, y, color);
}

export function clear(x, y) {
    const color = background[x][y];
    set(x, y, color);

}

export function start() {
    // Note button
    background[5][8] = [0, 64, 64];
    highlight(5, 8);

    // Custom button (to toggle control pad)
    background[6][8] = [64, 32, 0];
    clear(6, 8)

}