import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, 
  Shield, 
  Crown, 
  Star, 
  Users, 
  BookOpen, 
  Sparkles, 
  Trophy,
  Zap,
  Heart,
  Scroll,
  Gem,
  Flame,
  Target,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  X
} from 'lucide-react';
import { Board, List, Card } from '@/types';
import { AchievementService } from '@/services/achievementService';
import { ACHIEVEMENTS, calculateLevel } from '@/data/achievements';

interface QuestModeManagerProps {
  board: Board;
  lists: List[];
  cards: Card[];
  userId: string;
  isActive: boolean;
  onClose: () => void;
}

interface QuestCharacter {
  id: string;
  name: string;
  role: 'hero' | 'mentor' | 'challenger' | 'supporter' | 'narrator' | 'guardian';
  avatar: string;
  level: number;
  experience: number;
  health: number;
  mana: number;
  skills: string[];
  personality: string[];
  achievements: string[];
  currentQuest?: string;
  mood: 'determined' | 'excited' | 'focused' | 'mystical' | 'triumphant' | 'contemplative';
  backstory: string;
}

interface QuestEvent {
  id: string;
  type: 'quest_start' | 'quest_complete' | 'boss_battle' | 'treasure_found' | 'alliance_formed' | 'level_up' | 'epic_moment';
  timestamp: Date;
  participants: string[];
  questName: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  rewards: {
    experience: number;
    gold: number;
    items: string[];
    achievements?: string[];
  };
  narrative: string;
  gifUrl: string;
  voiceNarration: string;
  impact: 'minor' | 'major' | 'epic' | 'legendary';
  emotion: 'excitement' | 'tension' | 'triumph' | 'mystery' | 'wonder' | 'determination';
}

interface StoryChapter {
  id: string;
  title: string;
  description: string;
  theme: 'origin' | 'adventure' | 'challenge' | 'triumph' | 'legend';
  events: QuestEvent[];
  characters: QuestCharacter[];
  unlocked: boolean;
  completionPercentage: number;
  mood: 'epic' | 'dramatic' | 'mysterious' | 'triumphant' | 'inspiring';
}

export const QuestModeManager: React.FC<QuestModeManagerProps> = ({
  board,
  lists,
  cards,
  userId,
  isActive,
  onClose
}) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [characters, setCharacters] = useState<QuestCharacter[]>([]);
  const [questEvents, setQuestEvents] = useState<QuestEvent[]>([]);
  const [storyProgress, setStoryProgress] = useState(0);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [userStats, setUserStats] = useState({
    totalExperience: 0,
    level: 1,
    questsCompleted: 0,
    treasuresFound: 0,
    alliesRecruited: 0,
    bossesDefeated: 0,
    legendaryMoments: 0
  });
  const [activeQuest, setActiveQuest] = useState<QuestEvent | null>(null);
  const [partyMembers, setPartyMembers] = useState<QuestCharacter[]>([]);

  const narratorRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize Quest Mode
  useEffect(() => {
    if (isActive) {
      initializeQuestMode();
    }
  }, [isActive, board, lists, cards]);

  // Auto-play story progression
  useEffect(() => {
    if (isPlaying && chapters.length > 0) {
      const interval = setInterval(() => {
        progressQuest();
      }, 4000); // 4 seconds per event
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentChapter, currentEvent, chapters]);

  const initializeQuestMode = async () => {
    // Generate quest characters from team members
    const questCharacters = await generateQuestCharacters();
    setCharacters(questCharacters);
    setPartyMembers(questCharacters.slice(0, 4)); // Main party

    // Analyze project data to create quest events
    const events = await analyzeProjectQuests();
    setQuestEvents(events);

    // Generate story chapters
    const storyChapters = generateStoryChapters(events, questCharacters);
    setChapters(storyChapters);

    // Load user achievements and stats
    await loadUserProgress();

    // Start with epic cinematic intro
    setCinematicMode(true);
    setTimeout(() => setCinematicMode(false), 6000);
  };

  const generateQuestCharacters = async (): Promise<QuestCharacter[]> => {
    const baseCharacters: QuestCharacter[] = [
      {
        id: 'oracle',
        name: 'The Project Oracle',
        role: 'narrator',
        avatar: '🔮',
        level: 99,
        experience: 999999,
        health: 100,
        mana: 100,
        skills: ['Foresight', 'Wisdom', 'Guidance', 'Time Magic'],
        personality: ['wise', 'mysterious', 'encouraging', 'omniscient'],
        achievements: ['Master of All Projects', 'Keeper of Ancient Knowledge'],
        mood: 'mystical',
        backstory: 'An ancient being who has witnessed countless projects rise and fall, guiding heroes toward their destiny.'
      },
      {
        id: 'taskmaster',
        name: 'The Task Master',
        role: 'hero',
        avatar: '🦸‍♂️',
        level: 1,
        experience: 0,
        health: 100,
        mana: 50,
        skills: ['Determination', 'Focus', 'Leadership', 'Problem Solving'],
        personality: ['determined', 'resourceful', 'collaborative', 'brave'],
        achievements: [],
        mood: 'determined',
        backstory: 'A legendary hero who transforms ordinary tasks into epic quests, inspiring others to achieve greatness.'
      },
      {
        id: 'guardian',
        name: 'The Code Guardian',
        role: 'guardian',
        avatar: '🛡️',
        level: 50,
        experience: 50000,
        health: 150,
        mana: 75,
        skills: ['Protection', 'Quality Assurance', 'Bug Slaying', 'Code Review'],
        personality: ['protective', 'meticulous', 'reliable', 'vigilant'],
        achievements: ['Defender of Quality', 'Bug Slayer Supreme'],
        mood: 'focused',
        backstory: 'A stalwart guardian who protects the realm from bugs and ensures the highest quality in all endeavors.'
      }
    ];

    // Transform board members into quest characters
    board.members.forEach((member, index) => {
      const roles: QuestCharacter['role'][] = ['mentor', 'supporter', 'challenger'];
      const avatars = ['🧙‍♂️', '🏹', '⚔️', '🛡️', '🔥', '⚡', '🌟', '💎'];
      const skillSets = [
        ['Creativity', 'Innovation', 'Inspiration', 'Vision'],
        ['Analysis', 'Precision', 'Strategy', 'Logic'],
        ['Energy', 'Motivation', 'Enthusiasm', 'Speed'],
        ['Wisdom', 'Patience', 'Guidance', 'Experience'],
        ['Courage', 'Risk-taking', 'Bold Moves', 'Leadership'],
        ['Harmony', 'Collaboration', 'Diplomacy', 'Unity']
      ];

      const userAchievements = [
        'Joined the Quest',
        'Team Player',
        'Collaborative Spirit'
      ];

      baseCharacters.push({
        id: member.userId,
        name: member.displayName || `Hero ${index + 1}`,
        role: roles[index % roles.length],
        avatar: avatars[index % avatars.length],
        level: Math.floor(Math.random() * 10) + 1,
        experience: Math.floor(Math.random() * 1000),
        health: 100,
        mana: Math.floor(Math.random() * 50) + 50,
        skills: skillSets[index % skillSets.length],
        personality: ['brave', 'loyal', 'skilled', 'dedicated'],
        achievements: userAchievements,
        mood: 'determined',
        backstory: `A skilled ${roles[index % roles.length]} who brings unique talents to the quest, helping the party overcome challenges through ${skillSets[index % skillSets.length][0].toLowerCase()}.`
      });
    });

    return baseCharacters;
  };

  const analyzeProjectQuests = async (): Promise<QuestEvent[]> => {
    const events: QuestEvent[] = [];
    
    // Transform cards into quest events
    for (const card of cards) {
      const list = lists.find(l => l.id === card.listId);
      const isCompleted = list?.listType === 'done';
      const assignedUser = (card as any).assignedTo || userId;
      
      if (isCompleted) {
        const difficulty = getDifficultyFromCard(card);
        const rewards = calculateQuestRewards(difficulty, card);
        
        events.push({
          id: `quest-${card.id}`,
          type: 'quest_complete',
          timestamp: new Date(card.updatedAt),
          participants: [assignedUser],
          questName: card.title,
          difficulty,
          rewards,
          narrative: generateQuestNarrative('quest_complete', card.title, assignedUser, difficulty),
          gifUrl: await getQuestGif('quest_complete', difficulty),
          voiceNarration: generateVoiceNarration('quest_complete', card.title, assignedUser),
          impact: difficulty === 'legendary' ? 'legendary' : difficulty === 'hard' ? 'epic' : 'major',
          emotion: 'triumph'
        });
      }

      // Add collaboration events
      if ((card as any).assignedTo && (card as any).assignedTo !== userId) {
        events.push({
          id: `alliance-${card.id}`,
          type: 'alliance_formed',
          timestamp: new Date(card.createdAt),
          participants: [userId, (card as any).assignedTo],
          questName: `Alliance: ${card.title}`,
          difficulty: 'medium',
          rewards: { experience: 50, gold: 25, items: ['Friendship Bond'] },
          narrative: generateQuestNarrative('alliance_formed', card.title, (card as any).assignedTo, 'medium'),
          gifUrl: await getQuestGif('alliance_formed', 'medium'),
          voiceNarration: generateVoiceNarration('alliance_formed', card.title, (card as any).assignedTo),
          impact: 'major',
          emotion: 'excitement'
        });
      }
    }

    // Add milestone boss battles
    for (const list of lists) {
      const listCards = cards.filter(c => c.listId === list.id);
      if (listCards.length > 0 && list.listType === 'done') {
        events.push({
          id: `boss-${list.id}`,
          type: 'boss_battle',
          timestamp: new Date(),
          participants: [userId],
          questName: `Boss Battle: ${list.title}`,
          difficulty: 'legendary',
          rewards: { 
            experience: 500, 
            gold: 200, 
            items: ['Epic Trophy', 'Milestone Crown', 'Victory Banner'],
            achievements: ['Phase Conqueror']
          },
          narrative: generateQuestNarrative('boss_battle', list.title, userId, 'legendary'),
          gifUrl: await getQuestGif('boss_battle', 'legendary'),
          voiceNarration: generateVoiceNarration('boss_battle', list.title, userId),
          impact: 'legendary',
          emotion: 'triumph'
        });
      }
    }

    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getDifficultyFromCard = (card: Card): QuestEvent['difficulty'] => {
    const priority = (card as any).priority;
    const description = card.description || '';
    
    if (priority === 'high' || description.length > 200) return 'legendary';
    if (priority === 'medium' || description.length > 100) return 'hard';
    if (description.length > 50) return 'medium';
    return 'easy';
  };

  const calculateQuestRewards = (difficulty: string, card: Card) => {
    const baseRewards = {
      easy: { experience: 50, gold: 10, items: ['Bronze Coin'] },
      medium: { experience: 100, gold: 25, items: ['Silver Coin', 'Health Potion'] },
      hard: { experience: 200, gold: 50, items: ['Gold Coin', 'Mana Potion', 'Skill Scroll'] },
      legendary: { experience: 500, gold: 100, items: ['Platinum Coin', 'Epic Gem', 'Legendary Artifact'] }
    };
    
    return baseRewards[difficulty as keyof typeof baseRewards] || baseRewards.easy;
  };

  const generateQuestNarrative = (
    eventType: string, 
    questName: string, 
    participant: string, 
    difficulty: string
  ): string => {
    const narratives = {
      quest_complete: {
        easy: [
          `With swift precision, ${participant} completed the quest "${questName}" and claimed their reward!`,
          `The brave ${participant} emerged victorious from "${questName}", growing stronger in the process!`
        ],
        medium: [
          `Through skill and determination, ${participant} conquered the challenging quest "${questName}"!`,
          `${participant} faced the trials of "${questName}" and emerged as a true hero!`
        ],
        hard: [
          `Against all odds, the mighty ${participant} triumphed over the epic quest "${questName}"!`,
          `Legends will be told of how ${participant} overcame the formidable challenge of "${questName}"!`
        ],
        legendary: [
          `In an act of legendary heroism, ${participant} achieved the impossible by completing "${questName}"!`,
          `The realm trembles with awe as ${participant} accomplishes the legendary feat of "${questName}"!`
        ]
      },
      alliance_formed: {
        medium: [
          `A powerful alliance was forged as ${participant} joined forces on the quest "${questName}"!`,
          `The bonds of friendship strengthened as heroes united for "${questName}"!`
        ]
      },
      boss_battle: {
        legendary: [
          `The epic boss battle of "${questName}" has been won! The realm celebrates this legendary victory!`,
          `After an intense struggle, the mighty boss "${questName}" has fallen to our heroes!`
        ]
      }
    };

    const eventNarratives = narratives[eventType as keyof typeof narratives];
    if (!eventNarratives) {
      return 'A significant quest event occurred in the realm!';
    }
    
    const difficultyOptions = eventNarratives[difficulty as keyof typeof eventNarratives] as string[] | undefined;
    if (!difficultyOptions || !Array.isArray(difficultyOptions)) {
      return 'A significant quest event occurred in the realm!';
    }
    
    return difficultyOptions[Math.floor(Math.random() * difficultyOptions.length)];
  };

  const generateVoiceNarration = (eventType: string, questName: string, participant: string): string => {
    const voiceNarratives = {
      quest_complete: `Behold! The hero ${participant} has successfully completed the quest ${questName}. Experience and treasures have been earned!`,
      alliance_formed: `A new alliance has been forged! ${participant} joins the party for the quest ${questName}. Together, they are stronger!`,
      boss_battle: `Victory! The legendary boss battle ${questName} has been conquered! The realm is safe once more!`
    };

    return voiceNarratives[eventType as keyof typeof voiceNarratives] || 
           `A great quest event has occurred in the realm!`;
  };

  const getQuestGif = async (eventType: string, difficulty: string): Promise<string> => {
    const questGifs = {
      quest_complete: {
        easy: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        medium: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
        hard: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        legendary: 'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif'
      },
      alliance_formed: {
        medium: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif'
      },
      boss_battle: {
        legendary: 'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif'
      }
    };

    const eventGifs = questGifs[eventType as keyof typeof questGifs];
    if (!eventGifs) {
      return 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif';
    }
    
    const difficultyGif = eventGifs[difficulty as keyof typeof eventGifs];
    return difficultyGif || 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif';
  };

  const generateStoryChapters = (events: QuestEvent[], characters: QuestCharacter[]): StoryChapter[] => {
    const chapters: StoryChapter[] = [];
    
    if (events.length === 0) {
      chapters.push({
        id: 'prologue',
        title: 'The Quest Awaits',
        description: `The legendary tale of "${board.title}" is about to begin...`,
        theme: 'origin',
        events: [],
        characters: characters.slice(0, 3),
        unlocked: true,
        completionPercentage: 0,
        mood: 'inspiring'
      });
      return chapters;
    }

    // Chapter 1: The Beginning
    const chapter1Events = events.slice(0, Math.ceil(events.length * 0.3));
    chapters.push({
      id: 'chapter-1',
      title: 'The Hero\'s Journey Begins',
      description: `Our brave heroes embark on the epic quest of "${board.title}"`,
      theme: 'adventure',
      events: chapter1Events,
      characters: characters.slice(0, 3),
      unlocked: true,
      completionPercentage: chapter1Events.length > 0 ? 100 : 0,
      mood: 'epic'
    });

    // Chapter 2: The Trials
    const chapter2Events = events.slice(Math.ceil(events.length * 0.3), Math.ceil(events.length * 0.7));
    chapters.push({
      id: 'chapter-2',
      title: 'Trials of the Brave',
      description: 'Our heroes face their greatest challenges and forge unbreakable bonds',
      theme: 'challenge',
      events: chapter2Events,
      characters: characters,
      unlocked: events.length > 3,
      completionPercentage: chapter2Events.length > 0 ? 100 : 0,
      mood: 'dramatic'
    });

    // Chapter 3: The Legend
    const chapter3Events = events.slice(Math.ceil(events.length * 0.7));
    chapters.push({
      id: 'chapter-3',
      title: 'Rise of Legends',
      description: 'The ultimate triumph that will be remembered for ages',
      theme: 'triumph',
      events: chapter3Events,
      characters: characters,
      unlocked: events.length > 6,
      completionPercentage: chapter3Events.length > 0 ? 100 : 0,
      mood: 'triumphant'
    });

    return chapters;
  };

  const loadUserProgress = async () => {
    try {
      const achievements = await AchievementService.getUserAchievements(userId);
      if (achievements) {
        const levelInfo = calculateLevel(achievements.totalPoints);
        setUserStats({
          totalExperience: achievements.totalPoints,
          level: levelInfo.level,
          questsCompleted: achievements.stats?.tasksCompleted || 0,
          treasuresFound: achievements.badges?.length || 0,
          alliesRecruited: achievements.stats?.collaborationScore || 0,
                     bossesDefeated: achievements.milestones?.length || 0,
          legendaryMoments: achievements.badges?.filter(b => 
            ACHIEVEMENTS.find(a => a.id === b.achievementId)?.rarity === 'legendary'
          ).length || 0
        });
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const progressQuest = () => {
    if (chapters.length === 0) return;

    const currentChapterData = chapters[currentChapter];
    if (!currentChapterData || currentChapterData.events.length === 0) return;

    if (currentEvent < currentChapterData.events.length - 1) {
      setCurrentEvent(prev => prev + 1);
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
      setCurrentEvent(0);
    } else {
      setIsPlaying(false); // Quest complete
    }

    // Update progress
    const totalEvents = chapters.reduce((sum, chapter) => sum + chapter.events.length, 0);
    const currentEventIndex = chapters.slice(0, currentChapter).reduce((sum, chapter) => sum + chapter.events.length, 0) + currentEvent;
    setStoryProgress((currentEventIndex / totalEvents) * 100);
  };

  const speakNarration = (text: string) => {
    if (isMuted) return;

    if (narratorRef.current) {
      speechSynthesis.cancel();
    }

    narratorRef.current = new SpeechSynthesisUtterance(text);
    narratorRef.current.rate = 0.7;
    narratorRef.current.pitch = 1.2;
    narratorRef.current.volume = 0.8;
    
    speechSynthesis.speak(narratorRef.current);
  };

  const getCurrentEvent = (): QuestEvent | null => {
    const chapter = chapters[currentChapter];
    return chapter?.events[currentEvent] || null;
  };

  const getCurrentCharacter = (): QuestCharacter | null => {
    const event = getCurrentEvent();
    if (!event) return characters[0];
    
    return characters.find(c => event.participants.includes(c.id)) || characters[0];
  };

  const handleClose = () => {
    console.log('Quest Mode close button clicked!');
    setIsPlaying(false);
    if (narratorRef.current) {
      speechSynthesis.cancel();
    }
    onClose();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'ArrowRight':
          progressQuest();
          break;
        case 'ArrowLeft':
          if (currentEvent > 0) {
            setCurrentEvent(prev => prev - 1);
          } else if (currentChapter > 0) {
            setCurrentChapter(prev => prev - 1);
            setCurrentEvent(chapters[currentChapter - 1]?.events.length - 1 || 0);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, currentChapter, currentEvent, chapters]);

  if (!isActive) return null;

  const currentEventData = getCurrentEvent();
  const currentCharacter = getCurrentCharacter();
  const currentChapterData = chapters[currentChapter];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center overflow-hidden"
      onClick={(e) => {
        // Close if clicking on the background (not on content)
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Emergency Close Button - Top Right Corner */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-[60] p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
        title="Close Quest Mode (ESC)"
        style={{ pointerEvents: 'auto' }}
      >
        <X className="h-6 w-6 pointer-events-none" />
      </button>
              <div 
          className="w-full h-full max-w-7xl mx-auto flex flex-col"
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
                  className="text-7xl font-bold mb-6"
                  animate={{ 
                    textShadow: [
                      "0 0 20px #fff",
                      "0 0 30px #fff, 0 0 40px #fff",
                      "0 0 20px #fff"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚔️ QUEST MODE ⚔️
                </motion.h1>
                <motion.p 
                  className="text-3xl mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  The Epic Tale of "{board.title}"
                </motion.p>
                <motion.div
                  className="text-xl text-purple-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 3, duration: 1 }}
                >
                  Where Heroes Are Born and Legends Are Made
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 text-white">
          <div className="flex items-center gap-4">
            <Sword className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">{currentChapterData?.title || 'Loading Quest...'}</h2>
              <p className="text-purple-200">{currentChapterData?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* User Stats */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">Level {userStats.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="text-xs">{userStats.totalExperience} XP</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm opacity-75">Chapter {currentChapter + 1} of {chapters.length}</div>
              <div className="text-xs opacity-50">Event {currentEvent + 1}</div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer relative z-20"
              title="Close Quest Mode (ESC)"
              style={{ pointerEvents: 'auto' }}
            >
              <X className="h-5 w-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-3">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"
            style={{ width: `${storyProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Main Quest Display */}
        <div className="flex-1 flex">
          {/* Quest Content - Split Layout */}
          <div className="flex-1 flex">
            {chapters.length === 0 ? (
              <div className="flex items-center justify-center h-full w-full bg-black">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold mb-2">Initializing Quest...</h3>
                  <p className="text-gray-300">Analyzing your heroic journey and creating epic adventures</p>
                </div>
              </div>
            ) : currentEventData ? (
              <motion.div
                key={`${currentChapter}-${currentEvent}`}
                className="flex flex-col md:flex-row w-full h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                {/* Quest GIF Side */}
                <div className="w-full md:w-1/2 h-64 md:h-full relative bg-black">
                  <img
                    src={currentEventData.gifUrl}
                    alt="Quest Event"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif';
                    }}
                  />
                  
                  {/* Event Type Indicator */}
                  <div className="absolute top-4 left-4">
                    <motion.div
                      className={`px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                        currentEventData.type === 'quest_complete' ? 'bg-green-500/90 text-white' :
                        currentEventData.type === 'boss_battle' ? 'bg-red-500/90 text-white' :
                        currentEventData.type === 'alliance_formed' ? 'bg-blue-500/90 text-white' :
                        currentEventData.type === 'level_up' ? 'bg-yellow-500/90 text-black' :
                        'bg-purple-500/90 text-white'
                      }`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {currentEventData.type === 'quest_complete' && '⚔️ Quest Complete'}
                      {currentEventData.type === 'boss_battle' && '🐉 Boss Battle'}
                      {currentEventData.type === 'alliance_formed' && '🤝 Alliance Formed'}
                      {currentEventData.type === 'level_up' && '⬆️ Level Up'}
                      {currentEventData.type === 'treasure_found' && '💎 Treasure Found'}
                      {currentEventData.type === 'epic_moment' && '✨ Epic Moment'}
                    </motion.div>
                  </div>
                </div>

                {/* Quest Story Side */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col">
                  {/* Character Header */}
                  {currentCharacter && (
                    <motion.div
                      className="p-6 border-b border-white/10"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{currentCharacter.avatar}</div>
                        <div>
                          <div className="font-bold text-2xl text-white">{currentCharacter.name}</div>
                          <div className="text-purple-300 capitalize">{currentCharacter.role}</div>
                          <div className="text-sm text-blue-300">Level {currentCharacter.level} • {currentCharacter.mood}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Quest Details */}
                  <motion.div
                    className="p-6 border-b border-white/10"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-yellow-400" />
                        <span className="font-bold text-lg sm:text-xl text-white">{currentEventData.questName}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
                        currentEventData.difficulty === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        currentEventData.difficulty === 'hard' ? 'bg-purple-500 text-white' :
                        currentEventData.difficulty === 'medium' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {currentEventData.difficulty.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="font-medium">+{currentEventData.rewards.experience} XP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gem className="h-5 w-5 text-yellow-400" />
                        <span className="font-medium">+{currentEventData.rewards.gold} Gold</span>
                      </div>
                      {currentEventData.rewards.items.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-purple-400" />
                          <span className="font-medium">{currentEventData.rewards.items.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Narrative Text */}
                  <motion.div
                    className="flex-1 p-6 flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    <motion.p
                      className="text-xl leading-relaxed text-white font-medium"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2, duration: 1 }}
                      onAnimationComplete={() => speakNarration(currentEventData.voiceNarration)}
                    >
                      "{currentEventData.narrative}"
                    </motion.p>
                  </motion.div>
                  
                  {/* Quest Complete Button */}
                  <motion.div
                    className="p-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                  >
                    <button
                      onClick={progressQuest}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span>Continue Quest</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-black text-white">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-bold mb-2">Chapter Complete</h3>
                  <p className="text-gray-300">Navigate to the next chapter to continue your quest</p>
                </div>
              </div>
            )}
          </div>

          {/* Quest Sidebar */}
          <div className="w-80 bg-gray-900 text-white overflow-y-auto max-h-full">
            <div className="p-6 space-y-6">
            {/* Quest Statistics */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quest Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-purple-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{userStats.questsCompleted}</div>
                  <div className="text-purple-200">Quests</div>
                </div>
                <div className="bg-blue-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{userStats.treasuresFound}</div>
                  <div className="text-blue-200">Treasures</div>
                </div>
                <div className="bg-green-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{userStats.alliesRecruited}</div>
                  <div className="text-green-200">Allies</div>
                </div>
                <div className="bg-yellow-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{userStats.bossesDefeated}</div>
                  <div className="text-yellow-200">Bosses</div>
                </div>
              </div>
            </div>

            {/* Party Members */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Party
              </h3>
              <div className="space-y-3">
                {partyMembers.map((character) => (
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
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs">{character.level}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-400" />
                            <span className="text-xs">{character.health}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-blue-400" />
                            <span className="text-xs">{character.mana}</span>
                          </div>
                        </div>
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
                Quest Chapters
              </h3>
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <motion.button
                    key={chapter.id}
                    onClick={() => {
                      if (chapter.unlocked) {
                        setCurrentChapter(index);
                        setCurrentEvent(0);
                      }
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      currentChapter === index
                        ? 'bg-purple-600 text-white'
                        : chapter.unlocked
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                    whileHover={chapter.unlocked ? { scale: 1.02 } : {}}
                    disabled={!chapter.unlocked}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{chapter.title}</div>
                        <div className="text-xs opacity-75">{chapter.events.length} events</div>
                      </div>
                      {!chapter.unlocked && <span className="text-gray-500">🔒</span>}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Character Details */}
            {currentCharacter && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">{currentCharacter.avatar}</span>
                  Character Details
                </h3>
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-purple-300">{currentCharacter.name}</h4>
                    <p className="text-sm text-gray-400 capitalize">{currentCharacter.role}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">{currentCharacter.level}</div>
                      <div className="text-gray-400">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-bold">{currentCharacter.health}</div>
                      <div className="text-gray-400">Health</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">{currentCharacter.mana}</div>
                      <div className="text-gray-400">Mana</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-green-300 mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-1">
                      {currentCharacter.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-blue-300 mb-2">Personality</h5>
                    <div className="flex flex-wrap gap-1">
                      {currentCharacter.personality.map((trait, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-purple-300 mb-2">Backstory</h5>
                    <p className="text-xs text-gray-300 leading-relaxed">{currentCharacter.backstory}</p>
                  </div>
                  
                  {currentCharacter.achievements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-yellow-300 mb-2">Achievements</h5>
                      <div className="space-y-1">
                        {currentCharacter.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Trophy className="h-3 w-3 text-yellow-400" />
                            <span className="text-gray-300">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quest History */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Scroll className="h-5 w-5" />
                Quest History
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {questEvents.slice(0, 10).map((event, index) => (
                  <div key={event.id} className="bg-gray-800 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.difficulty === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        event.difficulty === 'hard' ? 'bg-purple-500 text-white' :
                        event.difficulty === 'medium' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {event.difficulty}
                      </span>
                      <span className="text-gray-300 font-medium">{event.questName}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      +{event.rewards.experience} XP • {event.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {questEvents.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">No quest history yet</p>
                    <p className="text-xs">Complete tasks to build your legend!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quest Controls */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Quest Controls</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => {
                    if (currentEvent > 0) {
                      setCurrentEvent(prev => prev - 1);
                    } else if (currentChapter > 0) {
                      setCurrentChapter(prev => prev - 1);
                      setCurrentEvent(chapters[currentChapter - 1]?.events.length - 1 || 0);
                    }
                  }}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  title="Previous Event"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setIsPlaying(prev => !prev)}
                  className="p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                  title={isPlaying ? "Pause Quest" : "Play Quest"}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={progressQuest}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  title="Next Event"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  title={isMuted ? "Unmute Narration" : "Mute Narration"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => setIsFullscreen(prev => !prev)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-400 text-center">
                <div>Space: Play/Pause</div>
                <div>← →: Navigate Events</div>
                <div>ESC: Exit Quest Mode</div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 