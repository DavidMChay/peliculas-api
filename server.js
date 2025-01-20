const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('./database/peliculas.db', (err) => {
  if (err) {
    console.error('Error al intentar conectar a la base de datos:', err.message);
  } else {
    console.log('Se ha extablecido la conexion a la base de datos de forma exitosa.');
  }
});

// Crear tablas si no existen
db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS directors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `);
  
    db.run(`
      CREATE TABLE IF NOT EXISTS genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `);
  
    db.run(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        director_id INTEGER REFERENCES directors (id),
        genre_id INTEGER REFERENCES genres (id),
        score REAL,
        rating TEXT,
        release_year INTEGER
      )
    `);
  });


  
  // Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Atencion: Ha habido un error en el servidor!' });
  });
  
  // Iniciar el servidor
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });