class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.tracks = {};
        this.currentTrack = null;
        this.bgMusic = null;
        this.currentPreview = null;
        this.masterVolume = 0.7;

        // Master gain node — ALL audio goes through this
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.value = this.masterVolume;
    }

    setVolume(val) {
        this.masterVolume = val;
        this.gainNode.gain.value = val;
        if (this.bgMusic) {
            this.bgMusic.volume = val * 0.7; // BG music slightly quieter
        }
        if (this.currentPreview) {
            this.currentPreview.volume = val;
        }
    }

    async loadTrack(name, url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.tracks[name] = audioBuffer;
        return audioBuffer;
    }

    playTrack(name, onEnded) {
        this.stopBackground();
        this.stopPreview();
        
        if (this.currentTrack) {
            try { this.currentTrack.source.stop(); } catch(e) {}
        }

        const source = this.ctx.createBufferSource();
        source.buffer = this.tracks[name];
        source.connect(this.gainNode); // Route through master volume
        
        const startTime = this.ctx.currentTime;
        source.start(0);
        
        this.currentTrack = {
            source: source,
            startTime: startTime,
            name: name
        };

        source.onended = onEnded;
    }

    stopTrack() {
        if (this.currentTrack) {
            try { this.currentTrack.source.stop(); } catch(e) {}
            this.currentTrack = null;
        }
    }

    playBackground(url) {
        this.stopBackground();
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = this.masterVolume * 0.7;
        audio.play().catch(e => console.log("User interaction needed for audio"));
        this.bgMusic = audio;
    }

    stopBackground() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic = null;
        }
    }

    pauseBackground() {
        if (this.bgMusic) {
            this.bgMusic.volume = 0;
            this.bgMusic.pause();
        }
    }

    resumeBackground() {
        if (this.bgMusic && !this.currentPreview && !this.currentTrack) {
            this.bgMusic.play();
            const target = this.masterVolume * 0.7;
            let vol = 0;
            const fadeIn = setInterval(() => {
                vol += 0.05;
                if (this.bgMusic) this.bgMusic.volume = Math.min(vol, target);
                if (vol >= target) clearInterval(fadeIn);
            }, 50);
        }
    }

    async playPreview(url) {
        this.stopPreview();
        this.pauseBackground();
        
        const audio = new Audio(url);
        audio.volume = 0;
        audio.play().catch(e => console.log("Preview play error:", e));
        
        const target = this.masterVolume;
        let vol = 0;
        const fadeIn = setInterval(() => {
            vol += 0.1;
            audio.volume = Math.min(vol, target);
            if (vol >= target) clearInterval(fadeIn);
        }, 100);

        this.currentPreview = audio;

        setTimeout(() => {
            if (this.currentPreview === audio) {
                const fadeOut = setInterval(() => {
                    audio.volume = Math.max(0, audio.volume - 0.1);
                    if (audio.volume <= 0) {
                        clearInterval(fadeOut);
                        audio.pause();
                        if (this.currentPreview === audio) {
                            this.currentPreview = null;
                            this.resumeBackground();
                        }
                    }
                }, 100);
            }
        }, 10000);
    }

    stopPreview() {
        if (this.currentPreview) {
            this.currentPreview.pause();
            this.currentPreview = null;
            this.resumeBackground();
        }
    }

    getCurrentTime() {
        if (!this.currentTrack) return 0;
        return this.ctx.currentTime - this.currentTrack.startTime;
    }

    pauseContext() {
        if (this.ctx.state === 'running') {
            this.ctx.suspend();
        }
    }

    resumeContext() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    resume() {
        this.resumeContext();
    }
}

const audioManager = new AudioManager();
