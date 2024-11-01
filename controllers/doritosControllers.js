const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const Codigo = require('../models/Codigo');
const Intento = require('../models/Intento');
require('dotenv').config();

// Controlador para login
exports.login = async (req, res) => {
    try {
        const { email, pass } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(pass, user.pass);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign({ userId: user._id, rol: user.rol }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Crear un nuevo usuario
exports.newUser = async (req, res) => {
    try {
        const { email, pass, nombre, cedula, ciudad, celular, fechaNacimiento } = req.body;
        const hashedPass = await bcrypt.hash(pass, 10);

        const newUser = new User({ email, pass: hashedPass, rol: 'user' });
        const savedUser = await newUser.save();

        const newUserInfo = new UserInfo({
            userId: savedUser._id,
            nombre, cedula, ciudad, celular, fechaNacimiento
        });
        await newUserInfo.save();

        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Crear un nuevo administrador
exports.newAdmin = async (req, res) => {
    try {
        const { email, pass } = req.body;
        const hashedPass = await bcrypt.hash(pass, 10);

        const newAdmin = new User({ email, pass: hashedPass, rol: 'admin' });
        await newAdmin.save();

        res.json({ message: 'Admin creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Registrar un código ingresado por el usuario
exports.registrarCodigo = async (req, res) => {
    try {
        const { userId, codigo } = req.body;

        const codigoValido = await Codigo.findOne({ codigo });
        if (!codigoValido) {
            // Si el código no es válido, guardarlo en Intentos y retornar que no ganó
            const nuevoIntento = new Intento({
                userId,
                codigo,
                fecha: new Date()
            });
            await nuevoIntento.save();
            return res.json({ message: 'No Ganaste' });
        }

        if (codigoValido.estado) {
            return res.json({ message: 'El código ya ha sido reclamado' });
        }

        // Actualizar el estado del código con el userId del usuario que lo reclamó
        codigoValido.estado = userId;
        await codigoValido.save();

        // Registrar el intento como ganador, con la referencia a Codigo
        const nuevoIntento = new Intento({
            userId,
            codigo: codigoValido._id,
            fecha: new Date()
        });
        await nuevoIntento.save();

        res.json({ message: `Ganaste: ${codigoValido.premio}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Mostrar la tabla del usuario con sus códigos ingresados
exports.tablaUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const intentos = await Intento.find({ userId }).populate('codigo');
        res.json(intentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Mostrar la tabla para el admin con todos los usuarios ganadores
exports.tablaAdmin = async (req, res) => {
    try {
        const codigosGanadores = await Codigo.find({ estado: { $ne: null } }).populate('estado');
        const ganadores = [];

        for (let codigo of codigosGanadores) {
            const intento = await Intento.findOne({ codigo: codigo._id }).populate('userId');
            if (intento && intento.userId) {
                ganadores.push({
                    fecha: intento.fecha,
                    nombre: intento.userId.nombre,
                    cedula: intento.userId.cedula,
                    celular: intento.userId.celular,
                    codigo: codigo.codigo,
                    premio: codigo.premio
                });
            }
        }
        res.json(ganadores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener todos los códigos disponibles
exports.allCodigo = async (req, res) => {
    try {
        const codigos = await Codigo.find({ estado: null });
        res.json(codigos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
