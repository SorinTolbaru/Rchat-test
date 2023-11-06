const express = require("express")
const path = require("path")
const socket = require("socket.io")
const mongoose = require("mongoose")
const Chat = require("./chat.js")

let userList = []

const app = express()

const mongoURL =
  "mongodb+srv://tolbarusorin:qwerty123@chatx.orqrk1y.mongodb.net/chat-logs"
mongoose.connect(mongoURL).then((r) => {
  const server = app.listen(3000, () => {
    console.log("server running at http://localhost:3000")
  })

  const io = socket(server, {
    cors: {
      origin: "*",
      credential: true,
    },
  })

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
  })

  app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "chat.html"))
  })

  io.on("connection", (socket) => {
    io.emit("updatelist", userList)

    socket.on("chat message", (msg, id) => {
      if (!id) {
        if (msg.includes("/pm ")) {
          msg = splitMessage(msg, socket.username)
          io.emit(
            "chat message",
            msg,
            null,
            "color:white;background:grey",
            socket.username,
            u
          )
        } else {
          const messageElement = new Chat({
            username: socket.username,
            message: msg,
          })
          messageElement.save()
          Chat.find({}).then((e) => {})
          msg = `${socket.username}: ${msg}`
          io.emit("chat message", msg)
        }
      } else {
        io.emit("chat message", msg, socket.username)
      }
    })

    socket.on("delete message", () => {
      io.emit("delete message", socket.username)
    })

    socket.on("enter", async (username) => {
      socket.username = username
      userList.push(socket.username)

      io.emit("enter", username)
      console.log(`${username} connected`)
      console.log(userList)
      io.emit("updatelist", userList)
    })

    socket.on("disconnect", () => {
      let user = socket.username
      if (user) {
        io.emit("disconnect2", user)
        userList = userList.filter((e) => e !== user)
        console.log(`${socket.username} disconnected`)
        console.log(userList)
        io.emit("updatelist", userList)
      }
    })
  })

  let u
  function splitMessage(msg, su) {
    let c = msg.slice(0, msg.indexOf(" "))
    let um = msg.slice(c.length + 1, msg.length)
    u = um.slice(0, um.indexOf(" "))
    let m = um.slice(um.indexOf(" "))
    let M = `${su} > ${u}:${m}`
    if (u.length == 0 || um.includes(" ") == false) {
      M = `Invalid pm`
    }

    return M
  }
})
