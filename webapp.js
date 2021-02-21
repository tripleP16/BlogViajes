const express = require('express')
const aplicacion = express()
const mysql = require('mysql')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')


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

aplicacion.get('/', function (peticion, respuesta) {

  pool.getConnection(function(err, connection) {
    const consulta = `SELECT titulo, resumen, fecha_hora, votos, pseudonimo FROM publicaciones inner join autores a on publicaciones.autor_id = a.id ORDER BY fecha_hora desc LIMIT 5;`
    connection.query(consulta, function (error, filas, campos) {
      respuesta.render('index',{data: filas})
    })
    connection.release()

    
  })
})

aplicacion.listen(8080, function(){
  console.log("Servidor iniciado")
})
