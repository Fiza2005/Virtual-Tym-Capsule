const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios"); // To interact with Email.js API

const app = express();
app.use(bodyParser.json());

// Enable CORS (if needed for front-end requests)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// In-memory database to store user accounts (for simplicity)
const users = [];

// Function to find a user by email
function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

// Signup Endpoint
app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!email || !password || !name) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
        return res.status(400).json({ message: "User already exists. Please login." });
    }

    // Add new user
    users.push({ name, email, password });
    res.status(201).json({ message: "User registered successfully!" });
});

// Login Endpoint
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // Verify user credentials
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
        return res.status(400).json({ message: "Invalid email or password." });
    }

    res.status(200).json({ message: "Login successful!", user });
});

// Send Message Endpoint (using Email.js)
app.post("/send-message", async (req, res) => {
    const { fromEmail, toEmail, messageContent, scheduledTime } = req.body;

    // Check if all fields are provided
    if (!fromEmail || !toEmail || !messageContent || !scheduledTime) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Sending email using Email.js API
        const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
            service_id: "service_memlv8l", // Replace with your Service ID
            template_id: "template_ypijv7f", // Replace with your Template ID
            
            template_params: {
                from_email: fromEmail,
                to_email: toEmail,
                message: messageContent,
                scheduled_time: scheduledTime
            },
        });

        if (response.status === 200) {
            res.status(200).json({ message: "Message scheduled and sent successfully!" });
        } else {
            res.status(500).json({ message: "Failed to send the message." });
        }
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ message: "Error sending message.", error: error.message });
    }
});

// Server Initialization
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
