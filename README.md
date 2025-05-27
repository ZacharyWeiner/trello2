# 🚀 Trello Clone - Advanced Project Management Platform

A modern, feature-rich Trello clone built with Next.js, TypeScript, and Tailwind CSS. This project management platform includes advanced features like Gantt Chart visualization and Smart Meeting Notes to Tasks conversion.

## ✨ Key Features

### 📊 **Gantt Chart Timeline View**
- **Interactive project timeline** with visual task bars
- **Milestone tracking** with diamond indicators
- **Progress visualization** and completion tracking
- **Timeline playback** with date progression
- **Zoom controls** and view customization
- **Task grouping** by assignee, list, or priority
- **Conflict detection** and resource management
- **Export functionality** for project documentation
- **Responsive design** for mobile and desktop

### 🧠 **Smart Meeting Notes to Tasks**
- **Automatic task extraction** from meeting notes using NLP
- **Real-time processing** with live preview
- **Smart pattern recognition** for action items, decisions, blockers
- **Confidence scoring** (0-100%) for each extracted task
- **Assignee detection** from names and @mentions
- **Due date parsing** ("by Friday", "next week", etc.)
- **Priority keyword recognition** ("urgent", "critical", etc.)
- **No external AI APIs** - everything runs locally
- **Privacy-first approach** - no data leaves your system

### 🎯 **Core Kanban Features**
- **Drag & drop** cards between lists
- **Real-time collaboration** with live presence indicators
- **Custom labels** and color coding
- **Due dates** and priority levels
- **File attachments** and image uploads
- **Comments** with @mentions
- **Checklists** with progress tracking
- **Card templates** for common tasks
- **Board templates** for different workflows

### 🔧 **Advanced Functionality**
- **Custom fields** for additional metadata
- **Automation rules** for workflow optimization
- **Search & filtering** across all content
- **Activity tracking** and audit logs
- **Team management** with role-based permissions
- **Notifications** and email alerts
- **Dark/light theme** support
- **Mobile-responsive** design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks, Context API
- **Real-time**: WebSocket integration ready
- **Database Ready**: Designed for Firebase/Supabase integration
- **Authentication**: NextAuth.js ready
- **Deployment**: Vercel optimized

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/trello-clone.git
cd trello-clone
   ```

2. **Install dependencies**
   ```bash
npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
cp .env.example .env.local
   ```
   
   Configure your environment variables:
```env
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   # Add your database and auth provider configs
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── boards/                   # Board management pages
│   ├── gantt-demo/              # Gantt Chart demo page
│   ├── meeting-demo/            # Meeting Notes demo page
│   └── layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── boards/                  # Board-related components
│   ├── gantt/                   # Gantt Chart components
│   │   ├── GanttChart.tsx       # Main Gantt visualization
│   │   └── GanttViewManager.tsx # Full-screen Gantt view
│   ├── meeting/                 # Meeting Notes components
│   │   └── MeetingNotesToTasks.tsx # Smart parser UI
│   └── ui/                      # Base UI components
├── services/                    # Business logic services
│   ├── ganttService.ts          # Gantt Chart data processing
│   └── meetingParserService.ts  # NLP meeting notes parser
├── types/                       # TypeScript type definitions
│   ├── index.ts                 # Core types (Board, Card, List)
│   ├── gantt.ts                 # Gantt Chart types
│   └── meeting.ts               # Meeting Notes types
└── lib/                         # Utility functions
```

## 🎨 Demo Pages

### Gantt Chart Demo
Visit `/gantt-demo` to see the interactive Gantt Chart in action:
- Sample project with realistic timeline
- Interactive task bars and milestones
- Progress tracking and visualization
- Export and view management features

### Meeting Notes Demo  
Visit `/meeting-demo` to try the Smart Meeting Notes parser:
- Sample meeting notes from different meeting types
- Real-time task extraction with confidence scoring
- Smart suggestions for assignees and due dates
- Live preview of generated tasks

## 🔧 Key Components

### Gantt Chart System

**Core Files:**
- `src/components/gantt/GanttChart.tsx` - Main visualization component
- `src/components/gantt/GanttViewManager.tsx` - Full-screen modal manager
- `src/services/ganttService.ts` - Data conversion and timeline logic
- `src/types/gantt.ts` - TypeScript interfaces

**Features:**
```typescript
// Convert board data to Gantt timeline
const timeline = GanttService.convertBoardToGantt(board, lists, cards);

// Interactive task visualization with progress
<GanttChart
  timeline={timeline}
  onTaskUpdate={handleTaskUpdate}
  onTaskClick={handleTaskClick}
  onMilestoneClick={handleMilestoneClick}
/>
```

### Smart Meeting Notes Parser

**Core Files:**
- `src/components/meeting/MeetingNotesToTasks.tsx` - Main UI component
- `src/services/meetingParserService.ts` - NLP processing engine
- `src/types/meeting.ts` - Meeting and task interfaces

**Usage:**
```typescript
// Parse meeting notes into structured tasks
const analysis = await MeetingParserService.parseMeetingNotes(
  meetingNote,
  board,
  customRules
);

// Extract tasks with confidence scoring
analysis.extractedTasks.forEach(task => {
  console.log(`${task.text} - ${task.confidence}% confidence`);
});
```

## 🎯 Integration Guide

### Adding to Existing Board

1. **Add Gantt Chart to Board Header:**
```tsx
import { GanttViewManager } from '@/components/gantt/GanttViewManager';

// In your BoardHeader component
<button onClick={() => setShowGantt(true)}>
  <Calendar className="h-4 w-4" />
  Gantt Timeline
</button>

<GanttViewManager
  isOpen={showGantt}
  onClose={() => setShowGantt(false)}
  board={board}
  lists={lists}
  cards={cards}
  onCardUpdate={handleCardUpdate}
/>
```

2. **Add Meeting Notes to Tools Menu:**
```tsx
import { MeetingNotesToTasks } from '@/components/meeting/MeetingNotesToTasks';

// In your Tools dropdown
<button onClick={() => setShowMeetingNotes(true)}>
  <Brain className="h-4 w-4" />
  Meeting Notes to Tasks
</button>

<MeetingNotesToTasks
  isOpen={showMeetingNotes}
  onClose={() => setShowMeetingNotes(false)}
  board={board}
  lists={lists}
  onTasksCreated={handleTasksCreated}
/>
```

## 🔍 Smart Meeting Notes Examples

The parser recognizes various patterns:

**Action Items:**
```
"Alice needs to update the documentation by Friday"
→ Task: "Update the documentation", Assignee: Alice, Due: Friday

"TODO: Review the API design" 
→ Task: "Review the API design", Type: Action Item

"Bob will create wireframes for the new feature"
→ Task: "Create wireframes for the new feature", Assignee: Bob
```

**Decisions:**
```
"We decided to use React for the frontend"
→ Decision: "Use React for the frontend"

"Team agreed to postpone the launch until next month"
→ Decision: "Postpone launch until next month"
```

**Blockers:**
```
"Blocked by missing API documentation"
→ Blocker: "Missing API documentation", Priority: High

"Can't proceed without database credentials"
→ Blocker: "Need database credentials", Type: Dependency
```

## 📊 Performance Features

- **Optimized rendering** with React.memo and useMemo
- **Lazy loading** for large datasets
- **Debounced processing** for real-time features
- **Efficient re-renders** with proper dependency arrays
- **Memory management** with cleanup functions

## 🎨 Customization

### Themes and Styling
- Built with Tailwind CSS for easy customization
- CSS custom properties for dynamic theming
- Responsive design with mobile-first approach
- Dark mode support ready

### Extending Functionality
- Modular component architecture
- TypeScript interfaces for type safety
- Service layer for business logic separation
- Easy integration with external APIs

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Analyze bundle size
npm run analyze
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build Docker image
docker build -t trello-clone .

# Run container
docker run -p 3000:3000 trello-clone
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **Framer Motion** for smooth animations
- **Trello** for the original inspiration

## 📞 Support

- 📧 Email: support@yourproject.com
- 💬 Discord: [Join our community](https://discord.gg/yourserver)
- 📖 Documentation: [Full docs](https://docs.yourproject.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/trello-clone/issues)

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.** 