import { useState, useEffect } from 'react';
import {
  UserProfile,
  EngagementRecord,
  NewEngagementDraft,
  FlowStep,
  ScoreLevel,
  ReportRecord,
  AdminUserRecord,
} from './types';
import { INITIAL_USER, SCORE_OPTIONS } from './data/constants';
import { BottomNavBar, Header } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/Screens/SplashScreen';
import { RegisterScreen } from './components/Screens/RegisterScreen';
import { HomeScreen } from './components/Screens/HomeScreen';
import { ScoreScreen } from './components/Screens/ScoreScreen';
import { FeelingScreen } from './components/Screens/FeelingScreen';
import { LocationScreen } from './components/Screens/LocationScreen';
import { AttireScreen } from './components/Screens/AttireScreen';
import { EyesScreen } from './components/Screens/EyesScreen';
import { BuildScreen } from './components/Screens/BuildScreen';
import { HairScreen } from './components/Screens/HairScreen';
import { CommentsScreen } from './components/Screens/CommentsScreen';
import { ReviewScreen } from './components/Screens/ReviewScreen';
import { ConfirmationScreen } from './components/Screens/ConfirmationScreen';
import { CreateReportScreen } from './components/Screens/CreateReportScreen';
import { ReportSummaryScreen } from './components/Screens/ReportSummaryScreen';
import { EngagementsListScreen } from './components/Screens/EngagementsListScreen';
import { EngagementDetailScreen } from './components/Screens/EngagementDetailScreen';
import { ReportsDashboard } from './components/Screens/ReportsDashboard';
import { SettingsScreen } from './components/Screens/SettingsScreen';
import { TriggersScreen } from './components/Screens/TriggersScreen';
import { AdminScreen } from './components/Screens/AdminScreen';
import { requireSupabase, supabase } from './lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const EMPTY_DRAFT: NewEngagementDraft = {
  score: null,
  feelings: [],
  feelingsOther: '',
  locations: [],
  locationsOther: '',
  attire: [],
  attireOther: '',
  eyesWentTo: [],
  eyesOther: '',
  herBuild: [],
  herBuildOther: '',
  hairColor: '',
  hairColorOther: '',
  comments: '',
  triggers: [],
};

const EMPTY_ENGAGEMENT: EngagementRecord = {
  id: '',
  timestamp: '',
  dateStr: '',
  timeStr: '',
  score: 1,
  scoreLabel: '',
  feelings: [],
  locations: [],
  attire: [],
  eyesWentTo: [],
  herBuild: [],
  hairColor: '',
  comments: '',
  triggers: [],
};

const asStringArray = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

const asTriggers = (value: unknown) => (Array.isArray(value)
  ? value.filter((item): item is { trigger: string; comment: string } => Boolean(item && typeof item.trigger === 'string'))
  : []);

const profileFromRow = (row: any, email: string): UserProfile => ({
  name: row?.name || email.split('@')[0],
  phone: row?.phone || '',
  email,
  accountabilityEmail: row?.accountability_email || '',
  isRegistered: true,
  joinedDate: row?.joined_date || new Date().toLocaleDateString('en-US'),
});

const engagementFromRow = (row: any): EngagementRecord => ({
  id: row.id,
  timestamp: row.timestamp,
  dateStr: row.date_str,
  timeStr: row.time_str,
  score: row.score,
  scoreLabel: row.score_label,
  feelings: asStringArray(row.feelings),
  locations: asStringArray(row.locations),
  attire: asStringArray(row.attire),
  eyesWentTo: asStringArray(row.eyes_went_to),
  herBuild: asStringArray(row.her_build),
  hairColor: row.hair_color,
  comments: row.comments,
  triggers: asTriggers(row.triggers),
});

const reportFromRow = (row: any): ReportRecord => ({
  id: row.id,
  createdAt: row.created_at,
  startDate: row.start_date,
  endDate: row.end_date,
  emailToSend: row.email_to_send,
  secondaryEmailToSend: row.secondary_email_to_send,
  phoneToSend: row.phone_to_send,
  generalComments: row.general_comments,
  triggers: asTriggers(row.triggers),
});

export default function App() {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auth modal popup opens automatically on startup with app logo, Get Started, and under it Log In & Sign Up
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(true);
  const [authModalInitialView, setAuthModalInitialView] = useState<'welcome' | 'login' | 'signup'>('welcome');

  const [engagements, setEngagements] = useState<EngagementRecord[]>([]);

  const [currentStep, setCurrentStep] = useState<FlowStep>('home');
  const [draft, setDraft] = useState<NewEngagementDraft>(EMPTY_DRAFT);
  const [lastLoggedEngagement, setLastLoggedEngagement] = useState<EngagementRecord | null>(
    engagements[0] || null
  );
  const [selectedEngagement, setSelectedEngagement] = useState<EngagementRecord>(EMPTY_ENGAGEMENT);

  const [startDate, setStartDate] = useState<string>('2025-04-24');
  const [endDate, setEndDate] = useState<string>('2025-05-24');
  const [lastReport, setLastReport] = useState<ReportRecord | null>(null);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [adminUsers] = useState<AdminUserRecord[]>([]);
  const [authError, setAuthError] = useState('');

  const hydrateUser = async (authUser: { id: string; email?: string | null }) => {
    const client = requireSupabase();
    const [profileResult, engagementsResult, reportsResult] = await Promise.all([
      client.from('profiles').select('*').eq('id', authUser.id).single(),
      client.from('engagements').select('*').eq('user_id', authUser.id).order('timestamp', { ascending: false }),
      client.from('reports').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (engagementsResult.error) throw engagementsResult.error;
    if (reportsResult.error) throw reportsResult.error;
    const nextUser = profileFromRow(profileResult.data, authUser.email || '');
    const nextEngagements = (engagementsResult.data || []).map(engagementFromRow);
    const nextReports = (reportsResult.data || []).map(reportFromRow);
    setUser(nextUser);
    setEngagements(nextEngagements);
    setReports(nextReports);
    setLastReport(nextReports[0] || null);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAuthError(error.message);
        return;
      }
      if (data.session?.user) void hydrateUser(data.session.user).catch((loadError) => setAuthError(loadError.message));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void hydrateUser(session.user).catch((loadError) => setAuthError(loadError.message));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Auth Handlers
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login did not return a user session.');
    await hydrateUser(data.user);
    setAuthError('');
    setIsAuthModalOpen(false);
    if (currentStep === 'register' || currentStep === 'splash') {
      setCurrentStep('home');
    }
  };

  const handleSignUp = async (name: string, phone: string, email: string, password: string) => {
    const { data, error } = await requireSupabase().auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) throw new Error(error.message);
    if (!data.user || !data.session) throw new Error('Check your email to confirm your account, then log in.');
    await hydrateUser(data.user);
    setAuthError('');
    setIsAuthModalOpen(false);
    if (currentStep === 'register' || currentStep === 'splash') {
      setCurrentStep('home');
    }
  };

  const handleLogout = () => {
    void requireSupabase().auth.signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setEngagements([]);
    setReports([]);
    setLastReport(null);
    setIsAuthModalOpen(true);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUser(profile);
    void requireSupabase().auth.getUser().then(({ data, error }) => {
      if (error || !data.user) throw error || new Error('You are not signed in.');
      return requireSupabase().from('profiles').update({
        name: profile.name,
        phone: profile.phone,
        accountability_email: profile.accountabilityEmail,
      }).eq('id', data.user.id);
    }).then(({ error }) => {
      if (error) window.alert(error.message);
    }).catch((error) => window.alert(error.message));
  };

  // Handlers for logging flow
  const handleStartLogging = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setDraft(EMPTY_DRAFT);
    setCurrentStep('score');
  };

  const handleSelectScore = (score: ScoreLevel) => {
    setDraft((prev) => ({ ...prev, score }));
  };

  const handleToggleFeeling = (feeling: string) => {
    setDraft((prev) => {
      const exists = prev.feelings.includes(feeling);
      return {
        ...prev,
        feelings: exists
          ? prev.feelings.filter((f) => f !== feeling)
          : [...prev.feelings, feeling],
      };
    });
  };

  const handleToggleLocation = (loc: string) => {
    setDraft((prev) => {
      const exists = prev.locations.includes(loc);
      return {
        ...prev,
        locations: exists
          ? prev.locations.filter((l) => l !== loc)
          : [...prev.locations, loc],
      };
    });
  };

  const handleToggleAttire = (attire: string) => {
    setDraft((prev) => {
      const exists = prev.attire.includes(attire);
      return {
        ...prev,
        attire: exists
          ? prev.attire.filter((a) => a !== attire)
          : [...prev.attire, attire],
      };
    });
  };

  const handleToggleEyes = (eyeTarget: string) => {
    setDraft((prev) => {
      const exists = prev.eyesWentTo.includes(eyeTarget);
      return {
        ...prev,
        eyesWentTo: exists
          ? prev.eyesWentTo.filter((e) => e !== eyeTarget)
          : [...prev.eyesWentTo, eyeTarget],
      };
    });
  };

  const handleToggleBuild = (build: string) => {
    setDraft((prev) => {
      const exists = prev.herBuild.includes(build);
      return {
        ...prev,
        herBuild: exists
          ? prev.herBuild.filter((b) => b !== build)
          : [...prev.herBuild, build],
      };
    });
  };

  const handleSelectHair = (color: string) => {
    setDraft((prev) => ({ ...prev, hairColor: color }));
  };

  const handleSubmitEngagement = async () => {
    const now = new Date();
    const scoreObj = SCORE_OPTIONS.find((s) => s.level === (draft.score || 2));
    const scoreLabel = scoreObj ? scoreObj.title : '2 – LOOK';

    // Format fields with other text
    const formatItems = (items: string[], other: string) => {
      const res = [...items];
      if (res.includes('OTHER') && other.trim()) {
        const idx = res.indexOf('OTHER');
        res[idx] = other.trim();
      }
      return res.length > 0 ? res : ['General'];
    };

    const finalFeelings = formatItems(draft.feelings, draft.feelingsOther);
    const finalLocations = formatItems(draft.locations, draft.locationsOther);
    const finalAttire = formatItems(draft.attire, draft.attireOther);
    const finalEyes = formatItems(draft.eyesWentTo, draft.eyesOther);
    const finalBuild = formatItems(draft.herBuild, draft.herBuildOther);
    const finalHair =
      draft.hairColor === 'OTHER' && draft.hairColorOther.trim()
        ? draft.hairColorOther.trim()
        : draft.hairColor || 'Brown / Auburn';

    const newRecord: EngagementRecord = {
      id: `eng-${Date.now()}`,
      timestamp: now.toISOString(),
      dateStr: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      timeStr: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      score: (draft.score as ScoreLevel) || 2,
      scoreLabel,
      feelings: finalFeelings,
      locations: finalLocations,
      attire: finalAttire,
      eyesWentTo: finalEyes,
      herBuild: finalBuild,
      hairColor: finalHair,
      comments: draft.comments.trim() || 'Visual engagement logged.',
      triggers: draft.triggers,
    };

    try {
      const { data, error } = await requireSupabase()
        .from('engagements')
        .insert({
          user_id: (await requireSupabase().auth.getUser()).data.user?.id,
          timestamp: newRecord.timestamp,
          date_str: newRecord.dateStr,
          time_str: newRecord.timeStr,
          score: newRecord.score,
          score_label: newRecord.scoreLabel,
          feelings: newRecord.feelings,
          locations: newRecord.locations,
          attire: newRecord.attire,
          eyes_went_to: newRecord.eyesWentTo,
          her_build: newRecord.herBuild,
          hair_color: newRecord.hairColor,
          comments: newRecord.comments,
          triggers: newRecord.triggers,
        })
        .select()
        .single();
      if (error) throw error;
      const savedRecord = engagementFromRow(data);
      setEngagements((prev) => [savedRecord, ...prev]);
      setLastLoggedEngagement(savedRecord);
      setSelectedEngagement(savedRecord);
      setCurrentStep('confirmation');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The engagement could not be saved.');
    }
  };

  const handleDeleteEngagement = (id: string) => {
    if (window.confirm('Delete this engagement log?')) {
      void requireSupabase().from('engagements').delete().eq('id', id).then(({ error }) => {
        if (error) {
          window.alert(error.message);
          return;
        }
        setEngagements((prev) => prev.filter((e) => e.id !== id));
      });
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset data to the reference sample engagements?')) {
      alert('Sample data is no longer available for real accounts.');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL engagement logs?')) {
      void requireSupabase().auth.getUser().then(({ data: authData, error: authError }) => {
        if (authError || !authData.user) throw authError || new Error('You are not signed in.');
        return requireSupabase().from('engagements').delete().eq('user_id', authData.user.id);
      }).then(({ error }) => {
        if (error) {
          window.alert(error.message);
          return;
        }
        setEngagements([]);
        alert('All engagement logs cleared.');
      });
    }
  };

  const handleImportData = (newEngagements: EngagementRecord[]) => {
    void requireSupabase().auth.getUser().then(({ data: authData, error: authError }) => {
      if (authError || !authData.user) throw authError || new Error('You are not signed in.');
      return Promise.all(newEngagements.map((engagement) => requireSupabase().from('engagements').insert({
        user_id: authData.user.id,
        timestamp: engagement.timestamp,
        date_str: engagement.dateStr,
        time_str: engagement.timeStr,
        score: engagement.score,
        score_label: engagement.scoreLabel,
        feelings: engagement.feelings,
        locations: engagement.locations,
        attire: engagement.attire,
        eyes_went_to: engagement.eyesWentTo,
        her_build: engagement.herBuild,
        hair_color: engagement.hairColor,
        comments: engagement.comments,
        triggers: engagement.triggers,
      })));
    }).then(() => setEngagements(newEngagements)).catch((error) => window.alert(error.message));
  };

  // Render specific active step screen
  const renderScreen = () => {
    switch (currentStep) {
      case 'splash':
        return (
          <SplashScreen
            onGetStarted={() => setCurrentStep('register')}
            onLogIn={() => {
              setAuthModalInitialView('login');
              setIsAuthModalOpen(true);
            }}
            onSignUp={() => setCurrentStep('register')}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            user={user}
            onSaveProfile={handleSaveProfile}
            onContinue={() => setCurrentStep('home')}
          />
        );

      case 'home':
        return (
          <HomeScreen
            user={user}
            engagements={engagements}
            onStartLogging={handleStartLogging}
            onCreateReport={() => setCurrentStep('create_report')}
            onViewReports={() => setCurrentStep('report_summary')}
            onOpenMenu={() => {
              setAuthModalInitialView('welcome');
              setIsAuthModalOpen(true);
            }}
          />
        );

      case 'score':
        return (
          <ScoreScreen
            selectedScore={draft.score}
            onSelectScore={handleSelectScore}
            onNext={() => setCurrentStep('feeling')}
            onBack={() => setCurrentStep('home')}
          />
        );

      case 'feeling':
        return (
          <FeelingScreen
            selectedFeelings={draft.feelings}
            otherText={draft.feelingsOther}
            onToggleFeeling={handleToggleFeeling}
            onChangeOther={(t) => setDraft((p) => ({ ...p, feelingsOther: t }))}
            onNext={() => setCurrentStep('location')}
            onBack={() => setCurrentStep('score')}
          />
        );

      case 'location':
        return (
          <LocationScreen
            selectedLocations={draft.locations}
            otherText={draft.locationsOther}
            onToggleLocation={handleToggleLocation}
            onChangeOther={(t) => setDraft((p) => ({ ...p, locationsOther: t }))}
            onNext={() => setCurrentStep('attire')}
            onBack={() => setCurrentStep('feeling')}
          />
        );

      case 'attire':
        return (
          <AttireScreen
            selectedAttire={draft.attire}
            otherText={draft.attireOther}
            onToggleAttire={handleToggleAttire}
            onChangeOther={(t) => setDraft((p) => ({ ...p, attireOther: t }))}
            onNext={() => setCurrentStep('eyes')}
            onBack={() => setCurrentStep('location')}
          />
        );

      case 'eyes':
        return (
          <EyesScreen
            selectedEyes={draft.eyesWentTo}
            otherText={draft.eyesOther}
            onToggleEyes={handleToggleEyes}
            onChangeOther={(t) => setDraft((p) => ({ ...p, eyesOther: t }))}
            onNext={() => setCurrentStep('build')}
            onBack={() => setCurrentStep('attire')}
          />
        );

      case 'build':
        return (
          <BuildScreen
            selectedBuilds={draft.herBuild}
            otherText={draft.herBuildOther}
            onToggleBuild={handleToggleBuild}
            onChangeOther={(t) => setDraft((p) => ({ ...p, herBuildOther: t }))}
            onNext={() => setCurrentStep('hair')}
            onBack={() => setCurrentStep('eyes')}
          />
        );

      case 'hair':
        return (
          <HairScreen
            selectedHair={draft.hairColor}
            otherText={draft.hairColorOther}
            onSelectHair={handleSelectHair}
            onChangeOther={(t) => setDraft((p) => ({ ...p, hairColorOther: t }))}
            onNext={() => setCurrentStep('comments')}
            onBack={() => setCurrentStep('build')}
          />
        );

      case 'comments':
        return (
          <CommentsScreen
            comments={draft.comments}
            onChangeComments={(t) => setDraft((p) => ({ ...p, comments: t }))}
            onNext={() => setCurrentStep('review')}
            onBack={() => setCurrentStep('hair')}
          />
        );

      case 'triggers':
        return (
          <TriggersScreen
            selectedTriggers={draft.triggers}
            onToggleTrigger={(trigger) =>
              setDraft((prev) => ({
                ...prev,
                triggers: prev.triggers.some((entry) => entry.trigger === trigger)
                  ? prev.triggers.filter((entry) => entry.trigger !== trigger)
                  : [...prev.triggers, { trigger, comment: '' }],
              }))
            }
            onChangeComment={(trigger, comment) =>
              setDraft((prev) => ({
                ...prev,
                triggers: prev.triggers.map((entry) =>
                  entry.trigger === trigger ? { ...entry, comment } : entry
                ),
              }))
            }
            onNext={() => setCurrentStep('review')}
            onBack={() => setCurrentStep('comments')}
          />
        );

      case 'review':
        return (
          <ReviewScreen
            draft={draft}
            onEdit={(stepName) => setCurrentStep((stepName as FlowStep) || 'score')}
            onSubmit={handleSubmitEngagement}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationScreen
            lastEngagement={lastLoggedEngagement}
            onHome={() => setCurrentStep('home')}
            onViewReports={() => setCurrentStep('report_summary')}
            onLogAnother={handleStartLogging}
          />
        );

      case 'create_report':
        return (
          <CreateReportScreen
            user={user}
            startDate={startDate}
            endDate={endDate}
            onUpdateDates={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
            onGenerateReport={(emailToSend, secondaryEmailToSend, phoneToSend, generalComments, reportTriggers) => {
              void (async () => {
                const reportInput = {
                  start_date: startDate,
                  end_date: endDate,
                  email_to_send: emailToSend.trim(),
                  secondary_email_to_send: secondaryEmailToSend.trim(),
                  phone_to_send: phoneToSend,
                  general_comments: generalComments.trim(),
                  triggers: reportTriggers.length
                    ? reportTriggers
                    : engagements.flatMap((engagement) => engagement.triggers || []),
                };
                try {
                  const client = requireSupabase();
                  const { data: authData, error: authError } = await client.auth.getUser();
                  if (authError || !authData.user) throw authError || new Error('You are not signed in.');
                  const { data, error } = await client.from('reports').insert({
                    ...reportInput,
                    user_id: authData.user.id,
                  }).select().single();
                  if (error) throw error;
                  const report = reportFromRow(data);
                  const response = await fetch(`${API_BASE_URL}/api/send-report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ report, user }),
                  });
                  if (!response.ok) {
                    const body = await response.json().catch(() => ({}));
                    throw new Error(body.error || 'The report email could not be sent.');
                  }
                  await client.from('profiles').update({ accountability_email: report.emailToSend }).eq('id', authData.user.id);
                  setUser((currentUser) => ({ ...currentUser, accountabilityEmail: report.emailToSend }));
                  setLastReport(report);
                  setReports((previous) => [report, ...previous]);
                  setCurrentStep('report_summary');
                } catch (error) {
                  window.alert(`Report was not sent: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              })();
            }}
            onBack={() => setCurrentStep('home')}
          />
        );

      case 'report_summary':
        return (
          <ReportSummaryScreen
            user={user}
            engagements={engagements}
            onCreateReport={() => setCurrentStep('create_report')}
            startDate={lastReport?.startDate || startDate}
            endDate={lastReport?.endDate || endDate}
            reports={reports}
            generalComments={lastReport?.generalComments || ''}
            triggerEntries={lastReport?.triggers || []}
            onBack={() => setCurrentStep('create_report')}
            onViewEngagements={() => setCurrentStep('engagements_list')}
            onSelectEngagement={(item) => {
              setSelectedEngagement(item);
              setCurrentStep('engagement_detail');
            }}
          />
        );

      case 'engagements_list':
        return (
          <EngagementsListScreen
            engagements={engagements}
            onBack={() => setCurrentStep('report_summary')}
            onSelectEngagement={(item) => {
              setSelectedEngagement(item);
              setCurrentStep('engagement_detail');
            }}
          />
        );

      case 'engagement_detail':
        return (
          <EngagementDetailScreen
            engagement={selectedEngagement || engagements[0]}
            onBack={() => setCurrentStep('engagements_list')}
            onEdit={() => setCurrentStep('comments')}
          />
        );

      case 'reports':
        return (
          <ReportsDashboard
            user={user}
            engagements={engagements}
            startDate={startDate}
            endDate={endDate}
            onSetDates={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
            onSelectNewEngagement={handleStartLogging}
            onDeleteEngagement={handleDeleteEngagement}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            user={user}
            engagements={engagements}
            onSaveProfile={handleSaveProfile}
            onResetSampleData={handleResetSampleData}
            onClearAllData={handleClearAllData}
            onImportData={handleImportData}
            onLogout={handleLogout}
          />
        );

      case 'admin':
        return <AdminScreen users={adminUsers} engagements={engagements} reports={reports} onLogout={() => setCurrentStep('home')} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-24 relative overflow-x-hidden">
      {/* Application Watermark with exactly 5% Opacity */}
      <div
        id="app-global-watermark"
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none"
      >
        <img
          src="/Logo+lookaway.png"
          alt=""
          className="w-[min(85vw,650px)] max-h-[75vh] object-contain pointer-events-none"
          style={{ opacity: 0.05 }}
        />
      </div>

      {/* Auth Modal Popup: Opens on start with App Logo, GET STARTED, and under it LOG IN & SIGN UP */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={user}
        initialView={authModalInitialView}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />

      {/* Shared app surface for web, Android, and iOS */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-2 sm:px-4 py-1 transition-all duration-300">
        <Header
          user={user}
          currentStep={currentStep}
          viewMode="web"
          onSetViewMode={() => undefined}
          onNavigate={(step) => setCurrentStep(step)}
          streakDays={7}
          isAuthenticated={isAuthenticated}
          onOpenAuthModal={() => {
            setAuthModalInitialView('welcome');
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenAdmin={() => setCurrentStep('admin')}
        />

        <main className="native-app-content relative w-full overflow-hidden">
          <img
            src="/Logo+lookaway.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 m-auto w-[min(75vw,560px)] max-h-[75vh] object-contain pointer-events-none"
            style={{ opacity: 0.05 }}
          />
          <div className="relative z-10">{renderScreen()}</div>
        </main>

        {/* Footer Note */}
        <div className="text-center text-[#777e80] text-xs font-semibold mt-1 mb-2 select-none">
          Look Away • Your data is secured in your account.
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavBar
        currentStep={currentStep}
        onNavigate={(step) => setCurrentStep(step)}
        onOpenAdmin={() => setCurrentStep('admin')}
      />
    </div>
  );
}
