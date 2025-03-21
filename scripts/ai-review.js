const fs = require('fs');
const axios = require('axios');

const anthropicApiKey = process.env.CLAUDE_API_KEY;

async function reviewPR() {
    const diff = fs.readFileSync('pr_diff.txt', 'utf8');

    const systemPrompt = `You are a helpful and thorough code reviewer tasked with reviewing a pull request. 
Your job is to identify potential code quality issues, stylistic inconsistencies, missing comments, and any obvious bugs or logic flaws.
You do not have the full project context, so focus only on what is present in the provided diff.
Please format your review as a bulleted list, with clear explanations for each point.`;

    const userMessage = `Here is the diff for the pull request you need to review:

\`\`\`diff
${diff}
\`\`\`

Please provide your review.`;

    const payload = {
        model: "claude-3-opus-20240229",  // Change to "claude-3-sonnet-20240229" if you want something faster/cheaper
        max_tokens: 4000,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ]
    };
    console.log('anthropicApiKey');
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
            headers: {
                'x-api-key': anthropicApiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        });

        const review = response.data.content[0].text;
        fs.writeFileSync('claude_review.txt', review);
    } catch (error) {
        console.error("Failed to get review from Claude:", error.response?.data || error.message);
        process.exit(1);
    }
}

reviewPR();