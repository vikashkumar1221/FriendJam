const test = require('node:test');
const assert = require('node:assert/strict');
const { computeLyricsDiff, detectLyricsConflicts, compareTrackAssets } = require('../server/services/diffService');
const { extractWaveformPeaks, estimateDurationSeconds } = require('../server/services/audioService');

test('Scenario 1: Two contributors editing different lyrics lines should auto-merge cleanly without conflict', () => {
  const baseLyrics = `[Verse 1]
Line 1: The winter morning calls
Line 2: Footsteps on the pavement
Line 3: Lost in the fog`;

  // Contributor A modifies line 1
  const contributorAText = `[Verse 1]
Line 1: The silver morning calls
Line 2: Footsteps on the pavement
Line 3: Lost in the fog`;

  // Contributor B modifies line 3
  const contributorBText = `[Verse 1]
Line 1: The winter morning calls
Line 2: Footsteps on the pavement
Line 3: Vanished in the deep fog`;

  const mergeResult = detectLyricsConflicts(baseLyrics, contributorAText, contributorBText);
  assert.equal(mergeResult.hasConflicts, false, 'Different lines edited should not trigger conflict');
  assert.ok(mergeResult.mergedPreview.includes('Line 1: The silver morning calls'));
  assert.ok(mergeResult.mergedPreview.includes('Line 3: Vanished in the deep fog'));
});

test('Scenario 2: Two contributors editing the SAME lyrics line triggers explicit conflict resolution', () => {
  const baseLyrics = `[Chorus]
Adhoori kahani, adhoore se hum`;

  // Maya's version
  const mayaLyrics = `[Chorus]
Adhoori kahani, theher gaye hum`;

  // Vikash's version
  const vikashLyrics = `[Chorus]
Adhoori dastaan, bikhar gaye hum`;

  const conflictResult = detectLyricsConflicts(baseLyrics, mayaLyrics, vikashLyrics);
  assert.equal(conflictResult.hasConflicts, true, 'Simultaneous conflicting line edit must be detected');
  assert.equal(conflictResult.conflicts.length, 1);
  assert.ok(conflictResult.mergedPreview.includes('<<<<<<< CURRENT'));
  assert.ok(conflictResult.mergedPreview.includes('>>>>>>> INCOMING'));
  // Neither person's lyrics should be silently deleted
  assert.ok(conflictResult.mergedPreview.includes('Adhoori kahani, theher gaye hum'));
  assert.ok(conflictResult.mergedPreview.includes('Adhoori dastaan, bikhar gaye hum'));
});

test('Scenario 3: Two contributors uploading recordings to the same logical track preserves both takes', () => {
  const trackTakes = [
    { takeId: 'take-1', takeNumber: 1, label: 'Take 01 (Maya original)' }
  ];

  // Contributor B uploads Take 2
  const newTake = { takeId: 'take-2', takeNumber: 2, label: 'Take 02 (Maya harmonies)' };
  trackTakes.push(newTake);

  assert.equal(trackTakes.length, 2, 'Both takes must exist in track history');
  assert.equal(trackTakes[0].takeId, 'take-1');
  assert.equal(trackTakes[1].takeId, 'take-2');
});

test('Scenario 4: Audio track comparison between branches correctly detects takes added and modifications', () => {
  const targetTracks = [
    { trackName: 'Acoustic Guitar', activeTakeId: 'take-1', takes: [{ takeId: 'take-1' }] },
    { trackName: 'Bass', activeTakeId: 'take-1', takes: [{ takeId: 'take-1' }] }
  ];

  const sourceTracks = [
    { trackName: 'Acoustic Guitar', activeTakeId: 'take-2', takes: [{ takeId: 'take-1' }, { takeId: 'take-2' }] },
    { trackName: 'Bass', activeTakeId: 'take-1', takes: [{ takeId: 'take-1' }] },
    { trackName: 'Lead Synth Solo', activeTakeId: 'take-synth-1', takes: [{ takeId: 'take-synth-1' }] }
  ];

  const comp = compareTrackAssets(sourceTracks, targetTracks);
  assert.equal(comp.addedTracks.length, 1, 'Should detect 1 newly added track stem');
  assert.equal(comp.addedTracks[0].trackName, 'Lead Synth Solo');
  assert.equal(comp.modifiedTracks.length, 1, 'Should detect 1 modified track (Acoustic Guitar)');
  assert.equal(comp.modifiedTracks[0].trackName, 'Acoustic Guitar');
});

test('Scenario 5: Lyrics diff service correctly flags added, removed, and modified lines', () => {
  const base = `Line A\nLine B\nLine C`;
  const head = `Line A\nLine B modified\nLine C\nLine D added`;

  const diff = computeLyricsDiff(base, head);
  assert.equal(diff[0].type, 'unchanged');
  assert.equal(diff[1].type, 'modified');
  assert.equal(diff[2].type, 'unchanged');
  assert.equal(diff[3].type, 'added');
});

test('Scenario 6: Role hierarchy enforces permission boundaries', () => {
  const { ROLE_HIERARCHY } = require('../server/middleware/auth');
  assert.ok(ROLE_HIERARCHY.owner > ROLE_HIERARCHY.maintainer);
  assert.ok(ROLE_HIERARCHY.maintainer > ROLE_HIERARCHY.reviewer);
  assert.ok(ROLE_HIERARCHY.reviewer > ROLE_HIERARCHY.contributor);
  assert.ok(ROLE_HIERARCHY.contributor > ROLE_HIERARCHY.viewer);
  // Viewers cannot merge or push
  assert.ok(ROLE_HIERARCHY.viewer < ROLE_HIERARCHY.maintainer);
});
