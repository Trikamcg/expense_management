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

// Connect to MongoDB (replace with your URI)
mongoose.connect('mongodb://localhost:27017/expenseManagement', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' }
});

const User = mongoose.model('User', userSchema);

// Expense Schema
const expenseSchema = new mongoose.Schema({
  user: String, // username
  desc: String,
  amount: Number,
  category: String,
  date: Date,
  status: String
});

const Expense = mongoose.model('Expense', expenseSchema);

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const newUser = new User({ username, passwordHash });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) return res.status(401).json({ error: 'Invalid credentials' });
  
  // Create JWT Token (for simplicity, no expiration)
  const token = jwt.sign({ username: user.username, role: user.role }, 'secretkey');
  res.json({ token, username: user.username, role: user.role });
});

// Middleware to verify JWT token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token missing' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded; // Attach user info
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid' });
  }
}

// Expense CRUD endpoints (protected)
app.post('/expenses', authMiddleware, async (req, res) => {
  const { desc, amount, category, date } = req.body;
  const expense = new Expense({
    user: req.user.username,
    desc,
    amount,
    category,
    date: new Date(date),
    status: req.user.role === 'employee' ? 'Pending' : 'Approved'
  });
  await expense.save();
  res.status(201).json(expense);
});

app.get('/expenses', authMiddleware, async (req, res) => {
  if (req.user.role === 'employee') {
    const expenses = await Expense.find({ user: req.user.username });
    res.json(expenses);
  } else {
    const expenses = await Expense.find();
    res.json(expenses);
  }
});

app.put('/expenses/:id', authMiddleware, async (req, res) => {
  if (!['manager', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const { status } = req.body;
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  expense.status = status;
  await expense.save();
  res.json(expense);
});

// Listening
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
