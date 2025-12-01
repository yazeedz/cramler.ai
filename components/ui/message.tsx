import React from 'react';

interface MessageProps {
  initials: string;
  message: string;
  dir?: 'ltr' | 'rtl' | 'auto'; // Optional text direction
}

export const Message: React.FC<MessageProps> = ({ initials, message, dir = 'auto' }) => {
  return (
    <div className="group relative inline-flex gap-2 bg-bg-300 rounded-xl pl-2.5 py-2.5 break-words text-text-100 transition-all max-w-[75ch] flex-col pr-6">  
      <div className="flex flex-row gap-2">
        <div className="shrink-0">
          <div className="flex shrink-0 items-center justify-center rounded-full font-bold select-none h-7 w-7 text-[12px] bg-bg-500">
            {initials}
          </div>
        </div>
        <div data-testid="user-message" className="font-user-message grid grid-cols-1 gap-2 py-0.5 text-[0.9375rem] leading-6" dir={dir}>
          <p className="whitespace-pre-wrap break-words">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
