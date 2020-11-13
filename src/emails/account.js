//npm i @sendgrid/mail
const sgMail = require('@sendgrid/mail')
//const sendgridAPIKey = ""

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/*sgMail.send({
    to: 'jgrimala@gmail.com',
    from: 'jgrimala@gmail.com',
    subject: 'This is my second creation!',
    text: 'I hope this second one gets to you.'
})*/

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jgrimala@gmail.com',
        subject: 'THanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jgrimala@gmail.com',
        subject: 'Cancellation of account!',
        text: `Goodbye ${name}! I hope to see you back!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}