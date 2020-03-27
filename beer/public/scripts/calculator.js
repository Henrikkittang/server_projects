const calculate_btn = document.querySelector('#calculate_btn');
const new_unit_btn = document.querySelector('#new_unit_btn');
const calc_result_p = document.querySelector('#calc_result_p');

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

function removeUnit(evt){
    const parentWrapper = evt.target.parentElement;
    const section = document.querySelector('#unit_section');
    section.removeChild(parentWrapper);
}

new_unit_btn.addEventListener('click', evt =>{
    const unit_section = document.querySelector('#unit_section');
    unit_section.innerHTML += 
    `<div class="unit_wrapper">
        <label class="calc_unit_label">Unit:</label>
        <input type="number" class="amount_inp" placeholder="How much in liter?">
        <input type="number" class="percent_inp" placeholder="How many percent?">
        <button class="remove_unit_btn" onclick="removeUnit(event)">Remove</button>
    </div>`;
});





