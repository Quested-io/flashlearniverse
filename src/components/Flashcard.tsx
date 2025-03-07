
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

interface FlashcardProps {
  term: string;
  definition: string;
  index: number;
}

const Flashcard = ({ term, definition, index }: FlashcardProps) => {
  const [flipped, setFlipped] = useState(false);

  const toggleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div 
      className={`flashcard w-full h-[200px] sm:h-[250px] ${flipped ? 'flipped' : ''}`}
      onClick={toggleFlip}
    >
      <div className="flashcard-inner relative w-full h-full">
        {/* Front of card */}
        <Card className="flashcard-front absolute w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer border-2 hover:border-brand-purple transition-colors">
          <p className="text-xs text-muted-foreground mb-2">Card {index + 1}</p>
          <h3 className="text-xl sm:text-2xl font-medium text-center">{term}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute bottom-2 right-2 text-muted-foreground"
            onClick={(e) => { 
              e.stopPropagation();
              toggleFlip();
            }}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            <span className="text-xs">Flip</span>
          </Button>
        </Card>

        {/* Back of card */}
        <Card className="flashcard-back absolute w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer border-2 hover:border-brand-purple transition-colors">
          <p className="text-xs text-muted-foreground mb-2">Definition</p>
          <p className="text-lg sm:text-xl text-center">{definition}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute bottom-2 right-2 text-muted-foreground"
            onClick={(e) => { 
              e.stopPropagation();
              toggleFlip();
            }}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            <span className="text-xs">Flip</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Flashcard;
