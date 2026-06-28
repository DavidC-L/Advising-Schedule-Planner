const PriorityQueue = require("./PriorityQueue");
 
// Priority values: 1 = Graduating Senior, 2 = Registration Issue, 3 = Regular Advising.
// Ties within a priority are broken first-come-first-served (lowest appointment_id).
//
// The appointments below are enqueued in appointment_id order (1..8), but their
// priorities are scrambled. So the dequeue order proves two things at once:
//   1. The heap reorders by priority (id 1 is enqueued first but comes out near the end).
//   2. Within a single priority, the earliest-arriving student (lowest id) is served first.
//
// appointment_time is included for realism but is intentionally NOT in arrival order,
// which confirms the comparator now sorts by id (FCFS), not by requested time.
 
const pq = new PriorityQueue();
 
const testAppointments = [
    { appointment_id: 1, student_name: "Alice",  priority: 3, appointment_time: "2026-06-26 09:00:00" },
    { appointment_id: 2, student_name: "Bob",    priority: 1, appointment_time: "2026-06-26 16:00:00" },
    { appointment_id: 3, student_name: "Carlos", priority: 2, appointment_time: "2026-06-26 11:00:00" },
    { appointment_id: 4, student_name: "Diana",  priority: 1, appointment_time: "2026-06-26 10:00:00" },
    { appointment_id: 5, student_name: "Evan",   priority: 3, appointment_time: "2026-06-26 08:00:00" },
    { appointment_id: 6, student_name: "Fiona",  priority: 2, appointment_time: "2026-06-26 15:00:00" },
    { appointment_id: 7, student_name: "George", priority: 1, appointment_time: "2026-06-26 13:00:00" },
    { appointment_id: 8, student_name: "Hana",   priority: 3, appointment_time: "2026-06-26 14:00:00" }
];
 
testAppointments.forEach(apt => pq.enqueue(apt));
 
const priorityLabels = { 1: "Graduating Senior", 2: "Registration Issue", 3: "Regular Advising" };
 
console.log("Order served (priority asc, then first-come-first-served by id):\n");
 
const servedIds = [];
while (!pq.isEmpty()) {
    const apt = pq.dequeue();
    servedIds.push(apt.appointment_id);
    console.log(
        `  #${apt.appointment_id}  ${apt.student_name.padEnd(7)} ` +
        `priority ${apt.priority} (${priorityLabels[apt.priority]})`
    );
}
 
// --- Automated verification ---
// Expected: all priority-1 first (ids 2,4,7), then priority-2 (3,6), then priority-3 (1,5,8),
// each group in ascending id (= arrival) order.
const expected = [2, 4, 7, 3, 6, 1, 5, 8];
const passed = JSON.stringify(servedIds) === JSON.stringify(expected);
 
console.log("\nExpected id order:", expected.join(", "));
console.log("Actual id order:  ", servedIds.join(", "));
console.log(passed ? "\nPASS: priority + FCFS ordering is correct." : "\nFAIL: ordering does not match expected.");
 
process.exitCode = passed ? 0 : 1;
