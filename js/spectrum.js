// Copyright 2024 Luna Hortin
// Released under the MIT licence, https://opensource.org/licenses/MIT

let spectrum;

export async function start(ctx, stream) {
    const AudioMotionAnalyzer = (await import('https://cdn.skypack.dev/audiomotion-analyzer?min')).default;
    console.log(AudioMotionAnalyzer)
    const container = document.getElementById('spectrum');
    spectrum = new AudioMotionAnalyzer(container, {
        audioCtx: ctx,
        connectSpeakers: false,
        source: stream,
        mode: 7,
        overlay: true,
        showBgColor: false,
        fillAlpha: 0.2,
        outlineBars: true,
        gradient: "prism",
        maxFPS: 30,
        smoothing: 0
    });

}