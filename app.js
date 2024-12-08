const express = require('express');
const path = require('path');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const cors = require('cors');

const app = express();

// Enable CORS for development
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// API endpoints
app.post('/get-meal', async (req, res) => {
  try {
    const { ingredients, fitnessGoal } = req.body;
    
    console.log('Received request:', { ingredients, fitnessGoal });

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide valid ingredients.' });
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
          content: `Create a recipe using these ingredients: ${ingredients.join(', ')}. The user's fitness goal is: ${fitnessGoal.join(', ') || 'general fitness'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const recipeText = completion.data.choices[0]?.message?.content?.trim();

    if (!recipeText) {
      throw new Error('No recipe generated');
    }

    return res.json({
      status: 'success',
      mealSuggestion: recipeText
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Failed to generate recipe',
      details: error.message
    });
  }
});

// Serve static files from the React build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});