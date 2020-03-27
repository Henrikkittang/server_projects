const beer_search_inp = document.querySelector('#beer_search_inp');
const beer_search_btn = document.querySelector('#beer_search_btn');
const beer_search_wrapper = document.querySelector('#beer_search_wrapper')
    
beer_search_btn.addEventListener('click', evt =>{
    const beer_name = beer_search_inp.value;   
    window.location.href = 'search.html?beer_search=' + beer_name;
});

beer_search_inp.addEventListener('keyup', evt =>{
    if(evt.keyCode === 13){
        beer_search_btn.click();
    }
});

