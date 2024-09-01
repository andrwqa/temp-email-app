"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Copy, Inbox, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import Particles from "@/components/magicui/particles";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Poppins } from 'next/font/google';
import TimeTicker from "@/app/components/TimeTicker";
import EmailList from "@/app/components/EmailList";
import EmailViewer from "@/app/components/EmailViewer";

const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ['latin'] });

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
}

export default function Component() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [color, setColor] = useState("#000000");
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Email[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(600); // Initialize with 600 instead of null
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setColor(theme === "dark" ? "#ffffff" : "#000000");
    }
  }, [theme, mounted]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('tempEmail');
    const storedTime = localStorage.getItem('timeLeft');
    
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      const newEmail = `user${Math.floor(Math.random() * 1000)}@temp-email-app.vercel.app`;
      setEmail(newEmail);
      localStorage.setItem('tempEmail', newEmail);
    }

    if (storedTime) {
      setTimeLeft(parseInt(storedTime));
    } else {
      setTimeLeft(600); // 10 minutes in seconds
      localStorage.setItem('timeLeft', '600');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        localStorage.setItem('timeLeft', newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      const newEmail = `user${Math.floor(Math.random() * 1000)}@temp-email-app.vercel.app`;
      setEmail(newEmail);
      localStorage.setItem('tempEmail', newEmail);
      const newTime = 600; // 10 minutes in seconds
      setTimeLeft(newTime);
      localStorage.setItem('timeLeft', newTime.toString());
    }
  }, [timeLeft]);

  const fetchEmails = useCallback(async () => {
    if (!email) return;
    try {
      console.log('Fetching emails for:', email);
      const response = await fetch(`/api/emails?address=${email}`);
      if (response.ok) {
        const newEmails = await response.json();
        console.log('Fetched emails:', newEmails);
        const readEmails = JSON.parse(localStorage.getItem('readEmails') || '{}');
        const updatedEmails = newEmails
          .map((email: { id: string }) => ({
            ...email,
            read: readEmails[email.id] || false
          }))
          .sort((a: { time: string }, b: { time: string }) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setMessages(updatedEmails);
      } else {
        console.error('Failed to fetch emails:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    }
  }, [email]);

  useEffect(() => {
    console.log('Email changed:', email);
    fetchEmails();

    if (!email) return;

    console.log('Setting up SSE connection for:', email);
    const eventSource = new EventSource(`/api/emails?address=${email}&sse=true`);

    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event.data);
      try {
        const newEmail = JSON.parse(event.data) as Email;
        setMessages(prevMessages => {
          const emailExists = prevMessages.some(msg => msg.id === newEmail.id);
          if (!emailExists) {
            console.log('Adding new email to messages:', newEmail);
            return [newEmail, ...prevMessages];
          }
          return prevMessages;
        });
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
    };
  }, [email, fetchEmails]);

  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  const resetTimer = () => {
    setTimeLeft(600); // Reset to 10 minutes
    localStorage.setItem('timeLeft', '600');
  };

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      toast({
        title: "Email copied",
        description: "The email address has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  };

  const openEmail = (message: Email) => {
    setSelectedEmail(message);
    // Mark email as read
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === message.id ? { ...msg, read: true } : msg
      )
    );
    // Save read state to localStorage
    const readEmails = JSON.parse(localStorage.getItem('readEmails') || '{}');
    readEmails[message.id] = true;
    localStorage.setItem('readEmails', JSON.stringify(readEmails));
  };

  const closeEmail = () => {
    setSelectedEmail(null);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
      <Particles
        className="fixed inset-0 z-0 pointer-events-none opacity-45"
        quantity={30}
        staticity={25}
        ease={250}
        size={3}
        color="#8A2BE5"
        refresh={false}
      />
      
      <div className="relative z-10 flex-grow flex flex-col p-4 sm:p-6 md:p-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className={`${poppins.className} text-5xl sm:text-6xl md:text-7xl font-normal mb-2 relative`}>
            <span className="text-gray-600 dark:text-gray-400">
              OneTimeMail
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Disposable email for your temporary needs</p>
          <div className="text-center mb-8">
            <p className="text-xl mb-4">Time remaining:</p>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold mr-4">
                {timeLeft !== null && <TimeTicker value={timeLeft} />}
              </div>
              <Button
                onClick={resetTimer}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg transition-all duration-300 relative overflow-hidden hover:bg-white focus:bg-white active:bg-white dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:active:bg-gray-800"
                aria-label="Reset timer"
                title="Reset timer"
                style={{
                  boxShadow: '0 0 5px rgba(59, 130, 246, 0.15), 0 0 10px rgba(167, 139, 250, 0.15), 0 0 15px rgba(236, 72, 153, 0.15)',
                }}
              >
                <RefreshCw className="h-5 w-5 relative z-10 text-gray-600 dark:text-gray-300" />
                <div 
                  className="absolute inset-0 opacity-30 blur-2xl"
                  style={{
                    background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(167, 139, 250, 0.3), rgba(236, 72, 153, 0.3))',
                    filter: 'blur(18px)',
                  }}
                ></div>
              </Button>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-mono text-3xl md:text-4xl break-all text-center w-full max-w-3xl mx-auto mt-8"
          >
            <div 
              className="inline-flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-transparent rounded-full cursor-pointer transition-all duration-300 relative overflow-hidden group hover:shadow-lg"
              onClick={copyToClipboard}
              title="Click to copy"
              style={{
                boxShadow: '0 0 5px rgba(59, 130, 246, 0.15), 0 0 10px rgba(167, 139, 250, 0.15), 0 0 15px rgba(236, 72, 153, 0.15)',
              }}
            >
              <span className="mr-6 relative z-10">{email || 'Loading...'}</span>
              <div className="flex items-center relative z-10">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-2 bg-green-500 rounded-full mr-2"
                    >
                      <Check className="h-6 w-6 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-2 rounded-full mr-2"
                    >
                      <Copy className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div 
                className="absolute inset-0 opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                style={{
                  background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(167, 139, 250, 0.3), rgba(236, 72, 153, 0.3))',
                  filter: 'blur(18px)',
                }}
              ></div>
            </div>
          </motion.div>
        </motion.header>

        <main className="flex-grow container mx-auto max-w-4xl">
          <Card className="overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-lg">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-6">
                {selectedEmail ? (
                  <EmailViewer selectedEmail={selectedEmail} closeEmail={closeEmail} />
                ) : (
                  <>
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center">
                        <Inbox className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
                        Inbox
                      </h2>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 text-xl py-12">No messages yet</p>
                    ) : (
                      <EmailList messages={messages} openEmail={openEmail} />
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <footer className="relative z-10 mt-auto py-6 text-center text-base text-gray-600">
        Contact me: <a href="mailto:andrwqa@gmail.com" className="text-blue-500 hover:text-blue-600 transition-colors duration-200 font-medium">andrwqa@gmail.com</a>
      </footer>
    </div>
  );
}