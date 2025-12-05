
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Task, User, Priority, Status, NotificationCategory, TaskComment, AppLanguage, InventoryItem, MaintenanceTicket, Customer, Glitch } from '../types';
import { translateStatus, translatePriority, TRANSLATIONS } from '../data';
import { GoogleGenAI } from "@google/genai";

// Task Work Timer Component
const TaskTimer = ({ task, isRunning, onToggle, t }: { task: Task, isRunning: boolean, onToggle: () => void, t: any }) => {
    const [time, setTime] = useState(task.elapsedTime || 0);
  
    // Sync with task data updates
    useEffect(() => {
      setTime(task.elapsedTime || 0);
    }, [task.elapsedTime]);
  
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    
    return (
      <div className="flex flex-col items-center">
         <span className="text-[10px] text-slate-400 font-bold mb-0.5">{t.tasks.workTime}</span>
         <div className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-bold border-2 transition-colors 
            ${isRunning ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'}`}>
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`${isRunning ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'} hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${isRunning ? 'fa-stop-circle text-lg' : 'fa-play-circle text-lg'}`}></i>
            </button>
            <span className="font-mono pt-0.5 min-w-[60px] text-center">
                {formatTime(time)}
            </span>
         </div>
      </div>
    );
};

const CountdownTimer = ({ deadline }: { deadline: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(deadline) - +new Date();
        return difference;
    };

    const [difference, setDifference] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setDifference(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [deadline]);

    if (isNaN(difference)) return <span className="text-slate-300 text-xs">Invalid Date</span>;

    if (difference <= 0) {
        return <span className="text-white font-bold flex items-center gap-2 bg-red-600 px-2 py-0.5 rounded animate-pulse"><i className="fa-solid fa-triangle-exclamation"></i> Time Up</span>;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    const isCritical = days === 0 && hours < 24;

    return (
        <span className={`font-mono dir-ltr font-bold text-sm ${isCritical ? 'text-red-600 dark:text-red-400 animate-pulse' : ''}`}>
            {days > 0 ? `${days}d ` : ''}
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    );
};

interface TasksProps {
  tasks: Task[];
  users: User[];
  inventory?: InventoryItem[];
  tickets?: MaintenanceTicket[];
  customers?: Customer[];
  glitches?: Glitch[];
  setTasks: (t: Task[] | ((prev: Task[]) => Task[])) => void;
  currentUser: User;
  addNotification: (msg: string, type: 'success' | 'info' | 'warning', category: NotificationCategory) => void;
  lang: AppLanguage;
  onDeleteTask?: (id: string) => void;
}

export const TasksKanban = ({ tasks, users, inventory, tickets, customers, glitches, setTasks, onDeleteTask, currentUser, addNotification, lang }: TasksProps) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState('all');
  
  const t = TRANSLATIONS[lang];

  const statuses: Status[] = ['To Do', 'In Progress', 'Review', 'Done'];

  const playSuccessSound = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play failed", e));
  };

  const handleDrop = (status: Status) => {
    if (draggedTask) {
      updateTaskStatus(draggedTask, status);
      setDraggedTask(null);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Status) => {
      const task = tasks.find(t => t.id === taskId);
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus, lastUpdated: new Date().toISOString() } : t
      );
      setTasks(updatedTasks);
      
      if (newStatus === 'Done') {
          playSuccessSound();
          if (task) {
              addNotification(`${t.tasks.completed}: "${task.title}"`, 'success', 'task');
          }
      }
  };

  const handleMoveTask = (task: Task, direction: 'forward' | 'backward') => {
      const currentIndex = statuses.indexOf(task.status);
      if (currentIndex === -1) return;

      let newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
      
      if (newIndex >= 0 && newIndex < statuses.length) {
          updateTaskStatus(task.id, statuses[newIndex]);
      }
  };

  const handleCreateTask = (newTask: Partial<Task>) => {
    const task: Task = {
        id: `TSK-${Date.now()}`,
        organizationId: currentUser.organizationId,
        title: newTask.title!,
        description: newTask.description || '',
        assigneeId: newTask.assigneeId!,
        priority: newTask.priority || 'Medium',
        status: 'To Do',
        deadline: newTask.deadline || new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        elapsedTime: 0,
        isTimerRunning: false,
        isPenalized: false,
        comments: []
    };
    setTasks([...tasks, task]);
    setShowCreateModal(false);
  };

  const toggleTaskTimer = (taskId: string) => {
     setTasks(prevTasks => prevTasks.map(t => {
         if (t.id === taskId) {
             return { ...t, isTimerRunning: !t.isTimerRunning };
         }
         return t; 
     }));
  };

  const handleAddComment = (taskId: string, text: string) => {
      const newComment: TaskComment = {
          id: `c-${Date.now()}`,
          authorId: currentUser.id,
          text: text,
          createdAt: new Date().toISOString()
      };

      const updatedTasks = tasks.map(t => {
          if (t.id === taskId) {
              return { ...t, comments: [...(t.comments || []), newComment] };
          }
          return t;
      });

      setTasks(updatedTasks);
      
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      if(updatedTask) setSelectedTaskForComments(updatedTask);
  };

  // Export Logic
  const handleExport = () => {
      const X = (XLSX as any).default || XLSX;
      const data = tasks.map(t => ({
          'ID': t.id,
          'العنوان': t.title,
          'الحالة': translateStatus(t.status, lang),
          'الأولوية': translatePriority(t.priority, lang),
          'المسؤول': users.find(u => u.id === t.assigneeId)?.name || '-',
          'الموعد النهائي': new Date(t.deadline).toLocaleDateString(),
          'ساعات العمل': (t.elapsedTime || 0) / 3600
      }));
      const ws = X.utils.json_to_sheet(data);
      const wb = X.utils.book_new();
      X.utils.book_append_sheet(wb, ws, "Tasks");
      X.writeFile(wb, `Tasks_Export_${new Date().toLocaleDateString('en-CA')}.xlsx`);
  };

  // Import Logic
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const X = (XLSX as any).default || XLSX;
              const bstr = evt.target?.result;
              const wb = X.read(bstr, { type: 'binary' });
              const ws = wb.Sheets[wb.SheetNames[0]];
              const rawData = X.utils.sheet_to_json(ws) as any[];
              
              const newTasks: Task[] = rawData.map((row, idx) => ({
                  id: row['ID'] || `TSK-IMP-${Date.now()}-${idx}`,
                  organizationId: currentUser.organizationId,
                  title: row['العنوان'] || row['Title'] || 'Imported Task',
                  description: '',
                  status: 'To Do',
                  priority: 'Medium',
                  assigneeId: '',
                  deadline: new Date(Date.now() + 86400000).toISOString(),
                  createdAt: new Date().toISOString(),
                  lastUpdated: new Date().toISOString(),
                  comments: []
              }));
              
              if (newTasks.length > 0) {
                  if (confirm(`تم قراءة ${newTasks.length} مهمة. هل تريد استبدال القائمة الحالية بالكامل؟\n\nاضغط "موافق" للاستبدال (مسح القديم).\nاضغط "إلغاء" للإضافة (دمج).`)) {
                      setTasks(newTasks);
                  } else {
                      setTasks(prev => [...prev, ...newTasks]);
                  }
                  alert('تم الاستيراد بنجاح');
              }
          } catch (e) {
              console.error(e);
              alert('حدث خطأ أثناء قراءة الملف');
          }
      };
      reader.readAsBinaryString(file);
      e.target.value = '';
  };

  const getPriorityColor = (p: Priority) => {
      switch(p) {
          case 'Urgent': return 'bg-red-500';
          case 'High': return 'bg-orange-500';
          case 'Medium': return 'bg-blue-500';
          default: return 'bg-slate-400';
      }
  };

  const visibleTasks = tasks.filter(t => selectedAssigneeFilter === 'all' || t.assigneeId === selectedAssigneeFilter);

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-list-check text-blue-600 dark:text-blue-400"></i> {t.tasks.title}
            </h2>
            
            <div className="flex gap-2 flex-wrap justify-end">
                <select 
                    className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 dark:text-white"
                    value={selectedAssigneeFilter}
                    onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
                >
                    <option value="all">كل الموظفين</option>
                    {users.filter(u => u.type === 'staff').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>

                <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95">
                    + {t.tasks.newTask}
                </button>
                
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <label className="text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 px-3 py-1.5 rounded-md cursor-pointer transition-colors" title={t.common.import}>
                        <i className="fa-solid fa-file-import"></i>
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                    </label>
                    <button onClick={handleExport} className="text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors" title={t.common.export}>
                        <i className="fa-solid fa-file-excel"></i>
                    </button>
                </div>
            </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex gap-6 h-full min-w-[1000px]">
                {statuses.map(status => {
                    const statusTasks = visibleTasks.filter(t => t.status === status);
                    return (
                        <div 
                            key={status}
                            className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900/50 rounded-2xl min-w-[280px]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(status)}
                        >
                            <div className={`p-4 border-b border-slate-200 dark:border-slate-700 font-bold flex justify-between items-center rounded-t-2xl
                                ${status === 'Done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}
                            `}>
                                <span>{translateStatus(status, lang)}</span>
                                <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs shadow-sm">{statusTasks.length}</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                                {statusTasks.map(task => {
                                    const assignee = users.find(u => u.id === task.assigneeId);
                                    return (
                                        <div 
                                            key={task.id}
                                            draggable
                                            onDragStart={() => setDraggedTask(task.id)}
                                            onDragEnd={() => setDraggedTask(null)}
                                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative"
                                        >
                                            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getPriorityColor(task.priority)}`}></div>
                                            
                                            <div className="flex justify-between items-start mb-2 pl-3">
                                                <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{task.title}</h4>
                                                {onDeleteTask && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete task?')) onDeleteTask(task.id); }}
                                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <i className="fa-solid fa-trash text-xs"></i>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 pl-3">{task.description}</p>
                                            
                                            {/* Metadata */}
                                            <div className="flex items-center justify-between pl-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    {assignee ? (
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs" title={assignee.name}>
                                                            {assignee.avatar}
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                                                            <i className="fa-solid fa-user-slash"></i>
                                                        </div>
                                                    )}
                                                    <button onClick={() => setSelectedTaskForComments(task)} className="text-slate-400 hover:text-blue-500 text-xs flex items-center gap-1">
                                                        <i className="fa-regular fa-comment"></i> {task.comments?.length || 0}
                                                    </button>
                                                </div>

                                                {task.status === 'In Progress' && (
                                                    <TaskTimer task={task} isRunning={!!task.isTimerRunning} onToggle={() => toggleTaskTimer(task.id)} t={t} />
                                                )}
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex justify-between items-center mt-3 pl-3">
                                                <CountdownTimer deadline={task.deadline} />
                                                <div className="flex gap-1 md:hidden">
                                                    <button onClick={() => handleMoveTask(task, 'backward')} className="p-1 bg-slate-100 rounded text-slate-500"><i className="fa-solid fa-chevron-right"></i></button>
                                                    <button onClick={() => handleMoveTask(task, 'forward')} className="p-1 bg-slate-100 rounded text-slate-500"><i className="fa-solid fa-chevron-left"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {statusTasks.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl m-2">
                                        <i className="fa-solid fa-clipboard text-2xl mb-2"></i>
                                        <span className="text-xs font-bold">{t.tasks.dragDrop}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Modals */}
        {showCreateModal && (
            <CreateTaskModal 
                onClose={() => setShowCreateModal(false)} 
                onCreate={handleCreateTask} 
                users={users} 
                t={t}
                currentUser={currentUser}
                inventory={inventory}
                glitches={glitches}
                customers={customers}
            />
        )}

        {selectedTaskForComments && (
            <TaskCommentsModal 
                task={selectedTaskForComments} 
                users={users} 
                onClose={() => setSelectedTaskForComments(null)}
                onAddComment={handleAddComment}
                currentUser={currentUser}
                t={t}
            />
        )}
    </div>
  );
};

const CreateTaskModal = ({ onClose, onCreate, users, t, currentUser, inventory, glitches, customers }: any) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');
    const [assignee, setAssignee] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isMagicLoading, setIsMagicLoading] = useState(false);

    // AI Magic Suggest
    const handleMagicSuggest = async () => {
        if (!title) return alert('Please enter a title first');
        
        if (!process.env.API_KEY) {
            setDesc("Suggestion (Mock): Ensure all cables are organized and check power supply units.");
            setPriority("Medium");
            return;
        }
        
        setIsMagicLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on this task title: "${title}", suggest a detailed description and a priority level (Low, Medium, High, Urgent). Return JSON: { "description": "...", "priority": "..." }`;
            
            const result = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            
            let text = result.text || "{}";
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1) {
                text = text.substring(firstOpen, lastClose + 1);
            }
            const data = JSON.parse(text);
            
            if (data.description) setDesc(data.description);
            if (data.priority) setPriority(data.priority);
        } catch (e) {
            console.error(e);
            setDesc('Could not generate suggestion. Please try again.');
        } finally {
            setIsMagicLoading(false);
        }
    };

    // AI Smart Assign
    const handleSuggestAssignee = async () => {
        setIsMagicLoading(true);
        try {
            const staff = users.filter((u:User) => u.type === 'staff');
            
            if (!process.env.API_KEY) {
                // Fallback: Pick random tech
                const randomTech = staff.find((u:User) => u.role === 'Technician');
                if (randomTech) setAssignee(randomTech.id);
                setIsMagicLoading(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const staffData = staff.map((u:User) => ({ id: u.id, name: u.name, role: u.role, points: u.points }));
            const prompt = `
                Task: ${title} - ${desc}. 
                Staff: ${JSON.stringify(staffData)}. 
                Who is the best assignee? Return JSON: { "userId": "...", "reason": "..." }
            `;
            
            const result = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            
            let text = result.text || "{}";
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1) {
                text = text.substring(firstOpen, lastClose + 1);
            }
            const data = JSON.parse(text);
            
            if (data.userId) setAssignee(data.userId);
            if (data.reason) alert(`AI Suggestion: ${data.reason}`);

        } catch (e) {
            console.error(e);
        } finally {
            setIsMagicLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 animate-fade-in-up shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">{t.tasks.createModalTitle}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); onCreate({ title, description: desc, priority, assigneeId: assignee, deadline }); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-slate-300">{t.tasks.taskTitle}</label>
                        <div className="flex gap-2">
                            <input required className="flex-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Server Maintenance" />
                            <button type="button" onClick={handleMagicSuggest} disabled={isMagicLoading} className="bg-purple-100 text-purple-700 px-3 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50" title="AI Suggest">
                                {isMagicLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-slate-300">{t.tasks.details}</label>
                        <textarea className="w-full border rounded-lg p-2 h-24 resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={desc} onChange={e => setDesc(e.target.value)}></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-slate-300">{t.tasks.priority}</label>
                            <select className="w-full border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 dark:text-slate-300">{t.tasks.deadline}</label>
                            <input type="date" required className="w-full border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={deadline} onChange={e => setDeadline(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-slate-300">{t.tasks.assignee}</label>
                        <div className="flex gap-2">
                            <select className="flex-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={assignee} onChange={e => setAssignee(e.target.value)}>
                                <option value="">{t.tasks.selectEmployee}</option>
                                {users.filter((u:User) => u.type === 'staff').map((u:User) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <button type="button" onClick={handleSuggestAssignee} disabled={isMagicLoading} className="bg-blue-100 text-blue-700 px-3 rounded-lg hover:bg-blue-200 font-bold text-xs">
                                Auto
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors">{t.common.cancel}</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-transform hover:scale-105">{t.common.save}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TaskCommentsModal = ({ task, users, onClose, onAddComment, currentUser, t }: any) => {
    const [text, setText] = useState('');
    const commentsRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(commentsRef.current) commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }, [task.comments]);

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{task.title}</h3>
                        <span className="text-xs text-slate-500">{t.tasks.commentsTitle} ({task.comments?.length || 0})</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-900/50" ref={commentsRef}>
                    {task.comments && task.comments.length > 0 ? (
                        task.comments.map((c: TaskComment) => {
                            const isMe = c.authorId === currentUser.id;
                            const author = users.find((u:User) => u.id === c.authorId);
                            return (
                                <div key={c.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-sm shadow-sm shrink-0 border border-slate-200 dark:border-slate-600">
                                        {author?.avatar}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 dark:text-white rounded-tl-none'}`}>
                                        <div className={`text-[10px] font-bold mb-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-300'}`}>{author?.name}</div>
                                        {c.text}
                                        <div className={`text-[9px] mt-1 text-right opacity-60 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <i className="fa-regular fa-comments text-4xl mb-2"></i>
                            <p>{t.tasks.noComments}</p>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
                    <form onSubmit={(e) => { e.preventDefault(); if(text.trim()) { onAddComment(task.id, text); setText(''); } }} className="flex gap-2">
                        <input 
                            className="flex-1 bg-slate-100 dark:bg-slate-700 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder={t.tasks.writeComment}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" disabled={!text.trim()} className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md">
                            <i className="fa-solid fa-paper-plane text-xs"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
