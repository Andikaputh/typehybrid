/**
 * Monkeytype-compatible typing metrics.
 *
 * Formulas and character-counting rules are ported from Monkeytype's source:
 * - packages/util/src/numbers.ts        (mean, stdDev, kogasa, roundTo2)
 * - frontend/src/ts/utils/strings.ts    (countChars)
 * - frontend/src/ts/utils/numbers.ts    (calculateWpm)
 * - frontend/src/ts/test/events/stats.ts(getWpmHistory, getBurstHistory, getAccuracy)
 * - frontend/src/ts/test/test-logic.ts  (final result composition)
 *
 * The important differences from the old engine:
 * - WPM counts characters of *correct words only* (plus partial chars in timed mode),
 *   not every correct character.
 * - Raw WPM counts allCorrect + incorrect + extra characters (not missed).
 * - Accuracy is keypress based: corrected typos still count as mistakes.
 * - Consistency uses the kogasa mapping of the coefficient of variation of
 *   per-second raw WPM, not (1 - cv) * 100.
 * - The chart is cumulative WPM per second, per-second raw WPM and errors.
 */

export const roundTo2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export function mean(array) {
  if (!array || array.length === 0) return 0;
  return array.reduce((a, b) => a + b, 0) / array.length;
}

export function stdDev(array) {
  if (!array || array.length === 0) return 0;
  const avg = mean(array);
  const variance = array.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / array.length;
  return Math.sqrt(variance);
}

/** Maps a coefficient of variation to a 0-100 consistency score (Monkeytype's curve). */
export function kogasa(cov) {
  return 100 * (1 - Math.tanh(cov + Math.pow(cov, 3) / 3 + Math.pow(cov, 5) / 5));
}

/** Monkeytype's core speed formula: chars / 5 / minutes. */
export function calculateWpm(charCount, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  return charCount / 5 / (durationSeconds / 60);
}

/**
 * Port of Monkeytype's countChars.
 * Counts a single word. `creditPartial` decides whether a partially typed word
 * that is still a correct prefix earns WPM characters (true in timed mode).
 */
export function countChars(inputWord, targetWord, creditPartial) {
  let allCorrect = 0;
  let correctWord = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;

  const wordCorrect = inputWord === targetWord;
  const wordPartiallyCorrect = targetWord.startsWith(inputWord);

  for (let i = 0; i < Math.max(inputWord.length, targetWord.length); i++) {
    const inputChar = inputWord[i];
    const targetChar = targetWord[i];

    if (inputChar === targetChar) {
      if (targetChar === ' ' && !wordCorrect) {
        extra += 1;
      } else {
        allCorrect += 1;
      }
      if (wordCorrect || (creditPartial && wordPartiallyCorrect)) {
        correctWord += 1;
      }
    } else if (inputChar === undefined) {
      // missed char
      if (!creditPartial) {
        missed += 1;
      }
    } else if (
      targetChar === undefined ||
      (targetChar === ' ' && inputChar !== ' ' && !inputWord.includes(' '))
    ) {
      // extra char (past target, or typed in place of word-ending space)
      extra += 1;
    } else {
      // incorrect char
      incorrect += 1;
    }
  }

  return { allCorrect, correctWord, incorrect, extra, missed };
}

/**
 * Aggregates character counts the same way Monkeytype's getChars does.
 *
 * Completed words are compared with their commit space (target + " " and
 * typed + " "), which is why an incorrectly submitted word turns its commit
 * space into an `extra` character. The active word is compared without a
 * commit space; `creditPartialLastWord` mirrors Monkeytype's timed-test
 * behaviour where partially typed words still earn WPM characters.
 */
export function computeCharCounts(words, typedWords, { creditPartialLastWord = false } = {}) {
  const totals = { allCorrect: 0, correctWord: 0, incorrect: 0, extra: 0, missed: 0 };
  const lastIndex = typedWords.length - 1;
  let completedPerfect = 0;

  for (let i = 0; i < typedWords.length; i++) {
    const typed = typedWords[i] ?? '';
    const target = words[i] ?? '';
    const isActive = i === lastIndex;

    const counts = isActive
      ? countChars(typed, target, creditPartialLastWord)
      : countChars(`${typed} `, `${target} `, false);

    totals.allCorrect += counts.allCorrect;
    totals.correctWord += counts.correctWord;
    totals.incorrect += counts.incorrect;
    totals.extra += counts.extra;
    totals.missed += counts.missed;

    if (typed === target) completedPerfect += 1;
  }

  return {
    ...totals,
    completedPerfect,
    typedChars: totals.allCorrect + totals.incorrect + totals.extra,
  };
}

/** Accuracy from raw keypresses. Corrected errors still count (Monkeytype behaviour). */
export function computeAccuracy(keypresses) {
  if (!keypresses || keypresses.length === 0) return 100;
  const correct = keypresses.reduce((total, key) => total + (key.correct ? 1 : 0), 0);
  return roundTo2((correct / keypresses.length) * 100);
}

/**
 * Rebuilds the typed-word state as it existed at `upToMs` from the event log.
 * Used for the per-second WPM chart and for cutting a timed test at exactly
 * the time limit.
 */
export function replayTypedWords(events, upToMs) {
  const typed = [''];
  let current = 0;

  for (const event of events) {
    if (event.t > upToMs) break;

    if (event.type === 'insert') {
      typed[current] = (typed[current] ?? '') + event.char;
    } else if (event.type === 'delete') {
      typed[current] = (typed[current] ?? '').slice(0, -1);
    } else if (event.type === 'space') {
      if (!typed[current]) continue;
      typed.push('');
      current += 1;
    } else if (event.type === 'uncommit') {
      if (current <= 0) continue;
      typed.pop();
      current -= 1;
    }
  }

  return { typed, currentWordIdx: current };
}

/** Timer boundaries: whole seconds, plus a fractional tail for words tests. */
export function getTimerBoundaries(durationSeconds, isTimed) {
  const round = roundTo2(durationSeconds);
  const whole = Math.floor(round);
  const boundaries = [];

  for (let second = 1; second <= whole; second++) {
    boundaries.push(second);
  }

  const remainder = round - whole;
  if (!isTimed && remainder >= 0.5) {
    boundaries.push(round);
  }

  return boundaries;
}

/**
 * Per-second raw WPM and error counts, matching Monkeytype's burst history.
 * Every inserted keypress (including commit spaces) counts; deletions do not.
 */
export function computeBurstHistory(keypresses, boundaries) {
  const bursts = [];
  const errors = [];
  let index = 0;
  let previousBoundary = 0;

  for (const boundary of boundaries) {
    let keyCount = 0;
    let errorCount = 0;

    while (index < keypresses.length && keypresses[index].t <= boundary * 1000) {
      keyCount += 1;
      if (!keypresses[index].correct) errorCount += 1;
      index += 1;
    }

    const intervalSeconds = boundary - previousBoundary;
    previousBoundary = boundary;

    bursts.push(Math.round(calculateWpm(keyCount, intervalSeconds)));
    errors.push(errorCount);
  }

  return { bursts, errors };
}

/**
 * Builds every result value at once so live counters and the result screen use
 * exactly the same maths.
 */
export function buildResults({
  words,
  typedWords,
  durationSeconds,
  isTimed,
  keypresses,
  events,
  wordBursts = [],
}) {
  const duration = roundTo2(durationSeconds);
  const partial = isTimed;

  const chars = computeCharCounts(words, typedWords, { creditPartialLastWord: partial });
  const wpm = roundTo2(calculateWpm(chars.correctWord, duration));
  const rawWpm = roundTo2(calculateWpm(chars.typedChars, duration));
  const accuracy = computeAccuracy(keypresses);

  const boundaries = getTimerBoundaries(duration, isTimed);
  const { bursts, errors } = computeBurstHistory(keypresses, boundaries);

  // Consistency uses raw WPM per interval (Monkeytype's kogasa curve).
  const avg = mean(bursts);
  let consistency = roundTo2(kogasa(avg === 0 ? NaN : stdDev(bursts) / avg));
  if (!consistency || Number.isNaN(consistency)) consistency = 0;

  const chartData = boundaries.map((boundary, i) => {
    const snapshot = replayTypedWords(events, boundary * 1000);
    const snapshotChars = computeCharCounts(words, snapshot.typed, { creditPartialLastWord: true });
    return {
      time: boundary,
      wpm: Math.round(calculateWpm(snapshotChars.correctWord, boundary)),
      raw: bursts[i] ?? 0,
      errors: errors[i] > 0 ? errors[i] : null,
    };
  });

  const finiteBursts = wordBursts.filter((item) => Number.isFinite(item.burst));
  const burstWpm = finiteBursts.reduce((max, item) => Math.max(max, item.burst), 0);

  return {
    wpm,
    rawWpm,
    accuracy,
    consistency,
    charStats: [chars.correctWord, chars.incorrect, chars.extra, chars.missed],
    completedWords: chars.completedPerfect,
    elapsedSeconds: Math.round(duration),
    duration,
    chartData,
    wordBursts: finiteBursts,
    burstWpm,
    keypresses: keypresses.length,
    correctKeypresses: keypresses.reduce((total, key) => total + (key.correct ? 1 : 0), 0),
  };
}
