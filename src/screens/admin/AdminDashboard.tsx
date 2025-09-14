import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { PlusCircle } from 'lucide-react';
import { type Athlete } from '../../App';
import { AthleteProfilePage } from '../../components/AthleteProfilePage';
import AdminAthleteProfile from '../../components/AdminAthleteProfile';
import BottomNav from "../../components/ui/BottomNav";

// This component defines the summary card for each athlete.
function AthleteCard({ athlete, onViewProfile }: { athlete: Athlete; onViewProfile: (athlete: Athlete) => void; }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewProfile(athlete)}>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={athlete.imageUrl} alt={athlete.name} />
          <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{athlete.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Age: {athlete.age}</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Display video URLs */}
        {athlete.videoUrls && athlete.videoUrls.length > 0 && (
          <div>
            <p className="text-sm font-medium">Videos:</p>
            <div className="flex flex-col gap-2">
              {athlete.videoUrls.map((url, index) => (
                <video key={index} src={url} controls className="w-full aspect-video rounded-md">
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAthletes = async () => {
      setIsLoading(true);
      setError(null);
      // Fetch all profiles with the role 'athlete'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'athlete');

      if (error) {
        console.error("Error fetching athletes:", error);
        setError("Could not fetch athlete data. You may not have the required permissions.");
        setAthletes([]);
      } else {
        // Map the database response to the Athlete type
        const fetchedAthletes: Athlete[] = data.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'N/A',
          age: profile.age || 0,
          sport: profile.sport || 'N/A',
          rank: profile.rank || 'Trainee',
          imageUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'A')}`,
          mobileNumber: profile.mobile_number,
          aadhaarNumber: profile.aadhaar_number,
          videoUrls: profile.video_urls || [], // Add this line
        }));
        setAthletes(fetchedAthletes);
      }
      setIsLoading(false);
    };

    fetchAthletes();
  }, []);

  const handleUpdateAthlete = (updatedAthlete: Athlete) => {
    setAthletes(currentAthletes =>
      currentAthletes.map(ath => (ath.id === updatedAthlete.id ? updatedAthlete : ath))
    );
    setSelectedAthlete(updatedAthlete);
  };

  // If an athlete is selected, show their detailed profile page.
  if (selectedAthlete) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <AthleteProfilePage
          athlete={selectedAthlete}
          onBack={() => setSelectedAthlete(null)}
          onSave={handleUpdateAthlete}
        />
        <BottomNav />
      </div>
    );
  }

  // Otherwise, show the main dashboard with the grid of athlete cards.
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="container mx-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Athlete
            </Button>
            <Button variant="destructive" onClick={onLogout}>Logout</Button>
          </div>
        </div>

        {isLoading && <p>Loading athletes...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {athletes.map(athlete => (
              <AthleteCard key={athlete.id} athlete={athlete} onViewProfile={setSelectedAthlete} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}