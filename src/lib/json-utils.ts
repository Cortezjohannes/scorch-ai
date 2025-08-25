/**
 * Utility functions for robust JSON parsing from AI-generated content
 */

/**
 * Robust JSON cleaning and parsing function that handles AI formatting issues
 */
export function cleanAndParseJSON(rawContent: string): any {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Invalid input: content must be a non-empty string');
  }

  let contentToProcess = rawContent.trim();
  
  console.log('Raw content length:', contentToProcess.length);
  console.log('Raw content excerpt:', contentToProcess.substring(0, 300) + '...');
  
  // Step 1: Extract JSON from markdown code blocks
  const jsonMatch = contentToProcess.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    contentToProcess = jsonMatch[1].trim();
    console.log('Extracted JSON from code block');
  }

  // Step 2: Find JSON boundaries (first { to last })
  const firstBrace = contentToProcess.indexOf('{');
  const lastBrace = contentToProcess.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    contentToProcess = contentToProcess.substring(firstBrace, lastBrace + 1);
    console.log('Extracted JSON boundaries');
  }

  console.log('After initial cleaning:', contentToProcess.substring(0, 300) + '...');

  // Step 3: Apply multiple parsing strategies
  const strategies = [
    // Strategy 1: Direct parsing (try as-is first)
    (content: string) => JSON.parse(content),
    
    // Strategy 2: Basic cleanup
    (content: string) => {
      const cleaned = content
        .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([^\\])"/g, '$1"') // Ensure quotes are properly formatted
        .trim();
      return JSON.parse(cleaned);
    },

    // Strategy 3: Control character removal
    (content: string) => {
      const cleaned = content
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .trim();
      return JSON.parse(cleaned);
    },

    // Strategy 4: Quote normalization
    (content: string) => {
      const cleaned = content
        .replace(/[\r\n\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/"/g, '"') // Normalize quotes
        .replace(/"/g, '"')
        .replace(/'/g, "'") // Normalize single quotes
        .replace(/'/g, "'")
        .replace(/,(\s*[}\]])/g, '$1')
        .trim();
      return JSON.parse(cleaned);
    },

    // Strategy 5: Aggressive cleanup with dialogue fixing
    (content: string) => {
      let cleaned = content
        .replace(/[\r\n\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        // Fix unescaped quotes within strings (common in dialogue)
        .replace(/"([^"]*)"([^",}]*)"([^"]*?)"/g, '"$1\\"$2\\"$3"')
        .replace(/,(\s*[}\]])/g, '$1')
        .trim();
      
      return JSON.parse(cleaned);
    },

    // Strategy 6: Character-by-character reconstruction
    (content: string) => {
      let cleaned = '';
      let inString = false;
      let escape = false;
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        
        if (escape) {
          cleaned += char;
          escape = false;
          continue;
        }
        
        if (char === '\\') {
          escape = true;
          cleaned += char;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
        }
        
        // Replace control characters and line breaks with spaces
        if (char.charCodeAt(0) < 32 && char !== '\n' && char !== '\r' && char !== '\t') {
          cleaned += ' ';
        } else if ((char === '\n' || char === '\r' || char === '\t') && inString) {
          cleaned += ' ';
        } else {
          cleaned += char;
        }
      }
      
      // Final cleanup
      cleaned = cleaned
          .replace(/\s+/g, ' ')
        .replace(/,(\s*[}\]])/g, '$1')
          .trim();
      
      return JSON.parse(cleaned);
    }
  ];
  
  // Try each strategy in order
  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`Trying strategy ${i + 1}...`);
      const result = strategies[i](contentToProcess);
      console.log(`✅ Successfully parsed JSON using strategy ${i + 1}`);
      return result;
    } catch (error) {
      console.log(`❌ Strategy ${i + 1} failed:`, (error as Error).message);
      if (i === strategies.length - 1) {
        // Last strategy failed, create fallback
        console.log('🚨 ALL JSON PARSING STRATEGIES FAILED');
        console.log('Raw content causing issues:', contentToProcess.substring(0, 500));
        
        // Return a fallback structure based on content type
        if (contentToProcess.includes('episode') || contentToProcess.includes('scenes')) {
          return createFallbackEpisodeStructure(contentToProcess);
        } else if (contentToProcess.includes('marketing')) {
          return createFallbackMarketingStructure();
        } else if (contentToProcess.includes('postProduction')) {
          return createFallbackPostProductionStructure();
        } else {
          return createGenericFallbackStructure(contentToProcess);
        }
      }
    }
  }
}

/**
 * Create fallback JSON structure based on content type
 */
export function createFallbackJSON(contentType: string, rawContent?: string, context?: any): any {
  console.log(`Creating fallback JSON for ${contentType}`);
  
  switch (contentType) {
    case 'script-expansion':
      return createFallbackEpisodeStructure(rawContent || '');
    
    case 'marketing':
      return createFallbackMarketingStructure();
    
    case 'postProduction':
      return createFallbackPostProductionStructure();
    
    case 'storyboard':
      return {
        episodes: [
          {
            number: "1",
            title: "Episode 1",
            summary: "Storyboard content was generated but couldn't be parsed properly",
            scenes: [
              {
                sceneNumber: "1",
                location: "Location",
                description: "Scene description",
                visualElements: ["Visual element 1", "Visual element 2"]
              }
            ]
          }
        ]
      };
      
    case 'props':
      return {
        props: {
          mainProps: [
            {
              name: "Main Prop",
              description: "Props content was generated but couldn't be parsed properly",
              importance: "high"
            }
          ]
        }
      };
    
    default:
      return createGenericFallbackStructure(rawContent || '');
  }
}

/**
 * Create fallback episode structure when JSON parsing fails
 */
function createFallbackEpisodeStructure(rawContent: string): any {
  console.log('Creating fallback episode structure');
  
  // Try to extract basic info from the raw content
  const titleMatch = rawContent.match(/"title":\s*"([^"]+)"/);
  const episodeMatch = rawContent.match(/"episode":\s*"([^"]+)"/);
  
  // Try to extract dialogue content even from malformed JSON
  const dialogueMatches = rawContent.match(/"line":\s*"([^"]+)"/g) || [];
  const characterMatches = rawContent.match(/"character":\s*"([^"]+)"/g) || [];
  
  const dialogue = [];
  for (let i = 0; i < Math.max(dialogueMatches.length, characterMatches.length, 1); i++) {
    const line = dialogueMatches[i] ? dialogueMatches[i].match(/"line":\s*"([^"]+)"/)?.[1] : "Dialogue content was generated but needs to be regenerated due to formatting issues.";
    const character = characterMatches[i] ? characterMatches[i].match(/"character":\s*"([^"]+)"/)?.[1] : "CHARACTER";
    
    dialogue.push({
      character: character,
      line: line
    });
  }
  
  return {
    episode: episodeMatch ? episodeMatch[1] : "1",
    title: titleMatch ? titleMatch[1] : "Episode Title",
    scenes: [
      {
        number: "1",
        location: "LOCATION - TIME",
        description: "Scene description was generated but couldn't be parsed properly due to JSON formatting issues.",
        dialogue: dialogue.length > 0 ? dialogue : [
          {
            character: "CHARACTER",
            line: "Dialogue content was generated successfully but couldn't be parsed due to JSON formatting. Please regenerate this content."
          }
        ]
      }
    ]
  };
}

/**
 * Create fallback marketing structure
 */
function createFallbackMarketingStructure(): any {
  console.log('Creating fallback marketing structure');
      return {
        marketing: {
          targetAudience: {
        primaryDemographic: "General audience",
        secondaryDemographics: ["Young adults", "Tech enthusiasts"]
      },
      marketingHooks: [
        {
          tagline: "Compelling Story",
          supportingCopy: "Marketing content was generated but couldn't be parsed properly."
        }
      ]
    }
  };
}

/**
 * Create fallback post-production structure
 */
function createFallbackPostProductionStructure(): any {
  console.log('Creating fallback post-production structure');
      return {
        postProduction: {
          overallStyle: { 
        colorGrading: "Post-production content was generated but couldn't be parsed properly.",
        cinematography: "Please regenerate this content for proper formatting."
      }
    }
  };
}

/**
 * Create generic fallback structure
 */
function createGenericFallbackStructure(rawContent: string): any {
  console.log('Creating generic fallback structure');
      return { 
    content: "Content was generated but couldn't be parsed properly",
    rawContent: rawContent.substring(0, 1000),
    error: "JSON parsing failed - content available in rawContent field"
  };
} 