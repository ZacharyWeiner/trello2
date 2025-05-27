# Smart Meeting Notes to Tasks - Integration Guide

## 🎯 Overview

The Smart Meeting Notes to Tasks feature transforms meeting notes into actionable tasks using local NLP processing - no external AI APIs required! This feature solves the real pain point of manually converting meeting discussions into trackable tasks.

## 🚀 Key Features

### ✨ **Smart Pattern Recognition**
- Uses advanced regex patterns and NLP techniques
- Identifies action items, decisions, questions, and blockers
- Extracts assignees, due dates, and priorities automatically

### 🎯 **Automatic Task Extraction**
- Converts natural language into structured tasks
- Assigns confidence scores to each extracted task
- Supports multiple meeting types (standup, planning, review, etc.)

### ⚡ **Real-time Processing**
- Processes notes as you type with intelligent debouncing
- Live preview of extracted tasks
- No external API calls - everything runs locally

### 🧠 **Smart Suggestions**
- Suggests assignees based on task content
- Recommends due dates based on priority
- Provides context-aware improvements

## 📁 File Structure

```
src/
├── types/meeting.ts                     # TypeScript interfaces
├── services/meetingParserService.ts     # Core parsing logic
├── components/meeting/
│   └── MeetingNotesToTasks.tsx         # Main UI component
└── app/meeting-demo/page.tsx           # Demo page
```

## 🔧 Integration Steps

### 1. Add to Board Header

Add the Meeting Notes button to your board header:

```tsx
// In src/components/boards/BoardHeader.tsx

import { MeetingNotesToTasks } from '@/components/meeting/MeetingNotesToTasks';
import { Brain } from 'lucide-react';

// Add state
const [showMeetingNotes, setShowMeetingNotes] = useState(false);

// Add button to Tools dropdown
<button
  onClick={() => setShowMeetingNotes(true)}
  className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
>
  <Brain className="h-4 w-4" />
  <span>Meeting Notes to Tasks</span>
</button>

// Add modal at the end
<MeetingNotesToTasks
  isOpen={showMeetingNotes}
  onClose={() => setShowMeetingNotes(false)}
  board={board}
  lists={lists}
  onTasksCreated={(tasks) => {
    // Handle created tasks - add them to your board
    console.log('Created tasks:', tasks);
  }}
/>
```

### 2. Handle Task Creation

Implement the task creation callback:

```tsx
const handleTasksCreated = (tasks: Card[]) => {
  // Add tasks to your board state
  tasks.forEach(task => {
    // Add to appropriate list
    const targetList = lists.find(l => l.id === task.listId);
    if (targetList) {
      // Update your board state with new tasks
      onCardCreate(task);
    }
  });
  
  // Show success notification
  toast.success(`Created ${tasks.length} task${tasks.length !== 1 ? 's' : ''} from meeting notes!`);
};
```

## 🎨 UI Components

### Main Modal Features
- **3-tab interface**: Input, Analysis, Tasks
- **Real-time processing** with live preview
- **Smart suggestions** sidebar
- **Task editing** and selection
- **Confidence scoring** for each task
- **Meeting metadata** (title, type, attendees)

### Analysis Dashboard
- **Summary statistics** (tasks, decisions, questions, blockers)
- **Sentiment analysis** (positive, neutral, negative)
- **Urgency level** detection
- **Key decisions** extraction
- **Questions & clarifications** list

## 🧠 Parser Capabilities

### Pattern Recognition
The parser uses sophisticated regex patterns to identify:

```typescript
// Action items
"Alice needs to update the documentation by Friday"
"TODO: Review the API design"
"Bob will create wireframes for the new feature"

// Decisions
"We decided to use React for the frontend"
"Agreed to postpone the launch until next month"

// Questions
"Who can help with the database setup?"
"When will the security review be completed?"

// Blockers
"Blocked by missing API documentation"
"Waiting for approval from legal team"
```

### Smart Extraction Features
- **Assignee Detection**: Recognizes names and @mentions
- **Due Date Parsing**: Understands "by Friday", "next week", etc.
- **Priority Keywords**: "urgent", "critical", "important", etc.
- **Confidence Scoring**: 0-100% confidence for each task
- **Duplicate Removal**: Prevents similar tasks from being created

## 📊 Demo Examples

Visit `/meeting-demo` to see the feature in action with sample meeting notes:

1. **Sprint Planning Meeting** - Complex project planning with multiple assignees
2. **Daily Standup** - Quick status updates with blockers
3. **Product Review** - Feedback session with action items

## 🔧 Customization

### Custom Extraction Rules
Add your own parsing patterns:

```typescript
const customRules: TaskExtractionRule[] = [
  {
    id: 'custom-pattern',
    name: 'Custom Action Pattern',
    pattern: /\b(remember to|don't forget)\s+(.+)/gi,
    priority: 7,
    actionType: 'todo',
    confidenceBoost: 15,
    examples: ['Remember to send the report', "Don't forget to call the client"],
    enabled: true
  }
];
```

### Meeting Templates
Create templates for different meeting types:

```typescript
const standupTemplate: MeetingTemplate = {
  id: 'standup',
  name: 'Daily Standup',
  description: 'Standard daily standup format',
  structure: [
    'What did you do yesterday?',
    'What will you do today?',
    'Any blockers?'
  ],
  defaultTags: ['standup', 'daily'],
  extractionRules: ['action-verb-pattern', 'blocker-pattern'],
  meetingType: 'standup'
};
```

## 🎯 Benefits

### For Teams
- **Reduces manual work** - No more manually creating tasks from notes
- **Improves accuracy** - Never miss action items again
- **Saves time** - Instant task creation from meeting discussions
- **Better tracking** - All tasks have context and metadata

### For Project Managers
- **Complete visibility** - See all commitments made in meetings
- **Automatic assignment** - Tasks are pre-assigned based on discussion
- **Priority awareness** - Urgent items are automatically flagged
- **Meeting insights** - Sentiment and urgency analysis

## 🚀 Getting Started

1. **Try the demo**: Visit `/meeting-demo` to see it in action
2. **Copy sample notes**: Use the provided examples to test
3. **Integrate with your board**: Add to BoardHeader component
4. **Customize patterns**: Add your own extraction rules
5. **Train your team**: Show them the supported patterns

## 💡 Tips for Best Results

### Meeting Note Format
- Use clear action language: "John will...", "TODO:", "Action item:"
- Include names for assignments: "Sarah should review..."
- Mention timeframes: "by Friday", "next week"
- Mark urgent items: "URGENT:", "critical", "immediately"

### Supported Patterns
- **Assignments**: "X will do Y", "assign to X", "@username"
- **Deadlines**: "by Friday", "due Monday", "end of week"
- **Priorities**: "urgent", "critical", "important", "low priority"
- **Actions**: "create", "update", "review", "fix", "implement"

## 🔮 Future Enhancements

- **Meeting recording integration** - Parse audio transcripts
- **Calendar integration** - Auto-schedule follow-up meetings
- **Slack/Teams integration** - Import meeting notes from chat
- **Advanced NLP** - Better context understanding
- **Team expertise mapping** - Smarter assignee suggestions
- **Progress tracking** - Link tasks back to meeting outcomes

---

**Ready to transform your meeting notes into actionable tasks?** 
Visit `/meeting-demo` to try it now! 🚀 