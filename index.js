// Importações necessárias
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Inicialização do aplicativo
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Dados em memória (substitua por um banco de dados em produção)
let todos = [];

// Rotas

// Obter todas as tarefas
app.get('/todos', (req, res) => {
    res.json(todos);
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
        completed: false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// Atualizar uma tarefa por ID
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const updatedTodo = {
        ...todos[todoIndex],
        title: title !== undefined ? title : todos[todoIndex].title,
        description: description !== undefined ? description : todos[todoIndex].description,
        completed: completed !== undefined ? completed : todos[todoIndex].completed
    };

    todos[todoIndex] = updatedTodo;
    res.json(updatedTodo);
});

// Deletar uma tarefa por ID
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;

    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    todos.splice(todoIndex, 1);
    res.status(204).send();
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
