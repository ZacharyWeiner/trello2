// Test script for Meeting Notes AI Parser
// Run with: node src/app/test-meeting-parser.js

// Sample meeting note for testing
const sampleMeetingNote = {
  id: 'test-meeting-1',
  title: 'Sprint Planning Meeting',
  content: `Sprint Planning Meeting - March 15, 2024

Attendees: Alice Johnson, Bob Smith, Carol Davis, David Wilson

Discussion:
- Alice needs to finish the user authentication module by Friday
- Bob will start working on the payment integration next week  
- Carol should review the API documentation and provide feedback
- David is blocked by missing database credentials from DevOps team
- TODO: Schedule follow-up meeting with stakeholders
- URGENT: Fix the login bug that's affecting production users
- Sarah will create wireframes for the new dashboard

Action Items:
- Alice: Complete authentication module (Due: Friday)
- Bob: Research payment integration options
- Carol: Review and approve API docs
- David: Contact DevOps for database access

Blockers:
- Database credentials still pending from DevOps
- Waiting for design approval from marketing team`,
  date: new Date(),
  attendees: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'],
  boardId: 'test-board',
  createdBy: 'test-user',
  tags: ['sprint-planning'],
  meetingType: 'planning',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Sample board with team members
const sampleBoard = {
  id: 'test-board',
  title: 'Test Board',
  members: [
    {
      userId: 'user1',
      email: 'alice@example.com',
      displayName: 'Alice Johnson',
      photoURL: '',
      role: 'admin',
      joinedAt: new Date(),
      invitedBy: 'system'
    },
    {
      userId: 'user2', 
      email: 'bob@example.com',
      displayName: 'Bob Smith',
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'user1'
    },
    {
      userId: 'user3',
      email: 'carol@example.com', 
      displayName: 'Carol Davis',
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'user1'
    },
    {
      userId: 'user4',
      email: 'david@example.com',
      displayName: 'David Wilson', 
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'user1'
    }
  ]
};

// Test function to demonstrate parser usage
async function testMeetingParser() {
  console.log('🧠 Testing Meeting Notes AI Parser...\n');
  
  try {
    // Import the parser service (you'll need to adjust the path)
    const { MeetingParserService } = require('../services/meetingParserService.ts');
    
    // Parse the meeting notes
    const analysis = await MeetingParserService.parseMeetingNotes(
      sampleMeetingNote,
      sampleBoard,
      [] // No custom rules
    );
    
    console.log('📊 PARSING RESULTS:');
    console.log('==================');
    console.log(`Meeting: ${sampleMeetingNote.title}`);
    console.log(`Processed at: ${analysis.processedAt}`);
    console.log(`Sentiment: ${analysis.sentiment}`);
    console.log(`Urgency Level: ${analysis.urgencyLevel}\n`);
    
    console.log('✅ EXTRACTED TASKS:');
    console.log('-------------------');
    analysis.extractedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.text}`);
      console.log(`   Assignee: ${task.assignee || 'Unassigned'}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Confidence: ${task.confidence}%`);
      console.log(`   Due Date: ${task.dueDate ? task.dueDate.toDateString() : 'Not specified'}`);
      console.log(`   Context: "${task.context}"`);
      console.log('');
    });
    
    console.log('🔑 KEY DECISIONS:');
    console.log('-----------------');
    analysis.keyDecisions.forEach((decision, index) => {
      console.log(`${index + 1}. ${decision}`);
    });
    console.log('');
    
    console.log('❓ QUESTIONS:');
    console.log('-------------');
    analysis.questions.forEach((question, index) => {
      console.log(`${index + 1}. ${question}`);
    });
    console.log('');
    
    console.log('🚫 BLOCKERS:');
    console.log('------------');
    analysis.blockers.forEach((blocker, index) => {
      console.log(`${index + 1}. ${blocker}`);
    });
    console.log('');
    
    console.log('📝 SUMMARY:');
    console.log('-----------');
    console.log(analysis.summary);
    
  } catch (error) {
    console.error('❌ Error testing parser:', error);
  }
}

// Run the test
testMeetingParser(); 