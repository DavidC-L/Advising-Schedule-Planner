const PriorityQueue = require("./PriorityQueue");

const pq = new PriorityQueue();

// Add with mixed priorities and appointment times
pq.enqueue({ student_name: "Alice",  priority: 3, appointment_time: "2026-06-22 09:00:00" });
pq.enqueue({ student_name: "Bob",    priority: 1, appointment_time: "2026-06-22 14:00:00" });
pq.enqueue({ student_name: "Carlos", priority: 2, appointment_time: "2026-06-22 11:00:00" });
pq.enqueue({ student_name: "Diana",  priority: 1, appointment_time: "2026-06-22 10:00:00" });
pq.enqueue({ student_name: "Evan",   priority: 3, appointment_time: "2026-06-22 08:00:00" });

console.log("Order served:");
while (!pq.isEmpty()) {
    const apt = pq.dequeue();
    console.log(`  ${apt.student_name} (priority ${apt.priority}, at ${apt.appointment_time})`);
}