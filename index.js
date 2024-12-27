// Importações necessárias
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Inicialização do aplicativo
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Inicialização do banco de dados
const dbPath = path.resolve(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath);

// Criação da tabela de tarefas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            completed INTEGER DEFAULT 0
        )
    `);
});

// Rotas

// Obter todas as tarefas
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows.map(row => ({
            ...row,
            completed: !!row.completed
        })));
    });
});

// Criar uma nova tarefa
app.post('/todos', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'O campo "title" é obrigatório.' });
    }

    const newTodo = {
        id: uuidv4(),
        title,
        description: description || '',
        completed: 0
    };

    db.run(
        'INSERT INTO todos (id, title, description, completed) VALUES (?, ?, ?, ?)',
        [newTodo.id, newTodo.title, newTodo.description, newTodo.completed],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json(newTodo);
        }
    );
});

// Atualizar uma tarefa por ID
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }

        const updatedTodo = {
            ...row,
            title: title !== undefined ? title : row.title,
            description: description !== undefined ? description : row.description,
            completed: completed !== undefined ? (completed ? 1 : 0) : row.completed
        };

        db.run(
            'UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?',
            [updatedTodo.title, updatedTodo.description, updatedTodo.completed, id],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ ...updatedTodo, completed: !!updatedTodo.completed });
            }
        );
    });
});

// Deletar uma tarefa por ID
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }
        res.status(204).send();
    });
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
