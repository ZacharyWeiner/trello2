'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressData, ProgressMilestone } from '@/types';
import { Pizza, Star, Trophy, Target, Zap, Heart, Brain } from 'lucide-react';
import { gifService, GifData, GifEcosystem, BiometricState } from '@/services/gifService';
import { StoryModeNarrative } from './StoryModeNarrative';

interface GifEnhancedPizzaChartProps {
  data: ProgressData;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showMilestones?: boolean;
  onMilestoneReached?: (milestone: ProgressMilestone) => void;
  theme?: 'classic' | 'space' | 'forest' | 'fire';
  userId: string;
  boardId: string;
  enableBiometrics?: boolean;
  enableAI?: boolean;
  enableStoryMode?: boolean;
  board?: any; // Board data for story mode
  lists?: any[]; // Lists data for story mode
  cards?: any[]; // Cards data for story mode
}

export const GifEnhancedPizzaChart: React.FC<GifEnhancedPizzaChartProps> = ({
  data,
  size = 'medium',
  animated = true,
  showMilestones = true,
  onMilestoneReached,
  theme = 'classic',
  userId,
  boardId,
  enableBiometrics = false,
  enableAI = false,
  enableStoryMode = false,
  board,
  lists = [],
  cards = []
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [reachedMilestones, setReachedMilestones] = useState<string[]>([]);
  const [celebrationGifs, setCelebrationGifs] = useState<GifData[]>([]);
  const [ecosystem, setEcosystem] = useState<GifEcosystem | null>(null);
  const [biometricState, setBiometricState] = useState<BiometricState | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<GifData[]>([]);
  const [storyMode, setStoryMode] = useState(false);
  const [currentStoryGif, setCurrentStoryGif] = useState<string | null>(null);
  const [interactiveElements, setInteractiveElements] = useState<any[]>([]);
  const [synestheticMode, setSynestheticMode] = useState(false);
  const [viralChallenge, setViralChallenge] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const progress = Math.min((data.current / data.target) * 100, 100);
  const radius = size === 'small' ? 40 : size === 'medium' ? 60 : 80;

  // Initialize GIF ecosystem
  useEffect(() => {
    const initializeEcosystem = async () => {
      const newEcosystem = await gifService.createGifEcosystem(boardId);
      setEcosystem(newEcosystem);
    };
    initializeEcosystem();
  }, [boardId]);

  // Biometric monitoring
  useEffect(() => {
    if (!enableBiometrics) return;

    const monitorBiometrics = async () => {
      // Simulate biometric data (in real app, would connect to actual sensors)
      const mockBiometrics = {
        heartRate: 70 + Math.random() * 30,
        stressLevel: Math.random() * 10,
        focusLevel: Math.random() * 10
      };

      setBiometricState({
        averageHeartRate: mockBiometrics.heartRate,
        stressLevel: mockBiometrics.stressLevel,
        focusLevel: mockBiometrics.focusLevel,
        teamSynchronization: Math.random(),
        lastUpdated: new Date()
      });

      // Get biometric-responsive GIFs
      const biometricGifs = await gifService.getBiometricGifs(mockBiometrics);
      setCelebrationGifs(prev => [...prev, ...biometricGifs.slice(0, 2)]);
    };

    const interval = setInterval(monitorBiometrics, 5000);
    return () => clearInterval(interval);
  }, [enableBiometrics]);

  // AI-powered GIF suggestions
  useEffect(() => {
    if (!enableAI) return;

         const getAISuggestions = async () => {
       const context = {
         taskContent: data.description || 'General productivity task',
         userMood: (biometricState?.stressLevel ?? 5) > 7 ? 'stressed' : 'focused',
         timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
         projectType: 'productivity',
         teamDynamics: 'collaborative'
       };

      const suggestions = await gifService.getAIGifSuggestions(context);
      setAiSuggestions(suggestions.map(s => s.gifData));
    };

    getAISuggestions();
  }, [enableAI, data.description, biometricState]);

  // Animated progress with GIF celebrations
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
        
        // Trigger celebration GIFs at certain thresholds
        if (progress >= 25 && progress < 50) {
          triggerCelebrationGif('quarter');
        } else if (progress >= 50 && progress < 75) {
          triggerCelebrationGif('half');
        } else if (progress >= 75 && progress < 100) {
          triggerCelebrationGif('three-quarters');
        } else if (progress >= 100) {
          triggerCelebrationGif('complete');
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  // Story mode progression
  useEffect(() => {
    if (!enableStoryMode || !ecosystem) return;

    const updateStory = async () => {
      const storyFrame = await gifService.addStoryFrame(
        boardId,
        'task_completion',
        userId
      );
      setCurrentStoryGif(storyFrame.gifUrl);
    };

    if (animatedProgress > 0) {
      updateStory();
    }
  }, [animatedProgress, enableStoryMode, ecosystem, boardId, userId]);

  const triggerCelebrationGif = async (milestone: string) => {
    const celebrationGif: GifData = {
      id: `celebration-${milestone}-${Date.now()}`,
      url: `https://media.giphy.com/media/celebration-${milestone}.gif`,
      title: `${milestone} Complete!`,
      tags: ['celebration', milestone],
      mood: 'celebratory',
      intensity: 9,
      duration: 3000,
      interactionType: 'celebration'
    };

    setCelebrationGifs(prev => [...prev, celebrationGif]);

    // Remove after animation
    setTimeout(() => {
      setCelebrationGifs(prev => prev.filter(gif => gif.id !== celebrationGif.id));
    }, 3000);

    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Trigger synesthetic effects
    if (synestheticMode) {
      triggerSynestheticEffects(celebrationGif);
    }
  };

  const triggerSynestheticEffects = async (gifData: GifData) => {
    const synesthetic = await gifService.createSynestheticGif(gifData);
    
    // Visual effects
    setInteractiveElements(prev => [...prev, {
      type: 'particle-explosion',
      position: [Math.random() * 100, Math.random() * 100],
      color: gifData.mood === 'celebratory' ? '#FFD700' : '#FF6B6B',
      duration: 2000
    }]);

    // Audio effects
    if (synesthetic.audio && audioContextRef.current) {
      const audio = new Audio(synesthetic.audio);
      audio.play().catch(console.error);
    }

    // Haptic effects
    if ('vibrate' in navigator && synesthetic.haptic) {
      navigator.vibrate(synesthetic.haptic.pattern);
    }
  };

  const createViralChallenge = async () => {
    const challenge = await gifService.createViralChallenge({
      name: 'Pizza Slice Speed Run',
      description: 'Complete 8 tasks in record time!',
      targetGif: 'https://media.giphy.com/media/pizza-speed.gif',
      difficulty: 7
    });
    setViralChallenge(challenge);
  };

  const renderEnhancedPizzaSlices = () => {
    const totalSlices = 8;
    const filledSlices = Math.floor((animatedProgress / 100) * totalSlices);

    return (
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 200 200"
        style={{ overflow: 'visible' }}
      >
        {/* Animated pizza base with GIF texture */}
        <defs>
          <pattern id="pizzaTexture" patternUnits="userSpaceOnUse" width="20" height="20">
            <image href="/pizza-texture.gif" x="0" y="0" width="20" height="20" />
          </pattern>
        </defs>
        
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="url(#pizzaTexture)"
          stroke="rgba(139, 69, 19, 0.8)"
          strokeWidth="2"
        />
        
        {/* Enhanced pizza slices with GIF overlays */}
        {Array.from({ length: totalSlices }, (_, index) => {
          const startAngle = (360 / totalSlices) * index - 90;
          const endAngle = (360 / totalSlices) * (index + 1) - 90;
          const isComplete = index < filledSlices;
          const opacity = isComplete ? 1 : 0.2;
          
          const centerX = 100;
          const centerY = 100;
          const radiusOuter = 85;
          
          const startXOuter = centerX + radiusOuter * Math.cos(startAngle * Math.PI / 180);
          const startYOuter = centerY + radiusOuter * Math.sin(startAngle * Math.PI / 180);
          const endXOuter = centerX + radiusOuter * Math.cos(endAngle * Math.PI / 180);
          const endYOuter = centerY + radiusOuter * Math.sin(endAngle * Math.PI / 180);
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${startXOuter} ${startYOuter}`,
            `A ${radiusOuter} ${radiusOuter} 0 0 1 ${endXOuter} ${endYOuter}`,
            'Z'
          ].join(' ');
          
          return (
            <motion.g key={index}>
              <motion.path
                d={pathData}
                fill={`hsl(${(index * 45) % 360}, 70%, 60%)`}
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2"
                opacity={opacity}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: animated ? index * 0.1 : 0,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 100
                }}
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              />
              
              {/* Interactive hotspots */}
              {isComplete && (
                <motion.circle
                  cx={centerX + (radiusOuter * 0.6) * Math.cos((startAngle + endAngle) / 2 * Math.PI / 180)}
                  cy={centerY + (radiusOuter * 0.6) * Math.sin((startAngle + endAngle) / 2 * Math.PI / 180)}
                  r="8"
                  fill="rgba(255, 255, 255, 0.8)"
                  stroke="#FFD700"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  onClick={() => triggerCelebrationGif(`slice-${index}`)}
                  style={{ cursor: 'pointer' }}
                />
              )}
            </motion.g>
          );
        })}
      </svg>
    );
  };

  const renderCelebrationGifs = () => {
    return (
      <AnimatePresence>
        {celebrationGifs.map((gif) => (
          <motion.div
            key={gif.id}
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={gif.url}
              alt={gif.title}
              className="w-full h-full object-contain"
              style={{ 
                filter: gif.mood === 'celebratory' ? 'brightness(1.2) saturate(1.3)' : 'none',
                mixBlendMode: 'screen'
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  const renderInteractiveElements = () => {
    return (
      <AnimatePresence>
        {interactiveElements.map((element, index) => (
          <motion.div
            key={`element-${index}`}
            className="absolute pointer-events-none z-30"
            style={{
              left: `${element.position[0]}%`,
              top: `${element.position[1]}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: element.duration / 1000 }}
          >
            {element.type === 'particle-explosion' && (
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: element.color }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  const renderBiometricIndicators = () => {
    if (!enableBiometrics || !biometricState) return null;

    return (
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <motion.div
          className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full text-xs"
          animate={{ scale: biometricState.averageHeartRate > 100 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: biometricState.averageHeartRate > 100 ? Infinity : 0 }}
        >
          <Heart className="h-3 w-3 text-red-500" />
          <span>{Math.round(biometricState.averageHeartRate)}</span>
        </motion.div>
        
        <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full text-xs">
          <Brain className="h-3 w-3 text-blue-500" />
          <span>{Math.round(biometricState.focusLevel)}/10</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4 relative">
      {/* Enhanced Pizza Chart Container */}
      <div 
        className="relative" 
        style={{ width: radius * 2 + 60, height: radius * 2 + 60 }}
      >
        {/* Pizza Base */}
        <div 
          className="absolute inset-0 rounded-full border-4 shadow-lg bg-yellow-100 border-yellow-200"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 30,
            top: 30
          }}
        />
        
        {/* Enhanced Pizza Slices */}
        <div 
          className="absolute rounded-full overflow-hidden"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 30,
            top: 30
          }}
        >
          {renderEnhancedPizzaSlices()}
        </div>

        {/* Celebration GIF Overlays */}
        {renderCelebrationGifs()}

        {/* Interactive Elements */}
        {renderInteractiveElements()}

        {/* Biometric Indicators */}
        {renderBiometricIndicators()}

        {/* Story Mode GIF */}
        {enableStoryMode && currentStoryGif && (
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img
              src={currentStoryGif}
              alt="Story progression"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Center Icon with AI Enhancement */}
        <motion.div 
          className="absolute flex items-center justify-center z-10"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 30,
            top: 30
          }}
          animate={{ rotate: animated ? 360 : 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="bg-white bg-opacity-90 rounded-full p-2 shadow-sm relative">
            <Pizza className="h-6 w-6 text-orange-600" />
            {enableAI && aiSuggestions.length > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Progress Info */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-gray-900">{data.name}</h3>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl font-bold" style={{ color: data.color }}>
            {Math.round(animatedProgress)}%
          </span>
          <span className="text-sm text-gray-600">
            ({data.current}/{data.target})
          </span>
          {enableBiometrics && biometricState && (
            <motion.div
              className="ml-2 text-xs bg-green-100 px-2 py-1 rounded-full"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Sync: {Math.round(biometricState.teamSynchronization * 100)}%
            </motion.div>
          )}
        </div>
      </div>

      {/* Feature Controls */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setSynestheticMode(!synestheticMode)}
          className={`px-2 py-1 rounded ${synestheticMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
        >
          <Zap className="h-3 w-3 inline mr-1" />
          Synesthetic
        </button>
        
        <button
          onClick={() => setStoryMode(!storyMode)}
          className={`px-2 py-1 rounded ${storyMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
          disabled={!board || !lists.length}
        >
          📚 Story
        </button>
        
        <button
          onClick={createViralChallenge}
          className="px-2 py-1 rounded bg-orange-100 text-orange-700"
        >
          🚀 Challenge
        </button>
      </div>

      {/* Viral Challenge Display */}
      {viralChallenge && (
        <motion.div
          className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-3 rounded-lg text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h4 className="font-bold">{viralChallenge.name}</h4>
          <p className="text-xs">{viralChallenge.description}</p>
        </motion.div>
      )}

      {/* Canvas for advanced effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'none' }}
      />

      {/* Story Mode Narrative */}
      {board && lists.length > 0 && (
        <StoryModeNarrative
          board={board}
          lists={lists}
          cards={cards}
          userId={userId}
          isActive={storyMode}
          onClose={() => setStoryMode(false)}
        />
      )}
    </div>
  );
}; 