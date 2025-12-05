
import React, { useState } from 'react';
import { COLORS, BackHeader, ToggleSwitch } from './Shared';

export const PrinterSettings = ({ onBack }: { onBack: () => void }) => (
    <div className={`flex flex-col h-full ${COLORS.bg} animate-fade-in-up`}>
        <BackHeader title="Printers" onBack={onBack} action={<button className="text-white uppercase font-bold text-sm">Save</button>} />
        <div className="p-4 space-y-6">
            <div><label className={`block text-xs ${COLORS.textSecondary} mb-1`}>Printer Name</label><input className={`w-full ${COLORS.inputBg} ${COLORS.inputBorder} ${COLORS.text} py-2 outline-none`} placeholder="Counter Printer" /></div>
            <div>
                <label className={`block text-xs ${COLORS.textSecondary} mb-1`}>Model</label>
                <select className={`w-full ${COLORS.inputBg} ${COLORS.inputBorder} ${COLORS.text} py-2 outline-none bg-[#121212]`}><option>Epson TM-T88</option><option>Star TSP100</option></select>
            </div>
            <div className="pt-4 border-t border-[#333]">
                <div className="flex justify-between items-center py-3"><span className={COLORS.text}>Print Receipts</span><ToggleSwitch checked={true} onChange={() => {}} /></div>
            </div>
        </div>
    </div>
);

export const GeneralSettings = ({ onBack }: { onBack: () => void }) => (
    <div className={`flex flex-col h-full ${COLORS.bg} animate-fade-in-up`}>
        <BackHeader title="General" onBack={onBack} />
        <div className="p-4">
            <div className="flex justify-between items-center py-4 border-b border-[#333]"><span className={COLORS.text}>Dark mode</span><ToggleSwitch checked={true} onChange={() => {}} /></div>
        </div>
    </div>
);

export const SettingsMenu = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div className={`flex flex-col h-full ${COLORS.bg}`}>
        <div className={`${COLORS.surface} p-4 border-b ${COLORS.border} shrink-0`}>
            <h2 className={`text-xl font-bold ${COLORS.text}`}>Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
            <div onClick={() => onNavigate('settings_printers')} className="flex justify-between items-center p-4 border-b border-[#333] hover:bg-[#252525] cursor-pointer">
                <div className="flex items-center gap-4"><i className="fa-solid fa-print text-[#999] w-6"></i><span className={COLORS.text}>Printers</span></div>
                <i className="fa-solid fa-chevron-right text-[#444]"></i>
            </div>
            <div onClick={() => onNavigate('settings_general')} className="flex justify-between items-center p-4 border-b border-[#333] hover:bg-[#252525] cursor-pointer">
                <div className="flex items-center gap-4"><i className="fa-solid fa-sliders text-[#999] w-6"></i><span className={COLORS.text}>General</span></div>
                <i className="fa-solid fa-chevron-right text-[#444]"></i>
            </div>
        </div>
    </div>
);
