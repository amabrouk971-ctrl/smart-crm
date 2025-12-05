
import React, { useState } from 'react';
import { InventoryItem, POSCategory } from '../../types';
import { COLORS, BackHeader } from './Shared';

export const ItemForm = ({ onBack, onSave, categories }: { onBack: () => void, onSave: (i: Partial<InventoryItem>) => void, categories: POSCategory[] }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(categories[0]?.name || '');
    const [color, setColor] = useState('bg-slate-500');
    const colors = ['bg-red-500', 'bg-pink-600', 'bg-purple-600', 'bg-indigo-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500', 'bg-orange-500', 'bg-slate-500'];

    return (
        <div className={`flex flex-col h-full ${COLORS.bg} animate-fade-in-up`}>
            <BackHeader title="Create Item" onBack={onBack} action={<button onClick={() => { onSave({name, sellingPrice: Number(price), category}); onBack(); }} className="text-white font-bold uppercase text-sm">Save</button>} />
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div><label className={`block text-xs ${COLORS.textSecondary} mb-1`}>Name</label><input className={`w-full ${COLORS.inputBg} ${COLORS.inputBorder} ${COLORS.text} py-2 outline-none`} value={name} onChange={e => setName(e.target.value)} /></div>
                <div>
                    <label className={`block text-xs ${COLORS.textSecondary} mb-1`}>Category</label>
                    <select className={`w-full ${COLORS.inputBg} ${COLORS.inputBorder} ${COLORS.text} py-2 outline-none bg-[#121212]`} value={category} onChange={e => setCategory(e.target.value)}>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div><label className={`block text-xs ${COLORS.textSecondary} mb-1`}>Price</label><input type="number" className={`w-full ${COLORS.inputBg} ${COLORS.inputBorder} ${COLORS.text} py-2 outline-none`} value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></div>
                <div>
                    <label className={`block text-xs ${COLORS.textSecondary} mb-2`}>Representation</label>
                    <div className="grid grid-cols-5 gap-3">
                        {colors.map(c => <div key={c} onClick={() => setColor(c)} className={`aspect-square rounded-lg cursor-pointer ${c} ${color === c ? 'ring-2 ring-white' : ''}`}></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CategoryForm = ({ onBack, onSave }: { onBack: () => void, onSave: (c: Partial<POSCategory>) => void }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('bg-blue-500');
    const colors = ['bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500'];

    return (
        <div className={`flex flex-col h-full ${COLORS.bg} animate-fade-in-up`}>
            <BackHeader title="Create Category" onBack={onBack} action={<button onClick={() => { onSave({name, color}); onBack(); }} className="text-white font-bold uppercase text-sm">Save</button>} />
            <div className="p-4 space-y-6">
                <input className={`w-full ${COLORS.inputBg} ${COLORS.inputBorder} ${COLORS.text} py-2 outline-none`} placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} autoFocus />
                <div className="grid grid-cols-4 gap-4">
                    {colors.map(c => <div key={c} onClick={() => setColor(c)} className={`h-16 rounded cursor-pointer ${c} flex items-center justify-center`}>{color === c && <i className="fa-solid fa-check text-white"></i>}</div>)}
                </div>
            </div>
        </div>
    );
};

export const ItemsList = ({ inventory, categories, onNavigate, currency }: any) => {
    const [tab, setTab] = useState<'items' | 'categories'>('items');
    return (
        <div className={`flex flex-col h-full ${COLORS.bg}`}>
            <div className={`${COLORS.surface} p-4 border-b ${COLORS.border} shrink-0 flex justify-between items-center`}>
                <h2 className={`text-xl font-bold ${COLORS.text}`}>Items</h2>
                <div className="flex bg-[#333] rounded p-1">
                    <button onClick={() => setTab('items')} className={`px-4 py-1 rounded text-xs font-bold ${tab === 'items' ? 'bg-[#555] text-white' : 'text-[#999]'}`}>Items</button>
                    <button onClick={() => setTab('categories')} className={`px-4 py-1 rounded text-xs font-bold ${tab === 'categories' ? 'bg-[#555] text-white' : 'text-[#999]'}`}>Categories</button>
                </div>
                <button onClick={() => onNavigate(tab === 'items' ? 'items_create' : 'categories_create')} className="text-white"><i className="fa-solid fa-plus text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {tab === 'items' ? (
                    inventory.map((item: InventoryItem) => (
                        <div key={item.id} className="flex justify-between items-center p-4 border-b border-[#333] hover:bg-[#252525]">
                            <div className={COLORS.text}>{item.name}</div>
                            <div className={COLORS.textSecondary}>{item.sellingPrice} {currency}</div>
                        </div>
                    ))
                ) : (
                    categories.map((cat: POSCategory) => (
                        <div key={cat.id} className="flex items-center gap-4 p-4 border-b border-[#333] hover:bg-[#252525]">
                            <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
                            <div className={COLORS.text}>{cat.name}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
