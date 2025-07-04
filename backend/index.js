const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const corsOptions = {
  origin: 'https://tasknest-tau.vercel.app',
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
};
app.use(cors(corsOptions));

// ----------- MONGOOSE MODELS -----------

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  createdOn: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }
});
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdOn: 1 });

const Task = mongoose.model("Task", taskSchema);

// ----------- START APP -----------

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await Task.syncIndexes();
    console.log("Indexes created");

    app.listen(port, () => {
      console.log(`To do App listening on port ${port}`);
    });
  } catch (error) {
    console.error("Startup error", error);
    process.exit(1);
  }
})();

// ----------- ROUTES -----------

app.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
  
      // Optionally create session/token here
  
      res.status(200).json({ message: "Login successful!" });
  
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error. Try again later." });
    }
  });
  

// ... task routes below ...



//API ROUTES EXAMPLE--------------------

// app.get('/get/example', async (req, res) => {
//     res.send("Hello, this is a message from backend");
// });

// app.post('tasks/now')












