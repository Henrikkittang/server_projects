
const message_inp = document.querySelector('#message_inp');

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



const socket = io.connect({
    auth: { token: `Bearer ${localStorage.getItem('jwt')}` }
});

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
            });
        }        
    });

    socket.on('recive', data => {
        const messagesContainer = document.querySelector('.messagesContainer');
        messagesContainer.innerHTML = '';
        data.sort((a, b) => { return a.timestamp - b.timestamp })
        data.forEach(element => {
            appendMessage(element);
        });
    });

    socket.on('connect_error', (err) => {
        if(err.message === 'Token no longer valid'){
            
        }


        console.log(err instanceof Error); // true
        console.log(err.message); // not authorized
        console.log(err.data); // { content: "Please retry later" }        
        
        // redirect user to login page perhaps?
      });

});



