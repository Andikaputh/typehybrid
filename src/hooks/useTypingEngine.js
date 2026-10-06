'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playClickSound } from '@/utils/audio';
import { TYPING_STUDY_CURRICULUM } from '@/data/curriculumData';
import { WORDS_DIFFICULTY, FINGER_MAP } from '@/constants/keyboard';

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
  },
};

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
  const [errorsPerSecond, setErrorsPerSecond] = useState({});

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastRecordedSecRef = useRef(0);
  const prevTotalRawCharsRef = useRef(0);
  const wordStartTimeRef = useRef(null);

  const wordsRef = useRef(words);
  const typedWordsRef = useRef(typedWords);
  const errorsPerSecondRef = useRef(errorsPerSecond);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    typedWordsRef.current = typedWords;
  }, [typedWords]);

  useEffect(() => {
    errorsPerSecondRef.current = errorsPerSecond;
  }, [errorsPerSecond]);

  const activeLesson = TYPING_STUDY_CURRICULUM.find(l => l.id === selectedLessonId) || TYPING_STUDY_CURRICULUM[0];
  const activeSubLesson = activeLesson.subLessons.find(s => s.id === selectedSubLessonId) || activeLesson.subLessons[0];
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.monkey;

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateCurriculumText = useCallback((subText, newKeys = [], wordCount = 100) => {
    let sourceChars = subText 
      ? Array.from(new Set(subText.replace(/\s+/g, '').split(''))) 
      : (newKeys.length > 0 ? newKeys : ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);

    let generated = [];
    for (let i = 0; i < wordCount; i++) {
      const len = Math.floor(Math.random() * 4) + 2;
      let w = '';
      for (let j = 0; j < len; j++) {
        w += sourceChars[Math.floor(Math.random() * sourceChars.length)];
      }
      generated.push(w);
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
    } else {
      return modeType === 'words' ? generateWords(wordLimit) : generateWords(120);
    }
  }, [testCategory, activeSubLesson, activeLesson, modeType, wordLimit, generateCurriculumText, generateWords]);

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = null;
    wordStartTimeRef.current = null;
    lastRecordedSecRef.current = 0;
    prevTotalRawCharsRef.current = 0;

    const initialWords = loadTextContent();
    setWords(initialWords);
    setCurrentWordIdx(0);
    setTypedWords(['']);
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
    setErrorsPerSecond({});

    try {
      localStorage.removeItem('last_typing_result');
    } catch (e) {}
  }, [loadTextContent]);

  // Read & Save LocalStorage
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

  useEffect(() => {
    if (!isFinished) resetTest();
  }, [selectedLessonId, selectedSubLessonId, testCategory, modeType, timeLimit, wordLimit, difficulty, resetTest]);

  // Rumus Koefisien Variasi untuk Consistency
  const calculateConsistency = (dataSamples) => {
    if (!dataSamples || dataSamples.length <= 1) return 100;
    const rawValues = dataSamples.map(d => d.raw);
    const mean = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
    if (mean === 0) return 100;

    const variance = rawValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rawValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  };

  // Kalkulasi Karakter Sesuai Standar Monkeytype
  const evaluateMetrics = useCallback((wordsArr, typedWordsArr) => {
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;
    let correctCharsFromCorrectWords = 0;
    let completedWords = 0;

    for (let i = 0; i < typedWordsArr.length; i++) {
      const targetW = wordsArr[i] || '';
      const typedW = typedWordsArr[i] || '';
      const isCurrent = i === typedWordsArr.length - 1;

      let wordIsPerfect = (typedW === targetW);

      if (!isCurrent) {
        if (wordIsPerfect) {
          completedWords++;
          correctCharsFromCorrectWords += targetW.length + 1;
        }
        for (let j = 0; j < Math.max(targetW.length, typedW.length); j++) {
          if (j < typedW.length && j < targetW.length) {
            if (typedW[j] === targetW[j]) correct++;
            else incorrect++;
          } else if (j >= targetW.length) {
            extra++;
          } else if (j >= typedW.length) {
            missed++;
          }
        }
        correct++;
      } else {
        for (let j = 0; j < typedW.length; j++) {
          if (j < targetW.length) {
            if (typedW[j] === targetW[j]) correct++;
            else incorrect++;
          } else {
            extra++;
          }
        }
      }
    }

    const totalAttempts = correct + incorrect + extra;
    const acc = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 100;
    const rawChars = correct + incorrect + extra;

    return {
      charStats: [correct, incorrect, extra, missed],
      accuracy: acc,
      correctCharsFromCorrectWords,
      totalRawChars: rawChars,
      completedWords
    };
  }, []);

  const recordWordBurst = useCallback((wordStr, startTimeMs, endTimeMs) => {
    if (!startTimeMs || endTimeMs <= startTimeMs) return;
    const durationInSec = (endTimeMs - startTimeMs) / 1000;
    const currentWordBurst = Math.round((wordStr.length / durationInSec) * 12);

    setWordBursts(prev => [...prev, { word: wordStr, burst: currentWordBurst }]);
    setBurstWpm(prevMax => Math.max(prevMax, currentWordBurst));
  }, []);

  // Realtime Timer Interval
  useEffect(() => {
    if (isStarted && !isFinished) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        wordStartTimeRef.current = Date.now();
        lastRecordedSecRef.current = 0;
        prevTotalRawCharsRef.current = 0;
        setChartData([{ time: 0, wpm: 0, raw: 0, errors: null }]);
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const totalElapsedMs = now - startTimeRef.current;
        const seconds = Math.floor(totalElapsedMs / 1000);
        setElapsedSeconds(seconds);

        if (totalElapsedMs > 0) {
          const minutesSpent = totalElapsedMs / 60000;
          const { correctCharsFromCorrectWords, totalRawChars, charStats: currentStats, accuracy: currentAcc, completedWords } = evaluateMetrics(wordsRef.current, typedWordsRef.current);

          const currentWpm = Math.round((correctCharsFromCorrectWords / 5) / minutesSpent);
          const cumRawWpm = Math.round((totalRawChars / 5) / minutesSpent);

          setWpm(currentWpm);
          setRawWpm(cumRawWpm);
          setAccuracy(currentAcc);
          setCharStats(currentStats);
          setCompletedWordsCount(completedWords);

          if (seconds > lastRecordedSecRef.current) {
            lastRecordedSecRef.current = seconds;
            const deltaRawChars = totalRawChars - prevTotalRawCharsRef.current;
            prevTotalRawCharsRef.current = totalRawChars;
            const momentaryRawWpm = Math.round((deltaRawChars / 5) * 60);
            const errCountAtSec = errorsPerSecondRef.current[seconds] || 0;

            setChartData((prev) => {
              if (prev.some(d => d.time === seconds)) return prev;
              const updatedData = [
                ...prev,
                { time: seconds, wpm: currentWpm, raw: momentaryRawWpm, errors: errCountAtSec > 0 ? errCountAtSec : null }
              ];
              setConsistency(calculateConsistency(updatedData));
              return updatedData;
            });
          }
        }

        if (testCategory === 'free' && modeType === 'time' && seconds >= timeLimit) {
          setIsFinished(true);
          setIsStarted(false);
          clearInterval(timerRef.current);
        }
      }, 200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isFinished, testCategory, modeType, timeLimit, evaluateMetrics]);

  // Handler Tombol Keyboard
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      resetTest();
      return;
    }

    if (isFinished) return;

    const now = Date.now();

    if (!isStarted && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setIsStarted(true);
      startTimeRef.current = now;
      wordStartTimeRef.current = now;
      lastRecordedSecRef.current = 0;
      prevTotalRawCharsRef.current = 0;
      setChartData([{ time: 0, wpm: 0, raw: 0, errors: null }]);
    }

    const currentWord = words[currentWordIdx] || '';
    const currentTyped = typedWords[currentWordIdx] || '';

    if (e.key === 'Backspace') {
      if (currentTyped.length > 0) {
        const updated = [...typedWords];
        updated[currentWordIdx] = currentTyped.slice(0, -1);
        setTypedWords(updated);
        playClickSound(false, soundEnabled, soundProfile);
      } else if (currentWordIdx > 0) {
        const prevWord = words[currentWordIdx - 1];
        const prevTyped = typedWords[currentWordIdx - 1];
        if (prevTyped !== prevWord) {
          setCurrentWordIdx(currentWordIdx - 1);
          setTypedWords(typedWords.slice(0, -1));
          playClickSound(false, soundEnabled, soundProfile);
        }
      }
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      if (currentTyped.length === 0) return;

      recordWordBurst(currentTyped, wordStartTimeRef.current, now);
      wordStartTimeRef.current = now;

      if (words.length - currentWordIdx < 30) {
        if (testCategory === 'free' && modeType === 'time') {
          setWords(prev => [...prev, ...generateWords(60)]);
        } else if (testCategory === 'curriculum') {
          setWords(prev => [...prev, ...generateCurriculumText(activeSubLesson.text, activeLesson.newKeys, 60)]);
        }
      }

      setCurrentWordIdx(prev => prev + 1);
      setTypedWords(prev => [...prev, '']);
      playClickSound(false, soundEnabled, soundProfile);
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (currentTyped.length >= currentWord.length + 10) return;

      if (!wordStartTimeRef.current) {
        wordStartTimeRef.current = now;
      }

      const nextTyped = currentTyped + e.key;
      const targetChar = currentWord[currentTyped.length];
      const isCorrect = e.key === targetChar;

      const updated = [...typedWords];
      updated[currentWordIdx] = nextTyped;
      setTypedWords(updated);

      if (!isCorrect) {
        const curSec = Math.max(1, elapsedSeconds);
        setErrorsPerSecond(prev => ({ ...prev, [curSec]: (prev[curSec] || 0) + 1 }));
        setCharErrors(prev => ({
          ...prev,
          [targetChar?.toLowerCase() || 'space']: (prev[targetChar?.toLowerCase() || 'space'] || 0) + 1
        }));
      }

      playClickSound(!isCorrect, soundEnabled, soundProfile);

      if (testCategory === 'free' && modeType === 'words') {
        const isLastWord = currentWordIdx + 1 >= wordLimit;
        const isWordFullyTyped = nextTyped.length >= currentWord.length;

        if (isLastWord && isWordFullyTyped) {
          recordWordBurst(nextTyped, wordStartTimeRef.current, now);
          setIsFinished(true);
          setIsStarted(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }
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
    actions: { handleKeyDown, resetTest, getNextChar, activeFinger }
  };
}