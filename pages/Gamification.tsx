
import React, { useState, useEffect } from 'react';
import { User, Reward, AppLanguage, BattleTeam, WheelReward } from '../types';
import { LEVELS, REWARDS, TEAMS, translateRole, WHEEL_REWARDS_DATA } from '../data';
import { Confetti } from '../components/Common';

// --- COMPONENTS ---

const Leaderboard = ({ users, currentUser, lang }: { users: User[], currentUser: User, lang: AppLanguage }) => {
    const sortedUsers = [...users].filter(u => u.type === 'staff').sort((a,b) => b.points - a.points);
    
    return (
        <div className="space-y-4">
            {sortedUsers.map((user, idx) => {
                     const isMe = user.id === currentUser.id;
                     return (
                        <div key={user.id} className={`bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border-2 transform transition-all hover:scale-[1.02]
                            ${isMe ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-transparent'}
                            ${idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-300' : ''}
                        `}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                ${idx === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200' : 
                                  idx === 1 ? 'bg-slate-400 text-white' : 
                                  idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'}
                            `}>
                                {idx + 1}
                            </div>
                            <div className="relative">
                                <div className="text-3xl">{user.avatar}</div>
                                {user.attendanceStreak && user.attendanceStreak > 5 && (
                                    <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-[9px] px-1 rounded-full animate-pulse">
                                        🔥 {user.attendanceStreak}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                                    {isMe && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full">أنت</span>}
                                    {idx === 0 && <i className="fa-solid fa-crown text-yellow-500 text-sm"></i>}
                                </div>
                                <div className="text-xs text-slate-500">{translateRole(user.role, lang)} • المستوى {user.level}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-indigo-600 text-lg">{user.points}</div>
                                <div className="text-[10px] text-slate-400 uppercase">نقطة XP</div>
                            </div>
                        </div>
                     );
            })}
        </div>
    );
};

const RewardsShop = ({ rewards, currentUser, onRedeem, lang }: { rewards: Reward[], currentUser: User, onRedeem: (item: string, cost: number) => void, lang: AppLanguage }) => {
    return (
        <div className="animate-fade-in-up">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                   <h2 className="text-2xl font-bold">متجر الجوائز (Smart Store)</h2>
                   <p className="text-slate-500">استبدل عملاتك الرقمية بمكافآت حقيقية</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-amber-100 text-amber-700 px-6 py-3 rounded-2xl font-bold text-xl flex items-center gap-2 shadow-inner border border-amber-200">
                        <i className="fa-solid fa-coins text-amber-500"></i> {currentUser.smartCoins} SC
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {REWARDS.map(reward => {
                     const canAfford = currentUser.smartCoins >= reward.cost;
                     return (
                         <div key={reward.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all ${!canAfford ? 'opacity-60 grayscale' : 'hover:shadow-lg'}`}>
                             <div className={`w-16 h-16 rounded-full ${reward.color} text-white flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                                 <i className={`fa-solid ${reward.icon}`}></i>
                             </div>
                             <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
                             <p className="text-slate-500 text-sm mb-4 font-mono">{reward.cost} SC</p>
                             <button 
                                disabled={!canAfford}
                                onClick={() => onRedeem(reward.title, reward.cost)}
                                className={`w-full py-2 rounded-xl font-bold transition-colors ${canAfford ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                             >
                                {canAfford ? 'شراء الآن' : 'رصيد غير كاف'}
                             </button>
                         </div>
                     );
                 })}
            </div>
        </div>
    );
};

// --- NEW FEATURES ---

const TeamBattles = ({ teams, users }: { teams: BattleTeam[], users: User[] }) => {
    // Recalculate scores based on member points
    const teamsWithScores = teams.map(team => {
        const memberPoints = users.filter(u => team.members.includes(u.id)).reduce((acc, u) => acc + u.points, 0);
        return { ...team, score: team.score + memberPoints }; // Base score + current member progress
    }).sort((a,b) => b.score - a.score);

    const maxScore = Math.max(...teamsWithScores.map(t => t.score));

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><i className="fa-solid fa-flag-checkered text-yellow-500"></i> معارك الفرق (Team Battles)</h2>
                <p className="text-slate-300">تنافس الفرق على لقب الأفضل هذا الموسم</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamsWithScores.map((team, idx) => (
                    <div key={team.id} className={`bg-white rounded-2xl p-6 shadow-lg border-t-8 flex flex-col items-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300`} style={{ borderColor: team.id === 'T_ADMIN' ? '#334155' : team.id === 'T_IT' ? '#2563eb' : team.id === 'T_FB' ? '#d97706' : '#16a34a' }}>
                        <div className={`absolute -right-4 -top-4 text-9xl opacity-5 group-hover:scale-110 transition-transform bg-gradient-to-br ${team.color} bg-clip-text text-transparent`}>
                            <i className={`fa-solid ${team.icon}`}></i>
                        </div>
                        
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${team.color} flex items-center justify-center text-white text-3xl shadow-lg mb-4 z-10`}>
                            <i className={`fa-solid ${team.icon}`}></i>
                        </div>
                        
                        <h3 className="font-bold text-xl z-10">{team.name}</h3>
                        <p className="text-xs text-slate-500 mb-4 z-10">{team.description}</p>
                        
                        <div className="text-3xl font-black text-slate-800 mb-2 z-10">{team.score.toLocaleString()}</div>
                        
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2 z-10">
                            <div className={`h-full bg-gradient-to-r ${team.color} transition-all duration-1000`} style={{ width: `${(team.score / maxScore) * 100}%` }}></div>
                        </div>

                        {idx === 0 && <div className="absolute top-2 left-2 text-yellow-500 animate-bounce"><i className="fa-solid fa-crown text-2xl"></i></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const WheelOfFortune = ({ currentUser, onSpin }: { currentUser: User, onSpin: (reward: WheelReward) => void }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [lastReward, setLastReward] = useState<WheelReward | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Limit check logic
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const userSpins = currentUser.wheelSpins?.month === currentMonth 
        ? currentUser.wheelSpins.count 
        : 0;
    const MAX_SPINS = 3;
    const canSpin = userSpins < MAX_SPINS;

    const handleSpin = () => {
        if (isSpinning || !canSpin) return;
        setIsSpinning(true);
        setLastReward(null);
        setShowConfetti(false);

        // Logic to pick a reward based on probability
        const totalProb = WHEEL_REWARDS_DATA.reduce((acc, r) => acc + r.probability, 0);
        let random = Math.random() * totalProb;
        let selected = WHEEL_REWARDS_DATA[0];
        
        for (const reward of WHEEL_REWARDS_DATA) {
            if (random < reward.probability) {
                selected = reward;
                break;
            }
            random -= reward.probability;
        }

        // Calculate rotation: 360 * 5 spins + specific segment
        const segmentAngle = 360 / WHEEL_REWARDS_DATA.length;
        const index = WHEEL_REWARDS_DATA.findIndex(r => r.id === selected.id);
        const targetRotation = 360 * 5 + (360 - (index * segmentAngle)); // Adjust to land on top

        setRotation(r => r + targetRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setLastReward(selected);
            onSpin(selected);
            if (selected.value !== 0) setShowConfetti(true);
        }, 5000);
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            {showConfetti && <Confetti />}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden w-full max-w-3xl flex flex-col md:flex-row items-center gap-12">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                 
                 {/* Wheel Container */}
                 <div className="relative z-10">
                      {/* Pointer */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-4xl text-white drop-shadow-lg"><i className="fa-solid fa-caret-down"></i></div>
                      
                      {/* The Wheel */}
                      <div 
                        className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-white shadow-2xl relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                           {WHEEL_REWARDS_DATA.map((item, index) => {
                               const rotation = index * (360 / WHEEL_REWARDS_DATA.length);
                               return (
                                   <div 
                                    key={item.id}
                                    className="absolute w-full h-full top-0 left-0"
                                    style={{ transform: `rotate(${rotation}deg)` }}
                                   >
                                       <div 
                                        className="w-full h-full absolute flex justify-center pt-4"
                                        style={{ 
                                            background: `conic-gradient(${item.color} 0deg ${360/WHEEL_REWARDS_DATA.length}deg, transparent 0deg)`,
                                            clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' // Approx sector
                                            // A proper CSS cone sector is complex, simplifying visually by using background colors on segments or just icons
                                        }}
                                       >
                                            {/* Note: Proper CSS conic gradients for segments is tricky without SVG. Using simple visual fallback */}
                                            <div className="transform -rotate-90 origin-bottom-center mt-2 font-bold text-white text-xs flex flex-col items-center" style={{ transform: `rotate(${360/WHEEL_REWARDS_DATA.length/2}deg)` }}>
                                                <i className={`fa-solid ${item.icon} text-lg mb-1 drop-shadow-md`}></i>
                                                <span className="drop-shadow-md">{item.label}</span>
                                            </div>
                                       </div>
                                       {/* Separator Line */}
                                       <div className="absolute w-0.5 h-1/2 bg-white/20 top-0 left-1/2 -translate-x-1/2 origin-bottom"></div>
                                   </div>
                               );
                           })}
                           {/* Center Cap */}
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center font-bold text-slate-800 z-10">TS</div>
                      </div>
                 </div>

                 {/* Controls & Result */}
                 <div className="flex-1 text-center md:text-left z-10">
                      <h2 className="text-3xl font-bold text-white mb-2">عجلة الحظ الشهرية</h2>
                      <p className="text-slate-300 mb-6">جرب حظك واربح عملات أو هدايا قيمة!</p>
                      
                      <div className="mb-4 text-sm font-bold text-yellow-400 bg-slate-800/50 p-2 rounded-lg inline-block">
                          محاولات متبقية: {MAX_SPINS - userSpins} / {MAX_SPINS}
                      </div>

                      {lastReward ? (
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-fade-in-up">
                              {lastReward.value === 0 ? (
                                  <div className="text-xl text-slate-300 font-bold mb-2">😔 {lastReward.label}</div>
                              ) : (
                                  <>
                                    <div className="text-sm text-yellow-400 font-bold uppercase mb-2">مبروك ربحت!</div>
                                    <div className="text-3xl font-bold text-white mb-2">{lastReward.label}</div>
                                  </>
                              )}
                              <button onClick={() => setLastReward(null)} className="text-sm text-slate-300 underline mt-2 block mx-auto">جرب مرة أخرى</button>
                          </div>
                      ) : (
                          <button 
                            onClick={handleSpin}
                            disabled={isSpinning || !canSpin}
                            className={`px-12 py-4 rounded-full font-bold text-xl shadow-lg shadow-indigo-500/50 transition-all transform hover:scale-105 block w-full
                                ${isSpinning || !canSpin ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-violet-600 text-white'}
                            `}
                          >
                              {isSpinning ? 'جاري الدوران...' : !canSpin ? 'انتهت محاولاتك' : 'إبدأ اللعب 🎲'}
                          </button>
                      )}
                 </div>
            </div>
        </div>
    );
};

const KarmaCenter = ({ users, currentUser, onSendKarma }: { users: User[], currentUser: User, onSendKarma: (toId: string) => void }) => {
    const [selectedUser, setSelectedUser] = useState('');
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-hand-holding-heart text-pink-500"></i> إرسال كارما (Good Vibes)</h3>
                <p className="text-sm text-slate-500 mb-4">هل ساعدك أحد اليوم؟ أرسل له شكر لزيادة رصيد الكارما لديه.</p>
                
                <div className="flex gap-2">
                    <select className="flex-1 border rounded-xl p-3 bg-slate-50" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                        <option value="">اختر زميل...</option>
                        {users.filter(u => u.type === 'staff' && u.id !== currentUser.id).map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <button 
                        disabled={!selectedUser}
                        onClick={() => { onSendKarma(selectedUser); setSelectedUser(''); }}
                        className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50"
                    >
                        إرسال ✨
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4">أعلى الموظفين في الكارما</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {users.sort((a,b) => b.karma - a.karma).slice(0, 5).map(u => (
                         <div key={u.id} className="flex flex-col items-center min-w-[80px]">
                             <div className="relative">
                                 <div className="w-12 h-12 rounded-full border-2 border-pink-200 p-0.5 relative z-10 bg-white flex items-center justify-center text-2xl">
                                     {u.avatar}
                                 </div>
                                 <div className="absolute inset-0 rounded-full bg-pink-400 blur-md opacity-40 animate-pulse"></div>
                             </div>
                             <div className="text-xs font-bold mt-1 text-slate-700 truncate w-full text-center">{u.name.split(' ')[0]}</div>
                             <div className="text-xs text-pink-600 font-bold">{u.karma}</div>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Heatmap = () => {
    // Generate dummy heatmap data (last 30 days)
    const days = Array.from({ length: 30 }, (_, i) => {
        const intensity = Math.floor(Math.random() * 4); // 0-3
        return intensity;
    });

    const getColor = (i: number) => {
        if (i === 0) return 'bg-slate-100';
        if (i === 1) return 'bg-green-200';
        if (i === 2) return 'bg-green-400';
        return 'bg-green-600';
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg">خريطة الأداء (Activity Heatmap)</h3>
                 <div className="flex gap-1 text-xs items-center">
                     <span>Less</span>
                     <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
                     <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                     <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                     <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                     <span>More</span>
                 </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {days.map((intensity, idx) => (
                    <div 
                        key={idx} 
                        className={`w-4 h-4 rounded-sm ${getColor(intensity)} hover:ring-2 ring-slate-300 transition-all cursor-pointer`}
                        title={`Day ${idx+1}: ${intensity === 0 ? 'No activity' : 'Activity recorded'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

interface GamificationPageProps {
    users: User[];
    currentUser: User;
    onRedeem: (item: string, cost: number) => void;
    onSpin: (reward: WheelReward) => void;
    onSendKarma: (toId: string) => void;
    lang: AppLanguage;
}

export const GamificationPage = ({ users, currentUser, onRedeem, onSpin, onSendKarma, lang }: GamificationPageProps) => {
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'shop' | 'challenges'>('leaderboard');

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-trophy text-yellow-400"></i>
                            ساحة الأبطال (Gamification Hub)
                        </h1>
                        <p className="text-violet-100 text-lg">تنافس، تطور، واربح الجوائز!</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex gap-6 border border-white/20">
                        <div className="text-center">
                            <div className="text-xs font-bold uppercase opacity-70">المستوى</div>
                            <div className="text-2xl font-black">{currentUser.level}</div>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-xs font-bold uppercase opacity-70">النقاط</div>
                            <div className="text-2xl font-black text-yellow-300">{currentUser.points}</div>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-xs font-bold uppercase opacity-70">عملات</div>
                            <div className="text-2xl font-black text-amber-400">{currentUser.smartCoins}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-slate-200 pb-1 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('leaderboard')} 
                    className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'leaderboard' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <i className="fa-solid fa-ranking-star mr-2"></i> لوحة الصدارة
                </button>
                <button 
                    onClick={() => setActiveTab('shop')} 
                    className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'shop' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <i className="fa-solid fa-store mr-2"></i> المتجر
                </button>
                <button 
                    onClick={() => setActiveTab('challenges')} 
                    className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'challenges' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <i className="fa-solid fa-gamepad mr-2"></i> التحديات والفرق
                </button>
            </div>

            {activeTab === 'leaderboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Leaderboard users={users} currentUser={currentUser} lang={lang} />
                    </div>
                    <div className="space-y-6">
                        <Heatmap />
                        <KarmaCenter users={users} currentUser={currentUser} onSendKarma={onSendKarma} />
                    </div>
                </div>
            )}

            {activeTab === 'shop' && (
                <RewardsShop rewards={REWARDS} currentUser={currentUser} onRedeem={onRedeem} lang={lang} />
            )}

            {activeTab === 'challenges' && (
                <div className="space-y-8">
                    <WheelOfFortune currentUser={currentUser} onSpin={onSpin} />
                    <TeamBattles teams={TEAMS} users={users} />
                </div>
            )}
        </div>
    );
};
