// Variables de entorno (que por def son variables de conf global)
exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/test'; // cadena de conexion
exports.secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';
exports.adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost.com';
exports.adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234';
