# Technical Preparation for Fan Voting System

## Code Changes Required for Future Integration

### 1. Database Schema Preparation

**Add voting-related fields to existing tables:**

```sql
-- Extend projects table
ALTER TABLE projects ADD COLUMN voting_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN voting_revenue DECIMAL(10,2) DEFAULT 0.00;

-- Extend narrative_arcs table  
ALTER TABLE narrative_arcs ADD COLUMN voting_campaign_id UUID;
ALTER TABLE narrative_arcs ADD COLUMN fan_choice_applied VARCHAR(255);
```

### 2. Type Definitions to Add

**In `src/types/voting.ts` (create new file):**

```typescript
export interface VotingCampaign {
  id: string;
  projectId: string;
  arcNumber: number;
  title: string;
  description: string;
  options: VotingOption[];
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  totalVotes: number;
  totalRevenue: number;
}

export interface VotingOption {
  id: string;
  title: string;
  description: string;
  voteCount: number;
  revenue: number;
}

export interface Vote {
  id: string;
  campaignId: string;
  userId: string;
  optionId: string;
  voteWeight: number;
  amountPaid: number;
  paymentId: string;
  votedAt: Date;
}
```

### 3. Context Extensions

**Extend ProjectContext.tsx with voting functionality:**

```typescript
// Add to ProjectContextType
type ProjectContextType = {
  // ... existing properties
  votingCampaigns: VotingCampaign[];
  activeVotingCampaign: VotingCampaign | null;
  isVotingEnabled: boolean;
  submitVote: (campaignId: string, optionId: string, amount: number) => Promise<void>;
  getVotingResults: (campaignId: string) => Promise<VoteResults>;
  hasUserVoted: (campaignId: string) => boolean;
}

// Add voting state to ProjectProvider
const [votingCampaigns, setVotingCampaigns] = useState<VotingCampaign[]>([]);
const [activeVotingCampaign, setActiveVotingCampaign] = useState<VotingCampaign | null>(null);
```

### 4. Component Preparation

**Components that need voting integration:**

1. **Episode Display Components**
   - Add voting trigger for arc finales
   - Show voting results for completed campaigns
   - Display fan choice impact on story

2. **Project Navigation**
   - Voting campaigns tab
   - Revenue analytics for creators
   - Fan engagement metrics

3. **Episode Generation**
   - Check for fan voting results
   - Integrate winning choices into narrative
   - Update story bible with fan decisions

### 5. API Route Preparation

**Placeholder API routes (implement when ready):**

```typescript
// src/app/api/voting/campaigns/route.ts
export async function GET() {
  // Return user's voting campaigns
}

export async function POST() {
  // Create new voting campaign
}

// src/app/api/voting/[campaignId]/vote/route.ts
export async function POST() {
  // Submit vote with payment
}
```

### 6. Environment Variables to Add

```bash
# Payment Processing
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Voting System
VOTING_ENABLED=false
MIN_VOTE_AMOUNT=1.00
MAX_VOTE_AMOUNT=1000.00
VOTING_WINDOW_DAYS=7
```

### 7. Episode Generation Modifications

**Modify episode generation to check for fan votes:**

```typescript
// In generateEpisodeWithAzure and generateEpisodeWithGemini
const fanChoice = await getFanChoiceForArc(storyBible, episodeNumber);
if (fanChoice) {
  prompt += `\n\nIMPORTANT: The fans have voted for the following narrative direction: "${fanChoice}". Incorporate this choice into the episode while maintaining story coherence.`;
}
```

### 8. Story Bible Enhancements

**Add voting tracking to story bible structure:**

```typescript
export type StoryBible = {
  // ... existing properties
  fanVotingHistory?: FanVotingRecord[];
  communityInfluence?: {
    totalVotes: number;
    totalRevenue: number;
    majorDecisions: string[];
  };
}

export type FanVotingRecord = {
  arcNumber: number;
  question: string;
  winningChoice: string;
  voteCount: number;
  revenue: number;
  implementedAt: Date;
}
```

### 9. UI/UX Preparation

**Design system additions needed:**

1. **Voting Badge Components**
   - "Fan Voted" indicators
   - Revenue impact displays
   - Voting status badges

2. **Payment Flow Components**
   - Voting amount selector
   - Payment confirmation
   - Vote receipt display

3. **Results Visualization**
   - Vote count charts
   - Revenue distribution
   - Impact on story visualization

### 10. Security Considerations

**Implement security foundations:**

```typescript
// Input validation for voting
export const validateVoteAmount = (amount: number): boolean => {
  return amount >= 1.00 && amount <= 1000.00;
};

// Rate limiting for voting endpoints
export const votingRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 votes per windowMs
};
```

### 11. Analytics Integration

**Prepare analytics tracking:**

```typescript
// Track voting events
export const trackVotingEvent = (event: string, properties: any) => {
  // Integration with analytics service
  analytics.track(event, {
    ...properties,
    timestamp: new Date(),
    userId: user?.id,
  });
};
```

### 12. Notification System Preparation

**Extend notification system for voting:**

```typescript
export const sendVotingNotification = async (
  userId: string,
  campaignId: string,
  type: 'campaign_started' | 'voting_ended' | 'results_available'
) => {
  // Send email/push notification about voting events
};
```

## Integration Timeline

### Phase 1: Foundation (Week 1)
- Add database fields
- Create type definitions
- Set up environment variables
- Implement basic API structure

### Phase 2: Core Logic (Week 2)
- Voting state management
- Payment integration setup
- Security implementation
- Testing framework

### Phase 3: UI Integration (Week 3)
- Voting components
- Payment flow
- Results display
- Mobile optimization

### Phase 4: Testing & Launch (Week 4)
- End-to-end testing
- Security audit
- Performance optimization
- Beta user testing

## Backward Compatibility

All changes are designed to be backward compatible:
- New database fields are optional
- Voting is disabled by default
- Existing episodes continue to work
- No breaking changes to current API

## Performance Considerations

- Vote counting will use Redis for real-time updates
- Database queries optimized with proper indexing
- Caching for frequently accessed voting data
- CDN integration for voting assets

---

This preparation ensures smooth integration of the fan voting system when ready to implement, without disrupting current functionality. 