import cerbos from "./cerbos-client.js";
import grpc from "@cerbos/grpc";
import { Cerbos } from "./cerbos-client.js";
var todoList = [];
var comdoList = [];
var remList = [];
var addButton = document.getElementById("add-button");
var todoInput = document.getElementById("todo-input");
var deleteAllButton = document.getElementById("delete-all");
var allTodos = document.getElementById("all-todos");
var deleteSButton = document.getElementById("delete-selected");
console.log("Add button:", addButton);
console.log("Todo input:", todoInput);
console.log("Delete all button:", deleteAllButton);
console.log("All todos container:", allTodos);
console.log("Delete selected button:", deleteSButton);
//event listners for add and delete
addButton.addEventListener("click", () => {
  console.log("Add button clicked");
  add();
});
deleteAllButton.addEventListener("click", () => {
  console.log("Delete all button clicked");
  deleteAll();
});
deleteSButton.addEventListener("click", () => {
  console.log("Delete selected button clicked");
  deleteS();
});

//event listeners for filtersk
document.addEventListener("click", (e) => {
  if (
    e.target.className.split(" ")[0] == "complete" ||
    e.target.className.split(" ")[0] == "ci"
  ) {
    completeTodo(e);
  }
  if (
    e.target.className.split(" ")[0] == "delete" ||
    e.target.className.split(" ")[0] == "di"
  ) {
    deleteTodo(e);
  }
  if (e.target.id == "all") {
    viewAll();
  }
  if (e.target.id == "rem") {
    viewRemaining();
  }
  if (e.target.id == "com") {
    viewCompleted();
  }
});
//event listner for enter key
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    add();
  }
});
async function isAllowed(userId, role, action) {
  console.log(
    `Checking permissions for userId: ${userId}, role: ${role}, action: ${action}`
  );

  // Construct the principal and resource according to your application's needs
  try {
    const result = await cerbos.isAllowed({
      principal: {
        id: userId, // Unique identifier for the user
        roles: [role], // Roles as an array
        attr: {}, // Any other attributes you want to pass
      },
      resource: "todo",
      action: [action], // The action being checked, e.g., "edit"
    });

    // Cerbos returns an object with the decision, we need to extract it
    return result.isAllowed(action); // This will be true or false
  } catch (error) {
    console.error("Error checking permissions with Cerbos:", error);
    return false; // Assume no permission in case of error
  }
}
//updates the all the remaining, completed and main list
function update() {
  comdoList = todoList.filter((ele) => {
    return ele.complete;
  });
  remList = todoList.filter((ele) => {
    return !ele.complete;
  });
  document.getElementById("r-count").innerText = todoList.length.toString();
  document.getElementById("c-count").innerText = comdoList.length.toString();
}

//adds the task in main list
function add() {
  var value = todoInput.value;
  console.log("Attempting to add todo with value:", value);
  if (value === "") {
    console.log("Prevented adding empty todo");
    alert("😮 Task cannot be empty");
    return;
  }
  todoList.push({
    task: value,
    id: Date.now().toString(),
    complete: false,
  });
  console.log("Todo added:", todoList);
  todoInput.value = "";
  update();
  addinmain(todoList);
}

//renders the main list and views on the main content

function addinmain(todoList) {
  allTodos.innerHTML = "";
  todoList.forEach((element) => {
    var x = `<li id=${element.id} class="todo-item">
    <p id="task-text-${element.id}"> ${
      element.complete ? `<strike>${element.task}</strike>` : element.task
    } </p>
    <input type="text" id="edit-input-${
      element.id
    }" class="edit-input" value="${element.task}" style="display: none;">
    <div class="todo-actions">
        <button class="complete btn btn-success">
            <i class="ci bx bx-check bx-sm"></i>
        </button>
        <button class="edit btn btn-primary" onclick="editTodo('${
          element.id
        }')">
            <i class="ei bx bx-edit bx-sm"></i>
        </button>
        <button class="delete btn btn-error">
            <i class="di bx bx-trash bx-sm"></i>
        </button>
    </div>
    </li>`;
    allTodos.innerHTML += x;
  });
}
window.editTodo = function (itemId) {
  var selectedUser = document.getElementById("user-select").value;
  console.log("Selected User Role:", selectedUser);
  console.log("Checking permission to edit");

  isAllowed(selectedUser, selectedUser, "edit")
    .then((isAllowed) => {
      console.log("Permission to edit:", isAllowed);
      if (!isAllowed) {
        alert("Unauthorized action. Only admins can edit todos.");
        return;
      }
      var taskTextElement = document.getElementById(`task-text-${itemId}`);
      var editInputElement = document.getElementById(`edit-input-${itemId}`);
      console.log("Editing todo:", itemId);

      if (editInputElement.style.display === "none") {
        taskTextElement.style.display = "none";
        editInputElement.style.display = "block";
        editInputElement.focus();
      } else {
        taskTextElement.innerText = editInputElement.value;
        taskTextElement.style.display = "block";
        editInputElement.style.display = "none";
        // Update the task in the array
        todoList = todoList.map((ele) => {
          if (ele.id === itemId) {
            return { ...ele, task: editInputElement.value };
          }
          return ele;
        });
        update();
      }
    })
    .catch((error) => {
      console.error("Error checking permissions:", error);
    });
};

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (e) {
    if (e.target.closest(".edit")) {
      const itemId = e.target.closest("li.todo-item").id;
      editTodo(itemId);
    }
  });
});

//deletes and indiviual task and update all the list
function deleteTodo(e) {
  var deleted = e.target.parentElement.parentElement.getAttribute("id");
  todoList = todoList.filter((ele) => {
    return ele.id != deleted;
  });

  update();
  addinmain(todoList);
}

//completes indiviaula task and updates all the list
function completeTodo(e) {
  var completed = e.target.parentElement.parentElement.getAttribute("id");
  todoList.forEach((obj) => {
    if (obj.id == completed) {
      if (obj.complete == false) {
        obj.complete = true;
        e.target.parentElement.parentElement
          .querySelector("#task")
          .classList.add("line");
      } else {
        obj.complete = false;

        e.target.parentElement.parentElement
          .querySelector("#task")
          .classList.remove("line");
      }
    }
  });

  update();
  addinmain(todoList);
}

//deletes all the tasks
function deleteAll(todo) {
  todoList = [];

  update();
  addinmain(todoList);
}

//deletes only completed task
function deleteS(todo) {
  todoList = todoList.filter((ele) => {
    return !ele.complete;
  });

  update();
  addinmain(todoList);
}

// functions for filters
function viewCompleted() {
  addinmain(comdoList);
}

function viewRemaining() {
  addinmain(remList);
}
function viewAll() {
  addinmain(todoList);
}
