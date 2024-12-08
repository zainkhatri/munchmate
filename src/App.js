import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [ingredients, setIngredients] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState({
    weightLoss: false,
    muscleGain: false,
    generalFitness: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    
    setLoading(true);
    const ingredientList = ingredients
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const selectedGoals = Object.entries(fitnessGoals)
      .filter(([_, checked]) => checked)
      .map(([goal]) => goal);

    try {
      const response = await fetch('/get-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredientList,
          fitnessGoal: selectedGoals
        }),
      });

      const data = await response.json();
      setResult(data.mealSuggestion);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="container">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>MunchMate</h1>
          <p className="tagline">
            Transform your ingredients into healthy, delicious meals!
          </p>
        </motion.header>

        <motion.section 
          className="input-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="ingredients">
                What ingredients do you have?
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Enter ingredients (comma-separated)"
                />
              </div>
            </div>

            <div className="fitness-goals">
              <label>Select your fitness goals:</label>
              <div className="goal-options">
                {Object.entries({
                  weightLoss: 'Weight Loss',
                  muscleGain: 'Muscle Gain',
                  generalFitness: 'General Fitness'
                }).map(([key, label]) => (
                  <motion.div
                    key={key}
                    className="goal-option"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      id={key}
                      checked={fitnessGoals[key]}
                      onChange={(e) => setFitnessGoals(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                    />
                    <label htmlFor={key}>{label}</label>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Generating...' : 'Generate Recipe'}
            </motion.button>
          </form>
        </motion.section>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              className="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-spinner" />
              <p>Creating your personalized recipe...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              className="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {result.split('\n\n').map((section, index) => {
                const lines = section.trim().split('\n');
                if (!lines[0]) return null;
                
                return (
                  <div key={index} className="recipe-section">
                    <h3>{lines[0]}</h3>
                    <div className="section-content">
                      {lines.slice(1).map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <footer>
          <p className="credits">Created by Zain Khatri</p>
        </footer>
      </div>
    </div>
  );
};

export default App;