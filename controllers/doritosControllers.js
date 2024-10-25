const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const Codigo = require('../models/Codigo');
const Intento = require('../models/Intento');
require('dotenv').config();

// Controlador para login
exports.login = async (req, res) => {
    const { email, pass } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ userId: user._id, rol: user.rol }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
};

// Crear un nuevo usuario
exports.newUser = async (req, res) => {
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
};

// Crear un nuevo administrador
exports.newAdmin = async (req, res) => {
    const { email, pass } = req.body;
    const hashedPass = await bcrypt.hash(pass, 10);
    
    const newAdmin = new User({ email, pass: hashedPass, rol: 'admin' });
    await newAdmin.save();

    res.json({ message: 'Admin creado exitosamente' });
};

// Registrar un código ingresado por el usuario
exports.registrarCodigo = async (req, res) => {
    const { userId, codigo } = req.body;

    // Buscar el código en la colección Codigos
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

    if (codigoValido.estado !== 'activo') {
        return res.json({ message: 'El código ya ha sido reclamado' });
    }

    // Actualizar el estado del código con el userId del usuario que lo reclamó
    codigoValido.estado = userId;
    await codigoValido.save();

    // Registrar el intento como ganador
    const nuevoIntento = new Intento({
        userId,
        codigo: codigoValido._id,
        fecha: new Date()
    });
    await nuevoIntento.save();

    res.json({ message: `Ganaste: ${codigoValido.premio}` });
};

// Mostrar la tabla del usuario con sus códigos ingresados
exports.tablaUser = async (req, res) => {
    const { userId } = req.params;
    const intentos = await Intento.find({ userId }).populate('codigo');
    res.json(intentos);
};

// Mostrar la tabla para el admin con todos los usuarios ganadores
exports.tablaAdmin = async (req, res) => {
    // Buscar en la colección Codigos todos los documentos donde el estado sea un userId válido (es decir, diferente de 'activo')
    const codigosGanadores = await Codigo.find({ estado: { $ne: 'activo' } }).populate('estado'); // Popular el userId que está en el campo estado
    const ganadores = [];

    // Obtener información de los usuarios que han ganado
    for (let codigo of codigosGanadores) {
        const intento = await Intento.findOne({ codigo: codigo._id }).populate('userId'); // Obtener el intento con los datos del usuario
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
};
