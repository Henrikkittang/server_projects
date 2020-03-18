

const new_task_inp = document.querySelector('#new_task_inp');
const new_task_button = document.querySelector('#new_task_button');
const progress_p = document.querySelector('#progress');
const task_wrappers = document.querySelectorAll('.tasks_wrapper');
const dragedItem = null;

const url = new URL( window.location.href );
const projectName = url.searchParams.get('projectName');

function updateProgress(){
    length1 = document.querySelector('#to_do').childElementCount;
    length2 = document.querySelector('#doing').childElementCount;
    length3 = document.querySelector('#done').childElementCount;

    totalPorgress = (length3 / (length1 + length2 + length3)) * 100
    totalPorgress = Math.round(totalPorgress * 10) / 10;

    progress_p.textContent = 'progress: ' + (totalPorgress | 0)  + '%';
}

function loadTask(taskText, list){
    const newItem = document.createElement('div');
    newItem.classList.add('task-item'); 
    newItem.draggable = true;

    const text = document.createElement('p');
    text.textContent = taskText
    text.classList.add('task_text')
    
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '&#10060;';
    removeBtn.classList.add('task_remove_btn')

    removeBtn.addEventListener('click', async evt =>{
        newItem.parentNode.removeChild(newItem);
        updateProgress();
        await fetch('/removeTask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({taskName: newItem.childNodes[0].textContent, projectName: projectName})
        });
    });

    newItem.addEventListener('dragstart', evt =>{
        draggedItem = newItem;
    });

    newItem.addEventListener('dragend', evt =>{
        draggedItem = null;
    });

    newItem.append(text, removeBtn);
    document.querySelector(list).append(newItem);
}

window.onload = async () =>{
    for(let i = 0; i < task_wrappers.length; i++){
        const wrapper = task_wrappers[i];

        wrapper.addEventListener('dragover', evt =>{
            evt.preventDefault();
        });

        wrapper.addEventListener('dragenter', evt =>{
            evt.preventDefault();            
        });

        wrapper.addEventListener('dragleave',  evt =>{
            //wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        });
        
        wrapper.addEventListener('drop', async evt =>{
            wrapper.append(draggedItem);
            updateProgress();
            await fetch('/changeList', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    taskName: draggedItem.childNodes[0].textContent, 
                    newList: '#' + wrapper.id,
                    projectName: projectName
                })
            });
        });
    }
    
    new_task_button.addEventListener('click', async evt =>{
        loadTask(new_task_inp.value, '#to_do')
        updateProgress();
        await fetch('/makeTask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({taskName: new_task_inp.value, projectName: projectName})       
        });
    });

    const response = await fetch('/getTasks/' + projectName);
    const tasks = await response.json();
    tasks.forEach(task => loadTask(task.text, task.list));
    updateProgress();
}



