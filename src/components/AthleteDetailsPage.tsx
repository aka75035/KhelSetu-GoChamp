// filepath: src/components/AthleteDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AthleteProfilePage } from './AthleteProfilePage';
import AthleteBottomNav from './ui/AthleteBottomNav';
import { Button } from './ui/button';

const AthleteDetailsPage = ({ session, onLogout }: { session: any; onLogout: () => void }) => {
  const { athleteId } = useParams();
  const [athlete, setAthlete] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAthlete = async () => {
      if (!athleteId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', athleteId)
        .single();

      if (error) {
        console.error('Error fetching athlete:', error);
        // Handle error appropriately (e.g., redirect to a 404 page)
      } else {
        setAthlete({
          id: data.id,
          name: data.full_name || 'N/A',
          age: data.age || 0,
          sport: data.sport || 'N/A',
          rank: data.rank || 'Trainee',
          imageUrl:
            data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || 'A')}`,
          mobileNumber: data.mobile_number,
          aadhaarNumber: data.aadhaar_number,
        });
      }
    };

    fetchAthlete();
  }, [athleteId]);

  if (!athlete) {
    return <div>Loading athlete details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="container mx-auto flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold pt-4 pl-4">{athlete.name}</h1>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={onLogout} className="pt-4 pr-4">
              Logout
            </Button>
          </div>
        </div>

        {activeTab === 'profile' && (
          <AthleteProfilePage athlete={athlete} onBack={() => navigate(-1)} showBackButton={true} />
        )}

        {activeTab === 'videos' && (
          <div>
            {/* Implement the videos tab content here */}
            <h2>Videos for {athlete.name}</h2>
            {/* Add video listing and playback components */}
          </div>
        )}
      </div>
      <AthleteBottomNav active={activeTab} onNav={setActiveTab} />
    </div>
  );
};

export default AthleteDetailsPage;
