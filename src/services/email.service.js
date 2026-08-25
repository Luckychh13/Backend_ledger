require('dotenv').config();
// console.log({
//   user: process.env.EMAIL_USER,
//   clientId: process.env.CLIENT_ID,
//   clientSecret: process.env.CLIENT_SECRET,
//   refreshToken: process.env.REFRESH_TOKEN,
// });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail,name,code){
    const subject = "Welcome to Backend Ledger"
 
    const text = `Hello ${name},\n\nThank you for registering with Backend Ledger.
    We're excited to have you on board!\n\nYour verification code is: ${code}
    \nThis code expires in 15 minutes.\n\nBest regards,\nThe Backend Ledger Team`;
 
    const html = `<p>Hello ${name},</p><p>Thank you for registering with Backend Ledger.
    We're excited to have you on board!</p><p>Your verification code is: <b>${code}</b></p>
    <p>This code expires in 15 minutes.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
 
    await sendEmail(userEmail, subject, text, html);
 
 
}

async function sendTransactionEmail(userEmail, name, amount, toAccount){
    const subject = "Transaction Successfull";
    const text = `Hello ${name},\n\nYou have a new transaction:\nAmount: ${amount}\nTo Account: ${toAccount}\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>You have a new transaction:</p><p>Amount: ${amount}</p><p>To Account: ${toAccount}</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount){
  const subject = "Transaction failed";
  const text = `Hello ${name},\n\nYour transaction has failed:\nAmount: ${amount}\nTo Account: ${toAccount}\n\nPlease check your account and try again.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Your transaction has failed:</p><p>Amount: ${amount}</p><p>To Account: ${toAccount}</p><p>Please check your account and try again.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
  await sendEmail(userEmail, subject, text, html);
}


module.exports = {
    sendEmail,
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};