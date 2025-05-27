#!/usr/bin/env node

// Debug script to check cards in the database
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase config (you'll need to update this with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  // You can find this in your Firebase console
};

async function debugCards() {
  try {
    console.log('🔍 Debugging cards in database...\n');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all cards
    console.log('📋 Fetching all cards...');
    const allCardsQuery = query(collection(db, 'cards'));
    const allCardsSnapshot = await getDocs(allCardsQuery);
    
    console.log(`Found ${allCardsSnapshot.docs.length} total cards in database\n`);
    
    if (allCardsSnapshot.docs.length === 0) {
      console.log('❌ No cards found in database. This explains why your board is empty.');
      console.log('💡 Try creating some test cards first.');
      return;
    }
    
    // Analyze each card
    allCardsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Card ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Title: ${data.title || 'No title'}`);
      console.log(`  List ID: ${data.listId || 'No list ID'}`);
      console.log(`  Board ID: ${data.boardId || 'No board ID'}`);
      console.log(`  Archived: ${data.archived || 'undefined'}`);
      console.log(`  Position: ${data.position || 'undefined'}`);
      console.log(`  Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'undefined'}`);
      console.log('---');
    });
    
    // Check archived vs non-archived
    const archivedCards = allCardsSnapshot.docs.filter(doc => doc.data().archived === true);
    const nonArchivedCards = allCardsSnapshot.docs.filter(doc => doc.data().archived !== true);
    
    console.log(`\n📊 Summary:`);
    console.log(`  Total cards: ${allCardsSnapshot.docs.length}`);
    console.log(`  Archived cards: ${archivedCards.length}`);
    console.log(`  Non-archived cards: ${nonArchivedCards.length}`);
    
    if (nonArchivedCards.length === 0) {
      console.log('\n❌ All cards are archived! This is why your board appears empty.');
      console.log('💡 Try restoring some cards from the archive or create new ones.');
    } else {
      console.log('\n✅ You have non-archived cards. The issue might be elsewhere.');
      console.log('💡 Check if the cards belong to the correct board and lists.');
    }
    
  } catch (error) {
    console.error('❌ Error debugging cards:', error);
    console.log('\n💡 Make sure to update the Firebase config in this script.');
  }
}

// Run the debug function
debugCards(); 