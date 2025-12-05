
import React, { useState, useEffect } from 'react';
import { Course, Quiz, QuizResult, User, QuizQuestion, QuestionType, QuizOption, CourseProgress, AppLanguage, CourseBooking } from '../types';
import { MOCK_QUIZZES } from '../data';
import { Confetti } from '../components/Common';

interface LearningHubProps {
  courses: Course[];
  quizzes: Quiz[];
  currentUser: User;
  courseProgress: CourseProgress[];
  onCourseComplete: (id: string) => void;
  onQuizComplete: (score: number, max: number) => void;
  setCourses: (courses: Course[]) => void;
  lang: AppLanguage;
  bookings?: CourseBooking[];
  onBookCourse?: (booking: CourseBooking) => void;
}

export const LearningHub = ({ courses, quizzes: initialQuizzes, currentUser, courseProgress, onCourseComplete, onQuizComplete, lang, setCourses, bookings = [], onBookCourse }: LearningHubProps) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'quizzes' | 'booking'>('courses');
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';

  const handleCreateQuiz = (newQuiz: Quiz) => {
      setQuizzes([...quizzes, newQuiz]);
      setIsBuilderOpen(false);
  };

  const handleDuplicateCourse = (courseId: string) => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const newCourse: Course = {
          ...course,
          id: `CRS-${Date.now()}`,
          title: `${course.title} (Repeat)`,
          startDate: nextWeek.toISOString().split('T')[0]
      };
      
      if(confirm(`Repeat course "${course.title}" for next week?`)) {
          setCourses([...courses, newCourse]);
          alert('Course duplicated successfully.');
      }
  };

  const handleBook = (courseId: string) => {
      if(!onBookCourse) return;
      const isBooked = bookings.some(b => b.courseId === courseId && b.userId === currentUser.id);
      if(isBooked) return alert("Already booked!");

      onBookCourse({
          id: `BK-${Date.now()}`,
          organizationId: currentUser.organizationId,
          courseId,
          userId: currentUser.id,
          bookingDate: new Date().toISOString(),
          status: 'Confirmed'
      });
      alert('تم حجز مكانك بنجاح! 🎓');
  };

  // Helper to convert YouTube links to Embed format
  const getEmbedUrl = (url: string) => {
      if (!url) return '';
      // Handle standard watch URLs
      if (url.includes('youtube.com/watch?v=')) {
          const videoId = url.split('v=')[1]?.split('&')[0];
          return `https://www.youtube.com/embed/${videoId}`;
      }
      // Handle shortened youtu.be URLs
      if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1]?.split('?')[0];
          return `https://www.youtube.com/embed/${videoId}`;
      }
      // Return as is if it's already an embed or other source
      return url;
  };

  // Calculate overall progress
  const myCompletedCourses = courseProgress.filter(cp => cp.userId === currentUser.id && cp.isCompleted);
  const totalCourses = courses.length;
  const completedCount = myCompletedCourses.filter(p => courses.find(c => c.id === p.courseId)).length;
  const progressPercentage = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2 overflow-x-auto">
         <div className="flex gap-4">
            <button onClick={() => setActiveTab('courses')} className={`pb-2 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'courses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>الدورات التدريبية</button>
            <button onClick={() => setActiveTab('booking')} className={`pb-2 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'booking' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>حجز الكورسات (Booking)</button>
            <button onClick={() => setActiveTab('quizzes')} className={`pb-2 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'quizzes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>الاختبارات والتحديات</button>
         </div>
         {isAdmin && activeTab === 'quizzes' && (
             <button onClick={() => setIsBuilderOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700">
                 <i className="fa-solid fa-plus ml-2"></i> إنشاء اختبار جديد
             </button>
         )}
      </div>

      {activeTab === 'courses' && (
        <div className="space-y-6">
            {/* Overall Progress Widget */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">تقدمك التعليمي</h2>
                    <span className="font-bold text-2xl">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                    <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-sm mt-2 opacity-80">{completedCount} من {totalCourses} دورات مكتملة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
                const isCompleted = myCompletedCourses.some(cp => cp.courseId === course.id);
                return (
                    <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                        <div className="h-48 bg-slate-200 relative">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        <button onClick={() => setActiveCourse(course)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-play-circle text-5xl text-white"></i>
                        </button>
                        {isCompleted && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                <i className="fa-solid fa-check-circle"></i> مكتمل
                            </div>
                        )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                            <p className="text-sm text-slate-500 mb-3 flex-1">{course.description}</p>
                            
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>التقدم</span>
                                    <span>{isCompleted ? '100%' : '0%'}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500 w-full' : 'bg-slate-300 w-0'}`}></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded-lg">
                                <span><i className="fa-regular fa-clock ml-1"></i> {course.duration} دقيقة</span>
                                <span>+{course.points} نقطة</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
      )}

      {activeTab === 'booking' && (
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg mb-2">جدول الكورسات المتاحة</h3>
                  <p className="text-sm text-slate-500">احجز مقعدك في الدورات القادمة أو أعد التسجيل في الدورات الدورية.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.filter(c => c.status === 'Active').map(course => {
                      const bookedCount = bookings.filter(b => b.courseId === course.id).length;
                      const isFull = (course.maxCapacity || 20) <= bookedCount;
                      const hasBooked = bookings.some(b => b.courseId === course.id && b.userId === currentUser.id);

                      return (
                          <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col relative overflow-hidden group">
                              {course.recurrence && course.recurrence !== 'None' && (
                                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">
                                      {course.recurrence === 'Weekly' ? 'يتكرر أسبوعياً' : 'يتكرر شهرياً'}
                                  </div>
                              )}
                              
                              <div className="flex items-start gap-4 mb-4">
                                  <img src={course.thumbnail} className="w-16 h-16 rounded-xl object-cover" alt="Thumb" />
                                  <div>
                                      <h4 className="font-bold text-slate-800">{course.title}</h4>
                                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                          <i className="fa-solid fa-calendar-day"></i> {course.startDate || 'TBA'}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                          <i className="fa-solid fa-chalkboard-user"></i> {course.instructor || 'SmartTech Team'}
                                      </div>
                                  </div>
                              </div>

                              <div className="flex items-center justify-between text-xs mb-4 bg-slate-50 p-2 rounded-lg">
                                  <span className="font-bold text-slate-600">المقاعد: {bookedCount} / {course.maxCapacity || 20}</span>
                                  {isFull ? <span className="text-red-500 font-bold">مكتمل</span> : <span className="text-green-600 font-bold">متاح</span>}
                              </div>

                              <div className="mt-auto flex gap-2">
                                  {!hasBooked ? (
                                      <button 
                                        onClick={() => handleBook(course.id)}
                                        disabled={isFull}
                                        className={`flex-1 py-2 rounded-lg font-bold text-sm text-white transition-colors ${isFull ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                      >
                                          {isFull ? 'Full' : 'حجز الآن'}
                                      </button>
                                  ) : (
                                      <button disabled className="flex-1 py-2 rounded-lg font-bold text-sm bg-green-100 text-green-700 border border-green-200">
                                          <i className="fa-solid fa-check"></i> تم الحجز
                                      </button>
                                  )}
                                  
                                  {isAdmin && (
                                      <button onClick={() => handleDuplicateCourse(course.id)} className="bg-slate-100 text-slate-600 px-3 rounded-lg hover:bg-slate-200" title="تكرار للأسبوع القادم">
                                          <i className="fa-solid fa-repeat"></i>
                                      </button>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}
      
      {activeTab === 'quizzes' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-indigo-200 transition-colors">
                 <div>
                    <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-lg">{quiz.title}</h3>
                         <span className="text-3xl opacity-20 group-hover:opacity-100 transition-opacity">🎮</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">{quiz.description}</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                       <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">{quiz.questions.length} سؤال</span>
                       <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-100">{quiz.totalPoints} نقطة</span>
                       <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200">
                           {quiz.targetAudience === 'staff' ? 'للموظفين' : quiz.targetAudience === 'student' ? 'للطلاب' : 'للجميع'}
                       </span>
                    </div>
                 </div>
                 <button onClick={() => setActiveQuiz(quiz)} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transform transition hover:-translate-y-1">
                    ابدأ التحدي 🚀
                 </button>
              </div>
            ))}
         </div>
      )}

      {/* Course Modal */}
      {activeCourse && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-black relative">
                 <iframe 
                    width="100%" 
                    height="100%" 
                    src={`${getEmbedUrl(activeCourse.videoUrl)}?autoplay=1`}
                    title="Course Video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                 </iframe>
              </div>
              <div className="p-6 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-bold">{activeCourse.title}</h2>
                    <p className="text-slate-500">{activeCourse.description}</p>
                 </div>
                 <button 
                   onClick={() => { onCourseComplete(activeCourse.id); setActiveCourse(null); }}
                   className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700"
                 >
                    إنهاء والحصول على النقاط
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Quiz Player (Kahoot Style) */}
      {activeQuiz && (
         <GamePlayer quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={onQuizComplete} />
      )}

      {/* Quiz Builder */}
      {isBuilderOpen && (
          <QuizBuilder onClose={() => setIsBuilderOpen(false)} onSave={handleCreateQuiz} organizationId={currentUser.organizationId} />
      )}
    </div>
  );
};

// ... (Rest of QuizBuilder remains same)
const QuizBuilder = ({ onClose, onSave, organizationId }: { onClose: () => void, onSave: (q: Quiz) => void, organizationId: string }) => {
    // ... (Keep existing implementation)
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    
    // Temp Question State
    const [qText, setQText] = useState('');
    const [qType, setQType] = useState<QuestionType>('multiple_choice');
    const [qPoints, setQPoints] = useState(10);
    const [qTime, setQTime] = useState(20);
    const [qOptions, setQOptions] = useState<QuizOption[]>([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
    ]);

    const addOption = () => {
        setQOptions([...qOptions, { id: Date.now().toString(), text: '', isCorrect: false }]);
    };

    const updateOption = (idx: number, field: string, val: any) => {
        const newOpts = [...qOptions];
        if (field === 'isCorrect' && qType !== 'multiple_choice') {
             // For T/F or Single choice, reset others
             newOpts.forEach(o => o.isCorrect = false);
        }
        (newOpts[idx] as any)[field] = val;
        setQOptions(newOpts);
    };

    const saveQuestion = () => {
        if (!qText) return alert('أدخل نص السؤال');
        const newQ: QuizQuestion = {
            id: `q-${Date.now()}`,
            text: qText,
            type: qType,
            points: qPoints,
            timeLimit: qTime,
            options: qOptions
        };
        setQuestions([...questions, newQ]);
        // Reset
        setQText('');
        setQOptions([{ id: Date.now().toString(), text: '', isCorrect: false }, { id: (Date.now()+1).toString(), text: '', isCorrect: false }]);
    };

    const handleFinalSave = () => {
        if (!title || questions.length === 0) return alert('الرجاء إكمال بيانات الاختبار');
        const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
        onSave({
            id: `QZ-${Date.now()}`,
            organizationId,
            title,
            description: desc,
            questions,
            targetAudience: 'both',
            createdBy: 'ADMIN',
            totalPoints
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col shadow-2xl animate-fade-in-up">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold">منشئ الاختبارات</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold mb-1">عنوان الاختبار</label>
                            <input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                             <label className="block text-sm font-bold mb-1">الوصف</label>
                             <input className="w-full border p-2 rounded" value={desc} onChange={e => setDesc(e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">إضافة سؤال جديد</h3>
                        <div className="mb-4">
                             <input className="w-full text-lg font-bold border-b-2 border-blue-300 bg-transparent outline-none pb-2" placeholder="اكتب السؤال هنا..." value={qText} onChange={e => setQText(e.target.value)} />
                        </div>
                        
                        <div className="flex gap-4 mb-4">
                            <select className="p-2 rounded border" value={qType} onChange={e => setQType(e.target.value as QuestionType)}>
                                <option value="multiple_choice">اختيار من متعدد</option>
                                <option value="true_false">صح / خطأ</option>
                                <option value="arrange">رتب الأحداث</option>
                            </select>
                            <select className="p-2 rounded border" value={qTime} onChange={e => setQTime(Number(e.target.value))}>
                                <option value={10}>10 ثواني</option>
                                <option value={20}>20 ثانية</option>
                                <option value={30}>30 ثانية</option>
                                <option value={60}>60 ثانية</option>
                            </select>
                            <input type="number" className="p-2 rounded border w-24" placeholder="النقاط" value={qPoints} onChange={e => setQPoints(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-bold text-slate-500">الخيارات (حدد الإجابة الصحيحة)</label>
                            {qOptions.map((opt, idx) => (
                                <div key={opt.id} className="flex gap-2 items-center">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                    <input className="flex-1 border p-2 rounded" placeholder={`الخيار ${idx + 1}`} value={opt.text} onChange={e => updateOption(idx, 'text', e.target.value)} />
                                    
                                    {qType !== 'arrange' && (
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 accent-green-600" 
                                            checked={opt.isCorrect} 
                                            onChange={e => updateOption(idx, 'isCorrect', e.target.checked)} 
                                        />
                                    )}
                                    <button onClick={() => setQOptions(qOptions.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                                </div>
                            ))}
                            <button onClick={addOption} className="text-blue-600 text-sm font-bold">+ إضافة خيار</button>
                        </div>
                        
                        <button onClick={saveQuestion} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 w-full">حفظ السؤال</button>
                    </div>

                    <div className="mt-8">
                        <h3 className="font-bold text-slate-700 mb-2">أسئلة الاختبار ({questions.length})</h3>
                        {questions.map((q, idx) => (
                            <div key={q.id} className="p-3 border rounded-lg mb-2 bg-slate-50 flex justify-between">
                                <span>{idx + 1}. {q.text}</span>
                                <span className="text-xs bg-slate-200 px-2 py-1 rounded">{q.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                     <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">إلغاء</button>
                     <button onClick={handleFinalSave} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">نشر الاختبار</button>
                </div>
            </div>
        </div>
    );
};

// ... (Keep GamePlayer component unchanged)
const GamePlayer = ({ quiz, onClose, onComplete }: { quiz: Quiz, onClose: () => void, onComplete: (score: number, max: number) => void }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'question' | 'feedback' | 'scoreboard' | 'final'>('intro');
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [arrangedOptions, setArrangedOptions] = useState<QuizOption[]>([]);

  const question = quiz.questions[currentQIndex];
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
  const shapes = ['fa-shapes', 'fa-circle', 'fa-square', 'fa-play']; 

  useEffect(() => {
     let interval: any;
     if (gameState === 'question' && timer > 0) {
         interval = setInterval(() => setTimer(t => t - 1), 1000);
     } else if (gameState === 'question' && timer === 0) {
         handleTimeOut();
     }
     return () => clearInterval(interval);
  }, [gameState, timer]);

  useEffect(() => {
      if (gameState === 'question' && question.type === 'arrange') {
          const shuffled = [...question.options].sort(() => Math.random() - 0.5);
          setArrangedOptions(shuffled);
      }
  }, [gameState, question]);

  const startGame = () => {
     setGameState('question');
     setTimer(quiz.questions[0].timeLimit);
  };

  const handleTimeOut = () => {
      setAnswerResult('timeout');
      setGameState('feedback');
      setStreak(0);
  };

  const submitAnswer = (selectedId?: string) => {
      let isCorrect = false;
      const maxPoints = question.points;
      
      if (question.type === 'arrange') {
          const correctOrderIds = question.options.map(o => o.id);
          const userOrderIds = arrangedOptions.map(o => o.id);
          isCorrect = JSON.stringify(correctOrderIds) === JSON.stringify(userOrderIds);
      } else {
          const selectedOption = question.options.find(o => o.id === selectedId);
          isCorrect = selectedOption?.isCorrect || false;
      }

      setAnswerResult(isCorrect ? 'correct' : 'wrong');
      
      if (isCorrect) {
          const timeBonus = Math.floor((timer / question.timeLimit) * (maxPoints * 0.5));
          const totalEarned = maxPoints + timeBonus + (streak * 10);
          setScore(s => s + totalEarned);
          setStreak(s => s + 1);
      } else {
          setStreak(0);
      }
      
      setGameState('feedback');
  };

  const nextQuestion = () => {
      if (currentQIndex < quiz.questions.length - 1) {
          setCurrentQIndex(prev => prev + 1);
          setGameState('question');
          setTimer(quiz.questions[currentQIndex + 1].timeLimit);
          setAnswerResult(null);
      } else {
          setGameState('final');
          onComplete(score, quiz.totalPoints);
      }
  };

  const moveOption = (idx: number, dir: 'up' | 'down') => {
      const newArr = [...arrangedOptions];
      if (dir === 'up' && idx > 0) {
          [newArr[idx], newArr[idx-1]] = [newArr[idx-1], newArr[idx]];
      } else if (dir === 'down' && idx < newArr.length - 1) {
          [newArr[idx], newArr[idx+1]] = [newArr[idx+1], newArr[idx]];
      }
      setArrangedOptions(newArr);
  };

  if (gameState === 'intro') {
      return (
          <div className="fixed inset-0 bg-indigo-900 z-50 flex flex-col items-center justify-center text-white animate-fade-in-up">
              <h1 className="text-6xl font-bold mb-4 animate-bounce">مستعد؟</h1>
              <h2 className="text-3xl mb-8 opacity-80">{quiz.title}</h2>
              <div className="text-9xl mb-12">🚀</div>
              <button onClick={startGame} className="bg-white text-indigo-900 px-12 py-4 rounded-full font-bold text-2xl hover:scale-110 transition-transform shadow-lg shadow-indigo-500/50">
                  ابدأ اللعب
              </button>
          </div>
      );
  }

  if (gameState === 'final') {
      return (
        <div className="fixed inset-0 bg-indigo-900 z-50 flex flex-col items-center justify-center text-white animate-fade-in-up overflow-hidden">
            <Confetti />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
            
            <h1 className="text-5xl font-bold mb-4">انتهى التحدي!</h1>
            <div className="bg-white text-indigo-900 rounded-3xl p-12 text-center shadow-2xl z-10 max-w-lg w-full">
                <div className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">النتيجة النهائية</div>
                <div className="text-7xl font-bold mb-6">{score}</div>
                <div className="flex justify-center gap-4 text-center">
                    <div className="bg-slate-100 p-4 rounded-xl flex-1">
                        <div className="text-2xl font-bold">{quiz.questions.length}</div>
                        <div className="text-xs text-slate-500">أسئلة</div>
                    </div>
                </div>
                <button onClick={onClose} className="mt-8 bg-black text-white px-8 py-3 rounded-xl font-bold w-full hover:bg-slate-800">خروج</button>
            </div>
        </div>
      );
  }

  if (gameState === 'feedback') {
      const isGood = answerResult === 'correct';
      return (
          <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-white animate-fade-in-up transition-colors duration-500
              ${isGood ? 'bg-green-600' : 'bg-red-600'}
          `}>
              <div className="text-9xl mb-4 animate-bounce">
                  {isGood ? <i className="fa-solid fa-check-circle"></i> : <i className="fa-solid fa-circle-xmark"></i>}
              </div>
              <h2 className="text-5xl font-bold mb-2">{isGood ? 'إجابة صحيحة!' : answerResult === 'timeout' ? 'انتهى الوقت!' : 'إجابة خاطئة'}</h2>
              <h3 className="text-2xl opacity-80 mb-8">{isGood ? `+ ${score} نقطة` : 'لا تيأس، ركز في القادم'}</h3>
              
              <button onClick={nextQuestion} className="bg-white/20 backdrop-blur-md border-2 border-white px-12 py-4 rounded-full font-bold text-xl hover:bg-white hover:text-gray-800 transition-colors">
                  السؤال التالي
              </button>
          </div>
      );
  }

  return (
      <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col">
          <div className="bg-white p-4 flex justify-between items-center shadow-sm">
               <div className="flex gap-2">
                   <span className="bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-600">{currentQIndex + 1} / {quiz.questions.length}</span>
               </div>
               <div className="flex-1 text-center">
                   <h2 className="font-bold text-lg hidden md:block">{quiz.title}</h2>
               </div>
               <div className="font-bold text-xl bg-slate-900 text-white px-4 py-1 rounded-full">{score}</div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-6xl mx-auto w-full">
               <div className="bg-white rounded-2xl shadow-lg p-8 w-full text-center mb-6 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-2 bg-purple-600 transition-all duration-1000 ease-linear" style={{ width: `${(timer / question.timeLimit) * 100}%` }}></div>
                   
                   <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-6">{question.text}</h2>
                   
                   <div className="absolute top-4 right-4 w-12 h-12 rounded-full border-4 border-purple-600 flex items-center justify-center font-bold text-xl text-purple-600">
                       {timer}
                   </div>

                   {question.media && (
                        <div className="max-w-md mx-auto rounded-xl overflow-hidden shadow-md mb-4">
                            <img src={question.media.url} className="w-full object-cover" alt="Question" />
                        </div>
                   )}
               </div>

               {question.type === 'arrange' ? (
                   <div className="w-full max-w-2xl space-y-2">
                       {arrangedOptions.map((opt, idx) => (
                           <div key={opt.id} className="bg-white p-4 rounded-xl shadow border-2 border-slate-200 flex justify-between items-center">
                               <div className="font-bold text-lg"><span className="text-slate-400 ml-2">#{idx+1}</span> {opt.text}</div>
                               <div className="flex gap-1">
                                   <button onClick={() => moveOption(idx, 'up')} disabled={idx === 0} className="p-2 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"><i className="fa-solid fa-arrow-up"></i></button>
                                   <button onClick={() => moveOption(idx, 'down')} disabled={idx === arrangedOptions.length - 1} className="p-2 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"><i className="fa-solid fa-arrow-down"></i></button>
                               </div>
                           </div>
                       ))}
                       <button onClick={() => submitAnswer()} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-xl mt-4 shadow-lg hover:bg-indigo-700">تأكيد الترتيب</button>
                   </div>
               ) : (
                   <div className={`grid gap-4 w-full h-full max-h-64 ${question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                       {question.options.map((opt, idx) => (
                           <button 
                              key={opt.id}
                              onClick={() => submitAnswer(opt.id)}
                              className={`${colors[idx % 4]} text-white rounded-2xl p-6 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-4 text-right`}
                           >
                               <div className="text-3xl opacity-50"><i className={`fa-solid ${shapes[idx % 4]}`}></i></div>
                               <span className="text-xl md:text-2xl font-bold">{opt.text}</span>
                           </button>
                       ))}
                   </div>
               )}
          </div>
      </div>
  );
};
