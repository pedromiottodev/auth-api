import express from "express"
import "dotenv/config"

const app = express()
const port = Number(process.env.PORT) || 3000


app.listen(port, () => {
  console.log("SERVIDOR ONLINE")
});
