/**
 * Utility functions for robust JSON parsing from AI-generated content
 * 
 * This module handles common AI output formatting issues:
 * - Markdown code blocks (```json ... ```)
 * - Extra text before/after JSON
 * - Malformed JSON (trailing commas, unescaped quotes, control characters)
 * - Both array [...] and object {...} structures
 */

/**
 * Robust JSON cleaning and parsing function that handles AI formatting issues
 * Supports both objects {...} and arrays [...]
 */
export function cleanAndParseJSON(rawContent: string): any {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Invalid input: content must be a non-empty string');
  }

  let contentToProcess = rawContent.trim();
  
  console.log('📄 Raw content length:', contentToProcess.length);
  console.log('📄 Raw content excerpt:', contentToProcess.substring(0, 200) + '...');
  
  // Step 1: Extract JSON from markdown code blocks (handles ```json and ```)
  const codeBlockMatch = contentToProcess.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    contentToProcess = codeBlockMatch[1].trim();
    console.log('📄 Extracted JSON from code block');
  }

  // Step 2: Determine if this is an array or object and find boundaries
  const firstBrace = contentToProcess.indexOf('{');
  const firstBracket = contentToProcess.indexOf('[');
  const lastBrace = contentToProcess.lastIndexOf('}');
  const lastBracket = contentToProcess.lastIndexOf(']');
  
  let isArray = false;
  let startIndex = -1;
  let endIndex = -1;
  
  // Determine if we're dealing with an array or object
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    // Starts with array
    isArray = true;
    startIndex = firstBracket;
    endIndex = lastBracket;
  } else if (firstBrace !== -1) {
    // Starts with object
    isArray = false;
    startIndex = firstBrace;
    endIndex = lastBrace;
  }
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    contentToProcess = contentToProcess.substring(startIndex, endIndex + 1);
    console.log(`📄 Extracted JSON boundaries (${isArray ? 'array' : 'object'})`);
  }

  // Step 3: Apply multiple parsing strategies
  const strategies = [
    // Strategy 1: Direct parsing (try as-is first)
    {
      name: 'Direct parse',
      fn: (content: string) => JSON.parse(content)
    },
    
    // Strategy 2: Basic cleanup - normalize whitespace, remove trailing commas
    {
      name: 'Basic cleanup',
      fn: (content: string) => {
      const cleaned = content
          .replace(/[\r\n\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/,(\s*[}\]])/g, '$1')
        .trim();
      return JSON.parse(cleaned);
      }
    },

    // Strategy 3: Control character removal
    {
      name: 'Control char removal',
      fn: (content: string) => {
      const cleaned = content
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/,(\s*[}\]])/g, '$1')
        .trim();
      return JSON.parse(cleaned);
      }
    },

    // Strategy 4: Quote normalization (smart quotes to regular)
    {
      name: 'Quote normalization',
      fn: (content: string) => {
      const cleaned = content
        .replace(/[\r\n\t]/g, ' ')
        .replace(/\s+/g, ' ')
          .replace(/[""]/g, '"')
          .replace(/['']/g, "'")
        .replace(/,(\s*[}\]])/g, '$1')
        .trim();
      return JSON.parse(cleaned);
      }
    },

    // Strategy 5: Fix unescaped newlines inside strings
    {
      name: 'Fix unescaped newlines',
      fn: (content: string) => {
        // Process character by character to fix newlines inside strings
        let result = '';
      let inString = false;
      let escape = false;
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        
        if (escape) {
            result += char;
          escape = false;
          continue;
        }
        
        if (char === '\\') {
          escape = true;
            result += char;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
            result += char;
            continue;
          }
          
          // Inside a string, replace newlines with escaped version
          if (inString && (char === '\n' || char === '\r')) {
            result += '\\n';
            continue;
          }
          
          // Inside a string, replace tabs
          if (inString && char === '\t') {
            result += '\\t';
            continue;
          }
          
          result += char;
        }
        
        return JSON.parse(result.replace(/,(\s*[}\]])/g, '$1'));
      }
    },

    // Strategy 6: Aggressive cleanup - fix common dialogue/quote issues
    {
      name: 'Aggressive cleanup',
      fn: (content: string) => {
        let cleaned = content
          .replace(/[\r\n\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        .replace(/,(\s*[}\]])/g, '$1')
          .trim();
      
        // Try to fix unescaped quotes inside string values
        // This is a heuristic approach
        cleaned = cleaned.replace(
          /:\s*"([^"]*)(?<!\\)"([^",}\]]+)"/g,
          (match, before, after) => {
            // If there's content after what looks like a closing quote, escape it
            if (after && !after.match(/^\s*[,}\]]/)) {
              return `: "${before}\\"${after}"`;
            }
            return match;
          }
        );
        
        return JSON.parse(cleaned);
      }
    },

    // Strategy 7: Complete incomplete JSON (fix unclosed brackets/braces)
    {
      name: 'Complete incomplete JSON',
      fn: (content: string) => {
        let cleaned = content
          .replace(/[\r\n\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
          .trim();
        
        // Count braces and brackets
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let escape = false;
        
        for (let i = 0; i < cleaned.length; i++) {
          const char = cleaned[i];
          
          if (escape) {
            escape = false;
            continue;
          }
          
          if (char === '\\') {
            escape = true;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') openBraces++;
            if (char === '}') openBraces--;
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;
          }
        }
        
        // If we're in a string, close it
        if (inString) {
          cleaned += '"';
        }
        
        // Remove trailing commas before closing
        cleaned = cleaned.replace(/,(\s*)$/, '$1');
        
        // Close incomplete structures
        while (openBraces > 0) {
          cleaned = cleaned.replace(/,(\s*)$/, '$1');
          cleaned += '}';
          openBraces--;
        }
        
        while (openBrackets > 0) {
          cleaned = cleaned.replace(/,(\s*)$/, '$1');
          cleaned += ']';
          openBrackets--;
        }
        
        // Final cleanup of trailing commas
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
        
      return JSON.parse(cleaned);
      }
    }
  ];
  
  // Try each strategy in order
  let lastError: Error | null = null;
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`📄 Trying strategy ${i + 1}: ${strategies[i].name}...`);
      const result = strategies[i].fn(contentToProcess);
      console.log(`✅ Successfully parsed JSON using strategy ${i + 1}: ${strategies[i].name}`);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Strategy ${i + 1} (${strategies[i].name}) failed:`, lastError.message);
    }
  }
  
  // All strategies failed - throw with details
  console.log('🚨 ALL JSON PARSING STRATEGIES FAILED');
  console.log('🚨 Content causing issues (first 500 chars):', contentToProcess.substring(0, 500));
  
  throw new Error(
    `Failed to parse JSON after ${strategies.length} strategies. ` +
    `Last error: ${lastError?.message}. ` +
    `Content excerpt: ${contentToProcess.substring(0, 200)}...`
  );
}

/**
 * Specialized parser for arrays (like script breakdown scenes)
 * Falls back to extracting individual objects if the array is malformed
 */
export function cleanAndParseJSONArray(rawContent: string): any[] {
  try {
    const result = cleanAndParseJSON(rawContent);
    
    // If result is already an array, return it
    if (Array.isArray(result)) {
      return result;
    }
    
    // If result is an object with a 'scenes' array, return that
    if (result && Array.isArray(result.scenes)) {
      return result.scenes;
    }
    
    // If result is an object, wrap it in an array
    if (result && typeof result === 'object') {
      return [result];
    }
    
    throw new Error('Result is not an array or object with scenes');
  } catch (error) {
    console.log('📄 Standard parsing failed, attempting to extract individual objects...');
    
    // Try to extract individual scene objects from the raw content
    const scenePattern = /\{[^{}]*"sceneNumber"\s*:\s*\d+[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const matches = rawContent.match(scenePattern);
    
    if (matches && matches.length > 0) {
      const validScenes: any[] = [];
      
      for (const match of matches) {
        try {
          const scene = JSON.parse(match);
          if (scene.sceneNumber !== undefined) {
            validScenes.push(scene);
          }
        } catch (e) {
          console.log('📄 Skipping malformed scene object');
        }
      }
      
      if (validScenes.length > 0) {
        console.log(`✅ Recovered ${validScenes.length} valid scene objects`);
        return validScenes;
      }
    }
    
    // Re-throw the original error
    throw error;
  }
}

/**
 * Specialized parser for storyboard data
 */
export function cleanAndParseStoryboardJSON(rawContent: string): any {
  try {
    const result = cleanAndParseJSON(rawContent);
    
    // Validate expected structure
    if (result && result.scenes && Array.isArray(result.scenes)) {
      return result;
    }
    
    // If we got an array directly, wrap it
    if (Array.isArray(result)) {
      return { scenes: result };
    }
    
    throw new Error('Invalid storyboard structure: expected object with scenes array');
  } catch (error) {
    console.log('📄 Standard parsing failed for storyboard, attempting recovery...');
    
    // Try to find the scenes array pattern
    const scenesMatch = rawContent.match(/"scenes"\s*:\s*\[([\s\S]*?)\]/);
    if (scenesMatch) {
      try {
        const scenesArray = JSON.parse(`[${scenesMatch[1]}]`);
        return { scenes: scenesArray };
      } catch (e) {
        // Continue to next recovery attempt
      }
    }
    
    // Re-throw original error
    throw error;
  }
}
