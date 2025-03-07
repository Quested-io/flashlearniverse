
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Flashcard from '@/components/Flashcard';
import { useStudySets, StudySet } from '@/hooks/useStudySets';

const StudySetPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getStudySet } = useStudySets();
  
  const [studySet, setStudySet] = useState<StudySet | undefined>(undefined);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchedSet = getStudySet(id);
      if (fetchedSet) {
        setStudySet(fetchedSet);
      } else {
        toast({
          title: 'Study set not found',
          description: 'The requested study set could not be found',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
    setLoading(false);
  }, [id, getStudySet, navigate, toast]);

  const goToNextCard = () => {
    if (studySet && currentCardIndex < studySet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const shuffleCards = () => {
    if (!studySet) return;
    
    toast({
      title: 'Cards shuffled',
      description: 'The flashcards have been shuffled randomly',
    });
    
    // Create a new study set with shuffled cards
    const shuffledSet = { ...studySet };
    shuffledSet.cards = [...studySet.cards].sort(() => Math.random() - 0.5);
    setStudySet(shuffledSet);
    setCurrentCardIndex(0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse h-8 w-48 bg-muted rounded mb-8 mx-auto"></div>
        <div className="animate-pulse h-[200px] sm:h-[250px] max-w-lg mx-auto bg-muted rounded"></div>
      </div>
    );
  }

  if (!studySet) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Study Set Not Found</h1>
        <p className="mb-6 text-muted-foreground">The study set you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">{studySet.title}</h1>
        {studySet.description && (
          <p className="text-muted-foreground mt-1">{studySet.description}</p>
        )}
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {studySet.cards.length}
        </div>
        <Button variant="outline" onClick={shuffleCards} className="gap-2">
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto mb-8">
        <Flashcard
          term={studySet.cards[currentCardIndex].term}
          definition={studySet.cards[currentCardIndex].definition}
          index={currentCardIndex}
        />
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={goToPreviousCard}
          disabled={currentCardIndex === 0}
          variant="outline"
          className="w-[120px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={goToNextCard}
          disabled={currentCardIndex === studySet.cards.length - 1}
          className="w-[120px] bg-brand-purple hover:bg-brand-purple-dark"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StudySetPage;
