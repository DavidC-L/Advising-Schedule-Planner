// Seed 50 test students (no appointments) for testing auto-assign.
// Run once from your backend folder:  node seed_students.js
// Safe to re-run: duplicate emails are skipped.

const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345678",                       // match your server.js / db.js
    database: "advising_schedule_planner_db",
    waitForConnections: true,
    connectionLimit: 10
});

const firstNames = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery",
    "Quinn", "Sam", "Drew", "Cameron", "Skyler", "Reese", "Devin", "Harper",
    "Rowan", "Emerson", "Finley", "Sawyer", "Kendall", "Logan", "Parker",
    "Hayden", "Marlowe"
];

const lastNames = [
    "Smith", "Johnson", "Lee", "Garcia", "Brown", "Martinez", "Davis", "Lopez",
    "Wilson", "Nguyen", "Patel", "Kim", "Chen", "Khan", "Reyes", "Cruz",
    "Morales", "Ortiz", "Singh", "Flores"
];

const years = ["freshman", "sophomore", "junior", "senior"];

async function seed() {
    const plainPassword = "test1234";
    const hash = await bcrypt.hash(plainPassword, 10);

    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < 50; i++) {
        const first = firstNames[i % firstNames.length];
        const last = lastNames[i % lastNames.length];
        const name = `${first} ${last}`;
        const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@test.edu`;
        const year = years[i % years.length];   // even spread across all four years

        try {
            await db.query(
                `INSERT INTO Student
                    (student_name, student_email, student_password, school_year)
                 VALUES (?, ?, ?, ?)`,
                [name, email, hash, year]
            );
            inserted++;
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                skipped++;
            } else {
                console.error(`Error inserting ${email}:`, err.message);
            }
        }
    }

    console.log(`Done. Inserted ${inserted} students, skipped ${skipped} duplicates.`);
    console.log(`Every test student's password is: ${plainPassword}`);
    await db.end();
}

seed();
