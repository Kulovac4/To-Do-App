const toDoList = document.getElementById("toDoList");
const completedList = document.getElementById("completedList");
const url = "https://tasknest-da3h.onrender.com";

//-----------------------get tasks--this is how their displayed on our HTML
async function displayTasks() {
    try {

        const sortSelect = document.getElementById("sortSelect");
        const sortBy = sortSelect.value; //due date, date created or default

        let query = "";
        if (sortBy !== "default") {
            query = `?sortBy=${sortBy}`;
        }

        const response = await fetch(`${url}/tasks${query}`);
        const data = await response.json();

        //task is coming from
    function formatTask(task) {
        const li = document.createElement("li");
        li.classList.add("p-3", "mt-2", "shadow-sm", "card");
        li.innerHTML = task.completed ?
        //how are we displaying the completed tasks?
        `
    <div class="d-flex justify-content-between align-items-start">
            <h4 class="col-11 text-decoration-line-through opacity-50">${task.title}</h4>
            <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
        </div>
        <p class="text-decoration-line-through opacity-50">${task.description}</p>
        <p class="text-decoration-line-through opacity-50"><strong>Due: </strong>${new Date(task.dueDate).toLocaleDateString()}</p>
        <div class="d-flex justify-content-between align-items-end">
            <div>
                <button data-id="${task._id}" type="button" class="btn btn-dark shadow-sm notDone">Not done</button>
        </div>
        <p class="m-0 text-decoration-line-through opacity-50"><strong>Created on:</strong>${new Date(task.createdOn).toLocaleDateString()}</p>
        </div>
    `
    :
    //how are we displaying the tasks that aren't completed yet?
    `
    <div class="d-flex justify-content-between align-items-start">
    <h4 class="col-11">${task.title}</h4>
    <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
    </div>
    <p>${task.description}</p>
    <p><strong>Due: </strong>${new Date(task.dueDate).toLocaleDateString()}</p>
    <div class="d-flex justify-content-between align-items-end">
        <div>
            <button data-id="${task._id}" data-title="${task.title}" data-description="${task.description}" data-due-date="${task.dueDate}" data-bs-toggle="modal" data-bs-target="#editTaskWindow" class="btn btn-dark shadow-sm edit" type="button">Edit</button>
            <button data-id="${task._id}" type="button" class="btn btn-dark shadow-sm done">Done</button>
    </div>
    <p class="m-0"><strong>Created on:</strong>${new Date(task.createdOn).toLocaleDateString()}</p>
    </div>
    `;
    return li; //jump out the function
    }

    toDoList.innerHTML = ""; //refresh the list
    completedList.innerHTML = "";

    const tasks = data;

    tasks.forEach(task => {
        task.completed ? completedList.appendChild(formatTask(task)) : toDoList.appendChild(formatTask(task))
    }); // filters is task is complete or not

    resetForm();

    
    
    } catch (error) {
        console.error("Error:", error);
    }
}


window.addEventListener("DOMContentLoaded", () => {
    displayTasks();
})

async function createNewTask() {
    try {
        const taskDetails = {
            title: document.getElementById("taskName").value.trim(),
            description: document.getElementById("taskDescription").value.trim(),
            dueDate: document.getElementById("dueDate").value.trim(),
        }

        if(!taskDetails.title || !taskDetails.description || !taskDetails.dueDate) {
            return alert("All fields required!");
        }

        const response = await fetch (`${url}/tasks/todo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to create task!: ${response.statusText}`)
        }

        const data = await response.json();

        console.log("New task created", data);

        displayTasks();
        
    } catch (error) {
        console.error("Error", error);
    }
}

const taskForm = document.getElementById("taskForm");
const editTaskForm = document.getElementById("editTaskForm");

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createNewTask();
});

function resetForm() {
taskForm.reset();
}



//to complete a task
toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("done")) {
        const taskId = event.target.getAttribute("data-id");
        completeTask(taskId);
    }
    //check what class its assigned to and run the event "not done or done takes it to complete or not complete"
});

//----------to NOT Complete a task---------
completedList.addEventListener("click", (event) => {
    if (event.target.classList.contains("notDone")) {
        const taskId = event.target.getAttribute("data-id");
        taskNotCompleted(taskId);
    }
});

//-----------trigger deleting a task----------

[toDoList, completedList].forEach(list => {
    list.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete")) {
            const taskId = event.target.getAttribute("data-id");
            deleteTask(taskId);
        }
    });
});   //arrays ->for each list->Do


//editing the task
toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit")) {
        const taskId = event.target.getAttribute("data-id");
        const taskTitle = event.target.getAttribute("data-title");
        const taskDescription = event.target.getAttribute("data-description");
        const taskDueDate = new Date(event.target.getAttribute("data-due-data"));
       
        const editTaskName = document.getElementById("editTaskName");
        const editTaskDescription = document.getElementById("editTaskDescription");
        const editDueDate = document.getElementById("editDueDate");
        const saveChangesButton = document.getElementById("saveChangesButton");

        editTaskName.value = taskTitle;
        editTaskDescription.value = taskDescription;
        
        //convert date format to standard look
        const formattedDueDate = taskDueDate.toISOString().split("T")[0];
       
        editDueDate.value = formattedDueDate;

        saveChangesButton.addEventListener("click", async () => {
           await editTask(taskId);

           const editTaskModal = bootstrap.Modal.getInstance(document.getElementById("editTaskWindow"));
           editTaskModal.hide();
        }, { once: true });
       
        
    }
});

//GENERAL EVENT LISTENERS

const sortButton = document.getElementById("sortSelect");

window.addEventListener("DOMContentLoaded", () => {
    sortButton.value = "default";
});

sortButton.addEventListener("change", () => {
    displayTasks();
});

window.addEventListener("DOMContentLoaded", () => {
    displayTasks();
})


//----------Complete Task---------------
async function completeTask(taskId) {
    try {
        const response = await fetch(`${url}/tasks/complete/${taskId}`,{
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ completed: true })
        });

        if (!response.ok) {
            throw new Error(`Failed to complete the task: ${response.status}`);
        }
      
        const data = await response.json();

        console.log("Task completed", data);

        displayTasks();
    } catch (error) {
        console.error("Error:", error);
    }
}



//---------------to NOT complete a task--------------
async function taskNotCompleted(taskId) {
    try {
        const response = await fetch(`${url}/tasks/notComplete/${taskId}`,{
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ completed: false })
        });

        if (!response.ok) {
            throw new Error(`Failed to set the task to Not Complete: ${response.status}`);
        }
      
        const data = await response.json();
        console.log("Task set to not complete", data);
        displayTasks();
    } catch (error) {
        console.error("Error:", error);
    }
}

//--------------deleting a task
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${url}/tasks/delete/${taskId}`, {
            method: 'DELETE',
            headers: {
                "Contenet-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to set the task to Not Complete: ${response.status}`);
        }

            const data = await response.json();
            console.log("Task deleted, data");
            displayTasks();

    } catch (error) {
        console.error("Error:", error);
        
    }
}



//enables editing of the task
async function editTask(taskId) {

    const updatedTitle = editTaskName.value;
    const updatedDescription = editTaskDescription.value;
    const updatedDueDate = editDueDate.value;
    
    const updatedDetails = {
        title: updatedTitle,
        description: updatedDescription,
        dueDate: updatedDueDate
    }

    try {
        const response = await fetch(`${url}/tasks/update/${taskId}`,{
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to edit task: ${response.status}`);
        }

        const data = await response.json();
        console.log("Edited task:", data);
        displayTasks();

    } catch (error) {
        console.error("Error", error);
    }

}









//mental bridge to remember use async when dealing with external data or network calls, but keep synchronous functions for lightweight operations that don’t require waiting.
//always declate variables - response and data
// API EXAMPLE

// async function getExample() {
//     const response = await fetch('http://localhost:3000/get/example'); //throw the ball to fetch host and send to below code and revert to text
//     const data = await response.text();////fetch from http://localhost:3000/get/example
//     window.alert(data);
// }

// getExample();






































async function getExample() {
    const response = await fetch('http.//localhost:3000/get/example');
    const data = await response.text();

    window.alert(data);
}