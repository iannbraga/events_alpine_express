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
    storage: 'events.db'
});

// Definição do modelo Event
const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: ''
    }
});

// Sincronização com o banco de dados
sequelize.sync();

// Rotas

// Obter todos os eventos
app.get('/events', async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar um novo evento
app.post('/events', async (req, res) => {
    const { name, date, location, description } = req.body;
    if (!name || !date) {
        return res.status(400).json({ error: 'Os campos "name" e "date" são obrigatórios.' });
    }

    try {
        const newEvent = await Event.create({ name, date, location, description });
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar um evento por ID
app.put('/events/:id', async (req, res) => {
    const { id } = req.params;
    const { name, date, location, description } = req.body;

    try {
        const event = await Event.findByPk(id);
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }

        event.name = name !== undefined ? name : event.name;
        event.date = date !== undefined ? date : event.date;
        event.location = location !== undefined ? location : event.location;
        event.description = description !== undefined ? description : event.description;
        await event.save();

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar um evento por ID
app.delete('/events/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findByPk(id);
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }

        await event.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
