import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'


const app = express()
const PORT = process.env.PORT | 4000
const server = createServer(app)
const io = new Server(server)
const allUsers = {}


const __dirname = dirname(fileURLToPath(import.meta.url))

//handling the http request
app.get("/", (req, res) => {
    console.log('GET / request initiated')
    res.sendFile(join(__dirname + "/app/index.html"))
})

app.use(express.static("public"))


// handle socket connection
io.on("connection", (socket) => {
    console.log(`connected to socket server and socket id is ${socket.id}`)
    socket.on("join-user", username => {
        console.log(`${username} is join the socket connection`)
        allUsers[username] = { username, id: socket.id }

        // inform everyone
        io.emit("joined", allUsers)
    })

    socket.on("offer", ({from, to, offer}) => {
        console.log('got offer in backend', {from, to, offer})
        // sending the offer to remote user
        io.to(allUsers[to].id).emit("offer", {from, to, offer})
    })

    socket.on("answer", ({from, to, answer}) => {
        console.log('got answer in backend', {from, to, answer})
        // sending back the answer to user who started the call.
        io.to(allUsers[from].id).emit("answer", {from, to, answer})
    })

    socket.on("end-call", ({from, to}) => {
        io.to(allUsers[to].id).emit("end-call", {from, to})
    })

    socket.on("call-ended", caller => {
        const [from, to] = caller
        io.to(allUsers[from].id).emit("call-ended")
        io.to(allUsers[to].id).emit("call-ended")
    })

    socket.on("icecandidate", candidate => {
        console.log(candidate)

        // broadcast to other peers
        socket.broadcast.emit("icecandidate", candidate)
    })
})


server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
})