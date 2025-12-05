
import React, { useState, useMemo, useEffect } from 'react';
import { User, InventoryItem, Course, Customer, AppLanguage, POSSession, POSOrder, POSOrderItem, FinanceRecord, POSCategory, POSTax, PaymentMethod, ShiftSummary } from '../types';

interface POSProps {
    currentUser: User;
    inventory: InventoryItem[];
    setInventory?: (items: InventoryItem[]) => void;
    courses: Course[];
    customers: Customer[];
    sessions: POSSession[];
    setSessions: (s: POSSession[]) => void;
    onAddFinanceRecord: (r: FinanceRecord) => void;
    onAddCustomer: (c: Customer) => void;
    organizationId: string;
    lang: AppLanguage;
    categories: POSCategory[];
    setCategories: (c: POSCategory[]) => void;
    taxes: POSTax[];
    setTaxes: (t: POSTax[]) => void;
    savedTickets: POSOrder[];
    setSavedTickets: (t: POSOrder[]) => void;
    orders: POSOrder[];
    setOrders: (o: POSOrder[]) => void;
    currency?: string;
}

// --- SUB-COMPONENTS ---

const POSDashboard = ({ orders, currency = 'EGP' }: { orders: POSOrder[], currency?: string }) => {
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const refundedOrders = orders.filter(o => o.status === 'Refunded');
    
    const netSales = completedOrders.reduce((acc, o) => acc + o.total, 0);
    const totalRefunds = refundedOrders.reduce((acc, o) => acc + o.total, 0);
    const grossSales = netSales + totalRefunds;

    // Best Sellers
    const itemSales: Record<string, {name: string, qty: number, revenue: number}> = {};
    completedOrders.forEach(order => {
        order.items.forEach(item => {
            if (!itemSales[item.id]) itemSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
            itemSales[item.id].qty += item.quantity;
            itemSales[item.id].revenue += item.quantity * item.price;
        });
    });
    const bestSellers = Object.values(itemSales).sort((a,b) => b.qty - a.qty).slice(0, 5);

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Gross Sales</div>
                        <div className="text-2xl font-black text-slate-800">{grossSales.toLocaleString()} <span className="text-xs text-slate-400">{currency}</span></div>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><i className="fa-solid fa-coins"></i></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="text-green-600 text-xs font-bold uppercase mb-1">Net Sales</div>
                        <div className="text-2xl font-black text-green-700">{netSales.toLocaleString()} <span className="text-xs text-green-500">{currency}</span></div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><i className="fa-solid fa-wallet"></i></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="text-red-500 text-xs font-bold uppercase mb-1">Refunds</div>
                        <div className="text-2xl font-black text-red-600">{totalRefunds.toLocaleString()} <span className="text-xs text-red-400">{currency}</span></div>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><i className="fa-solid fa-rotate-left"></i></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="text-blue-500 text-xs font-bold uppercase mb-1">Orders</div>
                        <div className="text-2xl font-black text-blue-600">{completedOrders.length}</div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><i className="fa-solid fa-receipt"></i></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Best Sellers</h3>
                <div className="space-y-3">
                    {bestSellers.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex gap-3 items-center">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                                <span className="font-medium text-slate-700">{item.name}</span>
                            </div>
                            <div className="text-slate-500 font-mono">
                                {item.qty} sold ({item.revenue.toLocaleString()} {currency})
                            </div>
                        </div>
                    ))}
                    {bestSellers.length === 0 && <p className="text-slate-400 text-sm">No sales yet.</p>}
                </div>
            </div>
        </div>
    );
};

const POSOrdersView = ({ orders, customers, onReprint, onRefund, currency }: { orders: POSOrder[], customers: Customer[], onReprint: (o: POSOrder) => void, onRefund: (o: POSOrder) => void, currency: string }) => {
    return (
        <div className="flex flex-col h-full bg-slate-100">
            <div className="bg-white p-4 border-b flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-800">Orders History</h2>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
                <POSDashboard orders={orders} currency={currency} />

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4">Receipt #</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {[...orders].reverse().map(order => {
                                const customerName = customers.find(c => c.id === order.customerId)?.name || 'Walk-in';
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-mono font-bold">{order.receiptNumber}</td>
                                        <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                                        <td className="p-4">{customerName}</td>
                                        <td className="p-4 font-bold">{order.total.toLocaleString()} {currency}</td>
                                        <td className="p-4">{order.paymentMethod}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Refunded' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => onReprint(order)} className="text-blue-600 hover:bg-blue-50 p-2 rounded" title="Reprint">
                                                <i className="fa-solid fa-print"></i>
                                            </button>
                                            {order.status === 'Completed' && (
                                                <button onClick={() => onRefund(order)} className="text-red-500 hover:bg-red-50 p-2 rounded" title="Refund">
                                                    <i className="fa-solid fa-rotate-left"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.length === 0 && (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const POSSettingsView = ({ 
    categories, setCategories, taxes, setTaxes, organizationId 
}: { 
    categories: POSCategory[], setCategories: (c: POSCategory[]) => void, 
    taxes: POSTax[], setTaxes: (t: POSTax[]) => void, organizationId: string 
}) => {
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('bg-blue-500');
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-slate-500'];

    const handleAddCategory = () => {
        if(newCatName) {
            setCategories([...categories, { id: `CAT-${Date.now()}`, organizationId, name: newCatName, color: newCatColor }]);
            setNewCatName('');
        }
    };

    const handleDeleteCategory = (id: string) => {
        setCategories(categories.filter(c => c.id !== id));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 h-full overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Categories Management</h3>
                <div className="flex gap-2 mb-6">
                    <input 
                        className="border rounded-lg px-4 py-2 flex-1 outline-none focus:border-blue-500"
                        placeholder="New Category Name"
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                    />
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {colors.map(c => (
                            <button 
                                key={c} 
                                onClick={() => setNewCatColor(c)}
                                className={`w-8 h-8 rounded-md ${c} ${newCatColor === c ? 'ring-2 ring-offset-1 ring-slate-400' : 'opacity-70 hover:opacity-100'}`}
                            ></button>
                        ))}
                    </div>
                    <button 
                        onClick={handleAddCategory}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="border rounded-xl p-3 flex items-center justify-between bg-slate-50 group">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
                                <span className="font-bold text-sm text-slate-700">{cat.name}</span>
                            </div>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Tax Configuration</h3>
                <div className="space-y-4">
                    {taxes.map(tax => (
                        <div key={tax.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex-1">
                                <div className="font-bold text-slate-700">{tax.name}</div>
                                <div className="text-xs text-slate-500">{tax.isDefault ? 'Default Applied' : 'Optional'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    className="border rounded px-2 py-1 w-20 text-right" 
                                    value={tax.rate}
                                    onChange={(e) => {
                                        const newRate = parseFloat(e.target.value);
                                        setTaxes(taxes.map(t => t.id === tax.id ? { ...t, rate: newRate } : t));
                                    }}
                                />
                                <span className="text-slate-500 font-bold">%</span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={tax.isDefault}
                                    onChange={() => setTaxes(taxes.map(t => ({ ...t, isDefault: t.id === tax.id })))} 
                                    className="accent-blue-600 w-5 h-5"
                                />
                                <span className="text-sm font-bold text-slate-600">Default</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const POSShiftScreen = ({ activeSession, orders, onOpenShift, onCloseShift, currency }: { activeSession: POSSession | null, orders: POSOrder[], onOpenShift: (amount: number) => void, onCloseShift: (amount: number) => void, currency: string }) => {
    if (!activeSession) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-3xl">
                        <i className="fa-solid fa-cash-register"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Start New Shift</h2>
                    <p className="text-slate-500 mb-6">Please enter the starting cash amount in the drawer.</p>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        onOpenShift(Number(formData.get('amount')));
                    }}>
                        <div className="relative mb-6">
                            <span className="absolute top-3 left-4 text-slate-400 font-bold">{currency}</span>
                            <input 
                                name="amount" 
                                type="number" 
                                required 
                                autoFocus
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-xl outline-none focus:border-blue-500 transition-all" 
                                placeholder="0.00"
                            />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg transition-transform active:scale-95">
                            Open Register
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const sessionOrders = orders.filter(o => o.sessionId === activeSession.id && o.status === 'Completed');
    const totalSales = sessionOrders.reduce((sum, o) => sum + o.total, 0);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Current Shift</h2>
                        <p className="text-slate-500 text-xs">Started: {new Date(activeSession.openedAt).toLocaleString()}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Open</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-slate-500 text-xs font-bold uppercase">Starting Cash</div>
                        <div className="text-xl font-black text-slate-800">{activeSession.startCash.toLocaleString()} <span className="text-xs text-slate-400">{currency}</span></div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="text-blue-500 text-xs font-bold uppercase">Current Sales</div>
                        <div className="text-xl font-black text-blue-600">{totalSales.toLocaleString()} <span className="text-xs text-blue-300">{currency}</span></div>
                    </div>
                </div>

                <h3 className="font-bold text-slate-700 mb-2">Close Shift</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    onCloseShift(Number(formData.get('endCash')));
                }}>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Counted Cash in Drawer</label>
                    <div className="relative mb-4">
                        <span className="absolute top-3 left-4 text-slate-400 font-bold">{currency}</span>
                        <input 
                            name="endCash" 
                            type="number" 
                            required 
                            className="w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 font-bold text-lg" 
                            placeholder="0.00"
                        />
                    </div>
                    <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                        End Shift & Print Z-Report
                    </button>
                </form>
            </div>
        </div>
    );
};

const POSRegisterView = ({ 
    inventory, courses, categories, cart, addToCart, updateQty, removeFromCart, 
    currentCustomer, setShowCustomerModal, handleHoldTicket, handleCheckout, savedTickets, handleRestoreTicket,
    subtotal, taxTotal, discount, total, currency,
    discountValue, setDiscountValue, discountType, setDiscountType
}: any) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [tenderAmount, setTenderAmount] = useState<number>(0);
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    // Initialize tender amount when modal opens or total changes
    useEffect(() => {
        if(showPaymentModal) setTenderAmount(total);
    }, [showPaymentModal, total]);

    // Barcode Scanner Listener
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is focused on an input field
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }

            const currentTime = Date.now();
            // If significant time passed, reset buffer (it's manual typing, not a scanner)
            if (currentTime - lastKeyTime > 100) {
                buffer = '';
            }
            lastKeyTime = currentTime;

            if (e.key === 'Enter') {
                if (buffer.length > 0) {
                    // Try to find item by ID or Name
                    const item = [...inventory, ...courses].find(i => 
                        i.id.toLowerCase() === buffer.toLowerCase() || 
                        ('name' in i && i.name.toLowerCase() === buffer.toLowerCase()) ||
                        ('title' in i && i.title.toLowerCase() === buffer.toLowerCase())
                    );

                    if (item) {
                        addToCart(item);
                        // Optional: Play beep sound here
                    }
                    buffer = '';
                }
            } else if (e.key.length === 1) {
                // Collect characters
                buffer += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inventory, courses, addToCart]);

    // Optimized filtering using useMemo
    const filteredItems = useMemo(() => {
        return [...inventory, ...courses].filter(item => {
            const name = 'title' in item ? item.title : item.name;
            const cat = 'category' in item ? item.category : 'Training';
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = selectedCategory === 'All' || cat === selectedCategory || (selectedCategory === 'Training' && !('category' in item));
            return matchesSearch && matchesCat;
        });
    }, [inventory, courses, selectedCategory, searchQuery]);

    // Quick Cash Suggestions
    const getQuickCashAmounts = (amount: number) => {
        const base = Math.ceil(amount / 50) * 50;
        const suggestions = [amount];
        if (base > amount) suggestions.push(base);
        if (base + 50 > amount) suggestions.push(base + 50);
        if (base + 100 > amount) suggestions.push(base + 100);
        return Array.from(new Set(suggestions)).sort((a,b) => a - b).slice(0, 4);
    };

    const quickCashOptions = getQuickCashAmounts(total);
    const changeDue = tenderAmount - total;

    return (
        <div className="flex h-full">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col border-r border-slate-200">
                <div className="h-16 border-b bg-white flex items-center px-4 gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <i className="fa-solid fa-search absolute left-3 top-2.5 text-slate-400"></i>
                        <input 
                            className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Search products or scan barcode..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 justify-end">
                        <button 
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            All
                        </button>
                        {categories.map((cat: any) => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === cat.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredItems.map(item => {
                            const name = 'title' in item ? item.title : item.name;
                            const price = 'sellingPrice' in item ? item.sellingPrice : (item.price || 0);
                            const image = 'image' in item ? item.image : 'thumbnail' in item ? item.thumbnail : null;
                            const color = 'category' in item 
                                ? categories.find((c:any) => c.name === item.category)?.color 
                                : 'bg-green-500';

                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col text-left group active:scale-95 border border-slate-100"
                                >
                                    <div className={`h-24 w-full bg-slate-200 relative overflow-hidden`}>
                                        {image ? (
                                            <img src={image} className="w-full h-full object-cover" alt={name} />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-white text-2xl ${color?.replace('bg-', 'bg-opacity-80 bg-') || 'bg-slate-400'}`}>
                                                {name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                            {price.toLocaleString()} {currency}
                                        </div>
                                    </div>
                                    <div className="p-3 flex-1">
                                        <h4 className="font-bold text-sm text-slate-800 leading-tight line-clamp-2">{name}</h4>
                                        {'quantity' in item && (
                                            <div className={`text-[10px] mt-1 font-bold ${item.quantity < 5 ? 'text-red-500' : 'text-slate-400'}`}>
                                                {item.quantity} in stock
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-96 bg-white flex flex-col shadow-xl z-20 border-l border-slate-200">
                {/* Header */}
                <div className="p-3 border-b flex justify-between items-center bg-slate-50">
                    {currentCustomer ? (
                        <button onClick={() => setShowCustomerModal(true)} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-sm w-full justify-center border border-blue-200">
                            <i className="fa-solid fa-user"></i> {currentCustomer.name}
                        </button>
                    ) : (
                        <button onClick={() => setShowCustomerModal(true)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm w-full justify-center py-1.5 border border-dashed border-slate-300 rounded-lg hover:bg-white hover:border-blue-300 transition-all">
                            <i className="fa-solid fa-user-plus"></i> Add Customer
                        </button>
                    )}
                </div>

                {/* Saved Tickets Bar */}
                {savedTickets.length > 0 && (
                    <div className="bg-amber-50 border-b border-amber-100 p-2 flex gap-2 overflow-x-auto scrollbar-hide">
                        {savedTickets.map((t:any) => (
                            <button key={t.id} onClick={() => handleRestoreTicket(t)} className="bg-white border border-amber-200 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap hover:bg-amber-100">
                                {t.receiptNumber} ({t.total.toLocaleString()})
                            </button>
                        ))}
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <i className="fa-solid fa-basket-shopping text-6xl mb-4 opacity-50"></i>
                            <p className="font-bold">Cart is empty</p>
                            <p className="text-xs text-slate-400 mt-2">Scan barcode or select items</p>
                        </div>
                    ) : (
                        cart.map((item:any) => (
                            <div key={item.id} className="flex justify-between items-start group">
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-800">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.price.toLocaleString()} x {item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-mono font-bold text-sm">{(item.price * item.quantity).toLocaleString()}</div>
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 bg-slate-100 rounded text-green-600 hover:bg-green-100 flex items-center justify-center"><i className="fa-solid fa-plus text-[10px]"></i></button>
                                        <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 bg-slate-100 rounded text-red-600 hover:bg-red-100 flex items-center justify-center"><i className="fa-solid fa-minus text-[10px]"></i></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors ml-1"><i className="fa-solid fa-trash-can"></i></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals Section */}
                <div className="bg-slate-50 p-4 border-t border-slate-200">
                    <div className="space-y-1 text-sm mb-4">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>{subtotal.toLocaleString()} {currency}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Tax</span>
                            <span>{taxTotal.toLocaleString()} {currency}</span>
                        </div>
                        
                        {/* Discount Row */}
                        <div className="flex flex-col">
                            <div className="flex justify-between items-center text-green-600 font-bold">
                                <button 
                                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                                    className="text-xs border border-green-200 bg-green-50 px-2 py-0.5 rounded hover:bg-green-100 flex items-center gap-1"
                                >
                                    {showDiscountInput ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-plus"></i>} Discount
                                </button>
                                <span>-{discount.toLocaleString()} {currency}</span>
                            </div>
                            
                            {showDiscountInput && (
                                <div className="mt-2 flex gap-2 animate-fade-in-up">
                                    <input 
                                        type="number" 
                                        className="w-full border rounded px-2 py-1 text-sm" 
                                        placeholder="Value"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                    />
                                    <div className="flex border rounded overflow-hidden shrink-0">
                                        <button 
                                            onClick={() => setDiscountType('percent')}
                                            className={`px-3 text-xs font-bold ${discountType === 'percent' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                                        >%</button>
                                        <button 
                                            onClick={() => setDiscountType('fixed')}
                                            className={`px-3 text-xs font-bold ${discountType === 'fixed' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                                        >
                                            {currency}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t mt-2">
                            <span>Total</span>
                            <span>{Math.max(0, total).toLocaleString()} {currency}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={handleHoldTicket}
                            disabled={cart.length === 0}
                            className="py-3 rounded-xl font-bold bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                            Hold
                        </button>
                        <button 
                            onClick={() => setShowPaymentModal(true)}
                            disabled={cart.length === 0}
                            className="py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 transition-transform active:scale-95"
                        >
                            Pay
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal inside Register */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="bg-green-600 p-6 text-white text-center">
                            <div className="text-sm opacity-80 uppercase font-bold tracking-widest mb-1">Total to Pay</div>
                            <div className="text-5xl font-black">{total.toLocaleString()} <span className="text-xl align-top opacity-50">{currency}</span></div>
                        </div>
                        
                        <div className="p-6">
                            {/* Tendered Input */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Amount Tendered</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        className="w-full text-2xl font-bold p-3 border-2 border-slate-200 rounded-xl focus:border-green-500 outline-none"
                                        value={tenderAmount}
                                        onChange={(e) => setTenderAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-sm font-bold text-slate-600">Change Due:</div>
                                    <div className={`text-xl font-black ${changeDue < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {Math.max(0, changeDue).toLocaleString()} {currency}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Cash Buttons */}
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {quickCashOptions.map(amount => (
                                    <button 
                                        key={amount}
                                        onClick={() => setTenderAmount(amount)}
                                        className={`py-2 rounded-lg text-sm font-bold border transition-colors ${tenderAmount === amount ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'}`}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button 
                                    onClick={() => { handleCheckout('Cash', tenderAmount); setShowPaymentModal(false); }}
                                    disabled={tenderAmount < total} 
                                    className="bg-slate-100 hover:bg-green-50 hover:border-green-200 border-2 border-transparent p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-solid fa-money-bill-wave text-3xl text-slate-400 group-hover:text-green-600"></i>
                                    <span className="font-bold text-slate-600 group-hover:text-green-700">Pay Cash</span>
                                </button>
                                <button 
                                    onClick={() => { handleCheckout('Card', total); setShowPaymentModal(false); }} 
                                    className="bg-slate-100 hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group"
                                >
                                    <i className="fa-solid fa-credit-card text-3xl text-slate-400 group-hover:text-blue-600"></i>
                                    <span className="font-bold text-slate-600 group-hover:text-blue-700">Pay Card</span>
                                </button>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN POS VIEW ---

export const POSView = ({ 
    currentUser, inventory, setInventory, courses, customers, sessions, setSessions, onAddFinanceRecord, onAddCustomer, organizationId, lang,
    categories, setCategories, taxes, setTaxes, savedTickets, setSavedTickets, orders, setOrders, currency = 'EGP'
}: POSProps) => {
    const [view, setView] = useState<'register' | 'orders' | 'shift' | 'settings'>('register');
    const activeSession = sessions.find(s => s.status === 'Open') || null;
    const [lastClosedSession, setLastClosedSession] = useState<POSSession | null>(null);
    
    // Register State
    const [cart, setCart] = useState<POSOrderItem[]>([]);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState<POSOrder | null>(null);
    const [note, setNote] = useState('');

    // Discount State
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');

    // Totals
    const defaultTax = taxes.find(t => t.isDefault)?.rate || 0;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxTotal = cart.reduce((sum, item) => {
        const itemTax = item.taxRate !== undefined ? item.taxRate : defaultTax;
        return sum + (item.price * item.quantity * (itemTax / 100));
    }, 0);
    
    // Calculate Discount
    const discountAmount = discountType === 'percent' 
        ? (subtotal * discountValue) / 100 
        : discountValue;

    const total = subtotal + taxTotal - discountAmount;

    // Handlers
    const handleOpenShift = (startCash: number) => {
        const newSession: POSSession = {
            id: `SESS-${Date.now()}`,
            organizationId,
            openedAt: new Date().toISOString(),
            openedBy: currentUser.id,
            startCash,
            status: 'Open'
        };
        setSessions([...sessions, newSession]);
        setView('register');
    };

    const handleCloseShift = (endCash: number) => {
        if (!activeSession) return;
        const sessionOrders = orders.filter(o => o.sessionId === activeSession.id && o.status === 'Completed');
        const refundedOrders = orders.filter(o => o.sessionId === activeSession.id && o.status === 'Refunded');

        const grossSales = sessionOrders.reduce((sum, o) => sum + o.total, 0) + refundedOrders.reduce((sum, o) => sum + o.total, 0);
        const totalRefunds = refundedOrders.reduce((sum, o) => sum + o.total, 0);
        const netSales = grossSales - totalRefunds;

        // Breakdown logic - only count completed (non-refunded) sales for cash reconciliation
        const paymentBreakdown: Record<string, number> = {};
        sessionOrders.forEach(o => {
            const method = o.paymentMethod || 'Other';
            paymentBreakdown[method] = (paymentBreakdown[method] || 0) + o.total;
        });

        const cashSales = paymentBreakdown['Cash'] || 0;
        const expected = activeSession.startCash + cashSales;

        const summary: ShiftSummary = {
            totalOrders: sessionOrders.length,
            totalGuests: sessionOrders.reduce((sum, o) => sum + (o.guestCount || 1), 0),
            grossSales: grossSales,
            netSales: netSales,
            totalTax: sessionOrders.reduce((sum, o) => sum + o.taxTotal, 0),
            totalDiscount: sessionOrders.reduce((sum, o) => sum + o.discount, 0),
            totalRefunds: totalRefunds,
            averageCheck: sessionOrders.length > 0 ? netSales / sessionOrders.length : 0,
            averageCover: 0,
            cashExpected: expected,
            cashActual: endCash,
            cashDifference: endCash - expected,
            paymentBreakdown
        };
        const closedSession: POSSession = { ...activeSession, status: 'Closed', closedAt: new Date().toISOString(), endCash, expectedCash: expected, summary };
        setSessions(sessions.map(s => s.id === activeSession.id ? closedSession : s));
        setLastClosedSession(closedSession); // Trigger Z-Report Modal
        setView('shift');
    };

    const addToCart = (item: InventoryItem | Course) => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            const isCourse = 'title' in item && !('quantity' in item);
            const newItem: POSOrderItem = {
                id: item.id,
                name: 'title' in item ? item.title : item.name,
                price: 'sellingPrice' in item ? item.sellingPrice : (item.price || 0),
                quantity: 1,
                taxRate: defaultTax,
                type: isCourse ? 'Course' : 'Product',
                category: 'category' in item ? item.category : 'Course'
            };
            setCart([...cart, newItem]);
        }
    };

    const updateQty = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = (method: PaymentMethod, tendered: number = total) => {
        if (!activeSession) return;
        
        const change = tendered - total;

        const newOrder: POSOrder = {
            id: `ORD-${Date.now()}`,
            sessionId: activeSession.id,
            organizationId,
            items: cart,
            subtotal,
            taxTotal,
            discount: discountAmount,
            total,
            tendered: method === 'Cash' ? tendered : undefined,
            change: method === 'Cash' ? change : undefined,
            paymentMethod: method,
            status: 'Completed',
            createdAt: new Date().toISOString(),
            receiptNumber: `${new Date().getFullYear()}-${orders.length + 1001}`,
            customerId: currentCustomer?.id,
            guestCount: 1
        };
        setOrders([...orders, newOrder]);
        onAddFinanceRecord({
            id: `FIN-POS-${newOrder.id}`,
            organizationId,
            date: new Date().toLocaleDateString('en-CA'),
            amount: total,
            type: 'Income',
            category: 'POS Sales',
            description: `POS Sale #${newOrder.receiptNumber}`,
            customerId: currentCustomer?.id,
            customerName: currentCustomer?.name,
            receiptNumber: newOrder.receiptNumber,
            paymentMethod: method,
            recordedBy: currentUser.name
        });
        if (setInventory) {
            const newInventory = [...inventory];
            cart.forEach(cartItem => {
                if (cartItem.type === 'Course') return; // Do not decrement for courses

                const idx = newInventory.findIndex(i => i.id === cartItem.id);
                if (idx > -1) {
                    newInventory[idx] = { 
                        ...newInventory[idx], 
                        quantity: Math.max(0, newInventory[idx].quantity - cartItem.quantity),
                        status: (newInventory[idx].quantity - cartItem.quantity) <= 0 ? 'Out of Stock' : (newInventory[idx].quantity - cartItem.quantity) < 5 ? 'Low Stock' : 'Available'
                    };
                }
            });
            setInventory(newInventory);
        }
        setShowReceiptModal(newOrder);
        setCart([]);
        setCurrentCustomer(null);
        // Reset Discount
        setDiscountValue(0);
    };

    const handleHoldTicket = () => {
        if (!activeSession || cart.length === 0) return;
        const heldOrder: POSOrder = {
            id: `HOLD-${Date.now()}`,
            sessionId: activeSession.id,
            organizationId,
            items: cart,
            subtotal,
            taxTotal,
            discount: discountAmount,
            total,
            paymentMethod: 'None',
            status: 'Held',
            createdAt: new Date().toISOString(),
            receiptNumber: `H-${savedTickets.length + 1}`,
            customerId: currentCustomer?.id,
            note
        };
        setSavedTickets([...savedTickets, heldOrder]);
        setCart([]);
        setCurrentCustomer(null);
        setDiscountValue(0);
    };

    const handleRestoreTicket = (ticket: POSOrder) => {
        setCart(ticket.items);
        setCurrentCustomer(customers.find(c => c.id === ticket.customerId) || null);
        setNote(ticket.note || '');
        setSavedTickets(savedTickets.filter(t => t.id !== ticket.id));
        setDiscountValue(ticket.discount || 0); // Restore approximate discount value as fixed for simplicity
        setDiscountType('fixed');
    };

    const handleRefund = (order: POSOrder) => {
        if (confirm('Confirm refund? This will return items to stock.')) {
            // Update order status
            setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Refunded' } : o));
            
            // Record finance transaction
            onAddFinanceRecord({
                id: `FIN-REF-${order.id}-${Date.now()}`,
                organizationId,
                date: new Date().toLocaleDateString('en-CA'),
                amount: -order.total,
                type: 'Refund',
                category: 'POS Refund',
                description: `Refund #${order.receiptNumber}`,
                customerId: order.customerId,
                paymentMethod: order.paymentMethod as PaymentMethod,
                recordedBy: currentUser.name
            });

            // Return items to inventory
            if (setInventory) {
                const newInventory = [...inventory];
                order.items.forEach(orderItem => {
                    if (orderItem.type === 'Course') return; // Do not increment for courses

                    const idx = newInventory.findIndex(i => i.id === orderItem.id);
                    if (idx > -1) {
                        const newQuantity = newInventory[idx].quantity + orderItem.quantity;
                        newInventory[idx] = {
                            ...newInventory[idx],
                            quantity: newQuantity,
                            status: newQuantity > 5 ? 'Available' : (newQuantity > 0 ? 'Low Stock' : 'Out of Stock')
                        };
                    }
                });
                setInventory(newInventory);
                alert('Refund successful. Items returned to stock.');
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-100 overflow-hidden relative">
            {/* Top Bar - Hidden during print */}
            <div className="h-16 bg-white border-b flex justify-between items-center px-6 shrink-0 z-10 print:hidden">
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button onClick={() => setView('register')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${view === 'register' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Register</button>
                    <button onClick={() => setView('orders')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${view === 'orders' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Orders</button>
                    <button onClick={() => setView('shift')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${view === 'shift' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Shift</button>
                    <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${view === 'settings' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Settings</button>
                </div>
                {activeSession && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Shift Open: {new Date(activeSession.openedAt).toLocaleTimeString()}</span>}
            </div>

            {/* Main Content - Hidden during print */}
            <div className="flex-1 overflow-hidden relative print:hidden">
                {view === 'register' && (
                    !activeSession ? (
                        <POSShiftScreen activeSession={null} orders={[]} onOpenShift={handleOpenShift} onCloseShift={() => {}} currency={currency} />
                    ) : (
                        <POSRegisterView 
                            inventory={inventory} courses={courses} categories={categories} 
                            cart={cart} addToCart={addToCart} updateQty={updateQty} removeFromCart={removeFromCart}
                            currentCustomer={currentCustomer} setShowCustomerModal={setShowCustomerModal}
                            handleHoldTicket={handleHoldTicket} handleCheckout={handleCheckout} 
                            savedTickets={savedTickets} handleRestoreTicket={handleRestoreTicket}
                            subtotal={subtotal} taxTotal={taxTotal} discount={discountAmount} total={total}
                            currency={currency}
                            discountValue={discountValue} setDiscountValue={setDiscountValue}
                            discountType={discountType} setDiscountType={setDiscountType}
                        />
                    )
                )}

                {view === 'orders' && <POSOrdersView orders={orders} customers={customers} onReprint={setShowReceiptModal} onRefund={handleRefund} currency={currency} />}
                
                {view === 'shift' && <POSShiftScreen activeSession={activeSession} orders={orders} onOpenShift={handleOpenShift} onCloseShift={handleCloseShift} currency={currency} />}

                {view === 'settings' && <POSSettingsView categories={categories} setCategories={setCategories} taxes={taxes} setTaxes={setTaxes} organizationId={organizationId} />}
            </div>

            {/* Customer Modal - Hidden during print */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl h-[600px] flex flex-col animate-fade-in-up">
                        <h3 className="font-bold text-xl mb-4">Select Customer</h3>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {customers.map(c => (
                                <button key={c.id} onClick={() => { setCurrentCustomer(c); setShowCustomerModal(false); }} className="w-full text-left p-3 hover:bg-slate-50 rounded-lg flex justify-between items-center border border-transparent hover:border-slate-200">
                                    <div><div className="font-bold">{c.name}</div><div className="text-xs text-slate-500">{c.phone}</div></div>
                                    {c.status === 'VIP' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">VIP</span>}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowCustomerModal(false)} className="mt-4 w-full bg-slate-100 py-3 rounded-xl font-bold">Close</button>
                    </div>
                </div>
            )}

            {/* Receipt Modal - Visible during print */}
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white print:inset-auto print:static">
                    <div className="bg-white w-full max-w-sm rounded-none p-8 shadow-2xl text-center font-mono text-sm relative animate-fade-in-up print:shadow-none print:w-full print:max-w-none print:p-0">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-1">SmartTech Pro</h2>
                            <p className="text-xs text-slate-500">Sales Receipt</p>
                            <div className="border-b-2 border-dashed border-slate-300 my-4"></div>
                        </div>
                        
                        <div className="text-left space-y-3 mb-6">
                            {showReceiptModal.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold block">{item.name}</span>
                                        <span className="text-xs text-slate-500">{item.quantity} x {item.price.toLocaleString()}</span>
                                    </div>
                                    <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-dashed border-slate-300 pt-4 space-y-2 font-bold text-base">
                            <div className="flex justify-between text-slate-500 text-xs font-normal">
                                <span>Subtotal</span>
                                <span>{showReceiptModal.subtotal.toLocaleString()} {currency}</span>
                            </div>
                            {showReceiptModal.discount > 0 && (
                                <div className="flex justify-between text-green-600 text-xs font-normal">
                                    <span>Discount</span>
                                    <span>-{showReceiptModal.discount.toLocaleString()} {currency}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-slate-100">
                                <span>TOTAL</span>
                                <span>{showReceiptModal.total.toLocaleString()} {currency}</span>
                            </div>
                            
                            {showReceiptModal.tendered !== undefined && (
                                <div className="pt-2 mt-2 border-t border-slate-100 text-sm">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Tendered</span>
                                        <span>{showReceiptModal.tendered.toLocaleString()} {currency}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-800 mt-1">
                                        <span>Change</span>
                                        <span>{showReceiptModal.change?.toLocaleString()} {currency}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 text-xs text-slate-400">
                            <p>Receipt #: {showReceiptModal.receiptNumber}</p>
                            <p>{new Date(showReceiptModal.createdAt).toLocaleString()}</p>
                            <p className="mt-2">Thank you for your business!</p>
                        </div>

                        <div className="absolute -top-12 right-0 flex gap-2 print:hidden">
                            <button onClick={() => window.print()} className="bg-white text-slate-800 p-3 rounded-full shadow-lg hover:bg-slate-100"><i className="fa-solid fa-print"></i></button>
                            <button onClick={() => setShowReceiptModal(null)} className="bg-white text-red-500 p-3 rounded-full shadow-lg hover:bg-red-50"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Z-Report Modal - Hidden during print */}
            {lastClosedSession && (
                <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-fade-in-up relative">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl">
                                <i className="fa-solid fa-flag-checkered"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Shift Closed (Z-Report)</h2>
                            <p className="text-slate-500 text-sm">Summary of session</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-600">Total Sales</span>
                                <span className="font-bold">{lastClosedSession.summary?.grossSales.toLocaleString()} {currency}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-600">Expected Cash</span>
                                <span className="font-bold">{lastClosedSession.summary?.cashExpected.toLocaleString()} {currency}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-600">Actual Cash</span>
                                <span className="font-bold">{lastClosedSession.summary?.cashActual.toLocaleString()} {currency}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="font-bold text-slate-800">Difference</span>
                                <span className={`font-bold ${(lastClosedSession.summary?.cashDifference || 0) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {lastClosedSession.summary?.cashDifference.toLocaleString()} {currency}
                                </span>
                            </div>
                        </div>

                        <button onClick={() => setLastClosedSession(null)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Dismiss</button>
                    </div>
                </div>
            )}
        </div>
    );
};
