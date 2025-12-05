
import React from 'react';
import { POSSession, POSOrder } from '../../types';
import { COLORS, BackHeader } from './Shared';

export const ShiftHistory = ({ sessions, onBack }: { sessions: POSSession[], onBack: () => void }) => (
    <div className={`flex flex-col h-full ${COLORS.bg} animate-fade-in-up`}>
        <BackHeader title="Shifts History" onBack={onBack} />
        <div className="flex-1 overflow-y-auto">
            {sessions.sort((a,b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()).map(s => (
                <div key={s.id} className="p-4 border-b border-[#333] hover:bg-[#252525]">
                    <div className="flex justify-between">
                        <div className={COLORS.text}>Shift #{s.id.slice(-4)}</div>
                        <div className={s.status === 'Open' ? 'text-[#4caf50] font-bold' : 'text-[#9e9e9e]'}>{s.status}</div>
                    </div>
                    <div className={`${COLORS.textSecondary} text-xs mt-1`}>
                        {new Date(s.openedAt).toLocaleString()}
                    </div>
                    {s.endCash && <div className="text-xs text-[#9e9e9e] mt-1">Closed with: {s.endCash}</div>}
                </div>
            ))}
        </div>
    </div>
);

export const ShiftScreen = ({ session, orders, onOpenShift, onCloseShift, onNavigate, currency }: { session?: POSSession, orders: POSOrder[], onOpenShift: (a:number)=>void, onCloseShift: (a:number)=>void, onNavigate: (v:string)=>void, currency: string }) => {
    if (!session) {
        return (
            <div className={`flex flex-col items-center justify-center h-full ${COLORS.bg} p-6`}>
                <div className={`${COLORS.surface} p-10 max-w-md w-full text-center shadow-2xl rounded-xl`}>
                    <i className="fa-solid fa-lock text-6xl text-[#9e9e9e] mb-6"></i>
                    <h2 className={`text-2xl font-bold ${COLORS.text} mb-2`}>Shift Closed</h2>
                    <p className={`${COLORS.textSecondary} mb-8`}>Enter opening amount to start sales.</p>
                    <form onSubmit={(e) => { e.preventDefault(); onOpenShift(Number(new FormData(e.currentTarget).get('amount'))); }}>
                        <div className="relative mb-8 border-b border-[#4caf50]">
                            <input name="amount" type="number" required autoFocus className={`w-full bg-transparent py-2 text-center text-3xl font-bold ${COLORS.text} outline-none placeholder-gray-600`} placeholder="0.00" />
                        </div>
                        <button className={`w-full ${COLORS.accent} hover:bg-[#43a047] text-white py-4 font-bold text-lg uppercase tracking-wider shadow-lg rounded-lg`}>Open Shift</button>
                    </form>
                    <button onClick={() => onNavigate('shift_history')} className="mt-4 text-[#9e9e9e] text-sm hover:text-white underline">View History</button>
                </div>
            </div>
        );
    }

    const sessionOrders = orders.filter(o => o.sessionId === session.id && o.status === 'Completed');
    const totalSales = sessionOrders.reduce((sum, o) => sum + o.total, 0);

    return (
        <div className={`flex flex-col h-full ${COLORS.bg}`}>
            <div className={`${COLORS.surface} p-4 border-b ${COLORS.border} flex justify-between items-center`}>
                <h2 className={`text-xl font-bold ${COLORS.text}`}>Current Shift</h2>
                <button onClick={() => onNavigate('shift_history')} className="text-white"><i className="fa-solid fa-clock-rotate-left"></i></button>
            </div>
            <div className="p-6 max-w-2xl mx-auto w-full">
                <div className="mb-8 text-center">
                    <div className={`${COLORS.textSecondary} text-sm`}>Opened: {new Date(session.openedAt).toLocaleTimeString()}</div>
                    <div className={`${COLORS.text} text-4xl font-bold mt-2`}>{currency} {session.startCash.toFixed(2)}</div>
                    <div className={`${COLORS.textSecondary} text-xs uppercase tracking-widest mt-1`}>Starting Cash</div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-4 bg-[#252525] rounded-lg">
                        <span className={COLORS.textSecondary}>Gross Sales</span>
                        <span className={`font-bold ${COLORS.text}`}>{totalSales.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[#252525] rounded-lg">
                        <span className={COLORS.textSecondary}>Expected Cash</span>
                        <span className={`font-bold ${COLORS.text}`}>{(session.startCash + totalSales).toLocaleString()} {currency}</span>
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onCloseShift(Number(new FormData(e.currentTarget).get('endCash'))); }}>
                    <label className={`block text-xs font-bold ${COLORS.textSecondary} mb-2 uppercase`}>Closing Cash Amount</label>
                    <input name="endCash" type="number" required className={`w-full bg-[#252525] border border-[#333] text-white p-4 text-xl font-bold outline-none focus:border-[#4caf50] mb-6 text-center rounded-lg`} placeholder="Enter counted cash" />
                    <button className={`w-full ${COLORS.danger} hover:bg-red-700 text-white py-4 font-bold text-lg uppercase shadow-lg rounded-lg`}>Close Shift</button>
                </form>
            </div>
        </div>
    );
};
