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
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide valid ingredients.' });
    }

    console.log('Received ingredients:', ingredients);

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are a professional chef. When creating a recipe, provide it as plain text without any code blocks, JSON, or XML. Do not include any additional formatting, explanations, or annotations. Just output the recipe in plain text using the exact structure provided below.

🍽️ DISH NAME
[Creative name]

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
          content: `Create a recipe using these ingredients: ${ingredients.join(', ')}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
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

    console.log('Generated recipe:', recipeText); // Debug log

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
