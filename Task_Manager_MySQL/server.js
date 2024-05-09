require('dotenv').config();
const express = require('express');
const connection = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken') ;
const app = express();

app.use(express.json());

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN);
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    let token = authHeader && authHeader.split(' ')[1]    
    
    if (token === null ) {
        return res.sendStatus(401)
    }    
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus("Error occured! \n",403)            
        req.user = user
        next()
    })
} // Token Authentication function  


app.get('/users',authenticateToken , (req, res) => {

    if (req.user.role === "admin") {
        const sqlSelect = "SELECT * FROM users";
        connection.query(sqlSelect, (err, result) => {
            res.send(result);
        });
    }
    else {
        res.send("Only admin can see the user list");
    }
}); //Get all the user profile  if user role is admin .

app.get('/user/profile', authenticateToken, (req, res) => {
    const username = req.user.username;
    const selectsql = "SELECT * FROM users WHERE username = '" + username + "';";
    connection.query(selectsql, (err, result) => {
        res.send(result);
    })
}) // Get user profile .

app.post('/users/register',async(req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const role = req.body.role
        if ((username == null) || (email == null) || (password == null)) {
            res.send('username, email and password is required!');
            return;
        }
        sqlSelect = "SELECT * FROM users WHERE email = '" + email + "';";
        connection.query(sqlSelect, (err, result) => {
            if (result.length > 0) {
                res.send("Email already exists!");
                return;
            }
        }); //Checking whether anyone try to create multiple user using same email
        const salt = 10;
        const hashedpass = await bcrypt.hash(req.body.password, salt);
        const sqlInsert = "INSERT INTO users (username,email,password,role) VALUES ('"+username+"','"+email+"','"+hashedpass+"' ,'"+role+"');";
        connection.query(sqlInsert, (err, result) => {
            res.status(200).send(result);
        });} catch (error) {
        res.status(500).send(error);
    }
}); // Create a new user .


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
                    const user ={
                        username : result[0].username ,
                        password : result[0].password ,
                        role : result[0].role,
                    }
                    const token = generateAccessToken(user);
                    // console.log(token);
                    res.status(201).send({status : "Succesfully Logged in ",token: token});
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
}); // Authentication that generate JWT token which will be used in user authentication.


app.post('/tasks/addtask', authenticateToken, (req, res) => {
    const username = req.user.username;
    let sqlSelect = "SELECT * FROM users WHERE username = '" + `${username}` + "';";
    connection.query(sqlSelect, (err, result) => {
        const userid = result[0].userid;
        sqlSelect = "SELECT * FROM tasks WHERE userid = " + `${result[0].userid}` + ";";
        connection.query(sqlSelect, (err, result) => {
            const id = result.length + 1;
            const title = req.body.title;
            const description = req.body.description;
            const status = req.body.status;
            const sqlInsert = "INSERT INTO tasks VALUES (" + `${id}` + ", " + `${userid}` + ",'" + title + "','" + description + "','" + status + "');";
            connection.query(sqlInsert, (err, result) => {
                res.send(result);
            });
        });
    });
}); // Create a new task .

app.patch('/tasks/updatetask/:id', authenticateToken, (req, res) => {
    const n_title = req.body.title;
    const n_description = req.body.description;
    const n_status = req.body.status;
    const id = req.params.id;
    if(n_title === null && n_description === null && n_status === null){
        res.send("invalid update");
        return;
    }
    const username = req.user.username;
    let sqlSelect = "SELECT * FROM users WHERE username = '" + `${username}` + "';";
    connection.query(sqlSelect, (err, result) => {
        const userid = result[0].userid;
        let updateSql;
        if(n_title!=null){
            updateSql = "UPDATE tasks SET title = '"+n_title+"' WHERE userid = "+`${userid}`+" &&  id = "+`${id}`+" ;"
            connection.query(updateSql, (err, result) => { })
        }//updating title
        if(n_description!=null){
            updateSql = "UPDATE tasks SET description = '"+n_description+"' WHERE userid = "+`${userid}`+" &&  id = "+`${id}`+" ;"
            connection.query(updateSql, (err, result) => { })
        }//updating description
        if(n_status!=null){
            updateSql = "UPDATE tasks SET status = '"+n_status+"' WHERE userid = "+`${userid}`+" &&  id = "+`${id}`+" ;"
            connection.query(updateSql, (err, result) => { })
        } //updating status
        const selectsql = "SELECT * FROM tasks WHERE userid = "+`${userid}`+" &&  id = "+`${id}`+" ;"
            connection.query(selectsql, (err, result) => {
                res.send(result);
            })
    })

}); //Updated a task property .


app.delete('/users/tasks/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const username = req.user.username;
    let sqlSelect = "SELECT * FROM users WHERE username = '" + username + "';";
    connection.query(sqlSelect, async (err, result) => {                  
        let sqlDelete = "DELETE FROM tasks WHERE userid = " + `${result[0].userid}` + " &&  id = "+ `${id}` +";";
        connection.query(sqlDelete,(err,result)=>{
            res.send(result);
        });
    });
}); // Delete a specific task using task id .



app.get('/users/tasks/:id', authenticateToken, (req, res) => {
    const username = req.user.username;
    const id = req.params.id;
    let sqlSelect = "SELECT * FROM users WHERE username = '" + `${username}` + "';";
    connection.query(sqlSelect, (err, result) => {
        sqlSelect = "SELECT * FROM tasks WHERE userid = " + `${result[0].userid}` + " && id = "+`${id}`+" ;";
        connection.query(sqlSelect, (err, ut_tasks) => {
            res.send(ut_tasks);
        })
    });
}); // Get the specific task using task id .


app.get('/users/tasks', authenticateToken, (req, res) => {
    const username = req.user.username;
    let sqlSelect = "SELECT * FROM users WHERE username = '" + `${username}` + "';";
    connection.query(sqlSelect, (err, result) => {
        sqlSelect = "SELECT * FROM tasks WHERE userid = " + `${result[0].userid}` + ";";
        connection.query(sqlSelect, (err, u_tasks) => {
            res.send(u_tasks);
        })
    });
}); // Get all the tasks of a user .



app.get('/tasks',authenticateToken, (req, res) => {
    if (req.user.role === "admin") {
        const sqlSelect = "SELECT * FROM tasks ;";
        const r = null;
        connection.query(sqlSelect, (err, result) => {            
            res.send(result);
        });
    }
    else {
        res.send("Only Admin can see all the tasks");
    }    
}); // Get all tasks of all user If the user role is admin .


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});