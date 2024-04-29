require('dotenv').config();
const express = require('express');
const connection = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken') ;
const app = express();

app.use(express.json());


app.get('/users', (req, res) => {
    const sqlSelect = "SELECT * FROM users";
    connection.query(sqlSelect, (err, result) => {
        res.send(result);
    });
}); //Get all user 

app.post('/users',async(req, res) => {
    const salt = 10;
    const hashedpass = await bcrypt.hash(req.body.password, salt);
    try {
        const username = req.body.username;
        const email = req.body.email;
        const role = req.body.role;
        const sqlInsert = "INSERT INTO users VALUES ('"+username+"','"+email+"','"+hashedpass+"' ,'"+`${role}`+"');";
        connection.query(sqlInsert, (err, result) => {
            res.send(result);
        });} catch (error) {
        res.status(500).send(error);
    }
}); // Create a new user 


app.post('/users/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const sqlSelect = "SELECT * FROM users WHERE username = '"+username+"';";
    
    connection.query(sqlSelect, async (err, result) => {
        try {
            if (err) {
                res.status(500).send(err);
                return;
            }
            if (result.length > 0) {
                const validpass = await bcrypt.compare(password, result[0].password);                
                if (validpass) {
                    const token = jwt.sign({username: username}, process.env.ACCESS_TOKEN_SECRET);
                    console.log(token);
                    res.status(201).send({token: token});
                } else {
                    res.status(400).send('Invalid Password');
                }
            } else {
                res.status(400).send('Invalid Username');
                return;
            }   
        } catch (error) {
            res.status(500).send('Request Error');
        } 
    }
    );
}); // Authentication that generate JWT token which will be used in user authentication



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