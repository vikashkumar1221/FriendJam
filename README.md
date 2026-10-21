# MusicCollab — GitHub for Musicians

> **Every song has a history.**  
> A production-grade music collaboration platform designed with a distinctive **Neo-Brutalist / Digital Workshop** aesthetic. 
> Allows songwriters, vocalists, guitarists, drummers, and mix engineers to collaborate on the same song without overwriting, discarding, or losing each other's recordings and lyrics.

---

## ⚡ Core Philosophy & Workshop Design System

- **Off-white Raw Parchment Background (`#f5f3ec`)** with stark black borders (`2px solid #111`) and high-visibility **Acid-Yellow (`#d7ff3b`)** highlights.
- **Square, tactile corners (`rounded-none`)** with hard offset drop shadows (`shadow-[4px_4px_0px_#111]`).
- **Editorial Typography**: Large, expressive headers paired with monospaced metadata badges for sample rates (`44.1kHz / 16-bit`), Git SHAs (`a47b192`), timecodes (`00:08.5`), and branch tags (`git: vocals/maya-harmonies`).
- **Zero Placeholder Blobs / Zero Fake Buttons**: Every fader, mute button, waveform seeker, branch switcher, and conflict resolver connects to live state and backend operations.

---

## 🛠 Features Breakdown

### 1. Repository Management & Flagship Demo (`Adhoori-Kahani`)
- Each song is a complete Git repository containing:
  - Song metadata: Key signature, BPM tempo, meter, production status (`Idea / Jam`, `Tracking`, `Mixing`, `Mastering`, `Released`).
  - Owner & collaborator band members with role-based access control.
  - Default protected branch (`main`) + contributor branches.
  - Stems directory, lyrics revision stack, and immutable audit trail.

### 2. Multitrack Studio Engine
- **Synchronized Web Audio Playback**: Simultaneously streams and plays all stem takes in sync.
- **Real Waveform Visualization**: Computes normalized waveform amplitude peaks.
- **Per-Track Mixing Desk**:
  - Track labels, category tags (`vocals`, `guitar`, `bass`, `drums`, `keys`, `master`), and contributor attribution.
  - Volume faders (0–100%) and stereo Pan controls (-50 to +50).
  - Dedicated **[M]ute** and **[S]olo** buttons with immediate audio routing.
- **Take Management**:
  - Multiple takes per track (`Take 01`, `Take 02`, `Take 03`...).
  - Active take selector.
  - Uploading a new take **never overwrites** existing files.
- **Timestamp Comments**:
  - Click on any second in the waveform to leave an exact timecode critique (e.g. `00:04.2 - "Lower gain on acoustic guitar transient"`).
  - Visual color-coded comment flags rendered along the timeline.
- **Export & Download**: Authorized collaborators can download raw WAV audio files.

### 3. Lyrics Version Control & Conflict Resolver
- Section markers: `[Intro]`, `[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Outro]`.
- Live autosave draft buffer with optimistic concurrency revision tracking.
- Line-level contributor attribution and line critique comments.
- **3-Way Conflict Detection**:
  - If two contributors edit different lines, changes merge cleanly.
  - If both edit the exact same chorus line simultaneously, the 3-way resolver displays both versions side-by-side with manual combination controls. Changes are never silently discarded.

### 4. Git-Inspired Commit History
- Commit log with 7-character hexadecimal SHA hashes.
- Commit messages, author badges, and branch tags.
- Detailed inspector showing lyrics textual diffs (additions in green, deletions in red) and audio take snapshot trees.
- **Revert Commit**: Inverts a commit by safely recording a new revert commit without deleting history.
- **Restore Version**: Restores past lyrics and stem snapshots into a new commit.

### 5. Pull Requests & Code Reviews
- Propose merges from feature branches (e.g. `vocals/maya-harmonies` &rarr; `main`).
- Side-by-side lyrics diff and audio stem changes preview.
- Discussion thread and review status: **Approve** or **Request Changes**.
- **Protected Branch Security**: Only Maintainers and Owners can merge into protected branches like `main`. Unresolved conflicts prevent merges automatically.

### 6. Recoverable Trash Bin & Audit Trail
- Soft-deletion of audio tracks moves them to the trash bin.
- **1-Click Restore**: Recovers deleted tracks and takes back into the active mix.
- **Immutable Audit Log**: Records every take upload, branch creation, commit push, and PR merge.

---

## 👥 Demo Musician Accounts (Pre-Seeded)

All demo accounts use password: `Password123!`

| Username | Name | Role | Primary Instrument |
| :--- | :--- | :--- | :--- |
| `vikash` | Vikash Sharma | **Owner & Producer** | Acoustic Guitar, Vocals, Piano |
| `maya-vocals` | Maya Patel | **Maintainer & Lyricist** | Lead Vocals, Harmonies |
| `sid-guitar` | Siddharth Roy | **Contributor** | Electric & Ambient Guitar |
| `arjun-drums` | Arjun Mehta | **Contributor** | Drums & Percussion |

> *Tip: Use the **ROLE: @username** button in the top navigation bar to switch between collaborator personas with 1 click!*

---

## 🚀 Running the Project

### 1. Quick Start (Full Stack)
```bash
# In the project root:
npm start
```
Starts the API server and embedded MongoDB engine on **http://localhost:5055** (serving both the backend API and the compiled React production client).

### 2. Development Mode (Hot Reloading)
```bash
npm run dev
```
Runs both:
- Express API server on `http://localhost:5055`
- Vite React frontend on `http://localhost:5173` (with `/api` and `/uploads` proxy)

### 3. Run Automated Critical Operation Tests
```bash
npm test
```
Executes the test suite covering:
1. Multi-contributor lyrics auto-merging across separate lines.
2. Simultaneous edit conflict detection on identical lines.
3. Preservation of multiple takes uploaded to the same logical track.
4. Audio track delta and take modification detection between branches.
5. Line-by-line diff additions and deletions.
6. Role-based permission hierarchy boundaries.
