

## Outreach SaaS - Website Preview Generator

A tool that helps you win clients by showing them exactly how their new website could look, using their existing content.

---

### How It Works

1. **User pastes a client's URL** → System scrapes logo, images, text, and brand colors
2. **AI analyzes the content** → Generates a structured schema with all dynamic data
3. **Preview is generated** → Content is rendered in a professional template
4. **Share with client** → Unique link shows the client their potential new site
5. **Client requests changes** → Feedback loop to refine the proposal

---

### Core Features

**🔐 Authentication & Dashboard**
- User signup/login with email
- Clean, minimal dashboard to manage all client previews
- Overview of recent scrapes and client responses

**🕷️ Website Scraping**
- Paste any URL to scrape content
- Extract: logo, hero images, headlines, body text, contact info
- AI-powered brand color detection
- Progress indicator during scraping

**🤖 AI Content Processing**
- Automatically organize scraped content into sections (hero, about, services, contact)
- Smart text cleanup and formatting
- Generate placeholder content for missing sections

**🎨 Website Templates**
- 2 professionally designed templates to start:
  - **Corporate Classic** - Clean layout for business/professional services
  - **Modern Professional** - Bold typography for consultants/agencies
- Templates dynamically populated with scraped content

**🔗 Shareable Client Previews**
- Unique URL for each client (e.g., `/preview/acme-corp`)
- Client sees their content in the new template
- "Request Changes" button for client feedback
- Feedback stored and visible in your dashboard

**📊 Client Management**
- List of all scraped sites organized by client
- Status tracking (draft, sent, feedback received)
- View client's change requests

---

### User Journey

**For the SaaS User (You):**
1. Sign up → Land on dashboard
2. Click "New Preview" → Paste client's website URL
3. Watch scraping progress → Review extracted content
4. Choose template → Preview the result
5. Copy shareable link → Send to client

**For the Client:**
1. Receive link via email/message
2. View their content in a beautiful new template
3. Click "Request Changes" → Submit feedback
4. You see feedback in your dashboard

---

### Technical Approach

- **Backend**: Lovable Cloud with database & edge functions
- **Scraping**: Firecrawl integration for reliable content extraction
- **AI Processing**: Lovable AI to structure and organize content
- **Storage**: Database tables for users, scraped sites, client feedback, and assets

