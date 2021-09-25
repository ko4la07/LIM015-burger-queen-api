const mongoose = require('mongoose');
const config = require('./config');

const { dbUrl } = config;

// Conexión a la Base de Datos (MongoDB o MySQL)
// console.log(dbUrl);
const URL = dbUrl;

mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: true,
    // useCreateIndex: true,
  })
  // .then(() => console.log('db is conected'))
  .catch(console.error);

// const connection = mongoose.connection;
const { connection } = mongoose;

connection.once('open', () => {
  // console.log('DB is connected');
});
