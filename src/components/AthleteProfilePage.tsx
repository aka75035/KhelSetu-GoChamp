import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { supabase } from "../lib/supabase";

export function AthleteProfilePage({
  athlete,
  onBack,
  showBackButton = true,
}: {
  athlete: any;
  onBack: () => void;
  showBackButton?: boolean;
}) {
  const [tab, setTab] = useState("profile");
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    if (tab === "videos") {
      setLoadingVideos(true);
      // Fetch all videos for this athlete from Supabase Storage
      Promise.all([
        supabase.storage.from("videos").list(`${athlete.id}/situps`),
        supabase.storage.from("videos").list(`${athlete.id}/pullups`),
        supabase.storage.from("videos").list(`${athlete.id}/pushups`),
      ]).then(([situps, pullups, pushups]) => {
        const allVideos = [
          ...(situps.data || []).map(v => ({ ...v, exercise: "situps" })),
          ...(pullups.data || []).map(v => ({ ...v, exercise: "pullups" })),
          ...(pushups.data || []).map(v => ({ ...v, exercise: "pushups" })),
        ].filter(v => v.name && !v.name.endsWith(".emptyFolderPlaceholder"));
        setVideos(allVideos);
        setLoadingVideos(false);
      });
    }
  }, [tab, athlete.id]);

  return (
    <div>
      {showBackButton && (
        <button onClick={onBack} className="mb-4 text-blue-600 underline">Back</button>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{athlete.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Age: {athlete.age}</p>
              <p>Sport: {athlete.sport}</p>
              <p>Rank: {athlete.rank}</p>
              <p>Mobile: {athlete.mobileNumber}</p>
              <p>Aadhaar: {athlete.aadhaarNumber}</p>
              {/* No edit fields, just display */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="videos">
          {loadingVideos ? (
            <p>Loading videos...</p>
          ) : videos.length === 0 ? (
            <p>No videos found for this athlete.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {videos.map(v => (
                <div key={v.name + v.exercise}>
                  <p className="font-semibold capitalize">{v.exercise}</p>
                  <video
                    src={supabase.storage.from('videos').getPublicUrl(`${athlete.id}/${v.exercise}/${v.name}`).publicURL}
                    controls
                    className="w-full max-w-md"
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}