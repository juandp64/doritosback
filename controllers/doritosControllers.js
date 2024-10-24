const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserInfo = require('../models/UserInfo');
const Codigo = require('../models/Codigo');
const Intento = require('../models/Intento');
require('dotenv').config();

exports.login = async (req, res) => {
    const { email, pass } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ userId: user._id, rol: user.rol }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
};

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

exports.newAdmin = async (req, res) => {
    const { email, pass } = req.body;
    const hashedPass = await bcrypt.hash(pass, 10);
    
    const newAdmin = new User({ email, pass: hashedPass, rol: 'admin' });
    await newAdmin.save();

    res.json({ message: 'Admin creado exitosamente' });
};

exports.registrarCodigo = async (req, res) => {
    const { userId, codigo } = req.body;
    const codigoValido = await Codigo.findOne({ codigo, estado: 'activo' });

    if (!codigoValido) {
        return res.json({ message: 'No Ganaste' });
    }

    codigoValido.estado = 'reclamado';
    await codigoValido.save();

    const nuevoIntento = new Intento({ userId, codigo, fecha: new Date() });
    await nuevoIntento.save();

    res.json({ message: `Ganaste: ${codigoValido.premio}` });
};

exports.tablaUser = async (req, res) => {
    const { userId } = req.params;
    const intentos = await Intento.find({ userId }).populate('codigo');
    res.json(intentos);
};

exports.tablaAdmin = async (req, res) => {
    const intentos = await Intento.find().populate('userId').populate('codigo');
    res.json(intentos);
};
