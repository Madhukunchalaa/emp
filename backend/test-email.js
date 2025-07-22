const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'madhu@smartsolutionsdigi.com',
    pass: 'pesw gfjm hnem wsex',
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('Transporter verification error:', error);
  } else {
    console.log('Email transporter is ready');
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(to, otp, name) {
  const mailOptions = {
    from: `"Smart Solutions" <madhkunchala@gmail.com>`, // ✅ hardcoded to match auth
    to:"madhkunchala@gmail.com",
    subject: 'Your OTP Code',
    html: `<p>Hello <strong>${name}</strong>,</p><p>Your OTP is <b>${otp}</b>.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    return false;
  }
}
generateOTP()
sendOTPEmail()


