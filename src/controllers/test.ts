
require('dotenv').config()

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'ani.p1995@gmail.com', // Change to your recipient
  from: 'mahatracker2021@gmail.com', // Change to your verified sender
  subject: 'Maha Referral Program',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
  })
  .catch((error) => {
  })
