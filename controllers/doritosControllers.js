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
        
        // Validar que todos los campos requeridos estén presentes
        if (!email || !pass || !nombre || !cedula || !ciudad || !celular || !fechaNacimiento) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        
        const hashedPass = await bcrypt.hash(pass, 10);
        
        // Crear el usuario
        const newUser = new User({ email, pass: hashedPass, rol: 'user' });
        const savedUser = await newUser.save();
        
        // Crear la información del usuario en UserInfo
        const newUserInfo = new UserInfo({
            userId: savedUser._id,
            nombre, cedula, ciudad, celular, fechaNacimiento
        });
        await newUserInfo.save();

        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el usuario' });
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
            const nuevoIntento = new Intento({ userId, codigo });
            await nuevoIntento.save();
            return res.json({ message: 'No Ganaste' });
        }

        if (codigoValido.estado === 'reclamado') {
            return res.json({ message: 'El código ya ha sido reclamado' });
        }

        codigoValido.estado = 'reclamado';
        await codigoValido.save();

        const nuevoIntento = new Intento({ userId, codigo: codigoValido._id });
        await nuevoIntento.save();

        res.json({ message: `Ganaste: ${codigoValido.premio}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el código' });
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
        const codigosGanadores = await Codigo.find({ estado: 'reclamado' }).populate({
            path: 'estado',
            model: 'UserInfo'
        });

        const ganadores = codigosGanadores.map(codigo => ({
            fecha: codigo.fecha,
            nombre: codigo.estado.nombre,
            cedula: codigo.estado.cedula,
            celular: codigo.estado.celular,
            codigo: codigo.codigo,
            premio: codigo.premio
        }));

        res.json(ganadores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la tabla de ganadores' });
    }
};


// Obtener todos los códigos disponibles (no reclamados)
exports.allCodigo = async (res) => {
    try {
        const codigosDisponibles = await Codigo.find();
        res.json(codigosDisponibles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
