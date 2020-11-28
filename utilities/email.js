const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

exports.email = async (options) => {
  try {
    const transporter = nodemailer.createTransport(
      smtpTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASSWORD,
        },
      })
    );
    const mailOption = {
      from: process.env.USER_EMAIL,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    await transporter.sendMail(mailOption);
  } catch (e) {
    console.log("Error in Email Sending");
  }
};
