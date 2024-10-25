const mongoose = require('mongoose');
require('dotenv').config();

const Codigo = require('./models/Codigo'); // Asegúrate de ajustar la ruta si es diferente

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

async function vaciarEstados() {
    try {
        // Actualizar el estado a 'activo' en todos los documentos
        await Codigo.updateMany({}, { $set: { estado: 'activo' } });
        console.log('Todos los estados han sido actualizados a "activo".');
    } catch (error) {
        console.error('Error al actualizar los estados:', error);
    } finally {
        mongoose.connection.close(); // Cerrar la conexión una vez terminado
    }
}

vaciarEstados();
