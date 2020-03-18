
const btn_register = document.querySelector('#btn_register');
const btn_login = document.querySelector('#btn_login');


btn_register.addEventListener('click', async () =>{
    
    const newUser = {
        username: document.querySelector('#inp_reg_name').value,
        password_1: document.querySelector('#inp_reg_password').value,
        password_2: document.querySelector('#inp_reg_conf_password').value,
    }
    
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newUser)        
    };
    const db_response = await fetch('/register', options);
    const db_json = await db_response.json();
    
    alert(db_json.details);
    document.querySelector('#inp_reg_name').value = '';
    document.querySelector('#inp_reg_password').value = '';
    document.querySelector('#inp_reg_conf_password').value = '';
    
});

    
btn_login.addEventListener('click', async () => {
    
    const user = {
        username: document.querySelector('#inp_username').value,
        password: document.querySelector('#inp_password').value,
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)        
    };
    const db_response = await fetch('/login', options);
    const db_json = await db_response.json();
    
    console.log(db_json);
    
    if(db_json.status === 'success'){
        sessionStorage.setItem('username', db_json.username);
        sessionStorage.setItem('sessionKey', db_json.sessionKey);
        
        window.location.replace('index.html');
    }
});

/**/