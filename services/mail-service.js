const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    const port = Number(process.env.SMTP_PORT || 587);
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationCode(to, code) {
    const info = await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Waynix: Email tasdiqlash kodi",
      text: `Tasdiqlash kodi: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Waynix email tasdiqlash</h2>
          <p>Ro'yxatdan o'tishni yakunlash uchun quyidagi kodni kiriting:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</div>
          <p>Kod 10 daqiqa davomida amal qiladi.</p>
        </div>
      `,
    });

    if (!info.accepted?.length) {
      throw new Error("Verification email was not accepted by SMTP provider");
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[mail] verification code for ${to}: ${code}`);
    }
  }

  async sendNewsEmail(to, subject, content) {
    const info = await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text: content,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>${subject}</h2>
          <p>${content}</p>
        </div>
      `,
    });

    if (!info.accepted?.length) {
      throw new Error("Newsletter email was not accepted by SMTP provider");
    }
  }
}

module.exports = new MailService();
