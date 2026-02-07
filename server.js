require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 1. Middleware: Allow JSON and allow Vercel to talk to this server
app.use(express.json());
app.use(cors({ origin: '*' })); // ⬅️ CRITICAL FIX

// 2. Serve Frontend (Optional: keeps the Render URL working too)
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. AI Route (The Brain)
app.post('/gemini', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) return res.status(500).json({ reply: "Server Error: Missing API Key" });

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are a helpful electronics tutor. Keep answers short." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Groq Error:", data.error);
            return res.json({ reply: "Error from AI provider." });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ reply: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});