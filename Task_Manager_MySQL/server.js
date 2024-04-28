const express = require('express');
const connection = require('./database');
const app = express();

app.use(express.json());

app.get('/users', (req, res) => {
    const sqlSelect = "SELECT * FROM users";
    connection.query(sqlSelect, (err, result) => {
        res.send(result);
    });
}); //Get all user 

app.post('/users', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const sqlInsert = "INSERT INTO users VALUES ('"+username+"','"+email+"','"+password+"' ,'"+`${role}`+"');";

    connection.query(sqlInsert, (err, result) => {
        res.send(result);
    });
}); // Create a new user 

app.post('/addtask', (req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const description = req.body.description;
    const status = req.body.status;
    const user_id = req.body.user_id;
    const sqlInsert = "INSERT INTO tasks VALUES ("+`${id}`+" ,'"+title+"','"+description+"','"+status+"' ,'"+`${user_id}`+"');";
    console.log(sqlInsert) ;
    connection.query(sqlInsert, (err, result) => {
        res.send(result);
    });
}); // Create a new task

app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM tasks WHERE id = "+`${id}`+";"
    console.log(sqlDelete) ;
    connection.query(sqlDelete, (err, result) => {
        res.send(result);
    });
}); // Delete a task  

app.get('/tasks/:u_id', (req, res) => {
    const u_id = req.params.u_id;
    const sqlSelect = "SELECT * FROM `tasks` WHERE id = "+`${u_id}`+";";
    console.log(sqlSelect);
    connection.query(sqlSelect, (err, result) => {
        res.send(result);
    });
}); // Get the specific task using task id




app.get('/tasks', (req, res) => {
    const sqlSelect = "SELECT * FROM `tasks` ";
    console.log(sqlSelect);
    connection.query(sqlSelect, (err, result) => {
        res.send(result);
    })
}); // Get all tasks


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});