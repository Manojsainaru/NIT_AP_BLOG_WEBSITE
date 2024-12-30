// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import models
const Post = require('./models/Post');
const User = require('./models/User');

const app = express();

// Configuration
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // Number of bcrypt salt rounds

// Frontend URL (Update this in the .env file)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware setup
app.use(cors({ credentials: true, origin: FRONTEND_URL }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Database connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Routes

// Register a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json('Username already exists');

  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
  try {
    const newUser = await User.create({ username, password: hashedPassword });
    res.json(newUser);
  } catch (err) {
    res.status(400).json('Error registering user');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json('Invalid username');

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) return res.status(400).json('Invalid password');

  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true }).json(user);
});

// Logout
app.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true }).json('Logged out');
});

// Get user profile
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json('Unauthorized');
    const user = await User.findById(decoded.id);
    res.json(user);
  });
});

// Create a new post
app.post('/post', upload.single('cover'), (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json('Unauthorized');

    const { title, summary, content } = req.body;
    const cover = req.file ? `/uploads/${req.file.filename}` : '';

    try {
      const post = await Post.create({
        title,
        summary,
        content,
        cover,
        author: decoded.id,
      });
      res.json(post);
    } catch (error) {
      res.status(500).json('Error creating post');
    }
  });
});

// Update a post
app.put('/post/:id', upload.single('cover'), (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json('Unauthorized');

    const { id } = req.params;
    const { title, summary, content } = req.body;
    const cover = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json('Post not found');
      if (post.author.toString() !== decoded.id) return res.status(403).json('Not authorized');

      post.title = title || post.title;
      post.summary = summary || post.summary;
      post.content = content || post.content;
      if (cover) post.cover = cover;

      const updatedPost = await post.save();
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json('Error updating post');
    }
  });
});

// Get all posts
app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json('Error fetching posts');
  }
});

// Get a single post
app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id).populate('author', 'username');
    if (!post) return res.status(404).json('Post not found');
    res.json(post);
  } catch (error) {
    res.status(500).json('Error fetching post');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
