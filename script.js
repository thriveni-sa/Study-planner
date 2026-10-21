let tasks = JSON.parse(localStorage.getItem("studyPlannerTasks")) || [];
let schedules = JSON.parse(localStorage.getItem("studyPlannerSchedules")) || [];
let studyHours = JSON.parse(localStorage.getItem("studyPlannerHours")) || {};


/* =========================
   DATE FUNCTIONS
========================= */

function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "No due date";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


/* =========================
   SAVE DATA
========================= */

function saveData() {

    localStorage.setItem(
        "studyPlannerTasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "studyPlannerSchedules",
        JSON.stringify(schedules)
    );

    localStorage.setItem(
        "studyPlannerHours",
        JSON.stringify(studyHours)
    );
}


/* =========================
   NAVIGATION
========================= */

function showSection(sectionName) {

    const sections = [
        "dashboard",
        "tasks",
        "schedule",
        "progress",
        "settings"
    ];

    sections.forEach(function(section) {

        const element = document.getElementById(section);

        if (element) {
            element.style.display = "none";
        }
    });

    const selected = document.getElementById(sectionName);

    if (selected) {
        selected.style.display = "block";
    }

    updateEverything();
}


/* =========================
   ADD TASK
========================= */

function addTask() {

    const input = document.getElementById("taskInput");
    const priority = document.getElementById("priority");
    const dueDate = document.getElementById("dueDate");

    const taskName = input.value.trim();

    if (taskName === "") {
        alert("Please enter a task.");
        return;
    }

    const task = {

        id: Date.now(),

        name: taskName,

        priority: priority.value,

        dueDate: dueDate.value,

        completed: false,

        createdDate: getToday()
    };

    tasks.push(task);

    saveData();

    input.value = "";
    dueDate.value = "";

    updateEverything();
}


/* =========================
   DUE STATUS
========================= */

function getDueStatus(task) {

    if (!task.dueDate) {

        return {
            text: "No Date",
            className: "no-date"
        };
    }

    const today = getToday();

    if (task.completed) {

        return {
            text: "Completed",
            className: "upcoming"
        };
    }

    if (task.dueDate < today) {

        return {
            text: "🔴 Overdue",
            className: "overdue"
        };
    }

    if (task.dueDate === today) {

        return {
            text: "🟡 Due Today",
            className: "due-today"
        };
    }

    return {
        text: "🟢 Upcoming",
        className: "upcoming"
    };
}


/* =========================
   DISPLAY TASKS
========================= */

function displayTasks(taskArray = tasks) {

    const taskList = document.getElementById("taskList");

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    if (taskArray.length === 0) {

        taskList.innerHTML = "<p>No tasks found.</p>";

        return;
    }

    taskArray.forEach(function(task) {

        const index = tasks.indexOf(task);

        const div = document.createElement("div");

        div.className = "task";

        const priorityClass =
            task.priority.toLowerCase();

        const status = getDueStatus(task);

        div.innerHTML = `

            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
                onchange="completeTask(${index})"
            >

            <span class="task-name
                ${task.completed ? "completed" : ""}">
                ${escapeHTML(task.name)}
            </span>

            <span class="priority ${priorityClass}">
                ${task.priority}
            </span>

            <span>
                📅 ${formatDate(task.dueDate)}
            </span>

            <span class="due-status ${status.className}">
                ${status.text}
            </span>

            <button
                class="edit"
                onclick="editTask(${index})">
                ✏️
            </button>

            <button
                class="delete"
                onclick="deleteTask(${index})">
                🗑️
            </button>
        `;

        taskList.appendChild(div);
    });
}


/* =========================
   COMPLETE TASK
========================= */

function completeTask(index) {

    if (!tasks[index]) {
        return;
    }

    tasks[index].completed =
        !tasks[index].completed;

    saveData();

    updateEverything();
}


/* =========================
   EDIT TASK
========================= */

function editTask(index) {

    const task = tasks[index];

    if (!task) {
        return;
    }

    const newName = prompt(
        "Edit task name:",
        task.name
    );

    if (
        newName === null ||
        newName.trim() === ""
    ) {
        return;
    }

    const newPriority = prompt(
        "Priority: Low / Medium / High",
        task.priority
    );

    const newDate = prompt(
        "Due date (YYYY-MM-DD):",
        task.dueDate || ""
    );

    task.name = newName.trim();

    if (
        newPriority === "Low" ||
        newPriority === "Medium" ||
        newPriority === "High"
    ) {
        task.priority = newPriority;
    }

    if (newDate !== null) {
        task.dueDate = newDate;
    }

    saveData();

    updateEverything();
}


/* =========================
   DELETE TASK
========================= */

function deleteTask(index) {

    if (!tasks[index]) {
        return;
    }

    if (!confirm("Delete this task?")) {
        return;
    }

    tasks.splice(index, 1);

    saveData();

    updateEverything();
}


/* =========================
   FILTER TASKS
========================= */

function filterTasks(type) {

    const today = getToday();

    let filtered = tasks;

    if (type === "pending") {

        filtered = tasks.filter(function(task) {
            return !task.completed;
        });
    }

    if (type === "completed") {

        filtered = tasks.filter(function(task) {
            return task.completed;
        });
    }

    if (type === "overdue") {

        filtered = tasks.filter(function(task) {

            return (
                !task.completed &&
                task.dueDate &&
                task.dueDate < today
            );
        });
    }

    if (type === "today") {

        filtered = tasks.filter(function(task) {

            return task.dueDate === today;
        });
    }

    if (type === "upcoming") {

        filtered = tasks.filter(function(task) {

            return (
                !task.completed &&
                task.dueDate &&
                task.dueDate > today
            );
        });
    }

    displayTasks(filtered);
}


/* =========================
   SAVE STUDY HOURS
========================= */

function saveStudyHours() {

    const input =
        document.getElementById("studyHoursInput");

    if (!input) {
        return;
    }

    const value = Number(input.value);

    if (
        input.value === "" ||
        isNaN(value) ||
        value < 0
    ) {

        alert("Please enter valid study hours.");

        return;
    }

    const today = getToday();

    studyHours[today] = value;

    saveData();

    input.value = "";

    updateEverything();

    alert("Study hours saved! ✅");
}


/* =========================
   GET TODAY HOURS
========================= */

function getTodayHours() {

    const today = getToday();

    return Number(
        studyHours[today] || 0
    );
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    /*
       IMPORTANT FIX:

       Dashboard now uses ALL tasks
       instead of only today's tasks.

       Example:

       3 total tasks
       1 completed

       Progress = 33%
    */

    const total = tasks.length;

    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;

    let percentage = 0;

    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );
    }

    const totalElement =
        document.getElementById("totalCount");

    const completedElement =
        document.getElementById("completedCount");

    const hoursElement =
        document.getElementById("studyHours");

    const progressElement =
        document.getElementById("dashboardProgress");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (hoursElement) {

        hoursElement.textContent =
            getTodayHours() + " hrs";
    }

    if (progressElement) {

        progressElement.textContent =
            percentage + "%";
    }

    displayTodayTasks();

    displayUpcomingTasks();
}


/* =========================
   TODAY TASKS
========================= */

function displayTodayTasks() {

    const container =
        document.getElementById("todayTasks");

    if (!container) {
        return;
    }

    const today = getToday();

    const todayTasks =
        tasks.filter(function(task) {

            return task.dueDate === today;
        });

    container.innerHTML = "";

    if (todayTasks.length === 0) {

        container.textContent =
            "No tasks for today.";

        return;
    }

    todayTasks.forEach(function(task) {

        const div =
            document.createElement("div");

        div.className = "today-task";

        div.innerHTML = `

            <span>
                ${task.completed ? "✅" : "⬜"}

                ${escapeHTML(task.name)}
            </span>

            <span class="priority
                ${task.priority.toLowerCase()}">

                ${task.priority}

            </span>
        `;

        container.appendChild(div);
    });
}


/* =========================
   UPCOMING TASKS
========================= */

function displayUpcomingTasks() {

    const container =
        document.getElementById("upcomingTasks");

    if (!container) {
        return;
    }

    const today = getToday();

    const upcoming =
        tasks.filter(function(task) {

            return (
                !task.completed &&
                task.dueDate &&
                task.dueDate > today
            );
        });

    upcoming.sort(function(a, b) {

        return a.dueDate.localeCompare(
            b.dueDate
        );
    });

    container.innerHTML = "";

    if (upcoming.length === 0) {

        container.textContent =
            "No upcoming tasks.";

        return;
    }

    upcoming.slice(0, 5)
        .forEach(function(task) {

            const div =
                document.createElement("div");

            div.className =
                "upcoming-task";

            div.innerHTML = `

                <span>
                    ⬜ ${escapeHTML(task.name)}
                </span>

                <span>
                    📅 ${formatDate(task.dueDate)}
                </span>
            `;

            container.appendChild(div);
        });
}


/* =========================
   ADD SCHEDULE
========================= */

function addSession() {

    const subject =
        document.getElementById("sessionSubject");

    const date =
        document.getElementById("sessionDate");

    const start =
        document.getElementById("sessionStart");

    const end =
        document.getElementById("sessionEnd");

    if (
        subject.value.trim() === "" ||
        date.value === "" ||
        start.value === "" ||
        end.value === ""
    ) {

        alert(
            "Please fill all schedule fields."
        );

        return;
    }

    if (start.value >= end.value) {

        alert(
            "End time must be after start time."
        );

        return;
    }

    const session = {

        id: Date.now(),

        subject:
            subject.value.trim(),

        date:
            date.value,

        start:
            start.value,

        end:
            end.value
    };

    schedules.push(session);

    saveData();

    subject.value = "";
    date.value = "";
    start.value = "";
    end.value = "";

    displaySchedules();
}


/* =========================
   DISPLAY SCHEDULE
========================= */

function displaySchedules() {

    const container =
        document.getElementById("scheduleList");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (schedules.length === 0) {

        container.textContent =
            "No study sessions.";

        return;
    }

    const sorted =
        [...schedules].sort(
            function(a, b) {

                return (
                    (a.date + a.start)
                        .localeCompare(
                            b.date + b.start
                        )
                );
            }
        );

    sorted.forEach(function(session) {

        const div =
            document.createElement("div");

        div.className =
            "schedule-item";

        div.innerHTML = `

            <div class="schedule-info">

                <span class="schedule-subject">

                    📚 ${escapeHTML(
                        session.subject
                    )}

                </span>

                <span class="schedule-time">

                    📅 ${formatDate(
                        session.date
                    )}

                    &nbsp; | &nbsp;

                    ⏰ ${session.start}
                    -
                    ${session.end}

                </span>

            </div>

            <button
                class="delete"
                onclick="deleteSession(${session.id})">

                🗑️

            </button>
        `;

        container.appendChild(div);
    });
}


/* =========================
   DELETE SCHEDULE
========================= */

function deleteSession(id) {

    schedules =
        schedules.filter(
            function(session) {

                return session.id !== id;
            }
        );

    saveData();

    displaySchedules();
}


/* =========================
   PROGRESS
========================= */

function updateProgress() {

    const total = tasks.length;

    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;

    const pending =
        total - completed;

    let percentage = 0;

    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );
    }

    const totalElement =
        document.getElementById(
            "progressTotal"
        );

    const completedElement =
        document.getElementById(
            "progressCompleted"
        );

    const pendingElement =
        document.getElementById(
            "progressPending"
        );

    const percentageElement =
        document.getElementById(
            "progressPercentage"
        );

    const bar =
        document.getElementById(
            "progressBar"
        );

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (completedElement) {
        completedElement.textContent =
            completed;
    }

    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }

    if (percentageElement) {
        percentageElement.textContent =
            percentage + "%";
    }

    if (bar) {
        bar.style.width =
            percentage + "%";
    }

    const message =
        document.getElementById(
            "progressMessage"
        );

    if (message) {

        if (total === 0) {

            message.textContent =
                "Start adding tasks! 💪";

        } else if (percentage === 100) {

            message.textContent =
                "Amazing! All tasks completed! 🎉";

        } else if (percentage >= 75) {

            message.textContent =
                "Excellent progress! 🔥";

        } else if (percentage >= 50) {

            message.textContent =
                "You're doing great! 💪";

        } else {

            message.textContent =
                "Keep going! You can do it! 🚀";
        }
    }

    displayWeeklyStats();
}


/* =========================
   WEEKLY STATISTICS
========================= */

function displayWeeklyStats() {

    const container =
        document.getElementById(
            "weeklyStats"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const today =
        new Date();

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0"
            );

        const key =
            `${year}-${month}-${day}`;

        days.push({

            key: key,

            name:
                date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                )
        });
    }

    let maxHours = 1;

    days.forEach(function(day) {

        const hours =
            Number(
                studyHours[day.key] || 0
            );

        if (hours > maxHours) {

            maxHours = hours;
        }
    });

    days.forEach(function(day) {

        const hours =
            Number(
                studyHours[day.key] || 0
            );

        const width =
            Math.min(
                100,
                (hours / maxHours) * 100
            );

        const row =
            document.createElement("div");

        row.className =
            "week-row";

        row.innerHTML = `

            <span class="week-day">
                ${day.name}
            </span>

            <div class="week-bar-container">

                <div
                    class="week-bar"
                    style="width:${width}%">
                </div>

            </div>

            <span class="week-hours">
                ${hours}h
            </span>

        `;

        container.appendChild(row);
    });
}


/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );

    const enabled =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        "studyPlannerDark",
        enabled
    );
}


function loadDarkMode() {

    const saved =
        localStorage.getItem(
            "studyPlannerDark"
        );

    if (saved === "true") {

        document.body.classList.add(
            "dark"
        );
    }
}


/* =========================
   CLEAR DATA
========================= */

function clearAllData() {

    const answer =
        confirm(
            "Are you sure you want to delete ALL tasks, schedules and study hours?"
        );

    if (!answer) {
        return;
    }

    tasks = [];
    schedules = [];
    studyHours = {};

    localStorage.removeItem(
        "studyPlannerTasks"
    );

    localStorage.removeItem(
        "studyPlannerSchedules"
    );

    localStorage.removeItem(
        "studyPlannerHours"
    );

    updateEverything();

    alert(
        "All data has been cleared."
    );
}


/* =========================
   CURRENT DATE
========================= */

function showCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) {
        return;
    }

    const date =
        new Date();

    element.textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   UPDATE EVERYTHING
========================= */

function updateEverything() {

    displayTasks();

    displaySchedules();

    updateDashboard();

    updateProgress();
}


/* =========================
   START
========================= */

loadDarkMode();

showCurrentDate();

updateEverything();

showSection("dashboard");