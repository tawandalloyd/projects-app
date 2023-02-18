const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor (user, url){
        this.to = user.email;
        this.name = user.name.split(' ')[0];
        this.url = url;
        this.from = `Tawanda Charuka <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){
        if (process.env.NODE_ENV === 'production') {
            
            return 1;
        }

        return  nodemailer.createTransport({
            host : process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

    }
     async send(template,subject){
       //render html based on pug template
       const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
       {
         name : this.name,
         url: this.url,
         subject
       });

        const mailOptions = {
            from: this.from,
            to : this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        };

        
        await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome(){
       await this.send('welcome','Welcome to the property app');
    }

    async sendResetPassword(){
        await this.send('passwordReset', 'your password token is only valid for 10 mins');
    }
};
   
