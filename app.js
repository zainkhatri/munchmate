const express = require('express');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { Configuration, OpenAIApi } = require('openai');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.post('/get-meal', async (req, res) => {
  try {
    const { ingredients, fitnessGoal } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide valid ingredients.' });
    }

    console.log('Received ingredients:', ingredients);
    console.log('Fitness goal:', fitnessGoal);

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
4. [Step 4]
5. [Step 5]
6. [Step 6]

💪 WORKOUT PLAN
• Warm-up: [5-10 minute dynamic warm-up]
• Circuit 1: [3 exercises with reps]
• Circuit 2: [3 exercises with reps]
• Cool-down: [5-minute stretch routine]

🎯 FITNESS TIPS
• [Tip related to meal timing and workout]
• [Tip about nutrition and exercise synergy]
• [Recovery advice]

💰 COST COMPARISON
• Home Cost: $[X]
• Restaurant: $[X]
• Savings: $[X]

🌟 PRO TIPS
• [Tip 1]
• [Tip 2]

🔄 VARIATIONS
• [Variation 1]
• [Variation 2]

🌡️ STORAGE
• [Storage info]
• [Duration]
• [Reheating]

⏱️ TIMING
• Prep: [X] mins
• Cook: [X] mins
• Total: [X] mins
• Servings: [X]`
        },
        {
          role: "user",
          content: `Create a recipe using these ingredients: ${ingredients.join(', ')}' The user's fitness goal is: ${fitnessGoal || 'general fitness'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Log the raw response for debugging
    console.log('OpenAI Response:', JSON.stringify(completion.data, null, 2));

    // Extract and validate the recipe text
    let recipeText = completion.data.choices[0]?.message?.content || '';

    // Remove code blocks and trim whitespace
    recipeText = recipeText.replace(/```[\s\S]*?```/g, '').trim();

    console.log('Type of recipeText:', typeof recipeText);
    console.log('Content of recipeText:', recipeText);

    if (!recipeText || typeof recipeText !== 'string') {
      console.error('No valid recipe text received from OpenAI');
      return res.status(500).json({ error: 'Failed to generate recipe text' });
    }

    console.log('Generated recipe and workout:', recipeText); // Debug log

    // Send the response with explicit content type
    return res.status(200).json({
      status: 'success',
      mealSuggestion: recipeText
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recipe',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});