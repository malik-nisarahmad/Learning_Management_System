const OR_KEY = process.env.NEXT_PUBLIC_OPENROUTER_KEY;

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
  const prompt = `Generate ${count} multiple-choice questions about "${topic}" (${difficulty}).
Return ONLY a JSON array, no markdown.`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', { // ← space removed
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OR_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'z-ai/glm-4.5-air:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error('OpenRouter: ' + (await res.text()));

    const json = await res.json();
  const raw = json.choices[0].message.content;
  const jsonStr = raw.replace(/```json|```/g, '').trim();

  // robust extractor
  const match = jsonStr.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in response');
  return JSON.parse(match[0]) as Question[];
}