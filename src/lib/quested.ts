import * as Quested from '@quested/sdk';

// Define the schema for custom level configuration
export const questConfigSchema = {
  type: 'object',
  properties: {
    // Study set specific configuration
    title: { type: 'string' },
    description: { type: 'string' },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          term: { type: 'string' },
          definition: { type: 'string' }
        },
        required: ['term', 'definition']
      }
    },
    // Game specific configuration
    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
    timeLimit: { type: 'number', minimum: 0 },
    shuffled: { type: 'boolean' }
  },
  required: ['cards']
};

// Card type for flashcards
export interface QuestCard {
  term: string;
  definition: string;
}

// Quested configuration type
export interface QuestConfig {
  title?: string;
  description?: string;
  cards: QuestCard[];
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  shuffled?: boolean;
}

// User profile types
export interface QuestUserProfile {
  id: string;
  name?: string;
  avatar?: string;
  anonymous: boolean;
  verified?: boolean;
}

// User study sets type - this is the only data we persist
export interface UserStudySets {
  sets: {
    [setId: string]: {
      title: string;
      description?: string;
      cards: QuestCard[];
      createdAt: string;
    }
  };
}

export const initQuested = (
  activityId: string,
  onReady?: () => void
) => {
  if (Quested.instance) return Quested.instance;
  
  Quested.init({
    activityId,
    onReady: () => {
      if (onReady) onReady();
    }
  });
};

// Get player profile (handles both authenticated and anonymous users)
export const getPlayerProfile = async (): Promise<QuestUserProfile> => {
  if (!Quested.instance) {
    throw new Error('Quested SDK not initialized');
  }
  
  try {
    const profile = await Quested.instance.api.player.me();
    return {
      id: profile.id,
      name: profile.name || 'Player',
      avatar: profile.avatarUrl,
      anonymous: false,
      verified: true
    };
  } catch (e) {
    // Handle anonymous user
    return {
      id: `anonymous-${Date.now()}`,
      name: 'Guest User',
      anonymous: true,
      verified: false
    };
  }
};

// Track when the activity/game ends - only used for analytics, not for persistence
export interface ActivityEndedState {
  action: string;
  setId?: string;
  title?: string;
  cardCount?: number;
  progress?: number;
  completion?: number;
  timeRemaining?: number;
  reason?: 'finished' | 'timeout' | 'user_exit';
  timestamp: string;
}

export const trackActivityEnded = (gameState: ActivityEndedState) => {
  if (!Quested.instance) return;
  
  Quested.instance.api.player.trackEvent('event:activityEnded', gameState);
};

// Persist data to Quested storage
export const saveData = async <T>(key: string, data: T): Promise<boolean> => {
  if (!Quested.instance) return false;
  
  try {
    console.log('Saving data:', key, data);
    await Quested.instance.api.player.setGameProperty(key, data);
    return true;
  } catch (e) {
    console.error('Failed to save data:', e);
    return false;
  }
};

// Retrieve data from Quested storage
export const getData = async <T>(key: string): Promise<T | null> => {
  if (!Quested.instance) return null;
  
  try {
    const result = await Quested.instance.api.player.getGameProperty(key);
    return result as T;
  } catch (e) {
    console.error('Failed to retrieve data:', e);
    return null;
  }
};

// Save user study sets - the only data we actually persist
export const saveUserStudySets = async (studySets: UserStudySets): Promise<boolean> => {
  return await saveData('userStudySets', studySets);
};

// Load user study sets
export const getUserStudySets = async (): Promise<UserStudySets | null> => {
  return await getData<UserStudySets>('userStudySets');
};

// Track when quest configuration changes - for analytics only
export const trackConfigChanged = (config: QuestConfig) => {
  if (!Quested.instance) return;
  
  Quested.instance.api.player.trackEvent('quest:configChanged', config);
};

// Helper to extract config from URL
export const getConfigFromUrl = (): QuestConfig | undefined => {
  const urlParams = new URLSearchParams(window.location.search);
  const configParam = urlParams.get('config');

  if (configParam) {
    try {
      return JSON.parse(decodeURIComponent(configParam)) as QuestConfig;
    } catch (e) {
      console.error('Invalid config parameter');
      return undefined;
    }
  }
  
  return undefined;
};