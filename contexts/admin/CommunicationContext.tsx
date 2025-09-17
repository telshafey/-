import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
// FIX: Added .tsx extension to useToast import to resolve module error.
import { useToast } from '../ToastContext.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { SupportTicket, JoinRequest, Database } from '../../lib/database.types.ts';

// --- Re-export types ---
export type { SupportTicket, JoinRequest };

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
        setError(null);
        try {
            const [ticketsRes, requestsRes] = await Promise.all([
                supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
                supabase.from('join_requests').select('*').order('created_at', { ascending: false })
            ]);

            if (ticketsRes.error) throw ticketsRes.error;
            if (requestsRes.error) throw requestsRes.error;

            setSupportTickets(ticketsRes.data || []);
            setJoinRequests(requestsRes.data || []);
        } catch (e: any) {
            setError('فشل تحميل بيانات التواصل.');
            addToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createSupportTicket = async (payload: CreateSupportTicketPayload) => {
        const newTicketData: Database['public']['Tables']['support_tickets']['Insert'] = {
            id: `TKT-${Date.now()}`,
            ...payload,
            status: 'جديدة',
        };
        const { data, error } = await supabase.from('support_tickets').insert([newTicketData]).select().single();
        if (error) {
            addToast(`فشل إرسال الرسالة: ${error.message}`, 'error');
            throw error;
        }
        if (data) {
            setSupportTickets(prev => [data, ...prev]);
        }
    };

    const updateSupportTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
        const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', ticketId);
        if (error) {
            addToast('فشل تحديث حالة الرسالة.', 'error');
            throw error;
        }
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        addToast('تم تحديث حالة الرسالة.', 'success');
    };

    const createJoinRequest = async (payload: CreateJoinRequestPayload) => {
        const newRequestData: Database['public']['Tables']['join_requests']['Insert'] = {
            id: `JOIN-${Date.now()}`,
            ...payload,
            status: 'جديد',
        };
        const { data, error } = await supabase.from('join_requests').insert([newRequestData]).select().single();
        if (error) {
            addToast(`فشل إرسال الطلب: ${error.message}`, 'error');
            throw error;
        }
        if (data) {
            setJoinRequests(prev => [data, ...prev]);
        }
    };

    const updateJoinRequestStatus = async (requestId: string, newStatus: JoinRequest['status']) => {
        const { error } = await supabase.from('join_requests').update({ status: newStatus }).eq('id', requestId);
        if (error) {
            addToast('فشل تحديث حالة الطلب.', 'error');
            throw error;
        }
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