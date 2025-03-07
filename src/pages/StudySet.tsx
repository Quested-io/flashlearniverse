
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shuffle, Clock, CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Flashcard from '@/components/Flashcard';
import { useStudySets, StudySet } from '@/hooks/useStudySets';
import { QuestConfig, trackActivityEnded, ActivityEndedState } from '@/lib/quested';
import { UserProfileContext } from '@/App';

const StudySetPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { getStudySet } = useStudySets();
  
  // Get user profile from context
  const userProfile = useContext(UserProfileContext);
  
  const [studySet, setStudySet] = useState<StudySet | undefined>(undefined);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const [isQuestSession, setIsQuestSession] = useState(false);
  
  // Reference to interval timer for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Track if activity is completed for quested session
  const [activityComplete, setActivityComplete] = useState(false);

  // Run once on initial mount to load study set data
  useEffect(() => {
    // Check if we have a Quested configuration in the location state
    const questConfig: QuestConfig | undefined = location.state?.questConfig;
    
    if (id) {
      if (id.startsWith('quest-') && questConfig) {
        // This is a temporary Quested session - create in-memory study set
        const tempStudySet: StudySet = {
          id: id,
          title: questConfig.title || 'Quested Study Set',
          description: questConfig.description || 'Temporary study session',
          cards: questConfig.cards.map((card, index) => ({
            id: `card-${index}`,
            term: card.term,
            definition: card.definition
          })),
          creator: 'Quested',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        // If the config specifies shuffled, pre-shuffle the cards
        const finalCards = questConfig.shuffled 
          ? [...tempStudySet.cards].sort(() => Math.random() - 0.5)
          : tempStudySet.cards;
        
        tempStudySet.cards = finalCards;
        
        setStudySet(tempStudySet);
        setIsQuestSession(true);
        
        // If there's a time limit in the quest config, set it up
        if (questConfig.timeLimit && questConfig.timeLimit > 0) {
          setTimeLeft(questConfig.timeLimit);
        }
      } else {
        // Regular study set lookup
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
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  // Timer effect for time-limited quests
  useEffect(() => {
    if (timeLeft !== undefined && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev > 0) {
            return prev - 1;
          }
          return 0;
        });
      }, 1000);
    } else if (timeLeft === 0 && !activityComplete && isQuestSession) {
      // Time's up for quest session
      handleActivityComplete('timeout');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, activityComplete, isQuestSession]);

  // Handle completion of a study activity - send to Quested
  const handleActivityComplete = (reason: 'finished' | 'timeout' | 'user_exit') => {
    if (!activityComplete && studySet) {
      setActivityComplete(true);
      
      const progressData: ActivityEndedState = {
        action: 'end',
        setId: studySet.id,
        title: studySet.title,
        cardCount: studySet.cards.length,
        progress: currentCardIndex + 1,
        completion: Math.round(((currentCardIndex + 1) / studySet.cards.length) * 100),
        timeRemaining: timeLeft,
        reason,
        timestamp: new Date().toISOString()
      };
      
      // Track activity ended for all cases
      trackActivityEnded(progressData);
      
      // For timed sessions that have ended, show notification
      if (reason === 'timeout') {
        toast({
          title: 'Time\'s up!',
          description: 'You\'ve run out of time for this study session.',
        });
      }
    }
  };

  const goToNextCard = () => {
    if (studySet && currentCardIndex < studySet.cards.length - 1) {
      const isLastCard = currentCardIndex + 1 === studySet.cards.length - 1;
      setCurrentCardIndex(currentCardIndex + 1);
      
      // If we've reached the last card, track completion for Quested
      if (isLastCard && isQuestSession && !activityComplete) {
        handleActivityComplete('finished');
      }
    } else if (studySet && currentCardIndex === studySet.cards.length - 1 && !activityComplete) {
      // Reached the end of a session
      handleActivityComplete('finished');
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
  
  // Handle exit
  const handleExit = () => {
    if (isQuestSession && !activityComplete) {
      // Track user exit for analytics only
      const exitData: ActivityEndedState = {
        action: 'exit',
        setId: studySet?.id,
        progress: currentCardIndex + 1,
        completion: studySet ? Math.round(((currentCardIndex + 1) / studySet.cards.length) * 100) : 0,
        reason: 'user_exit',
        timestamp: new Date().toISOString()
      };
      trackActivityEnded(exitData);
    }
    navigate('/');
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <Button variant="ghost" onClick={handleExit} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{studySet.title}</h1>
          {studySet.description && (
            <p className="text-muted-foreground mt-1">{studySet.description}</p>
          )}
          
          {/* Show Quested session indicator for quest sessions */}
          {isQuestSession && (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Quested Session
            </div>
          )}
        </div>
        
        {/* User profile section */}
        {userProfile && (
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border">
              {userProfile.avatar ? (
                <AvatarImage src={userProfile.avatar} alt={userProfile.name || 'User'} />
              ) : (
                <AvatarFallback>
                  <User className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userProfile.name}</p>
              {userProfile.verified ? (
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified with Quested
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {userProfile.anonymous ? 'Guest User' : 'User'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {studySet.cards.length}
          </div>
          
          {/* Show timer for timed sessions */}
          {timeLeft !== undefined && (
            <div className="flex items-center text-sm font-medium">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className={timeLeft < 10 ? "text-red-500" : ""}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
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
