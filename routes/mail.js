import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'g.subaash04072002@gmail.com',
        pass: 'zbnk lbrb tkmo snzx'
    }
});

export const mailOptions = {
    from: 'g.subaash04072002@gmail.com',
    to: 'g.subaash04072002@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};