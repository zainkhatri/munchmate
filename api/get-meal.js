import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.OPENAI_API_KEY
    });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { ingredients, fitnessGoal } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid ingredients format',
        received: ingredients 
      });
    }

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are a professional chef and fitness expert. When creating a recipe and workout plan, provide it as plain text without any code blocks, JSON, or XML. Do not include any additional formatting, explanations, or annotations. Just output the recipe and workout in plain text using the exact structure provided below.

🍽️[Creative name]

📊 NUTRITIONAL INFO
• Calories: [X] kcal
• Protein: [X]g
• Carbs: [X]g
• Fats: [X]g

❤️ HEALTH BENEFITS
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

👩‍🍳 COOKING INSTRUCTIONS
1. [Step 1]
2. [Step 2]
3. [Step 3]

💪 WORKOUT PLAN
• Warm-up: [5-10 minute dynamic warm-up]
• Circuit 1: [3 exercises with reps]
• Circuit 2: [3 exercises with reps]
• Cool-down: [5-minute stretch routine]`
        },
        {
          role: "user",
          content: `Create a recipe using these ingredients: ${ingredients.join(', ')}. The user's fitness goal is: ${fitnessGoal?.join(', ') || 'general fitness'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    console.log('OpenAI request successful');
    
    res.status(200).json({
      status: 'success',
      mealSuggestion: completion.data.choices[0].message.content
    });

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Failed to generate recipe',
      details: error.message
    });
  }
}