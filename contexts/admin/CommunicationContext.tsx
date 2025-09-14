import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '../ToastContext';
// FIX: Added .ts extension to resolve module error.
import { SupportTicket, JoinRequest } from '../../lib/database.types.ts';

// --- Re-export types ---
export type { SupportTicket, JoinRequest };


// --- Mock Data ---
const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
    { id: 'TKT-1', name: 'سارة إبراهيم', email: 'sara@example.com', subject: 'استفسار عن الشحن', message: 'مرحباً، أود أن أسأل عن مدة الشحن لمدينة الإسكندرية. شكراً لكم.', created_at: new Date('2024-07-20T10:00:00Z').toISOString(), status: 'جديدة' },
    { id: 'TKT-2', name: 'محمد حسن', email: 'mohamed@example.com', subject: 'مشكلة في الدفع', message: 'أواجه مشكلة عند محاولة الدفع باستخدام بطاقة الائتمان، هل هناك طريقة أخرى؟', created_at: new Date('2024-07-19T14:20:00Z').toISOString(), status: 'تمت المراجعة' },
];

const MOCK_JOIN_REQUESTS: JoinRequest[] = [
    { id: 'JOIN-1', name: 'نور الهدى', email: 'nour@artist.com', role: 'رسام/مصمم جرافيك', portfolio_url: 'https://portfolio.example.com/nour', message: 'أنا رسامة متخصصة في كتب الأطفال وأحببت مشروعكم كثيراً. أتمنى أن تتاح لي فرصة التعاون معكم. هذا رابط أعمالي.', created_at: new Date('2024-07-18T09:00:00Z').toISOString(), status: 'جديد' },
];


// --- Context Definition ---

interface CreateSupportTicketPayload { name: string; email: string; subject: string; message: string; }
interface CreateJoinRequestPayload { name: string; email: string; role: string; portfolio_url: string | null; message: string; }

interface CommunicationContextType {
    supportTickets: SupportTicket[];
    createSupportTicket: (payload: CreateSupportTicketPayload) => Promise<void>;
    updateSupportTicketStatus: (ticketId: string, newStatus: SupportTicket['status']) => Promise<void>;

    joinRequests: JoinRequest[];
    createJoinRequest: (payload: CreateJoinRequestPayload) => Promise<void>;
    updateJoinRequestStatus: (requestId: string, newStatus: JoinRequest['status']) => Promise<void>;
    
    loading: boolean;
    error: string | null;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 200)); 
        setSupportTickets(MOCK_SUPPORT_TICKETS);
        setJoinRequests(MOCK_JOIN_REQUESTS);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createSupportTicket = async (payload: CreateSupportTicketPayload) => {
        const newTicket: SupportTicket = {
            id: `TKT-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
            status: 'جديدة',
        };
        setSupportTickets(prev => [newTicket, ...prev]);
    };

    const updateSupportTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        addToast('تم تحديث حالة الرسالة.', 'success');
    };

    const createJoinRequest = async (payload: CreateJoinRequestPayload) => {
        const newRequest: JoinRequest = {
            id: `JOIN-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
            status: 'جديد',
        };
        setJoinRequests(prev => [newRequest, ...prev]);
    };

    const updateJoinRequestStatus = async (requestId: string, newStatus: JoinRequest['status']) => {
        setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
        addToast('تم تحديث حالة الطلب.', 'success');
    };

    return (
        <CommunicationContext.Provider value={{
            supportTickets, createSupportTicket, updateSupportTicketStatus,
            joinRequests, createJoinRequest, updateJoinRequestStatus,
            loading, error,
        }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export const useCommunication = (): CommunicationContextType => {
    const context = useContext(CommunicationContext);
    if (context === undefined) {
        throw new Error('useCommunication must be used within a CommunicationProvider');
    }
    return context;
};