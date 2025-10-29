'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

export default function MeditationApp() {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sessions = [
    { name: 'Quick Calm', duration: 5, emoji: '🌅' },
    { name: 'Deep Focus', duration: 10, emoji: '🧘' },
    { name: 'Stress Relief', duration: 15, emoji: '🌊' },
    { name: 'Full Session', duration: 20, emoji: '🌸' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (audioRef.current) {
        audioRef.current.play();
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!isActive) return;

    const breathCycle = 16; // 4s inhale, 4s hold, 8s exhale
    let breathInterval: NodeJS.Timeout;
    let elapsed = 0;

    breathInterval = setInterval(() => {
      elapsed = (elapsed + 1) % breathCycle;
      if (elapsed < 4) {
        setBreathPhase('inhale');
      } else if (elapsed < 8) {
        setBreathPhase('hold');
      } else {
        setBreathPhase('exhale');
      }
    }, 1000);

    return () => clearInterval(breathInterval);
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration * 60);
    setBreathPhase('inhale');
  };

  const selectSession = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setIsActive(false);
    setBreathPhase('inhale');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all z-10"
      >
        <Settings className="w-6 h-6" />
      </button>

      <div className="max-w-md w-full z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Mindful</h1>
          <p className="text-purple-200 text-lg">Find your inner peace</p>
        </div>

        {/* Main meditation circle */}
        <div className="relative mb-12">
          <div className="relative w-80 h-80 mx-auto">
            {/* Progress ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`w-48 h-48 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 backdrop-blur-xl flex items-center justify-center transition-all duration-1000 ${
                  breathPhase === 'inhale' ? 'scale-110' : breathPhase === 'exhale' ? 'scale-90' : 'scale-100'
                }`}
              >
                <div className="text-center">
                  <div className="text-6xl font-light text-white mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  {isActive && (
                    <div className="text-sm text-purple-200 uppercase tracking-wider animate-pulse">
                      {breathPhase === 'inhale' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Breathe Out'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all hover:scale-110"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          <button
            onClick={toggleTimer}
            className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-110 shadow-2xl"
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
        </div>

        {/* Session presets */}
        {!isActive && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {sessions.map((session) => (
              <button
                key={session.name}
                onClick={() => selectSession(session.duration)}
                className={`p-6 rounded-2xl backdrop-blur-md transition-all hover:scale-105 ${
                  selectedDuration === session.duration
                    ? 'bg-white/20 border-2 border-white/50'
                    : 'bg-white/10 border-2 border-transparent'
                }`}
              >
                <div className="text-4xl mb-2">{session.emoji}</div>
                <div className="text-white font-semibold">{session.name}</div>
                <div className="text-purple-200 text-sm">{session.duration} minutes</div>
              </button>
            ))}
          </div>
        )}

        {/* Settings panel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl p-8 max-w-sm w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-purple-200 block mb-2">Sound Effects</label>
                  <div className="flex gap-2">
                    <button className="flex-1 p-3 rounded-xl bg-white/20 text-white">On</button>
                    <button className="flex-1 p-3 rounded-xl bg-white/10 text-white/50">Off</button>
                  </div>
                </div>
                <div>
                  <label className="text-purple-200 block mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500"></button>
                    <button className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-500"></button>
                    <button className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500"></button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="mt-8 w-full p-4 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bell sound for completion */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIG2m98OScTgwPUKnk8bVkHQU1j9n0yoQsBS1+zPLaizsKGGS65euXUBELTKXh8K9fHAU3kNr0yYQuBSh6y/HajD0KF2G56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwOUqjk8bVkHQU1j9n0yoQsBS1+zPLajTwLFmC56+ybTwwO" />
    </div>
  );
}
