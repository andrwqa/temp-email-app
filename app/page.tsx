"use client";

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Copy, Mail, ArrowLeft, Inbox } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

const TimeTicker = ({ value }: { value: number }) => {
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = value % 60

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <div className="flex justify-center items-center space-x-2">
      {[hours, minutes, seconds].map((time, index) => (
        <div key={index} className="flex flex-col items-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={time}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold tabular-nums"
            >
              {formatNumber(time)}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs text-gray-500">
            {index === 0 ? 'hours' : index === 1 ? 'minutes' : 'seconds'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Component() {
  const [email, setEmail] = useState("user123@tempemail.com")
  const [messages, setMessages] = useState([
    { id: 1, from: "service@example.com", subject: "Welcome to our service!", time: "10:30 AM", body: "Welcome to our service! We're excited to have you on board.", read: false },
    { id: 2, from: "noreply@website.com", subject: "Confirm your account", time: "11:45 AM", body: "Please confirm your account by clicking the link below.", read: false },
  ])
  const [timeLeft, setTimeLeft] = useState(3600) // 1 hour in seconds
  const [selectedEmail, setSelectedEmail] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const refreshEmail = () => {
    setEmail(`user${Math.floor(Math.random() * 1000)}@tempemail.com`)
    setMessages([])
    setTimeLeft(3600)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email)
    toast({
      title: "Email copied",
      description: "The email address has been copied to your clipboard.",
    })
  }

  const openEmail = (message: { id: number; from: string; subject: string; time: string; body: string; read: boolean }) => {
    setSelectedEmail(message)
    setMessages(messages.map(m => m.id === message.id ? {...m, read: true} : m))
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col p-4 font-sans">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">TempEmail</h1>
        <p className="text-gray-600">Disposable email for your temporary needs</p>
      </motion.header>

      <main className="flex-grow container mx-auto max-w-3xl">
        <Card className="mb-8 overflow-hidden bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-mono text-lg md:text-xl break-all max-w-xs md:max-w-md"
              >
                {email}
              </motion.div>
              <div className="flex space-x-2">
                <Button onClick={copyToClipboard} variant="outline" size="icon" aria-label="Copy email address">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={refreshEmail} variant="outline" size="icon" aria-label="Get new email address">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-600 mb-2">Time remaining:</p>
          <TimeTicker value={timeLeft} />
        </motion.div>

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
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Inbox className="mr-2 h-6 w-6 text-gray-500" />
                    Inbox
                  </h2>
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
                          className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 ${message.read ? 'bg-gray-100' : 'bg-white shadow-sm hover:shadow-md'}`}
                          onClick={() => openEmail(message)}
                        >
                          <Mail className={`h-6 w-6 flex-shrink-0 ${message.read ? 'text-gray-400' : 'text-gray-600'}`} aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${message.read ? 'text-gray-600' : 'text-gray-900'}`}>{message.from}</p>
                            <p className="text-sm text-gray-500 truncate">{message.subject}</p>
                          </div>
                          <div className="text-xs text-gray-500">{message.time}</div>
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
        © 2023 TempEmail. All rights reserved. Emails auto-delete after 1 hour.
      </footer>
    </div>
  )
}