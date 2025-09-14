import { supabase } from '../../lib/supabase';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { PlusCircle } from 'lucide-react';
import { type Athlete } from '../../App';
import { AthleteProfilePage } from '../../components/AthleteProfilePage';
import BottomNav from "../../components/ui/BottomNav";
import { Input } from '../../components/ui/input';
import Header from '../../components/ui/Header';

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
        {/* Casting to any to access videoUrls if it exists, to prevent TS errors for now */}
        {(athlete as any).videoUrls && (athlete as any).videoUrls.length > 0 && (
          <div>
            <p className="text-sm font-medium">Videos:</p>
            <div className="flex flex-col gap-2">
              {(athlete as any).videoUrls.map((url: string, index: number) => (
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
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchAthletes = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'athlete');

      if (error) {
        console.error("Error fetching athletes:", error);
        setError("Could not fetch athlete data.");
        setAthletes([]);
      } else {
        const fetchedAthletes: Athlete[] = data.map((profile: any) => ({
          id: profile.id,
          aadhar_card_number: profile.aadhar_card_number,
          name: profile.full_name || 'N/A',
          age: profile.age || 0,
          sport: profile.sport || 'N/A',
          rank: profile.rank || 'Trainee',
          imageUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'A')}`,
        }));
        setAthletes(fetchedAthletes);
      }
      setIsLoading(false);
    };

    fetchAthletes();
  }, []);

  const handleUpdateAthlete = (updatedAthlete: Athlete) => {
    setAthletes(currentAthletes =>
      currentAthletes.map(ath => (ath.aadhar_card_number === updatedAthlete.aadhar_card_number ? updatedAthlete : ath))
    );
    setSelectedAthlete(updatedAthlete);
  };

  const handleViewProfile = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (selectedAthlete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AthleteProfilePage
          athlete={selectedAthlete}
          onBack={() => setSelectedAthlete(null)}
          onSave={handleUpdateAthlete}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <Header title="Admin Dashboard" onLogout={handleLogout} />
      <main style={{paddingTop: '75px'}} className="pb-20"> {/* Padding top for header, padding bottom for footer */}
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Admin dashboard</h2>
            {/* <Button onClick={() => alert('Add Athlete functionality not implemented yet.')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Athlete
            </Button> */}
          </div>
          <div className="mb-6">
            <Input
              placeholder="Search athletes..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {isLoading ? (
            <div className="text-center py-10">
              <p>Loading athletes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAthletes.map(athlete => (
                <AthleteCard key={athlete.aadhar_card_number} athlete={athlete} onViewProfile={handleViewProfile} />
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}