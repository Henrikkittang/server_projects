

console.log("About to fetch image");

async function catchImage(){
    const response = await fetch("bilder/blader.jpg");
    const blob = await response.blob();
    document.querySelector("#blader").src = URL.createObjectURL(blob);
}

catchImage()
    .then(response => {
        console.log("yay");
    })
    .catch(error =>{
        console.error(error);
    })

/**/
