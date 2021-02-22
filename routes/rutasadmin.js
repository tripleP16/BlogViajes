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

aplicacion.get('/admin/index', function (peticion, respuesta) {
    pool.getConnection(function(err, connection){
      const consulta = `SELECT * FROM publicaciones WHERE autor_id = ${peticion.session.usuario.id}`
      connection.query(consulta, function(error, filas, campos){
         respuesta.render('admin/index', { usuario: peticion.session.usuario, mensaje: peticion.flash('mensaje'), publicaciones: filas })
      })
     
      connection.release()
    })
    
  })
  
  aplicacion.get('/admin/agregar', function(peticion, respuesta){
    respuesta.render('admin/agregar', { usuario: peticion.session.usuario, mensaje: peticion.flash('mensaje') })
  })
  
  aplicacion.get('/admin/cerrar', function(peticion, respuesta){
    peticion.session.destroy();
    respuesta.redirect("/")
  })
  
  aplicacion.post('/admin/procesarP', function(peticion, respuesta){
    pool.getConnection(function(err, connection){
      const fecha = new Date()
      const date = `${fecha.getFullYear()}-${fecha.getMonth()+1}-${fecha.getDate()}`
      const titulo = peticion.body.titulo
      const contenido = peticion.body.contenido
      const resumen = peticion.body.resumen
      console.log(titulo)
      const query = `INSERT INTO publicaciones (titulo, resumen, contenido, fecha_hora, autor_id) VALUES ('${titulo}', '${resumen}', '${contenido}', '${date}', ${peticion.session.usuario.id})`
  
      connection.query(query, function(error, filas, campos){
        peticion.flash('mensaje', 'Publicacion Agregada')
        respuesta.redirect('/admin/index')
      })
  
      connection.release()
    })
  })

  module.exports = aplicacion