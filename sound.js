
// Controls for audio

let soundManager;
let soundMusic1, soundMusic2;   // Music is handles a little bit differently

function initialiseSound() {

    soundManager = new SoundManager();

    // Create slider for music volume control
    slider1 = createSlider(0, 1, 0.4, 0.01);
    slider1.position(windowWidth - 200, 15);
    slider1.style('width', '150px');

    // Create slider for sfx volume control
    slider2 = createSlider(0, 1, 0.6, 0.01);
    slider2.position(windowWidth - 200, 35);
    slider2.style('width', '150px');

    // Load in the sounds
    soundMusic1 = loadSound('assets/sounds/gametal1_96kbps.mp3');
    soundMusic2 = loadSound('assets/sounds/gametal2_96kbps.mp3');
    soundManager.addSound('laser', 'assets/sounds/laser_temp.mp3');
    // soundManager.addSound('backgroundMusic', 'music.mp3');
}


class SoundEffect {
    constructor(soundFile) {
        this.sound = loadSound(soundFile);
    }

    play() {
        //if (!this.sound.isPlaying()){
            this.sound.play();
        //}
    }

    stop() {
        this.sound.stop();
    }

    setVolume(volumeLevel) {
        this.sound.setVolume(volumeLevel);
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

    setAllVolumes(volumeLevel) {
        for (let key in this.sounds) {
            if (this.sounds.hasOwnProperty(key)) {
                this.sounds[key].setVolume(volumeLevel);
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


