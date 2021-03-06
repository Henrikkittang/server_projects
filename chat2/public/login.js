
const btn_register = document.querySelector('#btn_register');
const btn_login = document.querySelector('#btn_login');

btn_register.addEventListener('click', async () =>{
    
    const newUser = {
        email: document.querySelector('#inp_reg_email').value,
        username: document.querySelector('#inp_reg_name').value,
        password: document.querySelector('#inp_reg_password').value,
        password_confirm: document.querySelector('#inp_reg_conf_password').value,
    }
    
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newUser)        
    };
    const response = await fetch('/register', options);
    const data = await response.json();

    document.querySelector('#inp_reg_email').value = '';    
    document.querySelector('#inp_reg_name').value = '';
    document.querySelector('#inp_reg_password').value = '';
    document.querySelector('#inp_reg_conf_password').value = '';
    
});

btn_login.addEventListener('click', async () => {
    
    const user = {
        email: document.querySelector('#inp_email').value,
        password: document.querySelector('#inp_password').value,
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)        
    };
    const response = await fetch('/login', options);
   
    if(response.redirected) 
        window.location.replace(response.url);
});

/**/