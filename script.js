// HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dueDateInput = document.getElementById("dueDateInput");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const filterButtons = document.querySelectorAll(".filter-button");
const clearCompletedButton = document.getElementById("clearCompleted");
const emptyMessage = document.getElementById("emptyMessage");

// Load saved tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update dashboard statistics
function updateStatistics() {
    const completed = tasks.filter(task => task.completed).length;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = tasks.length - completed;
}

// Display tasks
function displayTasks() {

    taskList.innerHTML = "";

    updateStatistics();

    let filteredTasks = tasks.filter(task => {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchInput.value.toLowerCase().trim());

        return matchesFilter && matchesSearch;
    });

    // Sort tasks
    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    };

    if (sortSelect.value === "priority") {
        filteredTasks.sort((a, b) =>
            priorityOrder[a.priority || "Medium"] -
            priorityOrder[b.priority || "Medium"]
        );
    }

    if (sortSelect.value === "dueDate") {
        filteredTasks.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
        });
    }

    if (sortSelect.value === "newest") {
        filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (sortSelect.value === "oldest") {
        filteredTasks.sort((a, b) => a.createdAt - b.createdAt);
    }

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    // Create task elements
    filteredTasks.forEach(task => {

        const li = document.createElement("li");
        li.className = "task-item";

        const left = document.createElement("div");
        left.className = "task-left";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.text;

        if (task.completed) {
            title.classList.add("completed");
        }

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        const taskPriority = task.priority || "Medium";

        priority.textContent = taskPriority + " Priority";
        priority.className = "priority " + taskPriority;

        const date = document.createElement("span");

        if (task.dueDate) {
            const due = new Date(task.dueDate + "T00:00:00");
            date.textContent = "Due: " + due.toLocaleDateString();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (due < today && !task.completed) {
                date.classList.add("overdue");
                date.textContent += " (Overdue)";
            }
        } else {
            date.textContent = "No due date";
        }

        meta.appendChild(priority);
        meta.appendChild(date);

        details.appendChild(title);
        details.appendChild(meta);

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });

        left.appendChild(checkbox);
        left.appendChild(details);

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        editButton.addEventListener("click", () => {

            const newText = prompt("Edit task name:", task.text);

            if (newText === null || newText.trim() === "") {
                return;
            }

            const newPriority = prompt(
                "Enter priority: High, Medium or Low",
                task.priority || "Medium"
            );

            if (newPriority === null) return;

            const normalizedPriority =
                newPriority.trim().toLowerCase();

            const priorityMap = {
                high: "High",
                medium: "Medium",
                low: "Low"
            };

            if (!priorityMap[normalizedPriority]) {
                alert("Please enter High, Medium or Low.");
                return;
            }

            const newDate = prompt(
                "Enter due date (YYYY-MM-DD), or leave blank:",
                task.dueDate || ""
            );

            if (newDate === null) return;

            if (newDate.trim() !== "" &&
                !/^\d{4}-\d{2}-\d{2}$/.test(newDate.trim())) {
                alert("Please enter the date in YYYY-MM-DD format.");
                return;
            }

            task.text = newText.trim();
            task.priority = priorityMap[normalizedPriority];
            task.dueDate = newDate.trim();

            saveTasks();
            displayTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {

            const confirmed = confirm(
                "Are you sure you want to delete this task?"
            );

            if (!confirmed) return;

            tasks = tasks.filter(item => item !== task);

            saveTasks();
            displayTasks();
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        li.appendChild(left);
        li.appendChild(actions);

        taskList.appendChild(li);
    });
}

// Add task
taskForm.addEventListener("submit", event => {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    const newTask = {
        id: Date.now() + Math.random(),
        text: text,
        completed: false,
        priority: priorityInput.value,
        dueDate: dueDateInput.value,
        createdAt: Date.now()
    };

    tasks.push(newTask);

    saveTasks();

    taskForm.reset();
    priorityInput.value = "Medium";

    displayTasks();
});

// Filter tasks
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(item =>
            item.classList.remove("active")
        );

        button.classList.add("active");

        displayTasks();
    });
});

// Search tasks
searchInput.addEventListener("input", displayTasks);

// Sort tasks
sortSelect.addEventListener("change", displayTasks);

// Clear completed tasks
clearCompletedButton.addEventListener("click", () => {

    const completedCount =
        tasks.filter(task => task.completed).length;

    if (completedCount === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmed = confirm(
        "Delete all completed tasks?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    displayTasks();
});

// Initial display
displayTasks();