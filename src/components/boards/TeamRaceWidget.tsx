'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, List, Card, BoardMember, TeamProgressRace, TeamRaceParticipant } from '@/types';
import { TeamProgressRaceComponent } from '@/components/progress/TeamProgressRace';
import { Trophy, Users, Calendar, Target, Settings, X, Play, Pause } from 'lucide-react';

interface TeamRaceWidgetProps {
  board: Board;
  lists: List[];
  cards: Record<string, Card[]>;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamRaceWidget: React.FC<TeamRaceWidgetProps> = ({
  board,
  lists,
  cards,
  isOpen,
  onClose,
}) => {
  const [teamRace, setTeamRace] = useState<TeamProgressRace | null>(null);
  const [raceType, setRaceType] = useState<'tasks_completed' | 'cards_created' | 'comments_posted'>('tasks_completed');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen && board.members.length > 1) {
      generateTeamRace();
    }
  }, [isOpen, board, lists, cards, raceType, timeframe]);

  const generateTeamRace = () => {
    const allCards = Object.values(cards).flat();
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    // Calculate timeframe
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    // Calculate progress for each team member
    const participants: TeamRaceParticipant[] = board.members.map((member, index) => {
      let progress = 0;
      
      switch (raceType) {
        case 'tasks_completed':
          // Count completed cards (cards in "Done" lists)
          const doneListIds = lists
            .filter(list => list.listType === 'done' || list.title.toLowerCase().includes('done'))
            .map(list => list.id);
          
          progress = allCards.filter(card => 
            card.createdBy === member.userId &&
            doneListIds.includes(card.listId) &&
            card.updatedAt >= startDate &&
            card.updatedAt <= endDate
          ).length;
          break;
          
        case 'cards_created':
          // Count all cards created by the member
          progress = allCards.filter(card => 
            card.createdBy === member.userId &&
            card.createdAt >= startDate &&
            card.createdAt <= endDate
          ).length;
          break;
          
        case 'comments_posted':
          // Count comments posted by the member
          progress = allCards.reduce((total, card) => {
            const memberComments = (card.comments || []).filter(comment =>
              comment.createdBy === member.userId &&
              comment.createdAt >= startDate &&
              comment.createdAt <= endDate
            );
            return total + memberComments.length;
          }, 0);
          break;
      }

      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      
      return {
        userId: member.userId,
        userName: member.displayName || member.email,
        userPhoto: member.photoURL,
        currentProgress: progress,
        position: 1, // Will be calculated after sorting
        color: colors[index % colors.length],
        avatar: getRandomAvatar(member.userId)
      };
    });

    // Sort by progress and assign positions
    participants.sort((a, b) => b.currentProgress - a.currentProgress);
    participants.forEach((participant, index) => {
      participant.position = index + 1;
    });

    // Calculate target based on current max progress + buffer
    const maxProgress = Math.max(...participants.map(p => p.currentProgress));
    const target = Math.max(maxProgress + 5, 10); // At least 10, or max + 5

    const race: TeamProgressRace = {
      id: `race-${board.id}-${raceType}-${timeframe}`,
      name: `${getRaceTitle()} - ${getTimeframeTitle()}`,
      description: getRaceDescription(),
      startDate,
      endDate,
      participants,
      category: raceType,
      target,
      isActive: true,
      theme: {
        id: 'racing',
        name: 'Racing Theme',
        colors: {
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#f59e0b',
          background: '#ffffff',
          text: '#000000'
        },
        animations: {
          duration: 1000,
          easing: 'ease-out',
          effects: ['bounce', 'pulse']
        },
        icons: {
          progress: '🏃',
          milestone: '🏁',
          celebration: '🎉'
        }
      }
    };

    setTeamRace(race);
  };

  const getRandomAvatar = (userId: string) => {
    const avatars = ['🏃‍♂️', '🏃‍♀️', '🚀', '⚡', '🔥', '💨', '🌟', '💪', '🦄', '🎯'];
    const index = userId.charCodeAt(userId.length - 1) % avatars.length;
    return avatars[index];
  };

  const getRaceTitle = () => {
    switch (raceType) {
      case 'tasks_completed':
        return 'Task Completion Race';
      case 'cards_created':
        return 'Card Creation Sprint';
      case 'comments_posted':
        return 'Collaboration Challenge';
      default:
        return 'Team Race';
    }
  };

  const getTimeframeTitle = () => {
    switch (timeframe) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      default:
        return '';
    }
  };

  const getRaceDescription = () => {
    switch (raceType) {
      case 'tasks_completed':
        return 'Who can complete the most tasks and move them to Done?';
      case 'cards_created':
        return 'Who can create the most cards and contribute to the board?';
      case 'comments_posted':
        return 'Who can be the most collaborative with comments and discussions?';
      default:
        return 'Team competition based on board activity';
    }
  };

  const getRaceTypeIcon = () => {
    switch (raceType) {
      case 'tasks_completed':
        return '✅';
      case 'cards_created':
        return '📝';
      case 'comments_posted':
        return '💬';
      default:
        return '🏁';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Team Progress Race - {board.title}
              </h2>
              <p className="text-sm text-gray-600">
                Real-time competition based on your board activity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Race Type:</label>
              <select
                value={raceType}
                onChange={(e) => setRaceType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tasks_completed">✅ Tasks Completed</option>
                <option value="cards_created">📝 Cards Created</option>
                <option value="comments_posted">💬 Comments Posted</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">📅 Today</option>
                <option value="weekly">📊 This Week</option>
                <option value="monthly">📈 This Month</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{board.members.length} participants</span>
            </div>
          </div>
        </div>

        {/* Race Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {teamRace ? (
            <div className="space-y-6">
              {/* Race Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getRaceTypeIcon()}</span>
                    <h3 className="font-medium text-gray-900">Race Type</h3>
                  </div>
                  <p className="text-sm text-gray-600">{getRaceDescription()}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-medium text-gray-900">Leader</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {teamRace.participants.find(p => p.position === 1)?.userName || 'No leader yet'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {teamRace.participants.find(p => p.position === 1)?.currentProgress || 0} points
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium text-gray-900">Target</h3>
                  </div>
                  <p className="text-sm text-gray-600">{teamRace.target} {raceType.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">Race goal</p>
                </div>
              </div>

              {/* Team Race Component */}
              <div className="min-h-[400px]">
                <TeamProgressRaceComponent
                  race={teamRace}
                  animated={true}
                  showAvatars={true}
                  raceHeight={Math.max(400, teamRace.participants.length * 100)}
                />
              </div>

              {/* Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Races update in real-time as you work on the board</li>
                  <li>• Try different race types to encourage various behaviors</li>
                  <li>• Use weekly races for sprint competitions</li>
                  <li>• Comments race encourages team collaboration</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Setting up your team race...
              </h3>
              <p className="text-gray-600">
                Analyzing board activity to create an exciting competition!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Race data updates automatically based on board activity
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => generateTeamRace()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Race
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 