const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'tasks_manager_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL,
    role ENUM('admin' , 'user') DEFAULT 'user'
  )
`;

// Create user table if not exists
connection.query(createUserTable, (err) => {
  if (err) {
    console.error('Error creating "users" table:', err);
  } else {
    console.log('"users" table created (or already exists)');
  }
});

const createTasksTable = `
CREATE TABLE IF NOT EXISTS tasks (
    id INT UNIQUE,
    userid INT,
    title VARCHAR(255) ,
    description VARCHAR(300),
    status ENUM('todo' , 'in progress' , 'completed') DEFAULT 'todo',
    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
  )
`;

connection.query(createTasksTable, (err) => {
  if (err) {
    console.error('Error creating "tasks" table:', err);
  } else {
    console.log('"tasks" table created (or already exists)');
  }
});

module.exports = connection;