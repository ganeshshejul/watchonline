# Light Mode Visual Testing Checklist

## 🎨 Theme Toggle Control
- [ ] **Sun icon visible in dark mode** (default state)
- [ ] **Moon icon visible in light mode** (after clicking)
- [ ] **Button has circular border** with proper contrast
- [ ] **Hover effect works** - slight scale and background change
- [ ] **Theme persists** after page reload

---

## 🌙 Dark Mode (Default)
### Header
- [ ] Dark background (#1a1a1e)
- [ ] White/light text
- [ ] Purple "GS" text (#dd9af6)
- [ ] Red film icon (#e94560)

### Content
- [ ] Dark step cards (#1e1e24)
- [ ] Purple step numbers (#7b68ee)
- [ ] Dark form inputs with subtle borders
- [ ] Purple buttons (#7b68ee)

---

## ☀️ Light Mode (After Toggle)
### Header
- [ ] Light background (#f8f9fa with blur)
- [ ] Dark text (#212529)
- [ ] Purple "GS" text (updated shade)
- [ ] Pink/red film icon

### Step Cards
- [ ] White background
- [ ] Subtle gray borders
- [ ] Light shadows for depth
- [ ] Purple step numbers

### Search & Player Section
- [ ] White input backgrounds
- [ ] Visible borders (not too dark)
- [ ] Purple accent on focus
- [ ] Purple play button
- [ ] Light dropdown with proper contrast

### Tabs & Filters
- [ ] Inactive: Light background with borders
- [ ] Active: Purple background with white text
- [ ] Hover: Purple tint
- [ ] Genre buttons follow same pattern

### Modals
- [ ] White modal background
- [ ] Light overlay behind modal
- [ ] Form inputs with subtle borders
- [ ] Purple submit buttons
- [ ] Google button: white with gray border

### Recommendations
- [ ] White card backgrounds
- [ ] Subtle borders and shadows
- [ ] Purple accent badges (year, AI score)
- [ ] Pink type badges
- [ ] Gold rating badges
- [ ] Purple play button on hover

### Watch History
- [ ] White item cards
- [ ] Visible borders
- [ ] Hover effects work
- [ ] Red/pink "Clear History" button

### Messages
- [ ] Success: Purple background tint
- [ ] Error: Red/pink background tint
- [ ] Proper text contrast

---

## 🔄 Transitions
- [ ] Theme switches smoothly (300ms)
- [ ] No flickering or jarring changes
- [ ] Icon swaps cleanly (sun ↔ moon)

---

## 📱 Responsive (Mobile)
- [ ] Theme toggle centered with auth buttons
- [ ] All light mode styles work on mobile
- [ ] Touch targets remain accessible

---

## 🎯 Color Consistency Check

### Purple Accent (#6a5acd in light mode)
- Sign up button
- Submit buttons  
- Play button
- Active tabs/genres
- Step numbers
- AI scores
- Recommendation button

### Pink/Red Highlight (#d6336c in light mode)
- Film icon
- Clear buttons
- Error messages
- Some type badges

### Neutral Elements
- Login button (transparent with border)
- Cancel buttons (light gray)
- Disabled states (reduced opacity)

---

## ✅ Final Checks
- [ ] No console errors when switching themes
- [ ] localStorage saves preference
- [ ] System preference detection works on first visit
- [ ] All animations smooth in both modes
- [ ] Text readable in all sections
- [ ] Icons maintain proper colors
- [ ] Shadows visible but subtle in light mode
- [ ] Borders provide clear separation

---

## 🐛 Common Issues to Watch For
- ❌ White text on white background
- ❌ Dark elements with nearly-dark backgrounds
- ❌ Invisible borders
- ❌ Poor contrast ratios
- ❌ Inconsistent button colors
- ❌ Broken hover states

If any of these occur, check the `body.light-theme` overrides in `css/style.css`.
