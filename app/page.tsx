"use client";

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Copy, Mail, ArrowLeft, Inbox, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { format, parseISO } from 'date-fns'
import Particles from "@/components/magicui/particles"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"; // Add this import

const TimeTicker = ({ value }: { value: number }) => {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <div className="flex justify-center items-center">
      <div className="flex items-baseline">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={minutes}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-6xl font-bold tabular-nums"
          >
            {formatNumber(minutes)}
          </motion.span>
        </AnimatePresence>
        <span className="text-6xl font-bold mx-1">:</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={seconds}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-6xl font-bold tabular-nums"
          >
            {formatNumber(seconds)}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function Component() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [color, setColor] = useState("#000000")
  const [email, setEmail] = useState<string | null>(null)
  const [messages, setMessages] = useState([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setColor(theme === "dark" ? "#ffffff" : "#000000")
    }
  }, [theme, mounted])

  useEffect(() => {
    const storedEmail = localStorage.getItem('tempEmail')
    const storedTime = localStorage.getItem('timeLeft')
    
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      const newEmail = `user${Math.floor(Math.random() * 1000)}@tempemail.com`
      setEmail(newEmail)
      localStorage.setItem('tempEmail', newEmail)
    }

    if (storedTime) {
      setTimeLeft(parseInt(storedTime))
    } else {
      setTimeLeft(600) // 10 minutes in seconds
      localStorage.setItem('timeLeft', '600')
    }
  }, [])

  useEffect(() => {
    if (timeLeft === null) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null) return null
        const newTime = prevTime > 0 ? prevTime - 1 : 0
        localStorage.setItem('timeLeft', newTime.toString())
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    if (timeLeft === 0) {
      refreshEmail()
    }
  }, [timeLeft])

  useEffect(() => {
    if (!email) return;

    const fetchEmails = async () => {
      try {
        const response = await fetch(`/api/emails?address=${email}`);
        if (response.ok) {
          const newEmails = await response.json();
          console.log('Fetched emails:', newEmails);
          // Apply read state from localStorage
          const readEmails = JSON.parse(localStorage.getItem('readEmails') || '{}');
          const updatedEmails = newEmails.map(email => ({
            ...email,
            read: readEmails[email.id] || false
          }));
          setMessages(updatedEmails);
        }
      } catch (error) {
        console.error("Failed to fetch emails:", error);
      }
    };

    fetchEmails();

    const eventSource = new EventSource(`/api/emails?address=${email}&sse=true`)

    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event.data)
      const newEmail = JSON.parse(event.data)
      setMessages(prevMessages => {
        const emailExists = prevMessages.some(msg => msg.id === newEmail.id)
        if (!emailExists) {
          console.log('Adding new email to messages:', newEmail)
          return [...prevMessages, { ...newEmail, read: false }]
        }
        return prevMessages
      })
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [email])

  const refreshEmail = () => {
    const newEmail = `user${Math.floor(Math.random() * 1000)}@tempemail.com`
    setEmail(newEmail)
    setMessages([])
    setTimeLeft(600)
    localStorage.setItem('timeLeft', '600')
    localStorage.setItem('tempEmail', newEmail)
    localStorage.removeItem('readEmails') // Clear read states
  }

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(email)
      setCopied(true)
      toast({
        title: "Email copied",
        description: "The email address has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000) // Reset copied state after 2 seconds
    }
  }

  const openEmail = (message) => {
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
  }

  const formatDate = (isoString: string) => {
    const date = parseISO(isoString)
    return format(date, 'PPpp') // This will format the date as "Aug 25, 2024, 5:02 PM"
  }

  const formatShortDate = (isoString: string) => {
    const date = parseISO(isoString)
    return format(date, 'p') // This will format the date as "5:02 PM"
  }

  if (!mounted) return null

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col p-4 overflow-hidden">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 pt-8 relative z-10"
      >
        <h1 className="text-5xl font-bold mb-2">TempEmail</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Disposable email for your temporary needs</p>
      </motion.header>

      <div className="text-center mb-8 relative z-10">
        <p className="text-xl mb-2">Time remaining:</p>
        {timeLeft !== null && <TimeTicker value={timeLeft} />}
      </div>

      <main className="flex-grow container mx-auto max-w-4xl relative z-10">
        <Particles
          className="fixed inset-0 z-0 pointer-events-none"
          quantity={100}
          ease={80}
          color={color}
          refresh={false}
        />
        <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-mono text-2xl md:text-3xl break-all text-center w-full max-w-2xl"
              >
                <div 
                  className="p-4 border border-blue-300 dark:border-blue-600 rounded-2xl cursor-pointer transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:shadow-[0_0_10px_rgba(147,197,253,0.3)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:hover:shadow-[0_0_15px_rgba(147,197,253,0.5)]"
                  onClick={copyToClipboard}
                  title="Click to copy"
                >
                  {email || 'Loading...'}
                </div>
              </motion.div>
              <div className="flex space-x-4">
                <Button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                  aria-label="Copy email address"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={refreshEmail}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                  aria-label="Get new email address"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  New Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg relative">
          <CardContent className="p-8">
            <div className="flex flex-col space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center">
                  <Inbox className="mr-2 h-6 w-6 text-gray-500 dark:text-gray-400" />
                  Inbox
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Your temporary email messages will appear here
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No messages yet</p>
              ) : (
                <ul className="space-y-4">
                  {messages.map((message) => (
                    <motion.li 
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`flex items-center space-x-4 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                        message.read ? 'bg-gray-50 dark:bg-gray-750' : 'bg-white dark:bg-gray-800 font-semibold'
                      }`}
                      onClick={() => openEmail(message)}
                    >
                      <Mail className={`h-6 w-6 flex-shrink-0 ${message.read ? 'text-gray-400' : 'text-blue-500'}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${message.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>{message.from}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{message.subject}</p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatShortDate(message.time)}</div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
          
          <AnimatePresence>
            {selectedEmail && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white dark:bg-gray-800 z-10 overflow-y-auto"
              >
                <div className="p-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedEmail(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Inbox
                  </Button>
                  <h2 className="text-2xl font-semibold mb-2">{selectedEmail.subject}</h2>
                  <p className="text-sm text-gray-500 mb-4">From: {selectedEmail.from}</p>
                  <div className="prose dark:prose-invert max-w-none">
                    {selectedEmail.body}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500 relative z-10">
        © 2023 TempEmail. All rights reserved. Emails auto-delete after 10 minutes.
      </footer>
    </div>
  )
}