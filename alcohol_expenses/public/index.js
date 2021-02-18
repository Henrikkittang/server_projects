const submit_btn = document.querySelector('#submit_btn');
const new_unit_btn = document.querySelector('#new_unit_btn');


submit_btn.addEventListener('click', async evt =>{   
    const name_inp = document.querySelectorAll('.name_inp');
    const cost_inp = document.querySelectorAll('.cost_inp');
    const percent_inp = document.querySelectorAll('.percent_inp');
    const amount_inp = document.querySelectorAll('.amount_inp');

    const day_inp = document.querySelector('#date_day');
    const month_inp = document.querySelector('#date_month');
    const year_inp = document.querySelector('#date_year');

   
    const dateString = year_inp.value.toString() + '-' + month_inp.value.toString() + '-' + day_inp.value.toString();
    console.log(dateString);

    let data = { [dateString]: [] };
    for(let i = 0; i < amount_inp.length; i++)
    {
        data[dateString].push({
            name:    name_inp[i].value,
            cost:    parseFloat(cost_inp[i].value),
            percent: parseFloat(percent_inp[i].value),
            amount:  parseFloat(amount_inp[i].value),
            date: dateString
        });
    } 

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)        
    };
    const response = await fetch('/submit', options);
    console.log(await response.json());

    get_stats();

}); 

function removeUnit(evt){
    const parentWrapper = evt.target.parentElement;
    const section = document.querySelector('#unit_section');
    section.removeChild(parentWrapper);
}

new_unit_btn.addEventListener('click', evt =>{
    const unit_section = document.querySelector('#unit_section');
    unit_section.innerHTML += 
        `<div class="unit_wrapper" value="0">   
            <label class="calc_unit_label">Unit:</label>
            <input type="text" class="name_inp" placeholder="Name">
            <input type="number" class="cost_inp" placeholder="Cost">
            <input type="number" class="percent_inp" placeholder="Percent">
            <input type="number" class="amount_inp" placeholder="Liter">
            <button class="remove_unit_btn" onclick="removeUnit(event)">Remove</button>
        </div>`;
});


function update_datesform(){
    const date = new Date();
    document.querySelector('#date_day').value = date.getDate();
    document.querySelector('#date_month').value = date.getMonth() + 1;
    document.querySelector('#date_year').value = date.getFullYear();

}

async function get_stats(){
    
    const response = await fetch('/stats');
    const data = await response.json();

    if(data.status === 'success'){
        const payload = data.payload;
        document.querySelector('#total_cost').textContent = 'Totalt brukt på alkohol: ' + payload.total_cost + ' kr';
        document.querySelector('#total_100p').textContent = 'Totalt konsumert målt i liter 100%VOL: ' + Math.round(payload.total_100p*100)/100;
        document.querySelector('#total_beers').textContent = 'Totalt konsumert målt i ølenheter: ' + Math.round(payload.total_beers*10)/10;
    }else{
        console.error(data.comment);
    }
}


window.onload = () => {
    update_datesform();
    get_stats()
}




