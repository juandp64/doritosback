const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nombre: String,
    cedula: String,
    ciudad: String,
    celular: String,
    fechaNacimiento: Date
});

module.exports = mongoose.model('UserInfo', userInfoSchema);
