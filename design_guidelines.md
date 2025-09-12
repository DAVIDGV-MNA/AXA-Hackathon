# RAG Chatbot Interface Design Guidelines

## Design Approach
**Selected Approach:** Reference-Based (Productivity Category)  
**Primary References:** Linear, Notion, Claude.ai, ChatGPT  
**Justification:** This is a utility-focused productivity tool requiring efficiency, clarity, and professional presentation for document management workflows.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 215 25% 15% (deep slate)
- Background: 0 0% 98% (warm white)
- Surface: 0 0% 100% (pure white)
- Border: 215 15% 90% (light gray)
- Text Primary: 215 25% 15%
- Text Secondary: 215 15% 45%

**Dark Mode:**
- Primary: 215 20% 85% (light slate)
- Background: 215 25% 8% (dark slate)
- Surface: 215 20% 12% (darker surface)
- Border: 215 15% 20% (dark border)
- Text Primary: 215 20% 95%
- Text Secondary: 215 15% 70%

**Accent Colors:**
- Success: 142 70% 45% (emerald)
- Warning: 38 85% 55% (amber)
- Error: 0 70% 55% (red)

### B. Typography
**Font Families:** Inter (primary), JetBrains Mono (code)
**Hierarchy:**
- Headings: 600-700 weight, Inter
- Body text: 400-500 weight, 16px base
- Chat messages: 400 weight, 15px
- Code/technical: JetBrains Mono, 14px
- UI labels: 500 weight, 14px

### C. Layout System
**Spacing Units:** Tailwind units 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px)
- Section spacing: p-8, gap-8 (32px)
- Page margins: px-6, py-12

### D. Component Library

**Chat Interface:**
- Full-height layout with fixed header and input
- Message bubbles: user (right-aligned, primary color), assistant (left-aligned, surface color)
- Typing indicators with animated dots
- Message timestamps and status indicators
- Code syntax highlighting in responses

**Document Management:**
- Drag-and-drop upload zone with dotted borders
- Document cards showing file type, name, upload date
- Category badges (Politics, Operations, Manual)
- Search and filter controls
- Document preview modals

**Navigation:**
- Clean sidebar with document categories
- Chat history with conversation previews
- Settings and profile access
- Mobile hamburger menu

**Form Elements:**
- Consistent input styling with focus states
- Upload progress indicators
- Toggle switches for modes (retrieve vs. create)
- Action buttons with loading states

### E. Animations
**Minimal Approach:**
- Message appearance: subtle slide-up (200ms)
- Typing indicators: gentle pulse
- Button hover: slight scale (0.98x)
- Document upload: progress animations only

## Layout Structure

**Main Interface:**
1. **Header:** Logo, navigation, user profile (h-16)
2. **Sidebar:** Document categories, chat history (w-64, collapsible)
3. **Chat Area:** Message history with auto-scroll
4. **Input Zone:** Message input with attachment options (fixed bottom)
5. **Document Panel:** Toggle-able document management view

**Key Interactions:**
- Seamless switching between chat and document management
- Real-time typing indicators
- Contextual document suggestions during conversations
- Quick document upload via drag-and-drop anywhere
- Message threading for complex document discussions

**Responsive Behavior:**
- Mobile: Single-panel view with slide-over navigation
- Tablet: Condensed sidebar, full chat interface
- Desktop: Full three-panel layout with document preview

This design emphasizes clarity and efficiency while maintaining a modern, professional appearance suitable for enterprise document management workflows.