'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playClickSound } from '@/utils/audio';
import { TYPING_STUDY_CURRICULUM } from '@/data/curriculumData';
import { WORDS_DIFFICULTY, FINGER_MAP } from '@/constants/keyboard';
import {
  roundTo2,
  calculateWpm,
  computeCharCounts,
  computeAccuracy,
  replayTypedWords,
  buildResults,
} from '@/utils/metrics';

export const THEME_CONFIGS = {
  monkey: {
    id: 'monkey',
    name: 'Dark Yellow',
    isLight: false,
    bg: 'bg-[#212224]',
    cardBg: 'bg-[#2c2e31]',
    cardBorder: 'border-white/10',
    primary: '#e2b714',
    textPrimary: 'text-[#e2b714]',
    bgPrimary: 'bg-[#e2b714]',
    textMain: 'text-[#d1d0c5]',
    subText: 'text-white/40',
    keyBg: 'bg-white/5',
    keyText: 'text-white/60',
    error: '#ca4754',
    altError: '#7e2a33',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Pink',
    isLight: false,
    bg: 'bg-[#282a36]',
    cardBg: 'bg-[#44475a]',
    cardBorder: 'border-[#6272a4]/40',
    primary: '#ff79c6',
    textPrimary: 'text-[#ff79c6]',
    bgPrimary: 'bg-[#ff79c6]',
    textMain: 'text-[#f8f8f2]',
    subText: 'text-[#6272a4]',
    keyBg: 'bg-white/5',
    keyText: 'text-white/60',
    error: '#ff5555',
    altError: '#ff5555',
  },
  nord: {
    id: 'nord',
    name: 'Nord Frost',
    isLight: false,
    bg: 'bg-[#2e3440]',
    cardBg: 'bg-[#3b4252]',
    cardBorder: 'border-[#4c566a]/40',
    primary: '#88c0d0',
    textPrimary: 'text-[#88c0d0]',
    bgPrimary: 'bg-[#88c0d0]',
    textMain: 'text-[#eceff4]',
    subText: 'text-[#4c566a]',
    keyBg: 'bg-white/5',
    keyText: 'text-white/60',
    error: '#bf616a',
    altError: '#bf616a',
  },
  serika: {
    id: 'serika',
    name: 'Serika Light',
    isLight: true,
    bg: 'bg-[#e1e1e1]',
    cardBg: 'bg-[#d1d0c5]',
    cardBorder: 'border-black/10',
    primary: '#e2b714',
    textPrimary: 'text-[#b89100]',
    bgPrimary: 'bg-[#e2b714]',
    textMain: 'text-[#323437]',
    subText: 'text-[#646669]',
    keyBg: 'bg-black/5',
    keyText: 'text-[#323437]',
    error: '#ca4754',
    altError: '#7e2a33',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    isLight: false,
    bg: 'bg-[#181825]',
    cardBg: 'bg-[#1e1e2e]',
    cardBorder: 'border-[#313244]',
    primary: '#89dceb',
    textPrimary: 'text-[#89dceb]',
    bgPrimary: 'bg-[#89dceb]',
    textMain: 'text-[#cdd6f4]',
    subText: 'text-[#6c7086]',
    keyBg: 'bg-white/5',
    keyText: 'text-white/60',
    error: '#f38ba8',
    altError: '#eba0ac',
  },
};

const MAX_EXTRA_CHARS = 10;

export function useTypingEngine() {
  const [testCategory, setTestCategory] = useState('curriculum');
  const [modeType, setModeType] = useState('time');
  const [timeLimit, setTimeLimit] = useState(30);
  const [wordLimit, setWordLimit] = useState(25);
  const [difficulty, setDifficulty] = useState('medium');

  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [selectedSubLessonId, setSelectedSubLessonId] = useState('1-1');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundProfile, setSoundProfile] = useState('thock');
  const [theme, setTheme] = useState('monkey');

  // Core Engine States
  const [words, setWords] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedWords, setTypedWords] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Monkeytype Metrics
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [consistency, setConsistency] = useState(100);
  const [burstWpm, setBurstWpm] = useState(0);
  const [wordBursts, setWordBursts] = useState([]);
  const [charStats, setCharStats] = useState([0, 0, 0, 0]);
  const [completedWordsCount, setCompletedWordsCount] = useState(0);
  const [charErrors, setCharErrors] = useState({});

  const [chartData, setChartData] = useState([]);

  // Engine refs (the event log is the single source of truth for metrics)
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const wordStartTimeRef = useRef(null);
  const eventsRef = useRef([]);
  const keypressesRef = useRef([]);
  const wordBurstsRef = useRef([]);
  const finishGuardRef = useRef(false);
  const finishRef = useRef(null);

  const wordsRef = useRef(words);
  const typedWordsRef = useRef(typedWords);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    typedWordsRef.current = typedWords;
  }, [typedWords]);

  const activeLesson = TYPING_STUDY_CURRICULUM.find((lesson) => lesson.id === selectedLessonId) || TYPING_STUDY_CURRICULUM[0];
  const activeSubLesson = activeLesson.subLessons.find((sub) => sub.id === selectedSubLessonId) || activeLesson.subLessons[0];
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.monkey;

  const isTimedTest = testCategory === 'free' && modeType === 'time';
  const isWordsTest = testCategory === 'free' && modeType === 'words';

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateCurriculumText = useCallback((subText, newKeys = [], wordCount = 100) => {
    const sourceChars = subText
      ? Array.from(new Set(subText.replace(/\s+/g, '').split('')))
      : (newKeys.length > 0 ? newKeys : ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);

    const generated = [];
    for (let i = 0; i < wordCount; i++) {
      const len = Math.floor(Math.random() * 4) + 2;
      let word = '';
      for (let j = 0; j < len; j++) {
        word += sourceChars[Math.floor(Math.random() * sourceChars.length)];
      }
      generated.push(word);
    }
    return shuffleArray(generated);
  }, []);

  const generateWords = useCallback((count = 100) => {
    const wordPool = WORDS_DIFFICULTY[difficulty] || WORDS_DIFFICULTY.medium;
    let res = [];
    while (res.length < count) {
      res = res.concat(shuffleArray(wordPool));
    }
    return res.slice(0, count);
  }, [difficulty]);

  const loadTextContent = useCallback(() => {
    if (testCategory === 'curriculum') {
      return generateCurriculumText(activeSubLesson.text, activeLesson.newKeys, 120);
    }
    return modeType === 'words' ? generateWords(wordLimit) : generateWords(120);
  }, [testCategory, activeSubLesson, activeLesson, modeType, wordLimit, generateCurriculumText, generateWords]);

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = null;
    wordStartTimeRef.current = null;
    finishGuardRef.current = false;
    eventsRef.current = [];
    keypressesRef.current = [];
    wordBurstsRef.current = [];

    const initialWords = loadTextContent();
    setWords(initialWords);
    wordsRef.current = initialWords;
    setCurrentWordIdx(0);
    const initialTyped = [''];
    setTypedWords(initialTyped);
    typedWordsRef.current = initialTyped;
    setIsStarted(false);
    setElapsedSeconds(0);
    setIsFinished(false);

    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setConsistency(100);
    setBurstWpm(0);
    setWordBursts([]);
    setCharStats([0, 0, 0, 0]);
    setCompletedWordsCount(0);
    setCharErrors({});
    setChartData([]);
  }, [loadTextContent]);

  // Read & Save LocalStorage
  // One-time hydration from an external store; running these setters is the
  // whole point of the effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('typing_app_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.testCategory) setTestCategory(parsed.testCategory);
        if (parsed.modeType) setModeType(parsed.modeType);
        if (parsed.timeLimit) setTimeLimit(parsed.timeLimit);
        if (parsed.wordLimit) setWordLimit(parsed.wordLimit);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (parsed.selectedLessonId) setSelectedLessonId(parsed.selectedLessonId);
        if (parsed.selectedSubLessonId) setSelectedSubLessonId(parsed.selectedSubLessonId);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.soundProfile) setSoundProfile(parsed.soundProfile);
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
      }
    } catch (e) {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    try {
      localStorage.setItem(
        'typing_app_config',
        JSON.stringify({
          testCategory, modeType, timeLimit, wordLimit, difficulty,
          selectedLessonId, selectedSubLessonId, theme, soundEnabled, soundProfile
        })
      );
    } catch (e) {}
  }, [testCategory, modeType, timeLimit, wordLimit, difficulty, selectedLessonId, selectedSubLessonId, theme, soundEnabled, soundProfile]);

  // Reset otomatis saat opsi tes berganti
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetTest();
  }, [selectedLessonId, selectedSubLessonId, testCategory, modeType, timeLimit, wordLimit, difficulty, resetTest]);

  const startTest = (now) => {
    setIsStarted(true);
    startTimeRef.current = now;
    wordStartTimeRef.current = now;
    finishGuardRef.current = false;
  };

  const recordWordBurst = (typedWord, startMs, endMs) => {
    if (!typedWord || !startMs || endMs <= startMs) return;
    const durationSeconds = (endMs - startMs) / 1000;
    // Monkeytype adds the commit character to the input length when the word
    // does not already end with a space.
    const burst = Math.round(calculateWpm(typedWord.length + 1, durationSeconds));
    if (Number.isFinite(burst)) {
      wordBurstsRef.current.push({ word: typedWord, burst });
    }
  };

  const finishTest = (now, typedSnapshot, forcedByTimer = false) => {
    if (finishGuardRef.current || !startTimeRef.current) return;
    finishGuardRef.current = true;

    const startMs = startTimeRef.current;
    let endMs = now;
    let duration;
    let finalTyped;

    if (forcedByTimer && isTimedTest) {
      // Cut the test exactly at the limit, just like Monkeytype's timer end.
      duration = timeLimit;
      endMs = startMs + timeLimit * 1000;
      finalTyped = replayTypedWords(eventsRef.current, timeLimit * 1000).typed;
    } else {
      duration = roundTo2((endMs - startMs) / 1000);
      finalTyped = typedSnapshot || typedWordsRef.current;
    }

    // The final word never gets a commit space, but Monkeytype still credits
    // its trigger character for the per-word burst.
    const lastTyped = finalTyped[finalTyped.length - 1] || '';
    if (lastTyped) {
      recordWordBurst(lastTyped, wordStartTimeRef.current, endMs);
    }

    const results = buildResults({
      words: wordsRef.current,
      typedWords: finalTyped,
      durationSeconds: duration,
      isTimed: isTimedTest,
      keypresses: keypressesRef.current,
      events: eventsRef.current,
      wordBursts: wordBurstsRef.current,
    });

    typedWordsRef.current = finalTyped;
    setTypedWords(finalTyped);
    setCurrentWordIdx(Math.max(0, finalTyped.length - 1));
    setElapsedSeconds(results.elapsedSeconds);
    setWpm(results.wpm);
    setRawWpm(results.rawWpm);
    setAccuracy(results.accuracy);
    setConsistency(results.consistency);
    setCharStats(results.charStats);
    setCompletedWordsCount(results.completedWords);
    setChartData(results.chartData);
    setWordBursts(results.wordBursts);
    setBurstWpm(results.burstWpm);
    setIsFinished(true);
    setIsStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Keep the timer callback pointing at the latest finishTest without
  // recreating the interval on every render.
  useEffect(() => {
    finishRef.current = () => finishTest(Date.now(), null, true);
  });

  const handleBackspace = (now = Date.now()) => {
    if (isFinished || !isStarted || !startTimeRef.current) return;

    const t = now - startTimeRef.current;
    const activeIndex = Math.max(0, typedWordsRef.current.length - 1);
    const currentTyped = typedWordsRef.current[activeIndex] || '';
    const currentWord = wordsRef.current[activeIndex] || '';

    if (currentTyped.length > 0) {
      const updated = [...typedWordsRef.current];
      updated[activeIndex] = currentTyped.slice(0, -1);
      typedWordsRef.current = updated;
      eventsRef.current.push({ t, type: 'delete' });
      setTypedWords(updated);
      playClickSound(false, soundEnabled, soundProfile);
      return;
    }

    if (activeIndex > 0) {
      const prevWord = wordsRef.current[activeIndex - 1] || '';
      const prevTyped = typedWordsRef.current[activeIndex - 1] || '';
      if (prevTyped !== prevWord) {
        eventsRef.current.push({ t, type: 'uncommit' });
        const updated = typedWordsRef.current.slice(0, -1);
        typedWordsRef.current = updated;
        setTypedWords(updated);
        setCurrentWordIdx(activeIndex - 1);
        wordStartTimeRef.current = now;
        playClickSound(false, soundEnabled, soundProfile);
      }
    }
  };

  const handleSpace = (now = Date.now()) => {
    if (isFinished || !isStarted || !startTimeRef.current) return;

    const elapsedMs = now - startTimeRef.current;
    if (isTimedTest && elapsedMs >= timeLimit * 1000) {
      finishTest(now, null, true);
      return;
    }

    const activeIndex = Math.max(0, typedWordsRef.current.length - 1);
    const currentTyped = typedWordsRef.current[activeIndex] || '';
    if (currentTyped.length === 0) return;

    const currentWord = wordsRef.current[activeIndex] || '';
    // Monkeytype counts the commit space as a keypress. It only matches when
    // the whole word is correct.
    eventsRef.current.push({ t: elapsedMs, type: 'space' });
    keypressesRef.current.push({ t: elapsedMs, correct: currentTyped === currentWord });

    recordWordBurst(currentTyped, wordStartTimeRef.current, now);
    wordStartTimeRef.current = now;

    if (wordsRef.current.length - activeIndex < 30) {
      let extraWords = [];
      if (isTimedTest) {
        extraWords = generateWords(60);
      } else if (testCategory === 'curriculum') {
        extraWords = generateCurriculumText(activeSubLesson.text, activeLesson.newKeys, 60);
      }
      if (extraWords.length > 0) {
        const updatedWords = [...wordsRef.current, ...extraWords];
        wordsRef.current = updatedWords;
        setWords(updatedWords);
      }
    }

    const nextTyped = [...typedWordsRef.current, ''];
    typedWordsRef.current = nextTyped;
    setTypedWords(nextTyped);
    setCurrentWordIdx(activeIndex + 1);
    playClickSound(false, soundEnabled, soundProfile);
  };

  const handleChar = (char, now = Date.now()) => {
    if (isFinished || char.length !== 1) return;

    if (!isStarted || !startTimeRef.current) {
      startTest(now);
    }

    const elapsedMs = now - startTimeRef.current;
    if (isTimedTest && elapsedMs >= timeLimit * 1000) {
      finishTest(now, null, true);
      return;
    }

    const activeIndex = Math.max(0, typedWordsRef.current.length - 1);
    const currentWord = wordsRef.current[activeIndex] || '';
    const currentTyped = typedWordsRef.current[activeIndex] || '';

    if (currentTyped.length >= currentWord.length + MAX_EXTRA_CHARS) return;

    const targetChar = currentWord[currentTyped.length];
    const isCorrect = char === targetChar;
    const nextTypedValue = currentTyped + char;

    eventsRef.current.push({ t: elapsedMs, type: 'insert', char });
    keypressesRef.current.push({ t: elapsedMs, correct: isCorrect });

    if (!wordStartTimeRef.current) {
      wordStartTimeRef.current = now;
    }

    const updated = [...typedWordsRef.current];
    updated[activeIndex] = nextTypedValue;
    typedWordsRef.current = updated;
    setTypedWords(updated);

    if (!isCorrect) {
      setCharErrors((prev) => ({
        ...prev,
        [targetChar?.toLowerCase() || 'space']: (prev[targetChar?.toLowerCase() || 'space'] || 0) + 1
      }));
    }

    playClickSound(!isCorrect, soundEnabled, soundProfile);

    if (isWordsTest) {
      const isLastWord = activeIndex + 1 >= wordLimit;
      const isWordFullyTyped = nextTypedValue.length >= currentWord.length;
      if (isLastWord && isWordFullyTyped) {
        finishTest(now, updated, false);
      }
    }
  };

  // Realtime Timer Interval
  useEffect(() => {
    if (!isStarted || isFinished) return undefined;

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const now = Date.now();
      const elapsedMs = now - startTimeRef.current;
      const seconds = elapsedMs / 1000;

      setElapsedSeconds(Math.floor(seconds));

      // Live numbers use partial credit for the active word, exactly like
      // Monkeytype's live WPM.
      const chars = computeCharCounts(wordsRef.current, typedWordsRef.current, {
        creditPartialLastWord: true,
      });
      setWpm(Math.round(calculateWpm(chars.correctWord, seconds)));
      setRawWpm(Math.round(calculateWpm(chars.typedChars, seconds)));
      setAccuracy(computeAccuracy(keypressesRef.current));
      setCharStats([chars.correctWord, chars.incorrect, chars.extra, chars.missed]);
      setCompletedWordsCount(chars.completedPerfect);

      if (isTimedTest && elapsedMs >= timeLimit * 1000) {
        if (finishRef.current) finishRef.current();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isFinished, isTimedTest, timeLimit]);

  // Handler Tombol Keyboard Native Desktop
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      resetTest();
      return;
    }

    if (isFinished) return;

    const now = Date.now();

    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace(now);
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      handleSpace(now);
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      handleChar(e.key, now);
    }
  };

  const getNextChar = () => {
    const currentWord = words[currentWordIdx] || '';
    const currentTyped = typedWords[currentWordIdx] || '';
    return currentWord[currentTyped.length]?.toLowerCase();
  };

  const activeFinger = FINGER_MAP[getNextChar()] || '';

  return {
    state: {
      testCategory, setTestCategory, modeType, setModeType, timeLimit, setTimeLimit,
      wordLimit, setWordLimit, difficulty, setDifficulty, selectedLessonId, setSelectedLessonId,
      selectedSubLessonId, setSelectedSubLessonId, soundEnabled, setSoundEnabled,
      soundProfile, setSoundProfile, theme, setTheme, themeConfig,
      words, currentWordIdx, typedWords, isFinished, isStarted,
      wpm, rawWpm, accuracy, consistency, burstWpm, wordBursts, elapsedSeconds, completedWordsCount, charStats,
      chartData, charErrors, activeLesson, activeSubLesson
    },
    actions: {
      handleKeyDown,
      resetTest,
      getNextChar,
      activeFinger,
    }
  };
}
