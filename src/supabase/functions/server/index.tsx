import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Logger middleware
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize storage buckets
async function initializeBuckets() {
  const bucketName = 'make-91548b71-athlete-videos';
  const profileBucketName = 'make-91548b71-athlete-profiles';
  
  const { data: buckets } = await supabase.storage.listBuckets();
  
  if (!buckets?.some(bucket => bucket.name === bucketName)) {
    await supabase.storage.createBucket(bucketName, { public: false });
    console.log(`Created bucket: ${bucketName}`);
  }
  
  if (!buckets?.some(bucket => bucket.name === profileBucketName)) {
    await supabase.storage.createBucket(profileBucketName, { public: false });
    console.log(`Created bucket: ${profileBucketName}`);
  }
}

// Initialize buckets on startup
initializeBuckets().catch(console.error);

// Helper function to verify user authentication
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', status: 401 };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Invalid or expired token', status: 401 };
  }
  
  return { user };
}

// User registration and profile setup
app.post('/make-server-91548b71/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'athlete', profileData } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields: email, password, name' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        role,
        profile_data: profileData || {}
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    const userProfile = {
      id: data.user.id,
      email,
      name,
      role,
      profile_data: profileData || {},
      created_at: new Date().toISOString(),
      sync_status: 'synced'
    };
    
    await kv.set(`user_profile:${data.user.id}`, userProfile);
    
    console.log(`User created successfully: ${email} (${role})`);
    return c.json({ 
      user: data.user,
      profile: userProfile
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile
app.get('/make-server-91548b71/user/profile', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const profile = await kv.get(`user_profile:${authResult.user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: 'Failed to retrieve profile' }, 500);
  }
});

// Update user profile
app.put('/make-server-91548b71/user/profile', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const updates = await c.req.json();
    const existingProfile = await kv.get(`user_profile:${authResult.user.id}`);
    
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...existingProfile,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user_profile:${authResult.user.id}`, updatedProfile);
    
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Store test session data
app.post('/make-server-91548b71/tests/sessions', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const sessionData = await c.req.json();
    const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const testSession = {
      id: sessionId,
      user_id: authResult.user.id,
      test_type: sessionData.test_type,
      recorded_at: sessionData.recorded_at || new Date().toISOString(),
      duration: sessionData.duration,
      performance_metrics: sessionData.performance_metrics || {},
      ai_analysis: sessionData.ai_analysis || {},
      sync_status: 'synced',
      video_url: sessionData.video_url || null
    };

    await kv.set(`test_session:${sessionId}`, testSession);
    
    // Store in user's session list
    const userSessions = await kv.get(`user_sessions:${authResult.user.id}`) || [];
    userSessions.push(sessionId);
    await kv.set(`user_sessions:${authResult.user.id}`, userSessions);

    console.log(`Test session stored: ${sessionId} for user ${authResult.user.id}`);
    return c.json({ session: testSession });
  } catch (error) {
    console.log(`Store session error: ${error}`);
    return c.json({ error: 'Failed to store test session' }, 500);
  }
});

// Get user's test sessions
app.get('/make-server-91548b71/tests/sessions', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const sessionIds = await kv.get(`user_sessions:${authResult.user.id}`) || [];
    const sessions = [];
    
    for (const sessionId of sessionIds) {
      const session = await kv.get(`test_session:${sessionId}`);
      if (session) {
        sessions.push(session);
      }
    }

    // Sort by most recent first
    sessions.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    
    return c.json({ sessions });
  } catch (error) {
    console.log(`Get sessions error: ${error}`);
    return c.json({ error: 'Failed to retrieve test sessions' }, 500);
  }
});

// Get specific test session
app.get('/make-server-91548b71/tests/sessions/:sessionId', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const sessionId = c.req.param('sessionId');
    const session = await kv.get(`test_session:${sessionId}`);
    
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Verify user owns this session or is a coach
    const userProfile = await kv.get(`user_profile:${authResult.user.id}`);
    if (session.user_id !== authResult.user.id && userProfile?.role !== 'coach') {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json({ session });
  } catch (error) {
    console.log(`Get session error: ${error}`);
    return c.json({ error: 'Failed to retrieve session' }, 500);
  }
});

// Upload video file and get signed URL
app.post('/make-server-91548b71/upload/video', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const formData = await c.req.formData();
    const videoFile = formData.get('video') as File;
    const sessionId = formData.get('sessionId') as string;
    
    if (!videoFile || !sessionId) {
      return c.json({ error: 'Missing video file or session ID' }, 400);
    }

    const fileName = `${authResult.user.id}/${sessionId}_${Date.now()}.mp4`;
    const bucketName = 'make-91548b71-athlete-videos';

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, videoFile);

    if (error) {
      console.log(`Video upload error: ${error.message}`);
      return c.json({ error: 'Failed to upload video' }, 500);
    }

    // Create signed URL for accessing the video
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600 * 24 * 7); // 7 days expiry

    // Update test session with video URL
    const session = await kv.get(`test_session:${sessionId}`);
    if (session) {
      session.video_url = signedUrlData?.signedUrl;
      session.video_path = fileName;
      await kv.set(`test_session:${sessionId}`, session);
    }

    console.log(`Video uploaded successfully: ${fileName}`);
    return c.json({ 
      videoUrl: signedUrlData?.signedUrl,
      videoPath: fileName
    });
  } catch (error) {
    console.log(`Upload video error: ${error}`);
    return c.json({ error: 'Failed to upload video' }, 500);
  }
});

// Coach endpoints - Get athletes under a coach
app.get('/make-server-91548b71/coach/athletes', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const coachProfile = await kv.get(`user_profile:${authResult.user.id}`);
    if (coachProfile?.role !== 'coach') {
      return c.json({ error: 'Access denied - coaches only' }, 403);
    }

    // Get all athlete profiles where coach_id matches current user
    const allProfiles = await kv.getByPrefix('user_profile:');
    const athletes = allProfiles.filter(profile => 
      profile.role === 'athlete' && profile.coach_id === authResult.user.id
    );

    return c.json({ athletes });
  } catch (error) {
    console.log(`Get athletes error: ${error}`);
    return c.json({ error: 'Failed to retrieve athletes' }, 500);
  }
});

// Coach endpoints - Get athlete's test sessions
app.get('/make-server-91548b71/coach/athletes/:athleteId/sessions', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const coachProfile = await kv.get(`user_profile:${authResult.user.id}`);
    if (coachProfile?.role !== 'coach') {
      return c.json({ error: 'Access denied - coaches only' }, 403);
    }

    const athleteId = c.req.param('athleteId');
    const sessionIds = await kv.get(`user_sessions:${athleteId}`) || [];
    const sessions = [];
    
    for (const sessionId of sessionIds) {
      const session = await kv.get(`test_session:${sessionId}`);
      if (session) {
        sessions.push(session);
      }
    }

    sessions.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    
    return c.json({ sessions });
  } catch (error) {
    console.log(`Get athlete sessions error: ${error}`);
    return c.json({ error: 'Failed to retrieve athlete sessions' }, 500);
  }
});

// Sync offline data from mobile app
app.post('/make-server-91548b71/sync/offline-data', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { sessions, profile_updates } = await c.req.json();
    const syncResults = {
      synced_sessions: 0,
      failed_sessions: 0,
      profile_updated: false
    };

    // Sync test sessions
    if (sessions && Array.isArray(sessions)) {
      for (const sessionData of sessions) {
        try {
          const sessionId = sessionData.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const testSession = {
            ...sessionData,
            id: sessionId,
            user_id: authResult.user.id,
            sync_status: 'synced',
            synced_at: new Date().toISOString()
          };

          await kv.set(`test_session:${sessionId}`, testSession);
          
          // Update user's session list
          const userSessions = await kv.get(`user_sessions:${authResult.user.id}`) || [];
          if (!userSessions.includes(sessionId)) {
            userSessions.push(sessionId);
            await kv.set(`user_sessions:${authResult.user.id}`, userSessions);
          }

          syncResults.synced_sessions++;
        } catch (error) {
          console.log(`Failed to sync session: ${error}`);
          syncResults.failed_sessions++;
        }
      }
    }

    // Sync profile updates
    if (profile_updates) {
      try {
        const existingProfile = await kv.get(`user_profile:${authResult.user.id}`);
        if (existingProfile) {
          const updatedProfile = {
            ...existingProfile,
            ...profile_updates,
            updated_at: new Date().toISOString()
          };
          await kv.set(`user_profile:${authResult.user.id}`, updatedProfile);
          syncResults.profile_updated = true;
        }
      } catch (error) {
        console.log(`Failed to sync profile: ${error}`);
      }
    }

    console.log(`Sync completed for user ${authResult.user.id}: ${syncResults.synced_sessions} sessions synced`);
    return c.json({ sync_results: syncResults });
  } catch (error) {
    console.log(`Sync error: ${error}`);
    return c.json({ error: 'Failed to sync offline data' }, 500);
  }
});

// Analytics endpoint for performance trends
app.get('/make-server-91548b71/analytics/performance', async (c) => {
  try {
    const authResult = await verifyUser(c.req);
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const sessionIds = await kv.get(`user_sessions:${authResult.user.id}`) || [];
    const sessions = [];
    
    for (const sessionId of sessionIds) {
      const session = await kv.get(`test_session:${sessionId}`);
      if (session) {
        sessions.push(session);
      }
    }

    // Calculate analytics
    const analytics = {
      total_tests: sessions.length,
      test_types: {},
      performance_trends: {},
      recent_improvement: {},
      weekly_stats: {}
    };

    // Group by test type and calculate trends
    sessions.forEach(session => {
      const testType = session.test_type;
      if (!analytics.test_types[testType]) {
        analytics.test_types[testType] = 0;
      }
      analytics.test_types[testType]++;

      // Calculate performance trends per test type
      if (session.performance_metrics) {
        if (!analytics.performance_trends[testType]) {
          analytics.performance_trends[testType] = [];
        }
        analytics.performance_trends[testType].push({
          date: session.recorded_at,
          metrics: session.performance_metrics
        });
      }
    });

    return c.json({ analytics });
  } catch (error) {
    console.log(`Analytics error: ${error}`);
    return c.json({ error: 'Failed to generate analytics' }, 500);
  }
});

// Health check endpoint
app.get('/make-server-91548b71/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AthleteFlow Backend API'
  });
});

console.log('AthleteFlow backend server starting...');
Deno.serve(app.fetch);