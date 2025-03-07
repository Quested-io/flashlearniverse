
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudySets } from '@/hooks/useStudySets';
import StudySetCard from '@/components/StudySetCard';

const Dashboard = () => {
  const { studySets, loading } = useStudySets();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Study Sets</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : (
            <>
              {studySets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studySets.map((set) => (
                    <StudySetCard
                      key={set.id}
                      id={set.id}
                      title={set.title}
                      cardCount={set.cards.length}
                      creator={set.creator}
                      lastUpdated={set.updatedAt}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No study sets yet</h3>
                  <p className="text-muted-foreground">Create your first study set to get started</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studySets.slice(0, 3).map((set) => (
                <StudySetCard
                  key={set.id}
                  id={set.id}
                  title={set.title}
                  cardCount={set.cards.length}
                  creator={set.creator}
                  lastUpdated={set.updatedAt}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
