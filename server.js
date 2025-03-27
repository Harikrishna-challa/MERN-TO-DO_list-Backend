const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// ✅ Allow CORS for frontend (Update with your Vercel URL when deployed)
app.use(cors({ origin: ["http://localhost:3000"] }));
app.use(express.json());

// ✅ MongoDB Connection with Error Handling
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Stop server if MongoDB connection fails
  });

// ✅ To-Do Schema & Model
const todoSchema = new mongoose.Schema({ text: { type: String, required: true } });
const Todo = mongoose.model("Todo", todoSchema);

// ✅ Root Route (Fixes "Cannot GET /" issue)
app.get("/", (req, res) => {
  res.send("🚀 API is running... Welcome to the MERN To-Do List Backend!");
});

// ✅ API Endpoints

// 👉 Get all Todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error("❌ Error fetching todos:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// 👉 Add new Todo
app.post("/api/todos", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const newTodo = new Todo({ text });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("❌ Error adding todo:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// 👉 Delete Todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting todo:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
