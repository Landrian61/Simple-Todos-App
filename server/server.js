/**
 * This is the server file for a simple todos app.
 * It sets up an Express server, connects to a MongoDB database,
 * defines routes for CRUD operations on todos, and listens on a specified port.
 */

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/todo-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes

/**
 * GET /api/todos
 * Fetches all todos from the database.
 * Returns an array of todos as a JSON response.
 * If there is an error, it returns a 500 Internal Server Error response.
 */
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/todos
 * Creates a new todo in the database.
 * Expects a JSON object with a "title" property in the request body.
 * Returns the created todo as a JSON response.
 * If there is an error, it returns a 500 Internal Server Error response.
 */
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    const newTodo = new Todo({ title, completed: false });
    await newTodo.save();
    res.json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/todos/:id
 * Fetches a todo by its ID from the database.
 * Expects the todo ID as a URL parameter.
 * Returns the fetched todo as a JSON response.
 * If there is an error, it returns a 500 Internal Server Error response.
 */
app.get('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received request to fetch todo by ID:', id);
    const todo = await Todo.findById(id);
    console.log('Fetched todo by ID:', todo);
    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * DELETE /api/todos/:id
 * Deletes a todo by its ID from the database.
 * Expects the todo ID as a URL parameter.
 * Returns a success message as a JSON response.
 * If the todo ID is invalid, it returns a 400 Bad Request response.
 * If the todo is not found, it returns a 404 Not Found response.
 * If there is an error, it returns a 500 Internal Server Error response.
 */
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received request to delete todo by ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid todo ID');
      return res.status(400).json({ message: 'Invalid todo ID' });
    }

    const deletedTodo = await Todo.findOneAndDelete({ _id: id });

    if (!deletedTodo) {
      console.log('Todo not found');
      return res.status(404).json({ message: 'Todo not found' });
    }

    console.log('Deleted todo by ID:', id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT /api/todos/:id
 * Updates a todo by its ID in the database.
 * Expects the todo ID as a URL parameter and the updated todo as a JSON object in the request body.
 * Returns the updated todo as a JSON response.
 * If there is an error, it returns a 500 Internal Server Error response.
 */
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndUpdate(id, req.body, { new: true });
    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
