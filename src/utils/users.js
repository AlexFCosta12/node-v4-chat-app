const users = []

//addUser, removeUser, getUser, getUsersInRoom
 // id - id do socket
const addUser = ({ id, username, room}) => {
    //Clear the data
    //remove os espaço a frente e mete tudo em letras pequenas
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if (!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }
    
    // Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    //Validate username
    if (existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if (index !== -1) {
        //splice - primeiro argumento é o index a eliminar e o segundo é o numero de elementos a eliminar a apartir dai
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    //Procura até encontrar
    return users.find ((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    //Mete como é adicionado no array
    room = room.trim().toLowerCase()
    //Procura em todas as posições
    return users.filter((user) => user.room === room )
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}