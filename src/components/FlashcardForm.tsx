
import React from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface FlashcardFormProps {
  index: number;
  term: string;
  definition: string;
  onTermChange: (value: string) => void;
  onDefinitionChange: (value: string) => void;
  onRemove: () => void;
}

const FlashcardForm = ({
  index,
  term,
  definition,
  onTermChange,
  onDefinitionChange,
  onRemove,
}: FlashcardFormProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium text-sm text-muted-foreground">
            Card {index + 1}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`term-${index}`} className="block text-sm font-medium mb-1">
              Term
            </label>
            <Input
              id={`term-${index}`}
              value={term}
              onChange={(e) => onTermChange(e.target.value)}
              placeholder="Enter term"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor={`definition-${index}`} className="block text-sm font-medium mb-1">
              Definition
            </label>
            <Textarea
              id={`definition-${index}`}
              value={definition}
              onChange={(e) => onDefinitionChange(e.target.value)}
              placeholder="Enter definition"
              className="w-full min-h-[80px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardForm;
