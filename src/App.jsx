import { SafeIcon } from './components/SafeIcon';
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Menu, X, Zap, Globe, ShoppingCart, Briefcase,
  Layout, Smartphone, Sparkles, Layers, Rocket,
  Monitor, BookOpen, Grid3X3, Users, Check,
  ChevronDown, Send, Star, ArrowRight, Play,
  MessageSquare, Code, Palette, Server, Shield,
  Clock, TrendingUp, Heart, ExternalLink, Github,
  Twitter, Linkedin, Instagram, Mail
} from 'lucide-react'

// Web3Forms Hook
const useFormHandler = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e, accessKey) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsError(false)

    const formData = new FormData(e.target)
    formData.append('access_key', accessKey)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        e.target.reset()
      } else {
        setIsError(true)
        setErrorMessage(data.message || 'Something went wrong')
      }
    } catch (error) {
      setIsError(true)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
    setIsError(false)
    setErrorMessage('')
  }

  return { isSubmitting, isSuccess, isError, errorMessage, handleSubmit, resetForm }
}

// FAQ Data for Chat Widget
const FAQ_DATA = [
  {
    question: 'Что такое Webly AI?',
    answer: 'Webly AI — это интеллектуальная платформа для создания сайтов с помощью искусственного интеллекта. Просто опишите свою идею, и AI создаст готовый сайт за минуты.',
    keywords: ['что такое', 'webly', 'описание', 'платформа', 'ai']
  },
  {
    question: 'Нужны ли навыки программирования?',
    answer: 'Нет! Webly AI создан для всех — от новичков до профессионалов. Вам не нужно писать ни строчки кода. AI сделает всё за вас.',
    keywords: ['программирование', 'код', 'навыки', 'нужен', 'уметь']
  },
  {
    question: 'Могу ли я использовать свой домен?',
    answer: 'Да! На тарифе Pro и выше вы можете подключить свой собственный домен. Бесплатный план включает поддомен webly.ai.',
    keywords: ['домен', 'свой', 'подключить', 'поддомен']
  },
  {
    question: 'Как работает AI-генерация?',
    answer: 'Наш AI анализирует ваше описание, выбирает оптимальную структуру, генерирует уникальный дизайн и создаёт адаптивный сайт. Всё происходит в реальном времени.',
    keywords: ['генерация', 'как работает', 'создание', 'процесс']
  },
  {
    question: 'Что включено в бесплатный план?',
    answer: 'Бесплатный план включает 5 проектов, базовые шаблоны, поддержку сообщества и SSL-сертификат. Это отличный способ начать знакомство с Webly AI.',
    keywords: ['бесплатный', 'план', 'что включено', 'возможности']
  }
]

const SITE_CONTEXT = 'Webly AI — это интеллектуальная платформа для создания веб-сайтов с помощью искусственного интеллекта. Пользователи могут создавать лендинги, интернет-магазины, портфолио и SaaS-платформы без навыков программирования, просто описывая свою идею текстом. Платформа предлагает бесплатный тариф и Pro-версию с расширенными возможностями.'

// Chat Widget Component
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Привет! Я помощник Webly AI. Чем могу помочь?' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const findFAQAnswer = (input) => {
    const lowerInput = input.toLowerCase()
    for (const faq of FAQ_DATA) {
      if (faq.keywords.some(keyword => lowerInput.includes(keyword))) {
        return faq.answer
      }
    }
    return null
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setInputValue('')
    setIsTyping(true)

    // Check FAQ first
    const faqAnswer = findFAQAnswer(userMessage)

    if (faqAnswer) {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: faqAnswer }])
        setIsTyping(false)
      }, 1000)
    } else {
      // Call API fallback
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: SITE_CONTEXT
          })
        })

        if (response.ok) {
          const data = await response.json()
          setMessages(prev => [...prev, { type: 'bot', text: data.reply }])
        } else {
          throw new Error('API error')
        }
      } catch (error) {
        // Fallback to FAQ suggestions
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Извините, я не совсем понял. Попробуйте спросить: "Что такое Webly AI?", "Нужны ли навыки программирования?" или "Что включено в бесплатный план?"'
        }])
      } finally {
        setIsTyping(false)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#E1FF01] rounded-full flex items-center justify-center shadow-lg shadow-[#E1FF01]/30 hover:shadow-[#E1FF01]/50 transition-shadow"
      >
        {isOpen ? (
          <SafeIcon name="x" size={24} className="text-[#0F1212]" />
        ) : (
          <SafeIcon name="message-square" size={24} className="text-[#0F1212]" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-[#0F1212] border border-[#253FF6]/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#253FF6] to-[#253FF6]/80 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E1FF01] rounded-full flex items-center justify-center">
                <SafeIcon name="bot" size={20} className="text-[#0F1212]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Webly AI Helper</h3>
                <p className="text-xs text-white/70">Обычно отвечает за минуту</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.type === 'user'
                        ? 'bg-[#253FF6] text-white rounded-br-md'
                        : 'bg-[#1a1a1a] text-gray-200 border border-[#253FF6]/20 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] border border-[#253FF6]/20 rounded-2xl rounded-bl-md p-3 flex gap-1">
                    <span className="w-2 h-2 bg-[#E1FF01] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[#E1FF01] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[#E1FF01] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#253FF6]/20 bg-[#0F1212]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите вопрос..."
                  className="flex-1 bg-[#1a1a1a] border border-[#253FF6]/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1FF01] transition-colors text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#E1FF01] hover:bg-[#d4e800] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#0F1212] px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  <SafeIcon name="send" size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-[#253FF6]/20 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-white group-hover:text-[#E1FF01] transition-colors pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[#253FF6]/20 flex items-center justify-center group-hover:bg-[#E1FF01]/20 transition-colors"
        >
          <SafeIcon name="plus" size={18} className="text-[#E1FF01]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime = null
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

// Main App Component
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState(null)
  const [isYearly, setIsYearly] = useState(false)
  const [demoPrompt, setDemoPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }

  const handleDemoSubmit = () => {
    if (!demoPrompt.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowResult(true)
    }, 2000)
  }

  const faqData = [
    {
      question: 'Что такое Webly AI?',
      answer: 'Webly AI — это интеллектуальная платформа, которая использует передовые технологии искусственного интеллекта для создания профессиональных веб-сайтов за считанные минуты. Просто опишите свою идею — и наблюдайте, как она оживает.'
    },
    {
      question: 'Нужны ли навыки программирования?',
      answer: 'Абсолютно нет! Webly AI создан специально для людей без технического бэкграунда. Наш интуитивный интерфейс и AI-ассистент проведут вас через весь процесс создания сайта от начала до конца.'
    },
    {
      question: 'Могу ли я использовать свой домен?',
      answer: 'Да, на тарифе Pro и выше вы можете легко подключить свой собственный домен. Мы поддерживаем все популярные регистраторы и предоставляем бесплатный SSL-сертификат для всех подключенных доменов.'
    },
    {
      question: 'Как работает AI-генерация?',
      answer: 'Наш AI анализирует ваше текстовое описание, определяет оптимальную структуру сайта, подбирает цветовую схему и типографику, генерирует уникальный дизайн и создаёт полностью адаптивный код. Весь процесс занимает менее минуты.'
    },
    {
      question: 'Что включено в бесплатный план?',
      answer: 'Бесплатный план включает до 5 проектов, доступ к базовым шаблонам, поддержку через сообщество, бесплатный поддомен webly.ai и SSL-сертификат. Это идеальный способ начать знакомство с платформой без каких-либо обязательств.'
    },
    {
      question: 'Могу ли я экспортировать код?',
      answer: 'Да, на тарифе Pro вы можете экспортировать чистый HTML/CSS/JS код вашего сайта. Это даёт вам полную свободу — вы можете разместить сайт где угодно или передать код разработчикам для дальнейшей кастомизации.'
    },
    {
      question: 'Есть ли политика возврата средств?',
      answer: 'Да, мы предоставляем 14-дневную гарантию возврата средств для всех платных тарифов. Если по какой-либо причине Webly AI не соответствует вашим ожиданиям, мы вернём деньги без лишних вопросов.'
    }
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  // Neural Network Background Component
  const NeuralNetwork = () => {
    const canvasRef = useRef(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      let animationFrameId
      let particles = []

      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      resize()
      window.addEventListener('resize', resize)

      // Create particles
      const particleCount = 50
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1
        })
      }

      const animate = () => {
        ctx.fillStyle = 'rgba(15, 18, 18, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Update and draw particles
        particles.forEach((particle, i) => {
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0

          // Draw particle
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fillStyle = i % 3 === 0 ? '#E1FF01' : '#253FF6'
          ctx.fill()

          // Draw connections
          particles.forEach((other, j) => {
            if (i === j) return
            const dx = particle.x - other.x
            const dy = particle.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(other.x, other.y)
              ctx.strokeStyle = `rgba(37, 63, 246, ${0.2 * (1 - distance / 100)})`
              ctx.stroke()
            }
          })
        })

        animationFrameId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        window.removeEventListener('resize', resize)
        cancelAnimationFrame(animationFrameId)
      }
    }, [])

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0F1212] text-white overflow-x-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay"></div>

      {/* Navigation */}
      <header className="fixed top-0 w-full bg-[#0F1212]/80 backdrop-blur-xl z-50 border-b border-[#253FF6]/20">
        <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#E1FF01] rounded-lg flex items-center justify-center">
              <span className="text-[#0F1212] font-black text-xl">W</span>
            </div>
            <span className="text-xl font-bold text-white">Webly AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-[#E1FF01] transition-colors text-sm font-medium">Возможности</button>
            <button onClick={() => scrollToSection('demo')} className="text-gray-300 hover:text-[#E1FF01] transition-colors text-sm font-medium">Демо</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-300 hover:text-[#E1FF01] transition-colors text-sm font-medium">Тарифы</button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-300 hover:text-[#E1FF01] transition-colors text-sm font-medium">FAQ</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Войти
            </button>
            <button className="bg-[#E1FF01] hover:bg-[#d4e800] text-[#0F1212] px-5 py-2.5 rounded-lg font-bold text-sm transition-all transform hover:scale-105">
              Начать бесплатно
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center"
            >
              <SafeIcon name={isMenuOpen ? 'x' : 'menu'} size={24} className="text-white" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0F1212] border-t border-[#253FF6]/20"
            >
              <div className="px-4 py-6 space-y-4">
                <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-300 hover:text-[#E1FF01] py-2">Возможности</button>
                <button onClick={() => scrollToSection('demo')} className="block w-full text-left text-gray-300 hover:text-[#E1FF01] py-2">Демо</button>
                <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-300 hover:text-[#E1FF01] py-2">Тарифы</button>
                <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-gray-300 hover:text-[#E1FF01] py-2">FAQ</button>
                <button className="w-full bg-[#E1FF01] text-[#0F1212] py-3 rounded-lg font-bold mt-4">
                  Начать бесплатно
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Neural Network Background */}
        <NeuralNetwork />

        {/* Gradient Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#253FF6]/20 via-transparent to-[#0F1212] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1212] via-transparent to-transparent pointer-events-none"></div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 w-20 h-20 bg-[#E1FF01]/10 rounded-2xl backdrop-blur-sm border border-[#E1FF01]/20 hidden lg:block"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-10 w-16 h-16 bg-[#253FF6]/20 rounded-full backdrop-blur-sm border border-[#253FF6]/30 hidden lg:block"
        ></motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-[#E1FF01]/10 to-[#253FF6]/10 rounded-3xl backdrop-blur-sm border border-white/5 hidden lg:block"
        ></motion.div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#253FF6]/20 border border-[#253FF6]/30 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 bg-[#E1FF01] rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-[#E1FF01]">Новое: AI-генерация теперь в 3 раза быстрее</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1]"
            >
              Создавайте сайты
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E1FF01] to-[#253FF6]">
                силой AI
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Превратите идею в готовый веб-сайт за минуты. Без кода, без сложностей — только чистая магия искусственного интеллекта.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button className="group bg-[#E1FF01] hover:bg-[#d4e800] text-[#0F1212] px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-3 shadow-lg shadow-[#E1FF01]/20 animate-pulse-glow">
                Начать создавать
                <SafeIcon name="arrow-right" size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-transparent hover:bg-white/5 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/20 hover:border-[#E1FF01]/50 flex items-center gap-3">
                <SafeIcon name="play" size={20} className="text-[#E1FF01]" />
                Смотреть демо
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <SafeIcon name="check" size={16} className="text-[#E1FF01]" />
                <span>Без кредитной карты</span>
              </div>
              <div className="flex items-center gap-2">
                <SafeIcon name="check" size={16} className="text-[#E1FF01]" />
                <span>5 проектов бесплатно</span>
              </div>
              <div className="flex items-center gap-2">
                <SafeIcon name="check" size={16} className="text-[#E1FF01]" />
                <span>Отмена в любой момент</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-[#0F1212] mb-1">
                <AnimatedCounter end={10000} suffix="+" />
              </div>
              <div className="text-sm text-gray-600 font-medium">активных создателей</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-[#0F1212] mb-1">
                <AnimatedCounter end={5} suffix=" мин" />
              </div>
              <div className="text-sm text-gray-600 font-medium">среднее время создания</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-[#0F1212] mb-1">
                <AnimatedCounter end={99} suffix="%" />
              </div>
              <div className="text-sm text-gray-600 font-medium">довольных клиентов</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Create */}
      <section className="py-24 bg-[#0F1212] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#253FF6]/5 via-transparent to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Создавайте что угодно.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E1FF01] to-[#253FF6]">
                Без ограничений.
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'layout', title: 'Лендинги', desc: 'Высококонверсионные страницы для продуктов и услуг', color: '#E1FF01' },
              { icon: 'shopping-cart', title: 'Интернет-магазины', desc: 'Полноценные ecommerce-платформы с корзиной и оплатой', color: '#253FF6' },
              { icon: 'briefcase', title: 'Портфолио', desc: 'Профессиональные сайты для демонстрации работ', color: '#E1FF01' },
              { icon: 'globe', title: 'SaaS платформы', desc: 'Сложные веб-приложения с авторизацией и дашбордами', color: '#253FF6' },
              { icon: 'book-open', title: 'Блоги и контент', desc: 'Контентные сайты с категориями и поиском', color: '#E1FF01' },
              { icon: 'smartphone', title: 'Веб-приложения', desc: 'PWA-приложения с офлайн-доступом', color: '#253FF6' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0F1212] p-8 rounded-2xl border border-[#253FF6]/20 hover:border-[#E1FF01]/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#E1FF01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <SafeIcon name={item.icon} size={28} style={{ color: item.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#E1FF01] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[#E1FF01] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Подробнее</span>
                  <SafeIcon name="arrow-right" size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / How It Works - Bento Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F1212] mb-6 tracking-tight">
              AI, который
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#253FF6] to-[#E1FF01]">
                действительно понимает
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 - Large */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:row-span-2 bg-gradient-to-br from-[#0F1212] to-[#1a1a1a] p-8 rounded-3xl border border-[#253FF6]/20 hover:border-[#E1FF01]/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#253FF6]/10 rounded-full blur-3xl group-hover:bg-[#E1FF01]/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#253FF6]/20 rounded-2xl flex items-center justify-center mb-6">
                  <SafeIcon name="sparkles" size={28} className="text-[#E1FF01]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Генерация на основе AI</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Опишите своё видение — и наблюдайте, как оно материализуется в реальном времени. Наш AI анализирует контекст, подбирает оптимальную структуру и создаёт уникальный дизайн.
                </p>
                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#253FF6]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#253FF6]/30 rounded w-3/4 animate-pulse"></div>
                    <div className="h-2 bg-[#E1FF01]/20 rounded w-1/2 animate-pulse"></div>
                    <div className="h-2 bg-[#253FF6]/20 rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-[#0F1212] to-[#1a1a1a] p-8 rounded-3xl border border-[#253FF6]/20 hover:border-[#E1FF01]/30 transition-all group"
            >
              <div className="w-14 h-14 bg-[#E1FF01]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E1FF01]/20 transition-colors">
                <SafeIcon name="layers" size={28} className="text-[#E1FF01]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Умная библиотека компонентов</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Готовые блоки, которые адаптируются под ваш бренд. От героев до форм — всё готово к использованию.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#0F1212] to-[#1a1a1a] p-8 rounded-3xl border border-[#253FF6]/20 hover:border-[#E1FF01]/30 transition-all group"
            >
              <div className="w-14 h-14 bg-[#253FF6]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#253FF6]/30 transition-colors">
                <SafeIcon name="rocket" size={28} className="text-[#253FF6]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Деплой в один клик</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                От идеи до живого сайта за минуты. Хостинг, SSL и CDN включены автоматически.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-24 bg-[#0F1212] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#253FF6]/5 to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Попробуйте
              <span className="text-[#E1FF01]"> вживую</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Опишите свой идеальный сайт — и посмотрите, как AI превращает слова в реальность
            </p>
          </motion.div>

          {/* Demo Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#0F1212] rounded-3xl border border-[#253FF6]/20 overflow-hidden shadow-2xl shadow-[#253FF6]/10"
          >
            {/* Browser Chrome */}
            <div className="bg-[#0F1212] px-4 py-3 border-b border-[#253FF6]/20 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 bg-[#1a1a1a] rounded-lg px-4 py-1.5 text-sm text-gray-400 text-center border border-[#253FF6]/10">
                webly.ai/demo
              </div>
            </div>

            <div className="grid md:grid-cols-2">
              {/* Left - Prompt Input */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#253FF6]/20">
                <div className="flex items-center gap-2 mb-6">
                  <SafeIcon name="sparkles" size={20} className="text-[#E1FF01]" />
                  <span className="font-semibold text-white">Опишите ваш сайт</span>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={demoPrompt}
                    onChange={(e) => setDemoPrompt(e.target.value)}
                    placeholder="Например: Современный лендинг для стартапа по доставке здоровой еды с зелёной темой и анимированными элементами..."
                    className="w-full h-40 bg-[#0F1212] border border-[#253FF6]/30 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1FF01] transition-colors resize-none text-sm"
                  />

                  <button
                    onClick={handleDemoSubmit}
                    disabled={!demoPrompt.trim() || isGenerating}
                    className="w-full bg-[#253FF6] hover:bg-[#1a2fd4] disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Генерируем...
                      </>
                    ) : (
                      <>
                        <SafeIcon name="zap" size={20} className="text-[#E1FF01]" />
                        Сгенерировать сайт
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Prompts */}
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Быстрые промпты:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Лендинг SaaS', 'Портфолио', 'Магазин', 'Блог'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setDemoPrompt(`Создай ${tag.toLowerCase()} с современным минималистичным дизайном`)}
                        className="px-3 py-1.5 bg-[#253FF6]/10 border border-[#253FF6]/30 rounded-full text-xs text-gray-300 hover:border-[#E1FF01] hover:text-[#E1FF01] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Preview */}
              <div className="p-6 md:p-8 bg-[#0F1212] relative">
                <div className="flex items-center gap-2 mb-6">
                  <SafeIcon name="monitor" size={20} className="text-[#253FF6]" />
                  <span className="font-semibold text-white">Превью</span>
                </div>

                <AnimatePresence mode="wait">
                  {!showResult ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-80 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#253FF6]/30 rounded-2xl"
                    >
                      <div className="w-16 h-16 bg-[#253FF6]/10 rounded-full flex items-center justify-center mb-4">
                        <SafeIcon name="sparkles" size={32} className="text-[#253FF6]" />
                      </div>
                      <p className="text-gray-500 max-w-xs">
                        Введите описание слева, чтобы увидеть магию AI в действии
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      {/* Mock Generated Website Preview */}
                      <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                        {/* Mock Header */}
                        <div className="bg-[#0F1212] px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#E1FF01] rounded flex items-center justify-center">
                              <span className="text-[#0F1212] font-bold text-xs">L</span>
                            </div>
                            <span className="text-white font-semibold text-sm">LeanFood</span>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-12 h-3 bg-white/20 rounded"></div>
                            <div className="w-12 h-3 bg-white/20 rounded"></div>
                          </div>
                        </div>
                        {/* Mock Hero */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6">
                          <div className="h-4 w-32 bg-emerald-600/30 rounded mb-3"></div>
                          <div className="h-8 w-48 bg-emerald-800/40 rounded mb-2"></div>
                          <div className="h-8 w-40 bg-emerald-800/40 rounded mb-4"></div>
                          <div className="h-3 w-full bg-emerald-600/20 rounded mb-2"></div>
                          <div className="h-3 w-4/5 bg-emerald-600/20 rounded mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-8 w-24 bg-emerald-600 rounded"></div>
                            <div className="h-8 w-24 bg-white border border-emerald-600 rounded"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <SafeIcon name="clock" size={16} />
                          <span>Сгенерировано за 47 секунд</span>
                        </div>
                        <button
                          onClick={() => { setShowResult(false); setDemoPrompt('') }}
                          className="text-sm text-[#253FF6] hover:text-[#E1FF01] transition-colors"
                        >
                          Создать новый
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-[#0F1212]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Component Library */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-2xl transition-all group"
            >
              <div className="w-14 h-14 bg-[#E1FF01]/20 rounded-2xl flex items-center justify-center mb-6">
                <SafeIcon name="layers" size={28} className="text-[#0F1212]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F1212] mb-4">Умная библиотека компонентов</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Готовые блоки, которые адаптируются под ваш бренд. От героев до форм — всё готово к использованию и настраивается в один клик.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 bg-[#0F1212]/5 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#253FF6]/20 rounded"></div>
                </div>
                <div className="h-20 bg-[#0F1212]/5 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#E1FF01]/30 rounded-full"></div>
                </div>
                <div className="h-20 bg-[#0F1212]/5 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-4 bg-[#253FF6]/20 rounded"></div>
                </div>
              </div>
            </motion.div>

            {/* One-Click Deploy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#253FF6] to-[#1a2fd4] rounded-3xl p-8 text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <SafeIcon name="rocket" size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Деплой в один клик</h3>
                <p className="text-white/80 leading-relaxed mb-6">
                  От идеи до живого сайта за минуты. Хостинг, SSL-сертификат и глобальный CDN включены автоматически.
                </p>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <SafeIcon name="check" size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Деплой завершён</div>
                      <div className="text-xs text-white/60">https://my-site.webly.ai</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-[#E1FF01] rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Responsive by Default */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-2xl transition-all group"
            >
              <div className="w-14 h-14 bg-[#253FF6]/10 rounded-2xl flex items-center justify-center mb-6">
                <SafeIcon name="smartphone" size={28} className="text-[#253FF6]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F1212] mb-4">Адаптивность по умолчанию</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Идеально на любом экране, автоматически. Каждый сайт оптимизирован для мобильных устройств, планшетов и десктопов.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-24 bg-[#0F1212] rounded-lg border-2 border-[#253FF6] flex items-center justify-center">
                  <div className="w-12 h-20 bg-[#253FF6]/20 rounded"></div>
                </div>
                <div className="w-24 h-16 bg-[#0F1212] rounded-lg border-2 border-[#E1FF01] flex items-center justify-center">
                  <div className="w-20 h-12 bg-[#E1FF01]/20 rounded"></div>
                </div>
                <div className="w-20 h-20 bg-[#0F1212] rounded-lg border-2 border-[#253FF6] flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#253FF6]/20 rounded"></div>
                </div>
              </div>
            </motion.div>

            {/* AI Generation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0F1212] rounded-3xl p-8 border border-[#253FF6]/20 hover:border-[#E1FF01]/30 transition-all group"
            >
              <div className="w-14 h-14 bg-[#E1FF01]/10 rounded-2xl flex items-center justify-center mb-6">
                <SafeIcon name="zap" size={28} className="text-[#E1FF01]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Мгновенная генерация</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Современные LLM-модели обрабатывают ваш запрос и создают уникальный дизайн за секунды, а не часы.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#253FF6] to-[#E1FF01] rounded-full"
                  ></motion.div>
                </div>
                <span className="text-[#E1FF01] font-bold text-sm">2.4s</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Documentation / Resources */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F1212] mb-6 tracking-tight">
              Учитесь. Создавайте.
              <br />
              <span className="text-[#253FF6]">Масштабируйтесь.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: 'book-open',
                title: 'Документация',
                desc: 'Полные руководства и справочник API для разработчиков',
                color: '#253FF6'
              },
              {
                icon: 'grid-3x3',
                title: 'Галерея шаблонов',
                desc: 'Начните с проверенных дизайнов для любой ниши',
                color: '#E1FF01',
                darkText: true
              },
              {
                icon: 'users',
                title: 'Сообщество',
                desc: 'Присоединяйтесь к создателям по всему миру',
                color: '#253FF6'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-[#0F1212] p-8 rounded-3xl border border-[#253FF6]/20 hover:border-[#E1FF01]/50 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#E1FF01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <SafeIcon name={item.icon} size={32} style={{ color: item.color }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#E1FF01] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-2 text-[#E1FF01]">
                    <span className="font-semibold">Подробнее</span>
                    <SafeIcon name="arrow-right" size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0F1212] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#253FF6]/5 via-transparent to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Простые,
              <span className="text-[#E1FF01]"> прозрачные</span>
              <br />тарифы
            </h2>

            {/* Toggle */}
            <div className="inline-flex items-center gap-4 bg-[#1a1a1a] rounded-full p-1.5 border border-[#253FF6]/20">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${!isYearly ? 'bg-[#253FF6] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Месяц
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${isYearly ? 'bg-[#E1FF01] text-[#0F1212]' : 'text-gray-400 hover:text-white'}`}
              >
                Год
                <span className={`text-xs px-2 py-0.5 rounded-full ${isYearly ? 'bg-[#0F1212] text-[#E1FF01]' : 'bg-[#E1FF01] text-[#0F1212]'}`}>
                  -20%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#1a1a1a] rounded-3xl p-8 border border-[#253FF6]/20 hover:border-[#253FF6]/40 transition-all"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Бесплатный</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">0₽</span>
                  <span className="text-gray-500">/мес</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '5 проектов',
                  'Базовые шаблоны',
                  'Поддержка сообщества',
                  'Поддомен webly.ai',
                  'SSL-сертификат'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <SafeIcon name="check" size={18} className="text-[#253FF6] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-4 rounded-xl border-2 border-[#253FF6] text-white font-bold hover:bg-[#253FF6] transition-all">
                Начать бесплатно
              </button>
            </motion.div>

            {/* Pro Plan - Popular */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative bg-[#0F1212] rounded-3xl p-8 border-2 border-[#E1FF01] shadow-2xl shadow-[#E1FF01]/20 transform md:scale-105"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#E1FF01] text-[#0F1212] px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                  Популярный
                </span>
              </div>

              <div className="mb-6 pt-4">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {isYearly ? '1,990' : '2,490'}₽
                  </span>
                  <span className="text-gray-500">/мес</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-[#E1FF01] mt-1">Экономия 6,000₽ в год</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Неограниченные проекты',
                  'Продвинутые AI-функции',
                  'Свои домены',
                  'Приоритетная поддержка',
                  'Убрать брендинг Webly',
                  'Экспорт кода'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <SafeIcon name="check" size={18} className="text-[#E1FF01] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-4 rounded-xl bg-[#E1FF01] text-[#0F1212] font-bold hover:bg-[#d4e800] transition-all transform hover:scale-[1.02] shadow-lg shadow-[#E1FF01]/20">
                Выбрать план Pro
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#1a1a1a] rounded-3xl p-8 border border-[#253FF6]/20 hover:border-[#253FF6]/40 transition-all"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">Индивид.</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Для крупных компаний</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'White-label решение',
                  'Выделенная поддержка 24/7',
                  'Кастомное обучение AI',
                  'SLA гарантии',
                  'Приоритетные серверы',
                  'Персональный менеджер'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <SafeIcon name="check" size={18} className="text-[#253FF6] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-4 rounded-xl border-2 border-[#253FF6] text-white font-bold hover:bg-[#253FF6] transition-all">
                Связаться с нами
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0F1212]">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Истории <span className="text-[#E1FF01]">успеха</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Тысячи создателей уже используют Webly AI для воплощения своих идей
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: 'Александр К.',
                role: 'Основатель стартапа',
                quote: 'Создал лендинг для нашего продукта за 15 минут. То, на что у разработчиков ушли бы дни.',
                metric: 'Сэкономил 40 часов',
                avatar: 'bg-[#253FF6]'
              },
              {
                name: 'Мария С.',
                role: 'Фрилансер',
                quote: 'Теперь могу предлагать клиентам сайты в 10 раз быстрее. Качество на уровне студий за $5000.',
                metric: '10x быстрее',
                avatar: 'bg-[#E1FF01]'
              },
              {
                name: 'Дмитрий В.',
                role: 'Маркетолог',
                quote: 'Запустил 5 лендингов для разных кампаний за один день. A/B тестирование стало проще простого.',
                metric: '5 сайтов за день',
                avatar: 'bg-purple-500'
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${testimonial.avatar} rounded-full flex items-center justify-center text-[#0F1212] font-bold`}>
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-[#0F1212]">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <SafeIcon key={star} name="star" size={16} className="text-[#E1FF01] fill-[#E1FF01]" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  "{testimonial.quote}"
                </p>
                <div className="inline-flex items-center gap-2 bg-[#253FF6]/10 text-[#253FF6] px-3 py-1.5 rounded-full text-sm font-semibold">
                  <SafeIcon name="trending-up" size={14} />
                  {testimonial.metric}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-[#0F1212] mb-6">
              Вопросы? <span className="text-[#253FF6]">Ответы здесь.</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqData.map((item, idx) => (
              <FAQItem
                key={idx}
                question={item.question}
                answer={item.answer}
                isOpen={activeFAQ === idx}
                onClick={() => toggleFAQ(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#0F1212] relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#253FF6]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E1FF01]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                Готовы создавать
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E1FF01] to-[#253FF6]">
                  будущее?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Присоединяйтесь к тысячам создателей, которые уже используют силу AI для воплощения своих идей
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button className="bg-[#E1FF01] hover:bg-[#d4e800] text-[#0F1212] px-10 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-[#E1FF01]/20 flex items-center gap-3">
                  Начать создавать бесплатно
                  <SafeIcon name="arrow-right" size={20} />
                </button>
              </div>

              <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <SafeIcon name="check" size={16} className="text-[#E1FF01]" />
                Кредитная карта не требуется
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1212] border-t border-[#253FF6]/20 pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#E1FF01] rounded-lg flex items-center justify-center">
                  <span className="text-[#0F1212] font-black text-xl">W</span>
                </div>
                <span className="text-xl font-bold text-white">Webly AI</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Создавайте профессиональные сайты за минуты с помощью силы искусственного интеллекта.
              </p>
              <div className="flex gap-4">
                {['twitter', 'github', 'linkedin', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#E1FF01] hover:bg-[#253FF6]/20 transition-all"
                  >
                    <SafeIcon name={social} size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-white mb-4">Продукт</h4>
              <ul className="space-y-3">
                {['Возможности', 'Тарифы', 'Шаблоны', 'Обновления', 'API'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-[#E1FF01] transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-white mb-4">Ресурсы</h4>
              <ul className="space-y-3">
                {['Документация', 'Справочник API', 'Туториалы', 'Сообщество', 'Блог'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-[#E1FF01] transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-4">Компания</h4>
              <ul className="space-y-3">
                {['О нас', 'Карьера', 'Контакты', 'Партнёры', 'СМИ'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-[#E1FF01] transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-[#253FF6]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Webly AI. Все права защищены.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-[#E1FF01] text-sm transition-colors">Политика конфиденциальности</a>
              <a href="#" className="text-gray-500 hover:text-[#E1FF01] text-sm transition-colors">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}

export default App