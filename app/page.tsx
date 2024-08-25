"use client";

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Copy, Mail, ArrowLeft, Inbox, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { format, parseISO } from 'date-fns'

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
  const [email, setEmail] = useState<string | null>(null)
  const [messages, setMessages] = useState([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Initialize email and timeLeft on the client side
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
    if (!email) return

    const fetchEmails = async () => {
      try {
        const response = await fetch(`/api/emails?address=${email}`)
        if (response.ok) {
          const newEmails = await response.json()
          console.log('Fetched emails:', newEmails)
          // Apply read state from localStorage
          const readEmails = JSON.parse(localStorage.getItem('readEmails') || '{}')
          const updatedEmails = newEmails.map(email => ({
            ...email,
            read: readEmails[email.id] || false
          }))
          setMessages(updatedEmails)
        }
      } catch (error) {
        console.error("Failed to fetch emails:", error)
      }
    }

    fetchEmails()

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
    setSelectedEmail(message)
    // Mark email as read
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === message.id ? { ...msg, read: true } : msg
      )
    )
    // Save read state to localStorage
    const readEmails = JSON.parse(localStorage.getItem('readEmails') || '{}')
    readEmails[message.id] = true
    localStorage.setItem('readEmails', JSON.stringify(readEmails))
  }

  const formatDate = (isoString: string) => {
    const date = parseISO(isoString)
    return format(date, 'PPpp') // This will format the date as "Aug 25, 2024, 5:02 PM"
  }

  const formatShortDate = (isoString: string) => {
    const date = parseISO(isoString)
    return format(date, 'p') // This will format the date as "5:02 PM"
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col p-4">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold">TempEmail</h1>
        <p className="text-gray-600">Disposable email for your temporary needs</p>
      </motion.header>

      <main className="flex-grow container mx-auto max-w-3xl">
        <Card className="mb-8 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="col-span-2">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="font-mono text-xl md:text-2xl break-all"
                >
                  {email || 'Loading...'}
                </motion.div>
              </div>
              <div className="flex space-x-2 justify-end">
                <Button onClick={copyToClipboard} variant="secondary" size="icon" aria-label="Copy email address">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={refreshEmail} variant="secondary" size="icon" aria-label="Get new email address">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-8">
          <p className="text-gray-600 mb-2">Time remaining:</p>
          {timeLeft !== null && <TimeTicker value={timeLeft} />}
        </div>

        <AnimatePresence mode="wait">
          {selectedEmail ? (
            <motion.div
              key="email-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
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
                  <p className="text-gray-700">{selectedEmail.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="email-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Inbox</h2>
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet</p>
                  ) : (
                    <ul className="space-y-4">
                      {messages.map((message) => (
                        <motion.li 
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                          onClick={() => openEmail(message)}
                        >
                          <Mail className="h-6 w-6 text-gray-400 flex-shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.from}</p>
                            <p className="text-sm text-gray-500 truncate">{message.subject}</p>
                          </div>
                          <div className="text-sm text-gray-500">{formatShortDate(message.time)}</div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        © 2023 TempEmail. All rights reserved. Emails auto-delete after 10 minutes.
      </footer>
    </div>
  )
}