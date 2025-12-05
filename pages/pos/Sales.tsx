
import React, { useState, useMemo } from 'react';
import { POSOrder, User } from '../../types';
import { COLORS } from './Shared';

export const SalesSummary = ({ orders, currency, users = [] }: { orders: POSOrder[], currency: string, users?: User[] }) => {
    const [period, setPeriod] = useState('All');
    
    // Metrics
    const grossSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const refunds = orders.filter(o => o.status === 'Refunded').reduce((sum, o) => sum + o.total, 0);
    const discounts = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const netSales = grossSales - refunds - discounts;

    return (
        <div className="flex flex-col h-full bg-[#f5f5f5] overflow-hidden font-sans">
            <div className={`${COLORS.headerGreen} p-4 text-white shadow-md shrink-0`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <i className="fa-solid fa-bars text-xl"></i>
                        <h2 className="text-xl font-bold">Sales summary</h2>
                    </div>
                </div>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-white text-slate-800 text-sm font-bold px-4 py-2 rounded-full outline-none shadow-sm">
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                    </select>
                </div>
                <div className="text-center pb-2">
                    <span className="text-white/90 text-sm font-medium">Net sales</span>
                    <h1 className="text-4xl font-bold mt-1">{currency} {netSales.toLocaleString()}</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Gross sales</span>
                        <span className="font-bold text-gray-800">{currency} {grossSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Refunds</span>
                        <span className="font-bold text-gray-800">{currency} {refunds.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Discounts</span>
                        <span className="font-bold text-gray-800">{currency} {discounts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-800 font-bold text-lg">Net sales</span>
                        <span className="font-bold text-gray-800 text-lg">{currency} {netSales.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-700">Sales by hour</h3>
                        <span className="text-xs text-gray-400">Values in {currency}</span>
                    </div>
                    <div className="flex items-end justify-between h-40 gap-2 border-b border-gray-200 pb-2">
                        {[15, 35, 20, 60, 45, 80, 50, 30].map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <div className="w-full bg-[#4caf50] rounded-t-sm opacity-80 hover:opacity-100 transition-all" style={{ height: `${val}%` }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
