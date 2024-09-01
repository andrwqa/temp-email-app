const SMTPServer = require('smtp-server').SMTPServer;
const axios = require('axios');
const { simpleParser } = require('mailparser');

const server = new SMTPServer({
  onData(stream, session, callback) {
    simpleParser(stream, {}, async (err, parsed) => {
      if (err) {
        console.error('Error parsing email:', err);
        return callback(err);
      }

      const { from, to, subject, text: body, date: time } = parsed;
      const id = parsed.messageId;

      try {
        await axios.post('https://temp-email-app.vercel.app/api/emails', {
          id,
          from: from.text,
          to: to.text,
          subject,
          body,
          time: time.toISOString(),
        });
        console.log('Email forwarded to API endpoint');
        callback(null, 'Message accepted');
      } catch (error) {
        console.error('Error forwarding email to API endpoint:', error);
        callback(error);
      }
    });
  },
  onAuth(auth, session, callback) {
    callback(null, { user: 'user' });
  },
});

server.listen(2525, () => {
  console.log('SMTP Server running on port 2525');
});