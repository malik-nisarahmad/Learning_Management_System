# Screenshot Capture Guide v2.0

## How to Capture Screenshots for Test Report

### Using Windows (Snipping Tool)
1. Press `Windows + Shift + S`
2. Select the area to capture
3. Save to `testing/screenshots/` folder

---

## Required Screenshots (30 Total)

### Authentication Module (5 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 1 | `01-landing-page.png` | Full landing page with hero section |
| 2 | `02-login-page.png` | Login form |
| 3 | `03-login-error.png` | Invalid credentials error message |
| 4 | `04-registration.png` | Registration form with validation |
| 5 | `05-registration-success.png` | Success toast message |

### Dashboard Module (2 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 6 | `06-dashboard.png` | Main dashboard with dynamic stats |
| 7 | `07-dashboard-refresh.png` | After clicking refresh button |

### Study Materials Module (3 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 8 | `08-study-materials.png` | Materials list with real-time data |
| 9 | `09-material-detail.png` | Material with comments and likes |
| 10 | `10-upload-dialog.png` | Cloudinary upload form |

### AI Quiz Module (5 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 11 | `11-quiz-menu.png` | Quiz options menu |
| 12 | `12-quiz-generation.png` | Topic input (Groq API) |
| 13 | `13-quiz-questions.png` | Quiz in progress |
| 14 | `14-quiz-results.png` | Score display with Firebase save |
| 15 | `15-quiz-history.png` | Recent attempts list |

### Discussion Forum Module (3 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 16 | `16-discussion-feed.png` | Reddit-style posts list |
| 17 | `17-create-post.png` | Post creation dialog |
| 18 | `18-threaded-comments.png` | Nested comment replies |

### Chat Module (3 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 19 | `19-chat-interface.png` | Messaging screen |
| 20 | `20-group-chat.png` | Group conversation |
| 21 | `21-friend-system.png` | Friend requests |

### Faculty Contact Module (2 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 22 | `22-faculty-list.png` | Faculty contact list |
| 23 | `23-ai-email.png` | Groq-generated email |

### Profile Module (1 screenshot)
| # | Filename | What to Capture |
|---|----------|----------------|
| 24 | `24-profile-page.png` | User profile with stats |

### Events Module (3 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 25 | `25-events-page.png` | Events with registration |
| 26 | `26-event-registration.png` | Registered event confirmation |
| 27 | `27-create-event.png` | Admin event creation form |

### Technical Screenshots (3 screenshots)
| # | Filename | What to Capture |
|---|----------|----------------|
| 28 | `28-console-clean.png` | Browser console (no errors) |
| 29 | `29-network-tab.png` | API calls (200 status) |
| 30 | `30-firebase-console.png` | Firestore collections |

---

## Tips for Good Screenshots
- Use full HD resolution (1920x1080)
- Show both success and error states
- Include browser DevTools console for API testing
- Capture loading states where relevant
- Ensure no sensitive data (API keys, passwords) visible

## Test Date
- **Date:** November 30, 2025
- **Version:** 2.0
- **Total Test Cases:** 120

