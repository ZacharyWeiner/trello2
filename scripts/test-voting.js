#!/usr/bin/env node

/**
 * Card Voting Feature Test Script
 * 
 * This script provides guided testing for the card voting and polling functionality.
 * Run this script to get step-by-step instructions for testing all voting features.
 */

console.log(`
🗳️  CARD VOTING & POLLING TEST GUIDE
=====================================

This guide will help you test the new card voting and polling features.

📋 FEATURES TO TEST:
1. Quick Voting (Priority, Approval, Effort)
2. Custom Polls
3. Voting Indicators on Cards
4. Poll Results and Statistics

🚀 GETTING STARTED:
1. Make sure your development server is running
2. Open your browser to the application
3. Navigate to any board with cards
4. Follow the test scenarios below

📝 TEST SCENARIOS:

SCENARIO 1: Quick Voting
------------------------
1. Click on any card to open the card details modal
2. Scroll down to the "Voting & Polls" section
3. Test Priority Voting:
   - Click on the "Quick Vote" tab (should be active by default)
   - In the Priority section, click on numbers 1-5 to vote
   - Try changing your vote by clicking a different number
   - Click "Remove Vote" to remove your priority vote
4. Test Approval Voting:
   - Click "Approve" or "Reject" buttons
   - Try changing your vote
   - Click "Remove Vote" to remove your approval vote
5. Test Effort Voting:
   - Click on numbers 1-5 in the Effort section
   - Try changing your vote
   - Click "Remove Vote" to remove your effort vote

SCENARIO 2: Custom Polls
------------------------
1. In the card details modal, click the "Polls" tab
2. Click "New Poll" or "Create First Poll"
3. Test Priority Poll:
   - Title: "How important is this feature?"
   - Type: Priority (1-5 scale)
   - Enable "Allow comments with votes"
   - Click "Create Poll"
4. Vote on the poll you just created
5. Test Custom Poll:
   - Click "New Poll" again
   - Title: "Which approach should we take?"
   - Type: Custom Options
   - Add options: "Approach A", "Approach B", "Approach C"
   - Enable "Allow multiple votes per user"
   - Click "Create Poll"
6. Vote on the custom poll

SCENARIO 3: Voting Indicators
-----------------------------
1. Close the card details modal
2. Look at the card on the board - you should see voting badges:
   - Yellow star badge with priority score
   - Green thumbs up badge with approval percentage
   - Blue clock badge with effort estimate
   - Purple chart badge with active polls count
   - Gray users badge with total votes
3. Hover over badges to see tooltips with details

SCENARIO 4: Multiple Users Testing
----------------------------------
1. Open the app in multiple browser windows/incognito tabs
2. Sign in with different accounts
3. Have different users vote on the same card
4. Watch the voting statistics update in real-time
5. Test conflicting votes (some approve, some reject)

SCENARIO 5: Poll Management
---------------------------
1. Create a poll with an end date in the near future
2. Test voting before the end date
3. Wait for the poll to expire and verify voting is disabled
4. Test anonymous polls (votes should not show user names)

🔍 WHAT TO VERIFY:

✅ Quick Voting:
- [ ] Can vote on priority (1-5)
- [ ] Can vote on approval (approve/reject)
- [ ] Can vote on effort (1-5)
- [ ] Can change votes
- [ ] Can remove votes
- [ ] Voting statistics update correctly

✅ Custom Polls:
- [ ] Can create priority polls
- [ ] Can create approval polls
- [ ] Can create effort polls
- [ ] Can create custom option polls
- [ ] Can vote on polls
- [ ] Can add comments to votes
- [ ] Poll results display correctly
- [ ] Multiple votes work when enabled
- [ ] Anonymous voting works when enabled

✅ Visual Indicators:
- [ ] Priority score badge appears
- [ ] Approval rate badge appears
- [ ] Effort estimate badge appears
- [ ] Active polls badge appears
- [ ] Total votes badge appears
- [ ] Tooltips show correct information

✅ Real-time Updates:
- [ ] Votes update immediately
- [ ] Statistics recalculate correctly
- [ ] Multiple users see updates
- [ ] Card refresh works properly

✅ Edge Cases:
- [ ] Voting with no internet connection
- [ ] Voting on expired polls
- [ ] Removing votes
- [ ] Empty polls display correctly
- [ ] Long poll titles/descriptions

🐛 COMMON ISSUES TO CHECK:

1. Date Formatting Errors:
   - Check browser console for "Invalid Date" errors
   - Verify poll end dates display correctly

2. Firebase Permissions:
   - Ensure users can read/write vote data
   - Check Firestore security rules

3. Real-time Updates:
   - Votes should appear immediately
   - Other users should see updates
   - Card statistics should recalculate

4. UI Responsiveness:
   - Test on mobile devices
   - Check badge layout on small screens
   - Verify modal scrolling works

📊 SUCCESS CRITERIA:

The voting system is working correctly if:
- Users can vote on cards using quick voting
- Users can create and participate in polls
- Voting statistics are calculated correctly
- Visual indicators show on cards
- Real-time updates work across users
- No console errors appear
- Mobile interface is usable

🎉 CONGRATULATIONS!

If all tests pass, your card voting and polling system is ready for production use!

For any issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Firestore database for data consistency
4. Firebase security rules for permissions

Happy voting! 🗳️
`);

// Test script to verify voting functionality
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, Timestamp } = require('firebase/firestore');

// You'll need to add your Firebase config here
const firebaseConfig = {
  // Add your Firebase config from your .env.local or Firebase console
  // Example:
  // apiKey: "your-api-key",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "your-app-id"
};

async function testVoting() {
  try {
    console.log('🧪 Testing voting functionality...\n');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Find a test card
    console.log('📋 Looking for test cards...');
    
    // You'll need to replace this with an actual card ID from your database
    const testCardId = 'your-test-card-id-here';
    
    if (testCardId === 'your-test-card-id-here') {
      console.log('❌ Please update the testCardId in this script with a real card ID');
      console.log('💡 You can find card IDs in your Firebase console or browser dev tools');
      return;
    }
    
    const cardRef = doc(db, 'cards', testCardId);
    const cardDoc = await getDoc(cardRef);
    
    if (!cardDoc.exists()) {
      console.log('❌ Test card not found. Please check the card ID.');
      return;
    }
    
    console.log('✅ Test card found:', cardDoc.data().title);
    
    // Test adding a vote
    console.log('\n🗳️ Testing vote addition...');
    
    const cardData = cardDoc.data();
    const existingVotes = cardData.votes || [];
    
    // Create a test vote
    const testVote = {
      userId: 'test-user-123',
      userEmail: 'test@example.com',
      userName: 'Test User',
      voteType: 'priority',
      value: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Remove any existing test votes
    const filteredVotes = existingVotes.filter(
      vote => vote.userId !== 'test-user-123'
    );
    
    const updatedVotes = [...filteredVotes, testVote];
    
    await updateDoc(cardRef, {
      votes: updatedVotes,
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Test vote added successfully!');
    
    // Verify the vote was added
    const updatedCardDoc = await getDoc(cardRef);
    const updatedCardData = updatedCardDoc.data();
    const finalVotes = updatedCardData.votes || [];
    
    const testVoteExists = finalVotes.some(vote => vote.userId === 'test-user-123');
    
    if (testVoteExists) {
      console.log('✅ Vote verification successful!');
      console.log(`📊 Total votes on card: ${finalVotes.length}`);
    } else {
      console.log('❌ Vote verification failed - vote not found');
    }
    
    console.log('\n🎉 Voting test completed successfully!');
    console.log('💡 If this works, the issue might be with authentication or the frontend code.');
    
  } catch (error) {
    console.error('❌ Error testing voting:', error);
    console.log('\n💡 Common issues:');
    console.log('  1. Firebase config not set correctly');
    console.log('  2. Firestore security rules blocking access');
    console.log('  3. Network connectivity issues');
    console.log('  4. Invalid card ID');
  }
}

// Run the test
testVoting();

process.exit(0); 