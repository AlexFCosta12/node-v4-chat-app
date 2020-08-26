const path = require ('path')
const http = require ('http')
const express = require ('express')
const socketio = require ('socket.io')
const Filter = require ('bad-words')
const { generateMessage, generateLocationMessage } = require ('./utils/message')
const { addUser,
    removeUser,
    getUser,
    getUsersInRoom} = require ('./utils/users') 

const app = express ()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
// Define a pasta Publica, ou seja, todas as pessoas que se ligam vão ter acesso ao que está nesta pasta -- html css etc
const publicDirectoryPath = path.join (__dirname, '../public')

app.use (express.static(publicDirectoryPath))

//let count = 0

// on - Primeiro argumento nome do event que ocorre
io.on ('connection', (socket) => {
    console.log ('New WebSokcet Connection')

    // O callback chama a função que está definida no chat quando é feito o join o ultimo parametro
    socket.on('join', (options,callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) {
           return callback (error)
        }
        //Entrar numa room
        socket.join(user.room)

        socket.emit("message", generateMessage('Admin','Welcome!'))
        //Envia a mensagem para todos menos para o que entrou
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has Joined!`))
        //Depois envia para todos o nome da room e os users presentes
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

        //socket.emit, io.emit, socket.broadcast.emit
        // Para room ver na linha a baixo
        // io.to.emit, socket.broadcast.to.emit
    })

    socket.on ('sendMessage', (message, callback) => {  // (message, callback) - callback é para madarmos a informação que recebemos a messagem
        const user = getUser(socket.id)
        const filter = new Filter ()

        if (filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit ('message', generateMessage( user.username, message))
        callback()
    })

    socket.on ('disconnect', () => {
        const user = removeUser(socket.id)

        if (user){
            io.to(user.room).emit ('message', generateMessage('Admin',`${user.username} has left !`))
            //Depois envia para todos o nome da room e os users presentes
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom (user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit ('locationMessage', generateLocationMessage(user.username ,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
   // socket.emit('countUpdated', count )

    //socket.on('increment', () => {
      //  count ++
        //socket.emit('countUpdated', count) -- Só emit para a connexão em questão
        // A linha a baixo emit para todas as conexões
        //io.emit('countUpdated', count)
    //})
})

//Inicia o Server
server.listen (port, () => {
    console.log ('Server is up on Port '+port+'.');
})