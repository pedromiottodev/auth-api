import { Router } from "express"
import { z } from "zod"
import * as bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import jwt from "jsonwebtoken"
import { auth } from "../middlewares/auth"
import { type SignOptions } from "jsonwebtoken"


export const authRoutes = Router()

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

authRoutes.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: parsed.error.flatten()
        })
    }

    const { email, password } = parsed.data
    const passwordHash = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: passwordHash
            },
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        })

        return res.status(201).json(user)
    }
    catch (err: any) {
        if (err?.code === "P2002") {
            return res.status(409).json({ message: "E-mail já cadastrado" })
        }

        return res.status(500).json({ message: "Erro interno" })
    }
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

authRoutes.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: parsed.error.flatten()
        })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" })
    }

    const passwordOk = await bcrypt.compare(password, user.password)

    if (!passwordOk) {
        return res.status(401).json({ message: "Credenciais inválidas" })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
        return res.status(500).json({ message: "JWT_SECRET não configurado" })
    }

    const token = jwt.sign(
        { sub: user.id },
        secret,
        {expiresIn: "1d"} 
  )

    return res.json({ token })
})

authRoutes.get("/me", auth, async (req, res) => {
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ message: "Não autenticado" })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true, updatedAt: true }
  })

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" })
  }

  return res.json(user)
})

authRoutes.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: parsed.error.flatten()
    })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas" })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return res.status(401).json({ message: "Credenciais inválidas" })
  }

  const secret = process.env.JWT_SECRET

  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET não configurado" })
  }

  const token = jwt.sign(
    { sub: user.id },
    secret,
    { expiresIn: "1d" }
  )

  return res.json({ token })
})

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

authRoutes.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: parsed.error.flatten()
    })
  }

  const { email } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    // não revela se o email existe
    return res.json({ message: "Se o email existir, um código foi gerado" })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

  await prisma.passwordReset.create({
    data: {
      code,
      expiresAt,
      userId: user.id
    }
  })

  // modo dev: retorna o código
  return res.json({
    message: "Código gerado",
    code
  })
})

const resetPasswordSchema = z.object({
  code: z.string().length(6),
  newPassword: z.string().min(6)
})

authRoutes.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: parsed.error.flatten()
    })
  }

  const { code, newPassword } = parsed.data

  const reset = await prisma.passwordReset.findFirst({
    where: {
      code,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!reset) {
    return res.status(400).json({ message: "Código inválido ou expirado" })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: reset.userId },
    data: { password: passwordHash }
  })

  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { used: true }
  })

  return res.json({ message: "Senha atualizada com sucesso" })
})
