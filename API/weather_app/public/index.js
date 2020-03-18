
if('geolocation' in navigator){
    console.log('geolocation available');
    
    navigator.geolocation.getCurrentPosition(async position => {
        let latitude, longitude, weather, air;
        
        try{
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            
            document.querySelector('#lat').textContent = latitude.toFixed(3);
            document.querySelector('#lon').textContent = longitude.toFixed(3);  
            
            const api_url = `weather/${latitude}, ${longitude}`
            const response = await fetch(api_url); 
            const json = await response.json();
                    
            weather = json.weather.currently;
            air = json.air_quality.results[0].measurements[0];
                       
            document.querySelector('#summary').textContent = weather.summary;
            document.querySelector('#temperature').textContent = weather.temperature;
            
            document.querySelector('#aq_parameter').textContent = air.parameter;
            document.querySelector('#aq_value').textContent = air.value;
            document.querySelector('#aq_units').textContent = air.unit;
            document.querySelector('#aq_date').textContent = air.lastUpdated;    
        }
        
        catch(error){
            console.error(error);
            air = {value: -1}; 
        }
        
        const data = {latitude, longitude, weather, air};
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)        
        };
        const db_response = await fetch('/api', options);
        const db_json = await db_response.json();
        console.log(db_json);
        
    });
}
else{
    console.log('geolocation not available');
}




/**/