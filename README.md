# 🌐 Universal AI Translator

A premium, high-performance speech-to-text translation application powered by **Groq Cloud** and **Llama 3**. Translate your voice from any supported language into professional-grade English text in real-time.

![Universal Translator Banner](https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2070)

## ✨ Features

- **🎙️ Real-time Voice Recording**: Seamless audio capture directly from your browser.
- **📊 Audio Visualization**: Dynamic, real-time frequency bars that react to your voice.
- **🌍 Multi-Language Support**: Choose from various source languages (Hindi, Spanish, French, etc.) or let the AI auto-detect.
- **🤖 Dual-AI Engine**:
  - **Whisper (Groq)**: For lightning-fast, high-accuracy speech transcription.
  - **Llama 3.1 (Groq)**: For sophisticated, context-aware translation into English.
- **🎨 Premium White UI**: A clean, minimalist, and professional user interface with smooth transitions and glassmorphism.
- **📋 One-Click Copy**: Instantly copy your translated text to the clipboard.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API**: [Groq Cloud SDK](https://groq.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/translate-app.git
   cd translate-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Groq API Key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How It Works

1. **Select Source Language**: Use the dropdown to select the language you will speak in (or keep it on "Auto-detect").
2. **Record**: Click the microphone button and start speaking. Watch the visualizer react to your voice!
3. **Finish**: Click the button again to stop. The AI will instantly transcribe and translate your speech.
4. **Copy**: Click "Copy Translation" to use the result anywhere.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Antigravity](https://github.com/google-deepmind) and Phoenix.
