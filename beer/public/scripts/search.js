

window.onload = function(){
    const url_string = window.location.href;
    const url = new URL(url_string);
    const beer_search = url.searchParams.get('beer_search');
    
    findBeer(beer_search);
    
}

// -----------------------------------------------------------------------------
 

function moreBeerInfo(id) {
    window.location.href = 'single.html?beer_id=' + id;
}

async function findBeer(beer_name) {
    const response = await fetch(`/beer_search_name/${beer_name}`);
    const data = await response.json();
    const beers = data.data || [];
    console.log(beers);
    
    beer_search_wrapper.innerHTML = '';    
    if(beers.length === 0){
        document.querySelector('.no_results_wrapper').innerHTML = '<p>No results</p>'
        //beer_search_wrapper.innerHTML += '<div class="no_results_wrapper"><p>No results</p></div>';
    }else{
        beers.forEach(beer => displaySearchResult(beer));    
    }
}

function displaySearchResult(beer) {
    let label;
    if(beer.labels) label = beer.labels.medium;
    else label = 'images/beer.png';
    
    beer_search_wrapper.innerHTML += 
    `<div onclick="moreBeerInfo('${beer.id}')">
        <img src="${label}">
        <div class="beer_info_wrapper">
            <h1>${beer.name}</h1>
            <h3>${beer.breweries[0].name}</h3>
            <div class="beer_facts">
                <p><strong>IBU:</strong> ${beer.ibu}%</p>
                <p><strong>ABV:</strong> ${beer.abv}%</p>
                <p class="beer_category">${beer.style.category.name}</p>
            </div>
        </div>
    </div>`
}

// -----------------------------------------------------------------------------


