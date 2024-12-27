// Importações necessárias
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

// Inicialização do aplicativo
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configuração do Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'todos.db'
});

// Definição do modelo ToDo
const Todo = sequelize.define('Todo', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Sincronização com o banco de dados
sequelize.sync();

// Rotas

// Obter todas as tarefas
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.findAll();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar uma nova tarefa
app.post('/todos', async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'O campo "title" é obrigatório.' });
    }

    try {
        const newTodo = await Todo.create({ title, description });
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar uma tarefa por ID
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    try {
        const todo = await Todo.findByPk(id);
        if (!todo) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }

        todo.title = title !== undefined ? title : todo.title;
        todo.description = description !== undefined ? description : todo.description;
        todo.completed = completed !== undefined ? completed : todo.completed;
        await todo.save();

        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar uma tarefa por ID
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await Todo.findByPk(id);
        if (!todo) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }

        await todo.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
