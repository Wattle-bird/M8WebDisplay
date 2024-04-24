// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Midi from '../midi.js'


const m8 = "M8 MIDI 1";
const launchpad = "Launchpad X LPX MIDI In";

function launchpadSysex(data) {
    const sendData = [0xf0, 0x00, 0x20, 0x29, 0x02, 0x0c].concat(data); // Launchpad sysex prefix
    sendData.push(0xf7); // Sysex suffix
    Midi.sendMidiTo(launchpad, sendData);
}

function xyToNote(xy) {
    const x = xy % 16;
    const y = (xy - x) / 16;
}

function handleLaunchpadNote(noteNum, velocity) {
    if (velocity !== 0) {
        Midi.sendMidiTo(launchpad, [0x90, noteNum, 0x24]); // note on. light up the pressed pad
    } else {
        Midi.sendMidiTo(launchpad, [0x90, noteNum, 0x0]); // note on. dim the pressed pad
    }
    Midi.sendMidiTo(m8, [0x90, noteNum, velocity]);
}

export function handleLaunchpadInput(data) {
    const messageType = data[0];
    if (messageType === 0xf0) return; // don't forward sysex
    if (messageType === 0x90) { // note on
        handleLaunchpadNote(data[1], data[2]);
    }
    
}

export function start() {
    launchpadSysex([0x00, 0x7f]) // enable programmer mode
}