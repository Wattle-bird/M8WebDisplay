// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Midi from '../midi.js';
import * as M8 from './m8.js';
import * as Input from '../input.js';
import * as Lights from './lights.js';

const controlButtons = ['start', 'select', 'option', 'edit', 'left', 'down', 'up', 'right'];

let controlPadEnabled = true;

export function matchName(name) {
    return name.includes("Launchpad") && !name.includes("DAW");
}

function sendMidi(data) {
    Midi.sendMidiTo(matchName, data);
}

export function sendSysex(data) {
    data = [0xf0, 0x00, 0x20, 0x29, 0x02, 0x0c].concat(data); // Launchpad sysex prefix
    data.push(0xf7); // Sysex suffix
    sendMidi(data);
}

function sendNote(note, velocity) {
    sendMidi([0x90, note, velocity]);
}

function cellPosition(cell) {
    const x = cell % 10 - 1;
    const y = Math.floor(cell / 10) - 1;
    return [x, y];
}

function cellToNote(cell) {
    const [x, y] = cellPosition(cell);
    return 36 + (y*4) + x;
}

function handleControlButton(x, y, isDown) {
    let button
    if (y === 6) {
        if (x === 0) {
            button = 'left'
        } else if (x === 1) {
            button = 'down'
        } else if (x === 2) {
            button = 'right'
        } else if (x === 6) {
            button = 'select'
        } else if (x === 7) {
            button = 'start'
        }
    }
    else if (y === 7) {
        if (x === 1) {
            button = 'up'
        } else if (x === 6) {
            button = 'option'
        } else if (x === 7) {
            button = 'edit'
        }
    }
    if (button)
        Input.sendButton(button, isDown ? "depress" : "release");
}

function handleNote(noteNum, velocity) {
    const [x, y] = cellPosition(noteNum);
    if (velocity !== 0) {
        Lights.highlight(x, y);
    } else {
        Lights.clear(x, y);
    }

    console.log(x, y)
    if (y >= 6 && controlPadEnabled) {
        handleControlButton(x, y, velocity !== 0);
        return;
    }


    M8.sendNote(cellToNote(noteNum), velocity);
}

export function handleInput(data) {
    const messageType = data[0];
    if (messageType === 0xf0) return; // don't forward sysex
    if (messageType === 0x90) { // note on
        handleNote(data[1], data[2]);
    }
    
}

export function start() {
    sendSysex([0x00, 0x7f]) // enable programmer mode
}