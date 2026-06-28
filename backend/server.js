const PriorityQueue = require("./PriorityQueue");
 
// Global in-memory queue (need-based: graduating senior / registration / regular)
const appointmentQueue = new PriorityQueue();
 
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "advising_schedule_planner_db",
    waitForConnections: true,
    connectionLimit: 10
});
 
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("Connected to MySQL database");
        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
})();
 
// ---------- HELPERS FOR AUTO-ASSIGN ----------
 
// School year -> assignment priority (lower value = served first). Unknown years go last.
function yearPriority(year) {
    switch (String(year || "").toLowerCase()) {
        case "senior":    return 1;
        case "junior":    return 2;
        case "sophomore": return 3;
        case "freshman":  return 4;
        default:          return 5;
    }
}
 
// Two intervals [s1,e1) and [s2,e2) overlap iff s1 < e2 AND s2 < e1.
function overlaps(s1, e1, s2, e2) {
    return s1 < e2 && s2 < e1;
}
 
// REGISTER
app.post("/register", async (req, res) => {
    const { name, email, password, role, phone, schoolYear } = req.body;
 
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
    }
 
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
 
        if (role === "advisor") {
            await db.query(
                `INSERT INTO Advisor
                 (advisor_name, advisor_email, advisor_password, advisor_phone)
                 VALUES (?, ?, ?, ?)`,
                [name, email, hashedPassword, phone || null]
            );
        } else if (role === "student") {
            await db.query(
                `INSERT INTO Student
                 (student_name, student_email, student_password, school_year)
                 VALUES (?, ?, ?, ?)`,
                [name, email, hashedPassword, schoolYear || null]
            );
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }
 
        res.json({ message: "Registration successful" });
 
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email is already registered" });
        }
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});
 
// LOGIN
app.post("/login", async (req, res) => {
    const { email, password, role } = req.body;
 
    if (!email || !password || !role) {
        return res.status(400).json({ message: "Missing email, password, or role" });
    }
 
    const config =
        role === "advisor"
            ? { table: "Advisor", idCol: "Advisor_ID", emailCol: "advisor_email",
                nameCol: "advisor_name", passwordCol: "advisor_password" }
            : role === "student"
            ? { table: "Student", idCol: "student_id", emailCol: "student_email",
                nameCol: "student_name", passwordCol: "student_password" }
            : null;
 
    if (!config) {
        return res.status(400).json({ message: "Invalid role" });
    }
 
    try {
        const [rows] = await db.query(
            `SELECT ${config.idCol} AS id,
                    ${config.nameCol} AS name,
                    ${config.emailCol} AS email,
                    ${config.passwordCol} AS password
             FROM ${config.table}
             WHERE ${config.emailCol} = ?`,
            [email]
        );
 
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
 
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
 
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
 
        res.json({
            message: "Login successful",
            id: user.id,
            name: user.name,
            email: user.email,
            role
        });
 
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});
 
// GET ADVISORS
app.get("/advisors", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT Advisor_ID, advisor_name FROM Advisor ORDER BY advisor_name`
        );
        res.json(rows);
    } catch (error) {
        console.error("Advisors load error:", error);
        res.status(500).json({ message: "Server error loading advisors" });
    }
});
 
// CREATE APPOINTMENT (student self-scheduling)
app.post("/appointments", async (req, res) => {
    const { studentEmail, advisorName, appointmentTime, priority } = req.body;
 
    if (!studentEmail || !advisorName || !appointmentTime || !priority) {
        return res.status(400).json({ message: "Missing required appointment fields" });
    }
 
    try {
        const [studentRows] = await db.query(
            "SELECT student_id, student_name FROM Student WHERE student_email = ?",
            [studentEmail]
        );
        if (studentRows.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }
        const studentId = studentRows[0].student_id;
        const studentName = studentRows[0].student_name;
 
        const [advisorRows] = await db.query(
            "SELECT Advisor_ID FROM Advisor WHERE advisor_name = ?",
            [advisorName]
        );
        if (advisorRows.length === 0) {
            return res.status(404).json({ message: "Advisor not found" });
        }
        const advisorId = advisorRows[0].Advisor_ID;
 
        const startTime = new Date(appointmentTime);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        // --- Conflict detection ---
        // Reject if the requested slot overlaps any pending appointment for the
        // same advisor (can't double-book an advisor) or the same student.
        const [pending] = await db.query(
            `SELECT appointment_time, end_time, Advisor_Advisor_ID, student_student_id
            FROM Appointments
            WHERE status = 'pending'
            AND (Advisor_Advisor_ID = ? OR student_student_id = ?)`,
            [advisorId, studentId]
        );

        for (const row of pending) {
            const otherStart = new Date(row.appointment_time);
            const otherEnd = new Date(row.end_time);
            if (!overlaps(startTime, endTime, otherStart, otherEnd)) continue;

            if (row.Advisor_Advisor_ID === advisorId) {
                return res.status(409).json({
                    message: "This advisor already has an appointment at that time. Please choose another slot."
                });
            }
            if (row.student_student_id === studentId) {
                return res.status(409).json({
                    message: "You already have an appointment at that time. Please choose another slot."
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO Appointments
                (student_student_id, Advisor_Advisor_ID, priority_slot,
                appointment_time, end_time, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [studentId, advisorId, priority, startTime, endTime, "pending"]
        );

        

 
        appointmentQueue.enqueue({
            appointment_id: result.insertId,
            student_name: studentName,
            advisor_name: advisorName,
            appointment_time: startTime,
            priority: parseInt(priority)
        });
 
        res.json({ message: "Appointment added to queue", queueSize: appointmentQueue.size() });
    } catch (error) {
        console.error("Appointment error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
 
// GET APPOINTMENTS (sorted by the need-based priority queue)
app.get("/appointments", async (req, res) => {
    try {
        res.json(appointmentQueue.toSortedArray());
    } catch (error) {
        console.error("Queue load error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
 
// CANCEL APPOINTMENT (soft-cancel: keep the row, mark it cancelled)
app.post("/appointments/cancel", async (req, res) => {
    const id = parseInt(req.body.appointmentId, 10);
    if (!id) {
        return res.status(400).json({ message: "Missing or invalid appointment ID" });
    }
 
    try {
        const [result] = await db.query(
            "UPDATE Appointments SET status = 'cancelled' WHERE appointment_id = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        appointmentQueue.remove(id);
        res.json({ message: "Appointment cancelled" });
    } catch (error) {
        console.error("Cancel error:", error);
        res.status(500).json({ message: "Server error during cancellation" });
    }
});

// MARK AS ADVISED (soft-complete: keep the row for bookkeeping, mark it advised)
app.post("/appointments/advised", async (req, res) => {
    const id = parseInt(req.body.appointmentId, 10);
    if (!id) {
        return res.status(400).json({ message: "Missing or invalid appointment ID" });
    }

    try {
        const [result] = await db.query(
            "UPDATE Appointments SET status = 'advised' WHERE appointment_id = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        appointmentQueue.remove(id);   // drop from live queue; DB row is preserved
        res.json({ message: "Appointment marked as advised" });
    } catch (error) {
        console.error("Advised error:", error);
        res.status(500).json({ message: "Server error during status update" });
    }
});
 
// AUTO-ASSIGN (greedy interval scheduling)
// 1) build a priority queue of unscheduled students keyed on school year
// 2) pop highest-priority first, place each into the earliest 30-min slot
//    that does not overlap the advisor's existing appointments
app.post("/appointments/auto-assign", async (req, res) => {
    const { advisorName, date } = req.body; // date = "YYYY-MM-DD"
 
    if (!advisorName || !date) {
        return res.status(400).json({ message: "Missing advisor or date" });
    }
 
    try {
        // Resolve advisor
        const [advisorRows] = await db.query(
            "SELECT Advisor_ID FROM Advisor WHERE advisor_name = ?",
            [advisorName]
        );
        if (advisorRows.length === 0) {
            return res.status(404).json({ message: "Advisor not found" });
        }
        const advisorId = advisorRows[0].Advisor_ID;
 
        // Pool: enrolled students with NO pending appointment
        const [students] = await db.query(
            `SELECT student_id, student_name, school_year
             FROM Student
             WHERE student_id NOT IN (
                 SELECT student_student_id FROM Appointments WHERE status = 'pending'
             )`
        );
 
        if (students.length === 0) {
            return res.json({ message: "No unscheduled students to assign", assigned: [], unassignedCount: 0 });
        }
 
        // Priority queue keyed on school year; tiebreaker = earlier-enrolled (lower id)
        const studentQueue = new PriorityQueue((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.student_id - b.student_id;
        });
        students.forEach(s => studentQueue.enqueue({
            student_id: s.student_id,
            student_name: s.student_name,
            school_year: s.school_year,
            priority: yearPriority(s.school_year)
        }));
 
        // Existing pending appointments for this advisor on this date = busy intervals
        const [existing] = await db.query(
            `SELECT appointment_time, end_time
             FROM Appointments
             WHERE Advisor_Advisor_ID = ? AND status = 'pending'
               AND DATE(appointment_time) = ?`,
            [advisorId, date]
        );
        const busy = existing.map(r => ({
            start: new Date(r.appointment_time),
            end: new Date(r.end_time)
        }));
 
        // Candidate 30-min slots across the working window (09:00 - 17:00)
        const SLOT_MS = 30 * 60 * 1000;
        const dayStart = new Date(`${date}T09:00:00`);
        const dayEnd = new Date(`${date}T17:00:00`);
        const candidates = [];
        for (let t = dayStart.getTime(); t < dayEnd.getTime(); t += SLOT_MS) {
            candidates.push(new Date(t));
        }
 
        // Greedy assignment loop
        const assigned = [];
        while (!studentQueue.isEmpty()) {
            const student = studentQueue.dequeue();
 
            // earliest candidate slot that overlaps nothing busy
            let placed = null;
            for (const slotStart of candidates) {
                const slotEnd = new Date(slotStart.getTime() + SLOT_MS);
                const conflict = busy.some(b => overlaps(slotStart, slotEnd, b.start, b.end));
                if (!conflict) { placed = { slotStart, slotEnd }; break; }
            }
 
            if (!placed) break; // day is full; remaining students stay unassigned
 
            // Mandatory advising -> stored need-priority defaults to Regular Advising (3)
            const [result] = await db.query(
                `INSERT INTO Appointments
                    (student_student_id, Advisor_Advisor_ID, priority_slot,
                     appointment_time, end_time, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [student.student_id, advisorId, 3, placed.slotStart, placed.slotEnd, "pending"]
            );
 
            busy.push({ start: placed.slotStart, end: placed.slotEnd }); // block this slot
 
            appointmentQueue.enqueue({
                appointment_id: result.insertId,
                student_name: student.student_name,
                advisor_name: advisorName,
                appointment_time: placed.slotStart,
                priority: 3
            });
 
            assigned.push({
                student_name: student.student_name,
                school_year: student.school_year,
                time: placed.slotStart
            });
        }
 
        const unassignedCount = studentQueue.size();
        res.json({
            message: `Assigned ${assigned.length} student(s)` +
                     (unassignedCount ? `; ${unassignedCount} left unassigned (day full)` : ""),
            assigned,
            unassignedCount
        });
    } catch (error) {
        console.error("Auto-assign error:", error);
        res.status(500).json({ message: "Server error during auto-assign" });
    }
});
 
async function loadQueueFromDB() {
    try {
        const [rows] = await db.query(
            `SELECT a.appointment_id,
                    a.appointment_time,
                    a.priority_slot AS priority,
                    s.student_name,
                    adv.advisor_name
             FROM Appointments a
             JOIN Student s ON a.student_student_id = s.student_id
             JOIN Advisor adv ON a.Advisor_Advisor_ID = adv.Advisor_ID
             WHERE a.status = 'pending'
             ORDER BY a.time_created ASC`
        );
        rows.forEach(row => appointmentQueue.enqueue(row));
        console.log(`Loaded ${rows.length} pending appointments into queue`);
    } catch (error) {
        console.error("Failed to load queue from DB:", error);
    }
}
 
app.listen(3000, async () => {
    console.log("Server running on http://localhost:3000");
    await loadQueueFromDB();
});
