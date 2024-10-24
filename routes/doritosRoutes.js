const express = require('express');
const doritosController = require('../controllers/doritosControllers');
const router = express.Router();

// Rutas
router.post('/login', doritosController.login);
router.post('/newUser', doritosController.newUser);
router.post('/newAdmin', doritosController.newAdmin);
router.post('/registrarCodigo', doritosController.registrarCodigo);
router.get('/tablaUser/:userId', doritosController.tablaUser);
router.get('/tablaAdmin', doritosController.tablaAdmin);

module.exports = router;
