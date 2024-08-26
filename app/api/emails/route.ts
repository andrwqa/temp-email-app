import { NextResponse } from 'next/server'
import { SMTPServer } from 'smtp-server'
import { simpleParser } from 'mailparser'
import { EventEmitter } from 'events'

interface Email {
  id: number;
  to: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
}

const emailEmitter = new EventEmitter()
let emails: Email[] = []

// Set up SMTP server
const smtpServer = new SMTPServer({
  authOptional: true,
  onData(stream, session, callback) {
    simpleParser(stream, {}, (err, parsed) => {
      if (err) {
        console.error(err)
      } else {
        const newEmail = {
          id: Date.now(),
          to: Array.isArray(parsed.to) ? parsed.to[0].text : parsed.to?.text || 'Unknown',
          from: Array.isArray(parsed.from) ? parsed.from[0].text : parsed.from?.text || 'Unknown',
          subject: parsed.subject || 'No Subject',
          body: parsed.text ?? '', // Use empty string as fallback
          time: new Date().toISOString(), // Store full ISO date string
          read: false
        }
        emails.push(newEmail)
        console.log('New email received:', newEmail)
        emailEmitter.emit('newEmail', newEmail)
      }
      callback()
    })
  }
})

smtpServer.listen(2525, () => {
  console.log('SMTP Server running on port 2525')
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
  }

  const userEmails = emails.filter(email => email.to === address)
  console.log('Fetched emails for', address, ':', userEmails)

  // Set up SSE
  if (searchParams.get('sse') === 'true') {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const newEmailListener = (email: Email) => {
          if (email.to === address) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(email)}\n\n`))
          }
        }
        emailEmitter.on('newEmail', newEmailListener)

        // Keep the connection alive
        const intervalId = setInterval(() => {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        }, 15000)

        // Clean up on close
        request.signal.addEventListener('abort', () => {
          emailEmitter.off('newEmail', newEmailListener)
          clearInterval(intervalId)
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  }

  return NextResponse.json(userEmails)
}

// This is a mock function to simulate receiving new emails
// In a real application, this would be triggered by your SMTP server
export async function POST(request: Request) {
  const email = await request.json()
  
  if (!email.to || !email.from || !email.subject || !email.body) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const newEmail = {
    id: Date.now(),
    ...email,
    time: new Date().toISOString(), // Use ISO string here as well
    read: false
  }

  emails.push(newEmail)
  emailEmitter.emit('newEmail', newEmail)

  return NextResponse.json(newEmail)
}