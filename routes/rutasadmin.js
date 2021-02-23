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

  aplicacion.get('/admin/editar/:id',function(peticion, respuesta){
    pool.getConnection((err, connection) => {
      const consulta = `
        SELECT * FROM publicaciones
        WHERE
        id = ${connection.escape(peticion.params.id)}
        AND
        autor_id = ${connection.escape(peticion.session.usuario.id)}
      `
      connection.query(consulta, (error, filas, campos) => {
        if (filas.length > 0){
          respuesta.render('admin/editar', {publicacion: filas[0], mensaje: peticion.flash('mensaje'), usuario: peticion.session.usuario})
        }
        else{
          peticion.flash('mensaje', 'Operación no permitida')
          respuesta.redirect("/admin/index")
        }
      })
      connection.release()
    })
  })


  aplicacion.post("/admin/procesarE/:id", function(peticion, respuesta){
    pool.getConnection((err, connection)=>{
      const actualizacion = `
      UPDATE publicaciones
      SET
      titulo = ${connection.escape(peticion.body.titulo)},
      resumen = ${connection.escape(peticion.body.resumen)},
      contenido = ${connection.escape(peticion.body.contenido)}
      WHERE
      id = ${connection.escape(peticion.params.id)}
      AND
      autor_id = ${connection.escape(peticion.session.usuario.id)}
      `
      connection.query(actualizacion, (error, filas, campos) => {
        if (filas && filas.changedRows > 0){
          peticion.flash('mensaje', 'Publicación editada')
        }
        else{
          peticion.flash('mensaje', 'Publicación no editada')
        }
        respuesta.redirect("/admin/index")
      })
      connection.release()
    })
  })

  aplicacion.get('/admin/procesarD/:id', function(peticion, respuesta){
    pool.getConnection((err, connection)=>{
      const eliminar = `DELETE FROM publicaciones WHERE id = ${connection.escape(peticion.params.id)}  AND
      autor_id = ${connection.escape(peticion.session.usuario.id)}`
      connection.query(eliminar, (error, filas, campos) => {
        if (filas && filas.affectedRows  > 0){
          peticion.flash('mensaje', 'Publicación eliminada')
        }
        else{
          peticion.flash('mensaje', 'Publicación no eliminada')
        }
        respuesta.redirect("/admin/index")
      })
      connection.release()
    })
  })
  module.exports = aplicacion