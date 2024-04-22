var todoList = [];
var comdoList = [];
var remList = [];
var addButton = document.getElementById("add-button");
var todoInput = document.getElementById("todo-input");
var deleteAllButton = document.getElementById("delete-all");
var allTodos = document.getElementById("all-todos");
var deleteSButton = document.getElementById("delete-selected");
var currentUser = 'user'; // Default user role, can be 'admin', 'user1', 'user2', 'user3'

// Function to perform authorization check using Cerbos
async function isAuthorized(action) {
    try {
        const response = await fetch('/api/cerbos/decide', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: currentUser,
                resource: 'todo',
                action
            })
        });
        const { allowed } = await response.json();
        return allowed;
    } catch (error) {
        console.error('Error checking authorization:', error);
        return false; // Default to false if there's an error
    }
}

// Event listeners for add and delete buttons
addButton.addEventListener("click", async () => {
    const value = todoInput.value.trim();
    if (value === '') {
        alert("😮 Task cannot be empty");
        return;
    }

    // Check if user is authorized to create a new todo
    const allowed = await isAuthorized('create');
    if (allowed) {
        todoList.push({
            task: value,
            id: Date.now().toString(),
            complete: false,
        });
        todoInput.value = "";
        update();
        addinmain(todoList);
    } else {
        alert('You are not authorized to add a new todo.');
    }
});

deleteAllButton.addEventListener("click", async () => {
    // Check if user is authorized to delete all todos
    const allowed = await isAuthorized('delete');
    if (allowed) {
        todoList = [];
        update();
        addinmain(todoList);
    } else {
        alert('You are not authorized to delete all todos.');
    }
});

deleteSButton.addEventListener("click", async () => {
    // Check if user is authorized to delete completed todos
    const allowed = await isAuthorized('delete');
    if (allowed) {
        todoList = todoList.filter((todo) => !todo.complete);
        update();
        addinmain(todoList);
    } else {
        alert('You are not authorized to delete completed todos.');
    }
});

// Function to update the remaining and completed todo lists
function update() {
    comdoList = todoList.filter((todo) => todo.complete);
    remList = todoList.filter((todo) => !todo.complete);
    document.getElementById("r-count").innerText = remList.length.toString();
    document.getElementById("c-count").innerText = comdoList.length.toString();
}

// Function to render the main todo list
function addinmain(todoList) {
    allTodos.innerHTML = "";
    todoList.forEach((element) => {
        const x = `<li id=${element.id} class="todo-item">
            <p id="task">${element.complete ? `<strike>${element.task}</strike>` : element.task}</p>
            <div class="todo-actions">
                <button class="complete btn btn-success">
                    <i class="ci bx bx-check bx-sm"></i>
                </button>
                <button class="delete btn btn-error">
                    <i class="di bx bx-trash bx-sm"></i>
                </button>
            </div>
        </li>`;
        allTodos.innerHTML += x;
    });
}

// Event listener for complete and delete actions
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('complete') || e.target.classList.contains('ci')) {
        const todoId = e.target.parentElement.parentElement.getAttribute('id');
        // Check if user is authorized to complete a todo
        const allowed = await isAuthorized('edit');
        if (allowed) {
            completeTodoById(todoId);
        } else {
            alert('You are not authorized to complete this todo.');
        }
    }

    if (e.target.classList.contains('delete') || e.target.classList.contains('di')) {
        const todoId = e.target.parentElement.parentElement.getAttribute('id');
        // Check if user is authorized to delete a todo
        const allowed = await isAuthorized('delete');
        if (allowed) {
            deleteTodoById(todoId);
        } else {
            alert('You are not authorized to delete this todo.');
        }
    }
});

// Function to complete a todo by ID
function completeTodoById(todoId) {
    const todo = todoList.find((todo) => todo.id === todoId);
    if (todo) {
        todo.complete = !todo.complete;
        update();
        addinmain(todoList);
    }
}

// Function to delete a todo by ID
function deleteTodoById(todoId) {
    todoList = todoList.filter((todo) => todo.id !== todoId);
    update();
    addinmain(todoList);
}

// Initial update and rendering of todo list
update();
addinmain(todoList);
