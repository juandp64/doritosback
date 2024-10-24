const express = require('express');
const mongoose = require('mongoose');
const doritosRoutes = require('./routes/doritosRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api', doritosRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
