
import React from 'react';
import { User, AppLanguage } from '../types';
import { translateRole, LEVELS } from '../data';

export const TeamView = ({ users, lang }: { users: User[], lang: AppLanguage }) => {
    const staff = users.filter(u => u.type === 'staff');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {staff.map(user => {
                const userLevel = LEVELS.find(l => l.level === user.level) || LEVELS[0];
                const progress = ((user.points - userLevel.min) / (userLevel.max - userLevel.min)) * 100;

                return (
                    <div key={user.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50 to-transparent`}></div>
                        <div className="relative text-6xl mb-3 bg-white rounded-full p-2 shadow-lg w-24 h-24 flex items-center justify-center">
                            {user.avatar}
                            <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full border-2 border-white">
                                Lvl {user.level}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg relative">{user.name}</h3>
                        <p className="text-slate-500 text-sm mb-4 relative">{translateRole(user.role, lang)}</p>
                        
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between w-full text-xs text-slate-400 mb-4">
                             <span>{user.points} XP</span>
                             <span>{userLevel.max} XP</span>
                        </div>

                        <div className="flex gap-2 w-full justify-center">
                            {user.badges.slice(0, 3).map(badge => (
                                <div key={badge} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs" title={badge}>
                                    <i className="fa-solid fa-medal"></i>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
