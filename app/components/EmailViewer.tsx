import { ArrowLeft } from "lucide-react";
import { format, parseISO } from 'date-fns';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
}

const EmailViewer = ({ selectedEmail, closeEmail }: { selectedEmail: Email | null, closeEmail: () => void }) => {
  const formatDate = (isoString: string) => {
    const date = parseISO(isoString);
    return format(date, 'PPpp'); // This will format the date as "Aug 25, 2024, 5:02 PM"
  };

  if (!selectedEmail) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <button
        onClick={closeEmail}
        className="mb-4 flex items-center text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 relative overflow-hidden rounded-lg px-4 py-2"
      >
        <ArrowLeft className="h-5 w-5 mr-2 relative z-10" />
        <span className="relative z-10">Back to Inbox</span>
        <div 
          className="absolute inset-0 opacity-30 blur-2xl"
          style={{
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(167, 139, 250, 0.3), rgba(236, 72, 153, 0.3))',
            filter: 'blur(18px)',
          }}
        ></div>
      </button>
      <h3 className="text-2xl font-semibold mb-4">{selectedEmail.subject}</h3>
      <p className="text-sm text-gray-500 mb-2">From: {selectedEmail.from}</p>
      <p className="text-sm text-gray-500 mb-4">Time: {formatDate(selectedEmail.time)}</p>
      <div className="prose dark:prose-invert max-w-none overflow-auto max-h-[60vh]">
        <p className="whitespace-pre-wrap break-words">{selectedEmail.body}</p>
      </div>
    </div>
  );
};

export default EmailViewer;