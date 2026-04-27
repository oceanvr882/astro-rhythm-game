const BEATMAPS = [
    {
        id: 'tutorial',
        title: "TUTORIAL",
        artist: "ASTRO",
        url: 'assets/menu_theme.mp3',
        bpm: 100,
        difficulty: 'Tutorial',
        isTutorial: true,
        notes: [
            { time: 2.0, lane: 0 }, { time: 3.0, lane: 1 }, { time: 4.0, lane: 2 }, { time: 5.0, lane: 3 },
            { time: 6.0, lane: 0, duration: 2.0 }, { time: 9.0, lane: 1, duration: 2.0 }
        ]
    },
    {
        id: 'track1',
        title: "223's (Slowed)",
        artist: "YNW Melly ft. GlokkNine",
        url: 'assets/track1.mp3',
        bpm: 95,
        difficulty: 'Easy',
        notes: []
    },
    {
        id: 'track2',
        title: "The Mercer",
        artist: "fakemink",
        url: 'assets/track2.m4a',
        bpm: 140,
        difficulty: 'Hard',
        notes: []
    },
    {
        id: 'track3',
        title: "Blow The Speaker",
        artist: "fakemink",
        url: 'assets/track3.m4a',
        bpm: 93,
        difficulty: 'Medium',
        notes: []
    },
    {
        id: 'track4',
        title: "God's Plan",
        artist: "Drake",
        url: 'assets/track4.mp3',
        bpm: 77,
        difficulty: 'Easy',
        notes: []
    },
    {
        id: 'track5',
        title: "Hurt Me",
        artist: "Juice WRLD",
        url: 'assets/track5.mp3',
        bpm: 157,
        difficulty: 'Expert',
        notes: []
    },
    {
        id: 'track6',
        title: "Fuck Love",
        artist: "XXXTENTACION ft. Trippie Redd",
        url: 'assets/track6.mp3',
        bpm: 131,
        difficulty: 'Medium',
        notes: []
    },
    {
        id: 'track7',
        title: "Calling My Phone",
        artist: "Lil Tjay ft. 6LACK",
        url: 'assets/track7.mp3',
        bpm: 105,
        difficulty: 'Easy',
        notes: []
    },
    {
        id: 'track8',
        title: "Empty",
        artist: "Juice WRLD",
        url: 'assets/track8.mp3',
        bpm: 78,
        difficulty: 'Easy',
        notes: []
    },
    {
        id: 'track9',
        title: "VOCE NA MIRA",
        artist: "HWUNGII",
        url: 'assets/track9.mp3',
        bpm: 104,
        difficulty: 'Medium',
        notes: []
    },
    {
        id: 'track10',
        title: "Beep Beep",
        artist: "Phonk",
        url: 'assets/track10.mp3',
        bpm: 140,
        difficulty: 'Hard',
        notes: []
    },
    {
        id: 'track11',
        title: "All The Stars",
        artist: "Kendrick Lamar & SZA",
        url: 'assets/track11.mp3',
        bpm: 97,
        difficulty: 'Easy',
        notes: []
    },
    {
        id: 'track12',
        title: "MONTAGEM PERIGOSA",
        artist: "Phonk",
        url: 'assets/track12.mp3',
        bpm: 135,
        difficulty: 'Hard',
        notes: []
    },
    {
        id: 'track13',
        title: "Oceans V2",
        artist: "Game Soundtrack",
        url: 'assets/track13.mp3',
        bpm: 170,
        difficulty: '★ NIGHTMARE',
        isNightmare: true,
        notes: []
    },
    {
        id: 'track14',
        title: "Oceans",
        artist: "Game Soundtrack",
        url: 'assets/track14.mp3',
        bpm: 160,
        difficulty: '★ NIGHTMARE',
        isNightmare: true,
        notes: []
    },
    {
        id: 'track15',
        title: "Bazooka",
        artist: "Phonk",
        url: 'assets/track15.m4a',
        bpm: 145,
        difficulty: 'Hard',
        notes: []
    },
    {
        id: 'track16',
        title: "Dark Knight Dummo",
        artist: "Trippie Redd ft. Travis Scott",
        url: 'assets/track16.mp3',
        bpm: 181,
        difficulty: 'Expert',
        notes: []
    },
    {
        id: 'track17',
        title: "National Treasures",
        artist: "Noel",
        url: 'assets/track17.m4a',
        bpm: 120,
        difficulty: 'Medium',
        notes: []
    },
    {
        id: 'track18',
        title: "Hope",
        artist: "XXXTENTACION",
        url: 'assets/track18.mp3',
        bpm: 73,
        difficulty: 'Easy',
        notes: []
    },
    {
        id: 'track19',
        title: "SAD!",
        artist: "XXXTENTACION",
        url: 'assets/track19.mp3',
        bpm: 75,
        difficulty: 'Easy',
        notes: []
    }
];

const PATTERNS = {
    streams: [
        [0,1,2,3], [3,2,1,0], [0,2,1,3], [3,1,2,0], [0,1,0,1], [2,3,2,3], [0,3,1,2], [2,1,3,0]
    ],
    pairs: [
        [0,3], [1,2], [0,1], [2,3], [0,2], [1,3]
    ]
};

function generateBeatMatchedNotes(track) {
    if (track.notes.length > 5 || track.isTutorial) return;
    
    const bpm = track.bpm;
    const beatLen = 60 / bpm;
    const duration = 210;
    
    let notesPerMeasure;
    const diff = track.difficulty;
    
    if (diff === 'Easy') notesPerMeasure = 4;
    else if (diff === 'Medium') notesPerMeasure = 6;
    else if (diff === 'Hard') notesPerMeasure = 8;
    else if (diff === 'Expert') notesPerMeasure = 12;
    else return;

    const measureLen = beatLen * 4;
    const subdivisionLen = measureLen / notesPerMeasure;
    
    let patternIdx = 0;
    let currentPattern = PATTERNS.streams[0];
    let patternPos = 0;
    
    for (let t = beatLen * 2; t < duration; t += subdivisionLen) {
        const measureNum = Math.floor(t / measureLen);
        if (measureNum % 4 === 0 && patternPos === 0) {
            patternIdx = Math.floor(Math.random() * PATTERNS.streams.length);
            currentPattern = PATTERNS.streams[patternIdx];
        }

        const roll = Math.random();
        const isChorus = (measureNum % 16) >= 8;
        const restChance = isChorus ? 0.05 : 0.15;
        
        if (roll < restChance) continue;

        const isStrongBeat = (Math.abs((t % beatLen)) < 0.05);
        
        // 15% chance of Long Note (Hold) on strong beats
        if (isStrongBeat && Math.random() < 0.15) {
            const lane = Math.floor(Math.random() * 4);
            const holdLen = (Math.floor(Math.random() * 3) + 1) * beatLen; // 1-3 beats long
            track.notes.push({ time: t, lane: lane, duration: holdLen });
            t += holdLen; // Skip ahead so arrows don't overlap hold trail
        } else if (isStrongBeat && diff !== 'Easy' && Math.random() < 0.2) {
            const pair = PATTERNS.pairs[Math.floor(Math.random() * PATTERNS.pairs.length)];
            track.notes.push({ time: t, lane: pair[0] });
            track.notes.push({ time: t, lane: pair[1] });
        } else {
            let lane = currentPattern[patternPos % currentPattern.length];
            if (Math.random() < 0.1) lane = Math.floor(Math.random() * 4);
            track.notes.push({ time: t, lane: lane });
        }
        patternPos++;
    }
    track.notes.sort((a, b) => a.time - b.time);
}

// Nightmare mode: FAST PACED single streams, very few doubles, NO note spamming
function generateNightmareNotes(track) {
    if (track.notes.length > 5) return;
    const bpm = track.bpm;
    const beatLen = 60 / bpm;
    const duration = 240;
    
    // 16th and 32nd note speed!
    const baseStep = beatLen / 4; // 16th notes
    let t = 2.0;

    let lastLane = -1;
    let streamCount = 0;
    let streamLane = 0;

    while (t < duration) {
        const roll = Math.random();
        
        // High speed single note streams
        let lane = Math.floor(Math.random() * 4);
        while (lane === lastLane) lane = Math.floor(Math.random() * 4);
        
        // 10% chance for a velocity spike (32nd notes)
        const isSpike = Math.random() < 0.15;
        const currentStep = isSpike ? baseStep / 2 : baseStep;

        // Long notes in Nightmare are rare but long
        if (Math.random() < 0.05) {
            track.notes.push({ time: t, lane: lane, duration: beatLen * 4 });
            t += (beatLen * 4.5);
        } else {
            track.notes.push({ time: t, lane: lane });
            t += currentStep;
        }

        lastLane = lane;
    }
    track.notes.sort((a, b) => a.time - b.time);
}

BEATMAPS.forEach(track => {
    if (track.isNightmare) generateNightmareNotes(track);
    else generateBeatMatchedNotes(track);
});
