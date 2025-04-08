import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Trash2, X, Paperclip } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { sendWebSocketMessage } from "@/lib/websocket";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  displayName: string;
  profilePicture: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

interface ConversationProps {
  user: User;
  onClose: () => void;
}

export default function Conversation({ user, onClose }: ConversationProps) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Get messages between users
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", user.id],
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: user.id,
        content
      });
      return await res.json();
    },
    onSuccess: (message) => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      
      // Also send via WebSocket for real-time delivery
      sendWebSocketMessage({
        type: 'chat_message',
        message: {
          senderId: currentUser?.id,
          receiverId: user.id,
          content: message.content
        }
      });
    }
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Format time for message timestamp
  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };
  
  return (
    <div id="chat-conversation" className="fixed bottom-16 right-4 md:bottom-4 md:right-4 w-full max-w-sm bg-white rounded-t-lg md:rounded-lg shadow-lg z-30 md:hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profilePicture} alt={user.displayName} />
              <AvatarFallback className="bg-gray-300">
                {user.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <div className="ml-2">
            <p className="font-medium text-sm">{user.displayName}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100">
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div ref={messagesContainerRef} className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isSentByCurrentUser = message.senderId === currentUser?.id;
            
            return (
              <div key={message.id} className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${isSentByCurrentUser ? 'chat-bubble-sent' : 'chat-bubble-received'} px-3 py-2`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-right text-xs text-gray-500 mt-1">
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex items-center">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="p-2 text-gray-500 hover:text-primary"
        >
          <Paperclip className="h-6 w-6" />
        </Button>
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary mx-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button 
          type="submit" 
          variant="ghost" 
          size="icon" 
          className="p-2 text-primary"
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </form>
    </div>
  );
}
