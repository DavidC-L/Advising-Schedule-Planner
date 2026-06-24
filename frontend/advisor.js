// --- Access guard: only logged-in advisors may view this page ---
if (!sessionStorage.getItem("userEmail")) {
    window.location.href = "login.html";
} else if (sessionStorage.getItem("userRole") !== "advisor") {
    window.location.href = "index.html";
}
 
const priorityLabels = { 1: "Graduating Senior", 2: "Registration Issue", 3: "Regular Advising" };
 
// Holds the full, unfiltered list fetched from the server.
// Filtering always works from this array so nothing is permanently lost.
let allAppointments = [];
 
window.addEventListener("DOMContentLoaded", () => {
    const name = sessionStorage.getItem("userName");
    document.getElementById("welcome").textContent = name ? `Welcome, ${name}` : "";
 
    // Re-run the filter whenever the search text or priority choice changes
    document.getElementById("searchBox").addEventListener("input", applyFilters);
    document.getElementById("priorityFilter").addEventListener("change", applyFilters);
 
    loadQueue();
});
 
// Fetch every appointment once, then hand off to the filter step.
async function loadQueue() {
    try {
        const response = await fetch("http://localhost:3000/appointments");
        allAppointments = await response.json();
        applyFilters();
    } catch (error) {
        console.error("Failed to load queue:", error);
    }
}
 
// Linear scan: keep only appointments that match every active filter.
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
 
// Draw whatever list it's given (full or filtered).
function renderList(appointments) {
    const queueList = document.getElementById("queueList");
    queueList.innerHTML = "";
 
    if (appointments.length === 0) {
        queueList.innerHTML = "<li>No matching appointments.</li>";
        return;
    }
 
    appointments.forEach((apt, index) => {
        const li = document.createElement("li");
        const time = new Date(apt.appointment_time).toLocaleString();
        li.textContent =
            `${index + 1}. ${apt.student_name} \u2192 ${apt.advisor_name} at ${time} (${priorityLabels[apt.priority]})`;
        queueList.appendChild(li);
    });
}
