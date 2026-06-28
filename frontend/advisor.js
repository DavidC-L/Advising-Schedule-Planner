// --- Access guard: only logged-in advisors may view this page ---
if (!sessionStorage.getItem("userEmail")) {
    window.location.href = "login.html";
} else if (sessionStorage.getItem("userRole") !== "advisor") {
    window.location.href = "index.html";
}
 
const priorityLabels = { 1: "Graduating Senior", 2: "Registration Issue", 3: "Regular Advising" };
 
let allAppointments = [];
 
window.addEventListener("DOMContentLoaded", () => {
    const name = sessionStorage.getItem("userName");
    document.getElementById("welcome").textContent = name ? `Welcome, ${name}` : "";
 
    document.getElementById("searchBox").addEventListener("input", applyFilters);
    document.getElementById("priorityFilter").addEventListener("change", applyFilters);
    document.getElementById("autoAssignBtn").addEventListener("click", autoAssign);
 
    // Default the date picker to today
    document.getElementById("assignDate").value = new Date().toISOString().slice(0, 10);
 
    loadAdvisors();
    loadQueue();
});
 
// Populate the auto-assign advisor dropdown
async function loadAdvisors() {
    try {
        const response = await fetch("http://localhost:3000/advisors");
        const advisors = await response.json();
        const select = document.getElementById("assignAdvisor");
        select.innerHTML = "";
 
        advisors.forEach(adv => {
            const option = document.createElement("option");
            option.value = adv.advisor_name;
            option.textContent = adv.advisor_name;
            select.appendChild(option);
        });
 
        // Pre-select the logged-in advisor when their name matches
        const me = sessionStorage.getItem("userName");
        if (me) select.value = me;
    } catch (error) {
        console.error("Failed to load advisors:", error);
    }
}
 
async function loadQueue() {
    try {
        const response = await fetch("http://localhost:3000/appointments");
        allAppointments = await response.json();
        applyFilters();
    } catch (error) {
        console.error("Failed to load queue:", error);
    }
}
 
// Linear scan: keep only appointments matching every active filter.
function applyFilters() {
    const searchTerm = document.getElementById("searchBox").value.toLowerCase().trim();
    const priorityChoice = document.getElementById("priorityFilter").value;
 
    const filtered = allAppointments.filter(apt => {
        const matchesName = apt.student_name.toLowerCase().includes(searchTerm);
        const matchesPriority =
            priorityChoice === "all" || String(apt.priority) === priorityChoice;
        return matchesName && matchesPriority;
    });
 
    renderList(filtered);
}
 
function renderList(appointments) {
    const queueList = document.getElementById("queueList");
    queueList.innerHTML = "";
 
    if (appointments.length === 0) {
        queueList.innerHTML = "<li>No matching appointments.</li>";
        return;
    }
 
    appointments.forEach(apt => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.gap = "10px";
 
        const time = new Date(apt.appointment_time).toLocaleString();
        const label = document.createElement("span");
        label.textContent =
            `#${apt.appointment_id} \u2014 ${apt.student_name} \u2192 ${apt.advisor_name} at ${time} (${priorityLabels[apt.priority]})`;
 
        const advisedBtn = document.createElement("button");
        advisedBtn.textContent = "Advised";
        advisedBtn.style.width = "auto";
        advisedBtn.style.flexShrink = "0";
        advisedBtn.style.margin = "0";
        advisedBtn.style.padding = "5px 12px";
        advisedBtn.style.fontSize = "0.85em";
        advisedBtn.style.background = "#2d7a33";
        advisedBtn.addEventListener("click", () => markAdvised(apt.appointment_id));

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.width = "auto";
        cancelBtn.style.flexShrink = "0";
        cancelBtn.style.margin = "0";
        cancelBtn.style.padding = "5px 12px";
        cancelBtn.style.fontSize = "0.85em";
        cancelBtn.style.background = "#a12d2d";
        cancelBtn.addEventListener("click", () => cancelAppointment(apt.appointment_id));

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        actions.style.flexShrink = "0";
        actions.appendChild(advisedBtn);
        actions.appendChild(cancelBtn);

        li.appendChild(label);
        li.appendChild(actions);

        
 
        li.appendChild(label);
        li.appendChild(cancelBtn);
        queueList.appendChild(li);
    });
}
 
async function cancelAppointment(id) {
    if (!confirm(`Cancel appointment #${id}?`)) return;
 
    try {
        const response = await fetch("http://localhost:3000/appointments/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointmentId: id })
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) loadQueue();
    } catch (error) {
        console.error(error);
        alert("Error connecting to server.");
    }
}
 
// Run the greedy auto-assign on the server, then show results and refresh the queue.
async function autoAssign() {
    const advisorName = document.getElementById("assignAdvisor").value;
    const date = document.getElementById("assignDate").value;
 
    if (!advisorName || !date) {
        alert("Please choose an advisor and a date.");
        return;
    }
 
    try {
        const response = await fetch("http://localhost:3000/appointments/auto-assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ advisorName, date })
        });
        const result = await response.json();
 
        const resultList = document.getElementById("assignResult");
        resultList.innerHTML = "";
 
        const header = document.createElement("li");
        header.textContent = result.message;
        resultList.appendChild(header);
 
        (result.assigned || []).forEach(a => {
            const li = document.createElement("li");
            const time = new Date(a.time).toLocaleString();
            li.textContent = `${a.student_name} (${a.school_year || "n/a"}) \u2192 ${time}`;
            resultList.appendChild(li);
        });
 
        loadQueue();
    } catch (error) {
        console.error(error);
        alert("Error connecting to server.");
    }
}

async function markAdvised(id) {
    if (!confirm(`Mark appointment #${id} as advised?`)) return;

    try {
        const response = await fetch("http://localhost:3000/appointments/advised", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointmentId: id })
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) loadQueue();
    } catch (error) {
        console.error(error);
        alert("Error connecting to server.");
    }
}
