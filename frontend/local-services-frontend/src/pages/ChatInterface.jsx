import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  Send, 
  User, 
  Search,
  MessageCircle,
  Phone,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import io from 'socket.io-client';

const ChatInterface = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Get provider/customer ID from URL params
  const targetUserId = searchParams.get('provider') || searchParams.get('customer');

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(socketInstance);

    fetchConversations();

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && activeConversation) {
      // Join the chat room
      socket.emit('joinChat', activeConversation._id);

      // Listen for new messages
      socket.on('receiveMessage', (messageData) => {
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          message: messageData.message,
          sender: messageData.sender,
          senderType: messageData.senderType,
          createdAt: messageData.timestamp
        }]);
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [socket, activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // If there's a target user ID, try to find or create conversation
    if (targetUserId && conversations.length > 0) {
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p._id === targetUserId)
      );
      
      if (existingConversation) {
        setActiveConversation(existingConversation);
        fetchMessages(existingConversation._id);
      } else {
        // Create new conversation
        createConversation(targetUserId);
      }
    }
  }, [targetUserId, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await chatAPI.getMessages(conversationId, { page: 1, limit: 50 });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createConversation = async (participantId) => {
    try {
      const response = await chatAPI.createConversation({
        participantId,
        participantType: user?.role === 'Customer' ? 'Provider' : 'Customer'
      });
      
      const newConversation = response.data.conversation;
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = {
      chatId: activeConversation._id,
      message: newMessage,
      sender: user._id,
      senderType: user.role
    };

    try {
      // Send via socket for real-time delivery
      socket.emit('sendMessage', messageData);

      // Also save to database
      await chatAPI.sendMessage(activeConversation._id, {
        message: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMM dd');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-screen">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white border-r">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    const isActive = activeConversation?._id === conversation._id;
                    
                    return (
                      <div
                        key={conversation._id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setActiveConversation(conversation);
                          fetchMessages(conversation._id);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={otherParticipant?.profilePicture} />
                            <AvatarFallback>
                              {otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 truncate">
                                {otherParticipant?.name || 'Unknown User'}
                              </h4>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage?.message || 'No messages yet'}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-primary text-white text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={getOtherParticipant(activeConversation)?.profilePicture} />
                        <AvatarFallback>
                          {getOtherParticipant(activeConversation)?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getOtherParticipant(activeConversation)?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getOtherParticipant(activeConversation)?.role || 'User'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender === user._id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-primary text-white'
                              : 'bg-white text-gray-900 border'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500'
                          }`}>
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

