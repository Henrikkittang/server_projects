const calculate_btn = document.querySelector('#calculate_btn');
const new_unit_btn = document.querySelector('#new_unit_btn');
const calc_result_p = document.querySelector('#calc_result_p');
let remove_unit_btns = document.querySelectorAll('.remove_unit_btn');

calculate_btn.addEventListener('click', evt =>{   
    const amount_inp = document.querySelectorAll('.amount_inp');
    const percent_inp = document.querySelectorAll('.percent_inp');
    let total_amount = 0;

    for(let i = 0; i < amount_inp.length; i++){
        total_amount += amount_inp[i].value * (percent_inp[i].value / 100);
    }
    const beer_unit = 0.5 * 0.047;  // half a liter times 4,7%
    const total_beers =  (total_amount / beer_unit).toFixed(2);
    calc_result_p.textContent = 'You have drunken ' + total_beers + ' units worth of beer';
}); 


function keepValues(func){
    let amount_inp = document.querySelectorAll('.amount_inp');
    let percent_inp = document.querySelectorAll('.percent_inp');
    const content = {}

    for(let i = 0; i < amount_inp.length; i++){
        content[i] = [amount_inp[i].value, percent_inp[i].value];
    }    

    func(amount_inp.length);

    amount_inp = document.querySelectorAll('.amount_inp');
    percent_inp = document.querySelectorAll('.percent_inp');
    for(let idx in content){
        amount_inp[idx].value = parseFloat(content[idx][0]);
        percent_inp[idx].value = content[idx][1];
    }  
}


function removeUnit(value){
    const unit_wrappers = document.querySelectorAll('.unit_wrapper');    
    const section = document.querySelector('#unit_section');

    unit_wrappers.forEach((wrapper, idx) =>{
        if(wrapper.value != value){
            section.removeChild(wrapper);
            return;
        }
    });

   
}

new_unit_btn.addEventListener('click', evt =>{
    keepValues(value =>{    
        const unit_section = document.querySelector('#unit_section');
        unit_section.innerHTML += 
        `<div class="unit_wrapper" value="${value}">
            <label class="calc_unit_label">Unit:</label>
            <input type="number" class="amount_inp" placeholder="How much in liter?">
            <input type="number" class="percent_inp" placeholder="How many percent?">
            <button class="remove_unit_btn" value="${value}" onclick="removeUnit(${value})">Remove</button>
        </div>`;
    });
});





