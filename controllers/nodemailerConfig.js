import nodemailer from 'nodemailer';

const config ={
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
}



const mailer = nodemailer.createTransport(config)

export default mailer;
// If you´re having troubles, check this : https://stackoverflow.com/questions/51217785/i-get-a-error-error-invalid-login-535-5-7-8-username-and-password-not-accep