import nodemailer from 'nodemailer'

const fromAddress = process.env.EMAIL_FROM || 'no-reply@econoky.com'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`

  const html = `
    <h1>Activa tu cuenta en Econoky</h1>
    <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para activar tu cuenta:</p>
    <p><a href="${verifyUrl}" target="_blank" rel="noopener noreferrer">${verifyUrl}</a></p>
    <p>Si no has creado esta cuenta, puedes ignorar este correo.</p>
  `

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Activa tu cuenta en Econoky',
    html,
  })
}


