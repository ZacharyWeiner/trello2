#!/usr/bin/env node

// Script to add test cards to your board
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } = require('firebase/firestore');

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

async function addTestCards() {
  try {
    console.log('🚀 Adding test cards to your board...\n');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // First, let's find your boards and lists
    console.log('📋 Finding boards...');
    const boardsSnapshot = await getDocs(collection(db, 'boards'));
    
    if (boardsSnapshot.docs.length === 0) {
      console.log('❌ No boards found. Please create a board first.');
      return;
    }
    
    const board = boardsSnapshot.docs[0];
    const boardId = board.id;
    const boardData = board.data();
    
    console.log(`📋 Using board: "${boardData.title}" (${boardId})`);
    
    // Find lists in this board
    console.log('📝 Finding lists...');
    const listsQuery = query(collection(db, 'lists'), where('boardId', '==', boardId));
    const listsSnapshot = await getDocs(listsQuery);
    
    if (listsSnapshot.docs.length === 0) {
      console.log('❌ No lists found. Please create some lists first.');
      return;
    }
    
    const lists = listsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📝 Found ${lists.length} lists:`, lists.map(l => l.title));
    
    // Add test cards to each list
    const testCards = [
      { title: 'Test Card 1', description: 'This is a test card to verify the archive functionality works.' },
      { title: 'Test Card 2', description: 'Another test card with some content.' },
      { title: 'Archive Me!', description: 'This card is meant to be archived for testing.' },
      { title: 'Keep Me', description: 'This card should stay visible on the board.' },
    ];
    
    let cardCount = 0;
    
    for (const list of lists) {
      console.log(`\n🃏 Adding cards to list: "${list.title}"`);
      
      for (let i = 0; i < 2; i++) {
        const testCard = testCards[cardCount % testCards.length];
        
        const cardData = {
          boardId: boardId,
          listId: list.id,
          title: `${testCard.title} (List: ${list.title})`,
          description: testCard.description,
          position: i,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: 'test-user', // You might want to use a real user ID
          // Intentionally NOT setting archived field to test the filter fix
        };
        
        const docRef = await addDoc(collection(db, 'cards'), cardData);
        console.log(`  ✅ Added card: "${cardData.title}" (${docRef.id})`);
        cardCount++;
      }
    }
    
    console.log(`\n🎉 Successfully added ${cardCount} test cards!`);
    console.log('💡 Now try refreshing your board to see the cards.');
    console.log('💡 You can test archiving by clicking on a card and using the Archive button.');
    
  } catch (error) {
    console.error('❌ Error adding test cards:', error);
    console.log('\n💡 Make sure to:');
    console.log('  1. Update the Firebase config in this script');
    console.log('  2. Ensure you have write permissions to Firestore');
    console.log('  3. Check that your Firebase project is set up correctly');
  }
}

// Run the function
addTestCards(); 