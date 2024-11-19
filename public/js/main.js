document.addEventListener('DOMContentLoaded', function() {
    const ingredientsInput = document.getElementById('ingredients');
    const generateButton = document.getElementById('generate-recipe');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');

    generateButton.addEventListener('click', async function() {
        const ingredients = ingredientsInput.value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        if (ingredients.length === 0) {
            alert('Please enter at least one ingredient');
            return;
        }

        loadingDiv.classList.add('show');
        resultDiv.innerHTML = '';

        try {
            console.log('Sending ingredients:', ingredients);

            const response = await fetch('/get-meal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ ingredients }),
            });

            console.log('Raw response:', response);
            const data = await response.json();
            console.log('Parsed response data:', data);
            console.log('Type of data.mealSuggestion:', typeof data.mealSuggestion);
            console.log('Content of data.mealSuggestion:', data.mealSuggestion);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate recipe');
            }

            if (!data.mealSuggestion) {
                console.error('Invalid response structure:', data);
                throw new Error('Recipe data is missing from server response');
            }

            // Ensure mealSuggestion is a string
            let mealSuggestion = data.mealSuggestion;

            if (typeof mealSuggestion !== 'string') {
                // If it's not a string, attempt to convert it
                mealSuggestion = JSON.stringify(mealSuggestion);
                console.warn('Converted mealSuggestion to string:', mealSuggestion);
            }

            // Create recipe container
            const recipeContainer = document.createElement('div');
            recipeContainer.className = 'recipe-container';

            // Process sections
            const sections = mealSuggestion.split('\n\n');
            console.log('Parsed sections:', sections);

            sections.forEach(section => {
                if (!section.trim()) return;

                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'recipe-section';

                // Split into lines and remove empty ones
                const lines = section
                    .split('\n')
                    .map(line => line.trim())
                    .filter(Boolean);

                if (!lines.length) return;

                // Create header (first line with emoji)
                const headerDiv = document.createElement('h3');
                headerDiv.textContent = lines[0];
                sectionDiv.appendChild(headerDiv);

                // Create content (remaining lines)
                if (lines.length > 1) {
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'section-content';

                    const contentLines = lines.slice(1);

                    if (contentLines[0].includes('•')) {
                        // Bullet points
                        const ul = document.createElement('ul');
                        contentLines.forEach(line => {
                            if (line.includes('•')) {
                                const li = document.createElement('li');
                                li.textContent = line.split('•')[1]?.trim() || line;
                                ul.appendChild(li);
                            }
                        });
                        contentDiv.appendChild(ul);
                    } else if (contentLines[0].match(/^\d+\./)) {
                        // Numbered list
                        const ol = document.createElement('ol');
                        contentLines.forEach(line => {
                            if (line.match(/^\d+\./)) {
                                const li = document.createElement('li');
                                li.textContent = line.replace(/^\d+\.\s*/, '').trim();
                                ol.appendChild(li);
                            }
                        });
                        contentDiv.appendChild(ol);
                    } else {
                        // Regular text
                        contentLines.forEach(line => {
                            const p = document.createElement('p');
                            p.textContent = line;
                            contentDiv.appendChild(p);
                        });
                    }

                    sectionDiv.appendChild(contentDiv);
                }

                recipeContainer.appendChild(sectionDiv);
            });

            // Clear and display results
            resultDiv.innerHTML = '';
            resultDiv.appendChild(recipeContainer);
            resultDiv.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error details:', error);
            resultDiv.innerHTML = `
                <div class="error">
                    Error: ${error.message}
                    <br>
                    Please try again.
                </div>`;
        } finally {
            loadingDiv.classList.remove('show');
        }
    });

    // Enter key support
    ingredientsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateButton.click();
        }
    });
});
