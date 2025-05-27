export interface GifData {
  id: string;
  url: string;
  title: string;
  tags: string[];
  mood: 'excited' | 'calm' | 'focused' | 'stressed' | 'celebratory';
  intensity: number; // 1-10
  duration: number;
  biometricTriggers?: {
    heartRateRange?: [number, number];
    stressLevel?: number;
    timeOfDay?: string[];
  };
  interactionType: 'celebration' | 'motivation' | 'ambient' | 'reaction' | 'story';
}

export interface GifEcosystem {
  boardId: string;
  activeGifs: GifData[];
  interactions: GifInteraction[];
  story: GifStoryFrame[];
  biometricState: BiometricState;
}

export interface GifInteraction {
  id: string;
  sourceGifId: string;
  targetGifId: string;
  interactionType: 'chase' | 'bounce' | 'merge' | 'dance' | 'fight';
  duration: number;
  triggerCondition: string;
}

export interface GifStoryFrame {
  id: string;
  gifUrl: string;
  narrative: string;
  triggeredBy: 'task_completion' | 'milestone' | 'team_event' | 'time_passage';
  timestamp: Date;
  contributors: string[];
}

export interface BiometricState {
  averageHeartRate: number;
  stressLevel: number;
  focusLevel: number;
  teamSynchronization: number;
  lastUpdated: Date;
}

export interface AIGifSuggestion {
  gifData: GifData;
  confidence: number;
  reasoning: string;
  contextFactors: string[];
}

class GifService {
  private giphyApiKey: string;
  private tenorApiKey: string;
  private aiEndpoint: string;
  private biometricEndpoint: string;

  constructor() {
    this.giphyApiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';
    this.tenorApiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY || '';
    this.aiEndpoint = process.env.NEXT_PUBLIC_AI_GIF_ENDPOINT || '';
    this.biometricEndpoint = process.env.NEXT_PUBLIC_BIOMETRIC_ENDPOINT || '';
  }

  // AI-Powered GIF Intelligence
  async getAIGifSuggestions(context: {
    taskContent: string;
    userMood: string;
    timeOfDay: string;
    projectType: string;
    teamDynamics: string;
  }): Promise<AIGifSuggestion[]> {
    try {
      const response = await fetch(`${this.aiEndpoint}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
      return await response.json();
    } catch (error) {
      console.error('AI GIF suggestion failed:', error);
      return this.getFallbackSuggestions(context);
    }
  }

  // Biometric GIF Integration
  async getBiometricGifs(biometricData: {
    heartRate: number;
    stressLevel: number;
    focusLevel: number;
  }): Promise<GifData[]> {
    const gifs: GifData[] = [];

    // High stress = calming GIFs
    if (biometricData.stressLevel > 7) {
      gifs.push(...await this.searchGifs('calm ocean waves', { mood: 'calm' }));
    }

    // High heart rate = energizing GIFs
    if (biometricData.heartRate > 100) {
      gifs.push(...await this.searchGifs('energetic workout', { mood: 'excited' }));
    }

    // High focus = ambient productivity GIFs
    if (biometricData.focusLevel > 8) {
      gifs.push(...await this.searchGifs('focused coding', { mood: 'focused' }));
    }

    return gifs;
  }

  // Interactive GIF Ecosystem
  async createGifEcosystem(boardId: string): Promise<GifEcosystem> {
    const ecosystem: GifEcosystem = {
      boardId,
      activeGifs: [],
      interactions: [],
      story: [],
      biometricState: {
        averageHeartRate: 70,
        stressLevel: 5,
        focusLevel: 7,
        teamSynchronization: 0.5,
        lastUpdated: new Date()
      }
    };

    // Initialize with ambient GIFs
    ecosystem.activeGifs = await this.getAmbientGifs(boardId);
    
    // Set up default interactions
    ecosystem.interactions = this.createDefaultInteractions(ecosystem.activeGifs);

    return ecosystem;
  }

  // Collaborative GIF Storytelling
  async addStoryFrame(
    boardId: string, 
    trigger: string, 
    userId: string,
    customGif?: string
  ): Promise<GifStoryFrame> {
    const narrative = await this.generateNarrative(boardId, trigger);
    const gifUrl = customGif || await this.getStoryGif(narrative);

    const frame: GifStoryFrame = {
      id: `story-${Date.now()}`,
      gifUrl,
      narrative,
      triggeredBy: trigger as any,
      timestamp: new Date(),
      contributors: [userId]
    };

    // Save to story timeline
    await this.saveStoryFrame(boardId, frame);
    
    return frame;
  }

  // Time-Dimensional GIF Features
  async getTemporalGifs(timeContext: {
    pastProgress: number;
    currentState: string;
    futureProjections: string[];
  }): Promise<{
    past: GifData[];
    present: GifData[];
    future: GifData[];
  }> {
    return {
      past: await this.searchGifs(`nostalgic ${timeContext.pastProgress}% complete`),
      present: await this.searchGifs(timeContext.currentState),
      future: await this.searchGifs(timeContext.futureProjections.join(' '))
    };
  }

  // Multi-Sensory GIF Experiences
  async createSynestheticGif(gifData: GifData): Promise<{
    visual: string;
    audio: string;
    haptic: HapticPattern;
    scent?: string;
  }> {
    return {
      visual: gifData.url,
      audio: await this.generateSpatialAudio(gifData),
      haptic: this.createHapticPattern(gifData.intensity, gifData.mood),
      scent: this.getScentProfile(gifData.tags)
    };
  }

  // AR/VR GIF Integration
  async getARGifOverlays(cameraData: {
    position: [number, number, number];
    orientation: [number, number, number];
    lighting: string;
  }): Promise<ARGifOverlay[]> {
    // Generate 3D positioned GIFs for AR space
    return [
      {
        gifUrl: 'https://example.com/floating-task.gif',
        position: [cameraData.position[0] + 1, cameraData.position[1], cameraData.position[2]],
        scale: 1.0,
        rotation: [0, 0, 0],
        interactionType: 'tap-to-complete'
      }
    ];
  }

  // Social GIF Phenomena
  async createViralChallenge(challengeData: {
    name: string;
    description: string;
    targetGif: string;
    difficulty: number;
  }): Promise<ViralGifChallenge> {
    return {
      id: `challenge-${Date.now()}`,
      ...challengeData,
      participants: [],
      globalProgress: 0,
      trending: false,
      rewards: await this.generateChallengeRewards(challengeData.difficulty)
    };
  }

  // Utility Methods
  private async searchGifs(query: string, filters?: Partial<GifData>): Promise<GifData[]> {
    // Implementation for searching GIFs from multiple sources
    const giphyResults = await this.searchGiphy(query);
    const tenorResults = await this.searchTenor(query);
    
    return [...giphyResults, ...tenorResults].filter(gif => 
      !filters || this.matchesFilters(gif, filters)
    );
  }

  private async searchGiphy(query: string): Promise<GifData[]> {
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${this.giphyApiKey}&q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      
      return data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        title: gif.title,
        tags: gif.title.split(' '),
        mood: this.inferMood(gif.title),
        intensity: Math.floor(Math.random() * 10) + 1,
        duration: parseInt(gif.images.original.duration) || 3000,
        interactionType: 'ambient'
      }));
    } catch (error) {
      console.error('Giphy search failed:', error);
      return [];
    }
  }

  private async searchTenor(query: string): Promise<GifData[]> {
    // Similar implementation for Tenor API
    return [];
  }

  private inferMood(title: string): GifData['mood'] {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('excited') || lowerTitle.includes('party')) return 'excited';
    if (lowerTitle.includes('calm') || lowerTitle.includes('peaceful')) return 'calm';
    if (lowerTitle.includes('focus') || lowerTitle.includes('work')) return 'focused';
    if (lowerTitle.includes('stress') || lowerTitle.includes('panic')) return 'stressed';
    if (lowerTitle.includes('celebrate') || lowerTitle.includes('victory')) return 'celebratory';
    return 'calm';
  }

  private matchesFilters(gif: GifData, filters: Partial<GifData>): boolean {
    return Object.entries(filters).every(([key, value]) => 
      gif[key as keyof GifData] === value
    );
  }

  private getFallbackSuggestions(context: any): AIGifSuggestion[] {
    // Fallback suggestions when AI is unavailable
    return [
      {
        gifData: {
          id: 'fallback-1',
          url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
          title: 'Productive Typing',
          tags: ['work', 'productivity'],
          mood: 'focused',
          intensity: 6,
          duration: 2000,
          interactionType: 'motivation'
        },
        confidence: 0.7,
        reasoning: 'Generic productivity GIF',
        contextFactors: ['fallback']
      }
    ];
  }

  private async getAmbientGifs(boardId: string): Promise<GifData[]> {
    // Get subtle background GIFs for the board
    return await this.searchGifs('subtle animation background', { 
      interactionType: 'ambient',
      intensity: 3 
    });
  }

  private createDefaultInteractions(gifs: GifData[]): GifInteraction[] {
    // Create default interactions between GIFs
    return [];
  }

  private async generateNarrative(boardId: string, trigger: string): Promise<string> {
    // Generate story narrative based on board context
    return `A new chapter begins as ${trigger} unfolds...`;
  }

  private async getStoryGif(narrative: string): Promise<string> {
    // Get appropriate GIF for story narrative
    const results = await this.searchGifs(narrative);
    return results[0]?.url || 'https://media.giphy.com/media/default-story.gif';
  }

  private async saveStoryFrame(boardId: string, frame: GifStoryFrame): Promise<void> {
    // Save story frame to database
    console.log(`Saving story frame for board ${boardId}:`, frame);
  }

  private async generateSpatialAudio(gifData: GifData): Promise<string> {
    // Generate 3D audio that matches the GIF
    return `https://audio.example.com/${gifData.id}.mp3`;
  }

  private createHapticPattern(intensity: number, mood: GifData['mood']): HapticPattern {
    // Create haptic feedback pattern
    return {
      pattern: [100, 50, 100],
      intensity: intensity / 10,
      duration: 1000
    };
  }

  private getScentProfile(tags: string[]): string | undefined {
    // Map GIF tags to scent profiles
    if (tags.includes('coffee')) return 'coffee-beans';
    if (tags.includes('ocean')) return 'sea-breeze';
    if (tags.includes('pizza')) return 'italian-herbs';
    return undefined;
  }

  private async generateChallengeRewards(difficulty: number): Promise<ChallengeReward[]> {
    const baseRewards: ChallengeReward[] = [
      {
        type: 'badge',
        name: 'GIF Master',
        description: 'Completed a viral GIF challenge',
        rarity: 'common'
      }
    ];

    // Add rarer rewards for higher difficulty
    if (difficulty > 5) {
      baseRewards.push({
        type: 'gif',
        name: 'Exclusive Celebration GIF',
        description: 'Unlock a rare celebration animation',
        rarity: 'rare'
      });
    }

    if (difficulty > 8) {
      baseRewards.push({
        type: 'theme',
        name: 'Legendary Board Theme',
        description: 'Unlock an epic animated board theme',
        rarity: 'legendary'
      });
    }

    return baseRewards;
  }
}

// Supporting Interfaces
interface ARGifOverlay {
  gifUrl: string;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  interactionType: string;
}

interface HapticPattern {
  pattern: number[];
  intensity: number;
  duration: number;
}

interface ViralGifChallenge {
  id: string;
  name: string;
  description: string;
  targetGif: string;
  difficulty: number;
  participants: string[];
  globalProgress: number;
  trending: boolean;
  rewards: ChallengeReward[];
}

interface ChallengeReward {
  type: 'badge' | 'gif' | 'theme' | 'power';
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const gifService = new GifService(); 