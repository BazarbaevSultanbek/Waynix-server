const nodemailer = require("nodemailer");

class MailService{

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }
    async sendMailActivation(to, link){
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Activation account in ${process.env.API_URL}`,
            text: "",
            html: `
                <div>
                    <h1>Tab to link for activate an account</h1>
                    <a href="http://${link}">${link}</a>
                </div>
            `
        })
    }
}

module.exports = new MailService();
