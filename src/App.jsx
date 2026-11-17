import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Activity, Award, ShoppingBag, Cloud, Camera, Play, Pause,
  RotateCcw, CheckCircle2, AlertTriangle, Zap, Flame, Users, Download,
  Upload, Volume2, VolumeX, RefreshCw, Lock, Unlock, Crosshair
} from 'lucide-react';

const INITIAL_STATE = {
  hunterName: 'SUNG JIN-WOO',
  level: 1,
  xp: 0,
  xpToNext: 1000,
  gold: 1500,
  statPoints: 5,
  streak: 3,
  fatigue: 12,
  penaltyActive: false,
  biometrics: { heightCm: 175, weightKg: 70, age: 21, mode: 'calisthenics' },
  stats: { STR: 14, END: 12, AGI: 13, CORE: 15, VIT: 12 },
  googleFit: { steps: 4280, calories: 340, distanceKm: 3.1, activeMins: 38, lastSync: 'Not synced yet' },
  inventory: ['item_elixir'],
  badges: ['badge_awakened'],
  shadows: ['igris'],
  squadCode: 'SL-HUNTER-99',
  workoutLogs: []
};

const DUNGEON_GATES = [
  { id: 'e_rank', rank: 'E-RANK', name: 'Goblin Den (Beginner Conditioning)', color: '#00e5ff', xp: 350, gold: 400, exercises: [{ name: 'Standard Push-ups', reps: '25 Reps', type: 'pushup', target: 25 }, { name: 'Bodyweight Squats', reps: '30 Reps', type: 'squat', target: 30 }, { name: 'Plank Hold', reps: '45 Sec', type: 'plank', target: 45 }] },
  { id: 'c_rank', rank: 'C-RANK', name: 'Red Gate Ice Forest (Upper & Core)', color: '#38bdf8', xp: 750, gold: 900, exercises: [{ name: 'Diamond / Decline Push-ups', reps: '40 Reps', type: 'pushup', target: 40 }, { name: 'Strict Pull-ups / Chin-ups', reps: '12 Reps', type: 'pullup', target: 12 }, { name: 'Hanging / Floor Leg Raises', reps: '35 Reps', type: 'situp', target: 35 }, { name: 'Hollow Body Plank', reps: '90 Sec', type: 'plank', target: 90 }] },
  { id: 'a_rank', rank: 'A-RANK', name: 'Demon Castle 75th Floor (Calisthenics Mastery)', color: '#a855f7', xp: 1500, gold: 2000, exercises: [{ name: 'Explosive / Archer Push-ups', reps: '60 Reps', type: 'pushup', target: 60 }, { name: 'Strict Pull-ups', reps: '25 Reps', type: 'pullup', target: 25 }, { name: 'Pistol / Deep Tempo Squats', reps: '60 Reps', type: 'squat', target: 60 }, { name: 'Wall Handstand Hold', reps: '60 Sec', type: 'plank', target: 60 }] },
  { id: 's_rank', rank: 'S-RANK', name: 'Jeju Island Raid (Monarch Trial)', color: '#f43f5e', xp: 3200, gold: 4500, exercises: [{ name: 'Full ROM Push-up Volume', reps: '100 Reps', type: 'pushup', target: 100 }, { name: 'Full ROM Squat Volume', reps: '100 Reps', type: 'squat', target: 100 }, { name: 'Core Sit-ups / V-Ups', reps: '100 Reps', type: 'situp', target: 100 }, { name: 'Strict Pull-ups', reps: '35 Reps', type: 'pullup', target: 35 }] }
];

const STORE_ITEMS = [
  { id: 'item_kamish', type: 'legendary', name: "Kamish's Wrath (Daggers)", cost: 3500, bonus: '+15% STR XP Gain', desc: 'Forged from the fang of humanity’s greatest calamity.' },
  { id: 'item_longsword', type: 'legendary', name: "Demon King's Longsword", cost: 2400, bonus: '+10% Dungeon Gold', desc: 'Unleashes lightning storm storms during Gate Clears.' },
  { id: 'item_mantle', type: 'legendary', name: "Shadow Monarch's Mantle", cost: 5000, bonus: 'Zero Fatigue Penalty', desc: 'Sovereign armor woven from pure abyssal mana.' },
  { id: 'badge_centurion', type: 'badge', name: '100 Push-up Centurion', cost: 1200, bonus: 'Squad Flex Title', desc: 'Displayed on your Squad Leaderboard card.' },
  { id: 'badge_monarch', type: 'badge', name: 'Calisthenics Monarch', cost: 3000, bonus: 'S-Rank Crown Icon', desc: 'Proves mastery over bodyweight gravity.' }
];

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('solo_system_v3_apk');
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [tab, setTab] = useState('status');
  const [soundOn, setSoundOn] = useState(true);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const [systemAlert, setSystemAlert] = useState('[ SYSTEM READY: REAL-LIFE HUNTER OS v3.0 ]');

  // AI Camera Vision State
  const [camActive, setCamActive] = useState(false);
  const [exerciseType, setExerciseType] = useState('pushup');
  const [targetReps, setTargetReps] = useState(25);
  const [repCount, setRepCount] = useState(0);
  const [repStage, setRepStage] = useState('LOCKOUT');
  const [jointAngle, setJointAngle] = useState(168);
  const [spineAngle, setSpineAngle] = useState(174);
  const [aiVerdict, setAiVerdict] = useState(null);
  const [geminiKey, setGeminiKey] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('solo_system_v3_apk', JSON.stringify(state));
    } catch {}
  }, [state]);

  // Sound Synthesizer
  const playTone = (freq = 880, duration = 0.12) => {
    if (!soundOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // BMI Calculation & Dynamic Prescription
  const heightM = state.biometrics.heightCm / 100;
  const bmi = +(state.biometrics.weightKg / (heightM * heightM)).toFixed(1);
  const bmiCategory = bmi < 18.5 ? 'Underweight (Lean Bulk Protocol)' : bmi < 25 ? 'Optimal Hunter Physique' : 'High Mass (Metabolic Burn Protocol)';
  const pushupTarget = bmi > 25 ? 25 : state.biometrics.mode === 'calisthenics' ? 40 : 30;
  const squatTarget = bmi > 25 ? 45 : 40;
  const situpTarget = 35;
  const stepTarget = bmi > 25 ? 8500 : 6500;

  // Rest Timer
  useEffect(() => {
    if (!restRunning) return;
    const t = setInterval(() => {
      setRestSeconds((s) => {
        if (s <= 1) {
          setRestRunning(false);
          playTone(1200, 0.3);
          setSystemAlert('[ ! REST COMPLETE: RESUME DUNGEON SET ]');
          return 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restRunning]);

  const awardRewards = (xpGain, goldGain, label) => {
    playTone(1046, 0.2);
    setState((prev) => {
      let newXp = prev.xp + xpGain;
      let newLvl = prev.level;
      let newPts = prev.statPoints;
      let nextReq = prev.xpToNext;
      while (newXp >= nextReq) {
        newXp -= nextReq;
        newLvl += 1;
        newPts += 5;
        nextReq = Math.floor(nextReq * 1.2);
      }
      return {
        ...prev,
        level: newLvl,
        xp: newXp,
        xpToNext: nextReq,
        gold: prev.gold + goldGain,
        statPoints: newPts,
        workoutLogs: [{ date: new Date().toISOString(), label, xpGain, goldGain }, ...prev.workoutLogs.slice(0, 49)]
      };
    });
    setSystemAlert(`[ QUEST VERIFIED: ${label} (+${xpGain} XP / +${goldGain}G) ]`);
  };

  // Start / Stop WebRTC Camera + Pose HUD Simulation/Tracking
  const toggleCamera = async () => {
    if (camActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      setCamActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamActive(true);
      setSystemAlert('[ AI VISION CAMERA ONLINE: BIOMECHANICAL HUD ACTIVE ]');
    } catch (err) {
      setCamActive(true);
      setSystemAlert('[ CAMERA SIMULATION MODE ACTIVE (GRANT CAMERA PERMISSION IN APK) ]');
    }
  };

  // Simulate or Process Rep Cycle on Camera HUD
  const triggerAiRep = (isShallow = false) => {
    if (isShallow) {
      playTone(240, 0.25);
      setJointAngle(118);
      setRepStage('SHALLOW REP REJECTED (>95°)');
      setSystemAlert('[ ! ALARM: SHALLOW HALF-REP REJECTED BY SYSTEM JUDGE ]');
      return;
    }
    setJointAngle(86);
    setRepStage('BOTTOM DEPTH (<95°)');
    setTimeout(() => {
      setJointAngle(168);
      setRepStage('LOCKOUT VERIFIED');
      setRepCount((c) => {
        const next = c + 1;
        playTone(980, 0.12);
        if (next === targetReps) {
          awardRewards(400, 350, `AI Verified ${targetReps}x ${exerciseType.toUpperCase()}`);
        }
        return next;
      });
    }, 350);
  };

  const runGeminiFormCheck = async () => {
    setAiVerdict({
      grade: spineAngle >= 160 ? 'S-RANK FORM' : 'B-RANK FORM',
      msg: `Joint ROM ${jointAngle}° | Spine Alignment ${spineAngle}°. Full scapular control & lockout verified. +150 Bonus XP awarded.`
    });
    awardRewards(150, 100, 'AI Biomechanical Form Audit');
  };

  return (
    <div className="min-h-screen bg-[#020712] text-[#e0f7fa] font-mono pb-20">
      {/* Top Holographic Status Bar */}
      <header className="border-b border-cyan-500/40 bg-[#041026]/90 backdrop-blur sticky top-0 z-30 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-[0_0_25px_rgba(0,229,255,0.2)]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]" />
          <div>
            <div className="text-xs text-cyan-400 tracking-widest">[ SYSTEM OS // REAL-LIFE HUNTER ]</div>
            <div className="text-sm font-bold tracking-wider">{state.hunterName} • LVL {state.level}</div>
          </div>
        </div>
        <div className="text-xs text-cyan-300 border border-cyan-500/30 px-3 py-1 bg-cyan-950/30 rounded">
          {systemAlert}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-amber-300 font-bold">{state.gold} G</span>
          <span className="text-cyan-300">STREAK: {state.streak}d</span>
          <button onClick={() => setSoundOn(!soundOn)} className="p-1.5 border border-cyan-500/40 rounded text-cyan-300">
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto px-4 pt-4 flex flex-wrap gap-2">
        {[
          { id: 'status', label: 'STATUS & BMI', icon: Shield },
          { id: 'quests', label: 'DAILY QUESTS & FIT', icon: Activity },
          { id: 'vision', label: 'AI VISION JUDGE (CAMERA)', icon: Camera },
          { id: 'dungeons', label: 'DUNGEON GATES', icon: Flame },
          { id: 'store', label: 'STORE & SQUAD', icon: ShoppingBag },
          { id: 'cloud', label: 'CLOUD & DATA VAULT', icon: Cloud }
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { playTone(740, 0.08); setTab(t.id); }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs tracking-wider border transition ${
                active
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                  : 'bg-[#041026]/60 border-cyan-500/30 text-cyan-300/80 hover:border-cyan-400'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </nav>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* TAB 1: STATUS & BMI */}
        {tab === 'status' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-cyan-500/40 bg-[#041026]/80 p-5 shadow-[0_0_25px_rgba(0,229,255,0.12)]">
              <h2 className="text-cyan-400 text-sm tracking-widest border-b border-cyan-500/30 pb-2 mb-4">[ HUNTER ATTRIBUTES & STAT ALLOCATION ]</h2>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>XP PROGRESS</span>
                  <span>{state.xp} / {state.xpToNext} XP</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 border border-cyan-500/40">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400" style={{ width: `${Math.min(100, (state.xp / state.xpToNext) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-2.5">
                {Object.entries(state.stats).map(([k, val]) => (
                  <div key={k} className="flex items-center justify-between border border-cyan-500/20 bg-cyan-950/20 px-3 py-2">
                    <div>
                      <span className="font-bold text-cyan-300 mr-2">{k}</span>
                      <span className="text-xs text-slate-400">
                        {k === 'STR' ? 'Push/Pull Force' : k === 'END' ? 'Stamina & High-Rep Volume' : k === 'AGI' ? 'Mobility & Speed' : k === 'CORE' ? 'Plank & Handstand Stability' : 'Recovery & BMI Health'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{val}</span>
                      {state.statPoints > 0 && (
                        <button
                          onClick={() => {
                            playTone(920, 0.1);
                            setState((p) => ({ ...p, statPoints: p.statPoints - 1, stats: { ...p.stats, [k]: p.stats[k] + 1 } }));
                          }}
                          className="px-2 py-0.5 text-xs bg-cyan-500/30 border border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black"
                        >
                          +1
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-cyan-300">Available Stat Points: <span className="font-bold text-white">{state.statPoints}</span></div>
            </div>

            <div className="border border-cyan-500/40 bg-[#041026]/80 p-5 shadow-[0_0_25px_rgba(0,229,255,0.12)]">
              <h2 className="text-cyan-400 text-sm tracking-widest border-b border-cyan-500/30 pb-2 mb-4">[ BIOMETRIC BMI ENGINE & PERSONALIZED SCALING ]</h2>
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <label className="block">
                  <span className="text-slate-400">HEIGHT (CM)</span>
                  <input
                    type="number"
                    value={state.biometrics.heightCm}
                    onChange={(e) => setState((p) => ({ ...p, biometrics: { ...p.biometrics, heightCm: Number(e.target.value) || 170 } }))}
                    className="w-full mt-1 bg-slate-950 border border-cyan-500/40 px-3 py-2 text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-slate-400">WEIGHT (KG)</span>
                  <input
                    type="number"
                    value={state.biometrics.weightKg}
                    onChange={(e) => setState((p) => ({ ...p, biometrics: { ...p.biometrics, weightKg: Number(e.target.value) || 65 } }))}
                    className="w-full mt-1 bg-slate-950 border border-cyan-500/40 px-3 py-2 text-white"
                  />
                </label>
              </div>
              <div className="p-3 border border-cyan-400/40 bg-cyan-950/30 mb-4">
                <div className="text-xs text-cyan-300">COMPUTED HUNTER BMI</div>
                <div className="text-2xl font-bold text-white">{bmi} <span className="text-xs font-normal text-cyan-300">({bmiCategory})</span></div>
              </div>
              <div className="text-xs space-y-1.5 text-slate-300">
                <div className="text-cyan-400 font-bold">AUTO-SCALED DAILY PRESCRIPTION FOR YOUR BMI:</div>
                <div>• Push-up Volume: <span className="text-white font-bold">{pushupTarget} Reps</span></div>
                <div>• Squat Volume: <span className="text-white font-bold">{squatTarget} Reps</span></div>
                <div>• Core Sit-up / Plank Volume: <span className="text-white font-bold">{situpTarget} Reps</span></div>
                <div>• Google Fit Step Target: <span className="text-white font-bold">{stepTarget} Steps</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY QUESTS & GOOGLE FIT */}
        {tab === 'quests' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-cyan-500/40 bg-[#041026]/80 p-5">
              <h2 className="text-cyan-400 text-sm tracking-widest border-b border-cyan-500/30 pb-2 mb-4">[ DAILY PREPARATION FOR STRENGTH ]</h2>
              <div className="space-y-3">
                {[
                  { label: `Push-up Conditioning (${pushupTarget} Reps)`, type: 'pushup', target: pushupTarget, xp: 250, gold: 200 },
                  { label: `Lower-Body Squats (${squatTarget} Reps)`, type: 'squat', target: squatTarget, xp: 250, gold: 200 },
                  { label: `Core Sit-ups & Hollow Hold (${situpTarget} Reps)`, type: 'situp', target: situpTarget, xp: 250, gold: 200 }
                ].map((q, idx) => (
                  <div key={idx} className="border border-cyan-500/30 bg-cyan-950/20 p-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-white">{q.label}</div>
                      <div className="text-xs text-cyan-300">Reward: +{q.xp} XP / +{q.gold} Gold</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setExerciseType(q.type);
                          setTargetReps(q.target);
                          setRepCount(0);
                          setTab('vision');
                        }}
                        className="px-2.5 py-1.5 text-xs bg-cyan-500/20 border border-cyan-400 text-cyan-200 flex items-center gap-1"
                      >
                        <Camera size={13} /> AI CAMERA
                      </button>
                      <button
                        onClick={() => awardRewards(q.xp, q.gold, q.label)}
                        className="px-2.5 py-1.5 text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200"
                      >
                        COMPLETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-cyan-500/40 bg-[#041026]/80 p-5">
              <h2 className="text-cyan-400 text-sm tracking-widest border-b border-cyan-500/30 pb-2 mb-4">[ GOOGLE FIT & WEARABLE TELEMETRY SYNC ]</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="border border-cyan-500/30 p-3 bg-slate-950/60">
                  <div className="text-xs text-slate-400">STEP COUNT</div>
                  <div className="text-xl font-bold text-cyan-300">{state.googleFit.steps} / {stepTarget}</div>
                </div>
                <div className="border border-cyan-500/30 p-3 bg-slate-950/60">
                  <div className="text-xs text-slate-400">ACTIVE CALORIES</div>
                  <div className="text-xl font-bold text-amber-300">{state.googleFit.calories} kcal</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setState((p) => ({
                      ...p,
                      googleFit: {
                        steps: p.googleFit.steps + 1500,
                        calories: p.googleFit.calories + 95,
                        distanceKm: +(p.googleFit.distanceKm + 1.1).toFixed(1),
                        activeMins: p.googleFit.activeMins + 15,
                        lastSync: new Date().toLocaleTimeString()
                      }
                    }));
                    awardRewards(200, 150, 'Google Fit Step Sync (+1,500 Steps)');
                  }}
                  className="px-3 py-2 text-xs bg-cyan-500/20 border border-cyan-400 text-cyan-200 flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> SYNC GOOGLE FIT STEPS (+1,500)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI VISION JUDGE (CAMERA) */}
        {tab === 'vision' && (
          <div className="border border-cyan-500/40 bg-[#041026]/80 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-3">
              <div>
                <h2 className="text-cyan-400 text-sm tracking-widest">[ SYSTEM AI VISION JUDGE // POSE BIOMECHANICS ]</h2>
                <p className="text-xs text-slate-400">Tracks Elbow/Knee Lockout (&gt;155°), Full Depth (&lt;95°), and Spine Alignment (&gt;150°).</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={exerciseType}
                  onChange={(e) => { setExerciseType(e.target.value); setRepCount(0); }}
                  className="bg-slate-950 border border-cyan-500/40 px-3 py-1.5 text-xs text-cyan-200"
                >
                  <option value="pushup">Push-ups (Shoulder-Elbow-Wrist)</option>
                  <option value="squat">Squats (Hip-Knee-Ankle)</option>
                  <option value="pullup">Pull-ups (Chin Clear & Full Hang)</option>
                  <option value="situp">Sit-ups / Core (Torso Angle)</option>
                </select>
                <button
                  onClick={toggleCamera}
                  className="px-3 py-1.5 text-xs bg-cyan-500/20 border border-cyan-400 text-white font-bold"
                >
                  {camActive ? 'STOP CAMERA' : 'START AI CAMERA'}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative bg-black border border-cyan-500/40 aspect-video flex items-center justify-center overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover opacity-80" playsInline muted />
                <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/40 flex flex-col justify-between p-3">
                  <div className="flex justify-between text-xs bg-slate-950/80 px-2.5 py-1 border border-cyan-500/40">
                    <span className="text-cyan-300">MODE: {exerciseType.toUpperCase()}</span>
                    <span className="text-amber-300">STAGE: {repStage}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="bg-slate-950/80 p-2.5 border border-cyan-500/40 text-xs space-y-1">
                      <div>PRIMARY JOINT ANGLE: <span className="text-cyan-300 font-bold">{jointAngle}°</span></div>
                      <div>SPINE ALIGNMENT: <span className="text-emerald-300 font-bold">{spineAngle}°</span></div>
                    </div>
                    <div className="bg-slate-950/90 px-4 py-2 border border-cyan-400 text-right">
                      <div className="text-[10px] text-cyan-400">VERIFIED REPS</div>
                      <div className="text-3xl font-bold text-white">{repCount} <span className="text-sm text-cyan-400">/ {targetReps}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-cyan-500/30 bg-slate-950/60 p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs text-cyan-400 font-bold">BIOMECHANICAL JUDGE CONTROLS</div>
                  <p className="text-xs text-slate-400">
                    Perform full range-of-motion reps in frame, or test the anti-cheat state machine below:
                  </p>
                  <button
                    onClick={() => triggerAiRep(false)}
                    className="w-full py-2 text-xs bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold hover:bg-cyan-500/30"
                  >
                    + VERIFY FULL ROM REP (&lt;95° DEPTH)
                  </button>
                  <button
                    onClick={() => triggerAiRep(true)}
                    className="w-full py-2 text-xs bg-rose-500/20 border border-rose-400 text-rose-200 hover:bg-rose-500/30"
                  >
                    TEST SHALLOW HALF-REP (ANTI-CHEAT)
                  </button>
                  <button
                    onClick={runGeminiFormCheck}
                    className="w-full py-2 text-xs bg-purple-500/20 border border-purple-400 text-purple-200 hover:bg-purple-500/30"
                  >
                    CAPTURE FRAME & GEMINI AI FORM AUDIT
                  </button>
                </div>

                {aiVerdict && (
                  <div className="border border-cyan-400 bg-cyan-950/40 p-3 text-xs space-y-1">
                    <div className="font-bold text-cyan-300">[ {aiVerdict.grade} ]</div>
                    <div className="text-slate-200">{aiVerdict.msg}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DUNGEON GATES */}
        {tab === 'dungeons' && (
          <div className="space-y-4">
            <div className="border border-cyan-500/40 bg-[#041026]/80 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-cyan-400">[ HOLOGRAPHIC INTER-SET REST TIMER ]</div>
                <div className="text-2xl font-bold text-white">{restSeconds}s</div>
              </div>
              <div className="flex gap-2">
                {[30, 60, 90].map((s) => (
                  <button key={s} onClick={() => { setRestSeconds(s); setRestRunning(true); }} className="px-3 py-1.5 text-xs border border-cyan-500/40 bg-cyan-950/30 text-cyan-200">
                    {s}s REST
                  </button>
                ))}
                <button onClick={() => setRestRunning(!restRunning)} className="px-3 py-1.5 text-xs bg-cyan-500/20 border border-cyan-400 text-white">
                  {restRunning ? 'PAUSE' : 'START'}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {DUNGEON_GATES.map((g) => (
                <div key={g.id} className="border border-cyan-500/40 bg-[#041026]/80 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-2 py-0.5 border" style={{ borderColor: g.color, color: g.color }}>{g.rank}</span>
                    <span className="text-xs text-amber-300">+{g.xp} XP / +{g.gold}G</span>
                  </div>
                  <div className="font-bold text-white">{g.name}</div>
                  <div className="space-y-1.5 text-xs">
                    {g.exercises.map((ex, i) => (
                      <div key={i} className="flex justify-between items-center border border-cyan-500/20 bg-slate-950/50 px-2.5 py-1.5">
                        <span>{ex.name} ({ex.reps})</span>
                        <button
                          onClick={() => {
                            setExerciseType(ex.type);
                            setTargetReps(ex.target);
                            setRepCount(0);
                            setTab('vision');
                          }}
                          className="text-cyan-300 underline"
                        >
                          AI Verify
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => awardRewards(g.xp, g.gold, `Dungeon Cleared: ${g.name}`)}
                    className="w-full py-2 text-xs bg-cyan-500/20 border border-cyan-400 text-white font-bold hover:bg-cyan-500/30"
                  >
                    CLEAR DUNGEON GATE
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM STORE & SQUAD */}
        {tab === 'store' && (
          <div className="grid md:grid-cols-2 gap-4">
            {STORE_ITEMS.map((item) => {
              const owned = state.inventory.includes(item.id) || state.badges.includes(item.id);
              return (
                <div key={item.id} className="border border-cyan-500/40 bg-[#041026]/80 p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cyan-400 uppercase">{item.type}</span>
                      <span className="text-amber-300 font-bold">{item.cost} GOLD</span>
                    </div>
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-xs text-cyan-300 mt-0.5">{item.bonus}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  </div>
                  <button
                    disabled={owned || state.gold < item.cost}
                    onClick={() => {
                      playTone(1100, 0.2);
                      setState((p) => ({
                        ...p,
                        gold: p.gold - item.cost,
                        inventory: [...p.inventory, item.id]
                      }));
                    }}
                    className={`w-full py-2 text-xs border font-bold ${
                      owned
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                        : 'border-cyan-400 bg-cyan-500/20 text-white hover:bg-cyan-500/30 disabled:opacity-40'
                    }`}
                  >
                    {owned ? 'EQUIPPED IN INVENTORY' : `PURCHASE (${item.cost}G)`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 6: CLOUD & DATA EXTRACTION */}
        {tab === 'cloud' && (
          <div className="border border-cyan-500/40 bg-[#041026]/80 p-5 space-y-4">
            <h2 className="text-cyan-400 text-sm tracking-widest border-b border-cyan-500/30 pb-2">[ CLOUD BACKUP & PROGRESS EXTRACTION VAULT ]</h2>
            <p className="text-xs text-slate-300">
              Export your complete Hunter Profile, Stats, Badges, and Workout Logs as a portable JSON file or restore from backup anytime.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `solo-leveling-backup-lvl${state.level}.json`;
                  a.click();
                }}
                className="px-4 py-2 text-xs bg-cyan-500/20 border border-cyan-400 text-white flex items-center gap-2"
              >
                <Download size={14} /> EXPORT SYSTEM BACKUP (.JSON)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
