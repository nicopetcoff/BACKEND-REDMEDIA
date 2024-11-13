const nodemailer = require("nodemailer");

const mailSender = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "redmedia.app@gmail.com",
      pass: "vpog ryas jihx gaik"
    },
  });

  const mailOptions = {
    from: "redmedia.app@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html: `
      <div style="display: flex; align-items: center;">
        <h2 style="color: #333;">Red Media</h2>
      </div>
      <h2 style="color: #333;">${subject}</h2>
      <p>${text}</p>
      <p style="color: #888; font-size: 12px;">Este correo fue enviado desde Red Media APP.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { message: "Success!" };
  } catch (err) {
    console.error("Error en el envío:", err);
    throw new Error(`Error: ${err}`);
  }
};

module.exports = { mailSender };
