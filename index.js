const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const port = 8000;

const connection = mysql.createConnection({
  host: "sql11.freesqldatabase.com",
  user: "sql11648567",
  password: "BIDisyH6lM",
  database: "sql11648567",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL");
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/getTodos", (req, res) => {
  const userId = req.query.userId;
  // console.log("USER_ID", userId);
  const sql = `SELECT * FROM todos WHERE idUser=${userId}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Todos récupérés");
    // console.log(result);
    result.map(
      (r) => (
        r.edit === 0 ? (r.edit = false) : (r.edit = true),
        r.done === 0 ? (r.done = false) : (r.done = true)
      )
    );
    console.log(result);
    res.send(JSON.stringify(result));
  });
});

app.post("/addTodo", (req, res) => {
  console.log(req.body);
  const { content, done, edit, idUser } = req.body;

  const sql = `INSERT INTO todos (content, edit, done, idUser) VALUES (?, ?, ?, ?)`;
  const values = [content, edit, done, idUser];

  connection.query(sql, values, (err, result) => {
    if (err) throw err;
    console.log("Todo ajouté en BDD");
    // console.log(result);
    let resultBack = req.body;
    resultBack.id = result.insertId;
    res.json(resultBack);
  });
});

app.patch("/updateTodo", (req, res) => {
  console.log(req.body);
  const edit = req.body.edit === true ? "1" : "0";
  const done = req.body.done === true ? "1" : "0";
  const content = req.body.content;
  const id = req.body.idTodo;

  const updateSql = `UPDATE todos SET content="${content}", done=${done}, edit=${edit} WHERE idTodo=${id}`;

  connection.query(updateSql, (err, result) => {
    if (err) throw err;
    console.log("Todo modifié en base de données");
    res.send(req.body);
  });
});

app.delete("/deleteTodo", (req, res) => {
  const id = req.body.idTodo;

  const sqlDelete = `DELETE FROM todos WHERE idTodo=${id}`;
  connection.query(sqlDelete, (err, result) => {
    if (err) throw err;
    console.log("Todo supprimé de la base de données");
    res.send(JSON.stringify("Todo supprimé de la base de données"));
  });
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  const sql = `SELECT idUser, username FROM users WHERE email="${email}" AND password="${password}"`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    if (!result.length) {
      console.log("USER INCORRECT");
      let doesExist = { message: "User incorrect" };
      res.send(doesExist);
    } else {
      let resultBack = req.body;
      // console.log(result[0].idUser);
      resultBack.idUser = result[0].idUser;
      resultBack.username = result[0].username;
      res.json(resultBack);
    }
  });
});

app.post("/addUser", (req, res) => {
  // console.log(req.body);
  const { username, email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email="${email}"`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    // console.log(result);
    if (result.length) {
      console.log("EMAIL EXISTANT");
      let isEmail = { message: "Email existant" };
      res.send(isEmail);
    } else {
      const sqlInsert =
        "INSERT INTO users (username, email, password)VALUES (?,?,?)";
      const values = [username, email, password];
      connection.query(sqlInsert, values, (err, result) => {
        if (err) throw err;
        let resultBack = req.body;
        resultBack.id = result.insertId;
        res.json(resultBack);
      });
    }
  });
});

app.get("/", (_, res) => {
  res.send(JSON.stringify("API IS WORKING"));
});

app.listen(port, () => {
  console.log(`serveur Node écoutant sur le port ${port}`);
});
