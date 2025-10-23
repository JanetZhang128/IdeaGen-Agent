# IdeaGen 🚀

**AI-Powered Business Idea Generator for the Agent Economy**

IdeaGen harnesses the power of artificial intelligence to generate innovative business ideas tailored for the emerging AI agent economy. With real-time streaming and seamless authentication, discover your next big opportunity.

![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black) ![React](https://img.shields.io/badge/React-19.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Python](https://img.shields.io/badge/Python-FastAPI-green)

## ✨ Features

- **AI-Powered Generation**: Leverages OpenAI's GPT models to create unique business ideas
- **Real-time Streaming**: Ideas appear in real-time using Server-Sent Events
- **Secure Authentication**: Powered by Clerk for seamless user management
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Dark Mode Support**: Automatic dark/light theme switching
- **Markdown Rendering**: Rich formatting for generated ideas

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with Pages Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Clerk** - Authentication and user management

### Backend
- **FastAPI** - Modern Python web framework
- **OpenAI API** - AI-powered content generation
- **Server-Sent Events** - Real-time streaming

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+
- OpenAI API key
- Clerk account and API keys

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd saas
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

### 3. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
# OpenAI
```

## 🏃‍♂️ Development

### Start the Frontend
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000)

### Start the Backend
```bash
# From the api directory or root
uvicorn api.index:app --reload
```
The API will be available at [http://localhost:8000](http://localhost:8000)

### Other Commands
```bash
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
saas/
├── pages/                 # Next.js pages
│   ├── index.tsx         # Landing page
│   ├── product.tsx       # Main app interface
│   ├── _app.tsx          # App configuration
│   └── _document.tsx     # Document structure
├── api/                  # FastAPI backend
│   └── index.py          # Main API routes
├── styles/               # Global styles
│   └── globals.css       # Tailwind CSS imports
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## 🔌 API Documentation

### Streaming Endpoint
- **URL**: `/api`
- **Method**: `GET`
- **Authentication**: Bearer token (Clerk JWT)
- **Response**: Server-Sent Events stream
- **Content**: AI-generated business ideas in markdown format

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod
```

### Backend (Railway/Heroku)
Ensure your Python backend is deployed with the required environment variables:
- `OPENAI_API_KEY`
- `CLERK_JWKS_URL`

## 🆘 Troubleshooting

### Common Issues

**Authentication Errors**
- Verify Clerk environment variables are correctly set
- Check JWKS URL format

**API Connection Issues**
- Ensure backend is running on the correct port
- Verify OpenAI API key is valid and has sufficient credits

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript version compatibility

---

Built with ❤️ for the AI Agent Economy
