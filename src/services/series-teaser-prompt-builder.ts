/**
 * Series Teaser Trailer Prompt Builder
 * 
 * Builds adaptive prompts for 8-second series teaser trailers using VEO 3.1
 * Adapts to genre, tone, characters, and marketing strategy
 */

import type { StoryBible } from '@/services/story-bible-service'

export interface TeaserPromptContext {
  storyBible: StoryBible
  marketing: any
  episodeData?: any[] // Optional: for viral moments
}

/**
 * Build adaptive teaser prompt based on series data
 */
export function buildTeaserPrompt(context: TeaserPromptContext): string {
  const { storyBible, marketing, episodeData } = context
  
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'drama'
  const tone = storyBible.tone || storyBible.premise?.theme || 'dramatic'
  const premise = storyBible.premise?.premiseStatement || storyBible.seriesOverview || ''
  const seriesOverview = storyBible.seriesOverview || ''
  
  // Extract marketing elements
  const marketingHooks = marketing?.marketingHooks?.seriesHooks || []
  const keySellingPoints = marketing?.marketingStrategy?.keySellingPoints || []
  const primaryApproach = marketing?.marketingStrategy?.primaryApproach || ''
  
  // Extract world building
  const setting = storyBible.worldBuilding?.setting || ''
  const locations = storyBible.worldBuilding?.locations || []
  const timePeriod = storyBible.worldBuilding?.timePeriod || ''
  
  // Extract main characters (use descriptions, not images)
  const mainCharacters = (storyBible.mainCharacters || []).slice(0, 3) // Top 3 for 8-second teaser
  const characterDescriptions = mainCharacters.map((char: any) => {
    const name = char.name || 'Character'
    const physicalDesc = char.physicalDescription || char.description || ''
    const role = char.archetype || char.premiseRole || char.role || ''
    const traits = char.keyTraits || char.traits || ''
    
    let desc = `${name}`
    if (role) desc += ` (${role})`
    if (physicalDesc) desc += `: ${physicalDesc.substring(0, 100)}`
    if (traits) desc += ` - ${traits.substring(0, 50)}`
    
    return desc
  })
  
  // Extract viral moments from episodes if available
  const viralMoments: string[] = []
  if (episodeData && Array.isArray(episodeData)) {
    episodeData.forEach((ep: any) => {
      if (ep.marketing?.viralPotentialScenes) {
        ep.marketing.viralPotentialScenes.slice(0, 2).forEach((scene: any) => {
          if (scene.hook) viralMoments.push(scene.hook)
        })
      }
    })
  }
  
  // Determine visual style based on genre
  const visualStyle = getGenreVisualStyle(genre)
  const editingStyle = getGenreEditingStyle(genre)
  
  // Get genre-specific content beats
  const genreContent = getGenreSpecificContent(genre, storyBible)
  
  // Build the prompt - cinematic teaser style, not corny
  let prompt = `Create a cinematic 8-second vertical teaser trailer (9:16) for "${seriesTitle}". This is a professional, high-energy teaser - NOT a cheesy promo. Think HBO/Netflix quality, not YouTube clickbait.

GENRE: ${genre}
TONE: ${tone}
VISUAL STYLE: ${visualStyle}

TEASER STRUCTURE (8 seconds):
- 0-1.5s: Quick visual punch - ${marketingHooks[0] ? `A single powerful moment: ${marketingHooks[0]}` : genreContent.openingBeat}
- 1.5-4s: Rapid montage - Quick cuts showing: ${genreContent.montageElements.slice(0, 4).join(', ')}. No dialogue, just pure visual storytelling that captures the essence of ${genre}.
- 4-6.5s: Tension peak - ${viralMoments[0] || keySellingPoints[0] || genreContent.tensionPeak}
- 6.5-8s: Title reveal - "${seriesTitle}" appears with minimal, elegant typography. No cheesy effects.

CHARACTERS (visual descriptions only - no names):
${characterDescriptions.map((desc, idx) => {
    // Extract just the visual/physical description
    const parts = desc.split(':')
    const visualDesc = parts.length > 1 ? parts[1].trim() : desc
    return `${idx + 1}. ${visualDesc.substring(0, 120)}`
  }).join('\n')}

SETTING & ATMOSPHERE:
${setting ? `${setting}` : 'Contemporary urban environment'}
${timePeriod ? `Period: ${timePeriod}` : ''}
${locations.length > 0 ? `Locations: ${locations.slice(0, 2).map((loc: any) => loc.name || loc).join(', ')}` : ''}
${genreContent.atmosphericDetails ? `Atmosphere: ${genreContent.atmosphericDetails}` : ''}

CORE STORY BEAT:
${premise ? premise.substring(0, 150) : seriesOverview.substring(0, 150) || 'A compelling narrative with high stakes'}

VISUAL DIRECTION:
- Portrait format (9:16) - optimized for mobile
- Cinematic, not commercial - think film trailer, not ad
- Dynamic camera work: handheld energy, tracking shots, dramatic angles
- ${visualStyle}
- Fast-paced but not chaotic - each cut serves a purpose
- ${editingStyle}
- Color grading that matches ${tone} tone
- No cheesy transitions, no over-the-top effects
- Professional, sophisticated aesthetic

NARRATION STYLE:
- Minimal, impactful voiceover (if any)
- Let visuals tell the story
- If narration is included, it should be:
  * Short, punchy phrases
  * Match the ${tone} tone
  * Build intrigue, not explain
  * End with series title naturally

WHAT TO AVOID:
- No corny dialogue or overacting
- No cheesy music or sound effects
- No obvious "coming soon" style graphics
- No static talking heads
- No exposition dumps
- No generic stock footage feel

WHAT TO INCLUDE:
- Real, authentic moments
- Visual storytelling over dialogue
- Cinematic composition
- Emotional beats, not plot points
- Style and atmosphere over information
- Professional production value`

  return prompt
}

/**
 * Get genre-specific content beats for teaser
 * Returns what to show based on genre, grounded in the actual story bible data
 */
function getGenreSpecificContent(genre: string, storyBible: StoryBible): {
  openingBeat: string
  montageElements: string[]
  tensionPeak: string
  atmosphericDetails: string
} {
  const genreLower = genre.toLowerCase()
  
  // Extract story bible data for grounding
  const setting = storyBible.worldBuilding?.setting || ''
  const locations = storyBible.worldBuilding?.locations || []
  const timePeriod = storyBible.worldBuilding?.timePeriod || ''
  const premise = storyBible.premise?.premiseStatement || storyBible.seriesOverview || ''
  const mainCharacters = storyBible.mainCharacters || []
  
  // Get location names for use in prompts
  const locationNames = locations.slice(0, 3).map((loc: any) => loc.name || loc).filter(Boolean)
  const primaryLocation = locationNames[0] || setting || 'the main setting'
  const secondaryLocation = locationNames[1] || ''
  
  // Get character info for use in prompts
  const protagonistName = mainCharacters[0]?.name || 'the protagonist'
  const protagonistDesc = mainCharacters[0]?.physicalDescription || mainCharacters[0]?.description || ''
  const antagonistName = mainCharacters.find((c: any) => 
    c.archetype?.toLowerCase().includes('antagonist') || 
    c.role?.toLowerCase().includes('antagonist') ||
    c.premiseRole?.toLowerCase().includes('antagonist')
  )?.name || mainCharacters[1]?.name || ''
  
  // Extract key conflict or theme from premise
  const premiseSnippet = premise.substring(0, 100)
  
  // Office Drama / Corporate
  if (genreLower.includes('office') || genreLower.includes('corporate') || genreLower.includes('workplace')) {
    return {
      openingBeat: `A tense moment in ${primaryLocation || 'a corporate boardroom'} - ${protagonistName} in a power dynamic, a decisive stare-down or gesture that signals stakes`,
      montageElements: [
        `${protagonistName} walking through ${primaryLocation || 'corporate hallways'} with purpose`,
        'Close-up of hands on documents, keyboards, or phones - decisions being made',
        `Elevator doors or office doors opening to reveal key characters`,
        `${secondaryLocation ? `A scene in ${secondaryLocation}` : 'Conference room with visible tension between colleagues'}`,
        'Glass walls and open offices showing hierarchy and surveillance',
        `${antagonistName ? `${antagonistName} watching or confronting` : 'Characters in business attire, power dynamics visible'}`
      ],
      tensionPeak: `A confrontation between ${protagonistName}${antagonistName ? ` and ${antagonistName}` : ''} - a power play, betrayal, or decisive moment that captures: ${premiseSnippet}`,
      atmosphericDetails: `${setting || 'Modern corporate environment'}, ${timePeriod || 'contemporary'}, glass and steel, the tension of ambition and competition`
    }
  }
  
  // High School Drama
  if (genreLower.includes('high school') || genreLower.includes('teen') || (genreLower.includes('school') && !genreLower.includes('college'))) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'a crowded school hallway'} - a moment of social tension, lockers slamming, or eyes meeting across a crowd`,
      montageElements: [
        `${protagonistName} at a locker or in a classroom, the weight of adolescence visible`,
        `${secondaryLocation ? `A glimpse of ${secondaryLocation}` : 'Cafeteria or common area showing social dynamics'}`,
        'Students in groups vs. someone alone - social hierarchies',
        `${antagonistName ? `${antagonistName} in their element` : 'Quick cuts of school life - sports, classes, hallways'}`,
        'Phones, notes, whispers - the currency of high school drama',
        'A moment that hints at: ' + premiseSnippet.substring(0, 50)
      ],
      tensionPeak: `A confrontation or revelation involving ${protagonistName} - a secret exposed, a social reckoning, or the moment everything changes`,
      atmosphericDetails: `${setting || 'High school environment'} - lockers, fluorescent lights, the energy and anxiety of youth, social stakes that feel like everything`
    }
  }
  
  // Rom-Com / Romance
  if (genreLower.includes('rom-com') || genreLower.includes('romantic comedy') || (genreLower.includes('romance') && genreLower.includes('comedy'))) {
    const loveInterest = mainCharacters[1]?.name || 'the love interest'
    return {
      openingBeat: `A meet-cute moment - ${protagonistName} and ${loveInterest}'s eyes meeting${primaryLocation ? ` in ${primaryLocation}` : ''}, an accidental collision, or serendipitous encounter`,
      montageElements: [
        `${protagonistName} and ${loveInterest} in close proximity, chemistry building`,
        `Shared glances and smiles${secondaryLocation ? ` in ${secondaryLocation}` : ''}`,
        'Walking together or in parallel, the dance of attraction',
        'A moment of awkward charm or unexpected connection',
        `${primaryLocation ? `The atmosphere of ${primaryLocation}` : 'Romantic urban settings'} - cafes, streets, parks`,
        'Body language showing attraction mixed with hesitation'
      ],
      tensionPeak: `The moment of romantic tension between ${protagonistName} and ${loveInterest} - almost kissing, a confession, or the realization of feelings`,
      atmosphericDetails: `${setting || 'Warm, inviting urban settings'}, soft lighting, ${timePeriod || 'contemporary'}, the feeling of possibility and connection`
    }
  }
  
  // Horror
  if (genreLower.includes('horror') || genreLower.includes('scary')) {
    return {
      openingBeat: `Something wrong in ${primaryLocation || 'an unsettling space'} - a shadow, a sound, ${protagonistName} sensing danger before seeing it`,
      montageElements: [
        `${primaryLocation ? `The eerie atmosphere of ${primaryLocation}` : 'Dark corridors or empty spaces that shouldn\'t be empty'}`,
        `${protagonistName} reacting to something unseen, fear building`,
        'A door slowly opening, a reflection that\'s wrong, something just out of frame',
        `${secondaryLocation ? `A glimpse of ${secondaryLocation} that adds dread` : 'Quick cuts of unsettling details - objects, shadows, textures'}`,
        'Close-ups of fearful expressions, held breath, tension',
        'The environment turning hostile: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The peak of horror for ${protagonistName} - a reveal, a confrontation with what haunts ${primaryLocation || 'this place'}, terror made visible`,
      atmosphericDetails: `${setting || 'Dark, foreboding environment'}, ${timePeriod || 'isolated in time'}, shadows that move, the feeling of being hunted`
    }
  }
  
  // Thriller / Action
  if (genreLower.includes('thriller') || genreLower.includes('action')) {
    return {
      openingBeat: `${protagonistName} in danger or on the move - high stakes visible immediately${primaryLocation ? ` in ${primaryLocation}` : ''}, urgency from frame one`,
      montageElements: [
        `${protagonistName} running, fighting, or making a critical decision`,
        `Close-ups of hands, eyes, weapons, or evidence - the details that matter`,
        `${primaryLocation ? `Action through ${primaryLocation}` : 'Pursuit through urban or isolated terrain'}`,
        `${antagonistName ? `${antagonistName} in pursuit or confrontation` : 'The threat closing in'}`,
        `${secondaryLocation ? `A tense moment in ${secondaryLocation}` : 'Reveals, discoveries, the stakes becoming clear'}`,
        'Time pressure visible: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The peak confrontation - ${protagonistName}${antagonistName ? ` versus ${antagonistName}` : ' facing the ultimate threat'}, survival on the line`,
      atmosphericDetails: `${setting || 'High-stakes environment'}, ${timePeriod || 'urgent present'}, every second counts, consequence visible in every frame`
    }
  }
  
  // Sci-Fi
  if (genreLower.includes('sci-fi') || genreLower.includes('science fiction') || genreLower.includes('futuristic')) {
    return {
      openingBeat: `Advanced technology or an otherworldly moment${primaryLocation ? ` in ${primaryLocation}` : ''} - ${protagonistName} confronting the future or the unknown`,
      montageElements: [
        `${primaryLocation ? `The futuristic world of ${primaryLocation}` : 'Advanced technology, interfaces, or environments'}`,
        `${protagonistName} interacting with technology or navigating this world`,
        `${secondaryLocation ? `A glimpse of ${secondaryLocation}` : 'Spaceships, cityscapes, or otherworldly landscapes'}`,
        'The contrast between human emotion and technological advancement',
        `${antagonistName ? `${antagonistName} representing the threat` : 'Scientific discovery or technological danger'}`,
        'The core conflict: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `A revelation or collision between humanity and technology - ${protagonistName} at the center of a discovery or confrontation that changes everything`,
      atmosphericDetails: `${setting || 'Futuristic environment'}, ${timePeriod || 'advanced future'}, technology both beautiful and threatening, humanity persisting`
    }
  }
  
  // Crime / Mystery
  if (genreLower.includes('crime') || genreLower.includes('mystery') || genreLower.includes('detective')) {
    return {
      openingBeat: `Evidence, a crime scene, or ${protagonistName} on the trail of truth${primaryLocation ? ` in ${primaryLocation}` : ''} - the investigation begins`,
      montageElements: [
        `${protagonistName} investigating, following leads, piecing together clues`,
        `${primaryLocation ? `The gritty reality of ${primaryLocation}` : 'Crime scenes, interrogation rooms, urban shadows'}`,
        `${antagonistName ? `${antagonistName} - the adversary or suspect` : 'Confrontations, accusations, the hunt for truth'}`,
        `${secondaryLocation ? `Evidence found in ${secondaryLocation}` : 'Objects of importance - weapons, documents, clues'}`,
        'The contrast between order and chaos, law and crime',
        'The mystery deepens: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The moment of revelation or confrontation - ${protagonistName} facing the truth${antagonistName ? ` and ${antagonistName}` : ''}, justice and danger colliding`,
      atmosphericDetails: `${setting || 'Urban noir environment'}, ${timePeriod || 'contemporary shadows'}, moral ambiguity, the weight of truth`
    }
  }
  
  // Medical Drama
  if (genreLower.includes('medical') || genreLower.includes('hospital') || genreLower.includes('doctor') || genreLower.includes('nurse')) {
    return {
      openingBeat: `A life-or-death moment in ${primaryLocation || 'a hospital'} - ${protagonistName} making a critical decision, scrubbing in, or racing against time`,
      montageElements: [
        `${protagonistName} in scrubs, moving through ${primaryLocation || 'hospital corridors'} with urgency`,
        'Close-ups of medical equipment, monitors beeping, hands working precisely',
        `${secondaryLocation ? `A tense scene in ${secondaryLocation}` : 'Operating rooms, emergency bays, patient bedsides'}`,
        `${antagonistName ? `Tension with ${antagonistName}` : 'Colleagues in heated discussion, ethical dilemmas visible'}`,
        'The weight of responsibility - lives in the balance',
        'Medical stakes: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The critical moment - ${protagonistName} in surgery, at a bedside, or facing a decision where seconds matter`,
      atmosphericDetails: `${setting || 'Hospital environment'}, ${timePeriod || 'contemporary'}, sterile whites and blues, the pressure of saving lives`
    }
  }
  
  // Legal Drama
  if (genreLower.includes('legal') || genreLower.includes('lawyer') || genreLower.includes('courtroom') || genreLower.includes('attorney') || genreLower.includes('law firm')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'a courtroom'} - a powerful opening statement, a damning piece of evidence, or a moment of legal confrontation`,
      montageElements: [
        `${protagonistName} commanding ${primaryLocation || 'the courtroom'}, papers in hand, conviction visible`,
        'Gavels, law books, witness stands - the theater of justice',
        `${secondaryLocation ? `Strategy sessions in ${secondaryLocation}` : 'Lawyers in conference rooms, late nights with case files'}`,
        `${antagonistName ? `${antagonistName} as opposing counsel or adversary` : 'Witnesses, judges, the weight of testimony'}`,
        'Close-ups of reactions - jury members, defendants, the accused',
        'The case: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The pivotal moment in court - ${protagonistName} delivering a closing argument, a witness breaking, or justice hanging in the balance`,
      atmosphericDetails: `${setting || 'Courtroom and law office'}, ${timePeriod || 'contemporary'}, wood-paneled authority, the weight of the law`
    }
  }
  
  // Sports Drama
  if (genreLower.includes('sport') || genreLower.includes('athletic') || genreLower.includes('football') || genreLower.includes('basketball') || genreLower.includes('soccer') || genreLower.includes('boxing') || genreLower.includes('baseball')) {
    return {
      openingBeat: `${protagonistName} in motion - training, competing, or preparing for ${primaryLocation || 'the big game'}, athletic intensity visible`,
      montageElements: [
        `${protagonistName} pushing physical limits, sweat and determination`,
        `${primaryLocation ? `The arena of ${primaryLocation}` : 'Training facilities, locker rooms, playing fields'}`,
        'Close-ups of athletic movement - muscles, focus, precision',
        `${antagonistName ? `${antagonistName} as rival or obstacle` : 'Teammates, coaches, the pressure of competition'}`,
        `${secondaryLocation ? `A moment in ${secondaryLocation}` : 'Crowds, scoreboards, the weight of expectation'}`,
        'The stakes: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The decisive moment - ${protagonistName} in the final play, the championship point, or facing their greatest athletic challenge`,
      atmosphericDetails: `${setting || 'Athletic arena'}, ${timePeriod || 'contemporary'}, the energy of competition, triumph and defeat on the line`
    }
  }
  
  // Political Drama
  if (genreLower.includes('politic') || genreLower.includes('government') || genreLower.includes('election') || genreLower.includes('campaign') || genreLower.includes('white house') || genreLower.includes('congress')) {
    return {
      openingBeat: `Power in motion - ${protagonistName} in ${primaryLocation || 'the halls of power'}, a speech, a vote, or a backroom deal`,
      montageElements: [
        `${protagonistName} navigating ${primaryLocation || 'political corridors'}, allies and enemies everywhere`,
        'Press conferences, debates, cameras and microphones',
        `${secondaryLocation ? `Secret meetings in ${secondaryLocation}` : 'Campaign war rooms, private offices, whispered conversations'}`,
        `${antagonistName ? `${antagonistName} as political rival` : 'Advisors, opponents, the machinery of power'}`,
        'Votes being cast, polls, the public watching',
        'The political stakes: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The moment of political reckoning - ${protagonistName} facing a scandal, a vote, or a decision that changes everything`,
      atmosphericDetails: `${setting || 'Political institutions'}, ${timePeriod || 'contemporary'}, power suits and marble halls, democracy and corruption intertwined`
    }
  }
  
  // War / Military
  if (genreLower.includes('war') || genreLower.includes('military') || genreLower.includes('soldier') || genreLower.includes('combat') || genreLower.includes('army') || genreLower.includes('navy')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'a combat zone'} - the chaos of battle, a moment of duty, or the calm before the storm`,
      montageElements: [
        `${protagonistName} in uniform, moving through ${primaryLocation || 'hostile terrain'}`,
        'Military equipment, weapons, the tools of warfare',
        `${secondaryLocation ? `A scene in ${secondaryLocation}` : 'Bunkers, bases, battlefields'}`,
        `${antagonistName ? `${antagonistName} as enemy or moral challenge` : 'Comrades, commanders, the bonds of service'}`,
        'The human cost - faces, letters home, moments of humanity in war',
        'The mission: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The battle climax - ${protagonistName} in combat, facing an impossible choice, or the moment that defines a soldier`,
      atmosphericDetails: `${setting || 'War zone'}, ${timePeriod || 'the era of conflict'}, dust and smoke, honor and horror`
    }
  }
  
  // Period Drama / Historical
  if (genreLower.includes('period') || genreLower.includes('historical') || genreLower.includes('victorian') || genreLower.includes('medieval') || genreLower.includes('regency') || genreLower.includes('1920s') || genreLower.includes('1950s') || genreLower.includes('1960s')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'an elegant period setting'} - the fashion, the manners, the constraints of ${timePeriod || 'the era'}`,
      montageElements: [
        `${protagonistName} in period costume, navigating ${primaryLocation || 'society'}`,
        `The world of ${timePeriod || 'the past'} - architecture, fashion, social rituals`,
        `${secondaryLocation ? `A glimpse of ${secondaryLocation}` : 'Ballrooms, estates, period-specific locations'}`,
        `${antagonistName ? `${antagonistName} as social adversary` : 'Class distinctions, social expectations, forbidden desires'}`,
        'Details of the era - carriages, letters, candlelight or gaslight',
        'The story of the time: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `A scandal, a revelation, or a moment where ${protagonistName} defies the conventions of ${timePeriod || 'their time'}`,
      atmosphericDetails: `${setting || 'Period-accurate environment'}, ${timePeriod || 'historical era'}, the beauty and constraints of the past`
    }
  }
  
  // Family Drama
  if (genreLower.includes('family') || genreLower.includes('dynasty') || genreLower.includes('generational') || genreLower.includes('siblings') || genreLower.includes('inheritance')) {
    return {
      openingBeat: `A family gathering in ${primaryLocation || 'the family home'} - ${protagonistName} amid relatives, tension simmering beneath the surface`,
      montageElements: [
        `${protagonistName} with family members, love and conflict intertwined`,
        `${primaryLocation ? `The family's world of ${primaryLocation}` : 'Dining tables, living rooms, places of family history'}`,
        `${antagonistName ? `${antagonistName} as family rival or estranged relation` : 'Parents, siblings, the weight of family expectations'}`,
        `${secondaryLocation ? `A memory or scene in ${secondaryLocation}` : 'Family photos, heirlooms, generational echoes'}`,
        'Conversations that carry decades of subtext',
        'The family dynamic: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The family confrontation - ${protagonistName} facing ${antagonistName || 'a family member'}, secrets revealed, bonds tested`,
      atmosphericDetails: `${setting || 'Family spaces'}, ${timePeriod || 'contemporary'}, the warmth and wounds of home, blood ties that bind and break`
    }
  }
  
  // Musical
  if (genreLower.includes('musical') || genreLower.includes('broadway') || genreLower.includes('singing') || genreLower.includes('dance') || (genreLower.includes('music') && genreLower.includes('drama'))) {
    return {
      openingBeat: `${protagonistName} performing or about to perform in ${primaryLocation || 'a stage or venue'} - the lights, the audience, the moment before the music`,
      montageElements: [
        `${protagonistName} singing, dancing, or rehearsing with passion`,
        `${primaryLocation ? `The stage of ${primaryLocation}` : 'Theaters, rehearsal spaces, performance venues'}`,
        'Quick cuts synced to rhythm - feet moving, voices rising, instruments playing',
        `${antagonistName ? `${antagonistName} as rival performer` : 'Ensemble members, choreography, the cast in motion'}`,
        `${secondaryLocation ? `An emotional moment in ${secondaryLocation}` : 'Backstage, mirrors, the transformation into performer'}`,
        'The show: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The performance climax - ${protagonistName} hitting the high note, the final dance, or the moment the show comes together`,
      atmosphericDetails: `${setting || 'Performance venue'}, ${timePeriod || 'contemporary'}, spotlights and shadows, the magic of live performance`
    }
  }
  
  // Western
  if (genreLower.includes('western') || genreLower.includes('cowboy') || genreLower.includes('frontier') || genreLower.includes('wild west')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'a dusty frontier town'} - a standoff, a ride into town, or the weight of the gun on their hip`,
      montageElements: [
        `${protagonistName} on horseback or walking through ${primaryLocation || 'the frontier'}`,
        'Dusty streets, saloons, wide open landscapes',
        `${secondaryLocation ? `A scene in ${secondaryLocation}` : 'Ranches, canyons, the unforgiving wilderness'}`,
        `${antagonistName ? `${antagonistName} as outlaw or rival` : 'Sheriffs, outlaws, settlers - the cast of the frontier'}`,
        'Close-ups of hands near holsters, eyes squinting in the sun',
        'The frontier conflict: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The showdown - ${protagonistName} facing ${antagonistName || 'their enemy'} at high noon, justice delivered by gunsmoke`,
      atmosphericDetails: `${setting || 'The American frontier'}, ${timePeriod || '19th century West'}, dust and leather, law and lawlessness`
    }
  }
  
  // Fantasy
  if (genreLower.includes('fantasy') || genreLower.includes('magic') || genreLower.includes('sword') || genreLower.includes('dragon') || genreLower.includes('wizard') || genreLower.includes('kingdom')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'a fantastical realm'} - magic crackling, a quest beginning, or a world unlike our own`,
      montageElements: [
        `${protagonistName} wielding magic or weapons in ${primaryLocation || 'the fantasy world'}`,
        'Magical effects, mythical creatures, otherworldly landscapes',
        `${secondaryLocation ? `The realm of ${secondaryLocation}` : 'Castles, forests, ancient ruins'}`,
        `${antagonistName ? `${antagonistName} as dark lord or magical adversary` : 'Companions, mentors, magical beings'}`,
        'Artifacts, spells, the visual language of fantasy',
        'The quest: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The magical climax - ${protagonistName} facing ${antagonistName || 'the darkness'}, power unleashed, destiny fulfilled`,
      atmosphericDetails: `${setting || 'Fantasy realm'}, ${timePeriod || 'mythical age'}, wonder and danger, magic that costs`
    }
  }
  
  // Supernatural
  if (genreLower.includes('supernatural') || genreLower.includes('paranormal') || genreLower.includes('ghost') || genreLower.includes('vampire') || genreLower.includes('werewolf') || genreLower.includes('demon')) {
    return {
      openingBeat: `Something beyond natural in ${primaryLocation || 'an ordinary place'} - ${protagonistName} encountering the supernatural, reality bending`,
      montageElements: [
        `${protagonistName} facing or becoming something supernatural`,
        `${primaryLocation ? `The haunted atmosphere of ${primaryLocation}` : 'Liminal spaces where the supernatural intrudes'}`,
        'Shadows that move wrong, eyes that glow, transformations',
        `${antagonistName ? `${antagonistName} as supernatural entity` : 'Spirits, monsters, the other side bleeding through'}`,
        `${secondaryLocation ? `A paranormal event in ${secondaryLocation}` : 'Rituals, investigations, the hunt for answers'}`,
        'The supernatural stakes: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The supernatural confrontation - ${protagonistName} facing ${antagonistName || 'the entity'}, the veil between worlds at its thinnest`,
      atmosphericDetails: `${setting || 'Reality with supernatural elements'}, ${timePeriod || 'any time the veil is thin'}, the uncanny, the impossible made real`
    }
  }
  
  // Heist / Caper
  if (genreLower.includes('heist') || genreLower.includes('caper') || genreLower.includes('con') || genreLower.includes('theft') || genreLower.includes('robbery')) {
    return {
      openingBeat: `The plan in motion - ${protagonistName} surveying ${primaryLocation || 'the target'}, a crew assembling, or the heist beginning`,
      montageElements: [
        `${protagonistName} planning, executing, or improvising`,
        `${primaryLocation ? `The target: ${primaryLocation}` : 'Vaults, museums, casinos - places of high security'}`,
        'The crew in action - specialists, roles, synchronized movement',
        `${antagonistName ? `${antagonistName} as security or rival thief` : 'Security systems, guards, the obstacles'}`,
        `${secondaryLocation ? `A twist in ${secondaryLocation}` : 'Blueprints, gadgets, the tools of the trade'}`,
        'The job: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The heist climax - ${protagonistName} and crew at the critical moment, everything on the line, the big score or bust`,
      atmosphericDetails: `${setting || 'High-security location'}, ${timePeriod || 'contemporary'}, slick suits and clever plans, style meets crime`
    }
  }
  
  // Spy / Espionage
  if (genreLower.includes('spy') || genreLower.includes('espionage') || genreLower.includes('secret agent') || genreLower.includes('cia') || genreLower.includes('mi6') || genreLower.includes('undercover')) {
    return {
      openingBeat: `${protagonistName} in the shadows of ${primaryLocation || 'a dangerous location'} - a mission, a cover identity, or a covert operation`,
      montageElements: [
        `${protagonistName} in disguise or covert action`,
        `${primaryLocation ? `The world of ${primaryLocation}` : 'Safe houses, embassies, exotic locations'}`,
        'Tradecraft - dead drops, surveillance, coded messages',
        `${antagonistName ? `${antagonistName} as enemy agent` : 'Handlers, assets, the web of espionage'}`,
        `${secondaryLocation ? `A meet in ${secondaryLocation}` : 'Hotel rooms, rooftops, the spaces between nations'}`,
        'The mission: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The spy confrontation - ${protagonistName} exposed, betrayed, or facing ${antagonistName || 'the enemy'} with cover blown`,
      atmosphericDetails: `${setting || 'International locations'}, ${timePeriod || 'contemporary'}, shadows and secrets, loyalty tested`
    }
  }
  
  // Disaster
  if (genreLower.includes('disaster') || genreLower.includes('catastrophe') || genreLower.includes('earthquake') || genreLower.includes('tornado') || genreLower.includes('tsunami')) {
    return {
      openingBeat: `The first signs of catastrophe in ${primaryLocation || 'an ordinary place'} - ${protagonistName} realizing something is terribly wrong`,
      montageElements: [
        `${protagonistName} reacting as disaster strikes ${primaryLocation || 'the city'}`,
        'The scale of destruction - buildings, nature, chaos',
        `${secondaryLocation ? `Devastation in ${secondaryLocation}` : 'Evacuation, rescue, survival'}`,
        `${antagonistName ? `${antagonistName} complicating survival` : 'Strangers becoming allies, families separated'}`,
        'The elements unleashed - fire, water, earth, wind',
        'The catastrophe: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The peak of disaster - ${protagonistName} in the heart of destruction, survival on the line, heroism or desperation`,
      atmosphericDetails: `${setting || 'Urban or natural environment'}, ${timePeriod || 'contemporary'}, the world breaking apart, humanity enduring`
    }
  }
  
  // Apocalyptic / Post-Apocalyptic
  if (genreLower.includes('apocaly') || genreLower.includes('post-apocal') || genreLower.includes('dystopia') || genreLower.includes('end of the world') || genreLower.includes('wasteland')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'a ruined world'} - the aftermath of civilization, survival in the wasteland`,
      montageElements: [
        `${protagonistName} navigating the ruins of ${primaryLocation || 'the old world'}`,
        'Decayed cities, makeshift shelters, the remnants of before',
        `${secondaryLocation ? `A glimpse of ${secondaryLocation}` : 'Scavengers, settlements, the new order'}`,
        `${antagonistName ? `${antagonistName} as warlord or threat` : 'Other survivors, the dangers of the wasteland'}`,
        'Resources, weapons, the currency of survival',
        'The new world: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The moment of apocalyptic stakes - ${protagonistName} fighting for survival, hope, or the last remnants of humanity`,
      atmosphericDetails: `${setting || 'Post-apocalyptic wasteland'}, ${timePeriod || 'after the fall'}, ash and rust, survival at any cost`
    }
  }
  
  // Mockumentary / Documentary Style
  if (genreLower.includes('mockumentary') || genreLower.includes('documentary') || genreLower.includes('found footage') || genreLower.includes('interview')) {
    return {
      openingBeat: `A candid moment - ${protagonistName} looking at the camera in ${primaryLocation || 'their environment'}, raw and unscripted feel`,
      montageElements: [
        `${protagonistName} in interview setup, talking directly to camera`,
        `Observational shots of ${primaryLocation || 'daily life'} - handheld, naturalistic`,
        `${secondaryLocation ? `B-roll of ${secondaryLocation}` : 'Cutaway reactions, observational moments'}`,
        `${antagonistName ? `${antagonistName} giving their side` : 'Multiple perspectives, talking heads'}`,
        'The documentary crew acknowledged - glances at camera, mic packs visible',
        'The story being documented: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The documentary reveals - ${protagonistName} in a moment of truth, caught on camera, authenticity exposed`,
      atmosphericDetails: `${setting || 'Real-world locations'}, ${timePeriod || 'contemporary'}, handheld intimacy, the illusion of reality`
    }
  }
  
  // Slice of Life
  if (genreLower.includes('slice of life') || genreLower.includes('everyday') || genreLower.includes('mundane') || genreLower.includes('quiet drama')) {
    return {
      openingBeat: `A quiet moment - ${protagonistName} in ${primaryLocation || 'their everyday space'}, the beauty in ordinary things`,
      montageElements: [
        `${protagonistName} in mundane activities that reveal character`,
        `The rhythm of ${primaryLocation || 'daily life'} - routines, small moments`,
        `${secondaryLocation ? `A peaceful scene in ${secondaryLocation}` : 'Coffee shops, parks, the places of ordinary life'}`,
        `${antagonistName ? `Tension with ${antagonistName}` : 'Friends, neighbors, the community of the everyday'}`,
        'Small gestures - a smile, a glance, hands doing ordinary things',
        'The quiet story: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The emotional crescendo - ${protagonistName} in a small but profound moment of connection, loss, or realization`,
      atmosphericDetails: `${setting || 'Everyday environments'}, ${timePeriod || 'contemporary'}, natural light, the poetry of the ordinary`
    }
  }
  
  // Coming of Age
  if (genreLower.includes('coming of age') || genreLower.includes('coming-of-age') || genreLower.includes('adolescent') || genreLower.includes('growing up') || genreLower.includes('youth')) {
    return {
      openingBeat: `${protagonistName} at a threshold - leaving childhood behind in ${primaryLocation || 'a formative place'}, the world opening up`,
      montageElements: [
        `${protagonistName} experiencing firsts - first love, first loss, first freedom`,
        `${primaryLocation ? `Growing up in ${primaryLocation}` : 'Bedrooms, backyards, the geography of youth'}`,
        `${secondaryLocation ? `A pivotal moment in ${secondaryLocation}` : 'Parties, quiet moments alone, the spaces of transformation'}`,
        `${antagonistName ? `${antagonistName} as obstacle to growth` : 'Parents, friends, the people who shape us'}`,
        'The markers of youth - music, style, the artifacts of an era',
        'The journey: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The moment of growth - ${protagonistName} facing a truth, making a choice, or crossing a threshold into adulthood`,
      atmosphericDetails: `${setting || 'Childhood and adolescent spaces'}, ${timePeriod || 'a specific era of youth'}, nostalgia and possibility, the ache of growing up`
    }
  }
  
  // Dark Comedy / Satire
  if (genreLower.includes('dark comedy') || genreLower.includes('black comedy') || genreLower.includes('satire') || genreLower.includes('absurd')) {
    return {
      openingBeat: `An absurd or darkly funny moment - ${protagonistName} in ${primaryLocation || 'an uncomfortable situation'}, humor in the darkness`,
      montageElements: [
        `${protagonistName} reacting to absurdity with deadpan or dark humor`,
        `${primaryLocation ? `The satirical world of ${primaryLocation}` : 'Mundane settings made absurd'}`,
        `${secondaryLocation ? `Dark comedy in ${secondaryLocation}` : 'Awkward encounters, uncomfortable truths'}`,
        `${antagonistName ? `${antagonistName} as target of satire` : 'Society, institutions, the things we mock'}`,
        'Moments that make you laugh and wince simultaneously',
        'The dark joke: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The darkest laugh - ${protagonistName} in a moment that's funny because it's true, or true because it's funny`,
      atmosphericDetails: `${setting || 'Ordinary places made strange'}, ${timePeriod || 'contemporary'}, the absurdity of existence, laughter as survival`
    }
  }
  
  // Noir
  if (genreLower.includes('noir') || genreLower.includes('neo-noir') || genreLower.includes('femme fatale') || genreLower.includes('hardboiled')) {
    return {
      openingBeat: `${protagonistName} in shadow and smoke - ${primaryLocation || 'a rain-soaked city'}, a case, a dangerous client, trouble walking in`,
      montageElements: [
        `${protagonistName} moving through ${primaryLocation || 'the urban night'}, cynicism visible`,
        'Neon reflections on wet streets, cigarette smoke, venetian blind shadows',
        `${secondaryLocation ? `A meeting in ${secondaryLocation}` : 'Bars, offices, the dark corners of the city'}`,
        `${antagonistName ? `${antagonistName} as femme fatale or dangerous player` : 'Dangerous clients, corrupt officials, the web of deceit'}`,
        'Close-ups in chiaroscuro - faces half in shadow, secrets everywhere',
        'The case: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The noir revelation - ${protagonistName} realizing the truth, betrayed, or facing the corruption at the heart of it all`,
      atmosphericDetails: `${setting || 'Urban noir cityscape'}, ${timePeriod || 'timeless noir'}, shadows deeper than the crime, everyone has an angle`
    }
  }
  
  // Psychological Drama
  if (genreLower.includes('psychological') || genreLower.includes('mental') || genreLower.includes('mind') || genreLower.includes('breakdown') || genreLower.includes('obsession')) {
    return {
      openingBeat: `Inside ${protagonistName}'s mind - ${primaryLocation || 'a space that reflects inner turmoil'}, reality and perception blurring`,
      montageElements: [
        `${protagonistName} in internal struggle, the external reflecting the internal`,
        `${primaryLocation ? `The claustrophobic world of ${primaryLocation}` : 'Spaces that feel wrong, walls closing in'}`,
        'Distorted perspectives, mirrors, fragmented imagery',
        `${antagonistName ? `${antagonistName} real or imagined` : 'The self as enemy, delusions, obsessions'}`,
        `${secondaryLocation ? `A disturbing scene in ${secondaryLocation}` : 'Therapy sessions, isolation, the architecture of the mind'}`,
        'The psychological stakes: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The psychological breaking point - ${protagonistName} at the edge, reality shattering, truth or madness`,
      atmosphericDetails: `${setting || 'Internalized environments'}, ${timePeriod || 'subjective time'}, reality questioned, the mind as battlefield`
    }
  }
  
  // Survival
  if (genreLower.includes('survival') || genreLower.includes('wilderness') || genreLower.includes('stranded') || genreLower.includes('castaway') || genreLower.includes('isolation')) {
    return {
      openingBeat: `${protagonistName} alone in ${primaryLocation || 'hostile wilderness'} - the elements, isolation, survival instinct awakening`,
      montageElements: [
        `${protagonistName} battling the elements in ${primaryLocation || 'unforgiving terrain'}`,
        'Fire-making, shelter-building, the primal skills of survival',
        `${secondaryLocation ? `A discovery in ${secondaryLocation}` : 'The landscape as character - mountains, forests, ocean'}`,
        `${antagonistName ? `${antagonistName} as predator or rival survivor` : 'Nature as adversary, the body pushed to limits'}`,
        'Close-ups of hands working, eyes scanning, the human will to live',
        'The survival story: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The survival crisis - ${protagonistName} at the limit, rescue or death, the ultimate test of human endurance`,
      atmosphericDetails: `${setting || 'Unforgiving wilderness'}, ${timePeriod || 'timeless human struggle'}, raw nature, the primal self`
    }
  }
  
  // Revenge
  if (genreLower.includes('revenge') || genreLower.includes('vengeance') || genreLower.includes('vendetta') || genreLower.includes('payback')) {
    return {
      openingBeat: `${protagonistName} with purpose - ${primaryLocation || 'a place of significance'}, the weight of what was taken, revenge in their eyes`,
      montageElements: [
        `${protagonistName} preparing, training, or hunting in ${primaryLocation || 'the path of vengeance'}`,
        'Weapons, plans, the tools of payback',
        `${secondaryLocation ? `A confrontation in ${secondaryLocation}` : 'Flashbacks to the wrong, the fuel for revenge'}`,
        `${antagonistName ? `${antagonistName} - the target of vengeance` : 'Those who wronged, their world about to collapse'}`,
        'The transformation from victim to avenger',
        'The revenge: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The vengeance delivered - ${protagonistName} facing ${antagonistName || 'their target'}, justice or destruction, the cost of revenge`,
      atmosphericDetails: `${setting || 'The landscape of vengeance'}, ${timePeriod || 'urgent present'}, cold fury, the price of payback`
    }
  }
  
  // Buddy Comedy / Buddy Cop
  if (genreLower.includes('buddy') || genreLower.includes('odd couple') || genreLower.includes('partner') || genreLower.includes('duo') || genreLower.includes('bromance')) {
    const partner = mainCharacters[1]?.name || 'their unlikely partner'
    return {
      openingBeat: `${protagonistName} and ${partner} - forced together in ${primaryLocation || 'an unlikely situation'}, chemistry through conflict`,
      montageElements: [
        `${protagonistName} and ${partner} arguing, bonding, or in action together`,
        `${primaryLocation ? `Adventures in ${primaryLocation}` : 'The spaces they share, bicker in, become friends in'}`,
        `Contrasting styles - one's chaos, the other's order`,
        `${antagonistName ? `${antagonistName} as common enemy` : 'The mission that forces them together'}`,
        `${secondaryLocation ? `A comedic moment in ${secondaryLocation}` : 'The car, the stakeout, the shared journey'}`,
        'The partnership: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The buddy climax - ${protagonistName} and ${partner} working together, finally in sync, friendship forged`,
      atmosphericDetails: `${setting || 'Urban environments'}, ${timePeriod || 'contemporary'}, mismatched energy, the comedy of partnership`
    }
  }
  
  // True Crime
  if (genreLower.includes('true crime') || genreLower.includes('based on true') || genreLower.includes('real story') || genreLower.includes('actual events')) {
    return {
      openingBeat: `The real story - ${protagonistName} in ${primaryLocation || 'the scene of the crime'}, archival feel, truth stranger than fiction`,
      montageElements: [
        `${protagonistName} as investigator or subject, the weight of real events`,
        `${primaryLocation ? `The reality of ${primaryLocation}` : 'Crime scenes, courthouses, the places where it happened'}`,
        'Evidence photos, news footage, the documentary texture',
        `${antagonistName ? `${antagonistName} - the real perpetrator or adversary` : 'Witnesses, victims, the people involved'}`,
        `${secondaryLocation ? `Investigation in ${secondaryLocation}` : 'Interview setups, reenactments, the search for truth'}`,
        'The true crime: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The revelation of truth - ${protagonistName} uncovering what really happened, justice or tragedy`,
      atmosphericDetails: `${setting || 'Real locations'}, ${timePeriod || 'when it happened'}, documentary gravity, the weight of truth`
    }
  }
  
  // Food / Culinary
  if (genreLower.includes('food') || genreLower.includes('culinary') || genreLower.includes('chef') || genreLower.includes('restaurant') || genreLower.includes('cooking') || genreLower.includes('kitchen')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'the kitchen'} - ingredients, heat, the art and pressure of cooking`,
      montageElements: [
        `${protagonistName} cooking, tasting, creating in ${primaryLocation || 'a professional kitchen'}`,
        'Close-ups of food preparation - chopping, plating, the beauty of cuisine',
        `${secondaryLocation ? `Service in ${secondaryLocation}` : 'Dining rooms, markets, the world of food'}`,
        `${antagonistName ? `${antagonistName} as rival chef or critic` : 'Kitchen staff, the brigade, the heat of service'}`,
        'Fire, steam, the sensory experience of cooking',
        'The culinary stakes: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The culinary climax - ${protagonistName} in the heat of service, a critical dish, passion on the plate`,
      atmosphericDetails: `${setting || 'Restaurant or kitchen'}, ${timePeriod || 'contemporary'}, heat and precision, food as art and war`
    }
  }
  
  // College / University
  if (genreLower.includes('college') || genreLower.includes('university') || genreLower.includes('campus') || genreLower.includes('frat') || genreLower.includes('sorority')) {
    return {
      openingBeat: `${protagonistName} on ${primaryLocation || 'campus'} - the freedom and pressure of college, a new chapter beginning`,
      montageElements: [
        `${protagonistName} navigating ${primaryLocation || 'university life'} - classes, parties, identity`,
        'Dorm rooms, lecture halls, the geography of higher education',
        `${secondaryLocation ? `A scene in ${secondaryLocation}` : 'Libraries, quads, the social spaces of campus'}`,
        `${antagonistName ? `${antagonistName} as rival or threat` : 'Roommates, professors, the new social world'}`,
        'Books, phones, the balance of academics and social life',
        'The college story: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The college crisis - ${protagonistName} facing academic, social, or personal stakes that define these years`,
      atmosphericDetails: `${setting || 'University campus'}, ${timePeriod || 'contemporary'}, freedom and responsibility, the years that shape you`
    }
  }
  
  // Anthology / Interconnected Stories
  if (genreLower.includes('anthology') || genreLower.includes('interconnected') || genreLower.includes('multiple stories') || genreLower.includes('ensemble')) {
    return {
      openingBeat: `Multiple stories converging - glimpses of different characters in ${primaryLocation || 'interconnected worlds'}, threads that will weave together`,
      montageElements: [
        `${protagonistName} as one thread among many, their story beginning`,
        `${primaryLocation ? `Different views of ${primaryLocation}` : 'Multiple locations, parallel lives'}`,
        'Quick cuts between storylines, the rhythm of anthology',
        `${antagonistName ? `${antagonistName} in their own narrative` : 'Other protagonists, other journeys, shared themes'}`,
        `${secondaryLocation ? `Another story in ${secondaryLocation}` : 'The moments that will connect'}`,
        'The interconnected theme: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The anthology convergence - stories touching, themes resonating, the moment it all connects`,
      atmosphericDetails: `${setting || 'Multiple settings'}, ${timePeriod || 'varied timelines'}, the beauty of parallel stories, human experiences echoing`
    }
  }
  
  // Reality TV / Competition
  if (genreLower.includes('reality') || genreLower.includes('competition') || genreLower.includes('contest') || genreLower.includes('game show') || genreLower.includes('dating show')) {
    return {
      openingBeat: `${protagonistName} entering the competition - ${primaryLocation || 'the arena'}, cameras watching, stakes established`,
      montageElements: [
        `${protagonistName} competing, strategizing, or performing`,
        `${primaryLocation ? `The stage of ${primaryLocation}` : 'Competition venues, confessional booths, elimination spaces'}`,
        'Challenges, alliances, the gameplay of reality',
        `${antagonistName ? `${antagonistName} as competitor or rival` : 'Other contestants, judges, the social game'}`,
        `${secondaryLocation ? `Drama in ${secondaryLocation}` : 'Behind-the-scenes tension, private conversations'}`,
        'The competition: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The elimination moment - ${protagonistName} on the line, competition at its peak, who stays and who goes`,
      atmosphericDetails: `${setting || 'Competition venue'}, ${timePeriod || 'contemporary'}, camera-aware glamour, the game within the game`
    }
  }
  
  // Animation Style / Animated
  if (genreLower.includes('animated') || genreLower.includes('animation') || genreLower.includes('anime') || genreLower.includes('cartoon')) {
    return {
      openingBeat: `A stylized world comes alive - ${protagonistName} in ${primaryLocation || 'an animated realm'}, the limitless possibility of animation`,
      montageElements: [
        `${protagonistName} in dynamic animated action or emotion`,
        `${primaryLocation ? `The animated world of ${primaryLocation}` : 'Fantastical or stylized environments'}`,
        'Visual flourishes only animation allows - transformations, effects, impossible physics',
        `${antagonistName ? `${antagonistName} in animated confrontation` : 'Characters with exaggerated expressions and movements'}`,
        `${secondaryLocation ? `A sequence in ${secondaryLocation}` : 'The full range of animated visual storytelling'}`,
        'The animated story: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The animated climax - ${protagonistName} in a sequence of visual spectacle, emotion amplified by style`,
      atmosphericDetails: `${setting || 'Stylized animated world'}, ${timePeriod || 'any time animation allows'}, boundless visual imagination, emotion through art`
    }
  }
  
  // Startup Drama - founder/entrepreneur comedy about the grind
  if (genreLower.includes('startup') || genreLower.includes('founder') || genreLower.includes('entrepreneur') || genreLower.includes('silicon valley')) {
    return {
      openingBeat: `${protagonistName} pitching, grinding, or hustling in ${primaryLocation || 'a cramped startup office'} - the chaos of building something from nothing`,
      montageElements: [
        `${protagonistName} coding at 3am, pitching to skeptics, or celebrating small wins`,
        `${primaryLocation ? `The scrappy world of ${primaryLocation}` : 'WeWork spaces, garage offices, coffee shop meetings'}`,
        'Whiteboards covered in ideas, laptops everywhere, energy drinks and cold pizza',
        `${antagonistName ? `${antagonistName} as competitor or doubting investor` : 'Co-founders arguing, pivots happening, the emotional rollercoaster'}`,
        `${secondaryLocation ? `A pitch meeting in ${secondaryLocation}` : 'Demo days, investor meetings, product launches'}`,
        'The startup grind: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The make-or-break moment - ${protagonistName} in a pitch, a product launch, or the decision that determines if the startup lives or dies`,
      atmosphericDetails: `${setting || 'Startup ecosystem'}, ${timePeriod || 'contemporary tech'}, hoodie-clad ambition, the comedy of disruption and delusion`
    }
  }
  
  // VC Drama - venture capital comedy about fighting to lead deals
  if (genreLower.includes('vc') || genreLower.includes('venture capital') || genreLower.includes('investor') || genreLower.includes('sand hill')) {
    return {
      openingBeat: `${protagonistName} in ${primaryLocation || 'a sleek VC office'} - the hunt for the next unicorn, term sheets and power plays`,
      montageElements: [
        `${protagonistName} taking meetings, analyzing decks, or fighting to lead a round`,
        `${primaryLocation ? `The world of ${primaryLocation}` : 'Sand Hill Road offices, partner meetings, exclusive dinners'}`,
        'Term sheets, cap tables, the theater of due diligence',
        `${antagonistName ? `${antagonistName} as competing investor or difficult LP` : 'Other VCs circling, founders playing investors against each other'}`,
        `${secondaryLocation ? `A deal negotiation in ${secondaryLocation}` : 'Board meetings, portfolio reviews, the chase'}`,
        'The VC game: ' + premiseSnippet.substring(0, 40)
      ],
      tensionPeak: `The deal moment - ${protagonistName} fighting to lead the round, outmaneuvering competitors, or the investment that defines their fund`,
      atmosphericDetails: `${setting || 'Venture capital world'}, ${timePeriod || 'contemporary finance'}, Patagonia vests and power moves, the comedy of money chasing money`
    }
  }
  
  // Drama (default) - heavily grounded in story bible
  return {
    openingBeat: `An emotionally charged moment - ${protagonistName}${primaryLocation ? ` in ${primaryLocation}` : ''} facing a conflict or decision that defines them`,
    montageElements: [
      `${protagonistName} in a moment of emotional depth or conflict`,
      `${antagonistName ? `The dynamic between ${protagonistName} and ${antagonistName}` : 'Key relationships and interpersonal tension'}`,
      `${primaryLocation ? `The world of ${primaryLocation}` : 'Locations that hold emotional meaning'}`,
      `${secondaryLocation ? `A moment in ${secondaryLocation}` : 'Objects or symbols that carry weight'}`,
      'Characters in states of contemplation, decision, or confrontation',
      'The emotional stakes: ' + premiseSnippet.substring(0, 40)
    ],
    tensionPeak: `The emotional climax - ${protagonistName} in confrontation, revelation, or the peak of character conflict that embodies: ${premiseSnippet}`,
    atmosphericDetails: `${setting || 'Grounded, realistic environment'}, ${timePeriod || 'contemporary'}, authentic human experience, emotional truth visible`
  }
}

/**
 * Get genre-specific visual style
 */
function getGenreVisualStyle(genre: string): string {
  const genreLower = genre.toLowerCase()
  
  // Comedy variants
  if (genreLower.includes('dark comedy') || genreLower.includes('black comedy') || genreLower.includes('satire')) {
    return 'Stylized visuals with dark undertones, absurdist framing'
  } else if (genreLower.includes('comedy') || genreLower.includes('comic') || genreLower.includes('sitcom')) {
    return 'Bright, vibrant, energetic visuals with warm lighting'
  }
  // Sci-Fi and Fantasy
  else if (genreLower.includes('sci-fi') || genreLower.includes('science fiction') || genreLower.includes('futuristic')) {
    return 'Futuristic, high-tech visuals with cool lighting and advanced technology'
  } else if (genreLower.includes('fantasy') || genreLower.includes('magic') || genreLower.includes('dragon')) {
    return 'Epic, magical visuals with ethereal lighting and fantastical elements'
  }
  // Dark genres
  else if (genreLower.includes('noir') || genreLower.includes('hardboiled')) {
    return 'High contrast black and white influenced, venetian blind shadows, rain-soaked streets'
  } else if (genreLower.includes('horror') || genreLower.includes('scary')) {
    return 'Dark, suspenseful visuals with dramatic shadows and tension'
  } else if (genreLower.includes('psychological')) {
    return 'Distorted, claustrophobic visuals, subjective camera, unsettling compositions'
  }
  // Crime and Thriller
  else if (genreLower.includes('crime') || genreLower.includes('mystery') || genreLower.includes('thriller') || genreLower.includes('detective')) {
    return 'Dark, moody, atmospheric visuals with high contrast lighting'
  } else if (genreLower.includes('spy') || genreLower.includes('espionage')) {
    return 'Sleek, international visuals with cool sophistication and shadowy intrigue'
  }
  // Romance
  else if (genreLower.includes('romance') || genreLower.includes('romantic')) {
    return 'Soft, romantic visuals with warm, intimate lighting and dreamy quality'
  }
  // Period and Historical
  else if (genreLower.includes('period') || genreLower.includes('historical') || genreLower.includes('victorian') || genreLower.includes('medieval')) {
    return 'Authentic period visuals, natural and candlelit lighting, textured and rich'
  } else if (genreLower.includes('western')) {
    return 'Dusty, sun-bleached visuals with warm desert tones and frontier authenticity'
  }
  // Action and Adventure
  else if (genreLower.includes('action') || genreLower.includes('adventure')) {
    return 'Dynamic, kinetic visuals with bold colors and dramatic movement'
  } else if (genreLower.includes('war') || genreLower.includes('military')) {
    return 'Gritty, desaturated visuals with handheld intensity and realistic texture'
  }
  // Professional Settings
  else if (genreLower.includes('medical') || genreLower.includes('hospital')) {
    return 'Clinical whites and blues, precise sterile lighting, life-or-death urgency'
  } else if (genreLower.includes('legal') || genreLower.includes('courtroom') || genreLower.includes('lawyer')) {
    return 'Authoritative wood-toned visuals, dramatic courtroom lighting, gravitas'
  } else if (genreLower.includes('politic')) {
    return 'Power-suited visuals, marble and glass, the aesthetic of institutions'
  } else if (genreLower.includes('office') || genreLower.includes('corporate') || genreLower.includes('workplace')) {
    return 'Modern corporate aesthetic, glass and steel, cool fluorescent mixed with natural light'
  }
  // Sports and Competition
  else if (genreLower.includes('sport') || genreLower.includes('athletic')) {
    return 'Dynamic, high-energy visuals with arena lighting and athletic movement'
  } else if (genreLower.includes('competition') || genreLower.includes('reality')) {
    return 'Glossy, camera-aware visuals with dramatic reality TV lighting'
  }
  // Lifestyle and Food
  else if (genreLower.includes('food') || genreLower.includes('culinary') || genreLower.includes('chef')) {
    return 'Warm, appetizing visuals with steam and fire, sensory richness'
  }
  // Documentary styles
  else if (genreLower.includes('documentary') || genreLower.includes('mockumentary') || genreLower.includes('true crime')) {
    return 'Naturalistic, handheld visuals with documentary authenticity'
  }
  // Coming of age and youth
  else if (genreLower.includes('coming of age') || genreLower.includes('teen') || genreLower.includes('high school') || genreLower.includes('college')) {
    return 'Nostalgic, golden-hour visuals with youthful energy and emotional warmth'
  }
  // Slice of life
  else if (genreLower.includes('slice of life') || genreLower.includes('everyday')) {
    return 'Naturalistic, observational visuals with soft lighting and quiet beauty'
  }
  // Animation
  else if (genreLower.includes('animated') || genreLower.includes('animation') || genreLower.includes('anime')) {
    return 'Stylized, expressive visuals with the freedom of animated form'
  }
  // Supernatural
  else if (genreLower.includes('supernatural') || genreLower.includes('paranormal')) {
    return 'Reality-bending visuals with uncanny lighting and otherworldly elements'
  }
  // Disaster and Apocalyptic
  else if (genreLower.includes('disaster') || genreLower.includes('apocaly')) {
    return 'Epic scale destruction, dust and debris, survival in chaos'
  }
  // Heist
  else if (genreLower.includes('heist') || genreLower.includes('caper')) {
    return 'Slick, stylish visuals with split-screens and planning aesthetics'
  }
  // Family
  else if (genreLower.includes('family') || genreLower.includes('dynasty')) {
    return 'Warm domestic interiors contrasted with tense family dynamics'
  }
  // Musical
  else if (genreLower.includes('musical')) {
    return 'Theatrical, spotlit visuals with choreographed movement and performance energy'
  }
  // Startup and VC
  else if (genreLower.includes('startup') || genreLower.includes('founder') || genreLower.includes('entrepreneur')) {
    return 'Scrappy, energetic visuals - whiteboards, laptops, late nights, the chaos of building'
  } else if (genreLower.includes('vc') || genreLower.includes('venture capital') || genreLower.includes('investor')) {
    return 'Sleek minimalist offices, power lunches, the polished aesthetic of money'
  }
  // Default
  else {
    return 'Cinematic, dramatic visuals with professional lighting and composition'
  }
}

/**
 * Get genre-specific editing style
 */
function getGenreEditingStyle(genre: string): string {
  const genreLower = genre.toLowerCase()
  
  // Comedy variants
  if (genreLower.includes('dark comedy') || genreLower.includes('satire')) {
    return 'Ironic timing, uncomfortable holds, absurdist pacing'
  } else if (genreLower.includes('comedy') || genreLower.includes('comic') || genreLower.includes('sitcom')) {
    return 'Fast-paced, energetic cuts with comedic timing and punchline beats'
  }
  // Action and Thriller
  else if (genreLower.includes('action') || genreLower.includes('thriller')) {
    return 'Rapid cuts building tension and suspense, kinetic energy'
  } else if (genreLower.includes('heist') || genreLower.includes('caper')) {
    return 'Slick, rhythmic editing synced to music, split-screens, planning montages'
  } else if (genreLower.includes('spy') || genreLower.includes('espionage')) {
    return 'Sophisticated pacing with reveals and misdirection'
  }
  // Horror and Psychological
  else if (genreLower.includes('horror') || genreLower.includes('scary')) {
    return 'Tension builds, strategic jump cuts, uncomfortable holds before the scare'
  } else if (genreLower.includes('psychological')) {
    return 'Disorienting cuts, subjective pacing, reality-bending transitions'
  }
  // Drama variants
  else if (genreLower.includes('family') || genreLower.includes('dynasty')) {
    return 'Emotional pacing with reaction shots, generational weight in every cut'
  } else if (genreLower.includes('drama')) {
    return 'Emotional pacing with meaningful pauses and character moments'
  }
  // Period and Historical
  else if (genreLower.includes('period') || genreLower.includes('historical')) {
    return 'Elegant, measured pacing that respects the era, tableau-style moments'
  } else if (genreLower.includes('western')) {
    return 'Deliberate pacing with showdown tension, wide-to-close dramatic beats'
  }
  // Professional Settings
  else if (genreLower.includes('medical') || genreLower.includes('hospital')) {
    return 'Urgent pacing, quick cuts during procedures, tension and release'
  } else if (genreLower.includes('legal') || genreLower.includes('courtroom')) {
    return 'Dramatic courtroom rhythm, testimony builds, verdict tension'
  } else if (genreLower.includes('politic')) {
    return 'Power-play pacing, quick cuts of reactions, debate rhythm'
  } else if (genreLower.includes('office') || genreLower.includes('corporate')) {
    return 'Meeting-room tension, corporate rhythm, power dynamics in every cut'
  }
  // Sports and Competition
  else if (genreLower.includes('sport') || genreLower.includes('athletic')) {
    return 'High-energy athletic cuts, slow-motion highlights, game-time urgency'
  } else if (genreLower.includes('competition') || genreLower.includes('reality')) {
    return 'Reality TV pacing with confessional cuts, elimination tension'
  }
  // Fantasy and Sci-Fi
  else if (genreLower.includes('fantasy') || genreLower.includes('magic')) {
    return 'Epic pacing with sweeping transitions, magical moment builds'
  } else if (genreLower.includes('sci-fi') || genreLower.includes('futuristic')) {
    return 'Futuristic pacing with technological reveals, discovery beats'
  }
  // Documentary styles
  else if (genreLower.includes('documentary') || genreLower.includes('mockumentary')) {
    return 'Observational pacing, interview rhythm, handheld authenticity'
  } else if (genreLower.includes('true crime')) {
    return 'Investigation pacing, evidence reveals, documentary gravity'
  }
  // Romance
  else if (genreLower.includes('romance') || genreLower.includes('rom-com')) {
    return 'Chemistry-building cuts, longing glances, romantic timing'
  }
  // Coming of age and youth
  else if (genreLower.includes('coming of age') || genreLower.includes('teen') || genreLower.includes('high school')) {
    return 'Nostalgic pacing with memory-like transitions, emotional crescendos'
  } else if (genreLower.includes('college') || genreLower.includes('university')) {
    return 'Youthful energy, party montages, academic and social rhythm'
  }
  // Slice of life
  else if (genreLower.includes('slice of life') || genreLower.includes('everyday')) {
    return 'Gentle, observational pacing, quiet moments given space'
  }
  // Musical
  else if (genreLower.includes('musical')) {
    return 'Music-driven editing, choreographed cuts, performance builds'
  }
  // Animation
  else if (genreLower.includes('animated') || genreLower.includes('anime')) {
    return 'Dynamic animated pacing, stylized transitions, expressive timing'
  }
  // Supernatural
  else if (genreLower.includes('supernatural') || genreLower.includes('paranormal')) {
    return 'Reality-shifting cuts, uncanny timing, supernatural reveals'
  }
  // Disaster and Apocalyptic
  else if (genreLower.includes('disaster')) {
    return 'Escalating chaos, quick cuts of destruction, survival urgency'
  } else if (genreLower.includes('apocaly') || genreLower.includes('dystopia')) {
    return 'Desolate pacing with survival tension, wasteland atmosphere'
  }
  // Survival and Revenge
  else if (genreLower.includes('survival') || genreLower.includes('wilderness')) {
    return 'Primal pacing, nature rhythm, endurance builds'
  } else if (genreLower.includes('revenge') || genreLower.includes('vengeance')) {
    return 'Building fury, training montages, confrontation tension'
  }
  // Buddy
  else if (genreLower.includes('buddy') || genreLower.includes('partner')) {
    return 'Banter rhythm, mismatched energy cuts, partnership builds'
  }
  // Food
  else if (genreLower.includes('food') || genreLower.includes('culinary')) {
    return 'Sensory pacing, cooking rhythm, plating crescendos'
  }
  // War
  else if (genreLower.includes('war') || genreLower.includes('military')) {
    return 'Combat intensity, quiet-before-storm builds, sacrifice weight'
  }
  // Noir
  else if (genreLower.includes('noir')) {
    return 'Moody pacing, revelation timing, fatalistic rhythm'
  }
  // Crime and Mystery
  else if (genreLower.includes('crime') || genreLower.includes('mystery') || genreLower.includes('detective')) {
    return 'Investigation rhythm, clue reveals, twist timing'
  }
  // Startup and VC
  else if (genreLower.includes('startup') || genreLower.includes('founder') || genreLower.includes('entrepreneur')) {
    return 'Frenetic hustle energy, pitch montages, pivot moments, comedic timing on failures'
  } else if (genreLower.includes('vc') || genreLower.includes('venture capital') || genreLower.includes('investor')) {
    return 'Deal-making rhythm, term sheet tension, the comedy of competitive funding rounds'
  }
  // Default
  else {
    return 'Dynamic pacing that builds momentum'
  }
}

