import { Achievement } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  // Productivity Badges
  {
    id: 'speed_demon',
    type: 'badge',
    category: 'productivity',
    name: 'Speed Demon',
    description: 'Complete 10 tasks in a single day',
    icon: '⚡',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'task_completion',
      metric: 'tasks_per_day',
      target: 10,
      timeframe: 'day'
    }
  },
  {
    id: 'task_master',
    type: 'badge',
    category: 'productivity',
    name: 'Task Master',
    description: 'Complete 100 tasks total',
    icon: '👑',
    rarity: 'epic',
    points: 250,
    criteria: {
      type: 'task_completion',
      metric: 'total_tasks',
      target: 100,
      timeframe: 'all_time'
    }
  },
  {
    id: 'early_bird',
    type: 'badge',
    category: 'productivity',
    name: 'Early Bird',
    description: 'Complete 5 tasks before 9 AM',
    icon: '🌅',
    rarity: 'common',
    points: 50,
    criteria: {
      type: 'task_completion',
      metric: 'early_completions',
      target: 5,
      conditions: { before_hour: 9 }
    }
  },
  {
    id: 'night_owl',
    type: 'badge',
    category: 'productivity',
    name: 'Night Owl',
    description: 'Complete 5 tasks after 10 PM',
    icon: '🦉',
    rarity: 'common',
    points: 50,
    criteria: {
      type: 'task_completion',
      metric: 'late_completions',
      target: 5,
      conditions: { after_hour: 22 }
    }
  },
  
  // Collaboration Badges
  {
    id: 'team_player',
    type: 'badge',
    category: 'collaboration',
    name: 'Team Player',
    description: 'Help on 5 different cards (comment, checklist, or attachment)',
    icon: '🤝',
    rarity: 'common',
    points: 75,
    criteria: {
      type: 'card_interaction',
      metric: 'cards_helped',
      target: 5,
      timeframe: 'all_time'
    }
  },
  {
    id: 'mentor',
    type: 'badge',
    category: 'collaboration',
    name: 'Mentor',
    description: 'Post 50 helpful comments',
    icon: '🧙',
    rarity: 'rare',
    points: 150,
    criteria: {
      type: 'team_activity',
      metric: 'comments_posted',
      target: 50,
      timeframe: 'all_time'
    }
  },
  {
    id: 'connector',
    type: 'badge',
    category: 'collaboration',
    name: 'Connector',
    description: 'Mention 10 different team members',
    icon: '🔗',
    rarity: 'common',
    points: 60,
    criteria: {
      type: 'team_activity',
      metric: 'unique_mentions',
      target: 10,
      timeframe: 'all_time'
    }
  },
  {
    id: 'reviewer',
    type: 'badge',
    category: 'collaboration',
    name: 'Code Reviewer',
    description: 'Review and comment on 20 cards',
    icon: '👀',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'card_interaction',
      metric: 'cards_reviewed',
      target: 20,
      timeframe: 'all_time'
    }
  },
  
  // Consistency Badges
  {
    id: 'steady_contributor',
    type: 'badge',
    category: 'consistency',
    name: 'Steady Contributor',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    rarity: 'common',
    points: 80,
    criteria: {
      type: 'streak',
      metric: 'daily_activity',
      target: 7
    }
  },
  {
    id: 'unstoppable',
    type: 'badge',
    category: 'consistency',
    name: 'Unstoppable',
    description: 'Maintain a 30-day activity streak',
    icon: '💪',
    rarity: 'epic',
    points: 300,
    criteria: {
      type: 'streak',
      metric: 'daily_activity',
      target: 30
    }
  },
  {
    id: 'weekend_warrior',
    type: 'badge',
    category: 'consistency',
    name: 'Weekend Warrior',
    description: 'Complete tasks on 5 consecutive weekends',
    icon: '🛡️',
    rarity: 'rare',
    points: 120,
    criteria: {
      type: 'streak',
      metric: 'weekend_activity',
      target: 5
    }
  },
  {
    id: 'consistent_performer',
    type: 'badge',
    category: 'consistency',
    name: 'Consistent Performer',
    description: 'Complete at least 3 tasks every day for a week',
    icon: '📊',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'streak',
      metric: 'consistent_daily_tasks',
      target: 7,
      conditions: { min_daily_tasks: 3 }
    }
  },
  
  // Quality Badges
  {
    id: 'perfectionist',
    type: 'badge',
    category: 'quality',
    name: 'Perfectionist',
    description: 'Complete 10 cards with all checklists done',
    icon: '✨',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'task_completion',
      metric: 'perfect_cards',
      target: 10,
      conditions: { all_checklists_complete: true }
    }
  },
  {
    id: 'organizer',
    type: 'badge',
    category: 'quality',
    name: 'Organizer',
    description: 'Create 20 cards with proper labels and due dates',
    icon: '📋',
    rarity: 'common',
    points: 70,
    criteria: {
      type: 'card_interaction',
      metric: 'organized_cards',
      target: 20,
      conditions: { has_labels: true, has_due_date: true }
    }
  },
  {
    id: 'deadline_keeper',
    type: 'badge',
    category: 'quality',
    name: 'Deadline Keeper',
    description: 'Complete 20 tasks before their due date',
    icon: '⏰',
    rarity: 'rare',
    points: 110,
    criteria: {
      type: 'task_completion',
      metric: 'on_time_completions',
      target: 20,
      conditions: { before_due_date: true }
    }
  },
  {
    id: 'detail_oriented',
    type: 'badge',
    category: 'quality',
    name: 'Detail Oriented',
    description: 'Create 15 cards with descriptions over 100 characters',
    icon: '🔍',
    rarity: 'common',
    points: 60,
    criteria: {
      type: 'card_interaction',
      metric: 'detailed_cards',
      target: 15,
      conditions: { min_description_length: 100 }
    }
  },
  
  // Legendary Badges
  {
    id: 'legendary_achiever',
    type: 'badge',
    category: 'productivity',
    name: 'Legendary Achiever',
    description: 'Unlock 20 other achievements',
    icon: '🏆',
    rarity: 'legendary',
    points: 500,
    criteria: {
      type: 'custom',
      metric: 'achievements_unlocked',
      target: 20
    }
  },
  {
    id: 'centurion',
    type: 'badge',
    category: 'consistency',
    name: 'Centurion',
    description: 'Maintain a 100-day activity streak',
    icon: '💯',
    rarity: 'legendary',
    points: 1000,
    criteria: {
      type: 'streak',
      metric: 'daily_activity',
      target: 100
    }
  }
];

// Level thresholds based on total points
export const LEVEL_THRESHOLDS = [
  { level: 1, minPoints: 0, title: 'Newcomer' },
  { level: 2, minPoints: 100, title: 'Contributor' },
  { level: 3, minPoints: 250, title: 'Active Member' },
  { level: 4, minPoints: 500, title: 'Team Star' },
  { level: 5, minPoints: 1000, title: 'Productivity Pro' },
  { level: 6, minPoints: 2000, title: 'Achievement Hunter' },
  { level: 7, minPoints: 3500, title: 'Elite Performer' },
  { level: 8, minPoints: 5000, title: 'Master Achiever' },
  { level: 9, minPoints: 7500, title: 'Legendary Member' },
  { level: 10, minPoints: 10000, title: 'Hall of Fame' }
];

export const calculateLevel = (totalPoints: number): { level: number; title: string; nextLevelPoints?: number } => {
  const currentLevel = LEVEL_THRESHOLDS.slice().reverse().find(l => totalPoints >= l.minPoints) || LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === currentLevel.level + 1);
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelPoints: nextLevel?.minPoints
  };
}; 