// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Midi from '../midi.js';
import * as M8 from './m8.js';
import * as Input from '../input.js';
import * as Lights from './lights.js';

export let controlPadEnabled = false;
export let notesDown = [];
export let controlsDown = [];

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

function cellPosition(cell) {
    const x = cell % 10 - 1;
    const y = Math.floor(cell / 10) - 1;
    return [x, y];
}

export function positionToNote(x, y) {
    return 36 + (y*4) + x;
}

function handleControlButton(x, y, isDown) {
    let control
    if (y === 6) {
        if (x === 0) {
            control = 'left'
        } else if (x === 1) {
            control = 'down'
        } else if (x === 2) {
            control = 'right'
        } else if (x === 6) {
            control = 'select'
        } else if (x === 7) {
            control = 'start'
        }
    }
    else if (y === 7) {
        if (x === 1) {
            control = 'up'
        } else if (x === 6) {
            control = 'option'
        } else if (x === 7) {
            control = 'edit'
        }
    }
    if (control) {
        Input.sendButton(control, isDown ? "depress" : "release");
        if (isDown) {
            controlsDown.push(control)
        } else {
            controlsDown = controlsDown.filter(c => c !== control);
        }
        Lights.render();
    }
}

function toggleControlPad() {
    controlPadEnabled = !controlPadEnabled;
    Lights.render()
}

function handleNote(note, velocity) {
    if (velocity) {
        notesDown.push(note);
    } else {
        notesDown = notesDown.filter(n => n !== note);
    }
    M8.sendNote(note, velocity);
    Lights.render()
}

function handleKey(x, y, velocity) {
    if (x === 6 && y === 8) {
        if (velocity) { // only trigger when button is depressed
            toggleControlPad();
            return
        }
    }

    if (x > 7 || y > 7) return; // don't do anything for the control buttons



    if (y >= 6 && controlPadEnabled) {
        handleControlButton(x, y, velocity !== 0);
        return;
    }

    handleNote(positionToNote(x, y), velocity)
}

export function handleMidiInput(data) {
    const messageType = data[0];
    if (messageType === 0xf0) return; // don't forward sysex
    if (messageType === 0x90 || messageType === 0xb0) { // note (on pads) or CC (buttons) on channel 0
        const [x, y] = cellPosition(data[1])
        handleKey(x, y, data[2]);
    }
    
}

export function start() {
    sendSysex([0x00, 0x7f]) // enable programmer mode
    Lights.render()
}

export function stop() {
    sendSysex([0x00, 0x01]) // return to note mode
}