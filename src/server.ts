import express from "express"
import "dotenv/config"
import { authRoutes } from "./routes/auth.routes"

const app = express()
const port = Number(process.env.PORT) || 3000

app.use("/auth", authRoutes)

app.listen(port, () => {
  console.log("SERVIDOR ONLINE")
});
