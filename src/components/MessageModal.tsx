import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useMessages } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  recipientId: string;
  recipientName: string;
  orderNo: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  orderId,
  recipientId,
  recipientName,
  orderNo,
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { messages, sendMessage, getOrderMessages, refreshMessages } = useMessages();
  const { user } = useAuth();

  const orderMessages = getOrderMessages(orderId);

  useEffect(() => {
    if (isOpen) {
      refreshMessages();
    }
  }, [isOpen, refreshMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(orderId, recipientId, message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
              Message Customer
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Order {orderNo} - {recipientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto max-h-96">
          {orderMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                !message.trim() || sending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;