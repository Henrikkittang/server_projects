
// Query DOM
const messageField = document.querySelector('#message_inp');
const messagesContainer = document.querySelector('.messagesContainer');
const broadcaster = document.querySelector('.broadcaster');
const messages_wrapper = document.querySelector('.messages_wrapper');
const activeUsersTag = document.querySelector('#activeUsers');
const user_container = document.querySelector('.user_container');
const fileSelector = document.querySelector('#fileSelector');
const room_btn = document.querySelector('#room_btn');
const room_inp = document.querySelector('#room_inp');
const room_btn_wrapper = document.querySelector('.room_btn_wrapper');
const new_user_inp = document.querySelector('#new_user_inp');
const new_user_btn = document.querySelector('#new_user_btn');
const chat_header = document.querySelector('#chat_header');
const room_members_wrapper = document.querySelector('#room_members_wrapper');

const username = sessionStorage.getItem('username');
const sessionKey = sessionStorage.getItem('sessionKey');
//sessionStorage.clear();

let current_room;

function timeConverter(timestamp){
    timestamp = Math.round(timestamp/1000);
    let a = new Date(timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
    return time;
}

function appendMessage(data) {
    const othersMessages = document.createElement('div');
    const myMessages = document.createElement('div');
    
    const usernameText = document.createElement('p');
    const mainMessage = document.createElement(data.type);
    const dateText = document.createElement('p');
        
    othersMessages.classList.add('othersMessages');
    myMessages.classList.add('myMessages');
    
    usernameText.textContent = data.username;
    usernameText.classList.add('mainMessage_username');
    
    if(data.type === 'p') mainMessage.textContent = data.message;    
    else if(data.type == 'img') mainMessage.src = data.message;
    else if (data.type == 'a') {mainMessage.href = data.message;  mainMessage.textContent = data.name; mainMessage.download = data.name;}       
    
    mainMessage.classList.add('mainMessage');
    
    dateText.textContent = timeConverter(data.timestamp);
    dateText.classList.add('mainMessage_date');
    
    if(data.username === username){
        myMessages.append(usernameText, mainMessage, dateText);
        messagesContainer.append(myMessages); 
    }else{
        othersMessages.append(usernameText, mainMessage, dateText);
        messagesContainer.append(othersMessages); 
    }
    
    broadcaster.textContent = '';
    messages_wrapper.scrollTop = messages_wrapper.scrollHeight;
}

const socket = io.connect('http://localhost:8000');
socket.on('connect', data =>{
    
    socket.emit('authentication',{
            username: username,
            sessionKey: sessionKey,
    });
        
    socket.on('unauthorized', err =>{
        console.log(err.message);
        window.location.replace('login.html');
    });
    
    socket.on('authenticated', data => {  
                
        // Emit events
        messageField.addEventListener('keypress', evt => {
            // keyCode 13 == enter
            if(evt.keyCode === 13){
                socket.emit('chat', {
                    message: messageField.value,
                    type: 'p',
                    room: current_room,
                    username: username,
                    sessionKey: sessionKey
                });
                messageField.value = '';
            }
            else{
                socket.emit('typing', {
                    username: username, 
                    sessionKey: sessionKey,
                    room:  current_room
                });
            }
        });
        
        fileSelector.addEventListener('change', e =>{
            // fires ones the files are loaded in
            const chosenFiles = e.target.files;
            for(let i = 0; i < chosenFiles.length; i++){
                const reader = new FileReader();  // one 'FileReader' object per file
                const fileName = chosenFiles[i].name;   // this is the reason the functions cant be seperated
                const type = (() => {if(chosenFiles[i].type.split('/')[0] === 'image') return 'img'; else return 'a'})();
                reader.readAsDataURL(chosenFiles[i]);   
                
                reader.onload = evt => {
                    // fires load event when reader.readAsDataURL recives file
                    socket.emit('chat', {
                        message: evt.target.result,
                        type: type,
                        room: current_room,
                        name: fileName,
                        username: username,
                        sessionKey: sessionKey
                    });
                }             
            }
        });
        
        room_btn.addEventListener('click', evt =>{
            chat_header
            socket.emit('newRoom', {
                username: username,
                sessionKey: sessionKey,
                roomName: room_inp.value,
                users: [username]
            });
            room_inp.value = '';
        });
        
        new_user_btn.addEventListener('click', evt =>{
            socket.emit('addToRoom', {
                username: username,
                sessionKey: sessionKey,
                roomID: current_room,
                newUser: new_user_inp.value
            });
        });
        
        // Listens for events
        socket.on('message', data => {
            appendMessage(data);
        });
        
        socket.on('typing', data => {
            broadcaster.textContent = data + ' is typing...';
            messages_wrapper.scrollTop = messages_wrapper.scrollHeight;
        });
        
        socket.on('activeUsers', data =>{
            user_container.textContent = '';
            let numConections = 0;
            for(let key in data){
                let p = document.createElement('p');
                p.textContent = data[key];
                user_container.append(p);   
                numConections += 1;
            }
            activeUsersTag.innerHTML = 'Active users: ' + numConections;
        });
        
        socket.on('subscribe', data =>{
            messagesContainer.innerHTML = '';
            console.log(data);
            for(const key of Object.keys(data.roomMessages)){
                appendMessage(data.roomMessages[key]);
            }
            room_members_wrapper.innerHTML = '';
            data.roomUsers.forEach((user, index) =>{
                const wrapper = document.createElement('div');
                const text = document.createElement('p');
                const removeBtn = document.createElement('button');
                text.textContent = user;
                removeBtn.value = user;
                removeBtn.textContent = "r";
                removeBtn.addEventListener('click', evt =>{
                    const key = evt.target.value;
                    socket.emit('removeUserFromRoom', {
                        room: current_room,
                        username: username,
                        sessionKey: sessionKey,
                        userToRemove: key 
                    });
                });
                wrapper.append(text, removeBtn);
                room_members_wrapper.append(wrapper);
            });
        });
        
        socket.on('newRoom', data =>{
            room_btn_wrapper.innerHTML = '';
            for(let i = 0; i < data.roomNames.length; i++){
                const newBtn = document.createElement('button');
                newBtn.textContent = data.roomNames[i];
                newBtn.value = data.roomIDs[i];
                newBtn.addEventListener('click', evt =>{
                    socket.emit('unsubscribe', current_room);
                    current_room = evt.target.value;
                    chat_header.textContent = evt.target.textContent;
                    socket.emit('subscribe', current_room);
                });
                room_btn_wrapper.append(newBtn);
                current_room = data.roomIDs[0];
                chat_header.textContent = data.roomNames[0];
                socket.emit('subscribe', current_room);
            }
        });
        
    });
});


/**/