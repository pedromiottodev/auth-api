import nodemailer from "nodemailer"

const host = process.env.MAIL_HOST
const port = Number(process.env.MAIL_PORT)
const user = process.env.MAIL_USER
const pass = process.env.MAIL_PASS

if (!host || !port || !user || !pass) {
  throw new Error("Config de e-mail incompleta no .env")
}

export const mailer = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass }
})
