const express = require('express')
const aplicacion = express.Router()
const mysql = require('mysql')
var path = require('path')
const fileupload = require('express-fileupload')
aplicacion.use(fileupload())
var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '27784169Pp',
    database: 'blog_viajes'
  })

  aplicacion.get('/', (peticion, respuesta) => {
    pool.getConnection((err, connection) => {
      let consulta
      let modificadorConsulta = ""
      let pagina = 0 
      let modificadorPagina = ""
      const busqueda = ( peticion.query.busqueda ) ? peticion.query.busqueda : ""
      if (busqueda != ""){
        modificadorConsulta = `
          WHERE
          titulo LIKE '%${busqueda}%' OR
          resumen LIKE '%${busqueda}%' OR
          contenido LIKE '%${busqueda}%'
        `
        consulta = `
        SELECT
        titulo, resumen, fecha_hora, pseudonimo, votos, publicaciones.id
        FROM publicaciones
        INNER JOIN autores
        ON publicaciones.autor_id = autores.id
        ${modificadorConsulta}
        ORDER BY fecha_hora DESC
      `
      modificadorPagina =""
      }else{
        pagina = (peticion.query.pagina) ? parseInt(peticion.query.pagina) : 0
        if(pagina < 0){
          pagina = 0
        }
        modificadorPagina = `LIMIT 5 OFFSET ${pagina * 5}`
        consulta = `SELECT
        titulo, resumen, fecha_hora, pseudonimo, votos, publicaciones.id
        FROM publicaciones
        INNER JOIN autores
        ON publicaciones.autor_id = autores.id
        ORDER BY fecha_hora DESC 
          ${modificadorPagina}
        `
      }
      
      connection.query(consulta, (error, filas, campos) => {
        respuesta.render('index', { data: filas , busqueda: busqueda, pagina:pagina})
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
      console.log(peticion.body)
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
                if(peticion.files && peticion.files.avatar){
                  const archivoAvatar = peticion.files.avatar
                  const id = filas.insertId
                  const nombreArchivo = `${id}${path.extname(archivoAvatar.name)}`
                  archivoAvatar.mv(`./public/avatars/${nombreArchivo}`, (error)=>{
                    const consultaAvatar = `UPDATE autores SET avatar = ${connection.escape(nombreArchivo)} WHERE id = ${connection.escape(id)}`
                    connection.query(consultaAvatar, function(error, filas, campos){
                      peticion.flash('mensaje', 'Usuario Registrado Exitosamente con Avatar')
                      respuesta.redirect('/registro')
                    })
                  })
                }else{
                  peticion.flash('mensaje', 'Usuario Registrado Exitosamente')
                  respuesta.redirect('/registro')
                }
                
              })
            }
          })
        }
      })
      
      connection.release()
    })
  })

  aplicacion.get('/publicacion/:id', function(peticion, respuesta){
    pool.getConnection(function(err,connection){
      const consulta = `SELECT * FROM publicaciones WHERE id = ${connection.escape(peticion.params.id)}`
      connection.query(consulta, function(error, filas, campos){
        if(filas.length > 0){
          respuesta.render('publicacion', { data: filas[0] })
        }else{
          respuesta.redirect('/')
        }
      })
      connection.release()
    })
  })

  module.exports = aplicacion
  