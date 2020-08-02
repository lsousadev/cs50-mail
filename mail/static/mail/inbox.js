document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // Send email on form submit
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#emails-view').className = `${mailbox}`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const new_email = document.createElement('div');
      if (email.read === true) {
        new_email.className = 'container row emails-read border rounded';
      } else {
        new_email.className = 'container row emails-unread border rounded';
      }
      new_email.id = `${email.id}`;
      new_email.addEventListener('click', () => load_email(email.id));

      const sender = document.createElement('div');
      sender.innerHTML = `<strong>${email.sender}`;
      sender.className = 'col-3';
      const subject = document.createElement('div');
      subject.innerHTML = `${email.subject}`;
      subject.className = 'col-6';
      const timestamp = document.createElement('div');
      timestamp.innerHTML = `${email.timestamp}`;
      timestamp.className = 'col-3';

      new_email.append(sender);
      new_email.append(subject);
      new_email.append(timestamp);
      document.querySelector('#emails-view').append(new_email);
      });
    })
}

function load_email(email_id) {

  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#email-view').innerHTML = '';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const show_email = document.createElement('div');
    show_email.className = 'email';
    
    const sender = document.createElement('div');
    sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
    const recipients = document.createElement('div');
    let recips = "<strong>To:</strong> ";
    email.recipients.forEach(recipient => {
      recips += `${recipient}, `;
    })
    recipients.innerHTML = recips.substring(0, recips.length - 2);
    const subject = document.createElement('div');
    subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
    subject.id = 'IDID'
    const timestamp = document.createElement('div')
    timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
    const reply = document.createElement('button');
    reply.className = 'btn btn-sm btn-outline-primary';
    reply.innerHTML = 'Reply';
    reply.addEventListener('click', () => reply_email(email.sender, email.subject, email.body, email.timestamp))
    const archive = document.createElement('button');
    archive.className = 'btn btn-sm btn-outline-primary ml-1';
    if (email.archived === false) {
      archive.innerHTML = 'Archive';
      archive.addEventListener('click', () => archive_email(email.id));
    } else {
      archive.innerHTML = 'Unarchive';
      archive.addEventListener('click', () => unarchive_email(email.id));
    }
    const body = document.createElement('div');
    body.innerHTML = `${email.body}`;

    show_email.append(sender);
    show_email.append(recipients);
    show_email.append(subject);
    show_email.append(timestamp);
    show_email.append(reply);
    show_email.append(archive);
    show_email.append(document.createElement('hr'));
    show_email.append(body);

    document.querySelector('#email-view').append(show_email);
  })
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  .then(response => console.log(`Email 'READ' request: ${response.status}`))
}

function send_email() {
  event.preventDefault();
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => console.log(`Email 'SEND' request - ${response.status}`))
  load_mailbox('sent');
}

function archive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(response => console.log(`Email 'ARCHIVE' request - ${response.status}`))
  setTimeout(function() { load_mailbox('inbox'); }, 1000);
}

function unarchive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then(response => console.log(`Email 'UNARCHIVE' request - ${response.status}`))
  setTimeout(function() { load_mailbox('inbox'); }, 1000);
}

function reply_email(recipient, subject, body, timestamp) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${recipient}`;
  if (subject.substring(0,2) != 'RE') {
    document.querySelector('#compose-subject').value = `RE: ${subject}`;
  } else {
    document.querySelector('#compose-subject').value = `${subject}`;
  }
  document.querySelector('#compose-body').value = `On ${timestamp} ${recipient} wrote:
${body}
------------
`;
}
