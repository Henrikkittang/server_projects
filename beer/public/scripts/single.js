

window.onload = function(){
    const url_string = window.location.href;
    const url = new URL(url_string);
    const beer_id = url.searchParams.get('beer_id');
    
    singleBeer(beer_id)
}


// ---------------------------------------------------------


async function singleBeer(id) {    
    const response = await fetch(`/get_by_id/${id}`);
    const data = await response.json();
    const beer = data.data[0];
    console.log(beer);
    
    let label;
    if(beer.labels) label = beer.labels.medium;
    else label = 'images/beer.png';
        
    const newElement = document.createElement('div');
    newElement.innerHTML +=    
    `<div class="singleBeer">                                        
        <div class="more_beer_info_wrapper">
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
        </div>
        <div>
            <p class="description">${beer.description}</p>
        </div>
    </div>`

    document.querySelector('#main').append(newElement);

}
