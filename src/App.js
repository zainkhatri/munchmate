import React, { useState } from 'react';

const App = () => {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const ingredientList = ingredients
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (ingredientList.length === 0) {
      alert('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      console.log('Sending ingredients:', ingredientList);

      const response = await fetch('/get-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ingredients: ingredientList }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recipe');
      }

      if (!data.mealSuggestion) {
        throw new Error('Recipe data is missing from server response');
      }

      setResult(data.mealSuggestion);
    } catch (error) {
      console.error('Error details:', error);
      setResult(`Error: ${error.message}\nPlease try again.`);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = (recipe) => {
    if (!recipe) return null;

    const sections = recipe.split('\n\n');
    
    return (
      <div className="recipe-container">
        {sections.map((section, index) => {
          if (!section.trim()) return null;

          const lines = section
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

          if (!lines.length) return null;

          return (
            <div key={index} className="recipe-section">
              <h3>{lines[0]}</h3>
              {lines.length > 1 && (
                <div className="section-content">
                  {lines[0].includes('👩‍🍳') ? (
                    <ol>
                      {lines.slice(1).map((line, i) => (
                        <li key={i}>{line.replace(/^\d+\.\s*/, '')}</li>
                      ))}
                    </ol>
                  ) : (
                    <ul>
                      {lines.slice(1).map((line, i) => (
                        <li key={i}>{line.replace(/^•\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container">
      <header>
        <h1>MunchMate</h1>
        <p className="tagline">Turn your ingredients into delicious, healthy meals!</p>
      </header>

      <div className="input-section">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="ingredients">Enter your ingredients (separated by commas)</label>
            <input
              type="text"
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients (comma-separated)"
              className="text-input"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading show">
          <div className="loading-spinner"></div>
          <p>Creating your personalized recipe...</p>
        </div>
      )}

      <div className="result">
        {result && renderRecipe(result)}
      </div>

      <footer>
        <div className="creators">
          <p className="credits">Created by Zain Khatri</p>
        </div>
      </footer>
    </div>
  );
};

export default App;