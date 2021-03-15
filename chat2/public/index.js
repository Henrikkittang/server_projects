
const message_inp = document.querySelector('#message_inp');
const new_user_btn = document.querySelector('#new_user_btn');

function appendMessage(data) {
    const messagesContainer = document.querySelector('.messagesContainer');    
    const messages_wrapper = document.querySelector('.messages_wrapper');
    const othersMessages = document.createElement('div');
    const myMessages = document.createElement('div');
    
    const usernameText = document.createElement('p');
    const mainMessage = document.createElement('p');
    const dateText = document.createElement('p');
        
    othersMessages.classList.add('othersMessages');
    myMessages.classList.add('myMessages');
    
    usernameText.textContent = data.username;
    usernameText.classList.add('mainMessage_username');
    
    mainMessage.textContent = data.message
   
    mainMessage.classList.add('mainMessage');
    
    dateText.textContent = new Date(data.timestamp).toLocaleString ("no-NO")
    dateText.classList.add('mainMessage_date');
    
    myMessages.append(usernameText, mainMessage, dateText);
    messagesContainer.append(myMessages); 
    
    messages_wrapper.scrollTop = messages_wrapper.scrollHeight;
}


const socket = io.connect();

socket.on('connect', data => {

    
    socket.on('disconnect', () => {
        console.log('disconnected');
    })

    message_inp.addEventListener('keypress', evt =>{
        // 13 == Enter
        if(evt.keyCode == 13)
        {
            console.log('sent');

            socket.emit('message', {
                message: message_inp.value,
                roomId: sessionStorage.getItem('currentRoomId')
            });
        }        
    });

    new_user_btn.addEventListener('click', () => {
        const new_user_inp = document.querySelector('#new_user_inp');
        socket.emit('addUserToRoom', {
            email: new_user_inp.value, 
            roomId: sessionStorage.getItem('currentRoomId')
        });
    });

    room_btn.addEventListener('click', () => {
        const room_inp = document.querySelector('#room_inp');
        socket.emit('newRoom', {roomName: room_inp.value});
    });

    socket.on('roomsUpdate', data => {
        // Graps the wrapper and resets it
        const room_btn_wrapper = document.querySelector('#room_btn_wrapper');
        room_btn_wrapper.innerHTML = '';

        data.forEach(room => {

            // Creates new button and sets its name and value with the room data
            const newBtn = document.createElement('button');
            newBtn.textContent = room.name;
            newBtn.value = room._id;

            // Click event to change current room
            newBtn.addEventListener('click', evt =>{
                sessionStorage.setItem('currentRoomId', evt.target.value);
                document.querySelector('#chat_header').textContent = evt.target.textContent;
                socket.emit('getRoomMessages', {roomId: evt.target.value});
            });

            room_btn_wrapper.append(newBtn);
        });

        // Selects the first room as the default room
        room_btn_wrapper.childNodes[0].click();
    });

    socket.on('reciveMessages', data => {
        if(data.roomId != sessionStorage.getItem('currentRoomId')) return;

        const messagesContainer = document.querySelector('.messagesContainer');
        messagesContainer.innerHTML = '';

        data.messages.sort((a, b) => { return a.timestamp - b.timestamp })
        data.messages.forEach(element => {
            appendMessage(element);
        });
    });

    socket.on('connect_error', (err) => {
        console.log(err.message); // not authorized
        
        // window.location.replace('/login'); ???

        // redirect user to login page perhaps?
      });

});




