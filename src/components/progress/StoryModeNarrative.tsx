'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, List, Card } from '@/types';
import { gifService } from '@/services/gifService';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize, 
  BookOpen,
  Users,
  Trophy,
  Zap,
  Heart,
  Star,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';

interface StoryModeNarrativeProps {
  board: Board;
  lists: List[];
  cards: Card[];
  userId: string;
  isActive: boolean;
  onClose: () => void;
}

interface StoryChapter {
  id: string;
  title: string;
  description: string;
  frames: GifStoryFrame[];
  characters: StoryCharacter[];
  mood: 'epic' | 'dramatic' | 'comedic' | 'mysterious' | 'triumphant';
  duration: number;
  unlocked: boolean;
}

interface StoryCharacter {
  id: string;
  name: string;
  role: 'hero' | 'mentor' | 'challenger' | 'supporter' | 'narrator';
  avatar: string;
  personality: string[];
  achievements: string[];
  currentMood: string;
}

interface GifStoryFrame {
  id: string;
  gifUrl: string;
  narrative: string;
  triggeredBy: 'task_completion' | 'milestone' | 'team_event';
  timestamp: Date;
  contributors: string[];
}

interface NarrativeEvent {
  id: string;
  type: 'task_start' | 'task_complete' | 'milestone' | 'collaboration' | 'challenge' | 'victory';
  timestamp: Date;
  participants: string[];
  impact: 'minor' | 'major' | 'epic';
  emotion: 'excitement' | 'tension' | 'relief' | 'triumph' | 'mystery';
  gifUrl: string;
  narration: string;
}

export const StoryModeNarrative: React.FC<StoryModeNarrativeProps> = ({
  board,
  lists,
  cards,
  userId,
  isActive,
  onClose
}) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [characters, setCharacters] = useState<StoryCharacter[]>([]);
  const [narrativeEvents, setNarrativeEvents] = useState<NarrativeEvent[]>([]);
  const [storyProgress, setStoryProgress] = useState(0);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [interactiveChoices, setInteractiveChoices] = useState<any[]>([]);
  const [storyStats, setStoryStats] = useState({
    totalEvents: 0,
    charactersIntroduced: 0,
    milestonesReached: 0,
    plotTwists: 0,
    collaborations: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const narratorRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize story mode
  useEffect(() => {
    if (isActive) {
      initializeStoryMode();
    }
  }, [isActive, board, lists, cards]);

  // Auto-play story progression
  useEffect(() => {
    if (isPlaying && chapters.length > 0) {
      const interval = setInterval(() => {
        progressStory();
      }, 3000); // 3 seconds per frame
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentChapter, currentFrame, chapters]);

  const initializeStoryMode = async () => {
    // Generate story characters based on board members
    const storyCharacters = generateStoryCharacters();
    setCharacters(storyCharacters);

    // Analyze board history to create narrative events
    const events = await analyzeProjectHistory();
    setNarrativeEvents(events);

    // Generate story chapters
    const storyChapters = generateStoryChapters(events, storyCharacters);
    setChapters(storyChapters);

    // Update story statistics
    updateStoryStats(events, storyCharacters);

    // Start with cinematic intro
    setCinematicMode(true);
    setTimeout(() => setCinematicMode(false), 5000);
  };

  const generateStoryCharacters = (): StoryCharacter[] => {
    const baseCharacters: StoryCharacter[] = [
      {
        id: 'narrator',
        name: 'The Project Oracle',
        role: 'narrator',
        avatar: '🔮',
        personality: ['wise', 'mysterious', 'encouraging'],
        achievements: ['Guides all projects to completion'],
        currentMood: 'mystical'
      },
      {
        id: 'hero',
        name: 'The Task Master',
        role: 'hero',
        avatar: '🦸‍♂️',
        personality: ['determined', 'resourceful', 'collaborative'],
        achievements: [],
        currentMood: 'focused'
      }
    ];

         // Add characters based on board members
     board.members.forEach((member, index) => {
       const roles: StoryCharacter['role'][] = ['mentor', 'supporter', 'challenger'];
       const personalities = [
         ['creative', 'innovative', 'inspiring'],
         ['analytical', 'precise', 'methodical'],
         ['energetic', 'motivating', 'optimistic'],
         ['strategic', 'visionary', 'bold']
       ];

       baseCharacters.push({
         id: member.userId,
         name: member.displayName || `Team Member ${index + 1}`,
         role: roles[index % roles.length],
         avatar: (member as any).avatar || '👤', // Type assertion for missing property
         personality: personalities[index % personalities.length],
         achievements: [],
         currentMood: 'ready'
       });
     });

    return baseCharacters;
  };

  const analyzeProjectHistory = async (): Promise<NarrativeEvent[]> => {
    const events: NarrativeEvent[] = [];
    
    // Analyze card movements and completions
    for (const card of cards) {
      const isCompleted = lists.find(l => l.id === card.listId)?.listType === 'done';
      const assignedUser = (card as any).assignedTo || userId; // Type assertion for missing property
      
      if (isCompleted) {
        events.push({
          id: `completion-${card.id}`,
          type: 'task_complete',
          timestamp: new Date(card.updatedAt),
          participants: [assignedUser],
          impact: (card as any).priority === 'high' ? 'major' : 'minor',
          emotion: 'triumph',
          gifUrl: await getEventGif('task_complete', card.title),
          narration: generateNarration('task_complete', card.title, assignedUser)
        });
      }

      // Add collaboration events for cards with multiple assignees
      if ((card as any).assignedTo && (card as any).assignedTo !== userId) {
        events.push({
          id: `collab-${card.id}`,
          type: 'collaboration',
          timestamp: new Date(card.createdAt),
          participants: [userId, (card as any).assignedTo],
          impact: 'minor',
          emotion: 'excitement',
          gifUrl: await getEventGif('collaboration', 'team work'),
          narration: generateNarration('collaboration', card.title, (card as any).assignedTo)
        });
      }
    }

    // Add milestone events based on list completion
    for (const list of lists) {
      const listCards = cards.filter(c => c.listId === list.id);
      if (listCards.length > 0 && list.listType === 'done') {
        events.push({
          id: `milestone-${list.id}`,
          type: 'milestone',
          timestamp: new Date(),
          participants: [userId],
          impact: 'epic',
          emotion: 'triumph',
          gifUrl: await getEventGif('milestone', list.title),
          narration: generateNarration('milestone', list.title, userId)
        });
      }
    }

    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const generateStoryChapters = (events: NarrativeEvent[], characters: StoryCharacter[]): StoryChapter[] => {
    const chapters: StoryChapter[] = [];
    
    // If no events, create a default introductory story
    if (events.length === 0) {
      const defaultFrame: GifStoryFrame = {
        id: 'intro-frame',
        gifUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        narrative: `Welcome to the epic tale of "${board.title}"! This is where your project's legendary story will unfold. As you complete tasks and reach milestones, new chapters will be written in this grand adventure. The journey of a thousand tasks begins with a single step!`,
        triggeredBy: 'task_completion',
        timestamp: new Date(),
        contributors: [userId]
      };

      chapters.push({
        id: 'chapter-intro',
        title: 'The Story Awaits',
        description: `The stage is set for the epic journey of "${board.title}"`,
        frames: [defaultFrame],
        characters: characters.slice(0, 2),
        mood: 'epic',
        duration: 10,
        unlocked: true
      });

      return chapters;
    }
    
    // Chapter 1: The Beginning
    chapters.push({
      id: 'chapter-1',
      title: 'The Quest Begins',
      description: `Our heroes embark on the epic journey of "${board.title}"`,
             frames: events.slice(0, Math.ceil(events.length * 0.3)).map(event => ({
         id: event.id,
         gifUrl: event.gifUrl,
         narrative: event.narration,
         triggeredBy: event.type === 'task_complete' ? 'task_completion' : 
                     event.type === 'milestone' ? 'milestone' :
                     event.type === 'collaboration' ? 'team_event' : 'task_completion',
         timestamp: event.timestamp,
         contributors: event.participants
       })),
      characters: characters.slice(0, 2),
      mood: 'epic',
      duration: Math.ceil(events.length * 0.3) * 3,
      unlocked: true
    });

    // Chapter 2: The Challenge
    chapters.push({
      id: 'chapter-2',
      title: 'Trials and Tribulations',
      description: 'Our team faces obstacles and discovers their true strength',
             frames: events.slice(Math.ceil(events.length * 0.3), Math.ceil(events.length * 0.7)).map(event => ({
         id: event.id,
         gifUrl: event.gifUrl,
         narrative: event.narration,
         triggeredBy: event.type === 'task_complete' ? 'task_completion' : 
                     event.type === 'milestone' ? 'milestone' :
                     event.type === 'collaboration' ? 'team_event' : 'task_completion',
         timestamp: event.timestamp,
         contributors: event.participants
       })),
      characters: characters,
      mood: 'dramatic',
      duration: Math.ceil(events.length * 0.4) * 3,
      unlocked: events.length > 3
    });

    // Chapter 3: The Triumph
    chapters.push({
      id: 'chapter-3',
      title: 'Victory and Beyond',
      description: 'The culmination of effort leads to glorious success',
             frames: events.slice(Math.ceil(events.length * 0.7)).map(event => ({
         id: event.id,
         gifUrl: event.gifUrl,
         narrative: event.narration,
         triggeredBy: event.type === 'task_complete' ? 'task_completion' : 
                     event.type === 'milestone' ? 'milestone' :
                     event.type === 'collaboration' ? 'team_event' : 'task_completion',
         timestamp: event.timestamp,
         contributors: event.participants
       })),
      characters: characters,
      mood: 'triumphant',
      duration: Math.ceil(events.length * 0.3) * 3,
      unlocked: events.length > 6
    });

    return chapters.filter(chapter => chapter.frames.length > 0);
  };

  const getEventGif = async (eventType: string, context: string): Promise<string> => {
    // Fallback GIF URLs since searchGifs is private
    const fallbackGifs = {
      task_complete: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
      collaboration: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
      milestone: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif'
    };
    return fallbackGifs[eventType as keyof typeof fallbackGifs] || 'https://media.giphy.com/media/default-story.gif';
  };

  const generateNarration = (eventType: string, context: string, participant?: string): string => {
    const narrations = {
      task_complete: [
        `With determination and skill, ${participant || 'our hero'} conquered the challenge of "${context}"`,
        `The task "${context}" fell before the might of ${participant || 'our champion'}`,
        `Victory! ${participant || 'The brave soul'} has completed "${context}" with excellence`
      ],
      collaboration: [
        `Two minds united as ${participant} joined forces on "${context}"`,
        `The power of teamwork shone bright as collaboration began on "${context}"`,
        `A new alliance formed around the quest of "${context}"`
      ],
      milestone: [
        `A great milestone was reached! The "${context}" phase stands complete`,
        `The realm celebrates as "${context}" achieves legendary status`,
        `History will remember this moment when "${context}" was conquered`
      ]
    };

    const options = narrations[eventType as keyof typeof narrations] || ['A significant event occurred'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const updateStoryStats = (events: NarrativeEvent[], characters: StoryCharacter[]) => {
    setStoryStats({
      totalEvents: events.length,
      charactersIntroduced: characters.length,
      milestonesReached: events.filter(e => e.type === 'milestone').length,
      plotTwists: events.filter(e => e.impact === 'epic').length,
      collaborations: events.filter(e => e.type === 'collaboration').length
    });
  };

  const progressStory = () => {
    if (chapters.length === 0) return;

    const currentChapterData = chapters[currentChapter];
    if (!currentChapterData) return;

    if (currentFrame < currentChapterData.frames.length - 1) {
      setCurrentFrame(prev => prev + 1);
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
      setCurrentFrame(0);
    } else {
      setIsPlaying(false); // Story complete
    }

    // Update progress
    const totalFrames = chapters.reduce((sum, chapter) => sum + chapter.frames.length, 0);
    const currentFrameIndex = chapters.slice(0, currentChapter).reduce((sum, chapter) => sum + chapter.frames.length, 0) + currentFrame;
    setStoryProgress((currentFrameIndex / totalFrames) * 100);
  };

  const speakNarration = (text: string) => {
    if (isMuted) return;

    if (narratorRef.current) {
      speechSynthesis.cancel();
    }

    narratorRef.current = new SpeechSynthesisUtterance(text);
    narratorRef.current.rate = 0.8;
    narratorRef.current.pitch = 1.1;
    narratorRef.current.volume = 0.7;
    
    speechSynthesis.speak(narratorRef.current);
  };

  const getCurrentFrame = (): GifStoryFrame | null => {
    const chapter = chapters[currentChapter];
    return chapter?.frames[currentFrame] || null;
  };

  const getCurrentCharacter = (): StoryCharacter | null => {
    const frame = getCurrentFrame();
    if (!frame) return null;
    
    return characters.find(c => frame.contributors.includes(c.id)) || characters[0];
  };

  // Emergency close handler - defined early to avoid closure issues
  const handleEmergencyClose = () => {
    console.log('🚨 Emergency close triggered');
    setIsPlaying(false);
    if (narratorRef.current) {
      speechSynthesis.cancel();
    }
    onClose();
  };

  // Add keyboard escape handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('🔑 ESC key pressed');
        handleEmergencyClose();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isActive, handleEmergencyClose]);

  if (!isActive) return null;

  const currentFrameData = getCurrentFrame();
  const currentCharacter = getCurrentCharacter();
  const currentChapterData = chapters[currentChapter];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      onClick={(e) => {
        // Close when clicking the background overlay
        if (e.target === e.currentTarget) {
          console.log('🌌 Background clicked');
          handleEmergencyClose();
        }
      }}
    >
      <div 
        className="w-full h-full max-w-6xl mx-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cinematic Intro */}
        <AnimatePresence>
          {cinematicMode && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center z-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="text-center text-white"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 2 }}
              >
                <motion.h1 
                  className="text-6xl font-bold mb-4"
                  animate={{ 
                    textShadow: [
                      "0 0 20px #fff",
                      "0 0 30px #fff, 0 0 40px #fff",
                      "0 0 20px #fff"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨ STORY MODE ✨
                </motion.h1>
                <motion.p 
                  className="text-2xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  The Epic Tale of "{board.title}"
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Story Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-800 to-blue-800 text-white">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">{currentChapterData?.title || 'Loading Story...'}</h2>
              <p className="text-purple-200">{currentChapterData?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm opacity-75">Chapter {currentChapter + 1} of {chapters.length}</div>
              <div className="text-xs opacity-50">Frame {currentFrame + 1}</div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔴 Close button clicked');
                handleEmergencyClose();
              }}
              className="p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors bg-red-600 hover:bg-red-700 text-white font-bold text-lg"
              title="Close Story Mode (ESC)"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-2">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${storyProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Main Story Display */}
        <div className="flex-1 flex">
          {/* Story Content */}
          <div className="flex-1 relative bg-black">
            {chapters.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold mb-2">Loading Your Epic Story...</h3>
                  <p className="text-gray-300">Analyzing your project journey and creating narrative chapters</p>
                  <button
                    onClick={handleEmergencyClose}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Cancel & Close
                  </button>
                </div>
              </div>
            ) : currentFrameData && (
              <motion.div
                key={`${currentChapter}-${currentFrame}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                {/* Background GIF */}
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-black">
                  <img
                    src={currentFrameData.gifUrl}
                    alt="Story frame"
                    className="max-w-sm md:max-w-md max-h-60 md:max-h-80 object-contain rounded-lg shadow-2xl border-4 border-white/20"
                  />
                </div>
                
                {/* Narrative Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-white"
                  >
                    {/* Character Speaking */}
                    {currentCharacter && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-3xl">{currentCharacter.avatar}</div>
                        <div>
                          <div className="font-bold text-lg">{currentCharacter.name}</div>
                          <div className="text-sm text-purple-300 capitalize">{currentCharacter.role}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Narrative Text */}
                    <motion.p
                      className="text-xl leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 1 }}
                      onAnimationComplete={() => speakNarration(currentFrameData.narrative)}
                    >
                      {currentFrameData.narrative}
                    </motion.p>
                  </motion.div>
                </div>

                {/* Mood Indicator */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentChapterData?.mood === 'epic' ? 'bg-purple-500 text-white' :
                      currentChapterData?.mood === 'dramatic' ? 'bg-red-500 text-white' :
                      currentChapterData?.mood === 'triumphant' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentChapterData?.mood === 'epic' && '⚡ Epic'}
                    {currentChapterData?.mood === 'dramatic' && '🎭 Dramatic'}
                    {currentChapterData?.mood === 'triumphant' && '🏆 Triumphant'}
                    {currentChapterData?.mood === 'comedic' && '😄 Comedic'}
                    {currentChapterData?.mood === 'mysterious' && '🔮 Mysterious'}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Story Sidebar */}
          <div className="w-80 bg-gray-900 text-white p-6 overflow-y-auto">
            {/* Story Statistics */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Story Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-purple-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{storyStats.totalEvents}</div>
                  <div className="text-purple-200">Events</div>
                </div>
                <div className="bg-blue-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{storyStats.charactersIntroduced}</div>
                  <div className="text-blue-200">Characters</div>
                </div>
                <div className="bg-green-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{storyStats.milestonesReached}</div>
                  <div className="text-green-200">Milestones</div>
                </div>
                <div className="bg-yellow-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{storyStats.collaborations}</div>
                  <div className="text-yellow-200">Team-ups</div>
                </div>
              </div>
            </div>

            {/* Characters */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cast of Characters
              </h3>
              <div className="space-y-3">
                {characters.slice(0, 5).map((character) => (
                  <motion.div
                    key={character.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentCharacter?.id === character.id
                        ? 'border-yellow-400 bg-yellow-900/30'
                        : 'border-gray-700 bg-gray-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{character.avatar}</div>
                      <div className="flex-1">
                        <div className="font-medium">{character.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{character.role}</div>
                        <div className="text-xs text-purple-300">{character.currentMood}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chapter Navigation */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chapters
              </h3>
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <motion.button
                    key={chapter.id}
                    onClick={() => {
                      if (chapter.unlocked) {
                        setCurrentChapter(index);
                        setCurrentFrame(0);
                      }
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      currentChapter === index
                        ? 'bg-purple-600 text-white'
                        : chapter.unlocked
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                        : 'bg-gray-900 text-gray-500 cursor-not-allowed'
                    }`}
                    whileHover={chapter.unlocked ? { scale: 1.02 } : {}}
                    disabled={!chapter.unlocked}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{chapter.title}</div>
                        <div className="text-xs opacity-75">{chapter.frames.length} scenes</div>
                      </div>
                      {!chapter.unlocked && <span className="text-gray-600">🔒</span>}
                      {currentChapter === index && <span className="text-yellow-400">▶️</span>}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Story Controls */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (currentFrame > 0) {
                  setCurrentFrame(prev => prev - 1);
                } else if (currentChapter > 0) {
                  setCurrentChapter(prev => prev - 1);
                  setCurrentFrame(chapters[currentChapter - 1]?.frames.length - 1 || 0);
                }
              }}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            
            <button
              onClick={progressStory}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <Maximize className="h-5 w-5" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚪 Bottom close button clicked');
                handleEmergencyClose();
              }}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-bold"
              title="Close Story Mode"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 