# IntervueAI - AI-Powered Interview Practice Platform

A modern, responsive landing page for IntervueAI, an AI-powered interview practice platform that helps job seekers master their interviews with personalized feedback and comprehensive preparation tools.

## 🚀 Features

- **Modern Landing Page**: Beautiful, responsive design with smooth animations
- **AI-Powered Practice**: Simulate real interviews with AI-driven feedback
- **Multiple Interview Types**: Technical, behavioral, case study, and situational interviews
- **Progress Tracking**: Monitor your improvement with detailed analytics
- **Industry-Specific**: Tailored questions for different roles and industries
- **Real-time Feedback**: Get instant analysis of your performance

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **React Router** - Client-side routing

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **LangChain** - Framework for developing LLM applications
- **LangGraph** - Build stateful, multi-actor applications with LLMs
- **OpenAI GPT-4** - AI-powered interview questions and feedback
- **Uvicorn** - ASGI server for FastAPI

## 📁 Project Structure

```
IntervueAI/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── CTA.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Navigation.jsx
│   │   ├── pages/           # Page components
│   │   │   └── Home.jsx
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # App entry point
│   ├── package.json
│   └── vite.config.js
├── Backend/                  # FastAPI backend application
│   ├── main.py              # Main FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── pyproject.toml       # Project configuration
│   └── .env.example         # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- OpenAI API key

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your OpenAI API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 3000
   ```

The backend API will be available at `http://localhost:3000`

## 🎨 Design Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with smooth animations
- **Accessibility**: Built with accessibility best practices
- **Performance**: Optimized for fast loading and smooth interactions
- **SEO Ready**: Structured for search engine optimization

## 📱 Components Overview

- **Hero Section**: Eye-catching introduction with call-to-action
- **Features**: Showcase of platform capabilities
- **How It Works**: Step-by-step process explanation
- **Pricing**: Transparent pricing plans
- **Testimonials**: Social proof from satisfied users
- **FAQ**: Common questions and answers
- **CTA**: Final conversion section
- **Footer**: Contact information and links

## 🔧 Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `uvicorn main:app --reload` - Start development server
- `uvicorn main:app --reload --port 3000` - Start on specific port

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform

### Backend (Railway/Heroku)
1. Ensure all dependencies are in `requirements.txt`
2. Set environment variables (OPENAI_API_KEY)
3. Deploy using your preferred platform

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For support, email hello@aiinterviewer.com or join our community.

---

Made with ❤️ for job seekers everywhere
