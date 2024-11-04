const express = require('express');
const path = require('path');
require('dotenv').config({ path: '.env.local' });  // Loads variables from .env.local
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
  const ingredients = req.body.ingredients;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Ingredients must be an array.' });
  }

  try {
    const messages = [
      {
        role: "system",
        content: `You are a professional nutritionist and chef who helps users create healthy, delicious meals from ingredients they have at home. For each recipe suggestion:
        1. Provide a creative name for the dish
        2. List approximate nutritional information (calories, protein, carbs, fats)
        3. Highlight health benefits of key ingredients
        4. Give detailed step-by-step cooking instructions
        5. Include money-saving comparison (estimated cost at home vs. restaurant)
        6. Provide tips for storing leftovers
        7. Suggest variations based on common pantry items
        
        Format the response in clear sections with emoji indicators. Focus on encouraging healthy home cooking and preventing food waste.`
      },
      {
        role: "user",
        content: `I have the following ingredients: ${ingredients.join(', ')}. Please provide me with a detailed recipe following the format above.`
      },
    ];

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,  // Increased for more detailed response
      temperature: 0.7,
    });

    const suggestion = response.data.choices[0].message.content.trim();
    res.json({ mealSuggestion: suggestion });
  } catch (error) {
    console.error('Error fetching meal suggestion:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to get meal suggestion.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// node app.js