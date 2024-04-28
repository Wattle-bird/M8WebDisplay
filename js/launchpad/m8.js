// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Midi from '../midi.js'

export function matchName(name) {
    return name.includes("M8");
}

export function sendMidi(data) {
    Midi.sendMidiTo(matchName, data);
}

export function sendNote(note, velocity) {
    sendMidi([0x90, note, velocity]);
}