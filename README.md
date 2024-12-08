# MunchMate 🍲

**MunchMate** is an AI-powered meal-planning application that helps users create healthy, delicious recipes using ingredients they already have at home. It’s designed to prevent food waste and encourage home cooking by providing customized meal suggestions, nutritional information, cost comparisons, and storage tips.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributors](#contributors)

## Features

- **Personalized Recipes**: Generate meal suggestions based on ingredients available at home.
- **Nutritional Information**: Get approximate nutritional data for each recipe.
- **Health Benefits**: Understand the health benefits of key ingredients.
- **Step-by-Step Instructions**: Easy-to-follow cooking steps.
- **Cost Comparison**: Compare the cost of homemade versus restaurant-made dishes.
- **Storage Tips**: Learn how to store leftovers efficiently.
- **Variations**: Suggestions for ingredient substitutions based on common pantry items.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Font Awesome for icons
- **Backend**: Node.js, Express.js
- **AI API**: OpenAI (GPT-3.5 Turbo)
- **Environment Management**: `.env.local` for API key storage.  See `.env.default` for instructions.

## Launch
- `npm install`

- Debug the frontend
  - `npm run dev`
- Debug the backend
  - `npm run build`
  - `node app.js`
- Setup nodemon for backend debugging
  - `npm install -g nodemon`
  - `nodemon --inspect app.js`
  - Open up Chrome and go to `chrome://inspect` to debug
  - Open the `app.js` file in Chrome DevTools to set breakpoints
