const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const SongRepository = require('../models/SongRepository');
const RepositoryMember = require('../models/RepositoryMember');
const Branch = require('../models/Branch');
const Commit = require('../models/Commit');
const Asset = require('../models/Asset');
const LyricsDocument = require('../models/LyricsDocument');
const PullRequest = require('../models/PullRequest');
const Comment = require('../models/Comment');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { extractWaveformPeaks } = require('../services/audioService');
const { UPLOADS_DIR } = require('../middleware/upload');

/**
 * Generate a valid 44.1kHz 16-bit PCM WAV file buffer
 */
function createWavBuffer(durationSec, generatorFn) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataByteSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataByteSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataByteSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // mono (1 channel)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate (sampleRate * numChannels * bitsPerSample/8)
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // 'data' chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataByteSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, generatorFn(t)));
    const int16 = Math.floor(sample * 32767);
    buffer.writeInt16LE(int16, 44 + i * 2);
  }

  return buffer;
}

// Generate sample stems on disk
function generateSampleStemFiles() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const duration = 16; // 16 seconds loopable music demo

  // 1. Acoustic / Lead Guitar stem (Arpeggiated Em - C - G - D)
  const guitarPath = path.join(UPLOADS_DIR, 'adhoori-guitar-take-01.wav');
  if (!fs.existsSync(guitarPath)) {
    const guitarBuf = createWavBuffer(duration, (t) => {
      const chords = [164.81, 130.81, 196.00, 146.83]; // E3, C3, G3, D3
      const chord = chords[Math.floor((t * 2) % 4)];
      const pluck = Math.exp(-((t * 4) % 1) * 6);
      return (Math.sin(2 * Math.PI * chord * t) * 0.4 +
              Math.sin(2 * Math.PI * (chord * 1.5) * t) * 0.2 +
              Math.sin(2 * Math.PI * (chord * 2) * t) * 0.1) * pluck * 0.7;
    });
    fs.writeFileSync(guitarPath, guitarBuf);
  }

  // 2. Bass stem (Warm low 808-style bassline)
  const bassPath = path.join(UPLOADS_DIR, 'adhoori-bass-take-01.wav');
  if (!fs.existsSync(bassPath)) {
    const bassBuf = createWavBuffer(duration, (t) => {
      const notes = [41.20, 32.70, 49.00, 36.71]; // E1, C1, G1, D1
      const note = notes[Math.floor((t * 2) % 4)];
      const env = Math.exp(-((t * 2) % 1) * 3);
      return (Math.sin(2 * Math.PI * note * t) * 0.6 +
              Math.sin(2 * Math.PI * note * 2 * t) * 0.2) * env * 0.8;
    });
    fs.writeFileSync(bassPath, bassBuf);
  }

  // 3. Drums / Percussion stem (Tight acoustic kick & rim-click)
  const drumsPath = path.join(UPLOADS_DIR, 'adhoori-drums-take-01.wav');
  if (!fs.existsSync(drumsPath)) {
    const drumBuf = createWavBuffer(duration, (t) => {
      const beat = (t * 2) % 1;
      let sound = 0;
      // Kick on 1 and 3
      if (Math.floor(t * 2) % 2 === 0) {
        const kickFreq = 120 * Math.exp(-beat * 20);
        sound += Math.sin(2 * Math.PI * kickFreq * beat) * Math.exp(-beat * 10);
      } else {
        // Snare / rim on 2 and 4
        sound += (Math.random() * 2 - 1) * Math.exp(-beat * 14) * 0.4;
      }
      return sound * 0.7;
    });
    fs.writeFileSync(drumsPath, drumBuf);
  }

  // 4. Vocals stem (Lush vocal harmony melody)
  const vocalsPath = path.join(UPLOADS_DIR, 'adhoori-vocals-take-01.wav');
  if (!fs.existsSync(vocalsPath)) {
    const vocalBuf = createWavBuffer(duration, (t) => {
      const notes = [329.63, 392.00, 440.00, 493.88]; // E4, G4, A4, B4
      const note = notes[Math.floor((t * 1) % 4)];
      const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 5.5 * t);
      const breath = (Math.random() - 0.5) * 0.03;
      return (Math.sin(2 * Math.PI * (note * vibrato) * t) * 0.5 +
              Math.sin(2 * Math.PI * (note * 2 * vibrato) * t) * 0.15 + breath) * 0.65;
    });
    fs.writeFileSync(vocalsPath, vocalBuf);
  }
}

async function seedInitialData() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('[Seed] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[Seed] Generating music stems and seeding demo repository "Adhoori-Kahani"...');
  generateSampleStemFiles();

  // Create demo users
  const defaultPassword = 'Password123!';
  const pwHash = await User.hashPassword(defaultPassword);

  const vikash = await new User({
    username: 'vikash',
    email: 'vikash@musiccollab.io',
    passwordHash: pwHash,
    displayName: 'Vikash Sharma',
    primaryRole: 'Songwriter & Producer',
    instruments: ['Acoustic Guitar', 'Vocals', 'Piano'],
    bio: 'Songwriter and indie producer. Building honest songs one stem at a time.'
  }).save();

  const maya = await new User({
    username: 'maya-vocals',
    email: 'maya@musiccollab.io',
    passwordHash: pwHash,
    displayName: 'Maya Patel',
    primaryRole: 'Lead Vocalist & Lyricist',
    instruments: ['Lead Vocals', 'Harmonies'],
    bio: 'Classical Hindustani meets contemporary soul.'
  }).save();

  const arjun = await new User({
    username: 'arjun-drums',
    email: 'arjun@musiccollab.io',
    passwordHash: pwHash,
    displayName: 'Arjun Mehta',
    primaryRole: 'Drummer & Percussionist',
    instruments: ['Acoustic Kit', 'Cajon', 'Glockenspiel'],
    bio: 'Pocket drummer, timekeeper.'
  }).save();

  const sid = await new User({
    username: 'sid-guitar',
    email: 'sid@musiccollab.io',
    passwordHash: pwHash,
    displayName: 'Siddharth Roy',
    primaryRole: 'Lead Guitarist',
    instruments: ['Electric Guitar', 'Pedalboard FX'],
    bio: 'Ambient textures and crisp solos.'
  }).save();

  const neha = await new User({
    username: 'neha',
    email: 'neha@musiccollab.io',
    passwordHash: pwHash,
    displayName: 'Neha Sharma',
    primaryRole: 'Vocalist & Producer',
    instruments: ['Vocals', 'Synths'],
    bio: 'Lo-fi beats, ambient dream pop, warm vocals.'
  }).save();

  const rohan = await new User({
    username: 'rohan',
    email: 'rohan@musiccollab.io',
    passwordHash: pwHash,
    displayName: 'Rohan Verma',
    primaryRole: 'Bass & Arrangement',
    instruments: ['Bass', 'Keys'],
    bio: 'Groove-first basslines and arrangements.'
  }).save();

  // Create the flagship repository: "Adhoori Kahani"
  const repo = new SongRepository({
    name: 'Adhoori Kahani',
    slug: 'adhoori-kahani',
    description: 'An acoustic indie-rock ballad about unresolved memories, unfinished letters, and quiet highway drives.',
    genre: 'Indie Folk / Rock',
    bpm: 96,
    keySignature: 'E Minor',
    timeSignature: '4/4',
    status: 'Tracking',
    visibility: 'public',
    owner: vikash._id,
    defaultBranch: 'main',
    protectedBranches: ['main']
  });
  await repo.save();

  // Add members with roles
  await new RepositoryMember({
    repository: repo._id,
    user: maya._id,
    role: 'maintainer',
    instrumentRole: 'Lead Vocals & Lyricist',
    invitedBy: vikash._id
  }).save();

  await new RepositoryMember({
    repository: repo._id,
    user: arjun._id,
    role: 'contributor',
    instrumentRole: 'Drums / Percussion',
    invitedBy: vikash._id
  }).save();

  await new RepositoryMember({
    repository: repo._id,
    user: sid._id,
    role: 'contributor',
    instrumentRole: 'Lead & Ambient Guitar',
    invitedBy: vikash._id
  }).save();

  // Create branches: main, vocals/maya-v2, guitar/ambient-take
  const initialCommitHash = 'a47b192';
  const initialCommit = new Commit({
    repository: repo._id,
    branch: 'main',
    commitHash: initialCommitHash,
    message: 'Initial song setup: chords, arrangement notes & intro verse lyrics',
    author: vikash._id,
    snapshot: {
      lyrics: {
        content: `[Intro]
(Soft acoustic picking in E minor)

[Verse 1]
Khidki pe bachi hai dhoop thodi si
Dhoondhe tujhe ye raahein khoi si
Kagaz pe jo likhi thi baatein
Woh raat mein hi reh gayi

[Chorus]
Adhoori kahani, adhoore se hum
Chalte rahe be-irada kadam
Na manzil ka pata, na lautne ka gham
Adhoori kahani, adhoore se hum

[Verse 2]
Khaamoshiyon mein dabi ek sada
Poochhe hawaon se tera pata

[Bridge]
Kash yeh lamha yahin theher jaye
Raste naye koi mod le jaye

[Outro]
Adhoore se hum...
Adhoori kahani...`,
        sections: [
          { id: 'sec-intro', label: 'Intro', lines: ['(Soft acoustic picking in E minor)'] },
          { id: 'sec-v1', label: 'Verse 1', lines: ['Khidki pe bachi hai dhoop thodi si', 'Dhoondhe tujhe ye raahein khoi si', 'Kagaz pe jo likhi thi baatein', 'Woh raat mein hi reh gayi'] },
          { id: 'sec-chorus', label: 'Chorus', lines: ['Adhoori kahani, adhoore se hum', 'Chalte rahe be-irada kadam', 'Na manzil ka pata, na lautne ka gham', 'Adhoori kahani, adhoore se hum'] },
          { id: 'sec-v2', label: 'Verse 2', lines: ['Khaamoshiyon mein dabi ek sada', 'Poochhe hawaon se tera pata'] },
          { id: 'sec-bridge', label: 'Bridge', lines: ['Kash yeh lamha yahin theher jaye', 'Raste naye koi mod le jaye'] },
          { id: 'sec-outro', label: 'Outro', lines: ['Adhoore se hum...', 'Adhoori kahani...'] }
        ],
        version: 1
      },
      tracks: []
    },
    changes: {
      lyricsChanged: true
    }
  });
  await initialCommit.save();

  const mainBranch = new Branch({
    repository: repo._id,
    name: 'main',
    headCommit: initialCommit._id,
    isProtected: true,
    createdBy: vikash._id
  });
  await mainBranch.save();

  // Create contributor branch: vocals/maya-harmonies
  const vocalsBranch = new Branch({
    repository: repo._id,
    name: 'vocals/maya-harmonies',
    createdFromBranch: 'main',
    headCommit: initialCommit._id,
    isProtected: false,
    createdBy: maya._id
  });
  await vocalsBranch.save();

  // Create contributor branch: guitar/ambient-textures
  const guitarBranch = new Branch({
    repository: repo._id,
    name: 'guitar/ambient-textures',
    createdFromBranch: 'main',
    headCommit: initialCommit._id,
    isProtected: false,
    createdBy: sid._id
  });
  await guitarBranch.save();

  // Create LyricsDocument for main
  const mainLyrics = new LyricsDocument({
    repository: repo._id,
    branch: 'main',
    title: 'Adhoori Kahani - Official Lyrics',
    rawText: `[Intro]
(Soft acoustic picking in E minor)

[Verse 1]
Khidki pe bachi hai dhoop thodi si
Dhoondhe tujhe ye raahein khoi si
Kagaz pe jo likhi thi baatein
Woh raat mein hi reh gayi

[Chorus]
Adhoori kahani, adhoore se hum
Chalte rahe be-irada kadam
Na manzil ka pata, na lautne ka gham
Adhoori kahani, adhoore se hum

[Verse 2]
Khaamoshiyon mein dabi ek sada
Poochhe hawaon se tera pata

[Bridge]
Kash yeh lamha yahin theher jaye
Raste naye koi mod le jaye

[Outro]
Adhoore se hum...
Adhoori kahani...`,
    sections: [
      { sectionId: 's-intro', label: 'Intro', lines: [{ lineId: 'l-0', text: '(Soft acoustic picking in E minor)', contributor: vikash._id, contributorName: vikash.displayName }] },
      { sectionId: 's-v1', label: 'Verse 1', lines: [
        { lineId: 'l-1', text: 'Khidki pe bachi hai dhoop thodi si', contributor: vikash._id, contributorName: vikash.displayName },
        { lineId: 'l-2', text: 'Dhoondhe tujhe ye raahein khoi si', contributor: vikash._id, contributorName: vikash.displayName },
        { lineId: 'l-3', text: 'Kagaz pe jo likhi thi baatein', contributor: vikash._id, contributorName: vikash.displayName },
        { lineId: 'l-4', text: 'Woh raat mein hi reh gayi', contributor: vikash._id, contributorName: vikash.displayName }
      ]},
      { sectionId: 's-chorus', label: 'Chorus', lines: [
        { lineId: 'l-5', text: 'Adhoori kahani, adhoore se hum', contributor: maya._id, contributorName: maya.displayName },
        { lineId: 'l-6', text: 'Chalte rahe be-irada kadam', contributor: maya._id, contributorName: maya.displayName },
        { lineId: 'l-7', text: 'Na manzil ka pata, na lautne ka gham', contributor: maya._id, contributorName: maya.displayName },
        { lineId: 'l-8', text: 'Adhoori kahani, adhoore se hum', contributor: maya._id, contributorName: maya.displayName }
      ]},
      { sectionId: 's-v2', label: 'Verse 2', lines: [
        { lineId: 'l-9', text: 'Khaamoshiyon mein dabi ek sada', contributor: vikash._id, contributorName: vikash.displayName },
        { lineId: 'l-10', text: 'Poochhe hawaon se tera pata', contributor: vikash._id, contributorName: vikash.displayName }
      ]},
      { sectionId: 's-bridge', label: 'Bridge', lines: [
        { lineId: 'l-11', text: 'Kash yeh lamha yahin theher jaye', contributor: vikash._id, contributorName: vikash.displayName },
        { lineId: 'l-12', text: 'Raste naye koi mod le jaye', contributor: vikash._id, contributorName: vikash.displayName }
      ]},
      { sectionId: 's-outro', label: 'Outro', lines: [
        { lineId: 'l-13', text: 'Adhoore se hum...', contributor: maya._id, contributorName: maya.displayName },
        { lineId: 'l-14', text: 'Adhoori kahani...', contributor: maya._id, contributorName: maya.displayName }
      ]}
    ],
    version: 1,
    draft: {
      rawText: `[Intro]
(Soft acoustic picking in E minor)

[Verse 1]
Khidki pe bachi hai dhoop thodi si
Dhoondhe tujhe ye raahein khoi si
Kagaz pe jo likhi thi baatein
Woh raat mein hi reh gayi

[Chorus]
Adhoori kahani, adhoore se hum
Chalte rahe be-irada kadam
Na manzil ka pata, na lautne ka gham
Adhoori kahani, adhoore se hum

[Verse 2]
Khaamoshiyon mein dabi ek sada
Poochhe hawaon se tera pata

[Bridge]
Kash yeh lamha yahin theher jaye
Raste naye koi mod le jaye

[Outro]
Adhoore se hum...
Adhoori kahani...`,
      lastEditedBy: vikash._id,
      lastSavedAt: new Date()
    },
    publishedCommitId: initialCommit._id
  });
  await mainLyrics.save();

  // Add tracks on main branch
  const guitarPath = path.join(UPLOADS_DIR, 'adhoori-guitar-take-01.wav');
  const bassPath = path.join(UPLOADS_DIR, 'adhoori-bass-take-01.wav');
  const drumsPath = path.join(UPLOADS_DIR, 'adhoori-drums-take-01.wav');
  const vocalsPath = path.join(UPLOADS_DIR, 'adhoori-vocals-take-01.wav');

  const guitarTrack = new Asset({
    repository: repo._id,
    branch: 'main',
    trackName: 'Acoustic Guitar',
    category: 'guitar',
    activeTakeId: 'take-gt-01',
    volume: 78,
    pan: -15,
    takes: [{
      takeId: 'take-gt-01',
      takeNumber: 1,
      label: 'Take 01 (Fingerpicked Martin D-28)',
      audioUrl: '/uploads/audio/adhoori-guitar-take-01.wav',
      originalFileName: 'adhoori-guitar-take-01.wav',
      duration: 16,
      sampleRate: 44100,
      fileSize: fs.existsSync(guitarPath) ? fs.statSync(guitarPath).size : 1411244,
      waveformData: extractWaveformPeaks(guitarPath, 100),
      uploadedBy: vikash._id,
      notes: 'Recorded with dual stereo condenser mics. Clean take.',
      createdAt: new Date(Date.now() - 3600000 * 24)
    }]
  });
  await guitarTrack.save();

  const bassTrack = new Asset({
    repository: repo._id,
    branch: 'main',
    trackName: 'Sub Bass & Warm 808',
    category: 'bass',
    activeTakeId: 'take-bs-01',
    volume: 82,
    pan: 0,
    takes: [{
      takeId: 'take-bs-01',
      takeNumber: 1,
      label: 'Take 01 (Fender Precision DI)',
      audioUrl: '/uploads/audio/adhoori-bass-take-01.wav',
      originalFileName: 'adhoori-bass-take-01.wav',
      duration: 16,
      sampleRate: 44100,
      fileSize: fs.existsSync(bassPath) ? fs.statSync(bassPath).size : 1411244,
      waveformData: extractWaveformPeaks(bassPath, 100),
      uploadedBy: vikash._id,
      notes: 'Warm low end foundation for the chorus drop.',
      createdAt: new Date(Date.now() - 3600000 * 18)
    }]
  });
  await bassTrack.save();

  const drumsTrack = new Asset({
    repository: repo._id,
    branch: 'main',
    trackName: 'Acoustic Drums',
    category: 'drums',
    activeTakeId: 'take-dr-01',
    volume: 72,
    pan: 0,
    takes: [{
      takeId: 'take-dr-01',
      takeNumber: 1,
      label: 'Take 01 (Rim-click & Kick groove)',
      audioUrl: '/uploads/audio/adhoori-drums-take-01.wav',
      originalFileName: 'adhoori-drums-take-01.wav',
      duration: 16,
      sampleRate: 44100,
      fileSize: fs.existsSync(drumsPath) ? fs.statSync(drumsPath).size : 1411244,
      waveformData: extractWaveformPeaks(drumsPath, 100),
      uploadedBy: arjun._id,
      notes: 'Subtle acoustic pocket drums with brushes.',
      createdAt: new Date(Date.now() - 3600000 * 12)
    }]
  });
  await drumsTrack.save();

  const vocalsTrack = new Asset({
    repository: repo._id,
    branch: 'main',
    trackName: 'Lead Vocals',
    category: 'vocals',
    activeTakeId: 'take-vc-01',
    volume: 88,
    pan: 0,
    takes: [{
      takeId: 'take-vc-01',
      takeNumber: 1,
      label: 'Take 01 (Dry Verse & Chorus Guide)',
      audioUrl: '/uploads/audio/adhoori-vocals-take-01.wav',
      originalFileName: 'adhoori-vocals-take-01.wav',
      duration: 16,
      sampleRate: 44100,
      fileSize: fs.existsSync(vocalsPath) ? fs.statSync(vocalsPath).size : 1411244,
      waveformData: extractWaveformPeaks(vocalsPath, 100),
      uploadedBy: maya._id,
      notes: 'Main vocal line sung in Neumann U87 clone. Slightly dry for reverb tweaking.',
      createdAt: new Date(Date.now() - 3600000 * 6)
    }]
  });
  await vocalsTrack.save();

  // Create commit 2: Stems added
  const commit2Hash = 'b82e910';
  const commit2 = new Commit({
    repository: repo._id,
    branch: 'main',
    commitHash: commit2Hash,
    parentCommits: [initialCommit._id],
    message: 'Added foundational rhythm stems: Acoustic Guitar, Sub Bass & Pocket Drums',
    author: vikash._id,
    snapshot: {
      lyrics: {
        content: mainLyrics.rawText,
        sections: mainLyrics.sections.map(s => ({ id: s.sectionId, label: s.label, lines: s.lines.map(l => l.text) })),
        version: 1
      },
      tracks: [
        { trackName: 'Acoustic Guitar', category: 'guitar', takeId: 'take-gt-01', takeNumber: 1, label: 'Take 01 (Fingerpicked Martin D-28)', audioUrl: '/uploads/audio/adhoori-guitar-take-01.wav', duration: 16 },
        { trackName: 'Sub Bass & Warm 808', category: 'bass', takeId: 'take-bs-01', takeNumber: 1, label: 'Take 01 (Fender Precision DI)', audioUrl: '/uploads/audio/adhoori-bass-take-01.wav', duration: 16 },
        { trackName: 'Acoustic Drums', category: 'drums', takeId: 'take-dr-01', takeNumber: 1, label: 'Take 01 (Rim-click & Kick groove)', audioUrl: '/uploads/audio/adhoori-drums-take-01.wav', duration: 16 }
      ]
    },
    changes: {
      lyricsChanged: false,
      addedTakes: [
        { trackName: 'Acoustic Guitar', takeNumber: 1, label: 'Take 01' },
        { trackName: 'Sub Bass & Warm 808', takeNumber: 1, label: 'Take 01' },
        { trackName: 'Acoustic Drums', takeNumber: 1, label: 'Take 01' }
      ]
    }
  });
  await commit2.save();

  mainBranch.headCommit = commit2._id;
  await mainBranch.save();

  // Create an open Pull Request from Maya for review
  const pr1 = new PullRequest({
    repository: repo._id,
    prNumber: 1,
    title: 'Add higher octave vocal harmonies to Chorus section',
    description: 'Recorded 3-part vocal harmonies on the chorus "Adhoori kahani, adhoore se hum". Cleaned up breaths and aligned timings with the acoustic guitar transients. Please listen and approve!',
    sourceBranch: 'vocals/maya-harmonies',
    targetBranch: 'main',
    status: 'open',
    author: maya._id,
    reviewers: [
      {
        user: vikash._id,
        status: 'pending',
        note: ''
      }
    ],
    diffSummary: {
      lyricsChanged: false,
      addedTakesCount: 1,
      hasConflicts: false,
      conflicts: []
    }
  });
  await pr1.save();

  // Create Song 2: "Raat Ke Safar" (Lo-fi • Ambient)
  const repo2 = new SongRepository({
    name: 'Raat Ke Safar',
    slug: 'raat-ke-safar',
    description: 'Late-night lo-fi chillhop track with rain textures, Rhodes chords and muted trumpet.',
    genre: 'Lo-fi / Ambient',
    bpm: 78,
    keySignature: 'D Minor',
    timeSignature: '4/4',
    status: 'Mixing',
    visibility: 'public',
    owner: neha._id,
    defaultBranch: 'main',
    protectedBranches: ['main'],
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5)
  });
  await repo2.save();
  await new RepositoryMember({ repository: repo2._id, user: vikash._id, role: 'maintainer', instrumentRole: 'Mix & Master' }).save();
  await new RepositoryMember({ repository: repo2._id, user: arjun._id, role: 'contributor', instrumentRole: 'Lo-fi Drum Beats' }).save();

  // Create Song 3: "Laal Dhun" (Alternative • Indie)
  const repo3 = new SongRepository({
    name: 'Laal Dhun',
    slug: 'laal-dhun',
    description: 'Punchy alternative indie rock with fuzz bass, driving rhythm and soaring vocals.',
    genre: 'Alternative / Indie',
    bpm: 128,
    keySignature: 'A Minor',
    timeSignature: '4/4',
    status: 'Tracking',
    visibility: 'public',
    owner: vikash._id,
    defaultBranch: 'main',
    protectedBranches: ['main'],
    updatedAt: new Date(Date.now() - 3600000 * 24 * 7)
  });
  await repo3.save();
  await new RepositoryMember({ repository: repo3._id, user: sid._id, role: 'contributor', instrumentRole: 'Fuzz Guitar' }).save();
  await new RepositoryMember({ repository: repo3._id, user: rohan._id, role: 'contributor', instrumentRole: 'Bass' }).save();

  // Create Song 4: "Sheher Se Door" (Acoustic • Chill)
  const repo4 = new SongRepository({
    name: 'Sheher Se Door',
    slug: 'sheher-se-door',
    description: 'Gentle fingerstyle acoustic ballad capturing sunset over the hills.',
    genre: 'Acoustic / Chill',
    bpm: 88,
    keySignature: 'G Major',
    timeSignature: '3/4',
    status: 'Arrangement',
    visibility: 'public',
    owner: arjun._id,
    defaultBranch: 'main',
    protectedBranches: ['main'],
    updatedAt: new Date(Date.now() - 3600000 * 24 * 8)
  });
  await repo4.save();
  await new RepositoryMember({ repository: repo4._id, user: vikash._id, role: 'contributor', instrumentRole: 'Acoustic Guitar' }).save();
  await new RepositoryMember({ repository: repo4._id, user: neha._id, role: 'contributor', instrumentRole: 'Backing Vocals' }).save();

  // Create Song 5: "Nayi Subah" (Pop • Hindi)
  const repo5 = new SongRepository({
    name: 'Nayi Subah',
    slug: 'nayi-subah',
    description: 'Upbeat Hindi indie-pop with uplifting synth hooks, acoustic strumming, and crisp percussion.',
    genre: 'Pop / Hindi',
    bpm: 114,
    keySignature: 'D Major',
    timeSignature: '4/4',
    status: 'Tracking',
    visibility: 'public',
    owner: vikash._id,
    defaultBranch: 'main',
    protectedBranches: ['main'],
    updatedAt: new Date(Date.now() - 3600000 * 24 * 14)
  });
  await repo5.save();
  await new RepositoryMember({ repository: repo5._id, user: maya._id, role: 'contributor', instrumentRole: 'Lead Vocals' }).save();
  await new RepositoryMember({ repository: repo5._id, user: sid._id, role: 'contributor', instrumentRole: 'Electric Guitar' }).save();
  await new RepositoryMember({ repository: repo5._id, user: rohan._id, role: 'contributor', instrumentRole: 'Bass' }).save();

  // Add realistic comments:
  // 1. Timestamp comment on audio waveform
  await new Comment({
    repository: repo._id,
    resourceType: 'audio_timestamp',
    trackId: guitarTrack._id,
    timestampSeconds: 4.2,
    author: sid._id,
    content: 'Love this fingerpicked transition between Em and C! Gives immense room for reverb.'
  }).save();

  await new Comment({
    repository: repo._id,
    resourceType: 'audio_timestamp',
    trackId: vocalsTrack._id,
    timestampSeconds: 8.5,
    author: vikash._id,
    content: 'The vocal dynamics here are perfect. Let us keep this take untouched in master.'
  }).save();

  // 2. Line comment on lyrics
  await new Comment({
    repository: repo._id,
    resourceType: 'lyrics_line',
    lineId: 'l-5',
    author: maya._id,
    content: 'Should we repeat the chorus twice during the final outro?'
  }).save();

  // 3. PR comment
  await new Comment({
    repository: repo._id,
    resourceType: 'pull_request',
    resourceId: '1',
    author: vikash._id,
    content: 'Reviewing the harmony takes now. Waveform alignment looks spot on with the kick.'
  }).save();

  // Add notifications
  await new Notification({
    recipient: vikash._id,
    sender: maya._id,
    repository: repo._id,
    type: 'pr_opened',
    title: 'Pull Request #1 Opened',
    message: '@maya-vocals opened PR #1: "Add higher octave vocal harmonies to Chorus section"',
    link: '/adhoori-kahani/pulls/1'
  }).save();

  // Add Audit logs
  await new AuditLog({
    repository: repo._id,
    user: vikash._id,
    action: 'REPO_INIT',
    details: 'Initialized song repository "Adhoori Kahani".'
  }).save();

  await new AuditLog({
    repository: repo._id,
    user: vikash._id,
    action: 'TAKE_UPLOADED',
    details: 'Uploaded Acoustic Guitar Take 01.'
  }).save();

  await new AuditLog({
    repository: repo._id,
    user: maya._id,
    action: 'PR_OPENED',
    details: 'Opened Pull Request #1: "Add higher octave vocal harmonies to Chorus section".'
  }).save();

  // Activities matching landing dashboard
  await new AuditLog({
    repository: repo2._id,
    user: neha._id,
    action: 'TAKE_UPLOADED',
    details: 'added a new vocal take on Raat Ke Safar',
    createdAt: new Date(Date.now() - 3600000 * 2)
  }).save();

  await new AuditLog({
    repository: repo._id,
    user: arjun._id,
    action: 'COMMENT_POSTED',
    details: 'commented on Ahoori Kahani: "This chorus sounds amazing! 🔥"',
    createdAt: new Date(Date.now() - 3600000 * 4)
  }).save();

  await new AuditLog({
    repository: repo3._id,
    user: vikash._id,
    action: 'COMMIT_PUSHED',
    details: 'pushed changes to Laal Dhun',
    createdAt: new Date(Date.now() - 3600000 * 6)
  }).save();

  await new AuditLog({
    repository: repo3._id,
    user: rohan._id,
    action: 'MEMBER_JOINED',
    details: 'joined the collaboration on Laal Dhun',
    createdAt: new Date(Date.now() - 3600000 * 24)
  }).save();

  await new AuditLog({
    repository: repo2._id,
    user: neha._id,
    action: 'PR_MERGED',
    details: 'merged a pull request on Raat Ke Safar',
    createdAt: new Date(Date.now() - 3600000 * 26)
  }).save();

  console.log('[Seed] Demo data seeding completed successfully! Demo accounts available:');
  console.log('       vikash / Password123!');
  console.log('       neha / Password123!');
  console.log('       maya-vocals / Password123!');
  console.log('       sid-guitar / Password123!');
  console.log('       arjun-drums / Password123!');
  console.log('       rohan / Password123!');
}

module.exports = { seedInitialData };
