const express = require('express');
const fs = require('fs'); 

const app = express();  
app.listen(8000, () => {console.log(`listening at port 8000`)});
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

function readDB(){
    const rawData = fs.readFileSync('data.json', 'utf8');
    database = JSON.parse(rawData);
    return database
}

function saveDB(database){
    const string = JSON.stringify(database);
    fs.writeFileSync('data.json', string, 'utf8', ()=>{});
}

app.post('/makeTask', (request, response) =>{
    data = request.body;
    database = readDB();

    database[data.projectName]['tasks'].push( {text: data.taskName, list:'#to_do'} );

    saveDB(database);
    response.json({});
});

app.get('/getTasks/:projectName', (request, response) =>{
    const projectName = request.params['projectName'];
    database = readDB();

    response.json(database[projectName]['tasks']);        
});


app.post('/changeList', (request, response) =>{
    data = request.body;
    database = readDB();

    database[data.projectName]['tasks'].forEach((task, idx) =>{
        if(data.taskName == task.text){
            database[data.projectName]['tasks'][idx].list = data.newList;
        }
    });

    saveDB(database);
    response.json({});
});

app.post('/removeTask', (request, response) => {
    data = request.body;
    database = readDB();

    database[data.projectName]['tasks'].forEach((task, idx) =>{
        if(data.taskName == task.text){
            database[data.projectName]['tasks'].splice(idx, 1);
        }
    });

    saveDB(database);
    response.json({});
});

app.get('/getProjects', (request, response) => {
    database = readDB();

    const projectNames = []
    let tasksDone;
    for(project in database){
        tasksDone = 0;
        const tasks = database[project]['tasks']
        tasks.forEach(task =>{
            if(task.list == '#done') tasksDone++;
        });
        projectNames.push({
            projectName: project,
            tasksDone: tasksDone,
            taskToDo: tasks.length - tasksDone | 0 ,
            totalTasks: tasks.length | 0,
            description: database[project].description
        });
    }

    saveDB(database);
    response.json(projectNames);
});


app.post('/editProjectName', (request, response) =>{
    data = request.body;
    const database = readDB();

    console.log(data);

    Object.defineProperty(database, data.newProjectName, 
        Object.getOwnPropertyDescriptor(database, data.oldProjectName));
    delete database[data.oldProjectName];

    saveDB(database);
    response.json({});
});









