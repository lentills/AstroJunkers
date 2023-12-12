
// Controls for audio
// Now using Tone.js, since the p5 sound library was causing a memory leak

let soundManager;

function initialiseSound() {

    soundManager = new SoundManager();

    // Create slider for music volume control
    slider1 = createSlider(0, 1, 0.5, 0.01);
    slider1.position(windowWidth - 200, 15);
    slider1.style('width', '150px');

    // Create slider for sfx volume control
    slider2 = createSlider(0, 1.5, 1.0, 0.01);
    slider2.position(windowWidth - 200, 35);
    slider2.style('width', '150px');

    // Load in the sounds with Tone.js
    soundManager.addSound('music1', 'assets/sounds/gametal1_96kbps.mp3', false);
    soundManager.addSound('music2', 'assets/sounds/gametal2_96kbps.mp3', false);

    soundManager.addSound('laser', 'assets/sounds/laser5.mp3', false);
    soundManager.addSound('laserDeep', 'assets/sounds/laser4.mp3', false);
    soundManager.addSound('laserDeepLow', 'assets/sounds/laser4Low.mp3', false);
    soundManager.addSound('laserStrong', 'assets/sounds/laser3.mp3', false);
    soundManager.addSound('engine', 'assets/sounds/engine.mp3', true);
    soundManager.addSound('impact', 'assets/sounds/impact.mp3', false);
    soundManager.addSound('explosionSmall', 'assets/sounds/explosionSmall.mp3', false);
    soundManager.addSound('explosionBig', 'assets/sounds/explosionBig.mp3', false);
    soundManager.addSound('emp', 'assets/sounds/emp.mp3', false);

}




class SoundEffect {
    constructor(soundFile, loop) {
        this.player = new Tone.Player(soundFile).toDestination();
        this.player.loop = loop;
        this.isMuted = false;
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
        if (!this.isMuted){
            this.player.volume.value = Tone.gainToDb(volumeLevel);
        }
    }

    mute() {
        this.player.volume.value = -Infinity; // Mute the sound
        this.isMuted = true;
    }
    
    unmute(volumeLevel) {
        console.log("UNMUTE");
        this.player.volume.value = Tone.gainToDb(volumeLevel);
        this.isMuted = false;
    }

}




class SoundManager {
    constructor() {
        this.sounds = {};
    }

    addSound(name, soundFile, loop) {
        this.sounds[name] = new SoundEffect(soundFile, loop);
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


