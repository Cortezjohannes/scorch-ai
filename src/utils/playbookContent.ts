export interface PlaybookContent {
  title: string
  message: string
  midExample: string
  sTierExample: string
}

export const playbookContent: Record<string, PlaybookContent> = {
  logline: {
    title: "The Logline",
    message: "One paragraph that captures the essence of your series. This is your hook—the thing that makes someone want to watch. Think about what makes your story unique and compelling. Who is your protagonist? What's the central conflict? What's at stake? What makes this story different from everything else? Be specific with details, emotions, and consequences. Avoid generic descriptions—the more concrete and vivid you are, the stronger your foundation will be.",
    midExample: "A group of friends navigate high school drama.",
    sTierExample: "When a viral video exposes the school's secret underground fight club, a shy transfer student must choose between protecting her new friends or exposing the truth that could destroy them all."
  },
  protagonist: {
    title: "The Protagonist",
    message: "Who is your main character and what makes them compelling? Don't just give us a name and age. What's their unique ability, flaw, or circumstance? What do they want? What are they running from? The more specific you are about their background, skills, and internal conflict, the richer your story will be.",
    midExample: "Sarah is a typical teenager who wants to fit in.",
    sTierExample: "Maya Chen, a 17-year-old former competitive gymnast with a photographic memory, moves to a new school after her family's restaurant burns down. She's desperate to stay invisible, but her ability to remember every detail makes her the perfect witness to crimes others miss."
  },
  stakes: {
    title: "The Stakes",
    message: "What happens if your protagonist fails? This isn't just about what they want—it's about what they'll lose. Make the consequences concrete and meaningful. What relationships will be destroyed? What opportunities will be lost? What will happen to the people they care about? The higher the stakes, the more invested your audience becomes.",
    midExample: "She might not get the guy she likes.",
    sTierExample: "If Maya speaks up, her family loses their new home and her little brother gets expelled. If she stays silent, the underground ring continues to recruit and potentially harm other students, including her only friend."
  },
  vibe: {
    title: "The Vibe",
    message: "What's the emotional tone and visual style? This is where you paint the atmosphere. Think about the mood, the aesthetic, the feeling you want to evoke. What shows or movies does it remind you of? What's the color palette? The pacing? The energy? Be specific about the sensory details—the sounds, the lighting, the texture of the world you're creating.",
    midExample: "It's a teen drama like Riverdale.",
    sTierExample: "Think 'Euphoria' meets 'The Social Network' - neon-lit hallways, social media as a weapon, the constant hum of notifications creating anxiety. Every frame feels like it's being watched, recorded, judged."
  },
  theme: {
    title: "The Theme",
    message: "What's the deeper message or question you're exploring? This is the philosophical core of your story. What universal truth are you examining? What question are you asking the audience to consider? Don't just state a moral—frame it as a question or a tension. The best themes create debate and make people think.",
    midExample: "Friendship is important.",
    sTierExample: "In a world where every moment is recorded and judged, what does it mean to be truly authentic? Can you maintain your integrity when the cost of truth is everything you've built?"
  }
}

