
import React from 'react';
import { Task, User, AppLanguage } from '../types';
import { TRANSLATIONS } from '../data';

interface DashboardProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onAddTask: () => void;
  lang: AppLanguage;
}

export const Dashboard = ({ tasks, users, currentUser, onAddTask, lang }: DashboardProps) => {
  const t = TRANSLATIONS[lang];
  
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const pendingTasks = myTasks.filter(t => t.status !== 'Done');
  const completedToday = tasks.filter(t => t.status === 'Done' && new Date(t.lastUpdated).toDateString() === new Date().toDateString()).length;
  
  // Late Tasks Logic
  const lateTasksCount = tasks.filter(t => t.status !== 'Done' && new Date(t.deadline) < new Date()).length;
  const completedTasks = tasks.filter(t => t.status === 'Done').sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';

  const topPerformer = [...users].filter(u => u.type === 'staff').sort((a, b) => b.points - a.points)[0];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t.dashboard.activeTasks}</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{pendingTasks.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><i className="fa-solid fa-list-ul text-xl"></i></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t.dashboard.completedToday}</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{completedToday}</h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400"><i className="fa-solid fa-check-circle text-xl"></i></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t.dashboard.lateTasks}</p>
              <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{lateTasksCount}</h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400"><i className="fa-solid fa-triangle-exclamation text-xl"></i></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">{t.dashboard.starOfWeek}</p>
              <h3 className="text-xl font-bold mt-1">{topPerformer?.name}</h3>
              <p className="text-xs text-indigo-200 mt-1">{topPerformer?.points} {t.dashboard.points}</p>
            </div>
            <div className="text-3xl">{topPerformer?.avatar}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t.dashboard.urgentTasks}</h3>
             <button onClick={onAddTask} className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50">
               + {t.dashboard.addTask}
             </button>
           </div>
           <div className="space-y-3">
             {tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Done').slice(0, 4).map(task => (
               <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-r-4 border-red-500 dark:border-red-400">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-white">{task.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border dark:border-slate-600">{task.status}</span>
                      <span><i className="fa-regular fa-clock ml-1"></i>{new Date(task.deadline).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  </div>
                  <div className="text-2xl">{users.find(u => u.id === task.assigneeId)?.avatar}</div>
               </div>
             ))}
             {tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Done').length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">{t.dashboard.noUrgentTasks}</div>
             )}
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
           <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">{t.dashboard.topPerformers}</h3>
           <div className="space-y-4">
              {users.filter(u => u.type === 'staff').sort((a,b) => b.points - a.points).slice(0, 5).map((u, idx) => (
                <div key={u.id} className="flex items-center gap-3">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold 
                      ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200' : idx === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {idx + 1}
                   </div>
                   <div className="text-xl">{u.avatar}</div>
                   <div className="flex-1">
                     <div className="font-bold text-sm text-slate-800 dark:text-white">{u.name}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400">{u.points} {t.dashboard.points}</div>
                   </div>
                   {idx === 0 && <i className="fa-solid fa-crown text-yellow-500"></i>}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Completed Tasks Archive (For Admins/Managers) */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-green-50/50 dark:bg-green-900/10 flex items-center justify-between">
                <h3 className="font-bold text-lg text-green-800 dark:text-green-400 flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-check"></i> {t.dashboard.completedLog}
                </h3>
                <span className="text-xs bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded border dark:border-slate-600">{t.dashboard.archive}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="p-4">{t.dashboard.taskHeader}</th>
                            <th className="p-4">{t.dashboard.employeeHeader}</th>
                            <th className="p-4">{t.dashboard.dateHeader}</th>
                            <th className="p-4">{t.dashboard.timeHeader}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {completedTasks.length > 0 ? completedTasks.map(task => {
                            const assignee = users.find(u => u.id === task.assigneeId);
                            const hours = Math.floor((task.elapsedTime || 0) / 3600);
                            const mins = Math.floor(((task.elapsedTime || 0) % 3600) / 60);

                            return (
                                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{task.title}</td>
                                    <td className="p-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <span>{assignee?.avatar}</span>
                                        <span>{assignee?.name}</span>
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 dir-ltr text-right">{new Date(task.lastUpdated).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{hours}h {mins}m</td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500">Empty Archive</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};