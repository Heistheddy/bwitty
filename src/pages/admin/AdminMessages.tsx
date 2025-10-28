import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, User, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessageContext';
import { useOrders } from '../../context/OrderContext';
import { supabase } from '../../lib/supabase';

interface ConversationUser {
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  orderNo: string;
  messageCount: number;
  unreadCount: number;
  lastMessage: any;
}

const AdminMessages: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { messages, getOrderMessages, sendMessage, refreshMessages, loading: messagesLoading } = useMessages();
  const { orders } = useOrders();
  const [selectedConversation, setSelectedConversation] = useState<ConversationUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshMessages]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const ordersWithMessages = orders
    .map(order => {
      const orderMessages = getOrderMessages(order.id);
      if (orderMessages.length === 0) return null;

      const unreadCount = orderMessages.filter(msg =>
        msg.recipient_id !== order.userId && !msg.is_read
      ).length;

      return {
        userId: order.userId,
        userName: order.customerName,
        userEmail: order.customerEmail,
        orderId: order.id,
        orderNo: order.orderNo,
        messageCount: orderMessages.length,
        unreadCount,
        lastMessage: orderMessages[orderMessages.length - 1],
      };
    })
    .filter((conv): conv is ConversationUser => conv !== null)
    .sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return 0;
      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
    });

  const selectedMessages = selectedConversation
    ? getOrderMessages(selectedConversation.orderId)
    : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      await sendMessage(
        selectedConversation.orderId,
        selectedConversation.userId,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedConversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">All customer conversations</p>
          </div>

          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : ordersWithMessages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Conversations Yet</h3>
              <p className="text-gray-600">
                Customer conversations will appear here when they message you or you message them.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {ordersWithMessages.map((conversation) => (
                  <button
                    key={conversation.orderId}
                    onClick={() => setSelectedConversation(conversation)}
                    className="w-full p-6 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <h3 className="font-semibold text-gray-900">
                            {conversation.userName}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {conversation.unreadCount} new
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Order #{conversation.orderNo}
                          </span>
                        </div>

                        {conversation.lastMessage && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {conversation.lastMessage.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(conversation.lastMessage.created_at)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {conversation.messageCount}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <User className="w-5 h-5 text-gray-400" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedConversation.userName}
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>Order #{selectedConversation.orderNo}</span>
                  <span className="text-gray-400">•</span>
                  <span>{selectedConversation.userEmail}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 max-h-96 overflow-y-auto">
            {selectedMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedMessages.map((msg) => {
                  const isFromCustomer = msg.sender_id === selectedConversation.userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isFromCustomer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          isFromCustomer
                            ? 'bg-white text-gray-900 border border-gray-200'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm mb-1">{msg.message}</p>
                        <p
                          className={`text-xs ${
                            isFromCustomer ? 'text-gray-500' : 'text-blue-100'
                          }`}
                        >
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                  !newMessage.trim() || sending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Send className="w-5 h-5 mr-2" />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
