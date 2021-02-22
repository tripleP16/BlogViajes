const express = require('express')
const aplicacion = express()
const mysql = require('mysql')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')
const middleware = require('./routes/rutasmiddleware')
const admin = require('./routes/rutasadmin')
const publicas = require('./routes/rutaspublicas')
var pool = mysql.createPool({
  connectionLimit: 20,
  host: 'localhost',
  user: 'root',
  password: '27784169Pp',
  database: 'blog_viajes'
})

aplicacion.use(bodyParser.json())
aplicacion.use(bodyParser.urlencoded({ extended: true }))
aplicacion.set("view engine", "ejs")
aplicacion.use(session({ secret: 'token-muy-secreto', resave: true, saveUninitialized: true }));
aplicacion.use(flash())
aplicacion.use(express.static('public'))
aplicacion.use(middleware)
aplicacion.use(admin)
aplicacion.use(publicas)



aplicacion.listen(8080, function(){
  console.log("Servidor iniciado")
})
