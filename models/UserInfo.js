const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nombre: { type: String, required: true },
    cedula: { type: String, required: true, unique: true },
    ciudad: { type: String, required: true },
    celular: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true }
}, { timestamps: true }); // Timestamps para el seguimiento de creación y actualización

module.exports = mongoose.model('UserInfo', userInfoSchema);
