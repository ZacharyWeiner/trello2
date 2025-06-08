/**
 * Demonstration of the robust key generation system
 * This shows how the new key utilities prevent empty and duplicate keys
 */

import { createSafeKey, createContentKey, createArrayItemKey, createTimeKey, isValidKey } from './keyUtils';

// Demo function to show key generation
export function demonstrateKeyGeneration() {
  console.log('=== Key Generation Demo ===');
  
  // Test safe key generation
  console.log('\n1. Safe Key Generation:');
  console.log('Valid input:', createSafeKey('task-123', 'demo'));
  console.log('Null input:', createSafeKey(null, 'demo'));
  console.log('Empty input:', createSafeKey('', 'demo'));
  console.log('Undefined input:', createSafeKey(undefined, 'demo'));
  
  // Test content-based keys
  console.log('\n2. Content-based Keys:');
  const content1 = 'John needs to update the documentation';
  const content2 = 'Sarah will create wireframes';
  console.log('Content 1:', createContentKey(content1, 'task', 0));
  console.log('Content 2:', createContentKey(content2, 'task', 1));
  console.log('Same content:', createContentKey(content1, 'task', 0)); // Should be same as first
  
  // Test array item keys
  console.log('\n3. Array Item Keys:');
  const items = [
    { id: 'user-1', name: 'John' },
    { userId: 'user-2', name: 'Sarah' },
    { name: 'Anonymous' } // No ID
  ];
  
  items.forEach((item, index) => {
    console.log(`Item ${index}:`, createArrayItemKey(item, index, 'id', 'user'));
  });
  
  // Test time-based keys (always unique)
  console.log('\n4. Time-based Keys (always unique):');
  console.log('Time key 1:', createTimeKey('meeting'));
  console.log('Time key 2:', createTimeKey('meeting'));
  console.log('Time key 3:', createTimeKey('meeting'));
  
  // Test key validation
  console.log('\n5. Key Validation:');
  console.log('Valid key "test-123":', isValidKey('test-123'));
  console.log('Invalid empty key "":', isValidKey(''));
  console.log('Invalid null key:', isValidKey(null));
  console.log('Invalid whitespace key "   ":', isValidKey('   '));
  
  console.log('\n=== Demo Complete ===');
}

// Example usage in React components
export const exampleReactUsage = `
// Before (problematic):
{items.map(item => (
  <div key={item.id}> // Could be empty or duplicate!
    {item.name}
  </div>
))}

// After (robust):
{items.map((item, index) => (
  <div key={createArrayItemKey(item, index, 'id', 'item')}>
    {item.name}
  </div>
))}

// For content-based keys:
{decisions.map((decision, index) => (
  <div key={createContentKey(decision, 'decision', index)}>
    {decision}
  </div>
))}

// For guaranteed unique keys:
{suggestions.map(suggestion => (
  <div key={createSafeKey(\`suggestion-\${suggestion.id}\`, 'suggestion')}>
    {suggestion.text}
  </div>
))}
`; 