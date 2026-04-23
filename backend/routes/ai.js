const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getAiProvider = () => {
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.GEMINI_API_KEY) return 'gemini';
    return null;
};

router.post('/insights', auth, async (req, res) => {
    const { mode, expenses, currency, monthlyBudget, messages, text } = req.body;
    const provider = getAiProvider();

    if (!provider) {
        return res.status(400).json({ error: "No AI provider configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in backend .env" });
    }

    try {
        if (mode === 'categorize') {
            const prompt = `Parse the following expense: "${text}". 
Current default currency: ${currency}.
Return ONLY a valid JSON object with these keys (no markdown formatting, no comments): 
"amount" (number), "currency" (string like "USD"), "category" (string, pick from generic list like "Food & Dining", "Transportation", "Shopping", "Entertainment", "Housing", "Bills", "Others"), "description" (string, brief summary).`;

            if (provider === 'openai') {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "system", content: prompt }],
                    model: "gpt-3.5-turbo",
                    response_format: { type: "json_object" }
                });
                return res.json(JSON.parse(completion.choices[0].message.content));
            } else if (provider === 'gemini') {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
                const result = await model.generateContent(prompt);
                return res.json(JSON.parse(result.response.text()));
            }
        }
        else if (mode === 'insights') {
            const prompt = `You are an AI financial advisor. The user has a monthly budget of ${monthlyBudget || 'unknown'} ${currency}. 
Here are their recent expenses: ${JSON.stringify(expenses, null, 2)}. 
Provide a concise, helpful summary in Markdown formatting. Point out any anomalies, give saving tips, and encourage them.`;

            if (provider === 'openai') {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "system", content: prompt }],
                    model: "gpt-3.5-turbo",
                });
                return res.json({ insights: completion.choices[0].message.content });
            } else if (provider === 'gemini') {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                return res.json({ insights: result.response.text() });
            }
        } 
        else if (mode === 'chat') {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const systemPrompt = `You are a helpful AI financial assistant. 
The user is tracking their expenses in ${currency}. 
Recent expenses context: ${JSON.stringify(expenses?.slice(0, 50) || [], null, 2)}. 
Answer their questions concisely and helpfully.`;

            if (provider === 'openai') {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const stream = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content }))
                    ],
                    model: "gpt-3.5-turbo",
                    stream: true,
                });

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
                    }
                }
                res.write(`data: [DONE]\n\n`);
                return res.end();
            } 
            else if (provider === 'gemini') {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                const lastMsg = messages[messages.length - 1].content;
                let history = [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "Understood. How can I help you today?" }] }
                ];
                
                for (let i = 0; i < messages.length - 1; i++) {
                    history.push({
                        role: messages[i].role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: messages[i].content }]
                    });
                }

                const chat = model.startChat({ history });
                const resultStream = await chat.sendMessageStream(lastMsg);
                
                for await (const chunk of resultStream) {
                    const content = chunk.text();
                    if (content) {
                        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
                    }
                }
                res.write(`data: [DONE]\n\n`);
                return res.end();
            }
        }
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ error: "AI processing failed", details: err.message });
        } else {
            res.end();
        }
    }
});

module.exports = router;
