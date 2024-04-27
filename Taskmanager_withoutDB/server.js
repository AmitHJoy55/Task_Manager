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

// Middleware to validate task data
function validateTaskData(req, res, next) {
    const { title, description, status } = req.body;
    if (!title || !description || !status) {
        return res.status(400).json({ message: 'Title, description, and status are required' });
    }
    next();
}

// Get all tasks from task.json file
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

// Create a task
app.post('/addtask', validateTaskData, (req, res) => {
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

// Update a task
app.put('/tasks/:id', validateTaskData, (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], title, description, status };
        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({ message: 'Task not found!' });
    }
});
// Patch Request for updating a task while giving any of the para-meter 
app.patch('/tasks/:id',  (req, res) => {
    const taskId = parseInt(req.params.id);
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    const updates = req.body;
    try {
      if (taskIndex !== -1) {    
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };    
        fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));    
        res.status(200).json(tasks);
      } else {
        res.status(404).json({ message: 'Task not found' });
      }
    } catch (error) {
      res.status(404).json({ message: "Task didn't updated" });
    }  
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    let tasks = readTasks();
    tasks = tasks.filter(task => task.id !== taskId);
    writeTasks(tasks);
    res.status(204).end();
});

//Sort By ID
app.get('/tasks/sortById', (req, res) => {
    const tasks = readTasks();
    const sortedTasks = tasks.sort((a, b) => a.id - b.id);
    res.json(sortedTasks);
});

// Sort By Status where we ranked Todo=1 ,In Progress=2, Completed=3 
app.get('/tasks/sortByStatus', (req, res) => {
    const tasks = readTasks();
    const statusMap = { 'Todo': 1, 'In Progress': 2, 'Completed': 3 };

    try{
        const sortedTasks = tasks.sort((a, b) => {
            const statusA = statusMap[a.status] || 0; 
            const statusB = statusMap[b.status] || 0; 
            return statusA - statusB;
        });
        res.json(sortedTasks);
    }catch (error) {
        res.status(404).json({ message: 'Task not found' });
    }
    
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
