#!/usr/bin/env node

// Debug script to find missing cards
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// You'll need to add your Firebase config here
const firebaseConfig = {
  // Add your actual Firebase config from your project
  // You can find this in your Firebase console under Project Settings
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

async function debugMissingCards() {
  try {
    console.log('🔍 Debugging missing cards...\n');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all cards
    console.log('📋 Fetching all cards from database...');
    const allCardsQuery = query(collection(db, 'cards'));
    const allCardsSnapshot = await getDocs(allCardsQuery);
    
    console.log(`Found ${allCardsSnapshot.docs.length} total cards in database\n`);
    
    if (allCardsSnapshot.docs.length === 0) {
      console.log('❌ NO CARDS FOUND IN DATABASE');
      console.log('💡 This means your cards were deleted, not just archived.');
      console.log('💡 You may need to restore from a backup or recreate them.');
      return;
    }
    
    // Analyze cards by status
    let archivedCount = 0;
    let activeCount = 0;
    let undefinedArchivedCount = 0;
    
    console.log('📊 Card Analysis:');
    console.log('================');
    
    allCardsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const isArchived = data.archived;
      
      if (isArchived === true) {
        archivedCount++;
      } else if (isArchived === false) {
        activeCount++;
      } else {
        undefinedArchivedCount++;
        activeCount++; // Cards without archived field are treated as active
      }
      
      console.log(`Card ${index + 1}: "${data.title || 'Untitled'}"`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Board: ${data.boardId || 'No board'}`);
      console.log(`  List: ${data.listId || 'No list'}`);
      console.log(`  Archived: ${isArchived === undefined ? 'undefined (treated as active)' : isArchived}`);
      console.log(`  Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}`);
      console.log('  ---');
    });
    
    console.log('\n📈 Summary:');
    console.log(`  Total cards: ${allCardsSnapshot.docs.length}`);
    console.log(`  Active cards: ${activeCount}`);
    console.log(`  Archived cards: ${archivedCount}`);
    console.log(`  Cards with undefined archived status: ${undefinedArchivedCount}`);
    
    if (archivedCount > 0 && activeCount === 0) {
      console.log('\n🎯 FOUND THE PROBLEM!');
      console.log('❌ ALL your cards have been archived!');
      console.log('💡 Solution: Use the Archive Manager in your app to restore them.');
      console.log('💡 Or run the restore script below.');
    } else if (activeCount > 0) {
      console.log('\n✅ You have active cards. The issue might be:');
      console.log('  - Cards belong to different boards');
      console.log('  - Cards belong to deleted lists');
      console.log('  - Frontend filtering issue');
    }
    
    // Check for board/list mismatches
    console.log('\n🔍 Checking for board/list issues...');
    const boardIds = [...new Set(allCardsSnapshot.docs.map(doc => doc.data().boardId))];
    const listIds = [...new Set(allCardsSnapshot.docs.map(doc => doc.data().listId))];
    
    console.log(`  Found cards in ${boardIds.length} different boards`);
    console.log(`  Found cards in ${listIds.length} different lists`);
    
    if (boardIds.length > 1) {
      console.log('  Board IDs:', boardIds);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 To use this script:');
    console.log('  1. Update the firebaseConfig object with your actual Firebase config');
    console.log('  2. Run: node debug-missing-cards.js');
    console.log('  3. Or check your Firebase console directly');
  }
}

// Auto-restore script
async function autoRestoreCards() {
  try {
    console.log('\n🔧 Auto-restoring archived cards...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const { doc, updateDoc } = require('firebase/firestore');
    
    // Get all archived cards
    const archivedCardsQuery = query(
      collection(db, 'cards'),
      where('archived', '==', true)
    );
    const archivedSnapshot = await getDocs(archivedCardsQuery);
    
    console.log(`Found ${archivedSnapshot.docs.length} archived cards to restore`);
    
    if (archivedSnapshot.docs.length === 0) {
      console.log('No archived cards found to restore.');
      return;
    }
    
    // Restore each card
    for (const cardDoc of archivedSnapshot.docs) {
      const cardRef = doc(db, 'cards', cardDoc.id);
      await updateDoc(cardRef, {
        archived: false,
        archivedAt: null,
        archivedBy: null
      });
      console.log(`✅ Restored: "${cardDoc.data().title}"`);
    }
    
    console.log(`\n🎉 Successfully restored ${archivedSnapshot.docs.length} cards!`);
    
  } catch (error) {
    console.error('❌ Error restoring cards:', error);
  }
}

// Run the debug
debugMissingCards();

// Uncomment the line below to auto-restore all archived cards
// autoRestoreCards(); 