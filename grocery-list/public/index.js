

const name_inp = document.querySelector('#name_inp');
const amount_inp = document.querySelector('#amount_inp');
const price_inp = document.querySelector('#price_inp');
const grocery_btn = document.querySelector('#grocery_btn');

const total_price_tag = document.querySelector('#total_price');
const grocery_list = document.querySelector('.grocery_list');

grocery_btn.addEventListener('click', async evt =>{    
    const data = {
        name: name_inp.value, 
        amount: Number(amount_inp.value),
        price: Number(price_inp.value)
    };
    
    name_inp.value = '';
    amount_inp.value = '';
    price_inp.value = '';
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)        
    };
    const response = await fetch('/addGrocery', options);
    displayGroceries();
});

async function displayGroceries() {
    const response = await fetch('/getGroceries');
    const groceries = await response.json();
    grocery_list.textContent = '';
    total_price_tag.textContent = 'Total: ';
    let total_price = 0;
    for(let key in groceries){
        const obj = groceries[key];
        const wrapper = document.createElement('div');
        const name = document.createElement('h1');
        const amount = document.createElement('p');
        const price = document.createElement('p');
        const removeBtn = document.createElement('button');
        
        name.textContent = obj.name
        amount.textContent = obj.amount + ' stk';
        price.textContent = obj.price + ' kr';
        
        removeBtn.textContent = 'Remove'; 
        removeBtn.value = key;
        removeBtn.addEventListener('click', async evt => {
            await fetch(`/removeGrocery/${key}`);
            displayGroceries();
        });
        
        wrapper.append(name, amount, removeBtn, price);
        grocery_list.append(wrapper);
        
        total_price += obj.amount * obj.price;
    }
    total_price_tag.textContent += total_price + ' kr';
}


window.onload = function() {
    displayGroceries();
}
