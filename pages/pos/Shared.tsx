
import React from 'react';
import { InventoryItem, Course } from '../../types';

export const COLORS = {
    bg: 'bg-[#121212]',
    surface: 'bg-[#1e1e1e]',
    surfaceHighlight: 'bg-[#2d2d2d]',
    accent: 'bg-[#4caf50]',
    accentHover: 'hover:bg-[#43a047]',
    text: 'text-white',
    textSecondary: 'text-[#9e9e9e]',
    border: 'border-[#333333]',
    danger: 'bg-[#d32f2f]',
    headerGreen: 'bg-[#4caf50]',
    inputBg: 'bg-transparent',
    inputBorder: 'border-b border-[#444] focus:border-[#4caf50]',
};

export const BackHeader = ({ title, onBack, action }: { title: string, onBack: () => void, action?: React.ReactNode }) => (
    <div className={`${COLORS.surface} h-14 px-4 border-b ${COLORS.border} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white hover:text-gray-300 w-8 h-8 flex items-center justify-center">
                <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
            <h2 className={`text-xl font-bold ${COLORS.text}`}>{title}</h2>
        </div>
        {action}
    </div>
);

export const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <div 
        className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${checked ? COLORS.accent : 'bg-[#555]'}`}
        onClick={() => onChange(!checked)}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
);

export const ProductCard: React.FC<{ item: InventoryItem | Course, onClick: () => void, color?: string, currency: string }> = ({ item, onClick, color, currency }) => {
    const name = 'title' in item ? item.title : item.name;
    const price = 'price' in item ? item.price : item.sellingPrice;
    
    return (
        <button
            onClick={onClick}
            className={`${COLORS.surface} hover:bg-[#2d2d2d] aspect-square p-2 flex flex-col items-center justify-center text-center relative overflow-hidden active:scale-95 group shadow-sm transition-all`}
        >
            <div className={`absolute top-0 left-0 w-full h-1 ${color || 'bg-slate-600'}`}></div>
            <span className={`${COLORS.text} font-bold text-sm leading-tight line-clamp-2`}>{name}</span>
            <div className="mt-2 text-xs text-[#9e9e9e]">{currency} {price}</div>
        </button>
    );
};

export const POSSidebar: React.FC<{ activeView: string, setView: (v: string) => void }> = ({ activeView, setView }) => {
    const items = [
        { id: 'register', icon: 'fa-basket-shopping', label: 'Sale' },
        { id: 'orders', icon: 'fa-receipt', label: 'Receipts' },
        { id: 'shift', icon: 'fa-clock', label: 'Shift' },
        { id: 'items', icon: 'fa-list-ul', label: 'Items' }, 
        { id: 'sales', icon: 'fa-chart-pie', label: 'Sales' },
        { id: 'settings', icon: 'fa-gear', label: 'Settings' },
    ];

    return (
        <div className={`w-16 md:w-20 ${COLORS.surface} border-r ${COLORS.border} flex flex-col items-center py-4 z-20 shrink-0 h-full`}>
            {items.map(item => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`w-full py-4 flex flex-col items-center gap-1 transition-all relative group ${activeView === item.id || (activeView.startsWith(item.id) && item.id !== 'register') ? 'text-[#4caf50]' : 'text-[#9e9e9e] hover:text-white'}`}
                >
                    {(activeView === item.id || (activeView.startsWith(item.id) && item.id !== 'register')) && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#4caf50] rounded-r-md"></div>}
                    <i className={`fa-solid ${item.icon} text-xl mb-1`}></i>
                    <span className="text-[10px] font-medium hidden md:block">{item.label}</span>
                </button>
            ))}
        </div>
    );
};
