// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

let midi;
let midiInputs = [];
let forwarding = false;

const blacklist = [
    "Midi Through Port-0"
]

function addInput(port) {
    if (midiInputs.includes(port)) return;
    midiInputs.push(port);
    port.onmidimessage = (event) => {
        handleMidiInput(event, port);
    }
}

function removeInput(port) {
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
        console.log(`sending to ${port.name} from ${source.name}`)
        port.send(event.data);
    })
}

function handleMidiInput(event, source) {
    if (forwarding) {
        forwardMidi(event, source);
    }
}

export async function startForwarding() {
    midi = await navigator.requestMIDIAccess();
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