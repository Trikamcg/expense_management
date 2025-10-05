const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/expenseManagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
});
const User = mongoose.model('User', userSchema);

// Expense schema (matches your frontend and summary logic)
const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  amount: Number,
  category: String,
  date: String, // Treat as ISO string for now, matches frontend
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});
const Expense = mongoose.model('Expense', expenseSchema);

// Signup Route
app.post('/signup', async (req, res) => {
  console.log('Signup called:', req.body);
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing username, email, or password' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, passwordHash });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Username or email already exists' });
  }
});

// Login Route (returns userId)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }
  res.status(200).json({
    message: 'Login successful',
    username: user.username,
    role: user.role,
    userId: user._id // <--- This is required for frontend
  });
});

// Add Expense
app.post('/expenses', async (req, res) => {
  const { userId, title, amount, category, date } = req.body;
  if (!userId || !title || !amount || !category || !date) {
    return res.status(400).json({ error: 'Missing userId, title, amount, category, or date' });
  }
  try {
    const newExpense = new Expense({
      userId,
      title,
      amount,
      category,
      date,
      // Default status is "Pending"
    });
    await newExpense.save();
    res.status(201).json({ message: 'Expense created', expense: newExpense });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Get All Expenses
app.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
