import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

interface Payload {
    sub: string
}
export function auth(req: Request, res: Response, next: NextFunction) {

    
    const authToken = req.headers.authorization

    if (!authToken) {
        
        return res.status(401).json({error: "Token ausente"})  
    }

    const [type, token] = authToken.split(" ")

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ message: "Token inválido" })
    }


    const secret = process.env.JWT_SECRET
    if (!secret) {
        return res.status(500).json({ message: "JWT_SECRET não configurado" })
    }

    try {
        const payload = jwt.verify(token, secret) as Payload

        req.userId = payload.sub
        return next()
        
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" })
    }
}