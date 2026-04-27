class GameEngine {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.health = 50;
        this.hits = 0;
        this.totalNotes = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentBeatmap = null;
        this.sessionId = 0;
        
        this.lanes = [
            document.getElementById('lane-0'),
            document.getElementById('lane-1'),
            document.getElementById('lane-2'),
            document.getElementById('lane-3')
        ];

        this.laneNames = ['left','up','down','right'];
        this.scrollSpeed = 400;
        this.hitWindow = 0.25;
        this.holdingNotes = [null, null, null, null]; // Tracks active hold notes per lane
        
        window.addEventListener('keydown', (e) => this.handleInput(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        window.addEventListener('blur', () => this.clearAllReceptors());
    }

    clearAllReceptors() {
        this.lanes.forEach(lane => {
            if (!lane) return;
            const receptor = lane.querySelector('.receptor');
            if (receptor) receptor.classList.remove('active');
        });
        // Also clear any stuck holding notes
        this.holdingNotes = [null, null, null, null];
    }

    purgeAllNotes() {
        this.lanes.forEach(lane => {
            if (!lane) return;
            const notes = lane.querySelectorAll('.note');
            notes.forEach(n => n.remove());
        });
    }

    start(beatmap) {
        this.isPlaying = false;
        this.isPaused = false;
        this.sessionId++;
        const mySession = this.sessionId;
        this.purgeAllNotes();
        this.holdingNotes = [null, null, null, null];

        this.currentBeatmap = beatmap;
        this.notes = beatmap.notes.map(n => ({
            time: n.time,
            lane: n.lane,
            duration: n.duration || 0, // In seconds
            hit: false,
            missed: false,
            element: null,
            isHold: (n.duration > 0)
        }));

        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.health = 50;
        this.hits = 0;
        this.totalNotes = 0;
        this.isPlaying = true;
        
        document.getElementById('score').innerText = '000000';
        document.getElementById('health-fill').style.width = '50%';
        document.getElementById('combo-count').innerText = '0';
        document.getElementById('combo-display').style.opacity = '0';
        document.getElementById('accuracy').innerText = 'ACCURACY: 100%';
        
        requestAnimationFrame((t) => this.update(t, mySession));
    }

    update(timestamp, session) {
        if (!this.isPlaying || session !== this.sessionId) return;
        if (this.isPaused) {
            requestAnimationFrame((t) => this.update(t, session));
            return;
        }

        const songTime = audioManager.getCurrentTime();
        
        this.notes.forEach(note => {
            // Spawn logic
            if (!note.element && !note.hit && !note.missed && songTime > note.time - 2) {
                this.createNoteElement(note);
            }
            
            if (note.element) {
                const distance = (note.time - songTime) * this.scrollSpeed;
                
                // If it's a hold and currently being held
                if (note.isHold && note.holding) {
                    note.element.style.bottom = '25px'; // Stay at receptor
                    const remainingDuration = (note.time + note.duration) - songTime;
                    
                    if (remainingDuration <= 0) {
                        this.finishHold(note);
                    } else {
                        // Update trail height to shrink as it's held
                        const trail = note.element.querySelector('.note-trail');
                        if (trail) {
                            trail.style.height = (remainingDuration * this.scrollSpeed) + 'px';
                        }
                        // Add some score while holding
                        this.score += 1;
                    }
                } else {
                    note.element.style.bottom = (25 + distance) + 'px';
                }

                // Miss check
                if (songTime > note.time + this.hitWindow && !note.hit && !note.missed && !note.holding) {
                    this.miss(note);
                }

                // Cleanup
                if (distance < -500 && !note.holding) {
                    if (note.element) note.element.remove();
                    note.element = null;
                }
            }
        });

        this.updateUI();
        requestAnimationFrame((t) => this.update(t, session));
    }

    createNoteElement(note) {
        const el = document.createElement('div');
        const skinClass = this.equippedArrow !== 'default' ? ` note-skin-${this.equippedArrow}` : '';
        el.className = `note note-${this.laneNames[note.lane]}${skinClass}`;
        
        if (note.isHold) {
            const trail = document.createElement('div');
            trail.className = 'note-trail';
            trail.style.height = (note.duration * this.scrollSpeed) + 'px';
            el.appendChild(trail);
        }

        this.lanes[note.lane].appendChild(el);
        note.element = el;
    }

    togglePause() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            audioManager.pauseContext();
            this.clearAllReceptors();
            switchScreen('pause-screen');
        } else {
            audioManager.resumeContext();
            switchScreen('gameplay-screen');
        }
    }

    handleInput(e) {
        if (e.key === 'Escape') {
            this.togglePause();
            return;
        }

        if (!this.isPlaying || this.isPaused) return;
        const binds = settings.data.binds;
        const laneIdx = binds.indexOf(e.key);
        
        if (laneIdx !== -1) {
            const receptor = this.lanes[laneIdx].querySelector('.receptor');
            receptor.classList.add('active');
            this.checkHit(laneIdx);
        }
    }

    handleKeyUp(e) {
        const binds = settings.data.binds;
        const laneIdx = binds.indexOf(e.key);
        if (laneIdx !== -1) {
            const receptor = this.lanes[laneIdx].querySelector('.receptor');
            if (receptor) receptor.classList.remove('active');

            // If we were holding a note in this lane, and we let go too early
            const heldNote = this.holdingNotes[laneIdx];
            if (heldNote) {
                this.miss(heldNote);
                this.holdingNotes[laneIdx] = null;
            }
        }
    }

    checkHit(laneIdx) {
        const songTime = audioManager.getCurrentTime();
        const possibleNotes = this.notes.filter(n => n.lane === laneIdx && !n.hit && !n.missed && !n.holding);
        
        let closest = null;
        let minDiff = Infinity;
        
        possibleNotes.forEach(n => {
            const diff = Math.abs(songTime - n.time);
            if (diff < minDiff) {
                minDiff = diff;
                closest = n;
            }
        });

        if (closest && minDiff < this.hitWindow) {
            this.hit(closest, minDiff, laneIdx);
        }
    }

    hit(note, diff, laneIdx) {
        if (note.isHold) {
            note.holding = true;
            this.holdingNotes[laneIdx] = note;
            if (note.element) {
                note.element.querySelector('.note-trail').classList.add('note-trail-success');
            }
            this.showRating('HOLD');
        } else {
            note.hit = true;
            if (note.element) {
                note.element.remove();
                note.element = null;
            }
        }
        
        let rating = '';
        let points = 0;
        if (diff < 0.04) { rating = 'SICK'; points = 500; }
        else if (diff < 0.08) { rating = 'GOOD'; points = 300; }
        else if (diff < 0.12) { rating = 'BAD'; points = 100; }
        else { rating = 'SHIT'; points = 50; }

        this.score += points;
        this.combo++;
        this.maxCombo = Math.max(this.combo, this.maxCombo);
        this.health = Math.min(100, this.health + 2);
        this.hits++;
        this.totalNotes++;
        
        this.triggerHitEffect(laneIdx);
        if (!note.isHold) this.showRating(rating);
    }

    finishHold(note) {
        note.hit = true;
        note.holding = false;
        this.holdingNotes[note.lane] = null;
        if (note.element) {
            note.element.remove();
            note.element = null;
        }
        this.showRating('CLEARED');
    }

    triggerHitEffect(laneIdx) {
        if (laneIdx === undefined || laneIdx === null) return;
        const effect = settings.data.equippedEffect;
        const receptor = this.lanes[laneIdx].querySelector('.receptor');
        if (!receptor) return;
        
        if (effect === 'stardust') {
            for (let i = 0; i < 8; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 50 + 20;
                p.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
                p.style.setProperty('--ty', (Math.sin(angle) * dist) + 'px');
                receptor.appendChild(p);
                setTimeout(() => p.remove(), 600);
            }
        } else if (effect === 'nova') {
            const ring = document.createElement('div');
            ring.className = 'nova-ring';
            receptor.appendChild(ring);
            setTimeout(() => ring.remove(), 400);
        } else if (effect === 'vortex') {
            const v = document.createElement('div');
            v.className = 'hit-vortex';
            receptor.appendChild(v);
            setTimeout(() => v.remove(), 500);
        } else if (effect === 'glitch') {
            const g = document.createElement('div');
            g.className = 'hit-glitch';
            receptor.appendChild(g);
            setTimeout(() => g.remove(), 300);
        } else {
            receptor.classList.add('hit-pulse');
            setTimeout(() => receptor.classList.remove('hit-pulse'), 100);
        }
    }

    miss(note) {
        note.missed = true;
        note.holding = false;
        if (note.element) {
            note.element.style.opacity = '0.3';
            const el = note.element;
            note.element = null;
            setTimeout(() => el.remove(), 200);
        }
        
        this.combo = 0;
        this.health = Math.max(0, this.health - 8); // Slightly higher penalty
        this.totalNotes++;
        if (this.health <= 0) this.gameOver(false);
    }

    showRating(text) {
        const el = document.getElementById('rating-popup');
        el.innerText = text;
        el.className = `rating-${text.toLowerCase()}`;
        el.style.opacity = '1';
        el.style.transform = 'translate(-50%, -50%) scale(1.2)';
        
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 300);
    }

    updateUI() {
        document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('health-fill').style.width = this.health + '%';
        document.getElementById('combo-count').innerText = this.combo;
        document.getElementById('combo-display').style.opacity = this.combo > 5 ? '1' : '0';
        const acc = this.totalNotes > 0 ? (this.hits / this.totalNotes) * 100 : 100;
        document.getElementById('accuracy').innerText = `ACCURACY: ${acc.toFixed(1)}%`;
    }

    gameOver(cleared = true) {
        this.isPlaying = false;
        this.isPaused = false;
        audioManager.stopTrack();
        this.purgeAllNotes();
        this.clearAllReceptors();
        switchScreen('results-screen');
        
        const acc = this.totalNotes > 0 ? (this.hits / this.totalNotes) * 100 : 100;
        const earned = cleared ? Math.floor(this.score / 100) : 10;
        
        // Update Leaderboard & Stats
        settings.updateScore(this.currentBeatmap.id, this.score, acc, cleared);
        settings.addCoins(earned);
        
        document.getElementById('earned-coins').innerText = earned;
        const resultTitle = document.getElementById('result-title');
        
        if (cleared) {
            resultTitle.innerText = 'CLEAR!';
            resultTitle.style.background = 'linear-gradient(135deg, #4ade80, #38bdf8)';
            resultTitle.style.webkitBackgroundClip = 'text';
        } else {
            resultTitle.innerText = 'FAILED';
            resultTitle.style.background = 'linear-gradient(135deg, #f87171, #f43f5e)';
            resultTitle.style.webkitBackgroundClip = 'text';
        }

        const grade = this.getGrade(acc);
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('final-combo').innerText = this.maxCombo;
        document.getElementById('final-rank').innerText = grade;
    }

    getGrade(acc) {
        if (acc >= 98) return 'SS';
        if (acc >= 95) return 'S';
        if (acc >= 90) return 'A';
        if (acc >= 80) return 'B';
        if (acc >= 70) return 'C';
        return 'D';
    }
}
const engine = new GameEngine();
