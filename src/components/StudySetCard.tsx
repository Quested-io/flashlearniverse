
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, Clock } from 'lucide-react';

interface StudySetCardProps {
  id: string;
  title: string;
  cardCount: number;
  creator: string;
  lastUpdated: string;
}

const StudySetCard = ({ id, title, cardCount, creator, lastUpdated }: StudySetCardProps) => {
  return (
    <Link to={`/study/${id}`}>
      <Card className="h-full hover:border-brand-purple hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">{cardCount} cards</p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bookmark className="h-3 w-3" />
            <span>{creator}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{lastUpdated}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default StudySetCard;
