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
aplicacion.use('/admin/', (peticion, respuesta, siguiente)=>{
  if(peticion.session.usuario){
    siguiente()
  }else{
    peticion.flash('mensaje', 'Debe iniciar Sesion')
    respuesta.redirect('/inicioSesion')
  }
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

aplicacion.get('/cerrar', function(peticion, respuesta){
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

aplicacion.listen(8080, function(){
  console.log("Servidor iniciado")
})
