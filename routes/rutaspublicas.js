const express = require('express')
const aplicacion = express.Router()
const mysql = require('mysql')

var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '27784169Pp',
    database: 'blog_viajes'
  })

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
  
  aplicacion.get('/inicioSesion', function(peticion, respuesta){
    respuesta.render('inicioSesion', {mensaje: peticion.flash('mensaje')})
  })
  
  aplicacion.post('/inicioS', function(peticion, respuesta){
    pool.getConnection(function(err,connection){
      const email = peticion.body.email.toLowerCase().trim()
      const contrasena = peticion.body.contrasena
      const validacion = `SELECT * FROM autores WHERE email = '${email}' AND contrasena = '${contrasena}'`
      connection.query(validacion, function(error, filas, campos){
        if(filas[0]){
          peticion.session.usuario = filas[0]
          respuesta.redirect('/admin/index')
        }else{
          peticion.flash('mensaje', 'Credenciales incorrectas')
          respuesta.redirect('/inicioSesion')
        }
      })
    })
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

  module.exports = aplicacion
  