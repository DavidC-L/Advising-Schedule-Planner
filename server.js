const PriorityQueue = require("./PriorityQueue");

// Global in-memory queue (lives as long as the server is running)
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
    database: "advising_schedule_planner_db", // <-- Make sure this matches schema.sql
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

// REGISTER
app.post("/register", async (req, res) => {
    const { name, email, password, role, phone, specialization } = req.body; // Add specialization here

    if (!name || !email || !password || !role) {
        return res.status(400).json({
            message: "Missing required fields"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === "advisor") {
            // Updated to save the chosen role/specialty column
            await db.query(
                `INSERT INTO Advisor
                 (advisor_name, advisor_email, advisor_password, advisor_phone)
                 VALUES (?, ?, ?, ?)`,
                [name, email, hashedPassword, phone || null]
            );
        } else if (role === "student") {
            await db.query(
                `INSERT INTO Student
                 (student_name, student_email, student_password)
                 VALUES (?, ?, ?)`,
                [name, email, hashedPassword]
            );
        } else {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        res.json({
            message: "Registration successful"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        console.error("Register error:", error);
        res.status(500).json({
            message: "Server error during registration"
        });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            message: "Missing email, password, or role"
        });
    }

    const config =
        role === "advisor"
            ? {
                table: "Advisor",
                idCol: "Advisor_ID",
                emailCol: "advisor_email",
                nameCol: "advisor_name",
                passwordCol: "advisor_password"
            }
            : role === "student"
            ? {
                table: "Student",
                idCol: "student_id",
                emailCol: "student_email",
                nameCol: "student_name",
                passwordCol: "student_password"
            }
            : null;

    if (!config) {
        return res.status(400).json({
            message: "Invalid role"
        });
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
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
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
        res.status(500).json({
            message: "Server error during login"
        });
    }
});

// GET ADVISORS
app.get("/advisors", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT Advisor_ID, advisor_name
             FROM Advisor
             ORDER BY advisor_name`
        );

        res.json(rows);

    } catch (error) {
        console.error("Advisors load error:", error);
        res.status(500).json({
            message: "Server error loading advisors"
        });
    }
});

app.post("/appointments", async (req, res) => {
    const { studentEmail, advisorName, appointmentTime, priority } = req.body;

    if (!studentEmail || !advisorName || !appointmentTime || !priority) {
        return res.status(400).json({ message: "Missing required appointment fields" });
    }

    try {
        // Look up IDs (same as before)
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

        // Insert into database
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

        res.json({
            message: "Appointment added to queue",
            queueSize: appointmentQueue.size()
        });
    } catch (error) {
        console.error("Appointment error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/appointments", async (req, res) => {
    try {
        // Use the priority queue to get sorted appointments
        const sorted = appointmentQueue.toSortedArray();
        res.json(sorted);
    } catch (error) {
        console.error("Queue load error:", error);
        res.status(500).json({ message: "Server error" });
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
             ORDER BY a.time_created ASC`  // preserve original arrival order
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