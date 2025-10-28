import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Package, Send, ArrowLeft } from 'lucide-react';
import { useMessages } from '../context/MessageContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

interface UserMessagesSectionProps {
  userId: string;
}

const UserMessagesSection: React.FC<UserMessagesSectionProps> = ({ userId }) => {
  const { messages, getOrderMessages, sendMessage, loading } = useMessages();
  const { orders } = useOrders();
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const userOrders = orders.filter(order => order.userId === userId);

  const ordersWithMessages = userOrders.map(order => {
    const orderMessages = getOrderMessages(order.id);
    const unreadCount = orderMessages.filter(msg =>
      msg.recipient_id === userId && !msg.is_read
    ).length;

    return {
      ...order,
      messageCount: orderMessages.length,
      unreadCount,
      lastMessage: orderMessages[orderMessages.length - 1],
    };
  }).filter(order => order.messageCount > 0);

  const selectedOrder = selectedOrderId
    ? userOrders.find(o => o.id === selectedOrderId)
    : null;

  const selectedMessages = selectedOrderId
    ? getOrderMessages(selectedOrderId)
    : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOrderId || sending) return;

    setSending(true);
    try {
      const adminId = '00000000-0000-0000-0000-000000000000';
      await sendMessage(selectedOrderId, adminId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!selectedOrderId) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Messages</h2>
          <p className="text-gray-600 mt-1">Messages from your orders</p>
        </div>

        {ordersWithMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-6">
              You don't have any messages. Admin will contact you through your orders if needed.
            </p>
            <Link
              to="/account"
              className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Account
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersWithMessages.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:border-pink-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">Order #{order.orderNo}</h3>
                      {order.unreadCount > 0 && (
                        <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {order.unreadCount} new
                        </span>
                      )}
                    </div>

                    {order.lastMessage && (
                      <div className="ml-8">
                        <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                          {order.lastMessage.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(order.lastMessage.created_at)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {order.messageCount}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => setSelectedOrderId(null)}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Order #{selectedOrder?.orderNo}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Conversation with BWITTY NG Team
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        {selectedMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.sender_id === userId
                      ? 'bg-pink-500 text-black'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm mb-1">{msg.message}</p>
                  <p
                    className={`text-xs ${
                      msg.sender_id === userId ? 'text-black opacity-70' : 'text-gray-500'
                    }`}
                  >
                    {formatDate(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex space-x-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
            !newMessage.trim() || sending
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600 text-black'
          }`}
        >
          <Send className="w-5 h-5 mr-2" />
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Messages are saved to your order history. Check back here for responses from our team.
      </p>
    </div>
  );
};

export default UserMessagesSection;
