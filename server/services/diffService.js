/**
 * Diff service for comparing lyrics, detecting conflicts,
 * and generating 3-way merges without data loss.
 */

function parseLines(text) {
  if (!text) return [];
  return text.split('\n');
}

/**
 * Line by line diff between source (head) and target (base)
 */
function computeLyricsDiff(baseText, compareText) {
  const baseLines = parseLines(baseText);
  const compareLines = parseLines(compareText);
  
  const diff = [];
  const maxLen = Math.max(baseLines.length, compareLines.length);

  for (let i = 0; i < maxLen; i++) {
    const baseLine = baseLines[i];
    const compareLine = compareLines[i];

    if (baseLine === undefined) {
      diff.push({
        type: 'added',
        lineIndex: i,
        baseText: null,
        compareText: compareLine
      });
    } else if (compareLine === undefined) {
      diff.push({
        type: 'removed',
        lineIndex: i,
        baseText: baseLine,
        compareText: null
      });
    } else if (baseLine !== compareLine) {
      diff.push({
        type: 'modified',
        lineIndex: i,
        baseText: baseLine,
        compareText: compareLine
      });
    } else {
      diff.push({
        type: 'unchanged',
        lineIndex: i,
        baseText: baseLine,
        compareText: compareLine
      });
    }
  }

  return diff;
}

/**
 * 3-way merge conflict detector between base, current (target) and incoming (source)
 */
function detectLyricsConflicts(baseText, currentText, incomingText) {
  const base = parseLines(baseText);
  const current = parseLines(currentText);
  const incoming = parseLines(incomingText);

  const maxLen = Math.max(base.length, current.length, incoming.length);
  const conflicts = [];
  const mergedLines = [];

  for (let i = 0; i < maxLen; i++) {
    const b = base[i] !== undefined ? base[i] : null;
    const c = current[i] !== undefined ? current[i] : null;
    const inc = incoming[i] !== undefined ? incoming[i] : null;

    // Both made no changes to this line
    if (c === inc) {
      if (c !== null) mergedLines.push(c);
      continue;
    }

    // Current changed it, incoming didn't (matches base)
    if (inc === b && c !== b) {
      if (c !== null) mergedLines.push(c);
      continue;
    }

    // Incoming changed it, current didn't (matches base)
    if (c === b && inc !== b) {
      if (inc !== null) mergedLines.push(inc);
      continue;
    }

    // Both changed the same line to different values -> CONFLICT!
    if (c !== inc && c !== b && inc !== b) {
      conflicts.push({
        lineIndex: i,
        base: b,
        current: c,
        incoming: inc,
        conflictMarker: `<<<<<<< CURRENT (Branch)\n${c || ''}\n=======\n${inc || ''}\n>>>>>>> INCOMING (PR)`
      });
      // In merged preview, include standard conflict block so nothing is lost
      mergedLines.push(`<<<<<<< CURRENT (${c || 'EMPTY'})\n=======\n${inc || 'EMPTY'}\n>>>>>>> INCOMING`);
    } else {
      // Default to whichever is present
      mergedLines.push(inc || c || '');
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    mergedPreview: mergedLines.join('\n')
  };
}

/**
 * Compare audio assets between two branches
 */
function compareTrackAssets(sourceTracks, targetTracks) {
  const targetMap = new Map(targetTracks.map(t => [t.trackName, t]));
  const sourceMap = new Map(sourceTracks.map(t => [t.trackName, t]));

  const addedTracks = [];
  const modifiedTracks = [];
  const conflicts = [];

  for (const [name, sourceTrack] of sourceMap.entries()) {
    if (!targetMap.has(name)) {
      addedTracks.push(sourceTrack);
    } else {
      const targetTrack = targetMap.get(name);
      // Check if takes differ or active take differs
      const sourceTakeCount = (sourceTrack.takes || []).length;
      const targetTakeCount = (targetTrack.takes || []).length;

      if (sourceTrack.activeTakeId !== targetTrack.activeTakeId || sourceTakeCount !== targetTakeCount) {
        modifiedTracks.push({
          trackName: name,
          sourceActiveTake: sourceTrack.activeTakeId,
          targetActiveTake: targetTrack.activeTakeId,
          sourceTakesCount: sourceTakeCount,
          targetTakesCount: targetTakeCount
        });
      }
    }
  }

  return {
    addedTracks,
    modifiedTracks,
    conflicts
  };
}

module.exports = {
  computeLyricsDiff,
  detectLyricsConflicts,
  compareTrackAssets
};
