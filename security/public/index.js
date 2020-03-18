
const login_btn = document.querySelector('#login_btn');
const register_btn = document.querySelector('#register_btn');



register_btn.addEventListener('click', async evt =>{
    evt.preventDefault();
    
    const username = document.querySelector('#username_reg_inp').value;
    const password = document.querySelector('#password_reg_inp').value;
    document.querySelector('#username_reg_inp').value = '';
    document.querySelector('#password_reg_inp').value = '';
        
    const data = {username, password};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)        
    };
    
    const response = await fetch('/register', options);
    const status = await response.json();
    console.log(status);
});


login_btn.addEventListener('click', async evt =>{
    evt.preventDefault();
    
    const username = document.querySelector('#username_inp').value;
    const password = document.querySelector('#password_inp').value;
    
    const ipData = await fetch('http://ip-api.com/json');
    const ipJson = await ipData.json();
    const ipAdress = ipJson.query;
    
    const data = {username, password, ipAdress};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)        
    };
    
    const response = await fetch('/login', options);
    const status = await response.json();
    console.log(status);
});