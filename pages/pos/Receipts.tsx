
import React, { useState, useMemo } from 'react';
import { POSOrder } from '../../types';
import { COLORS } from './Shared';

export const ReceiptsView = ({ orders, currency }: { orders: POSOrder[], currency: string }) => {
    const [search, setSearch] = useState('');

    const groupedOrders = useMemo(() => {
        const groups: Record<string, POSOrder[]> = {};
        orders
            .filter(o => o.receiptNumber.includes(search) || (o.total.toString().includes(search)))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .forEach(order => {
                const date = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
                if (!groups[date]) groups[date] = [];
                groups[date].push(order);
            });
        return groups;
    }, [orders, search]);

    return (
        <div className={`flex flex-col h-full ${COLORS.bg}`}>
            <div className={`${COLORS.surface} p-4 border-b ${COLORS.border} flex items-center gap-3 shrink-0`}>
                <i className="fa-solid fa-bars text-[#9e9e9e] text-xl"></i>
                <h2 className={`text-xl font-bold ${COLORS.text} flex-1`}>Receipts</h2>
                <button className="text-white"><i className="fa-solid fa-magnifying-glass"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {(Object.entries(groupedOrders) as [string, POSOrder[]][]).map(([date, dayOrders]) => (
                    <div key={date}>
                        <div className="px-4 py-2 text-[#4caf50] text-xs font-bold uppercase bg-[#121212] sticky top-0 border-b border-[#333] z-10">
                            {date}
                        </div>
                        {dayOrders.map(order => (
                            <div key={order.id} className={`flex items-center justify-between p-4 border-b ${COLORS.border} hover:bg-[#1a1a1a] cursor-pointer group`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-8 rounded bg-[#333] flex items-center justify-center text-white text-xs border border-[#444]">
                                        <i className={`fa-solid ${order.paymentMethod === 'Cash' ? 'fa-money-bill' : 'fa-credit-card'}`}></i>
                                    </div>
                                    <div>
                                        <div className={`${COLORS.text} font-bold text-base`}>
                                            {currency} {order.total.toLocaleString()}
                                        </div>
                                        <div className={`${COLORS.textSecondary} text-xs mt-0.5`}>
                                            {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • #{order.receiptNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {order.status === 'Refunded' && <span className="text-red-500 text-xs font-bold mr-2">Refunded</span>}
                                    <i className="fa-solid fa-chevron-right text-[#333] group-hover:text-[#666]"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                {Object.keys(groupedOrders).length === 0 && (
                    <div className="p-8 text-center text-[#666]">No receipts found.</div>
                )}
            </div>
        </div>
    );
};
