

const radius_inp =  document.querySelector('#radius_select');
const zoom_btn = document.querySelector('#zoom_btn');
 

// -----------------------------------------------------------------------------


const location_inp = document.querySelector('#location_inp');
const location_btn = document.querySelector('#location_btn');

// Making map and tiles
const map = L.map('checkinMap').setView([0, 0], 1);
const attribution = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
const tileURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const tiles = L.tileLayer(tileURL, {attribution}) 
tiles.addTo(map);
const markerGroup = L.layerGroup().addTo(map);
const greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

location_btn.addEventListener('click', async evt =>{
    const location_search = location_inp.value;
    const response = await fetch(`/location/${location_search}`);
    const json = await response.json(); 
    console.log(json);
    const radius = radius_inp.value;
    markerGroup.clearLayers();   
    json.features.forEach(location =>{
        latlon = location.geometry.coordinates.reverse();
        let marker = L.circle(latlon, radius*1000).addTo(markerGroup);
        marker = L.marker(latlon).addTo(markerGroup);
        marker.bindPopup(location.properties.formatted); 
        displayBreweries(latlon, radius); 
    });
});

async function displayBreweries(latlon, radius) {
    const response = await fetch(`breweries/${latlon}&${radius}`);
    const breweries_json = await response.json(); 
    
    const breweries = breweries_json.data || [];
    console.log(breweries);
    breweries.forEach(brewery => {
        const marker = L.marker([brewery.latitude, brewery.longitude], {icon:greenIcon}).addTo(markerGroup);
        marker.bindPopup(brewery.brewery.name); 
    });
    
}

zoom_btn.addEventListener('click', evt =>{
    map.setView([0, 0], 1);
});



     


