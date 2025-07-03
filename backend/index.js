// ----------------- ↓ SETTING UP DEPENDENCIES ↓ ---------------

const express = require("express"); //enables use of Express.js
const cors = require('cors'); //enables cross origin resource sharing
const mongoose = require('mongoose');


// -----------------↓ INITIAL APP CONFIG ↓ -------------------

const port = process.env.PORT || 3000; // uses port number on device to serve backend (where it runs)
const app = express(); //use express.js to power the app
require("dotenv").config(); //allows use of env file


// ------------------ ↓ MIDDLEWARE SETUP ↓ --------------------
app.use(express.json()); //uses express in JSON format
//allow access

const corsOptions = {
    origin: 'https://tasknest-tau.vercel.app/',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentias: true
}

app.use(cors("corsOptions")); //every domain is allowed on this server

// ----------- ↓ DATABASE CONNECTION + APP STARTER ↓ --------------
// ------------------ ↓ APP STARTUP ↓ --------------------
(async () => {
    try {
        mongoose.set("autoIndex", false);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        await Task.syncIndexes();
        console.log("Indexes created");

        app.listen(port, () => {
        console.log('To do App listening on port ${port}');
        });

    } catch (error) {
        console.error("Startup error", error);
        process.exit(1);
    }
})();


const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    dueDate: {type: Date, required: true},
    createdOn: {type: Date, required: true, default: Date.now},
    completed: {type: Boolean, required: true, default: false}
});

//define indexes for performance sorting and optimization
taskSchema.index({ dueDate: 1 });
taskSchema.index({ dateCreated: 1 });

const Task = mongoose.model("Task", taskSchema);



//-------------------TASK ROUTES-------------------


//5 API'S TO SEND DATA BACK TO THE FUNCTIONS IN DASHBOARD.HTML
app.get('/tasks', async (req, res) => {
    try {
        const { sortBy } = req.query; //sort by = dueDate or dateCreated

        let sortOption = {};

        if(sortBy === "dueDate") {
            sortOption = { dueDate: 1 }// Ascending 
        } else if (sortBy === "dateCreated") {
            sortOption = { dateCreated: 1 }
        }

        const tasks = await Task.find({}).sort(sortOption);
        res.json(tasks);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error grabbing tasks!"});
    }
});


//create a new task and add it to the array ---- try/catch good practise but not needed
app.post('/tasks/todo', async (req,res) => {
    try {
        const { title, description, dueDate } = req.body;

        const taskData = { title, description, dueDate };
        const createTask = new Task(taskData);
        const newTask = await createTask.save();
        
        res.json(newTask); 

    } catch (error) {
        console.error("Error:", error);
        es.status(500).json({ message: "Error grabbing tasks!"});
    }
});

//To complete the task and move columns
app.patch('/tasks/complete/:id', async(req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;
        
        const completedTask = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });
        console.log("Help");
        if (!completedTask) {
            return res.status(404).json({ message: "Task not found!"});
        }

        res.json({ task: completedTask, message: "Task set to complete" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "Error setting task to complete!"});
    }
});




//To make the task not complete and move columns
app.patch('/tasks/notComplete/:id', async(req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const taskNotComplete = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });

        if (!taskNotComplete) {
            return res.status(404).json({ message: "Task not found!"});
        }
        
        res.json({ task: taskNotComplete, message: "Task set to not complete" });


    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "Error setting task to not complete!"});
    }
});


//to delete the task
app.delete(`/tasks/delete/:id`, async (req, res) =>{
    try {
        const taskId = req.params.id;
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found"});
        }
        

        res.json({ task: deletedTask, message: "Task deleted sucessfully!" });
    
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "Error setting task to not complete!"});
    }
})


//edit the task
app.put('/tasks/update/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const {title, description, dueDate } = req.body;

        const taskData = {title, description, dueDate};
        const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, { new: true});

        if (!updatedTask){
            return res.status(404).json({message: "Task not found!"});
        }

        res.json({ task: updatedTask, message: "Task updated sucessfully"});

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "Error updating the task!"});
    }
});





//API ROUTES EXAMPLE--------------------

// app.get('/get/example', async (req, res) => {
//     res.send("Hello, this is a message from backend");
// });

// app.post('tasks/now')












