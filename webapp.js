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

aplicacion.get('/registro', function(peticion, respuesta){
  respuesta.render('registro', {mensaje: peticion.flash('mensaje')})
})

aplicacion.post('/procesarR', function(peticion, respuesta){
  pool.getConnection(function(err, connection) {
    const email = peticion.body.email.toLowerCase().trim()
    const pseudonimo = peticion.body.pseudonimo.trim()
    const contrasena = peticion.body.contrasena
    const validacionEmail = `SELECT * FROM autores WHERE email = '${email}'`
    
    connection.query(validacionEmail, function(error, filas, campos){
    
      if(filas.length >0){
        peticion.flash('mensaje', 'Email existente')
        respuesta.redirect('/registro')
      }else{
        const validacionPseudonimo = `SELECT * FROM autores WHERE pseudonimo = '${pseudonimo}'`
        connection.query(validacionPseudonimo, function(error, filas, campos){
          if(filas.length >0){
            peticion.flash('mensaje', 'Pseudonimo existente')
            respuesta.redirect('/registro')
          }else{
            const insertar = `INSERT INTO autores (email, contrasena, pseudonimo) VALUES('${email}', '${contrasena}', '${pseudonimo}')`; 
            connection.query(insertar, function(error, filas, campos){
              peticion.flash('mensaje', 'Usuario Registrado Exitosamente')
              respuesta.redirect('/registro')
            })
          }
        })
      }
    })
    
    connection.release()
  })
})

aplicacion.listen(8080, function(){
  console.log("Servidor iniciado")
})
