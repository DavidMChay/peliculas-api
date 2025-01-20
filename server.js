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

// RUTAS
// Rutas para peliculas
app.get('/movies', (req, res) => {
    const sql = 'SELECT * FROM movies';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/movies/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM movies WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Película no encontrada' });
        }
        res.json(row);
    });
});

app.post('/movies', (req, res) => {
    const { title, director_id, genre_id, score, rating, release_year } = req.body;
    const sql = `
      INSERT INTO movies (title, director_id, genre_id, score, rating, release_year)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [title, director_id, genre_id, score, rating, release_year], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

app.put('/movies/:id', (req, res) => {
    const id = req.params.id;
    const { title, director_id, genre_id, score, rating, release_year } = req.body;
    const sql = `
      UPDATE movies
      SET title = ?, director_id = ?, genre_id = ?, score = ?, rating = ?, release_year = ?
      WHERE id = ?
    `;
    db.run(sql, [title, director_id, genre_id, score, rating, release_year, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Datos de la película actualizados correctamente' });
    });
});

app.delete('/movies/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM movies WHERE id = ?';
    db.run(sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Película eliminada correctamente' });
    });
});

app.get('/movies/director/:directorId', (req, res) => {
    const directorId = req.params.directorId;
    const sql = `
      SELECT movies.*, directors.name AS director_name
      FROM movies
      INNER JOIN directors ON movies.director_id = directors.id
      WHERE movies.director_id = ?
    `;
    db.all(sql, [directorId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron películas para este director' });
        }
        res.json(rows);
    });
});

app.get('/movies/genre/:genreId', (req, res) => {
    const genreId = req.params.genreId;
    const sql = `
      SELECT movies.*, genres.name AS genre_name
      FROM movies
      INNER JOIN genres ON movies.genre_id = genres.id
      WHERE movies.genre_id = ?
    `;
    db.all(sql, [genreId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron películas para este género' });
        }
        res.json(rows);
    });
});


// Rutas para directores
app.get('/directors', (req, res) => {
    const sql = 'SELECT * FROM directors';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/directors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM directors WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Director no encontrado' });
        }
        res.json(row);
    });
});

app.post('/directors', (req, res) => {
    const { name } = req.body;
    const sql = `
      INSERT INTO directors (name)
      VALUES (?)
    `;
    db.run(sql, [name], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

app.put('/directors/:id', (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    const sql = `
      UPDATE directors
      SET name = ?
      WHERE id = ?
    `;
    db.run(sql, [name, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Datos del director actualizados correctamente' });
    });
});

app.delete('/directors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM directors WHERE id = ?';
    db.run(sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Director eliminado correctamente' });
    });
});

// Rutas para Generos
app.get('/genres', (req, res) => {
    const sql = 'SELECT * FROM genres';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/genres/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM genres WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Genero no encontrado' });
        }
        res.json(row);
    });
});

app.post('/genres', (req, res) => {
    const { name } = req.body;
    const sql = `
      INSERT INTO genres (name)
      VALUES (?)
    `;
    db.run(sql, [name], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

app.put('/genres/:id', (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    const sql = `
      UPDATE genres
      SET name = ?
      WHERE id = ?
    `;
    db.run(sql, [name, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Datos del genero actualizados correctamente' });
    });
});

app.delete('/genres/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM genres WHERE id = ?';
    db.run(sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Genero eliminado correctamente' });
    });
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