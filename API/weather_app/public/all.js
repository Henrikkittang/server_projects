// Making map and tiles
const mymap = L.map('checkinMap').setView([0, 0], 1);
const attribution = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
const tileURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const tiles = L.tileLayer(tileURL, {attribution}) 
tiles.addTo(mymap);     

async function getData(){
    // Gets all the data from the database and displays it on the web page
    const response = await fetch('/api');
    const data = await response.json();
    
    console.log(data);

    for(item of data){
        const marker = L.marker([item.latitude, item.longitude]).addTo(mymap);
        let text = `The weather here at ${item.latitude}&deg;, ${item.longitude}&deg;
            is ${item.weather.summary} 
            with a temperature of ${item.weather.temperature}&deg; C.`;
            
        if(item.air.value < 0){
            text += ' No air quality reading for this location';
        }
        else{
            text += ` The concentration of particulate matter (${item.air.parameter}) is
                ${item.air.value} ${item.air.unit}, last read 
                on ${item.air.lastUpdated}`;

        }
        marker.bindPopup(text); 
    }
}

mymap.on('click', async (e) => {
  let coord = e.latlng;
  let latitude = coord.lat;
  let longitude = coord.lng;
  
  const api_url = `weather/${latitude}, ${longitude}`
  const response = await fetch(api_url); 
  const json = await response.json();
  console.log(json);
          
  weather = json.weather.currently;
  
  const greenIcon = new L.Icon({
      iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  const marker = L.marker([latitude, longitude]).addTo(mymap);
  
  
  let text = `The weather here at ${latitude}&deg;, ${longitude}&deg;
      is ${weather.summary} 
      with a temperature of ${weather.temperature}&deg; C.`;
      
  try{
      air = json.air_quality.results[0].measurements[0];
      text += ` The concentration of particulate matter (${air.parameter}) is
          ${air.value} ${air.unit}, last read 
          on ${air.lastUpdated}`;
  }
  
  catch(error){
      text += ' No air quality reading for this location';

  }
  console.log("You clicked the map at latitude: " + latitude + " and longitude: " + longitude);      
  marker.bindPopup(text);  
 });
 
getData();
