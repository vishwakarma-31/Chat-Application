import React, { useEffect, useRef } from 'react';
import { MessageEntity } from '../types/chatTypes';
import { useChatStore } from '../stores/chatStore';

interface MessageListProps {
  messages: MessageEntity[];
  conversationId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { currentUser } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages
  const groupedMessages = messages.reduce((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.senderId === message.senderId) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        senderId: message.senderId,
        messages: [message]
      });
    }
    
    return groups;
  }, [] as { senderId: string; messages: MessageEntity[] }[]);
  
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {groupedMessages.map((group, groupIndex) => {
        const isSelf = group.senderId === currentUser?.userId;
        
        return (
          <div key={groupIndex} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {!isSelf && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 mr-2 flex items-center justify-center text-xs font-bold text-slate-500 self-end mb-1">
                U
              </div>
            )}
            
            <div className={`flex flex-col space-y-1 max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
              {group.messages.map((message, msgIndex) => {
                const isFirst = msgIndex === 0;
                const isLast = msgIndex === group.messages.length - 1;
                
                return (
                  <div 
                    key={message.messageId}
                    className={`
                      px-4 py-2.5 shadow-sm text-sm relative group
                      ${isSelf 
                        ? 'bg-indigo-600 text-white rounded-l-2xl rounded-r-md' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-r-2xl rounded-l-md'
                      }
                      ${isSelf && isFirst ? 'rounded-tr-2xl' : ''}
                      ${isSelf && isLast ? 'rounded-br-2xl' : ''}
                      ${!isSelf && isFirst ? 'rounded-tl-2xl' : ''}
                      ${!isSelf && isLast ? 'rounded-bl-2xl' : ''}
                    `}
                  >
                    <p className="leading-relaxed">{message.body}</p>
                    <div className={`text-[10px] mt-1 flex items-center ${isSelf ? 'text-indigo-200 justify-end' : 'text-slate-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isSelf && (
                        <span className="ml-1">
                          {message.status === 'Read' ? (
                            <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          ) : (
                            <svg className="w-3 h-3 text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;