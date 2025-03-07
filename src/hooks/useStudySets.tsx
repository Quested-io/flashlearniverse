
import { useState, useEffect } from 'react';
import { QuestConfig, trackConfigChanged, QuestCard, getUserStudySets, saveUserStudySets } from '@/lib/quested';

// Type definitions
export interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export interface StudySet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  creator: string;
  createdAt: string;
  updatedAt: string;
  questConfig?: QuestConfig;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

// Sample data
const sampleStudySets: StudySet[] = [
  {
    id: '1',
    title: 'Basic Spanish Vocabulary',
    description: 'Common Spanish words and phrases for beginners',
    creator: 'Language Learner',
    createdAt: '2023-09-15',
    updatedAt: '2023-10-05',
    cards: [
      { id: '101', term: 'Hola', definition: 'Hello' },
      { id: '102', term: 'Adiós', definition: 'Goodbye' },
      { id: '103', term: 'Por favor', definition: 'Please' },
      { id: '104', term: 'Gracias', definition: 'Thank you' },
      { id: '105', term: 'Lo siento', definition: 'I am sorry' },
    ],
  },
  {
    id: '2',
    title: 'Biology 101: Cell Structure',
    description: 'Key terms related to cell biology',
    creator: 'Science Student',
    createdAt: '2023-08-20',
    updatedAt: '2023-09-12',
    cards: [
      { id: '201', term: 'Mitochondria', definition: 'Powerhouse of the cell, responsible for cellular respiration' },
      { id: '202', term: 'Nucleus', definition: 'Control center of the cell containing genetic material' },
      { id: '203', term: 'Ribosome', definition: 'Cellular structures where proteins are synthesized' },
      { id: '204', term: 'Endoplasmic Reticulum', definition: 'Network of membranes involved in protein and lipid synthesis' },
      { id: '205', term: 'Golgi Apparatus', definition: 'Organelle that processes and packages proteins for secretion' },
      { id: '206', term: 'Lysosome', definition: 'Digestive organelle containing enzymes to break down waste materials' },
    ],
  },
  {
    id: '3',
    title: 'JavaScript Fundamentals',
    description: 'Essential JavaScript concepts for web development',
    creator: 'Web Dev Pro',
    createdAt: '2023-07-10',
    updatedAt: '2023-10-01',
    cards: [
      { id: '301', term: 'Variable', definition: 'A container for storing data values' },
      { id: '302', term: 'Function', definition: 'A block of code designed to perform a particular task' },
      { id: '303', term: 'Array', definition: 'A special variable that can hold more than one value' },
      { id: '304', term: 'Object', definition: 'A container for properties, each property being a key-value pair' },
      { id: '305', term: 'DOM', definition: 'Document Object Model, a programming interface for web documents' },
      { id: '306', term: 'Event Listener', definition: 'A procedure that waits for an event to occur' },
      { id: '307', term: 'Callback Function', definition: 'A function passed as an argument to another function' },
    ],
  },
];

// Local storage key
const STORAGE_KEY = 'flashlearn_study_sets';

export const useStudySets = () => {
  // Initialize with data from localStorage or sample data
  const [studySets, setStudySets] = useState<StudySet[]>(() => {
    const storedSets = localStorage.getItem(STORAGE_KEY);
    return storedSets ? JSON.parse(storedSets) : [];
  });
  const [loading, setLoading] = useState(true);

  // Load data from both localStorage and Quested - only on initial mount
  useEffect(() => {
    const loadStudySets = async () => {
      let sets: StudySet[] = [];
      
      // First check localStorage
      const storedSets = localStorage.getItem(STORAGE_KEY);
      if (storedSets) {
        sets = JSON.parse(storedSets);
      }
      
      // Then try to get from Quested if available and no sets in localStorage
      if (sets.length === 0) {
        try {
          const questedSets = await getUserStudySets();
          if (questedSets && questedSets.sets) {
            // Convert Quested sets to StudySet format
            const questedStudySets = Object.entries(questedSets.sets).map(([id, set]) => {
              return {
                id,
                title: set.title,
                description: set.description || '',
                cards: set.cards.map((card, index) => ({
                  id: `quest-card-${index}`,
                  term: card.term,
                  definition: card.definition
                })),
                creator: 'Quested',
                createdAt: set.createdAt,
                updatedAt: set.createdAt,
              } as StudySet;
            });
            
            sets = questedStudySets;
          }
        } catch (error) {
          console.error('Failed to load study sets from Quested:', error);
        }
      }
      
      // If still no sets, use sample data
      if (sets.length === 0) {
        sets = [...sampleStudySets];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
      }
      
      setStudySets(sets);
      setLoading(false);
    };
    
    loadStudySets();
  }, []);

  // Update localStorage whenever studySets change
  useEffect(() => {
    if (!loading && studySets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studySets));
      
      // Also save to Quested if possible
      try {
        // Convert to Quested format
        const questedSets = {
          sets: studySets.reduce((acc, set) => {
            // Only store essential data in Quested
            acc[set.id] = {
              title: set.title,
              description: set.description,
              cards: set.cards.map(card => ({
                term: card.term,
                definition: card.definition
              })),
              createdAt: set.createdAt
            };
            return acc;
          }, {} as Record<string, { title: string; description: string; cards: QuestCard[]; createdAt: string }>)
        };
        
        saveUserStudySets(questedSets);
      } catch (error) {
        console.error('Failed to save study sets to Quested:', error);
      }
    }
  }, [studySets, loading]);

  const getStudySet = (id: string) => {
    return studySets.find(set => set.id === id);
  };

  const addStudySet = (newSet: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newStudySet: StudySet = {
      ...newSet,
      id: `set-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    // If this is a Quested configured study set, track the configuration change
    if (newStudySet.questConfig) {
      // Track configuration changes for analytics only
      trackConfigChanged(newStudySet.questConfig);
    }
    
    const updatedSets = [...studySets, newStudySet];
    setStudySets(updatedSets);
    return newStudySet.id;
  };
  
  // Create a study set from a Quested configuration
  const createFromQuestConfig = (config: QuestConfig, id?: string) => {
    const now = new Date().toISOString().split('T')[0];
    
    // Map Quested cards to Flashcards
    const cards: Flashcard[] = config.cards.map((card, index) => ({
      id: `quest-card-${index}-${Date.now()}`,
      term: card.term,
      definition: card.definition
    }));
    
    const newStudySet: StudySet = {
      id: id || `quest-${Date.now()}`,
      title: config.title || 'Quested Study Set',
      description: config.description || 'Created from Quested configuration',
      cards,
      creator: 'Quested',
      createdAt: now,
      updatedAt: now,
      questConfig: config,
      difficulty: config.difficulty,
      timeLimit: config.timeLimit
    };
    
    // Track configuration change for analytics only
    trackConfigChanged(config);
    
    const updatedSets = [...studySets, newStudySet];
    setStudySets(updatedSets);
    return newStudySet.id;
  };

  return {
    studySets,
    loading,
    getStudySet,
    addStudySet,
    createFromQuestConfig,
  };
};
