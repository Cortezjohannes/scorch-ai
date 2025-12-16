/**
 * Fund Request Email Service
 * 
 * Sends funding request emails to johannes@thegreenlitstudios.com
 */

import type { FundRequestSummary } from '@/types/preproduction'

export async function sendFundRequestEmail(
  summary: FundRequestSummary,
  readOnlyViewUrl: string
): Promise<void> {
  const recipientEmail = 'johannes@thegreenlitstudios.com'
  
  // Format email content
  const subject = `Greenlit Fund Request: ${summary.seriesTitle} - ${summary.arcTitle}`
  
  const htmlBody = generateHTMLEmail(summary, readOnlyViewUrl)
  const textBody = generateTextEmail(summary, readOnlyViewUrl)
  
  // Call API route to send email
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: recipientEmail,
      subject,
      html: htmlBody,
      text: textBody
    })
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to send email')
  }
}

function generateHTMLEmail(summary: FundRequestSummary, readOnlyViewUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: #121212; color: #00FF99; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .section { margin-bottom: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
    .section h2 { margin-top: 0; color: #121212; border-bottom: 2px solid #00FF99; padding-bottom: 10px; }
    .budget-highlight { background: #00FF99; color: #121212; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .budget-highlight h3 { margin: 0; font-size: 32px; }
    .episode-list { list-style: none; padding: 0; }
    .episode-item { padding: 15px; background: white; margin-bottom: 10px; border-radius: 4px; border-left: 4px solid #00FF99; }
    .cta-button { display: inline-block; background: #00FF99; color: #121212; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Greenlit Fund Request</h1>
    </div>
    
    <div class="budget-highlight">
      <h3>Total Arc Budget: $${summary.totalBudget.toLocaleString()}</h3>
      <p>${summary.episodeCount} Episodes • ${summary.arcTitle}</p>
    </div>
    
    <div class="section">
      <h2>Series Overview</h2>
      <p><strong>Series:</strong> ${summary.seriesTitle}</p>
      <p><strong>Genre:</strong> ${summary.genre}</p>
      <p><strong>Arc:</strong> ${summary.arcTitle} (${summary.episodeCount} episodes)</p>
      <p><strong>Premise:</strong> ${summary.storyBibleHighlights.premise}</p>
      <p><strong>Theme:</strong> ${summary.storyBibleHighlights.theme}</p>
      <p><strong>Tone:</strong> ${summary.storyBibleHighlights.tone}</p>
      <p><strong>Setting:</strong> ${summary.storyBibleHighlights.setting}</p>
    </div>
    
    <div class="section">
      <h2>Episode Breakdowns</h2>
      <ul class="episode-list">
        ${summary.episodeBreakdowns.map(ep => `
          <li class="episode-item">
            <strong>Episode ${ep.episodeNumber}: ${ep.episodeTitle}</strong><br>
            ${ep.sceneCount} scenes • Budget: $${ep.totalBudget.toLocaleString()}<br>
            Base: $${ep.baseBudget.toLocaleString()} | Optional: $${ep.optionalBudget.toLocaleString()} | 
            Locations: $${ep.locationCosts.toLocaleString()} | Equipment: $${ep.equipmentCosts.toLocaleString()} | 
            Props/Wardrobe: $${ep.propsWardrobeCosts.toLocaleString()}
          </li>
        `).join('')}
      </ul>
    </div>
    
    <div class="section">
      <h2>Cast Summary</h2>
      <p><strong>Confirmed:</strong> ${summary.castSummary.totalConfirmed} | <strong>Pending:</strong> ${summary.castSummary.totalPending}</p>
      <p><strong>Leads:</strong> ${summary.castSummary.leads.map(c => c.characterName).join(', ') || 'None'}</p>
      <p><strong>Supporting:</strong> ${summary.castSummary.supporting.length} characters</p>
    </div>
    
    <div class="section">
      <h2>Locations</h2>
      <p><strong>Total Locations:</strong> ${summary.locationSummary.totalLocations}</p>
      <p><strong>Unique Locations:</strong> ${summary.locationSummary.uniqueLocations}</p>
      <p><strong>Total Cost:</strong> $${summary.locationSummary.totalCost.toLocaleString()}</p>
      <p><strong>Reuse Savings:</strong> $${summary.locationSummary.reuseSavings.toLocaleString()}</p>
    </div>
    
    <div class="section">
      <h2>Equipment</h2>
      <p><strong>Total Items:</strong> ${summary.equipmentSummary.totalItems}</p>
      <p><strong>Rental Cost:</strong> $${summary.equipmentSummary.totalRentalCost.toLocaleString()}</p>
    </div>
    
    <div class="section">
      <h2>Production Timeline</h2>
      <p><strong>Shoot Start:</strong> ${summary.productionTimeline.estimatedShootStart}</p>
      <p><strong>Shoot End:</strong> ${summary.productionTimeline.estimatedShootEnd}</p>
      <p><strong>Post-Production:</strong> ${summary.productionTimeline.estimatedPostProduction}</p>
      <p><strong>Distribution:</strong> ${summary.productionTimeline.estimatedDistribution}</p>
      <p><strong>Deadline:</strong> ${summary.productionTimeline.deadline}</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${readOnlyViewUrl}" class="cta-button">View Full Series Details</a>
    </div>
    
    <div class="section">
      <h2>Contact Information</h2>
      <p><strong>Name:</strong> ${summary.userName}</p>
      ${summary.userEmail ? `<p><strong>Email:</strong> <a href="mailto:${summary.userEmail}">${summary.userEmail}</a></p>` : ''}
      ${summary.userPhone ? `<p><strong>Phone:</strong> ${summary.userPhone}</p>` : ''}
      <p><strong>User ID:</strong> ${summary.userId}</p>
    </div>
    
    <div class="section" style="background: #00FF99; color: #121212; border: 2px solid #00FF99;">
      <h2 style="color: #121212; border-bottom: 2px solid #121212;">Important Disclaimer</h2>
      <p style="color: #121212; font-weight: bold;">
        Funding approval is not required to complete and distribute your series on the Greenlit platform. The Greenlit Fund is designed as a supplement to boost production quality, not as a gatekeeper for what gets made. Creators maintain 100% freedom to create, produce, and distribute their series regardless of funding approval status.
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated email from the Greenlit platform.</p>
      <p>Request submitted on: ${new Date(summary.createdAt).toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateTextEmail(summary: FundRequestSummary, readOnlyViewUrl: string): string {
  return `
GREENLIT FUND REQUEST
=====================

Series: ${summary.seriesTitle}
Genre: ${summary.genre}
Arc: ${summary.arcTitle} (${summary.episodeCount} episodes)
Total Budget: $${summary.totalBudget.toLocaleString()}

SERIES OVERVIEW
---------------
Premise: ${summary.storyBibleHighlights.premise}
Theme: ${summary.storyBibleHighlights.theme}
Tone: ${summary.storyBibleHighlights.tone}
Setting: ${summary.storyBibleHighlights.setting}

EPISODE BREAKDOWNS
------------------
${summary.episodeBreakdowns.map(ep => `
Episode ${ep.episodeNumber}: ${ep.episodeTitle}
  ${ep.sceneCount} scenes • Budget: $${ep.totalBudget.toLocaleString()}
  Base: $${ep.baseBudget.toLocaleString()} | Optional: $${ep.optionalBudget.toLocaleString()}
  Locations: $${ep.locationCosts.toLocaleString()} | Equipment: $${ep.equipmentCosts.toLocaleString()} | Props/Wardrobe: $${ep.propsWardrobeCosts.toLocaleString()}
`).join('')}

CAST SUMMARY
------------
Confirmed: ${summary.castSummary.totalConfirmed} | Pending: ${summary.castSummary.totalPending}
Leads: ${summary.castSummary.leads.map(c => c.characterName).join(', ') || 'None'}
Supporting: ${summary.castSummary.supporting.length} characters

LOCATIONS
---------
Total Locations: ${summary.locationSummary.totalLocations}
Unique Locations: ${summary.locationSummary.uniqueLocations}
Total Cost: $${summary.locationSummary.totalCost.toLocaleString()}
Reuse Savings: $${summary.locationSummary.reuseSavings.toLocaleString()}

EQUIPMENT
---------
Total Items: ${summary.equipmentSummary.totalItems}
Rental Cost: $${summary.equipmentSummary.totalRentalCost.toLocaleString()}

PRODUCTION TIMELINE
-------------------
Shoot Start: ${summary.productionTimeline.estimatedShootStart}
Shoot End: ${summary.productionTimeline.estimatedShootEnd}
Post-Production: ${summary.productionTimeline.estimatedPostProduction}
Distribution: ${summary.productionTimeline.estimatedDistribution}
Deadline: ${summary.productionTimeline.deadline}

VIEW FULL SERIES DETAILS
------------------------
${readOnlyViewUrl}

CONTACT INFORMATION
-------------------
Name: ${summary.userName}
${summary.userEmail ? `Email: ${summary.userEmail}` : 'Email: Not provided'}
${summary.userPhone ? `Phone: ${summary.userPhone}` : 'Phone: Not provided'}
User ID: ${summary.userId}

IMPORTANT DISCLAIMER
---------------------
Funding approval is not required to complete and distribute your series on the Greenlit platform. The Greenlit Fund is designed as a supplement to boost production quality, not as a gatekeeper for what gets made. Creators maintain 100% freedom to create, produce, and distribute their series regardless of funding approval status.

---
Request submitted on: ${new Date(summary.createdAt).toLocaleString()}
  `.trim()
}

