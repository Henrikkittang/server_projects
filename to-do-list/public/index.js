
const new_project_meny = document.querySelector('#new_project_meny');
const new_project_section = document.querySelector('.new_project_section');
const new_project_submit = document.querySelector('#new_project_submit');
const projects_container = document.querySelector('.projects_container');

function displayProject(project){
    const progress = Math.round(project.tasksDone / project.totalTasks * 100) | 0;
    projects_container.innerHTML += `
        <div class="project_wrapper">
            <div>
                <a class="project_link" href="project.html?projectName=${project.projectName}">${project.projectName}</a>
                <button class="edit_btn" onclick="editProjectName(event)"> <i class='fas'>&#xf044;</i> </button>
            </div>
            <div class="progress_wrapper">
                <p>Done: ${project.tasksDone} </p>
                <p>To do: ${project.taskToDo} </p>
                <div class="project_progress">
                    <progress max="${project.totalTasks}" value="${project.tasksDone}" class="task_progressbar"></progress>
                    <p class="progress_prosent">${progress}%</p>    
                </div>
            </div>
            <div class="description">
                <button class="description_btn" onclick="toggleDescription(event)">Read more</button>
                <div class="description_wrapper">
                    <p>${project.description}</p>
                </div>
            </div>
        </div>
    `
}

window.onload = async () =>{
    const response = await fetch('/getProjects');
    const projects = await response.json();

    projects.forEach(project =>{
        displayProject(project)        
    });
}

new_project_meny.addEventListener('click', evt =>{
    if(new_project_section.style.display === 'block'){
        new_project_section.style.display = 'none'; 
    }else{
        new_project_section.style.display = 'block'; 
    }
});

new_project_submit.addEventListener('click', async evt =>{
    const data = {
        name: document.querySelector('#new_project_name').value,
        description: document.querySelector('#new_project_description').value
    }

    const response = await fetch('/newProject', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const newProjectData = response.json();
    displayProject(newProjectData);

});

async function editProjectName(evt){
    const parent = evt.target.parentNode.parentNode;
    const projectNameLink = parent.children[0];
    const oldProjectName = projectNameLink.textContent.toString()
    const newProjectName = prompt('Edit project name', oldProjectName);
    
    const data = {
        oldProjectName: oldProjectName,
        newProjectName: newProjectName
    };
    
    const response = await fetch('/editProjectName', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }); 
    const status = await response.json();
    if(status.status === 'success'){
        projectNameLink.textContent = newProjectName;
    }
}

function toggleDescription(evt){
    const parent = evt.target.parentNode;
    const wrapper = parent.children[1];

    if(wrapper.value == 'shown'){
        wrapper.style.display = 'none';
        wrapper.value = 'hidden';
        evt.target.textContent = 'Read more';
    }else{
        wrapper.style.display = 'block';
        wrapper.value = 'shown'; 
        evt.target.textContent = 'Read less';
    }
}

