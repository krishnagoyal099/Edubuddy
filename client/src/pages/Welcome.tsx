
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Star, Zap, Brain, Target } from 'lucide-react';
import { LoginModal } from '@/components/LoginModal';
import { useAuth } from '@/contexts/AuthContext';

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, isLoading } = useAuth();

  // Redirect to home if user is already signed in
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/home');
    }
  }, [user, isLoading, setLocation]);

  const handleGetStarted = () => {
    if (user) {
      setLocation('/home');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleSeeFeatures = () => {
    // Scroll to features section or navigate to features page
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setLocation('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EduBuddy Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">EduBuddy</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Powered by AI
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your AI-Powered Learning Companion
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform videos and content into interactive quizzes, flashcards, and personalized study materials with AI
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSeeFeatures}
              className="px-8 py-3 text-lg border-2 hover:bg-muted/50"
            >
              See features
            </Button>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="px-8 py-3 text-lg bg-black hover:bg-gray-800 text-white"
            >
              Get Started
            </Button>
          </div>

          {/* User Stats */}
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
            <span className="text-sm">Trusted by thousands of students worldwide</span>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Learning
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              EduBuddy transforms your study sessions with AI-generated content, interactive games, and comprehensive resource discovery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI-Generated Content</h3>
                <p className="text-muted-foreground">
                  Convert YouTube videos and documents into structured notes, flashcards, and study materials automatically
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Smart Quizzes & Games</h3>
                <p className="text-muted-foreground">
                  Engage with interactive quizzes, hangman, crosswords, and memory games tailored to your content
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Study Assistant</h3>
                <p className="text-muted-foreground">
                  Chat with AI about your content, get explanations, and receive personalized study guidance
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Track your learning progress with detailed analytics and compete on leaderboards
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Break Reminders</h3>
                <p className="text-muted-foreground">
                  Stay productive with intelligent break reminders and focus techniques for optimal learning
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Resource Discovery</h3>
                <p className="text-muted-foreground">
                  Find the best free learning resources curated by AI for any topic you want to learn
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to supercharge your studies?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start transforming your learning materials into interactive study sessions today
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="px-8 py-4 text-lg bg-black hover:bg-gray-800 text-white"
          >
            Start Learning Today
          </Button>
        </div>
      </section>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
