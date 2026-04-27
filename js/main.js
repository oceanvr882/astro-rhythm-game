const LOBBY_MUSIC = 'assets/track11.mp3';

function switchScreen(screenId) {
    console.log("Switching to:", screenId);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'flex';
    } else {
        console.error("Screen not found:", screenId);
    }
}

// === LOGGING SYSTEM ===
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function addLogToUI(msg, type = 'log') {
    const consoleBox = document.getElementById('debug-console');
    if (!consoleBox) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerText = `[${time}] ${msg}`;
    consoleBox.appendChild(entry);
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

console.log = (...args) => {
    originalLog(...args);
    addLogToUI(args.join(' '), 'log');
};
console.error = (...args) => {
    originalError(...args);
    addLogToUI(args.join(' '), 'error');
};
console.warn = (...args) => {
    originalWarn(...args);
    addLogToUI(args.join(' '), 'warn');
};

// === DELEGATED UI HANDLER (Refined) ===
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Command Center Tabs
    if (target.closest('.cc-nav-item')) {
        const btn = target.closest('.cc-nav-item');
        document.querySelectorAll('.cc-nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.cc-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const contentId = btn.dataset.tab;
        const content = document.getElementById(contentId);
        if (content) content.classList.add('active');
    }

    // Shop Tabs
    if (target.closest('.shop-root .tab')) {
        const btn = target.closest('.shop-root .tab');
        const cat = btn.dataset.cat;
        if (cat) {
            currentShopCategory = cat;
            document.querySelectorAll('.shop-root .tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('secLabel').innerText = cat === 'arrow' ? 'ARROW SKINS' : 'HIT EFFECTS';
            renderShop();
        }
    }
});

// === SHOP LOGIC ===
let currentShopCategory = 'arrow';
const SHOP_ITEMS = {
    effect: [
        { id: 'default', name: 'GLOW', price: 0, desc: 'Classic hit pulse', icon:'✨', rarity:'Common' },
        { id: 'stardust', name: 'STARDUST', price: 500, desc: 'Particle burst', icon:'🌠', rarity:'Rare' },
        { id: 'nova', name: 'NOVA', price: 1200, desc: 'Shockwave ring', icon:'💥', rarity:'Epic' },
        { id: 'vortex', name: 'VORTEX', price: 2000, desc: 'Spiral energy', icon:'🌀', rarity:'Legendary' },
        { id: 'glitch', name: 'GLITCH', price: 3500, desc: 'Digital distortion', icon:'👾', rarity:'Legendary' }
    ],
    arrow: [
        { id: 'default', name: 'VOID ARROW', price: 0, desc: 'Standard arrows', icon:'►', rarity:'Common' },
        { id: 'neon', name: 'NEON CIRCLE', price: 1000, desc: 'Vibrant circular notes', icon:'⭕', rarity:'Rare' },
        { id: 'pixel', name: 'RETRO 8-BIT', price: 1500, desc: 'Sharp pixelated arrows', icon:'👾', rarity:'Epic' },
        { id: 'ghost', name: 'VOID GHOST', price: 3000, desc: 'Translucent phantom notes', icon:'👻', rarity:'Legendary' }
    ]
};

function renderShop() {
    const grid = document.getElementById('itemsGrid');
    const coinDisplay = document.getElementById('coinDisplay');
    if (coinDisplay) coinDisplay.textContent = settings.data.coins.toLocaleString();
    if (!grid) return;
    
    grid.innerHTML = '';
    const items = SHOP_ITEMS[currentShopCategory];
    const ownedKey = currentShopCategory === 'effect' ? 'ownedEffects' : 'ownedArrows';
    const equippedKey = currentShopCategory === 'effect' ? 'equippedEffect' : 'equippedArrow';

    items.forEach(item => {
        const isOwned = settings.data[ownedKey].includes(item.id);
        const isEquipped = settings.data[equippedKey] === item.id;
        
        const card = document.createElement('div');
        card.className = `item-card ${isEquipped ? 'equipped' : (isOwned ? 'owned' : '')}`;
        card.innerHTML = `
            ${isEquipped ? '<div class="item-badge badge-equipped">EQUIPPED</div>' : (isOwned ? '<div class="item-badge badge-owned">OWNED</div>' : '')}
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-rarity r-${item.rarity.toLowerCase()}">${item.rarity.toUpperCase()}</div>
            ${!isOwned ? `<div class="item-price"><div class="coin-icon"></div>${item.price.toLocaleString()}</div>` : ''}
            <button class="btn-action ${isEquipped ? 'btn-equipped' : (isOwned ? 'btn-equip' : 'btn-buy')}" 
                onclick="handleShopAction('${currentShopCategory}', '${item.id}', ${item.price})">
                ${isEquipped ? 'EQUIPPED' : (isOwned ? 'EQUIP' : 'BUY')}
            </button>
        `;
        grid.appendChild(card);
    });
}

window.handleShopAction = (cat, id, price) => {
    const ownedKey = cat === 'effect' ? 'ownedEffects' : 'ownedArrows';
    if (settings.data[ownedKey].includes(id)) {
        settings.equipItem(cat, id);
    } else {
        if (!settings.purchaseItem(cat, id, price)) {
            showToast("NOT ENOUGH COINS");
        }
    }
    renderShop();
};

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.className='toast show';
    setTimeout(()=>t.className='toast',2000);
}

function makeStars() {
    const layer = document.getElementById('starsLayer');
    if (!layer) return;
    layer.innerHTML = '';
    for(let i=0;i<80;i++) {
        const s = document.createElement('div');
        s.className='star';
        const sz = Math.random()*2+0.5;
        s.style.cssText=`width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--d:${(Math.random()*3+2).toFixed(1)}s;--op:${(Math.random()*0.7+0.3).toFixed(2)};animation-delay:${(Math.random()*4).toFixed(1)}s`;
        layer.appendChild(s);
    }
}

// === PASS LOGIC ===
function goPass(id) {
    const screens = ['pass-s1', 'pass-s2', 'pass-s3', 'pass-s4', 'pass-s5'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle('on', s === id);
    });
}

// === INITIALIZATION ===
function initAll() {
    console.log("ASTRO Command Center Initialized");
    
    // Lobby Button Bindings (Explicit)
    const bindBtn = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };

    bindBtn('open-profile-btn', () => { renderProfile(); switchScreen('profile-screen'); });
    bindBtn('cc-close-btn', () => switchScreen('song-selection'));
    
    bindBtn('open-shop-btn', () => { switchScreen('shop-screen'); makeStars(); renderShop(); });
    bindBtn('close-shop-btn', () => switchScreen('song-selection'));

    bindBtn('open-pass-btn', () => { switchScreen('pass-screen'); goPass('pass-s1'); });
    bindBtn('close-pass-btn', () => switchScreen('song-selection'));
    bindBtn('pass-lobby-btn', () => switchScreen('song-selection'));
    bindBtn('pass-lobby-btn-2', () => switchScreen('song-selection'));

    bindBtn('open-settings-btn', () => { switchScreen('settings-screen'); updateSettingsUI(); });
    bindBtn('close-settings-btn', () => switchScreen('song-selection'));

    bindBtn('open-editor-btn', () => { if(settings.data.astroPass) switchScreen('editor-screen'); });
    bindBtn('close-editor-btn', () => switchScreen('song-selection'));

    // Gameplay Control Bindings
    bindBtn('retry-btn', () => startGame(engine.currentBeatmap));
    bindBtn('menu-btn', () => goToMenu());
    bindBtn('pause-resume-btn', () => engine.togglePause());
    bindBtn('pause-retry-btn', () => { audioManager.resumeContext(); startGame(engine.currentBeatmap); });
    bindBtn('pause-menu-btn', () => { audioManager.resumeContext(); goToMenu(); });

    // Pass Purchase Sequence
    bindBtn('pass-confirm-btn', () => {
        if (settings.data.coins < 950) { alert("NOT ENOUGH CREDITS"); return; }
        goPass('pass-s3');
        const bar = document.getElementById('pass-pbar');
        let step = 0;
        const interval = setInterval(() => {
            if (bar) bar.style.width = ((step + 1) * 25) + '%';
            step++;
            if (step > 4) {
                clearInterval(interval);
                settings.data.coins -= 950;
                settings.data.astroPass = true;
                settings.save();
                goPass('pass-s4');
                checkPassUnlock();
            }
        }, 800);
    });
    
    bindBtn('pass-preview-btn', () => goPass('pass-s5'));
    bindBtn('pass-get-btn', () => goPass('pass-s2'));
    bindBtn('pass-cancel-btn', () => goPass('pass-s1'));
    bindBtn('pass-preview-back-btn', () => goPass('pass-s1'));
    bindBtn('pass-buy-bottom-btn', () => goPass('pass-s2'));
    bindBtn('pass-explore-btn', () => goPass('pass-s5'));

    checkPassUnlock();
    renderSongList();
    settings.apply();
}

function checkPassUnlock() {
    const isOwner = settings.data.astroPass;
    const editorBtn = document.getElementById('open-editor-btn');
    const badge = document.getElementById('pass-badge');
    if (editorBtn) editorBtn.style.display = isOwner ? 'block' : 'none';
    if (badge) badge.style.display = isOwner ? 'flex' : 'none';
}

function renderSongList() {
    const list = document.getElementById('song-list');
    if (!list) return;
    list.innerHTML = '';
    BEATMAPS.forEach(map => {
        if (map.isTutorial) return;
        const item = document.createElement('div');
        item.className = 'song-item';
        item.innerHTML = `
            <div class="song-info"><h3>${map.title}</h3><p>${map.artist}</p></div>
            <div class="song-meta"><span class="difficulty">${map.difficulty}</span></div>
        `;
        item.onclick = () => selectSong(map);
        list.appendChild(item);
    });
}

function selectSong(map) {
    document.getElementById('detail-title').innerText = map.title.toUpperCase();
    document.getElementById('detail-artist').innerText = map.artist;
    document.getElementById('detail-bpm').innerText = map.bpm + " BPM";
    document.getElementById('detail-diff').innerText = map.difficulty.toUpperCase();
    const playBtn = document.getElementById('play-button');
    if (playBtn) {
        playBtn.style.display = 'block';
        playBtn.onclick = () => startGame(map);
    }
    audioManager.playPreview(map.url);
}

async function startGame(map) {
    console.log("Starting game for:", map.title);
    switchScreen('gameplay-screen');
    await audioManager.loadTrack(map.id, map.url);
    audioManager.stopBackground();
    audioManager.stopPreview();
    setTimeout(() => {
        audioManager.playTrack(map.id, () => engine.gameOver());
        engine.start(map);
    }, 1000);
}

function goToMenu() {
    engine.isPlaying = false;
    audioManager.stopTrack();
    switchScreen('song-selection');
    audioManager.playBackground(LOBBY_MUSIC);
}

function updateSettingsUI() {
    settings.data.binds.forEach((bind, i) => {
        const el = document.getElementById(`bind-${i}`);
        if (el) el.innerText = bind.replace('Arrow', '').toUpperCase();
    });
}

// === PROFILE LOGIC ===
const BOTS = [
    { name: "VoidWalker", score: 850000, rank: "DIVINE" },
    { name: "StarDust_99", score: 720000, rank: "SUPERNOVA" },
    { name: "CosmoPilot", score: 610000, rank: "SUPERNOVA" },
    { name: "AstroBeats", score: 540000, rank: "NOVA" },
    { name: "NebulaGhost", score: 480000, rank: "NOVA" },
    { name: "PixelLord", score: 320000, rank: "PULSE" }
];

const ALL_RANKS = [
    { name: "VOID ASCENDANT", xp: 1000000, color: "#9f6fff" },
    { name: "DIVINE", xp: 500000, color: "#f7b733" },
    { name: "SUPERNOVA", xp: 250000, color: "#ff60cc" },
    { name: "NOVA", xp: 100000, color: "#5ab4ff" },
    { name: "PULSE", xp: 50000, color: "#4ade80" },
    { name: "STARDUST", xp: 0, color: "#94a3b8" }
];

function renderProfile() {
    const data = settings.data;
    const xpPerc = Math.min(100, (data.totalScore / 1000000) * 100);
    
    // Stats
    document.getElementById('cc-total-score').innerText = data.totalScore.toLocaleString();
    document.getElementById('cc-cleared').innerText = data.songsCleared;
    document.getElementById('cc-coins').innerText = data.coins.toLocaleString();
    document.getElementById('cc-xp-val').innerText = `XP: ${data.totalScore.toLocaleString()} / 1,000,000`;
    document.getElementById('cc-xp-fill').style.width = xpPerc + '%';
    
    // Personal Leaderboard
    const pbList = document.getElementById('cc-pb-list');
    if (pbList) {
        pbList.innerHTML = '';
        Object.entries(data.highScores).forEach(([id, score]) => {
            const map = BEATMAPS.find(m => m.id === id);
            if (map && score > 0) {
                const item = document.createElement('div');
                item.className = 'modern-list-item';
                item.innerHTML = `<span class="item-name">${map.title}</span> <span class="item-value">${score.toLocaleString()}</span>`;
                pbList.appendChild(item);
            }
        });
    }

    // Global
    const gList = document.getElementById('cc-global-list');
    if (gList) {
        gList.innerHTML = '';
        [...BOTS, { name: "YOU", score: data.totalScore, rank: "YOU" }]
            .sort((a,b) => b.score - a.score)
            .forEach((e, i) => {
                const item = document.createElement('div');
                item.className = `modern-list-item ${e.name === "YOU" ? 'highlight' : ''}`;
                item.innerHTML = `<span class="item-rank">#${i+1}</span> <span class="item-name">${e.name}</span> <span class="item-value">${e.score.toLocaleString()}</span>`;
                gList.appendChild(item);
            });
    }

    // Ladder
    const rList = document.getElementById('cc-ladder-list');
    if (rList) {
        rList.innerHTML = '';
        ALL_RANKS.forEach(r => {
            const isReached = data.totalScore >= r.xp;
            const item = document.createElement('div');
            item.className = `modern-list-item ${isReached ? 'reached' : 'locked'}`;
            item.innerHTML = `<span class="item-name" style="color:${r.color}">${r.name}</span> <span class="item-value">${r.xp.toLocaleString()} XP</span>`;
            rList.appendChild(item);
        });
    }
}

// Start
window.onload = () => {
    initAll();
    const tutDone = localStorage.getItem('astro_tutorial_done');
    if (tutDone) {
        audioManager.playBackground(LOBBY_MUSIC);
        switchScreen('song-selection');
    } else {
        switchScreen('tutorial-screen');
        const skipBtn = document.getElementById('skip-tutorial');
        if (skipBtn) {
            skipBtn.onclick = () => {
                localStorage.setItem('astro_tutorial_done', 'true');
                audioManager.playBackground(LOBBY_MUSIC);
                switchScreen('song-selection');
            };
        }
    }
};
