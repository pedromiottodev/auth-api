import { Router } from "express"
import { z } from "zod"
import * as bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"

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
        if(err?.code === "P2002"){
            return res.status(409).json({message: "E-mail já cadastrado"})
        }

        return res.status(500).json({message: "Erro interno"})
    }
})