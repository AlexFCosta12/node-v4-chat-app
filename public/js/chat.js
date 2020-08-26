const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Option
// o Qs foi importado no HTML
// location.search são os parametros que estão no URL
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//autoScroll
const autoscroll = () => {
    // New message element
    const $newMeesage = $messages.lastElementChild

    // Height of the new message
    const newMessageStlyes = getComputedStyle($newMeesage) // Vai buscar o style deste component
    const newMessageMargin = parseInt(newMessageStlyes.marginBottom)
    const newMessageHeight = $newMeesage.offsetHeight + newMessageMargin

    //Visible Heigth
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffeset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffeset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Message passou a ser Object criado no index, com message e date
socket.on ('message', (message) => {
    console.log (message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        // O libraria do moment está a ser chamado no html
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on ('locationMessage', (message) => {
    console.log (message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    //para não fazer o refresh
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    //Disable
    //target representa tudo o que está dentro do message-form
    const message = e.target.elements.message.value
    
    //socket.emit ('sendMessage',message) -- Não confirmamos a recção por parte do servidor
    socket.emit('sendMessage', message, (error) => { // só esxecuta a função quando é chamado o callback do lado do servidor
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error){
            return console.log (error)
        }
        console.log ('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation){
        return alert ('Geolocation is not supported by your browser')
    }
    //Disable Button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const Myposition ={
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', Myposition, () => {
            console.log('Location Shared!')
            // Enable Button
            $sendLocationButton.removeAttribute('disabled')
        })
    })

})

socket.emit('join', {username, room}, (error) => {
    //redireciona para a pagina inicial
    if (error) {
        alert (error)
        location.href = '/'
    }
})

/*socket.on ('countUpdated', (count) => {
    console.log ('The Count has been updated!', count )
})

document.querySelector('#increment').addEventListener('click', ()=> {
    console.log ('Clicked')
    socket.emit ('increment')
})*/