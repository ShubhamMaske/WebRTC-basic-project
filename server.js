import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const PORT = process.env.PORT | 4000
const server = createServer(app)
const io = new Server(server)


// handle socket connection
io.on("connection", (socket) => {
    console.log(`connected to socket server and socket id is ${socket.id}`)
})


app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
})