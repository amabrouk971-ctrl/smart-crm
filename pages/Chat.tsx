import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, AppLanguage } from '../types';
import { translateRole } from '../data';
import { GoogleGenAI } from "@google/genai";

interface ChatProps {
    users: User[];
    currentUser: User;
    messages: ChatMessage[];
    onSendMessage: (receiverId: string, text: string) => void;
    onMarkRead: (senderId: string) => void;
    lang: AppLanguage;
}

export const ChatView = ({ users, currentUser, messages, onSendMessage, onMarkRead, lang }: ChatProps) => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isGeneratingReply, setIsGeneratingReply] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter out current user from contacts list
    const contacts = users.filter(u => u.id !== currentUser.id);

    // Get selected user object
    const selectedUser = users.find(u => u.id === selectedUserId);

    // Filter messages for the active conversation
    const activeMessages = messages.filter(m => 
        (m.senderId === currentUser.id && m.receiverId === selectedUserId) ||
        (m.senderId === selectedUserId && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Mark messages as read when viewing conversation
    useEffect(() => {
        if (selectedUserId) {
            // Check if there are unread messages from this user before calling handler
            const hasUnread = messages.some(m => m.senderId === selectedUserId && m.receiverId === currentUser.id && !m.read);
            if (hasUnread) {
                onMarkRead(selectedUserId);
            }
        }
    }, [selectedUserId, messages, currentUser.id, onMarkRead]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (selectedUserId && newMessage.trim()) {
            onSendMessage(selectedUserId, newMessage);
            setNewMessage('');
        }
    };

    const handleSmartReply = async () => {
        if (!selectedUserId) return;
        
        if (!process.env.API_KEY) {
             alert(lang === 'ar' ? 'يرجى إعداد مفتاح API في الإعدادات لتفعيل الرد الذكي.' : 'Please configure API Key in settings to enable Smart Reply.');
             return;
        }

        setIsGeneratingReply(true);
        try {
            // Get the last message sent BY the contact TO the current user
            const lastMsg = messages
                .filter(m => m.senderId === selectedUserId && m.receiverId === currentUser.id)
                .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            if (!lastMsg) {
                // If no message received, suggest a greeting
                setNewMessage(lang === 'ar' ? "مرحباً، كيف يمكنني مساعدتك؟" : "Hello, how can I help?");
                setIsGeneratingReply(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Generate a short, professional reply to this message: "${lastMsg.message}". Language: ${lang === 'ar' ? 'Arabic' : 'English'}. Return only the reply text, no quotes.`;
            
            const result = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt 
            });
            
            if (result.text) {
                setNewMessage(result.text.trim());
            }
        } catch (e) {
            console.error(e);
            alert(lang === 'ar' ? 'حدث خطأ أثناء توليد الرد' : 'Error generating reply');
        } finally {
            setIsGeneratingReply(false);
        }
    };

    const getUnreadCount = (senderId: string) => {
        return messages.filter(m => m.senderId === senderId && m.receiverId === currentUser.id && !m.read).length;
    };

    const getLastMessage = (contactId: string) => {
        const contactMessages = messages.filter(m => 
            (m.senderId === contactId && m.receiverId === currentUser.id) ||
            (m.senderId === currentUser.id && m.receiverId === contactId)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return contactMessages[0];
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
            {/* Contacts List Sidebar */}
            <div className={`w-full md:w-80 border-l bg-slate-50 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b bg-white">
                    <h2 className="font-bold text-lg text-slate-800">المحادثات</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contacts.map(contact => {
                        const unreadCount = getUnreadCount(contact.id);
                        const lastMsg = getLastMessage(contact.id);
                        
                        return (
                            <div 
                                key={contact.id}
                                onClick={() => setSelectedUserId(contact.id)}
                                className={`p-4 border-b cursor-pointer transition-colors hover:bg-white flex gap-3 items-center
                                    ${selectedUserId === contact.id ? 'bg-white border-r-4 border-r-blue-600' : 'border-r-4 border-r-transparent'}
                                `}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl border border-white shadow-sm overflow-hidden">
                                        {contact.avatar}
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                            {unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-bold text-sm truncate ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {contact.name}
                                        </h3>
                                        {lastMsg && (
                                            <span className="text-[10px] text-slate-400">
                                                {formatTime(lastMsg.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate ${unreadCount > 0 ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                                        {lastMsg ? (
                                            lastMsg.senderId === currentUser.id ? `أنت: ${lastMsg.message}` : lastMsg.message
                                        ) : (
                                            <span className="italic opacity-50">لا توجد رسائل</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Conversation Area */}
            <div className={`flex-1 flex flex-col bg-slate-100 ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b flex items-center gap-3 shadow-sm z-10">
                            <button onClick={() => setSelectedUserId(null)} className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-full">
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg overflow-hidden">
                                {selectedUser.avatar}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{selectedUser.name}</h3>
                                <p className="text-xs text-slate-500">{translateRole(selectedUser.role, lang)}</p>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeMessages.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 opacity-60">
                                    <i className="fa-regular fa-paper-plane text-4xl mb-2"></i>
                                    <p>ابدأ المحادثة مع {selectedUser.name}</p>
                                </div>
                            ) : (
                                activeMessages.map(msg => {
                                    const isMe = msg.senderId === currentUser.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl p-3 px-4 shadow-sm text-sm relative group
                                                ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}
                                            `}>
                                                {msg.message}
                                                <div className={`text-[9px] mt-1 flex items-center gap-1 justify-end ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {formatTime(msg.timestamp)}
                                                    {isMe && (
                                                        <span>
                                                            {msg.read ? <i className="fa-solid fa-check-double"></i> : <i className="fa-solid fa-check"></i>}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t">
                            <form onSubmit={handleSend} className="flex gap-2 items-center">
                                {/* Smart Reply Button */}
                                <button 
                                    type="button"
                                    onClick={handleSmartReply}
                                    disabled={isGeneratingReply}
                                    className="text-purple-600 bg-purple-50 hover:bg-purple-100 p-3 rounded-full transition-colors group relative"
                                    title="Smart Reply AI"
                                >
                                    {isGeneratingReply ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                    {!isGeneratingReply && (
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            AI Suggest
                                        </span>
                                    )}
                                </button>

                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="اكتب رسالة..." 
                                    className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()} 
                                    className="bg-blue-600 text-white w-12 h-12 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-200 transition-all active:scale-95"
                                >
                                    <i className="fa-solid fa-paper-plane text-sm"></i>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <i className="fa-regular fa-comments text-6xl mb-4 opacity-30"></i>
                        <p className="text-lg font-bold">اختر محادثة للبدء</p>
                    </div>
                )}
            </div>
        </div>
    );
};