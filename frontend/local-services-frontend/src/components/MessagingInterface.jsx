import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Send, MessageCircle, User, Clock } from 'lucide-react';
import io from 'socket.io-client';
import { chatAPI } from '../lib/api';

const MessagingInterface = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketInstance.on('receiveMessage', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Mock data for demo
      setConversations([
        {
          _id: '1',
          participants: [
            { _id: user.id, name: user.name || 'You', role: user.role },
            { _id: '2', name: 'John Smith', role: user.role === 'Customer' ? 'Provider' : 'Customer' }
          ],
          lastMessage: {
            content: 'Hello, I need help with plumbing',
            timestamp: new Date(Date.now() - 3600000)
          },
          unreadCount: 2
        },
        {
          _id: '2',
          participants: [
            { _id: user.id, name: user.name || 'You', role: user.role },
            { _id: '3', name: 'Sarah Johnson', role: user.role === 'Customer' ? 'Provider' : 'Customer' }
          ],
          lastMessage: {
            content: 'When can you start the work?',
            timestamp: new Date(Date.now() - 7200000)
          },
          unreadCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      setMessages(response.data.messages || []);
      
      // Join the conversation room
      if (socket) {
        socket.emit('joinChat', conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Mock messages for demo
      setMessages([
        {
          _id: '1',
          content: 'Hello, I need help with plumbing in my kitchen',
          sender: conversationId === '1' ? '2' : '3',
          senderType: user.role === 'Customer' ? 'Provider' : 'Customer',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          _id: '2',
          content: 'Hi! I can help you with that. What seems to be the issue?',
          sender: user.id,
          senderType: user.role,
          timestamp: new Date(Date.now() - 3500000)
        },
        {
          _id: '3',
          content: 'The sink is leaking and I think there might be a problem with the pipes',
          sender: conversationId === '1' ? '2' : '3',
          senderType: user.role === 'Customer' ? 'Provider' : 'Customer',
          timestamp: new Date(Date.now() - 3400000)
        }
      ]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const messageData = {
        chatId: selectedConversation._id,
        content: newMessage.trim(),
        sender: user.id,
        senderType: user.role
      };

      // Emit to socket for real-time delivery
      if (socket) {
        socket.emit('sendMessage', messageData);
      }

      // Add message to local state immediately
      const newMsg = {
        _id: Date.now().toString(),
        content: newMessage.trim(),
        sender: user.id,
        senderType: user.role,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMsg]);

      // Send to backend
      await chatAPI.sendMessage(selectedConversation._id, newMessage.trim());
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold text-lg">Messages</h3>
          <p className="text-sm text-gray-500">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <ScrollArea className="h-[calc(600px-80px)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?._id === conversation._id;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      loadMessages(conversation._id);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {otherParticipant?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium truncate ${
                            isSelected ? 'text-primary-foreground' : 'text-gray-900'
                          }`}>
                            {otherParticipant?.name || 'Unknown User'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`text-sm truncate ${
                          isSelected ? 'text-primary-foreground/80' : 'text-gray-500'
                        }`}>
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        
                        <div className="flex items-center mt-1">
                          <Clock className={`h-3 w-3 mr-1 ${
                            isSelected ? 'text-primary-foreground/60' : 'text-gray-400'
                          }`} />
                          <span className={`text-xs ${
                            isSelected ? 'text-primary-foreground/60' : 'text-gray-400'
                          }`}>
                            {conversation.lastMessage?.timestamp 
                              ? formatTime(conversation.lastMessage.timestamp)
                              : 'Now'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getOtherParticipant(selectedConversation)?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">
                    {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {getOtherParticipant(selectedConversation)?.role || 'User'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender === user.id;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingInterface;

