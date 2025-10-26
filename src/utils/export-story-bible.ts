/**
 * Export Story Bible Utility
 * Provides functions to export story bibles in various formats
 */

export function exportAsJSON(storyBible: any, filename?: string) {
  const name = filename || storyBible.seriesTitle || 'story-bible'
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  
  const jsonData = JSON.stringify(storyBible, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizedName}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function copyAsText(storyBible: any) {
  let text = `# ${storyBible.seriesTitle || 'Story Bible'}\n\n`
  
  // Premise
  if (storyBible.premise) {
    text += `## Premise\n\n${storyBible.premise}\n\n`
  }
  
  // Overview
  if (storyBible.overview) {
    text += `## Overview\n\n${storyBible.overview}\n\n`
  }
  
  // Characters
  if (storyBible.mainCharacters?.length > 0) {
    text += `## Characters\n\n`
    storyBible.mainCharacters.forEach((char: any) => {
      text += `### ${char.name}\n`
      text += `**Archetype:** ${char.archetype}\n`
      text += `**Role:** ${char.premiseFunction}\n`
      if (char.oneLiner) text += `**One-Liner:** ${char.oneLiner}\n`
      text += `\n`
    })
  }
  
  // Story Arcs
  if (storyBible.narrativeArcs?.length > 0) {
    text += `## Story Arcs\n\n`
    storyBible.narrativeArcs.forEach((arc: any, index: number) => {
      text += `### Arc ${index + 1}: ${arc.title}\n`
      text += `${arc.description}\n\n`
    })
  }
  
  // World Elements
  if (storyBible.worldElements?.length > 0) {
    text += `## World Building\n\n`
    storyBible.worldElements.forEach((element: any) => {
      text += `### ${element.name}\n`
      text += `**Type:** ${element.type}\n`
      text += `${element.description}\n\n`
    })
  }
  
  // Copy to clipboard
  navigator.clipboard.writeText(text).then(() => {
    alert('✓ Story bible copied to clipboard!')
  }).catch(err => {
    console.error('Failed to copy:', err)
    alert('Failed to copy to clipboard')
  })
}

export function exportAsPDF(storyBible: any) {
  // For now, show a message that PDF export is coming soon
  // In the future, you could integrate jsPDF or a similar library
  alert('📄 PDF export coming soon! For now, use "Copy as Text" and paste into a document.')
}

export function downloadMarkdown(storyBible: any, filename?: string) {
  const name = filename || storyBible.seriesTitle || 'story-bible'
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  
  let markdown = `# ${storyBible.seriesTitle || 'Story Bible'}\n\n`
  
  // Add table of contents
  markdown += `## Table of Contents\n\n`
  markdown += `1. [Premise](#premise)\n`
  markdown += `2. [Overview](#overview)\n`
  markdown += `3. [Characters](#characters)\n`
  markdown += `4. [Story Arcs](#story-arcs)\n`
  markdown += `5. [World Building](#world-building)\n\n`
  markdown += `---\n\n`
  
  // Premise
  if (storyBible.premise) {
    markdown += `## Premise\n\n${storyBible.premise}\n\n`
  }
  
  // Overview
  if (storyBible.overview) {
    markdown += `## Overview\n\n${storyBible.overview}\n\n`
  }
  
  // Characters
  if (storyBible.mainCharacters?.length > 0) {
    markdown += `## Characters\n\n`
    storyBible.mainCharacters.forEach((char: any) => {
      markdown += `### ${char.name}\n\n`
      markdown += `**Archetype:** ${char.archetype}\n\n`
      markdown += `**Premise Function:** ${char.premiseFunction}\n\n`
      if (char.oneLiner) markdown += `**One-Liner:** ${char.oneLiner}\n\n`
      
      // Physical attributes
      if (char.physiology) {
        markdown += `#### Physical Description\n\n`
        markdown += `- **Age:** ${char.physiology.age || 'N/A'}\n`
        markdown += `- **Gender:** ${char.physiology.gender || 'N/A'}\n`
        markdown += `- **Appearance:** ${char.physiology.appearance || 'N/A'}\n\n`
      }
      
      // Backstory
      if (char.sociology?.backstory) {
        markdown += `#### Backstory\n\n${char.sociology.backstory}\n\n`
      }
      
      markdown += `---\n\n`
    })
  }
  
  // Story Arcs
  if (storyBible.narrativeArcs?.length > 0) {
    markdown += `## Story Arcs\n\n`
    storyBible.narrativeArcs.forEach((arc: any, index: number) => {
      markdown += `### Arc ${index + 1}: ${arc.title}\n\n`
      markdown += `${arc.description}\n\n`
      
      if (arc.episodes?.length > 0) {
        markdown += `**Episodes:**\n\n`
        arc.episodes.forEach((ep: any, epIndex: number) => {
          markdown += `${epIndex + 1}. **${ep.title}** - ${ep.description}\n`
        })
        markdown += `\n`
      }
      
      markdown += `---\n\n`
    })
  }
  
  // World Elements
  if (storyBible.worldElements?.length > 0) {
    markdown += `## World Building\n\n`
    storyBible.worldElements.forEach((element: any) => {
      markdown += `### ${element.name}\n\n`
      markdown += `**Type:** ${element.type}\n\n`
      markdown += `${element.description}\n\n`
      if (element.significance) {
        markdown += `**Significance:** ${element.significance}\n\n`
      }
      markdown += `---\n\n`
    })
  }
  
  // Download
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizedName}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}







