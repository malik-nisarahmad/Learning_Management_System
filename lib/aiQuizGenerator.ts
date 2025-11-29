const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export async function generateQuizAI(
  topic: string,
  count: number,
  difficulty: 'Easy' | 'Medium' | 'Hard'
): Promise<Question[]> {
  const prompt = `Generate ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty level.
  
Return ONLY a valid JSON array with this exact structure for each question:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct",
    "difficulty": "${difficulty}"
  }
]

Important:
- correctAnswer is the index (0-3) of the correct option
- Each question must have exactly 4 options
- Return ONLY the JSON array, no other text`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) throw new Error('Groq API Error: ' + (await res.text()));

  const json = await res.json();
  const raw = json.choices[0].message.content;
  const jsonStr = raw.replace(/```json|```/g, '').trim();

  // robust extractor
  const match = jsonStr.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in response');
  return JSON.parse(match[0]) as Question[];
}

// AI Email Generator for Faculty Contact
export async function generateEmailWithAI(
  facultyName: string,
  facultyDesignation: string,
  purpose: string,
  studentName: string,
  additionalContext?: string
): Promise<{ subject: string; body: string }> {
  const purposeDescriptions: Record<string, string> = {
    query: 'asking about course material or academic concepts',
    appointment: 'requesting a meeting or office hours appointment',
    assignment: 'inquiring about an assignment, deadline, or submission',
    absence: 'notifying about class absence or requesting leave',
    recommendation: 'requesting a recommendation letter',
    feedback: 'asking for feedback on academic performance or project',
    general: 'a general academic inquiry',
  };

  const purposeDesc = purposeDescriptions[purpose] || purposeDescriptions.general;

  const prompt = `Write a professional academic email from a student to their professor.

Details:
- Professor: ${facultyName} (${facultyDesignation})
- Student: ${studentName}
- Purpose: ${purposeDesc}
${additionalContext ? `- Additional context: ${additionalContext}` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "subject": "Email subject line here",
  "body": "Full email body here with proper greeting and sign-off"
}

Requirements:
- Professional and respectful tone
- Appropriate for academic setting
- Include placeholders like [specific topic], [date], [course name] where needed
- Keep it concise but complete
- Return ONLY the JSON object, no other text`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) throw new Error('Groq API Error: ' + (await res.text()));

  const json = await res.json();
  const raw = json.choices[0].message.content;
  const jsonStr = raw.replace(/```json|```/g, '').trim();

  // Extract JSON object
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in response');
  
  return JSON.parse(match[0]) as { subject: string; body: string };
}