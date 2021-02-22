const express = require('express')
const router = express.Router()
router.use('/admin/', (peticion, respuesta, siguiente)=>{
    if(peticion.session.usuario){
      siguiente()
    }else{
      peticion.flash('mensaje', 'Debe iniciar Sesion')
      respuesta.redirect('/inicioSesion')
    }
  })

module.exports = router