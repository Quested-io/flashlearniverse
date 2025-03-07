
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import FlashcardForm from '@/components/FlashcardForm';
import { useStudySets, Flashcard } from '@/hooks/useStudySets';

const CreateStudySet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addStudySet } = useStudySets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<Omit<Flashcard, 'id'>[]>([
    { term: '', definition: '' },
    { term: '', definition: '' },
  ]);

  const addCard = () => {
    setCards([...cards, { term: '', definition: '' }]);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 2) {
      toast({
        title: 'Cannot remove card',
        description: 'A study set must have at least 2 cards',
        variant: 'destructive',
      });
      return;
    }
    
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
  };

  const updateCard = (index: number, field: 'term' | 'definition', value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please add a title for your study set',
        variant: 'destructive',
      });
      return;
    }

    // Check if all cards have terms and definitions
    const emptyCards = cards.filter(card => !card.term.trim() || !card.definition.trim());
    if (emptyCards.length > 0) {
      toast({
        title: 'Incomplete cards',
        description: 'Please fill in all terms and definitions',
        variant: 'destructive',
      });
      return;
    }

    // Create the study set
    const cardsWithIds = cards.map(card => ({
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    const newSetId = addStudySet({
      title,
      description,
      cards: cardsWithIds,
      creator: 'You', // In a real app, this would come from authentication
    });

    toast({
      title: 'Study set created!',
      description: 'Your new study set is ready to use',
    });

    navigate(`/study/${newSetId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Create a New Study Set</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your study set"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description to help others understand what you're studying"
              className="w-full"
            />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Flashcards</h2>
        
        <div className="mb-6">
          {cards.map((card, index) => (
            <FlashcardForm
              key={index}
              index={index}
              term={card.term}
              definition={card.definition}
              onTermChange={(value) => updateCard(index, 'term', value)}
              onDefinitionChange={(value) => updateCard(index, 'definition', value)}
              onRemove={() => removeCard(index)}
            />
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addCard}
            className="w-full py-6 border-dashed flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span>Add Card</span>
          </Button>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-brand-purple hover:bg-brand-purple-dark">
            Create Study Set
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudySet;
