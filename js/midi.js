// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

import * as Launchpad from "./launchpad/launchpad.js";

let midi;
let midiInputs = [];
let forwarding = false;

const blacklist = [
    "Midi Through Port-0",
    "Launchpad X LPX DAW In"
]

const launchpadName = "Launchpad X LPX MIDI In";

function addInput(port) {
    if (midiInputs.includes(port)) return;
    console.log(`CONNECTED: ${port.name}`)
    midiInputs.push(port);
    port.onmidimessage = (event) => {
        handleMidiInput(event, port);
    }
    if (port.name === launchpadName) {
        Launchpad.start();
    }
}

function removeInput(port) {
    console.log(`DISCONNECTED: ${port.name}`)
    midiInputs = midiInputs.filter((p) => p !== port);
}

function trackPort(port) {
    if (port.type === "output") return;
    if (port.state === "connected") {
        addInput(port);
    } else {
        removeInput(port);
    }
}

function forwardMidi(event, source) {
    midi.outputs.forEach((port) => {
        // Only send the MIDI event out to the devices it did not come from
        if (port.name === source.name) return;
        if (blacklist.includes(port.name)) return;
        port.send(event.data);
    })
}

function handleMidiInput(event, source) {
    if (forwarding) {
        if (source.name === launchpadName) {
            Launchpad.handleLaunchpadInput(event.data)
        } else {
            forwardMidi(event, source);
        }
    }
}

export function sendMidiTo(outputName, data) {
    midi.outputs.forEach((output) => {
        if (outputName && output.name !== outputName) return;
        console.log(`SENDING TO ${output.name}`);
        console.log(data);
        output.send(data);
    })
}

export async function startForwarding() {
    midi = await navigator.requestMIDIAccess({sysex: true});
    midi.inputs.forEach((port) => {
        trackPort(port);
    })
    midi.onstatechange = (event) => {
        trackPort(event.port);
    }
    forwarding = true;
}

export function stopForwarding() {
    forwarding = false;

}