

const fileSelector = document.querySelector('#fileSelector');
const linkContainer = document.querySelector('#linkContainer');


// Fires ones the files are loaded in
fileSelector.addEventListener('change',  evt =>{
    const chosenFiles = evt.target.files;  

    for(let i = 0; i < chosenFiles.length; i++){
        // Only images are allowed
        if(chosenFiles[i].type.split('/')[0] === 'image'){  
            const reader = new FileReader();  // Needs one 'FileReader' object per file
            const fileName = chosenFiles[i].name;   // this is the reason the functions cant be seperated
            reader.readAsDataURL(chosenFiles[i]);   // Fires the reader.onload event, converts file to base64
            
            reader.onload = async (evt) => {                
                const response = await fetch('/file', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({file: evt.target.result})       
                });
                const json = await response.json();
                
                // Adds new link to the page
                const newLink =  `<a href="${json.file}" download>${fileName}</a>`
                linkContainer.innerHTML += newLink;
            }  
        }
    }
});











