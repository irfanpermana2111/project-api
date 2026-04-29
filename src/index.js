require('dotenv').config();
const express = require('express');
const cors = require('cors');

const provinsiRoute = require('./routes/provinsiRoute');
const kabkoRoute = require('./routes/kabkoRoute');
const pesertaRoute = require('./routes/pesertaRoute');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/provinsi', provinsiRoute);
app.use('/kabko', kabkoRoute);
app.use('/peserta', pesertaRoute);

app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Sistem Manajemen Peserta' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
