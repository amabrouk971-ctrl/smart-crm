
import React, { useState } from 'react';
import { FeedPost, User, AppLanguage } from '../types';
import { translateRole } from '../data';

interface FeedProps {
    feed: FeedPost[];
    users: User[];
    currentUser: User;
    onLike: (postId: string) => void;
    onComment: (postId: string, text: string) => void;
    onAddPost: (post: Partial<FeedPost>) => void;
    lang: AppLanguage;
}

interface FeedPostItemProps {
    post: FeedPost;
    users: User[];
    currentUser: User;
    onLike: (id: string) => void;
    onComment: (id: string, t: string) => void;
    lang: AppLanguage;
}

const CreatePostWidget = ({ currentUser, onAddPost, lang }: { currentUser: User, onAddPost: (p: Partial<FeedPost>) => void, lang: AppLanguage }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!content.trim() && !image) return;
        
        onAddPost({
            authorId: currentUser.id,
            content: content,
            imageUrl: image || undefined,
            type: 'announcement', // General user post
            title: 'منشور جديد'
        });

        setContent('');
        setImage(null);
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {currentUser.avatar}
                </div>
                <div className="flex-1">
                    <textarea 
                        className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none resize-none transition-all"
                        placeholder="شارك فريقك أفكارك، ملفاتك، أو إنجازاتك..."
                        rows={3}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    ></textarea>
                    
                    {image && (
                        <div className="mt-2 relative inline-block">
                            <img src={image} alt="Preview" className="h-24 rounded-lg border border-slate-200" />
                            <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-3 border-t pt-3">
                        <label className="flex items-center gap-2 text-slate-500 hover:text-blue-600 cursor-pointer text-sm font-bold transition-colors">
                            <i className="fa-solid fa-image text-lg"></i>
                            <span>صورة / مستند</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <button 
                            onClick={handleSubmit}
                            disabled={!content.trim() && !image}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                        >
                            نشر <i className="fa-solid fa-paper-plane ml-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeedPostItem: React.FC<FeedPostItemProps> = ({ post, users, currentUser, onLike, onComment, lang }) => {
    const author = users.find(u => u.id === post.authorId);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const isLiked = post.likes.includes(currentUser.id);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if(!commentText.trim()) return;
        onComment(post.id, commentText);
        setCommentText('');
        setShowComments(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 flex items-center gap-3 border-b border-slate-50">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">
                    {author?.avatar || '📢'}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{author?.name || 'النظام'}</h3>
                    <div className="text-xs text-slate-500 flex gap-2">
                        <span>{author ? translateRole(author.role, lang) : 'إشعار تلقائي'}</span>
                        <span>•</span>
                        <span>{new Date(post.timestamp).toLocaleString('ar-EG')}</span>
                    </div>
                </div>
                <div className="mr-auto">
                    {post.type === 'achievement' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">🏆 إنجاز</span>}
                    {post.type === 'certification' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">🎓 شهادة</span>}
                    {post.type === 'task_completion' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">⚡ سرعة</span>}
                    {post.type === 'announcement' && post.authorId === 'SYSTEM' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">📢 هام</span>}
                </div>
            </div>

            <div className="p-4">
                {post.title && post.title !== 'منشور جديد' && <h4 className="font-bold text-lg mb-2 text-slate-800">{post.title}</h4>}
                <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {post.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={post.imageUrl} alt="Post Attachment" className="w-full h-auto max-h-96 object-contain" />
                    </div>
                )}
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                    <button 
                        onClick={() => onLike(post.id)}
                        className={`flex items-center gap-2 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                    >
                        <i className={`fa-heart ${isLiked ? 'fa-solid' : 'fa-regular'}`}></i>
                        {post.likes.length} إعجاب
                    </button>
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <i className="fa-regular fa-comment"></i>
                        {post.comments.length} تعليق
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-slate-50 p-4 border-t border-slate-200">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {post.comments.map(comment => {
                            const commenter = users.find(u => u.id === comment.userId);
                            return (
                                <div key={comment.id} className="flex gap-2 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm shrink-0">
                                        {commenter?.avatar}
                                    </div>
                                    <div className="bg-white p-2 px-3 rounded-2xl rounded-tr-none border border-slate-200 shadow-sm text-sm">
                                        <span className="font-bold text-slate-800 block text-xs mb-0.5">{commenter?.name}</span>
                                        {comment.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <form onSubmit={handleSubmitComment} className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="أكتب تعليقاً..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                        />
                        <button type="submit" disabled={!commentText.trim()} className="text-blue-600 hover:bg-blue-100 p-2 rounded-full disabled:opacity-50">
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export const FeedView = ({ feed, users, currentUser, onLike, onComment, onAddPost, lang }: FeedProps) => {
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h1 className="text-3xl font-bold mb-2">أخبار الفريق وإنجازاته 🚀</h1>
                <p className="text-blue-100">شارك زملاءك لحظات النجاح والتطور المهني</p>
            </div>

            <CreatePostWidget currentUser={currentUser} onAddPost={onAddPost} lang={lang} />

            {feed.map(post => (
                <FeedPostItem 
                    key={post.id} 
                    post={post} 
                    users={users} 
                    currentUser={currentUser} 
                    onLike={onLike} 
                    onComment={onComment}
                    lang={lang}
                />
            ))}

            {feed.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <i className="fa-solid fa-newspaper text-6xl mb-4 opacity-30"></i>
                    <p>لا توجد منشورات بعد. كن أول من يحقق إنجازاً!</p>
                </div>
            )}
        </div>
    );
};
