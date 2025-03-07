
import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import CreateStudySet from "./pages/CreateStudySet";
import StudySet from "./pages/StudySet";
import NotFound from "./pages/NotFound";
import { initQuested, getConfigFromUrl, getPlayerProfile, QuestUserProfile } from "@/lib/quested";

const queryClient = new QueryClient();

// Quested activity ID (replace with your actual activity ID)
const ACTIVITY_ID = 'flashlearniverse-activity';

// Create a context for the user profile
import { createContext } from 'react';
export const UserProfileContext = createContext<QuestUserProfile | null>(null);

// Initialize Quested once at the application level
// This is outside the component to ensure it only runs once
const initQuestedOnce = (callback?: () => void) => {
  initQuested(ACTIVITY_ID, callback);
};

// Separate component for handling Quested configuration
const QuestConfigHandler = ({ onProfileLoaded }: { onProfileLoaded: (profile: QuestUserProfile) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Run initialization once and load user profile when ready
    initQuestedOnce(async () => {
      try {
        const profile = await getPlayerProfile();
        onProfileLoaded(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Default to anonymous user if profile fetch fails
        onProfileLoaded({
          id: `anonymous-${Date.now()}`,
          name: 'Guest User',
          anonymous: true,
          verified: false
        });
      }
    });
    
    // Check for config in URL directly, instead of relying on the SDK callback
    const config = getConfigFromUrl();
    
    if (config && !location.pathname.includes('/study/')) {
      // Generate a temporary ID for this study set
      const tempId = `quest-${Date.now()}`;
      
      console.log('Quested config detected in URL:', config);
      
      // Navigate to study page with the config
      navigate(`/study/${tempId}`, { 
        state: { 
          questConfig: config 
        }
      });
    }
  }, []);

  return null;
};

const App = () => {
  const [userProfile, setUserProfile] = useState<QuestUserProfile | null>(null);
  
  const handleProfileLoaded = (profile: QuestUserProfile) => {
    setUserProfile(profile);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProfileContext.Provider value={userProfile}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <QuestConfigHandler onProfileLoaded={handleProfileLoaded} />
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<CreateStudySet />} />
                <Route path="/study/:id" element={<StudySet />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </BrowserRouter>
        </UserProfileContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
