

# Plan: Add "Coming Soon" Age Tool Cards with Email Notifications

## Overview
Add a section to the Results Page displaying 4 upcoming age assessment tools. Each card has a "Notify me" button that opens a modal for email capture. After submission, a confirmation message appears.

## Components to Create/Modify

### 1. New Component: `ComingSoonCard.tsx`
A reusable card component for each upcoming age tool with:
- Tool name as heading
- One-line description
- "Notify me" button (triggers modal)

### 2. New Component: `NotifyModal.tsx`
A modal dialog using the existing Dialog component:
- Text: "Get notified when this age tool becomes available."
- Email input field with validation
- "Notify me" button
- Footer text: "We'll email only when this tool is ready."

### 3. Modify: `ResultsPage.tsx`
- Add a new section between "Areas to Improve" and the action buttons
- Display 4 coming soon cards in a grid
- Manage modal open/close state
- Track which tools the user has signed up for
- Show confirmation message after email submission

## Coming Soon Tools Data
```text
1. Metabolic Age
   - Energy usage and metabolic efficiency

2. Brain Age
   - Cognitive load and nervous system resilience

3. Cardiovascular Age
   - Heart efficiency and recovery capacity

4. Longevity Age Index
   - Long-term resilience and aging trajectory
```

## UI/UX Flow

```text
+----------------------------------+
|          Results Page            |
|                                  |
|  [Entropy Age Card - existing]   |
|                                  |
|  [Areas to Improve - existing]   |
|                                  |
|  ====== Coming Soon ======       |
|                                  |
|  +------------+  +------------+  |
|  |Metabolic   |  |Brain Age   |  |
|  |Age         |  |            |  |
|  |[Notify me] |  |[Notify me] |  |
|  +------------+  +------------+  |
|                                  |
|  +------------+  +------------+  |
|  |Cardio Age  |  |Longevity   |  |
|  |            |  |Index       |  |
|  |[Notify me] |  |[Notify me] |  |
|  +------------+  +------------+  |
|                                  |
|  [Save Image] [Share]            |
|  [Retake Assessment]             |
+----------------------------------+
```

## Email Submission Flow

1. User clicks "Notify me" on any card
2. Modal opens with email input
3. User enters email and submits
4. Modal closes
5. Confirmation toast appears: "You'll be notified when this tool becomes available."
6. Button on that card changes to show subscribed state (optional visual feedback)

## Data Storage
For now, emails will be stored in localStorage as a simple solution. This can be later connected to a backend/Supabase when available.

---

## Technical Details

### State Management in ResultsPage
```typescript
// New state variables
const [notifyModalOpen, setNotifyModalOpen] = useState(false);
const [selectedTool, setSelectedTool] = useState<string | null>(null);
const [subscribedTools, setSubscribedTools] = useState<string[]>([]);
```

### Coming Soon Data Structure
```typescript
const COMING_SOON_TOOLS = [
  {
    id: 'metabolic',
    name: 'Metabolic Age',
    description: 'Energy usage and metabolic efficiency',
  },
  {
    id: 'brain',
    name: 'Brain Age',
    description: 'Cognitive load and nervous system resilience',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular Age',
    description: 'Heart efficiency and recovery capacity',
  },
  {
    id: 'longevity',
    name: 'Longevity Age Index',
    description: 'Long-term resilience and aging trajectory',
  },
];
```

### Card Styling
- Use existing Card component with subtle border
- Non-clickable (only button triggers action)
- Clean, minimal design matching existing aesthetic
- Grid layout: 2 columns on desktop, 1 column on mobile

### Modal Implementation
- Use existing Dialog component from `@/components/ui/dialog`
- Email validation using zod schema
- Accessible with proper ARIA labels
- Close on successful submission

### Email Validation
```typescript
const emailSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Please enter a valid email" })
    .max(255, { message: "Email is too long" })
});
```

### Confirmation Feedback
Using the existing `sonner` toast system:
```typescript
import { toast } from 'sonner';

// After successful submission
toast.success("You'll be notified when this tool becomes available.");
```

## Files to Create
1. `src/components/ComingSoonCard.tsx` - Reusable card component
2. `src/components/NotifyModal.tsx` - Email capture modal

## Files to Modify
1. `src/components/ResultsPage.tsx` - Add coming soon section and modal integration

## Implementation Steps
1. Create `ComingSoonCard.tsx` with tool name, description, and notify button
2. Create `NotifyModal.tsx` with email form using Dialog component
3. Update `ResultsPage.tsx` to:
   - Import new components
   - Add coming soon section with 2x2 grid
   - Add state for modal and subscribed tools
   - Handle email submission and show confirmation toast
   - Persist subscribed state in localStorage

