
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Plus, BookOpen, User, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfileContext } from '@/App';

const Navigation = () => {
  const userProfile = useContext(UserProfileContext);

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
        
        <div className="flex items-center gap-4">
          <Link to="/create">
            <Button className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </Link>
          
          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8 border">
                  {userProfile?.avatar ? (
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name || 'User'} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userProfile?.name || 'Guest User'}</span>
                  {userProfile?.verified ? (
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified with Quested
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {userProfile?.anonymous ? 'Guest User' : 'User'}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/" className="w-full">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/create" className="w-full">Create Study Set</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
