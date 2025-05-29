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

      {/* Features Demo Section */}
      <section id="features" className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Try Our Features Live
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience EduBuddy's powerful learning tools with interactive demos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Break Feature Demo */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Focus Break</h3>
                    <p className="text-muted-foreground">Productive breaks with games</p>
                  </div>
                </div>

                {/* Break Video Demo */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                    <video 
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full rounded-lg object-cover"
                      style={{ pointerEvents: 'none' }}
                    >
                      <source src="/break-demo.mp4" type="video/mp4" />
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <div className="text-4xl mb-4">🎥</div>
                        <p>Break mode demo</p>
                      </div>
                    </video>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (user) {
                      setLocation('/break');
                    } else {
                      setShowLoginModal(true);
                    }
                  }} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                >
                  Try Break Mode →
                </Button>
              </CardContent>
            </Card>

            {/* Revision Feature Demo */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Smart Revision</h3>
                    <p className="text-muted-foreground">AI-generated study materials</p>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (user) {
                      setLocation('/revision');
                    } else {
                      setShowLoginModal(true);
                    }
                  }} 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3"
                >
                  Try Revision Hub →
                </Button>
              </CardContent>
            </Card>

            {/* Chat Feature Demo */}
            <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">AI Chat Assistant</h3>
                    <p className="text-muted-foreground">Get instant learning help</p>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (user) {
                      setLocation('/chat');
                    } else {
                      setShowLoginModal(true);
                    }
                  }} 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                >
                  Try AI Chat →
                </Button>
              </CardContent>
            </Card>

            {/* Find Resources Feature Demo */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Find Resources</h3>
                    <p className="text-muted-foreground">Discover curated learning materials</p>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (user) {
                      setLocation('/find-resources');
                    } else {
                      setShowLoginModal(true);
                    }
                  }} 
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3"
                >
                  Find Resources →
                </Button>
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
      />
    </div>
  );
}