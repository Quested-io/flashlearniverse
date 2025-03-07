
import { useState, useEffect } from 'react';

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

  // Load sample data if no data exists in localStorage
  useEffect(() => {
    if (studySets.length === 0) {
      // Simulate API call with timeout
      const timer = setTimeout(() => {
        setStudySets(sampleStudySets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleStudySets));
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [studySets.length]);

  // Update localStorage whenever studySets change
  useEffect(() => {
    if (!loading && studySets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studySets));
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
    
    const updatedSets = [...studySets, newStudySet];
    setStudySets(updatedSets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
    return newStudySet.id;
  };

  return {
    studySets,
    loading,
    getStudySet,
    addStudySet,
  };
};
