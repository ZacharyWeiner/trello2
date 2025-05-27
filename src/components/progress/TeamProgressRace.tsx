'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamProgressRace, TeamRaceParticipant } from '@/types';
import { Trophy, Medal, Crown, Zap, Flag, Users } from 'lucide-react';

interface TeamProgressRaceProps {
  race: TeamProgressRace;
  animated?: boolean;
  showAvatars?: boolean;
  raceHeight?: number;
}

export const TeamProgressRaceComponent: React.FC<TeamProgressRaceProps> = ({
  race,
  animated = true,
  showAvatars = true,
  raceHeight = 300
}) => {
  const [animatedParticipants, setAnimatedParticipants] = useState<TeamRaceParticipant[]>([]);
  const [raceFinished, setRaceFinished] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedParticipants(race.participants);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedParticipants(race.participants);
    }
  }, [race.participants, animated]);

  useEffect(() => {
    const hasWinner = race.participants.some(p => p.currentProgress >= race.target);
    setRaceFinished(hasWinner);
  }, [race.participants, race.target]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Trophy className="h-4 w-4 text-orange-500" />;
      default:
        return <span className="text-xs font-bold text-gray-600">{position}</span>;
    }
  };

  const getAvatarEmoji = (userId: string) => {
    const avatars = ['🏃‍♂️', '🏃‍♀️', '🚀', '⚡', '🔥', '💨', '🌟', '💪'];
    const index = userId.charCodeAt(userId.length - 1) % avatars.length;
    return avatars[index];
  };

  const renderRaceTrack = () => {
    const trackHeight = raceHeight / race.participants.length;
    
    return race.participants.map((participant, index) => {
      const progressPercentage = Math.min((participant.currentProgress / race.target) * 100, 100);
      const trackY = index * trackHeight;
      
      return (
        <g key={participant.userId}>
          {/* Track background */}
          <rect
            x="60"
            y={trackY + 10}
            width="400"
            height={trackHeight - 20}
            fill="#f3f4f6"
            stroke="#e5e7eb"
            strokeWidth="1"
            rx="10"
          />
          
          {/* Progress track */}
          <motion.rect
            x="60"
            y={trackY + 10}
            width={(progressPercentage / 100) * 400}
            height={trackHeight - 20}
            fill={participant.color}
            rx="10"
            initial={{ width: 0 }}
            animate={{ width: (progressPercentage / 100) * 400 }}
            transition={{ 
              duration: animated ? 1.5 : 0,
              ease: "easeOut",
              delay: animated ? index * 0.2 : 0
            }}
          />
          
          {/* Finish line */}
          <line
            x1="460"
            y1={trackY + 5}
            x2="460"
            y2={trackY + trackHeight - 5}
            stroke="#ef4444"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
          
          {/* Participant avatar/icon */}
          <motion.g
            initial={{ x: 60 }}
            animate={{ x: 60 + (progressPercentage / 100) * 400 }}
            transition={{ 
              duration: animated ? 1.5 : 0,
              ease: "easeOut",
              delay: animated ? index * 0.2 : 0
            }}
          >
            <circle
              cx="0"
              cy={trackY + trackHeight / 2}
              r="15"
              fill="white"
              stroke={participant.color}
              strokeWidth="3"
            />
            <text
              x="0"
              y={trackY + trackHeight / 2 + 4}
              textAnchor="middle"
              fontSize="16"
            >
              {showAvatars ? getAvatarEmoji(participant.userId) : '🏃'}
            </text>
          </motion.g>
          
          {/* Participant info */}
          <text
            x="10"
            y={trackY + trackHeight / 2 - 5}
            fontSize="12"
            fontWeight="bold"
            fill="#374151"
          >
            {participant.userName}
          </text>
          <text
            x="10"
            y={trackY + trackHeight / 2 + 10}
            fontSize="10"
            fill="#6b7280"
          >
            {participant.currentProgress}/{race.target}
          </text>
          
          {/* Position indicator */}
          <g transform={`translate(470, ${trackY + trackHeight / 2 - 8})`}>
            {getPositionIcon(participant.position)}
          </g>
          
          {/* Speed indicators */}
          {progressPercentage > 0 && (
            <motion.g
              animate={{ opacity: 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <text
                x={60 + (progressPercentage / 100) * 400 - 20}
                y={trackY + trackHeight / 2 - 20}
                fontSize="12"
                fill={participant.color}
              >
                💨
              </text>
            </motion.g>
          )}
        </g>
      );
    });
  };

  const renderLeaderboard = () => {
    const sortedParticipants = [...race.participants].sort((a, b) => b.currentProgress - a.currentProgress);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Leaderboard
        </h4>
        <div className="space-y-2">
          {sortedParticipants.map((participant, index) => (
            <motion.div
              key={participant.userId}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6">
                  {getPositionIcon(index + 1)}
                </div>
                <span className="font-medium text-sm">{participant.userName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {participant.currentProgress}/{race.target}
                </span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: participant.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Flag className="h-5 w-5 text-green-600" />
              {race.name}
            </h3>
            <p className="text-gray-600 text-sm">{race.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {race.participants.length} participants
            </div>
            <div className="text-xs text-gray-500">
              Target: {race.target} {race.category.replace('_', ' ')}
            </div>
          </div>
        </div>
        
        {/* Race Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              race.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {race.isActive ? '🏁 Active' : '⏸️ Paused'}
            </span>
            {raceFinished && (
              <motion.span 
                className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                animate={{ scale: 1.05 }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🏆 Race Finished!
              </motion.span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {new Date(race.startDate).toLocaleDateString()} - {new Date(race.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Race Track */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-500" />
          Race Track
        </h4>
        
        <div className="overflow-x-auto">
          <svg width="500" height={raceHeight} className="border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
            {renderRaceTrack()}
            
            {/* Start line */}
            <line
              x1="60"
              y1="0"
              x2="60"
              y2={raceHeight}
              stroke="#10b981"
              strokeWidth="3"
            />
            <text
              x="65"
              y="15"
              fontSize="10"
              fill="#10b981"
              fontWeight="bold"
            >
              START
            </text>
            
            {/* Finish line label */}
            <text
              x="465"
              y="15"
              fontSize="10"
              fill="#ef4444"
              fontWeight="bold"
            >
              FINISH
            </text>
          </svg>
        </div>
      </div>

      {/* Leaderboard */}
      {renderLeaderboard()}

      {/* Winner Celebration */}
      <AnimatePresence>
        {raceFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-lg shadow-lg p-6 text-center text-white"
          >
            <motion.div
              animate={{ rotate: 10 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Trophy className="h-12 w-12 mx-auto mb-3" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">🎉 Race Complete! 🎉</h3>
            <p className="text-sm opacity-90">
              Congratulations to all participants! 
              {race.participants.find(p => p.position === 1)?.userName} takes the crown! 👑
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 