'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CelebrationEvent {
  id: string;
  type: 'task_complete' | 'milestone' | 'streak' | 'achievement';
  title: string;
  message?: string;
  intensity: 'low' | 'medium' | 'high' | 'epic';
  duration?: number;
  userId?: string;
  teamWide?: boolean;
}

interface CelebrationSystemProps {
  onCelebrationComplete?: (eventId: string) => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

export const CelebrationSystem: React.FC<CelebrationSystemProps> = ({ 
  onCelebrationComplete 
}) => {
  const [activeEvents, setActiveEvents] = useState<CelebrationEvent[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Listen for celebration events
  useEffect(() => {
    const handleCelebration = (event: CustomEvent<CelebrationEvent>) => {
      triggerCelebration(event.detail);
    };

    window.addEventListener('celebrate' as any, handleCelebration);
    return () => window.removeEventListener('celebrate' as any, handleCelebration);
  }, []);

  // Confetti animation loop
  useEffect(() => {
    if (!isAnimating || confetti.length === 0) return;

    const interval = setInterval(() => {
      setConfetti(prev => 
        prev
          .map(piece => ({
            ...piece,
            x: piece.x + piece.velocity.x,
            y: piece.y + piece.velocity.y,
            rotation: piece.rotation + piece.rotationSpeed,
            velocity: {
              x: piece.velocity.x * 0.99, // Air resistance
              y: piece.velocity.y + 0.5 // Gravity
            }
          }))
          .filter(piece => piece.y < window.innerHeight + 100) // Remove pieces that fall off screen
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isAnimating, confetti.length]);

  const triggerCelebration = (event: CelebrationEvent) => {
    setActiveEvents(prev => [...prev, event]);
    
    // Generate confetti based on intensity
    generateConfetti(event.intensity);
    
    // Auto-remove event after duration
    const duration = event.duration || getDurationForIntensity(event.intensity);
    setTimeout(() => {
      setActiveEvents(prev => prev.filter(e => e.id !== event.id));
      onCelebrationComplete?.(event.id);
    }, duration);
  };

  const generateConfetti = (intensity: CelebrationEvent['intensity']) => {
    const counts = { low: 30, medium: 60, high: 100, epic: 200 };
    const count = counts[intensity];
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    const newConfetti: ConfettiPiece[] = [];
    
    for (let i = 0; i < count; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: Math.random() * 3 + 2
        },
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    setConfetti(prev => [...prev, ...newConfetti]);
    setIsAnimating(true);

    // Stop animation after confetti settles
    setTimeout(() => {
      setIsAnimating(false);
      setConfetti([]);
    }, 5000);
  };

  const getDurationForIntensity = (intensity: CelebrationEvent['intensity']) => {
    const durations = { low: 2000, medium: 3000, high: 4000, epic: 6000 };
    return durations[intensity];
  };

  const getAnimationForType = (type: CelebrationEvent['type']) => {
    switch (type) {
      case 'task_complete':
        return {
          initial: { scale: 0, rotate: -180 },
          animate: { scale: 1, rotate: 0 },
          exit: { scale: 0, opacity: 0 }
        };
      case 'milestone':
        return {
          initial: { y: -100, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -100, opacity: 0 }
        };
      case 'streak':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 100, opacity: 0 }
        };
      case 'achievement':
        return {
          initial: { scale: 0, rotate: 360 },
          animate: { scale: 1, rotate: 0 },
          exit: { scale: 0, rotate: -360 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const getIconForType = (type: CelebrationEvent['type']) => {
    switch (type) {
      case 'task_complete': return '✅';
      case 'milestone': return '🎯';
      case 'streak': return '🔥';
      case 'achievement': return '🏆';
      default: return '🎉';
    }
  };

  const getStyleForIntensity = (intensity: CelebrationEvent['intensity']) => {
    switch (intensity) {
      case 'low':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'medium':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'high':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'epic':
        return 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <>
      {/* Confetti Layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map(piece => (
          <div
            key={piece.id}
            className="absolute"
            style={{
              left: piece.x,
              top: piece.y,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%'
            }}
          />
        ))}
      </div>

      {/* Celebration Messages */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        <AnimatePresence>
          {activeEvents.map((event) => {
            const animation = getAnimationForType(event.type);
            const icon = getIconForType(event.type);
            const style = getStyleForIntensity(event.intensity);

            return (
              <motion.div
                key={event.id}
                {...animation}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
                className={`
                  p-4 rounded-lg border-2 shadow-lg max-w-sm
                  ${style}
                  ${event.intensity === 'epic' ? 'animate-pulse' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    {event.message && (
                      <p className="text-sm opacity-90">{event.message}</p>
                    )}
                    {event.teamWide && (
                      <p className="text-xs opacity-75 mt-1">🎊 Team celebration!</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

// Helper function to trigger celebrations from anywhere in the app
export const celebrate = (event: Omit<CelebrationEvent, 'id'>) => {
  const celebrationEvent: CelebrationEvent = {
    ...event,
    id: `celebration-${Date.now()}-${Math.random()}`
  };
  
  window.dispatchEvent(new CustomEvent('celebrate', { detail: celebrationEvent }));
};

// Pre-built celebration templates
export const CelebrationTemplates = {
  taskComplete: (taskTitle: string): Omit<CelebrationEvent, 'id'> => ({
    type: 'task_complete',
    title: 'Task Completed!',
    message: `"${taskTitle}" is done! 🎉`,
    intensity: 'medium'
  }),

  firstTaskOfDay: (): Omit<CelebrationEvent, 'id'> => ({
    type: 'task_complete',
    title: 'Great Start!',
    message: 'First task of the day completed! 🌅',
    intensity: 'medium'
  }),

  streakMilestone: (days: number): Omit<CelebrationEvent, 'id'> => ({
    type: 'streak',
    title: `${days} Day Streak!`,
    message: `You're on fire! Keep it going! 🔥`,
    intensity: days >= 30 ? 'epic' : days >= 7 ? 'high' : 'medium'
  }),

  teamMilestone: (milestone: string): Omit<CelebrationEvent, 'id'> => ({
    type: 'milestone',
    title: 'Team Milestone!',
    message: milestone,
    intensity: 'high',
    teamWide: true
  }),

  perfectDay: (): Omit<CelebrationEvent, 'id'> => ({
    type: 'achievement',
    title: 'Perfect Day!',
    message: 'All tasks completed on time! 🌟',
    intensity: 'epic'
  }),

  speedDemon: (): Omit<CelebrationEvent, 'id'> => ({
    type: 'achievement',
    title: 'Speed Demon!',
    message: '5 tasks completed in an hour! ⚡',
    intensity: 'high'
  })
}; 