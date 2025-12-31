import type { InvestorMaterialsPackage } from '@/types/investor-materials'

export function createSamplePitchData(): InvestorMaterialsPackage {
  return {
    id: 'mockup-sample',
    storyBibleId: 'sample-bible',
    arcIndex: 0,
    arcTitle: 'The Awakening',
    generatedAt: new Date().toISOString(),

    hook: {
      seriesTitle: 'Echoes of Tomorrow',
      logline: 'In a world where memories can be traded, a young archivist discovers a conspiracy that threatens to erase humanity\'s past.',
      genre: 'Sci-Fi Thriller',
      theme: 'The price of forgetting',
      synopsis: 'Set in 2087, where memory trading has become a billion-dollar industry, our protagonist Maya uncovers a plot to systematically erase historical memories, forcing her to choose between preserving the past or saving the future.'
    },

    story: {
      arcTitle: 'The Awakening',
      arcDescription: 'Maya\'s journey from archivist to revolutionary as she uncovers the truth about memory trading.',
      episodes: [
        {
          episodeNumber: 1,
          title: 'First Memory',
          summary: 'Maya discovers a classified memory that shouldn\'t exist.',
          keyBeat: 'Discovery of the forbidden memory',
          emotionalBeat: 'Shock and determination',
          scenes: [
            { sceneNumber: 1, title: 'The Archive', content: 'Maya works late, cataloging memories.' },
            { sceneNumber: 2, title: 'The Discovery', content: 'She finds a memory marked for deletion.' }
          ],
          episodeRundown: 'Maya\'s routine life is disrupted when she discovers a memory that challenges everything she knows.'
        },
        {
          episodeNumber: 2,
          title: 'The Trade',
          summary: 'Maya must trade her own memories to access the truth.',
          keyBeat: 'The first memory trade',
          emotionalBeat: 'Sacrifice and resolve'
        },
        {
          episodeNumber: 3,
          title: 'The Conspiracy',
          summary: 'The scope of the conspiracy becomes clear.',
          keyBeat: 'Revelation of the master plan',
          emotionalBeat: 'Horror and urgency'
        }
      ],
      transformation: {
        start: 'A cautious archivist who follows the rules',
        end: 'A revolutionary leader fighting for humanity\'s memory',
        journey: 'Through loss, discovery, and sacrifice, Maya transforms from observer to activist.'
      }
    },

    pilot: {
      episodeNumber: 1,
      episodeTitle: 'First Memory',
      fullScript: `FADE IN:

INT. MEMORY ARCHIVE - NIGHT

The archive is vast, rows upon rows of glowing memory capsules stretching into darkness. MAYA (28), meticulous and focused, works at a terminal.

MAYA
(whispering to herself)
Catalogue entry 47-B... verified.

She notices something unusual - a capsule pulsing with red light, marked "CLASSIFIED - DELETE ON SIGHT"

MAYA
That's not right. This memory is scheduled for deletion, but it's not in the system.

She hesitates, then reaches for the capsule.

MAYA (CONT'D)
What are you hiding?

She activates the memory viewer. Images flash - a laboratory, people in white coats, something being tested on subjects.

MAYA (CONT'D)
Oh my god...

FADE TO BLACK.

END OF EPISODE ONE.`,
      sceneStructure: {
        totalScenes: 3,
        totalPages: 5,
        estimatedRuntime: 45,
        scenes: [
          {
            sceneNumber: 1,
            heading: 'INT. MEMORY ARCHIVE - NIGHT',
            pageCount: 2,
            synopsis: 'Maya discovers an anomaly in the archive',
            characters: ['MAYA']
          },
          {
            sceneNumber: 2,
            heading: 'INT. MAYA\'S APARTMENT - LATER',
            pageCount: 2,
            synopsis: 'Maya struggles with what she\'s seen',
            characters: ['MAYA']
          },
          {
            sceneNumber: 3,
            heading: 'INT. ARCHIVE - NEXT DAY',
            pageCount: 1,
            synopsis: 'Maya decides to investigate further',
            characters: ['MAYA', 'BOSS']
          }
        ]
      }
    },

    episodeScripts: {
      1: {
        episodeNumber: 1,
        episodeTitle: 'First Memory',
        fullScript: `FADE IN:

INT. MEMORY ARCHIVE - NIGHT

The archive is vast, rows upon rows of glowing memory capsules stretching into darkness. MAYA (28), meticulous and focused, works at a terminal.

MAYA
(whispering to herself)
Catalogue entry 47-B... verified.

She notices something unusual - a capsule pulsing with red light, marked "CLASSIFIED - DELETE ON SIGHT"

MAYA
That's not right. This memory is scheduled for deletion, but it's not in the system.

She hesitates, then reaches for the capsule.

MAYA (CONT'D)
What are you hiding?

She activates the memory viewer. Images flash - a laboratory, people in white coats, something being tested on subjects.

MAYA (CONT'D)
Oh my god...

FADE TO BLACK.

END OF EPISODE ONE.`,
        sceneStructure: {
          totalScenes: 3,
          totalPages: 5,
          estimatedRuntime: 45,
          scenes: [
            {
              sceneNumber: 1,
              heading: 'INT. MEMORY ARCHIVE - NIGHT',
              pageCount: 2,
              synopsis: 'Maya discovers an anomaly in the archive',
              characters: ['MAYA']
            }
          ]
        }
      }
    },

    visuals: {
      episodes: {
        1: {
          episodeNumber: 1,
          episodeTitle: 'First Memory',
          scenes: [
            {
              sceneNumber: 1,
              sceneTitle: 'The Archive',
              frames: [
                {
                  frameId: '1-1-1',
                  episodeNumber: 1,
                  sceneNumber: 1,
                  shotNumber: 1,
                  description: 'Wide shot of the memory archive, rows of glowing capsules',
                  cameraAngle: 'Wide',
                  cameraMovement: 'Static',
                  dialogueSnippet: 'Catalogue entry 47-B... verified.',
                  imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010c3cc406?w=800',
                  notes: 'Establishing shot showing the vastness of the archive',
                  lightingNotes: 'Cool blue lighting from memory capsules'
                },
                {
                  frameId: '1-1-2',
                  episodeNumber: 1,
                  sceneNumber: 1,
                  shotNumber: 2,
                  description: 'Close-up on Maya\'s face as she notices the red capsule',
                  cameraAngle: 'Close-up',
                  cameraMovement: 'Push in',
                  dialogueSnippet: 'That\'s not right.',
                  imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
                  notes: 'Maya\'s realization moment',
                  lightingNotes: 'Red glow from capsule on her face'
                }
              ]
            }
          ]
        }
      },
      totalFrames: 2
    },

    characters: {
      mainCharacters: [
        {
          name: 'Maya Chen',
          role: 'Protagonist',
          age: '28',
          background: 'Archivist at the National Memory Archive, orphaned at 12',
          motivation: 'To preserve truth and protect humanity\'s collective memory',
          conflicts: ['Her job requires her to delete memories', 'Her own memories are at risk'],
          arc: 'From rule-follower to revolutionary',
          relationships: ['Alex (friend)', 'Dr. Singh (mentor)', 'Marcus (rival)'],
          keyTraits: ['Meticulous', 'Curious', 'Brave', 'Lonely'],
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
        },
        {
          name: 'Alex Rivera',
          role: 'Ally',
          age: '30',
          background: 'Memory trader, Maya\'s childhood friend',
          motivation: 'To make enough money to buy back his family\'s memories',
          conflicts: ['Moral conflict about memory trading', 'Financial pressure'],
          arc: 'From self-serving to selfless',
          relationships: ['Maya (friend)', 'Family (lost memories)'],
          keyTraits: ['Loyal', 'Resourceful', 'Conflicted']
        },
        {
          name: 'Dr. Singh',
          role: 'Mentor',
          age: '65',
          background: 'Former memory researcher, now underground',
          motivation: 'To expose the truth about memory manipulation',
          conflicts: ['Hunted by authorities', 'Guilt over past research'],
          arc: 'From hiding to leading',
          relationships: ['Maya (mentor)', 'Former colleagues'],
          keyTraits: ['Wise', 'Secretive', 'Determined']
        }
      ],
      relationshipMap: [
        {
          character1: 'Maya Chen',
          character2: 'Alex Rivera',
          relationshipType: 'Friendship',
          description: 'Childhood friends who reconnect through the conspiracy',
          keyMoments: ['Reunion in Episode 2', 'Alex helps Maya escape'],
          evolution: 'From estranged to inseparable allies'
        },
        {
          character1: 'Maya Chen',
          character2: 'Dr. Singh',
          relationshipType: 'Mentor-Student',
          description: 'Dr. Singh guides Maya in understanding the truth',
          keyMoments: ['First meeting in Episode 3', 'Dr. Singh\'s sacrifice'],
          evolution: 'From teacher to equal partners'
        }
      ]
    },

    depth: {
      world: {
        setting: '2087 - A world where memories can be extracted, stored, and traded like commodities. The Memory Archive is the central repository, and Memory Traders operate in legal gray zones.',
        rules: [
          'Memories can be extracted but not perfectly replicated',
          'Trading memories is legal but heavily regulated',
          'Classified memories are marked for deletion',
          'The Archive maintains the official historical record'
        ],
        locations: [
          {
            name: 'The Memory Archive',
            type: 'institution',
            description: 'A vast underground facility storing millions of memory capsules in glowing rows',
            significance: 'The central location where Maya works and discovers the conspiracy',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010c3cc406?w=800',
            recurringEvents: ['Night shifts', 'Memory cataloging'],
            conflicts: ['Security protocols', 'Classified deletions']
          },
          {
            name: 'The Underground',
            type: 'hidden',
            description: 'A network of hidden safe houses where memory rebels operate',
            significance: 'Where Maya meets Dr. Singh and learns the truth',
            recurringEvents: ['Secret meetings', 'Memory exchanges'],
            conflicts: ['Authorities hunting rebels', 'Trust issues']
          }
        ]
      }
    },

    keyScenes: {
      episode3: {
        episodeNumber: 3,
        episodeTitle: 'The Conspiracy',
        sceneNumber: 5,
        sceneTitle: 'The Revelation',
        excerpt: 'Dr. Singh reveals the full scope of the conspiracy to erase historical memories.',
        context: 'Maya has been hunted and finally finds Dr. Singh in the Underground.',
        whyItMatters: 'This is the turning point where Maya fully commits to the revolution.'
      },
      episode5: {
        episodeNumber: 5,
        episodeTitle: 'The Trade',
        sceneNumber: 8,
        sceneTitle: 'Ultimate Sacrifice',
        excerpt: 'Maya trades her most precious memory to save Alex.',
        context: 'Alex is captured and Maya must make an impossible choice.',
        whyItMatters: 'Shows Maya\'s complete transformation and the cost of revolution.'
      }
    },

    production: {
      budget: {
        perEpisode: {
          base: 50000,
          optional: 25000,
          total: 75000
        },
        arcTotal: 600000,
        breakdown: {
          base: {
            extras: 10000,
            props: 8000,
            locations: 12000
          },
          optional: {
            crew: 15000,
            equipment: 5000,
            postProduction: 3000,
            miscellaneous: 2000
          }
        },
        analysis: 'Budget is reasonable for an indie sci-fi series with strong visual effects needs.'
      },
      locations: [
        {
          name: 'Memory Archive Set',
          description: 'Large warehouse converted to archive set',
          usedIn: ['Episodes 1, 2, 3, 5'],
          cost: 5000,
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010c3cc406?w=600'
        }
      ],
      props: [
        {
          name: 'Memory Capsules',
          description: 'Glowing prop capsules for memory storage',
          significance: 'Central visual element',
          usedIn: ['All episodes'],
          cost: 2000,
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600'
        }
      ],
      casting: {
        characters: [
          {
            name: 'Maya Chen',
            ageRange: '25-30',
            description: 'Asian-American, intelligent, determined',
            actorType: 'Lead',
            references: ['Awkwafina', 'Gemma Chan']
          }
        ]
      }
    },

    marketing: {
      targetAudience: {
        primary: 'Sci-fi enthusiasts aged 25-45 who enjoy thought-provoking narratives',
        secondary: 'Fans of memory-based stories like Black Mirror and Eternal Sunshine'
      },
      keySellingPoints: [
        'Unique premise about memory trading',
        'Strong female protagonist',
        'Relevant themes about truth and history',
        'Cinematic visual style'
      ],
      loglines: [
        'In a world where memories are currency, one archivist discovers a conspiracy to erase humanity\'s past.',
        'What if you could trade your memories? What if someone wanted to erase them all?'
      ],
      taglines: [
        'Remember what they want you to forget',
        'The past is not for sale',
        'Some memories are worth fighting for'
      ],
      socialMediaStrategy: {
        platforms: ['TikTok', 'Instagram', 'YouTube', 'Twitter'],
        contentApproach: 'Focus on memory-themed content, behind-the-scenes, and character spotlights',
        engagementIdeas: [
          'Memory trading challenges',
          'Character Q&As',
          'World-building deep dives'
        ]
      },
      visualAssets: {
        seriesPoster: {
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010c3cc406?w=1200',
          prompt: 'Sci-fi memory archive poster',
          title: 'Echoes of Tomorrow',
          description: 'Official series poster'
        }
      },
      visualStyle: {
        colorPalette: 'Cool blues and warm oranges, representing memory vs. reality',
        imageryThemes: 'Glowing capsules, underground spaces, archival aesthetics',
        posterConcepts: ['Memory capsule close-up', 'Maya in the archive', 'Underground meeting']
      },
      audioStrategy: {
        musicGenre: 'Ambient electronic with orchestral elements',
        soundDesign: 'Memory capsule sounds, archive ambience',
        voiceoverTone: 'Mysterious and urgent'
      }
    },

    callToAction: {
      whyYou: 'This series combines thought-provoking sci-fi with emotional character arcs, perfect for audiences seeking meaningful entertainment.',
      nextSteps: [
        'Review full pilot script',
        'Schedule production meeting',
        'Discuss budget and timeline'
      ]
    },

    materialsStatus: {
      storyBible: true,
      episodes: true,
      preProduction: true,
      marketing: true,
      actorMaterials: true
    }
  }
}





