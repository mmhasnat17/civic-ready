# CivicReady
### Court Date Readiness Dashboard

CivicReady is a full-stack application prototype built with **React, TypeScript, Bootstrap, Node.js, and Express**. It provides a streamlined interface for tracking court dates, managing outreach statuses, and identifying cases requiring timely follow-up.

The project explores how modern web technologies can support reliable, transparent, and human-centered workflows in public-service environments.

**Live Demo:** Add GitHub Pages URL  
**Tech Stack:** React · TypeScript · Bootstrap · Node.js · Express · Vite · Vitest

### App view

<img width="1121" height="893" alt="civicready" src="https://github.com/user-attachments/assets/e543442a-1cca-4388-9f5b-390897ed5035" />


## Overview

Missed court appearances can have serious consequences. CivicReady demonstrates a lightweight case-support workflow that helps staff identify upcoming hearings and manage follow-up activities.

The application emphasizes:

- **Usability:** A responsive dashboard for reviewing and managing case information.
- **Reliability:** Deterministic date-based prioritization and automated unit tests.
- **Transparency:** Clearly defined business rules and visible status changes.
- **Maintainability:** Strongly typed domain models, reusable components, and separation of concerns.

All case records are fictional. CivicReady is a technical prototype and does not provide legal advice, make legal decisions, or send notifications.

## Key Features

### Case Management
- View fictional case records and upcoming hearing dates.
- Search, filter, and sort cases.
- Track outreach and confirmation statuses.
- Review case details and contact preferences.

### Priority Classification
Cases are classified using predefined business rules:

| Priority | Criteria |
|---|---|
| Overdue | Hearing date has passed |
| Urgent | Hearing within 0–3 days |
| Upcoming | Hearing within 4–7 days |
| Scheduled | Hearing more than 7 days away |
| Complete | Confirmation recorded |

The classification is deterministic and independent of client names, contact preferences, and accessibility accommodations.

### Additional Capabilities
- Activity history for status changes.
- CSV export of filtered case records.
- Browser-local persistence in standalone mode.
- REST endpoints for retrieving and updating case information.
- Responsive layouts for desktop and mobile devices.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19, TypeScript |
| UI / Styling | Bootstrap 5, CSS, Lucide React |
| Backend | Node.js, Express |
| Build Tools | Vite |
| Testing | Vitest |
| Deployment | GitHub Pages, GitHub Actions |

## Architecture

CivicReady separates presentation, business logic, and API functionality.

```text
civic-ready/
├── src/
│   ├── App.tsx
│   ├── domain.ts
│   ├── domain.test.ts
│   ├── main.tsx
│   └── styles.css
├── server/
│   └── index.ts
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Frontend

React manages the user interface and application state.

TypeScript defines data contracts for case records, statuses, and priorities.

Business rules are implemented separately from UI components to improve testability and maintainability.

### Backend

The Node.js/Express API provides endpoints for retrieving records and updating case statuses.

The API validates supported status values and returns appropriate HTTP responses for invalid requests or missing resources.

### Deployment

The public demonstration is hosted on GitHub Pages as a static application.

When the Express server is available during local development, the frontend can retrieve records and submit status updates through the API.

The standalone hosted version uses browser storage for demonstration purposes.

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/civic-ready.git
cd civic-ready
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

Open:

http://127.0.0.1:5173/

### Start the Backend

In a separate terminal:

```bash
npm run api
```

The Express server runs at:

http://localhost:3001

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Service health check |
| GET | `/api/cases` | Retrieve case records |
| PATCH | `/api/cases/:id/status` | Update case status |

Example request:

```bash
curl -X PATCH http://localhost:3001/api/cases/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Contacted"}'
```

## Testing and Validation

Run the automated tests:

```bash
npm test
```

Perform TypeScript validation:

```bash
npm run typecheck
```

Generate a production build:

```bash
npm run build
```

Unit tests cover:

- Priority classification boundaries.
- Date calculations across daylight-saving transitions.
- Confirmed-case behavior.
- Independence of priority classification from contact preferences and accommodations.

## Engineering Considerations

### Reliability

Date-only calculations avoid timezone-related differences when determining hearing priorities. Business rules are independently testable.

### Transparency

Priority classifications are based on explicit conditions rather than opaque scoring models.

### Human Oversight

The system supports administrative workflows without making automated legal decisions.

### Privacy

The application uses fictional data and does not integrate with external case-management systems or messaging platforms.

## Current Limitations and Future Improvements

CivicReady is a functional prototype rather than a production government application.

Potential enhancements include:

- Persistent database storage.
- Authentication and role-based access control.
- Server-side, tamper-resistant audit logging.
- Optimistic concurrency control for simultaneous updates.
- Improved accessibility and multilingual support.
- Expanded integration and end-to-end testing.
- Secure notification-service integration.

A production deployment would also require security assessments, privacy reviews, operational monitoring, and domain-specific validation.

## License

MIT License.

*Built as a software engineering portfolio project exploring reliable digital tools for public-service workflows.*
