# Exhibition Curation Platform

A web-app to explore and curate virtual exhibitions combining collections from multiple museums.

---

## 🎯 Project Overview

- **What**  
  A single-page React application that lets users search, filter, and save artworks from at least two public museum APIs.

- **Why**  
  To provide researchers, students, and art enthusiasts a unified, interactive experience for discovering and curating “exhibitions” drawn from combined collections.

- **How**
  - **Frontend:** React + TypeScript + Tailwind CSS
  - **Backend:** Node.js + Express + MongoDB
  - **Data fetching:** @tanstack/react-query
  - **Image hosting:** Cloudinary
  - **Authentication:** JWT, bcrypt-hashed passwords
  - **Protected routes:** Express middleware
  - **APIs:** The MET Collection API, Harvard Art Museums API
  - **Frontend Deployment:** Netlify
  - **Backend Deployment:** Render

---

## 🚀 Live Demo

**[View the live site →](https://artizen-curation.netlify.app/)**

---

## 🛠️ Tech Stack

- **Languages:** TypeScript (frontend)
- **Frameworks/Libraries:** React, @tanstack/react-query, Tailwind CSS
- **APIs:**
  - The MET Collection API
  - Harvard Art Museums API
- **Image Hosting:** Cloudinary
- **CI/CD & Hosting:** Vercel (or Netlify/GitHub Pages)

---

## 👩‍💻 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/bpmallen/exhibition-curation.git
   cd exhibition-curation
   ```

2. **Install dependencies**
   ```bash
   cd front-end
   npm install
   #backend
   cd back-end
   npm install
   yarn
   ```
3. **Configure environment variables**
   - front-end/.env.local
   ```bash
   REACT_APP_MET_API_KEY=your_met_api_key
   REACT_APP_HARVARD_API_KEY=your_harvard_api_key
   REACT_APP_CLOUDINARY_URL=your_cloudinary_url
   ```
   - back-end/.env
   ```bash
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   PORT=5000
   ```
4. **Run development servers**
   ```bash
   #Backend
   npm run dev
   #Frontend
   npm run dev
   ```

---

## 🔍 Key Features

- **Search Across Collections**

  - Instant search of MET & Harvard Art Museum APIs

  - “Search both” mode for combined results

- **Filter & Sort**

  - Department filters (MET)

  - Sort by title, date, relevance

- **Advanced Faceted Search**

  - Multi-filter panels (e.g. date ranges, departments, media types)

  - Date-range sliders for fine-grained temporal filtering

- **Pagination**

  - “Prev” / “Next” navigation to limit API calls

- **Artwork Details**

  - High-resolution images via Cloudinary

  - Metadata: title, artist, date, source

- **User Authentication & Profiles**

  - Username/password sign up & login

  - Bcrypt-hashed passwords, JWT sessions

  - Protected API routes for managing collections

- **Personal Exhibitions**

  - Create multiple named “exhibition” collections

  - Add/remove artworks with live UI feedback

  - View and manage saved exhibitions

- **Avatar Uploads**

  - Users can upload and manage their profile avatar

- **Responsive & Accessible**

  - Mobile-friendly layouts (dropdown filters on small screens)

  - Keyboard navigation, ARIA labels, color-contrast compliant

---

## 📑 API Endpoints

- **Authentication**
  - **POST** /api/auth/register
  - **POST** /api/auth/login
- **Collections**
  - **GET** /api/users/:userId/collections
  - **POST** /api/users/:userId/collections
  - **DELETE** /api/users/:userId/collections/:collectionId
- **Collection Items**
  - **POST** /api/users/:userId/collections/:collectionId/items
  - **DELETE** /api/users/:userId/collections/:collectionId/items/:itemId
- **Museum APIs**

  - **MET Search**

    - **GET** https://collectionapi.metmuseum.org/public/collection/v1/search?q={query}&departmentId={id}

  - **MET Object:**

    - **GET** https://collectionapi.metmuseum.org/public/collection/v1/objects/{objectID}

  - **Harvard Search:**
    - **GET** https://api.harvardartmuseums.org/object?q={query}&apikey={HARVARD_API_KEY}

---

## 📝 Future Improvements

- **Social Sharing**: Share exhibitions via social media
- **Mobile App**: Migrate to React Native (or Flutter) for a native mobile experience
