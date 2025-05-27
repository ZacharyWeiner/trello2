# 🧪 Testing Guide - Trello Clone with Card Dependencies

This guide provides comprehensive testing instructions for all features, with special focus on the new Card Dependencies functionality.

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Authentication Test
1. Click "Sign In" 
2. Test Google OAuth or Email/Password login
3. Verify user profile appears in top-right corner

### 3. Basic Board Operations
1. Create a new board: Click "+" → "Create Board"
2. Add lists: Click "Add a list" 
3. Add cards: Click "+" in any list
4. Test drag & drop: Move cards between lists

## 🔗 Card Dependencies Testing

### Setting Up Test Data
1. **Create a test board** with at least 3 lists:
   - "To Do"
   - "In Progress" 
   - "Done"

2. **Add test cards** with descriptive names:
   - "Design Database Schema"
   - "Implement User Authentication"
   - "Create API Endpoints"
   - "Build Frontend Components"
   - "Write Tests"
   - "Deploy to Production"

### Testing Dependency Creation

#### Test Case 1: Basic Blocking Dependency
1. Open "Design Database Schema" card
2. Scroll to "Dependencies" section
3. Click "Add Dependency"
4. Select "This card blocks"
5. Search for "Implement User Authentication"
6. Add reason: "Database schema must be finalized before auth implementation"
7. Click "Add Dependency"

**Expected Results:**
- ✅ Dependency appears in card details
- ✅ Red blocking indicator appears on "Design Database Schema" card
- ✅ Yellow blocked indicator appears on "Implement User Authentication" card
- ✅ Tooltips show dependency information on hover

#### Test Case 2: Blocked By Relationship
1. Open "Build Frontend Components" card
2. Add dependency: "This card is blocked by" → "Create API Endpoints"
3. Add reason: "Frontend needs API endpoints to be available"

**Expected Results:**
- ✅ Yellow blocked indicator on "Build Frontend Components"
- ✅ Red blocking indicator on "Create API Endpoints"
- ✅ Bidirectional relationship created

#### Test Case 3: Related Cards
1. Open "Write Tests" card
2. Add dependency: "This card is related to" → "Build Frontend Components"
3. Add reason: "Tests should cover frontend functionality"

**Expected Results:**
- ✅ Blue related indicators on both cards
- ✅ No blocking relationship (cards can be completed independently)

### Testing Circular Dependency Prevention

#### Test Case 4: Circular Dependency Detection
1. Try to create: A blocks B, B blocks C, C blocks A
2. When adding the third dependency, you should get an error

**Steps:**
1. Card A blocks Card B ✅
2. Card B blocks Card C ✅  
3. Card C blocks Card A ❌ (Should be prevented)

**Expected Results:**
- ✅ Error message: "This dependency would create a circular dependency"
- ✅ Third dependency is not created
- ✅ Existing dependencies remain intact

### Testing Dependency Graph

#### Test Case 5: Graph Visualization
1. Click "Dependencies" button in board header
2. Verify graph displays correctly

**Expected Results:**
- ✅ All cards with dependencies appear as nodes
- ✅ Arrows show direction of blocking relationships
- ✅ Node colors indicate blocking status:
  - 🔴 Red: Cards blocking others
  - 🟡 Yellow: Cards being blocked
  - 🔵 Blue: Cards with no blocking relationships
- ✅ Fullscreen mode works
- ✅ Legend explains colors and relationships

### Testing Dependency Removal

#### Test Case 6: Remove Dependencies
1. Open any card with dependencies
2. Click "X" button on a dependency
3. Confirm removal

**Expected Results:**
- ✅ Dependency removed from both cards
- ✅ Visual indicators updated
- ✅ Graph visualization updated

### Mobile Testing

#### Test Case 7: Mobile Dependency Management
1. Open browser dev tools
2. Switch to mobile view (iPhone/Android)
3. Test dependency features on mobile

**Expected Results:**
- ✅ Dependency badges visible on cards
- ✅ Touch-friendly "Add Dependency" interface
- ✅ Mobile-optimized dependency graph
- ✅ Swipe gestures work with dependency indicators

## 📱 Mobile & PWA Testing

### Responsive Design Testing
Test on different screen sizes:
- **Mobile**: 375px width (iPhone)
- **Tablet**: 768px width (iPad)
- **Desktop**: 1200px+ width

### PWA Installation Testing
1. **Chrome Desktop**: Look for install icon in address bar
2. **Mobile Safari**: Add to Home Screen option
3. **Android Chrome**: Install app prompt

### Offline Testing
1. Open browser dev tools → Network tab
2. Set to "Offline"
3. Test basic functionality:
   - ✅ App loads from cache
   - ✅ Can view existing boards/cards
   - ✅ Can create cards (stored locally)
   - ✅ Sync indicator shows offline status

## 🎨 Theme & Customization Testing

### Dark Mode Testing
1. Toggle dark mode in user menu
2. Verify all components adapt correctly
3. Test dependency indicators in dark mode

### Board Background Testing
1. Create new board
2. Test different background types:
   - Colors
   - Gradients  
   - Patterns
   - Unsplash photos

## 🔧 Advanced Testing Scenarios

### Performance Testing
```bash
# Run Lighthouse audit
npm run lighthouse

# Check bundle size
npm run analyze
```

### Accessibility Testing
1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with VoiceOver (Mac) or NVDA (Windows)
3. **High Contrast**: Test with system high contrast mode
4. **Focus Indicators**: Verify visible focus states

### Cross-Browser Testing
Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 🐛 Common Issues & Troubleshooting

### Dependency Issues
**Problem**: Dependencies not showing visual indicators
**Solution**: 
1. Check browser console for errors
2. Verify Firebase connection
3. Refresh the page

**Problem**: Circular dependency not detected
**Solution**:
1. Check console for service errors
2. Verify dependency service is imported correctly

### Mobile Issues
**Problem**: Touch gestures not working
**Solution**:
1. Ensure you're testing on actual mobile device or proper emulation
2. Check for JavaScript errors in mobile browser

### PWA Issues
**Problem**: App not installing
**Solution**:
1. Verify HTTPS connection
2. Check manifest.json is valid
3. Ensure service worker is registered

## 📊 Testing Checklist

### Core Features ✅
- [ ] User authentication (Google + Email)
- [ ] Board creation and management
- [ ] List creation and reordering
- [ ] Card creation, editing, and movement
- [ ] Real-time collaboration
- [ ] Member management

### Card Dependencies ✅
- [ ] Create blocking dependencies
- [ ] Create blocked-by dependencies  
- [ ] Create related dependencies
- [ ] Visual indicators on cards
- [ ] Dependency graph visualization
- [ ] Circular dependency prevention
- [ ] Cross-board dependencies
- [ ] Dependency removal
- [ ] Mobile dependency management

### Mobile & PWA ✅
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Touch gestures and interactions
- [ ] PWA installation
- [ ] Offline functionality
- [ ] Service worker caching
- [ ] Background sync

### Accessibility ✅
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] High contrast support
- [ ] Focus management
- [ ] ARIA labels

### Performance ✅
- [ ] Page load times < 3s
- [ ] Smooth animations (60fps)
- [ ] Bundle size optimization
- [ ] Image optimization
- [ ] Lighthouse score > 90

## 🎯 User Acceptance Testing

### Scenario 1: Project Manager
"As a project manager, I want to track task dependencies to identify potential bottlenecks."

**Test Steps:**
1. Create a project board
2. Add tasks with realistic dependencies
3. Use dependency graph to identify critical path
4. Verify blocked tasks are clearly marked

### Scenario 2: Development Team
"As a developer, I want to see which tasks are blocking my work."

**Test Steps:**
1. Create development workflow board
2. Set up dependencies between backend/frontend tasks
3. Verify developers can easily see what's blocking them
4. Test mobile access for on-the-go updates

### Scenario 3: Remote Team
"As a remote team, we need real-time updates on task dependencies."

**Test Steps:**
1. Multiple users on same board
2. Add/remove dependencies
3. Verify real-time updates across all clients
4. Test offline/online sync scenarios

## 📈 Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 3.5s

### Dependency Feature Performance
- **Graph rendering**: < 500ms for 100 cards
- **Dependency creation**: < 200ms
- **Visual indicator updates**: < 100ms

## 🚀 Deployment Testing

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] PWA manifest valid
- [ ] Service worker functioning
- [ ] Environment variables set
- [ ] Firebase rules configured
- [ ] Performance benchmarks met

### Post-deployment Verification
- [ ] Production app loads correctly
- [ ] Authentication works
- [ ] Database operations function
- [ ] PWA installation works
- [ ] Offline mode functions
- [ ] Dependencies feature works in production

---

## 🎉 Testing Complete!

If all tests pass, your Trello clone with Card Dependencies is ready for production use! 

For any issues found during testing, please:
1. Check the console for error messages
2. Verify your Firebase configuration
3. Ensure all dependencies are installed
4. Test in incognito/private browsing mode
5. Clear browser cache and try again

Happy testing! 🚀 