
import React, { useState, useEffect } from 'react';
import { User, InventoryItem, Course, Customer, AppLanguage, POSSession, POSOrder, POSOrderItem, FinanceRecord, POSCategory, POSTax, PaymentMethod } from '../types';
import { COLORS, POSSidebar } from './pos/Shared';
import { RegisterView } from './pos/Register';
import { ShiftScreen, ShiftHistory } from './pos/Shift';
import { SalesSummary } from './pos/Sales';
import { ItemsList, ItemForm, CategoryForm } from './pos/Items';
import { ReceiptsView } from './pos/Receipts';
import { SettingsMenu, GeneralSettings, PrinterSettings } from './pos/Settings';

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
    users?: User[];
}

export const POSView: React.FC<POSProps> = ({ 
    inventory, setInventory, categories, setCategories, sessions, setSessions, currency = 'EGP', currentUser, orders, setOrders, courses, customers, onAddFinanceRecord
}) => {
    const [view, setView] = useState('register');
    const [cart, setCart] = useState<POSOrderItem[]>([]);
    const [activeTicketId, setActiveTicketId] = useState(1);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showTicketMenu, setShowTicketMenu] = useState(false);

    // --- DATA FILLER ---
    useEffect(() => {
        if (orders.length === 0) {
            // Generate Mock Orders for Sales Summary
            const mockOrders: POSOrder[] = [];
            for (let i = 0; i < 50; i++) {
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
                mockOrders.push({
                    id: `MOCK-${i}`,
                    organizationId: 'ORG',
                    sessionId: 'SESS-MOCK',
                    items: [],
                    subtotal: Math.floor(Math.random() * 500) + 50,
                    taxTotal: 0,
                    discount: 0,
                    total: Math.floor(Math.random() * 500) + 50,
                    tendered: 1000,
                    change: 0,
                    paymentMethod: Math.random() > 0.5 ? 'Cash' : 'Card',
                    status: 'Completed',
                    createdAt: date.toISOString(),
                    receiptNumber: `100-${i}`
                });
            }
            setOrders(mockOrders);
        }
        if (sessions.length === 0) {
            setSessions([
                { id: 'SESS-1', organizationId: 'ORG', openedAt: new Date(Date.now() - 86400000).toISOString(), closedAt: new Date().toISOString(), openedBy: currentUser.id, startCash: 100, endCash: 1500, status: 'Closed' }
            ]);
        }
    }, []);

    const navigate = (v: string) => setView(v);

    const addToCart = (item: InventoryItem | Course) => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            const isCourse = 'title' in item;
            const price = 'price' in item ? item.price : (item as InventoryItem).sellingPrice || 0;
            setCart([...cart, { id: item.id, name: isCourse ? (item as Course).title : (item as InventoryItem).name, price: price || 0, quantity: 1, type: isCourse ? 'Course' : 'Product', taxRate: 0 }]);
        }
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
    };

    const handleCheckout = (method: PaymentMethod, total: number) => {
        const activeSession = sessions.find(s => s.status === 'Open');
        if (!activeSession) { alert("Open a shift first"); setView('shift'); return; }
        
        const newOrder: POSOrder = {
            id: `ORD-${Date.now()}`,
            sessionId: activeSession.id,
            organizationId: currentUser.organizationId,
            items: cart,
            subtotal: total,
            taxTotal: 0,
            discount: 0,
            total,
            tendered: total,
            change: 0,
            paymentMethod: method,
            status: 'Completed',
            createdAt: new Date().toISOString(),
            receiptNumber: `${Date.now()}`,
            customerId: currentCustomer?.id
        };
        setOrders([...orders, newOrder]);
        setCart([]);
        setCurrentCustomer(null);
        alert('Payment Successful');
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className={`flex h-full w-full font-sans overflow-hidden ${view === 'sales' ? 'bg-[#f5f5f5] text-slate-800' : `${COLORS.bg} text-white`}`}>
            <POSSidebar activeView={view} setView={setView} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {view === 'register' && (
                    <RegisterView 
                        inventory={inventory} courses={courses} categories={categories} 
                        cart={cart} addToCart={addToCart} updateQty={updateQty} onClearCart={() => setCart([])}
                        currentCustomer={currentCustomer} setShowCustomerModal={setShowCustomerModal}
                        handleCheckout={handleCheckout} total={subtotal} currency={currency}
                        onOpenTicketMenu={() => setShowTicketMenu(true)} activeTicketId={activeTicketId}
                    />
                )}

                {view === 'shift' && (
                    <ShiftScreen 
                        session={sessions.find(s => s.status === 'Open')} 
                        orders={orders}
                        onOpenShift={(amt) => setSessions([...sessions, { id: `S-${Date.now()}`, organizationId: 'ORG', openedAt: new Date().toISOString(), openedBy: currentUser.id, startCash: amt, status: 'Open' }])}
                        onCloseShift={(end) => {
                            const active = sessions.find(s => s.status === 'Open');
                            if(active) setSessions(sessions.map(s => s.id === active.id ? { ...s, status: 'Closed', closedAt: new Date().toISOString(), endCash: end } : s));
                        }}
                        onNavigate={navigate} currency={currency}
                    />
                )}
                {view === 'shift_history' && <ShiftHistory sessions={sessions} onBack={() => navigate('shift')} />}

                {view === 'sales' && <SalesSummary orders={orders} currency={currency} />}

                {view === 'items' && <ItemsList inventory={inventory} categories={categories} onNavigate={navigate} currency={currency} />}
                {view === 'items_create' && <ItemForm onBack={() => navigate('items')} onSave={(i) => setInventory && setInventory([...inventory, {...i, id: `I-${Date.now()}`} as InventoryItem])} categories={categories} />}
                {view === 'categories_create' && <CategoryForm onBack={() => navigate('items')} onSave={(c) => setCategories([...categories, {...c, id: `C-${Date.now()}`} as POSCategory])} />}

                {view === 'orders' && <ReceiptsView orders={orders} currency={currency} />}

                {view === 'settings' && <SettingsMenu onNavigate={navigate} />}
                {view === 'settings_general' && <GeneralSettings onBack={() => navigate('settings')} />}
                {view === 'settings_printers' && <PrinterSettings onBack={() => navigate('settings')} />}
            </div>
        </div>
    );
};
