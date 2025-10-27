import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Message, isSupabaseConfigured, isSupabaseUuid } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface MessageContextType {
  messages: Message[];
  loading: boolean;
  sendMessage: (orderId: string, recipientId: string, message: string) => Promise<void>;
  getOrderMessages: (orderId: string) => Message[];
  markAsRead: (messageId: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType>({
  messages: [],
  loading: false,
  sendMessage: async () => {},
  getOrderMessages: () => [],
  markAsRead: async () => {},
  refreshMessages: async () => {},
});

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshMessages();
    }
  }, [user]);

  const refreshMessages = async () => {
    if (!user) return;
    if (!isSupabaseConfigured || !supabase || !isSupabaseUuid(user.id)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Messages table not found in database - messaging disabled');
          setMessages([]);
        } else if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          console.warn('Database policy recursion error detected - messaging disabled');
          setMessages([]);
        } else {
          console.error('Error fetching messages:', error);
        }
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error in refreshMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (orderId: string, recipientId: string, message: string) => {
    if (!user) throw new Error('User must be authenticated to send message');
    if (!isSupabaseConfigured || !supabase || !isSupabaseUuid(user.id) || !isSupabaseUuid(recipientId)) {
      console.warn('Messaging not available - Supabase not configured');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert([{
        order_id: orderId,
        sender_id: user.id,
        recipient_id: recipientId,
        message,
      }]);

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    try {
      const { data: recipientData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', recipientId)
        .single();

      const { data: orderData } = await supabase
        .from('orders')
        .select('order_no, customer_email')
        .eq('id', orderId)
        .single();

      if (recipientData && orderData) {
        const recipientName = `${recipientData.first_name || ''} ${recipientData.last_name || ''}`.trim() || 'Customer';
        const senderName = user.role === 'admin' ? 'BWITTY NG Team' : `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

        const emailUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-message-email`;
        await fetch(emailUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: orderData.customer_email,
            recipientName,
            senderName,
            orderNo: orderData.order_no,
            message,
          }),
        });
      }
    } catch (emailError) {
      console.warn('Failed to send email notification:', emailError);
    }

    await refreshMessages();
  };

  const getOrderMessages = (orderId: string): Message[] => {
    return messages.filter(message => message.order_id === orderId);
  };

  const markAsRead = async (messageId: string) => {
    if (!isSupabaseConfigured || !supabase || !user || !isSupabaseUuid(user.id)) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }

    await refreshMessages();
  };

  return (
    <MessageContext.Provider value={{
      messages,
      loading,
      sendMessage,
      getOrderMessages,
      markAsRead,
      refreshMessages,
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};