
import React, { useState } from 'react';
import { Campaign, Customer, AppLanguage, User } from '../types';
import { translateStatus, TRANSLATIONS } from '../data';

interface MarketingProps {
    campaigns: Campaign[];
    setCampaigns: (c: Campaign[]) => void;
    customers: Customer[];
    onAddCampaign: (c: Campaign) => void;
    lang: AppLanguage;
    currentUser: User;
}

export const MarketingView = ({ campaigns, setCampaigns, customers, onAddCampaign, lang, currentUser }: MarketingProps) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'campaigns'>('overview');
    const t = TRANSLATIONS[lang].marketing;

    // Stats
    const totalSent = campaigns.reduce((acc, c) => acc + c.stats.sent, 0);
    const totalOpened = campaigns.reduce((acc, c) => acc + c.stats.opened, 0);
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

    const handleSendNow = (id: string) => {
        const campaign = campaigns.find(c => c.id === id);
        if (!campaign) return;

        // Mock Send
        const updatedCampaigns = campaigns.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    status: 'Completed',
                    sentAt: new Date().toISOString(),
                    stats: {
                        sent: customers.length, // Simulate sent to all
                        opened: Math.floor(customers.length * 0.4),
                        clicked: Math.floor(customers.length * 0.1)
                    }
                } as Campaign;
            }
            return c;
        });
        
        setCampaigns(updatedCampaigns);
        alert(t.messages.sentSuccess);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                        <i className="fa-solid fa-bullhorn"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{t.title}</h2>
                        <p className="text-slate-500 text-sm">{t.subtitle}</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={() => setShowCreateModal(true)} className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-purple-700 flex items-center gap-2 transition-transform hover:-translate-y-1">
                        <i className="fa-solid fa-plus"></i> {t.newCampaign}
                    </button>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex justify-between items-center">
                    <div>
                        <p className="text-purple-600 text-xs font-bold uppercase mb-1">{t.stats.total}</p>
                        <h3 className="text-3xl font-black text-slate-800">{campaigns.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-xl"><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex justify-between items-center">
                    <div>
                        <p className="text-blue-600 text-xs font-bold uppercase mb-1">{t.stats.sent}</p>
                        <h3 className="text-3xl font-black text-slate-800">{totalSent.toLocaleString()}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl"><i className="fa-solid fa-envelope-open-text"></i></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex justify-between items-center">
                    <div>
                        <p className="text-green-600 text-xs font-bold uppercase mb-1">{t.stats.openRate}</p>
                        <h3 className="text-3xl font-black text-slate-800">{openRate}%</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-xl"><i className="fa-solid fa-chart-pie"></i></div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">{t.table.title}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-white text-slate-500 border-b">
                            <tr>
                                <th className="p-4">{t.table.name}</th>
                                <th className="p-4">{t.table.type}</th>
                                <th className="p-4">{t.table.status}</th>
                                <th className="p-4">{t.table.audience}</th>
                                <th className="p-4">{t.table.stats}</th>
                                <th className="p-4">{t.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.length > 0 ? campaigns.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.type === 'SMS' ? 'bg-orange-100 text-orange-700' : c.type === 'Email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {c.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                            c.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-700' :
                                            c.status === 'Sent' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                            c.status === 'Scheduled' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                            'bg-slate-100 border-slate-200 text-slate-600'
                                        }`}>
                                            {translateStatus(c.status, lang)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500">{c.targetAudience}</td>
                                    <td className="p-4">
                                        <div className="flex gap-3 text-xs">
                                            <span title="Sent"><i className="fa-solid fa-paper-plane text-slate-400"></i> {c.stats.sent}</span>
                                            <span title="Opened" className="text-green-600 font-bold"><i className="fa-solid fa-eye"></i> {c.stats.opened}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {c.status === 'Draft' || c.status === 'Scheduled' ? (
                                            <button 
                                                onClick={() => handleSendNow(c.id)} 
                                                className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-700 shadow-sm"
                                            >
                                                {t.table.sendNow}
                                            </button>
                                        ) : (
                                            <button className="text-slate-400 hover:text-blue-600 text-xs font-bold border px-2 py-1 rounded hover:bg-slate-50">
                                                {t.table.report}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">{t.table.empty}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <CreateCampaignModal 
                    onClose={() => setShowCreateModal(false)} 
                    onSave={onAddCampaign} 
                    customerCount={customers.length}
                    t={t}
                    organizationId={currentUser.organizationId}
                />
            )}
        </div>
    );
};

const CreateCampaignModal = ({ onClose, onSave, customerCount, t, organizationId }: { onClose: () => void, onSave: (c: Campaign) => void, customerCount: number, t: any, organizationId: string }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');
    const [audience, setAudience] = useState<'All' | 'VIP' | 'New' | 'Inactive'>('All');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCampaign: Campaign = {
            id: `CMP-${Date.now()}`,
            organizationId: organizationId,
            name,
            type,
            status: 'Draft',
            targetAudience: audience,
            content,
            stats: { sent: 0, opened: 0, clicked: 0 }
        };
        onSave(newCampaign);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in-up shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h3 className="text-xl font-bold text-slate-800">{t.form.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">{t.form.name}</label>
                        <input required className="w-full border rounded-lg p-2" placeholder={t.form.placeholderName} value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">{t.form.channel}</label>
                            <select className="w-full border rounded-lg p-2" value={type} onChange={e => setType(e.target.value as any)}>
                                <option value="Email">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="WhatsApp">WhatsApp</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">{t.form.audience}</label>
                            <select className="w-full border rounded-lg p-2" value={audience} onChange={e => setAudience(e.target.value as any)}>
                                <option value="All">{t.audienceOptions?.all || 'All'} ({customerCount})</option>
                                <option value="VIP">{t.audienceOptions?.vip || 'VIP'}</option>
                                <option value="New">{t.audienceOptions?.new || 'New'}</option>
                                <option value="Inactive">{t.audienceOptions?.inactive || 'Inactive'}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">{t.form.content}</label>
                        <textarea required className="w-full border rounded-lg p-3 h-32 resize-none" placeholder={t.form.placeholderContent} value={content} onChange={e => setContent(e.target.value)}></textarea>
                        <p className="text-xs text-slate-400 mt-1 text-left">{content.length} characters</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">{t.form.cancel}</button>
                        <button type="submit" className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg">{t.form.save}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
