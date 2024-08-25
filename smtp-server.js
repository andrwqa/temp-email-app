const SMTPServer = require('smtp-server').SMTPServer;
const simpleParser = require('mailparser').simpleParser;
const fetch = require('node-fetch');

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  onData(stream, session, callback) {
    simpleParser(stream, {}, (err, parsed) => {
      if (err) {
        console.error(err);
      } else {
        const email = {
          to: parsed.to.text,
          from: parsed.from.text,
          subject: parsed.subject,
          body: parsed.text
        };
        
        fetch('http://localhost:3000/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(email)
        }).then(() => console.log('Email sent to API')).catch(console.error);
      }
      callback();
    });
  }
});

server.listen(2525, () => {
  console.log('SMTP Server running on port 2525');
});