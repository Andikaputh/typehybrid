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

  const [targetText, setTargetText] = useState('');
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Monkeytype Metrics
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [consistency, setConsistency] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [completedWordsCount, setCompletedWordsCount] = useState(0);
  const [charErrors, setCharErrors] = useState({});

  const [chartData, setChartData] = useState([]);
  const [errorsPerSecond, setErrorsPerSecond] = useState({});

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const activeLesson = TYPING_STUDY_CURRICULUM.find(l => l.id === selectedLessonId) || TYPING_STUDY_CURRICULUM[0];
  const activeSubLesson = activeLesson.subLessons.find(s => s.id === selectedSubLessonId) || activeLesson.subLessons[0];
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.monkey;

  // Algoritma Fisher-Yates Shuffle
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

    let words = [];
    for (let i = 0; i < wordCount; i++) {
      const len = Math.floor(Math.random() * 4) + 2;
      let w = '';
      for (let j = 0; j < len; j++) {
        w += sourceChars[Math.floor(Math.random() * sourceChars.length)];
      }
      words.push(w);
    }
    return shuffleArray(words).join(' ').replace(/\s+/g, ' ').trim();
  }, []);

  const generateWords = useCallback((count = 100) => {
    const wordPool = WORDS_DIFFICULTY[difficulty] || WORDS_DIFFICULTY.medium;
    let res = [];
    
    while (res.length < count) {
      const shuffledPool = shuffleArray(wordPool);
      res = res.concat(shuffledPool);
    }
    
    return res.slice(0, count).join(' ').replace(/\s+/g, ' ').trim();
  }, [difficulty]);

  // Pre-generate Buffer besar (120 kata) di awal
  const loadTextContent = useCallback(() => {
    let rawText = '';
    if (testCategory === 'curriculum') {
      rawText = generateCurriculumText(activeSubLesson.text, activeLesson.newKeys, 120);
    } else {
      rawText = modeType === 'words' ? generateWords(wordLimit) : generateWords(120);
    }
    return rawText.replace(/\s+/g, ' ').trim();
  }, [testCategory, activeSubLesson, activeLesson, modeType, wordLimit, generateCurriculumText, generateWords]);

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = null;
    setInput('');
    setIsStarted(false);
    setElapsedSeconds(0);
    setIsFinished(false);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setConsistency(100);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setCompletedWordsCount(0);
    setChartData([]);
    setErrorsPerSecond({});
    setTargetText(loadTextContent());

    try {
      localStorage.removeItem('last_typing_result');
    } catch (e) {}
  }, [loadTextContent]);

  // Read LocalStorage
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

      const savedResult = localStorage.getItem('last_typing_result');
      if (savedResult) {
        const parsedRes = JSON.parse(savedResult);
        if (parsedRes.isFinished) {
          setIsFinished(true);
          setWpm(parsedRes.wpm || 0);
          setRawWpm(parsedRes.rawWpm || 0);
          setAccuracy(parsedRes.accuracy || 100);
          setConsistency(parsedRes.consistency || 100);
          setChartData(parsedRes.chartData || []);
          setCompletedWordsCount(parsedRes.completedWordsCount || 0);
          setTotalKeystrokes(parsedRes.totalKeystrokes || 0);
          setCorrectKeystrokes(parsedRes.correctKeystrokes || 0);
          setElapsedSeconds(parsedRes.elapsedSeconds || 0);
        }
      }
    } catch (e) {
      console.error('Gagal membaca localStorage:', e);
    }
  }, []);

  // Save LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'typing_app_config',
        JSON.stringify({
          testCategory,
          modeType,
          timeLimit,
          wordLimit,
          difficulty,
          selectedLessonId,
          selectedSubLessonId,
          theme,
          soundEnabled,
          soundProfile,
        })
      );
    } catch (e) {
      console.error('Gagal menyimpan konfigurasi ke localStorage:', e);
    }
  }, [testCategory, modeType, timeLimit, wordLimit, difficulty, selectedLessonId, selectedSubLessonId, theme, soundEnabled, soundProfile]);

  useEffect(() => {
    if (!isFinished) {
      resetTest();
    }
  }, [selectedLessonId, selectedSubLessonId, testCategory, modeType, timeLimit, wordLimit, difficulty, resetTest]);

  // Kalkulasi Kata Benar Berbasis Karakter Sesuai Standar Monkeytype
  const calculateCorrectCharsFromCorrectWords = (typed, target) => {
    const typedArr = typed.trim().split(' ');
    const targetArr = target.trim().split(' ');
    let validCharsCount = 0;

    for (let i = 0; i < typedArr.length; i++) {
      if (i < targetArr.length && typedArr[i] === targetArr[i]) {
        validCharsCount += typedArr[i].length;
        if (i < typedArr.length - 1) validCharsCount += 1;
      }
    }
    return validCharsCount;
  };

  // Rumus Koefisien Variasi untuk Consistency
  const calculateConsistency = (dataSamples) => {
    const rawValues = dataSamples.map(d => d.raw).filter(val => val > 0);
    if (rawValues.length <= 1) return 100;

    const mean = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
    if (mean === 0) return 100;

    const variance = rawValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rawValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  };

  // Realtime Timer & Record Chart Data
  useEffect(() => {
    if (isStarted && !isFinished) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        setChartData([{ time: 0, wpm: 0, raw: 0, errors: null }]);
      }

      timerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(seconds);

        if (seconds > 0) {
          const minutesSpent = seconds / 60;
          
          const correctChars = calculateCorrectCharsFromCorrectWords(input, targetText);
          const currentWpm = Math.round((correctChars / 5) / minutesSpent);
          const currentRawWpm = Math.round((totalKeystrokes / 5) / minutesSpent);
          const errCountAtSec = errorsPerSecond[seconds] || 0;

          setWpm(currentWpm);
          setRawWpm(currentRawWpm);

          setChartData((prev) => {
            if (prev.some(d => d.time === seconds)) return prev;
            const updatedData = [...prev, { time: seconds, wpm: currentWpm, raw: currentRawWpm, errors: errCountAtSec > 0 ? errCountAtSec : null }];
            setConsistency(calculateConsistency(updatedData));
            return updatedData;
          });
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
  }, [isStarted, isFinished, testCategory, modeType, timeLimit, input, targetText, totalKeystrokes, errorsPerSecond]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      resetTest();
    }
  };

  const handleInputChange = (e) => {
    if (isFinished) return;
    const value = e.target.value;

    if (!isStarted) {
      setIsStarted(true);
      startTimeRef.current = Date.now();
      setChartData([{ time: 0, wpm: 0, raw: 0, errors: null }]);
    }

    if (value.length > input.length) {
      const charIndex = value.length - 1;
      const addedChar = value[charIndex];
      const expectedChar = targetText[charIndex];
      const isCorrect = addedChar === expectedChar;

      const newTotal = totalKeystrokes + 1;
      const newCorrect = correctKeystrokes + (isCorrect ? 1 : 0);

      setTotalKeystrokes(newTotal);

      if (isCorrect) {
        setCorrectKeystrokes(newCorrect);
      } else {
        const curSec = Math.max(1, elapsedSeconds);
        setErrorsPerSecond((prev) => ({ ...prev, [curSec]: (prev[curSec] || 0) + 1 }));
        setCharErrors((prev) => ({
          ...prev,
          [expectedChar?.toLowerCase() || 'space']: (prev[expectedChar?.toLowerCase() || 'space'] || 0) + 1
        }));
      }

      setAccuracy(newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 100);
      playClickSound(!isCorrect, soundEnabled, soundProfile);
    }

    setInput(value);

    // Hitung jumlah kata selesai
    const targetWords = targetText.split(' ');
    const typedWords = value.split(' ');
    let validWords = 0;

    for (let i = 0; i < typedWords.length - 1; i++) {
      if (typedWords[i] === targetWords[i]) validWords++;
    }
    if (typedWords.length > 0 && typedWords[typedWords.length - 1] === targetWords[typedWords.length - 1]) {
      validWords++;
    }
    setCompletedWordsCount(validWords);

    // Buffer Pre-fetch Threshold: Tambah 60 kata baru jika sisa karakter < 100
    const remainingChars = targetText.length - value.length;
    if (remainingChars < 100) {
      if (testCategory === 'free' && modeType === 'time') {
        setTargetText((prev) => (prev + ' ' + generateWords(60)).replace(/\s+/g, ' ').trim());
      } else if (testCategory === 'curriculum') {
        setTargetText((prev) => (prev + ' ' + generateCurriculumText(activeSubLesson.text, activeLesson.newKeys, 60)).replace(/\s+/g, ' ').trim());
      }
    }

    // Selesaikan Tes jika Mode Words Selesai
    if (testCategory === 'free' && modeType === 'words' && typedWords.length >= wordLimit && value.endsWith(' ')) {
      setIsFinished(true);
      setIsStarted(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const getNextChar = () => targetText[input.length]?.toLowerCase();
  const activeFinger = FINGER_MAP[getNextChar()] || '';

  return {
    state: {
      testCategory, setTestCategory, modeType, setModeType, timeLimit, setTimeLimit,
      wordLimit, setWordLimit, difficulty, setDifficulty, selectedLessonId, setSelectedLessonId,
      selectedSubLessonId, setSelectedSubLessonId, soundEnabled, setSoundEnabled,
      soundProfile, setSoundProfile, theme, setTheme, themeConfig, targetText, input, isFinished, 
      wpm, rawWpm, accuracy, consistency, elapsedSeconds, completedWordsCount, totalKeystrokes, correctKeystrokes,
      chartData, charErrors, activeLesson, activeSubLesson
    },
    actions: { handleInputChange, handleKeyDown, resetTest, getNextChar, activeFinger }
  };
}