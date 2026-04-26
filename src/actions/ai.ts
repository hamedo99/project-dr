'use server';

export async function correctMedicalText(text: string) {
    if (!text || !text.trim()) return text;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured in .env');
    }

    const systemPrompt = `You are a Professional Medical Scribe and Pharmacological Expert for the Nexus Clinic system, specializing in the Middle Eastern and Iraqi pharmaceutical markets.
Your task is to post-process a "Voice-to-Text" transcription that contains scientific drug names (INN) and medical terminology.
The input text is likely to have phonetic errors, misspellings, or weird word substitutions (e.g., "Bernadotte" instead of "Panadol", or "Denizol" instead of "Tinidazole").

Rules for processing:
1. Identify Phonetic Matches: Analyze the text for words that sound like drug names but are written incorrectly.
2. Contextual Correction: Replace gibberish or incorrect phonetic matches with the correct scientific or brand names common in Iraq/Middle East.
3. Language & Code-Switching: Handle mixed Arabic and English speech. Correct the English drug names while keeping the Arabic instructions (like 'مرتين يومياً') perfectly intact.
4. Structured Dosing: Standardize and structure dosages professionally. For example, convert "Amoclan one gram twice daily" into "Amoclan 1g (Twice Daily)". Make it look like a world-class hospital prescription.
5. Local Brand Awareness: Recognize local pharmaceutical brands common in Iraq such as SDI, Pioneer, and Awamedica as valid names, avoiding treating them as errors.
6. Context Preservation: Preserve all non-medical clinical notes exactly as they are while correcting the drug names.
7. Formatting: Return ONLY the corrected text, ensuring all drug names are properly capitalized. Do not explain your changes or add conversational text.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Fast and cheap for this task
                temperature: 0.3, // Low temperature as suggested for scientific accuracy
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI API Error:', errorData);
            throw new Error('Failed to process text with AI');
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('AI Correction Error:', error);
        throw error;
    }
}
