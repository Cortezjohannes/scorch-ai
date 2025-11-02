'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Lightbulb, Film, Tag, Search, Bolt, Shield } from 'lucide-react'

type StoryRecommendation = {
  title: string
  genre: string
  synopsis: string
  theme: string
  tags: string[]
  recommendedMode: 'beast' | 'stable'
}

// Updated recommendations with more options and recommended mode
const RECOMMENDATIONS: StoryRecommendation[] = [
  // New low-budget templates ($500-$1000) with mode recommendations
  {
    title: "Apartment 7B",
    genre: "Psychological Thriller",
    synopsis: "A remote worker begins to suspect their apartment is somehow changing when they're not looking. As they become increasingly isolated, they set up cameras to catch the subtle movements of furniture and personal items, only to discover something far more disturbing than they imagined.",
    theme: "Isolation, paranoia, and the thin line between reality and delusion in the digital age",
    tags: ["single location", "low budget", "minimal cast", "psychological", "apartment"],
    recommendedMode: "stable" // Psychological thriller might get caught in content filters
  },
  {
    title: "Last Call",
    genre: "Drama",
    synopsis: "After closing time at a small neighborhood bar, four strangers find themselves locked in during a power outage. As the night progresses, their conversation moves from small talk to deep confessions that will change each of their lives.",
    theme: "Connection, vulnerability, and how sharing our stories can lead to personal transformation",
    tags: ["single location", "dialogue-driven", "low budget", "character study", "night setting"],
    recommendedMode: "beast" // Character-driven drama is good for OpenAI
  },
  {
    title: "The Interview",
    genre: "Suspense",
    synopsis: "What begins as a standard job interview takes a sinister turn when the interviewee realizes they're actually being evaluated for something entirely different. As the questions become more invasive and strange, they must decide how far they're willing to go for a job they no longer understand.",
    theme: "Ambition, ethics, and the compromise of personal values in pursuit of success",
    tags: ["office setting", "two actors", "low budget", "minimal props", "dialogue-heavy"],
    recommendedMode: "stable" // Potentially dark themes better for Gemini
  },
  {
    title: "Dinner for Two",
    genre: "Romantic Comedy",
    synopsis: "A culinary student and a food delivery driver who've never met in person develop a friendship through notes left with takeout orders. When a mix-up leads to them finally meeting in person, they decide to cook a meal together, with hilarious and heartwarming results.",
    theme: "Connection in the digital age and how food brings people together",
    tags: ["apartment setting", "cooking", "two actors", "low budget", "romantic"],
    recommendedMode: "beast" // Heartwarming rom-com perfect for OpenAI
  },
  {
    title: "Night Shift",
    genre: "Horror",
    synopsis: "A new security guard working the overnight shift at a small office building becomes convinced that one of the empty offices is occupied after hours. With only security cameras and their wits to rely on, they must investigate the strange occurrences before morning.",
    theme: "Fear of the unknown and confronting what lurks in empty spaces when no one is watching",
    tags: ["office setting", "night shots", "solo protagonist", "low budget", "suspense"],
    recommendedMode: "stable" // Horror content better with Gemini
  },
  {
    title: "Video Call",
    genre: "Mystery Drama",
    synopsis: "A series of weekly video calls between two long-distance friends takes an unexpected turn when one of them notices something strange in their friend's background that changes from week to week. As they investigate from afar, they uncover a mystery that puts their friendship to the test.",
    theme: "Trust, distance, and the limitations of digital connection",
    tags: ["webcam format", "two actors", "home setting", "low budget", "desktop thriller"],
    recommendedMode: "beast" // Mystery drama works well with OpenAI
  },
  {
    title: "The Inheritance",
    genre: "Dark Comedy",
    synopsis: "Three estranged siblings reunite at their childhood home after their eccentric parent's death, only to discover a video will challenging them to complete a series of bizarre tasks together over a weekend to claim their inheritance.",
    theme: "Family reconciliation and the absurdity of holding onto past grievances",
    tags: ["house setting", "small cast", "low budget", "comedy", "family dynamics"],
    recommendedMode: "beast" // Family comedy good for OpenAI
  },
  {
    title: "One Take",
    genre: "Meta Drama",
    synopsis: "A group of film students attempt to shoot an ambitious one-take short film in their apartment. As production problems mount and tempers flare, their real-life drama becomes more compelling than the story they're trying to tell.",
    theme: "Creative ambition, friendship under pressure, and the chaotic nature of indie filmmaking",
    tags: ["apartment setting", "filmmaking", "low budget", "meta", "friend group"],
    recommendedMode: "beast" // Creative process good for OpenAI
  },
  {
    title: "Morning Routine",
    genre: "Sci-Fi Drama",
    synopsis: "A person begins experiencing the same morning over and over with subtle, escalating differences. Unlike a time loop, they're moving forward in time, but identical events keep occurring. As they investigate, they discover a disturbing truth about their seemingly normal suburban life.",
    theme: "Questioning reality and finding meaning in daily routines",
    tags: ["house setting", "minimal effects", "low budget", "everyday surrealism", "limited cast"],
    recommendedMode: "stable" // Sci-fi with potentially dark themes better for Gemini
  },
  {
    title: "The Package",
    genre: "Thriller",
    synopsis: "A delivery driver accidentally receives a mysterious package meant for someone else. After attempting to deliver it to the correct address and finding an abandoned home, curiosity leads them to open it, setting off a chain of increasingly dangerous events.",
    theme: "Curiosity, moral choices, and the unexpected consequences of small decisions",
    tags: ["car scenes", "house locations", "low budget", "suspense", "solo protagonist"],
    recommendedMode: "stable" // Thriller with potentially violent content better for Gemini
  },
  
  // New low-budget templates with mode recommendations
  {
    title: "Digital Detox",
    genre: "Comedy",
    synopsis: "Four friends who are constantly glued to their phones decide to spend a weekend at a cabin with no technology. As withdrawal symptoms set in, hilarity ensues as they rediscover analog entertainment and actually talk to each other for the first time in years.",
    theme: "Reconnecting with the real world and the comedy that comes from our dependence on technology",
    tags: ["cabin setting", "friend group", "comedy", "low budget", "minimal tech"],
    recommendedMode: "beast" // Comedy content good for OpenAI
  },
  {
    title: "Roommates",
    genre: "Sitcom",
    synopsis: "Two polar opposite people are forced to share an apartment due to financial circumstances. Their conflicting lifestyles, habits, and personalities create a perfect storm of comedic situations as they reluctantly learn to coexist.",
    theme: "Finding common ground with people different from ourselves and the humor in compromise",
    tags: ["apartment setting", "two actors", "comedy", "low budget", "sitcom"],
    recommendedMode: "beast" // Sitcom perfect for OpenAI
  },
  {
    title: "Found Footage",
    genre: "Mockumentary",
    synopsis: "A film student's documentary project takes an unexpected turn when they begin interviewing residents of a small town about local legends, only to discover that the legends might have more truth to them than anyone realized.",
    theme: "The blurry line between fact and fiction, and how stories shape our understanding of reality",
    tags: ["documentary style", "single camera", "small town", "interview format", "low budget"],
    recommendedMode: "beast" // Mockumentary style good for OpenAI
  },
  {
    title: "Late Night Diner",
    genre: "Anthology Drama",
    synopsis: "A 24-hour diner serves as the backdrop for interconnected stories of various customers who visit during the late-night hours, each bringing their own baggage, hopes, and secrets to the counter.",
    theme: "The unexpected connections between strangers and how shared spaces bring together diverse human experiences",
    tags: ["single location", "multiple characters", "dialogue-driven", "night setting", "low budget"],
    recommendedMode: "beast" // Character drama good for OpenAI
  },
  {
    title: "Secret Recipe",
    genre: "Food Competition",
    synopsis: "Three amateur chefs compete in a makeshift cooking competition in someone's kitchen, each trying to recreate a famous family recipe while dealing with sabotage, kitchen mishaps, and their own culinary shortcomings.",
    theme: "The passion we bring to food and how cooking connects us to our heritage and each other",
    tags: ["kitchen setting", "competition", "food", "comedy", "low budget"],
    recommendedMode: "beast" // Food competition good for OpenAI
  },
  {
    title: "Underground Band",
    genre: "Music Documentary",
    synopsis: "A struggling local band prepares for the biggest gig of their career while dealing with creative differences, personal conflicts, and the realities of balancing artistic dreams with day jobs.",
    theme: "The pursuit of passion against practical odds and the power of music to unite despite differences",
    tags: ["band rehearsal", "performance footage", "documentary style", "music", "low budget"],
    recommendedMode: "beast" // Music documentary good for OpenAI
  },
  {
    title: "Silent Treatment",
    genre: "Experimental Drama",
    synopsis: "After a bitter argument, a couple challenges themselves to go 24 hours without speaking to each other, using only written notes, gestures, and creative methods to communicate while confined to their apartment during a snowstorm.",
    theme: "The limitations of communication and how we find ways to connect even in silence",
    tags: ["minimal dialogue", "apartment setting", "two actors", "experimental", "low budget"],
    recommendedMode: "beast" // Experimental content good for OpenAI
  },
  {
    title: "The Porch",
    genre: "Neighborhood Drama",
    synopsis: "From the vantage point of a front porch, we witness the comings and goings of a diverse neighborhood over the course of a summer day, revealing interconnected stories and community dynamics.",
    theme: "The microcosm of society found in a single neighborhood and how public spaces create community",
    tags: ["single location", "multiple storylines", "observational", "community", "low budget"],
    recommendedMode: "beast" // Community stories good for OpenAI
  },
  {
    title: "The House-Sitter",
    genre: "Psychological Suspense",
    synopsis: "A college student takes a job house-sitting for a wealthy family, but as they spend more time in the luxurious home, they begin to uncover disturbing secrets about the homeowners and find themselves unable to resist the temptation to try on their lives.",
    theme: "Class envy and the psychological danger of coveting others' lives",
    tags: ["house setting", "solo protagonist", "psychological", "suspense", "low budget"],
    recommendedMode: "stable" // Psychological suspense better for Gemini
  },
  {
    title: "Virtual Reality",
    genre: "Tech Horror",
    synopsis: "A beta tester for a new virtual reality game discovers that the game has begun to blur the lines between simulation and reality, with glitches from the game world appearing in their real life with increasingly terrifying consequences.",
    theme: "The dangers of technology and our growing inability to distinguish between the virtual and the real",
    tags: ["apartment setting", "technology", "horror", "reality-bending", "low budget"],
    recommendedMode: "stable" // Tech horror better for Gemini
  },
  {
    title: "Open Mic",
    genre: "Comedy Drama",
    synopsis: "A group of amateur comedians who regularly perform at a local open mic night face their personal demons through comedy, supporting each other while competing for a chance to open for a famous comedian coming to town.",
    theme: "Using humor to process pain and finding your authentic voice through creative expression",
    tags: ["comedy club setting", "performance", "small cast", "character study", "low budget"],
    recommendedMode: "beast" // Comedy drama good for OpenAI
  },
  {
    title: "The Bookshop",
    genre: "Magical Realism",
    synopsis: "The new employee at a small, independent bookshop discovers that certain books have the mysterious power to change the lives of whoever reads them—sometimes in unpredictable and not always positive ways.",
    theme: "The transformative power of literature and the responsibility that comes with wielding that power",
    tags: ["bookstore setting", "magical elements", "character-driven", "low budget", "minimal effects"],
    recommendedMode: "beast" // Magical realism good for OpenAI
  },
  {
    title: "Countdown",
    genre: "Birthday Drama",
    synopsis: "As the hours count down to their 30th birthday party, a person frantically tries to get their life in order and create the illusion of success and happiness for their visiting friends, leading to a night of revelations and reckonings.",
    theme: "The gap between our social media personas and our real lives, and the liberation that comes with authenticity",
    tags: ["apartment setting", "real-time", "character study", "friendship", "low budget"],
    recommendedMode: "beast" // Character-driven drama good for OpenAI
  },
  {
    title: "Small Claims",
    genre: "Legal Comedy",
    synopsis: "Two neighbors locked in a petty dispute take their case to small claims court, each representing themselves and recruiting increasingly absurd witnesses and evidence as their feud escalates beyond proportion.",
    theme: "The absurdity of minor conflicts that consume our lives and the humor in taking ourselves too seriously",
    tags: ["courtroom setting", "comedy", "two antagonists", "mockumentary style", "low budget"],
    recommendedMode: "beast" // Comedy good for OpenAI
  },
  {
    title: "The Visit",
    genre: "Family Drama",
    synopsis: "An estranged child returns home to care for their ailing parent for a weekend, forcing them to confront unresolved family history and navigate a relationship strained by years of distance and misunderstanding.",
    theme: "Reconciliation, forgiveness, and the complicated nature of family bonds that persist despite hurt",
    tags: ["house setting", "two-person drama", "emotional", "character study", "low budget"],
    recommendedMode: "beast" // Family drama good for OpenAI
  },
  {
    title: "The Night Shift",
    genre: "Workplace Drama",
    synopsis: "The overnight employees at a 24-hour convenience store – including students, immigrants, and those working second jobs – share their stories and form unexpected bonds during the quiet hours when the rest of the world sleeps.",
    theme: "The dignity of work, unlikely friendships, and the hidden lives of those in service jobs",
    tags: ["store setting", "night scenes", "ensemble cast", "character-driven", "low budget"],
    recommendedMode: "beast" // Workplace drama good for OpenAI
  },
  {
    title: "Haunted Apartment",
    genre: "Supernatural Horror",
    synopsis: "A struggling artist rents an incredibly affordable apartment only to discover why the rent is so low: the place is haunted by a presence that seems to be drawing inspiration from their artwork in increasingly terrifying ways.",
    theme: "The dark side of creativity and confronting the demons of our imagination",
    tags: ["apartment setting", "haunting", "minimal effects", "psychological", "low budget"],
    recommendedMode: "stable" // Supernatural horror better for Gemini
  },
  {
    title: "Truth or Dare",
    genre: "Teen Horror",
    synopsis: "A group of friends playing an innocent game of Truth or Dare at a sleepover discover that failing to complete a dare or tell the truth results in mysterious and escalating consequences.",
    theme: "The price of dishonesty and how games reveal our hidden selves",
    tags: ["house setting", "game premise", "teen cast", "night setting", "low budget"],
    recommendedMode: "stable" // Teen horror better for Gemini
  },
  {
    title: "Digital Echoes",
    genre: "Tech Thriller",
    synopsis: "A team of hackers uncover a conspiracy involving AI surveillance technology that can predict criminal behavior. As they try to expose the truth, they become the targets of a shadowy organization looking to silence them.",
    theme: "Privacy in the digital age and the ethical implications of predictive algorithms",
    tags: ["cybersecurity", "ethics", "conspiracy", "thriller"],
    recommendedMode: "stable" // Tech thriller with potential violence
  },
  {
    title: "Homecoming Shadows",
    genre: "Coming-of-age Drama",
    synopsis: "Five high school friends reunite in their small hometown for their 10-year reunion, only to confront the unresolved tensions and secrets that tore them apart a decade ago.",
    theme: "Reconciliation, forgiveness, and the weight of past decisions on present relationships",
    tags: ["friendship", "secrets", "small town", "nostalgia"],
    recommendedMode: "beast" // Character-driven drama good for OpenAI
  },
  {
    title: "Study Group",
    genre: "Teen Comedy",
    synopsis: "Four academically-struggling high school seniors form a study group to pass their final exams. What starts as reluctant collaboration turns into genuine friendship as they help each other overcome personal challenges while cramming for tests.",
    theme: "Finding your tribe and discovering your potential through connection with others",
    tags: ["teen", "comedy", "school", "friendship", "coming-of-age"],
    recommendedMode: "beast" // Teen comedy perfect for OpenAI
  },
  {
    title: "Shifting Tides",
    genre: "Climate Drama",
    synopsis: "As sea levels rise, a coastal community faces difficult choices. Through the eyes of a family-owned fishing business, a local politician, and climate activists, we see the personal impact of global environmental change.",
    theme: "Climate adaptation, community resilience, and intergenerational responsibility",
    tags: ["environment", "community", "activism", "family"],
    recommendedMode: "beast" // Environmental drama good for OpenAI
  },
  {
    title: "After Hours",
    genre: "Comedy Mystery",
    synopsis: "Two night-shift janitors at a tech company discover mysterious activity in the building after everyone leaves. Their amateur investigation leads them down a rabbit hole of corporate espionage, eccentric employees with secrets, and potential supernatural phenomena.",
    theme: "Finding adventure in mundane places and the unexpected bonds formed during shared experiences",
    tags: ["workplace", "comedy", "mystery", "night setting", "buddy comedy"],
    recommendedMode: "beast" // Comedy mystery good for OpenAI
  },
  {
    title: "Family Recipe",
    genre: "Family Drama",
    synopsis: "Three generations of a family-run restaurant struggle to stay relevant in a changing culinary landscape. When the grandmother falls ill, long-buried secrets and resentments surface, threatening the business and their bonds.",
    theme: "Cultural heritage, family traditions, and adapting to change while honoring the past",
    tags: ["food", "family business", "tradition", "secrets"],
    recommendedMode: "beast" // Family drama good for OpenAI
  },
  {
    title: "The Competition",
    genre: "Dance Drama",
    synopsis: "A group of amateur dancers enter a prestigious street dance competition, hoping to win the cash prize to save their community center. Each dancer brings their unique style and personal struggles, creating tensions and unexpected alliances within the crew.",
    theme: "Self-expression through art and finding personal identity within a collective",
    tags: ["dance", "competition", "diverse cast", "friendship", "urban"],
    recommendedMode: "beast" // Dance drama good for OpenAI
  },
  {
    title: "Off The Grid",
    genre: "Survival Thriller",
    synopsis: "During a weekend camping trip in a remote forest, four friends lose their way and their means of communication with the outside world. As they struggle to find their way back to civilization, tensions rise and they realize someone or something might be stalking them.",
    theme: "Human resilience in isolation and how extreme circumstances reveal true character",
    tags: ["wilderness", "survival", "friendship tested", "outdoor filming"],
    recommendedMode: "stable" // Survival thriller with potential violence better for Gemini
  },
  {
    title: "Parallel",
    genre: "Sci-Fi Drama",
    synopsis: "Two neighbors in adjacent apartments lead completely separate lives until a strange occurrence causes their realities to begin merging. As walls literally and figuratively disappear between them, they must figure out what's happening before both their identities completely dissolve.",
    theme: "The boundaries between self and other, and finding connection in an alienating world",
    tags: ["apartment setting", "minimal effects", "two-person cast", "psychological"],
    recommendedMode: "stable" // Sci-fi with potentially complex themes better for Gemini
  },
  {
    title: "Garage Band",
    genre: "Musical Comedy",
    synopsis: "A group of middle-aged former bandmates reunite in a suburban garage to recapture their youth and maybe finally record that album they always talked about. Their musical journey forces them to confront their unfulfilled dreams and current life disappointments.",
    theme: "It's never too late to pursue your passion and the healing power of creative expression",
    tags: ["music", "middle-age", "comedy", "garage setting", "friendship"],
    recommendedMode: "beast" // Musical comedy good for OpenAI
  },
  {
    title: "The Ghost Tour",
    genre: "Supernatural Comedy",
    synopsis: "A skeptical history major takes a job as a guide for a 'haunted history' walking tour to pay tuition. When actual supernatural events begin occurring during the tours, the student must team up with a true believer to uncover the cause before someone gets hurt.",
    theme: "Opening your mind to possibilities beyond rational explanation and finding wonder in the everyday",
    tags: ["ghost story", "comedy", "walking tour", "historic locations", "odd couple"],
    recommendedMode: "stable" // Supernatural content better for Gemini
  },
  {
    title: "Recovery Road",
    genre: "Road Trip Drama",
    synopsis: "Two estranged siblings are forced to take a cross-country road trip in their late father's vintage car to settle his estate. Along the way, they confront their troubled past, meet unusual characters, and slowly rebuild their bond.",
    theme: "Family reconnection and the healing that comes from shared experiences, even difficult ones",
    tags: ["road trip", "siblings", "car scenes", "character study", "scenic locations"],
    recommendedMode: "beast" // Road trip drama good for OpenAI
  },
  {
    title: "Underground",
    genre: "Music Drama",
    synopsis: "In a city where music has been restricted by an authoritarian government, a diverse group of young musicians create an underground venue to perform and record their revolutionary songs, risking everything for artistic freedom.",
    theme: "Art as resistance and finding your voice in a world that wants to silence you",
    tags: ["music", "resistance", "underground venue", "diverse cast", "dystopian elements"],
    recommendedMode: "stable" // Potentially political themes better for Gemini
  }
]

export default function StoryRecommendations() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const router = useRouter()
  
  // Filter recommendations by genre and search query
  const filteredRecommendations = RECOMMENDATIONS.filter(rec => {
    const matchesGenre = selectedGenre ? rec.genre === selectedGenre : true
    const matchesSearch = searchQuery 
      ? rec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        rec.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
    return matchesGenre && matchesSearch
  })
    
  // Get unique genres for filter buttons
  const genres = Array.from(new Set(RECOMMENDATIONS.map(rec => rec.genre)))
  
  // Use a recommendation as a starting point
  const handleUseRecommendation = (recommendation: StoryRecommendation) => {
    try {
      // Store in localStorage
      localStorage.setItem('projectData', JSON.stringify({
        title: recommendation.title,
        synopsis: recommendation.synopsis,
        theme: recommendation.theme,
        createdAt: new Date().toISOString(),
        recommendedMode: recommendation.recommendedMode // Store the recommended mode
      }))
      
      // Navigate to preproduction
      router.push(`/preproduction?synopsis=${encodeURIComponent(recommendation.synopsis)}&theme=${encodeURIComponent(recommendation.theme)}&project=${encodeURIComponent(recommendation.title)}&mode=${recommendation.recommendedMode}`)
    } catch (error) {
      console.error('Error using recommendation:', error)
    }
  }
  
  return (
    <div className="py-8 px-6 md:px-8">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-[#00FF99]" />
            Story Templates
          </h2>
          
          <div className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded-lg">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm w-full focus:ring-0"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              selectedGenre === null
                ? 'bg-[#00FF99] text-black font-medium'
                : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
            }`}
          >
            All Genres
          </button>
          
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedGenre === genre
                  ? 'bg-[#00FF99] text-black font-medium'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((recommendation, index) => (
            <motion.div
            key={recommendation.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="h-full border border-[#36393f] bg-[#1e1e1e] hover:border-[#00FF99]/50 transition-all hover:shadow-[0_0_15px_rgba(0,255,153,0.1)] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-start">
                  <span>{recommendation.title}</span>
                  <span className="text-xs font-normal px-2 py-1 bg-[#2a2a2a] rounded-full">
                    {recommendation.genre}
                    </span>
                </CardTitle>
                </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-gray-300 line-clamp-3">{recommendation.synopsis}</p>
                
                <div className="flex flex-wrap gap-1.5">
                  {recommendation.tags.map((tag) => (
                    <span key={tag} className="text-xs text-gray-400 px-2 py-0.5 bg-[#2a2a2a] rounded-full flex items-center">
                      <Tag className="h-3 w-3 mr-1 text-[#00FF99]" />
                          {tag}
                        </span>
                      ))}
                    </div>
                
                {/* Recommended mode badge */}
                <div className="flex items-center">
                  <span className="text-xs text-gray-300 mr-2">Recommended:</span>
                  {recommendation.recommendedMode === 'beast' ? (
                    <span className="text-xs flex items-center px-2 py-1 bg-[#00FF99]/20 text-[#00FF99] rounded-full">
                      <Bolt className="h-3 w-3 mr-1" />
                      Beast Mode
                    </span>
                  ) : (
                    <span className="text-xs flex items-center px-2 py-1 bg-[#6e56cf]/20 text-[#a087ff] rounded-full">
                      <Shield className="h-3 w-3 mr-1" />
                      Stable Mode
                    </span>
                  )}
                  </div>
                
                {/* Multi-Model AI explanation */}
                <div className="mt-2 text-xs text-gray-400 italic">
                  <p>Our intelligent multi-model AI automatically routes creative tasks to Gemini 2.5 Pro and analytical tasks to GPT-4.1 for optimal story quality.</p>
                </div>
                
                <Button
                  onClick={() => handleUseRecommendation(recommendation)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-[#00FF99]/30 text-[#00FF99] hover:bg-[#00FF99]/10"
                >
                  <Film className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="mb-4 flex justify-center">
            <Search className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No templates found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            We couldn't find any templates matching your search criteria. Try different keywords or clear your filters.
          </p>
        </div>
      )}
    </div>
  )
} 