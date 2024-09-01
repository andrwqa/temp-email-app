import { Mail } from "lucide-react";
import { format, parseISO } from 'date-fns';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
}

const EmailList = ({ messages, openEmail }: { messages: Email[], openEmail: (message: Email) => void }) => {
  const formatShortDate = (isoString: string) => {
    const date = parseISO(isoString);
    return format(date, 'p'); // This will format the date as "5:02 PM"
  };

  return (
    <ul className="space-y-4">
      {messages.map((message: Email) => (
        <li 
          key={message.id}
          className={`flex items-center space-x-6 p-6 rounded-lg cursor-pointer transition-all duration-200 ${
            message.read ? 'bg-gray-100 dark:bg-gray-750' : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'
          }`}
          onClick={() => openEmail(message)}
        >
          <Mail 
            className={`h-8 w-8 flex-shrink-0 ${
              message.read 
                ? 'text-gray-400' 
                : 'text-gray-900 dark:text-gray-100'
            }`} 
            aria-hidden="true" 
          />
          <div className="flex-1 min-w-0">
            <p className={`text-lg font-medium truncate ${message.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {message.from}
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400 truncate mt-1">
              {message.subject}
            </p>
          </div>
          <div className="text-base text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatShortDate(message.time)}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default EmailList;