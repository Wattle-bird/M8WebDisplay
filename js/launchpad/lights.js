// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Launchpad from "./launchpad.js"

function send(x, y, color) {
    const cell = x + 10*y + 11;
    color = color.map(c => Math.min(c, 127))
    Launchpad.sendSysex([3, 3, cell, ...color]); // Sysex event 3, lighting type 3 (RGB)
}

function sendAll(display) {
    const lightingMessage = []
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            const cell = x + 10*y + 11;
            lightingMessage.push(3, cell, ...display[x][y]);
        }
    }
    Launchpad.sendSysex([3, ...lightingMessage]); // Sysex event 3, lighting type 3 (RGB)

}

export function render() {
    const display = [];

    // fill with black
    for (let x = 0; x < 9; x++) {
        display.push([]);
        for (let y = 0; y < 9; y++) {
            display[x].push([0, 0, 0]);
        }
    }

    // light the Note mode button
    display[5][8] = [0, 100, 100];

    // light or dim the Custom button
    display[6][8] = Launchpad.controlPadEnabled? [100, 50, 0] : [25, 25, 25]

    // highlight depressed notes
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (Launchpad.notesDown.includes    (Launchpad.positionToNote(x, y))) {
                display[x][y] = [64, 64, 64];
            }
        }
    }

    if (Launchpad.controlPadEnabled) {
        // clear the space
        for (let x = 0; x < 8; x++) {
            for (let y = 6; y < 8; y++) {
                display[x][y] = [0, 0, 0];
            }
        }

        display[1][7] = Launchpad.controlsDown.includes('up')? [64, 32, 127] : [25, 0, 50];
        display[0][6] = Launchpad.controlsDown.includes('left')? [64, 32, 127] : [25, 0, 50];
        display[1][6] = Launchpad.controlsDown.includes('down')? [64, 32, 127] : [25, 0, 50];
        display[2][6] = Launchpad.controlsDown.includes('right')? [64, 32, 127] : [25, 0, 50];

        display[7][7] = Launchpad.controlsDown.includes('edit')? [64, 32, 127] : [25, 0, 50];
        display[6][7] = Launchpad.controlsDown.includes('option')? [32, 127, 127] : [0, 50, 50];
        display[7][6] = Launchpad.controlsDown.includes('start')? [127, 64, 32] : [50, 25, 0];
        display[6][6] = Launchpad.controlsDown.includes('select')? [64, 32, 127] : [25, 0, 50];
    }

    sendAll(display);
}