import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string, subject: string = 'Password Reset Request') => {
  // If host is smtp.gmail.com, use service: 'gmail' for best compatibility with Google App Passwords
  const isGmail = config.email_host?.includes('gmail');

  const transportOptions: any = isGmail
    ? {
        service: 'gmail',
        auth: {
          user: config.email_user,
          pass: config.email_pass?.replace(/\s+/g, ''),
        },
      }
    : {
        host: config.email_host,
        port: config.email_port,
        secure: config.email_port === 465,
        auth: {
          user: config.email_user,
          pass: config.email_pass,
        },
      };

  const transporter = nodemailer.createTransport(transportOptions);

  const info = await transporter.sendMail({
    from: config.email_from,
    to,
    subject,
    text: 'Please reset your password using the link provided in the email.',
    html,
  });

  return info;
};
