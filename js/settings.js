const DEFAULT_SETTINGS = {
    binds: ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'],
    volume: 0.7,
    scrollSpeed: 400,
    coins: 0,
    ownedEffects: ['default'],
    equippedEffect: 'default',
    ownedArrows: ['default'],
    equippedArrow: 'default',
    astroPass: false,
    highScores: {}, 
    playerStats: {
        totalScore: 0,
        songsCleared: 0,
        xp: 0
    },
    customMaps: []
};

const RANKS = [
    { title: "ASTRO NEWBIE", minXp: 0, color: "#94a3b8", desc: "Just starting the journey into the stars." },
    { title: "PULSE RHYTHMER", minXp: 1000, color: "#4ade80", desc: "Finding the rhythm of the galactic pulse." },
    { title: "ORBITAL MASTER", minXp: 5000, color: "#38bdf8", desc: "Successfully navigated complex orbital beats." },
    { title: "NEBULA SLICER", minXp: 15000, color: "#f472b6", desc: "Cutting through cosmic melodies with precision." },
    { title: "QUASAR GOD", minXp: 40000, color: "#facc15", desc: "Attained enlightenment through pure rhythm." },
    { title: "SUPERNOVA", minXp: 100000, color: "#ef4444", desc: "The ultimate form of a rhythm pilot. Explosive!" }
];

class SettingsManager {
    constructor() {
        const saved = JSON.parse(localStorage.getItem('astro_v6'));
        if (saved && saved.binds && saved.binds.length === 4) {
            this.data = { ...DEFAULT_SETTINGS, ...saved };
        } else {
            this.data = { ...DEFAULT_SETTINGS };
        }
        this.save();
    }

    save() {
        localStorage.setItem('astro_v6', JSON.stringify(this.data));
        this.apply();
    }

    apply() {
        if (typeof engine !== 'undefined') {
            engine.scrollSpeed = this.data.scrollSpeed;
            engine.equippedArrow = this.data.equippedArrow;
        }
        if (typeof audioManager !== 'undefined') {
            audioManager.setVolume(this.data.volume);
        }
        this.updateHeaderUI();
    }

    updateHeaderUI() {
        const rankEl = document.getElementById('player-rank-display');
        const xpEl = document.getElementById('player-xp-display');
        const coinEl = document.getElementById('menu-coin-count');
        const passBadge = document.getElementById('pass-badge');
        
        if (rankEl && xpEl) {
            const xp = this.data.playerStats.xp;
            let rankIdx = 0;
            for (let i = RANKS.length - 1; i >= 0; i--) {
                if (xp >= RANKS[i].minXp) { rankIdx = i; break; }
            }
            const rank = RANKS[rankIdx];
            rankEl.innerHTML = `<span class="rank-icon rank-icon-${rankIdx + 1}"></span> ${rank.title}`;
            rankEl.style.color = rank.color;
            xpEl.innerText = `XP: ${this.data.playerStats.xp.toLocaleString()}`;
        }
        if (coinEl) coinEl.innerText = this.data.coins;
        if (passBadge) passBadge.style.display = this.data.astroPass ? 'flex' : 'none';
    }

    getPlayerRank() {
        const xp = this.data.playerStats.xp;
        for (let i = RANKS.length - 1; i >= 0; i--) {
            if (xp >= RANKS[i].minXp) return RANKS[i];
        }
        return RANKS[0];
    }

    updateScore(songId, score, accuracy, cleared) {
        const current = this.data.highScores[songId] || { score: 0 };
        if (score > current.score) {
            this.data.highScores[songId] = { score, accuracy, date: new Date().toLocaleDateString() };
        }
        if (cleared) {
            this.data.playerStats.songsCleared++;
            this.data.playerStats.xp += Math.floor(score / 50);
            this.data.playerStats.totalScore += score;
        }
        this.save();
    }

    purchasePass() {
        if (this.data.coins >= 5000 && !this.data.astroPass) {
            this.data.coins -= 5000;
            this.data.astroPass = true;
            this.save();
            return true;
        }
        return false;
    }

    purchaseItem(category, id, price) {
        const listKey = category === 'effect' ? 'ownedEffects' : 'ownedArrows';
        if (this.data.coins >= price && !this.data[listKey].includes(id)) {
            this.data.coins -= price;
            this.data[listKey].push(id);
            this.save();
            return true;
        }
        return false;
    }

    equipItem(category, id) {
        const listKey = category === 'effect' ? 'ownedEffects' : 'ownedArrows';
        const equipKey = category === 'effect' ? 'equippedEffect' : 'equippedArrow';
        if (this.data[listKey].includes(id)) {
            this.data[equipKey] = id;
            this.save();
        }
    }

    updateBind(index, key) {
        this.data.binds[index] = key;
        this.save();
    }

    updateVolume(val) {
        this.data.volume = parseFloat(val);
        this.save();
    }

    updateScrollSpeed(val) {
        this.data.scrollSpeed = parseInt(val);
        this.save();
    }

    addCoins(amount) {
        this.data.coins += Math.floor(amount);
        this.save();
    }
}

const settings = new SettingsManager();
