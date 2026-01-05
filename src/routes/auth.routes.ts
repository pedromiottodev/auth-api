import {Router} from "express"

export const authRoutes = Router()

authRoutes.post("/register", (_req, res) => {
  res.json({ ok: true })
})
