// Server
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

// Read tasks from tasks.json file
function readTasks() {
    const tasksData = fs.readFileSync('tasks.json');
    return JSON.parse(tasksData);
}

// Write tasks to tasks.json file
function writeTasks(tasks) {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
}

// Generate unique task ID
function generateTaskId() {
    const tasks = readTasks();
    return tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1; 
    //If the task length is grater than 0 then it will just add 1 with the last task id as task id for the lastest task added 
}


// Get all tasks from task.json file
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

// Create a task
app.post('/addtask', (req, res) => {
    const { title, description, status } = req.body;
    const newTask = {
        id: generateTaskId(),
        title,
        description,
        status
    };
    const tasks = readTasks();
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
