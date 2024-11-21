'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSocket } from '@/hooks/useSocket';
import { Message } from '@/types';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

const CONNECTION_COUNT_UPDATED_CHANNEL = 'chat:connection-count-updated';
const NEW_MESSAGE_CHANNEL = 'chat:new-message';

export default function Home() {
  const socket = useSocket();
  const messagesContainerRef = useRef<HTMLOListElement | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionCount, setConnectionCount] = useState<number>(0);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    socket?.on('connect', () => {
      console.log('Connected to socket');
    });

    socket?.on(NEW_MESSAGE_CHANNEL, (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket?.on(
      CONNECTION_COUNT_UPDATED_CHANNEL,
      ({ count }: { count: number }) => {
        setConnectionCount(count);
      }
    );
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    socket?.emit(NEW_MESSAGE_CHANNEL, {
      message: newMessage,
    });
    setNewMessage('');
  };

  return (
    <div className='relative h-[100vh] p-20'>
      <div className='min-w-80 absolute h-[70vh] left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] flex flex-col gap-3'>
        <h1 className='text-4xl font-bold  text-center'>
          Chat ({connectionCount})
        </h1>
        <ol
          ref={messagesContainerRef}
          className='flex-1 border overflow-y-auto  bg-gray-50 rounded p-5 '
        >
          {messages.map((message) => {
            return (
              <li
                className='bg-gray-200 w-fit m-1 p-2 rounded break-all'
                key={message.id}
              >
                <div className='flex gap-2 items-center mb-2'>
                  <p className='text-xs text-gray-500'>
                    {format(
                      new Date(message.createdAt),
                      'MMM dd, yyyy - hh:mm a'
                    )}
                  </p>
                  <p className='text-sm text-blue-600 font-medium'>
                    {message.port}
                  </p>
                </div>
                <p className='text-gray-800'>{message.message}</p>
              </li>
            );
          })}
        </ol>
        <form className='flex gap-3 items-center' onSubmit={handleSubmit}>
          <Textarea
            placeholder='spill the tea marites...'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={255}
          />
          <Button>Send</Button>
        </form>
      </div>
    </div>
  );
}
