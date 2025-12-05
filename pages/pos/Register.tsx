
import React, { useState, useMemo } from 'react';
import { InventoryItem, Course, POSOrderItem } from '../../types';
import { COLORS, ProductCard } from './Shared';

const TicketLineItem: React.FC<{ item: POSOrderItem, updateQty: (id: string, d: number) => void, currency: string }> = ({ item, updateQty, currency }) => (
    <div className="flex justify-between items-start py-3 border-b border-[#333] group hover:bg-[#252525] px-2 -mx-2 transition-colors cursor-pointer select-none">
        <div className="flex-1" onClick={() => updateQty(item.id, 1)}>
            <div className={`text-sm font-medium ${COLORS.text}`}>{item.name}</div>
            <div className={`text-xs ${COLORS.textSecondary} mt-1`}>
                {item.quantity} x {item.price.toLocaleString()}
            </div>
        </div>
        <div className={`font-bold ${COLORS.text} text-sm`}>
            {(item.price * item.quantity).toLocaleString()}
        </div>
        <div className="hidden group-hover:flex absolute right-16 bg-[#333] rounded shadow-lg items-center">
             <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, -1)}} className="w-8 h-8 flex items-center justify-center text-white hover:bg-red-600 rounded-l transition-colors">-</button>
             <span className="text-white text-xs px-2">{item.quantity}</span>
             <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, 1)}} className="w-8 h-8 flex items-center justify-center text-white hover:bg-green-600 rounded-r transition-colors">+</button>
        </div>
    </div>
);

export const RegisterView: React.FC<any> = ({ 
    inventory, courses, categories, cart, addToCart, updateQty, onClearCart,
    currentCustomer, setShowCustomerModal, handleCheckout,
    total, currency, onOpenTicketMenu, activeTicketId
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const filteredItems = useMemo(() => {
        return [...inventory, ...courses].filter((item: any) => {
            const name = 'title' in item ? item.title : item.name;
            const cat = 'category' in item ? item.category : 'Training';
            
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = selectedCategory === 'All' || cat === selectedCategory || (selectedCategory === 'Training' && !('category' in item));
            
            return matchesSearch && matchesCat;
        });
    }, [inventory, courses, searchQuery, selectedCategory]);

    return (
        <div className="flex flex-1 h-full overflow-hidden flex-col md:flex-row">
            <div className={`flex-1 flex flex-col ${COLORS.bg} relative overflow-hidden`}>
                <div className={`${COLORS.surface} h-14 flex items-center justify-between px-4 border-b ${COLORS.border} shrink-0`}>
                    <div className="flex items-center gap-4 w-full">
                        <div className="relative flex-1 max-w-md">
                            <i className={`fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 ${COLORS.textSecondary}`}></i>
                            <input 
                                className="bg-[#121212] border-none text-white pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-[#4caf50] outline-none placeholder-gray-600 text-sm rounded-lg"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={`h-12 border-b ${COLORS.border} flex items-center px-4 overflow-x-auto scrollbar-hide gap-6 shrink-0`}>
                    <button onClick={() => setSelectedCategory('All')} className={`text-sm font-bold uppercase whitespace-nowrap h-full border-b-2 transition-colors ${selectedCategory === 'All' ? 'border-[#4caf50] text-[#4caf50]' : 'border-transparent text-[#9e9e9e] hover:text-white'}`}>All Items</button>
                    {categories.map((cat: any) => (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`text-sm font-bold uppercase whitespace-nowrap h-full border-b-2 transition-colors ${selectedCategory === cat.name ? 'border-[#4caf50] text-[#4caf50]' : 'border-transparent text-[#9e9e9e] hover:text-white'}`}>{cat.name}</button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-1 scrollbar-hide">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-1 pb-20 md:pb-0">
                        {filteredItems.map((item: any) => {
                            const catName = 'category' in item ? item.category : 'Training';
                            const catColor = categories.find((c: any) => c.name === catName)?.color || 'bg-slate-600';
                            return <ProductCard key={item.id} item={item} onClick={() => addToCart(item)} color={catColor} currency={currency} />;
                        })}
                    </div>
                </div>
            </div>

            <div className={`w-full md:w-[350px] ${COLORS.surface} border-l ${COLORS.border} flex flex-col shadow-2xl z-10 absolute inset-0 md:static transition-transform duration-300 transform md:translate-y-0 ${cart.length > 0 && window.innerWidth < 768 ? 'translate-y-[calc(100%-80px)] hover:translate-y-0' : ''}`}>
                <div className={`h-14 ${COLORS.surface} border-b ${COLORS.border} flex items-center justify-between px-4 shrink-0`}>
                    <div className="flex items-center gap-3">
                        <button className={`text-[#9e9e9e] hover:text-white`} onClick={onOpenTicketMenu}>
                            <i className="fa-solid fa-bars text-lg"></i>
                        </button>
                        <div className="flex flex-col cursor-pointer" onClick={onOpenTicketMenu}>
                            <span className={`${COLORS.text} font-bold text-sm`}>Ticket {activeTicketId}</span>
                            {currentCustomer && <span className="text-[#4caf50] text-xs">{currentCustomer.name}</span>}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setShowCustomerModal(true)} className={`${COLORS.text} hover:text-[#4caf50]`}><i className="fa-solid fa-user-plus"></i></button>
                        <button onClick={onOpenTicketMenu} className={`${COLORS.text} hover:text-white`}><i className="fa-solid fa-ellipsis-vertical"></i></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#121212] md:bg-[#1e1e1e]">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#444]">
                            <i className="fa-solid fa-cart-shopping text-6xl mb-4"></i>
                            <p>No items selected</p>
                        </div>
                    ) : (
                        cart.map((item: any) => (
                            <TicketLineItem key={item.id} item={item} updateQty={updateQty} currency={currency} />
                        ))
                    )}
                </div>

                <div className={`p-4 border-t ${COLORS.border} bg-[#1e1e1e]`}>
                    <div className="flex justify-between items-center mb-4">
                        <span className={`${COLORS.textSecondary} text-sm`}>Total</span>
                        <span className={`${COLORS.text} text-xl font-bold`}>{total.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex gap-2">
                        <button className={`flex-1 ${COLORS.surface} hover:bg-[#2d2d2d] text-white py-4 font-bold border border-[#444] rounded`}>Save</button>
                        <button onClick={() => handleCheckout('Cash', total)} disabled={cart.length === 0} className={`flex-[2] ${COLORS.accent} ${COLORS.accentHover} text-white py-4 text-lg font-bold uppercase tracking-wider shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center rounded leading-tight`}>
                            <span>Charge</span>
                            <span className="text-sm font-normal opacity-90">{total.toLocaleString()} {currency}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
