
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Plus, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Navigation = () => {
  return (
    <nav className="border-b border-border py-3 px-4 md:px-6 bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-purple" />
            <span className="font-bold text-xl hidden sm:inline-block">FlashLearn</span>
          </Link>
          
          <div className="hidden md:flex items-center relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for study sets" 
              className="pl-10 w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/create">
            <Button className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
