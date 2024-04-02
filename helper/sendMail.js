const nodemailer = require("nodemailer");
const config = require('../configs/config')

const transporter = nodemailer.createTransport({
    host: config.Host,
    port: config.Port,
    secure: false,
    auth: {
        user: config.Username,
        pass: config.Password,
    },
});

module.exports = async function(message, email) {
    const info = await transporter.sendMail({
        from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
        to: email, 
        subject: "Hello ✔",
        text: message, 
    });

    console.log("Message sent: %s", info.messageId);
}