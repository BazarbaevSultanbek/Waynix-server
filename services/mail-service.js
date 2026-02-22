const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationCode(to, code) {
    await this.transporter.sendMail({
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
  }

  async sendNewsEmail(to, subject, content) {
    await this.transporter.sendMail({
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
  }
}

module.exports = new MailService();
