
// Controls for audio
// Now using Tone.js, since the p5 sound library was causing a memory leak

let soundManager;
let soundMusic1, soundMusic2;   // Music is handles a little bit differently

function initialiseSound() {

    soundManager = new SoundManager();

    // Create slider for music volume control
    slider1 = createSlider(0, 1, 0.4, 0.01);
    slider1.position(windowWidth - 200, 15);
    slider1.style('width', '150px');

    // Create slider for sfx volume control
    slider2 = createSlider(0, 1, 0.4, 0.01);
    slider2.position(windowWidth - 200, 35);
    slider2.style('width', '150px');

    // Load in the sounds with Tone.js
    soundManager.addSound('music1', 'assets/sounds/gametal1_96kbps.mp3');
    soundManager.addSound('music2', 'assets/sounds/gametal2_96kbps.mp3');
    soundManager.addSound('laser', 'assets/sounds/laser_temp.mp3');
}




class SoundEffect {
    constructor(soundFile) {
        this.player = new Tone.Player(soundFile).toDestination();
    }

    async play() {
        await Tone.loaded(); // Ensure the sound is loaded
        this.player.start();
    }

    stop() {
        this.player.stop();
    }

    fadeOut(duration) {
        this.player.volume.rampTo(-Infinity, duration); // Fade to silence
        setTimeout(() => this.player.stop(), duration * 1000); // Stop after fade
    }

    setVolume(volumeLevel) {
        this.player.volume.value = Tone.gainToDb(volumeLevel);
    }
}




class SoundManager {
    constructor() {
        this.sounds = {};
    }

    addSound(name, soundFile) {
        this.sounds[name] = new SoundEffect(soundFile);
    }

    setVolume(name, volumeLevel) {
        if (this.sounds[name]) {
            this.sounds[name].setVolume(volumeLevel);
        }
    }

    setSFXVolumes(volumeLevel) {
        for (let key in this.sounds) {
            if (this.sounds.hasOwnProperty(key)) {
                if (key != 'music1' && key != 'music2'){
                    this.sounds[key].setVolume(volumeLevel);
                }
            }
        }
    }

    setMusicVolumes(volumeLevel) {
        for (let key in this.sounds) {
            if (this.sounds.hasOwnProperty(key)) {
                if (key == 'music1' || key == 'music2'){
                    this.sounds[key].setVolume(volumeLevel);
                }
            }
        }
    }

    play(name) {
        if (this.sounds[name]) {
            this.sounds[name].play();
        }
    }

    stop(name) {
        if (this.sounds[name]) {
            this.sounds[name].stop();
        }
    }
}


