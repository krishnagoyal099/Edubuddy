import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Star, Zap, Brain, Target } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, isLoading } = useAuth();

  // Refs for scroll animations
  const featuresRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(
    new Set()
  );

  // Redirect to home if user is already signed in
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/home");
    }
  }, [user, isLoading, setLocation]);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleElements((prev) => new Set([...prev, entry.target.id]));
        }
      });
    }, observerOptions);

    const elements = [
      featuresRef.current,
      heroVideoRef.current,
      ctaRef.current,
    ];
    elements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      setLocation("/home");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleSeeFeatures = () => {
    // Scroll to features section or navigate to features page
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setLocation("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer flex items-center space-x-3 hover:opacity-80 transition-all duration-300 py-4">
            <img src="/logo.png" alt="EduBuddy Logo" className="h-32 w-26" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              EduBuddy
            </span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Powered by AI
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Update Main Headline styling */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your AI-Powered Learning Companion
          </h1>

          {/* Update Subtitle for better visibility */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform videos and content into interactive quizzes, flashcards,
            and personalized study materials with AI
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
            <span className="text-sm">
              Trusted by thousands of students worldwide
            </span>
          </div>
        </div>
      </main>

      {/* Hero Demo Video */}
      <ContainerScroll
        titleComponent={
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Experience Smart Learning
            </h2>
            <p className="text-lg text-gray-600">
              Watch how EduBuddy transforms your learning experience though dual desk learning
            </p>
          </div>
        }
      >
        <div className="aspect-video rounded-xl overflow-hidden bg-black/5 shadow-lg relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
          <div className="absolute inset-0 ring-2 ring-blue-200/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full rounded-xl object-cover transition-all duration-700 group-hover:scale-[1.01] group-hover:brightness-105"
            style={{ pointerEvents: "none" }}
          >
            <source src="/front.mp4" type="video/mp4" />
          </video>
        </div>
      </ContainerScroll>

      {/* Features Demo Section */}
      <section
        ref={featuresRef}
        id="features"
        className={`py-12 px-4 bg-white/50 transition-all duration-1000 transform ${
          visibleElements.has("features")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Try Our Features Live
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Experience EduBuddy's powerful learning tools with interactive
              demos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Break Feature Demo */}
            <Card className="border-2 border-purple-200 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Focus Break
                    </h3>
                    <p className="text-sm text-gray-600">
                      Productive breaks with games
                    </p>
                  </div>
                </div>

                {/* Break Video Demo */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg group">
                  <div className="aspect-video rounded-md overflow-hidden bg-black/5 shadow-inner relative transform transition-all duration-500 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full rounded-md object-cover transition-all duration-500 group-hover:brightness-110"
                      style={{ pointerEvents: "none" }}
                    >
                      <source src="/break-demo.mp4" type="video/mp4" />
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <div className="text-3xl mb-2 animate-pulse">🎥</div>
                        <p className="text-sm">Break mode demo</p>
                      </div>
                    </video>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (user) {
                      setLocation("/break");
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2"
                >
                  Try Break Mode →
                </Button>
              </CardContent>
            </Card>

            {/* Revision Feature Demo */}
            <Card className="border-2 border-blue-200 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Smart Revision
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI-generated study materials
                    </p>
                  </div>
                </div>

                {/* Revision Video Demo */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg group">
                  <div className="aspect-video rounded-md overflow-hidden bg-black/5 shadow-inner relative transform transition-all duration-500 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full rounded-md object-cover transition-all duration-500 group-hover:brightness-110"
                      style={{ pointerEvents: "none" }}
                    >
                      <source src="/revision.mp4" type="video/mp4" />
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <div className="text-3xl mb-2 animate-pulse">📚</div>
                        <p className="text-sm">Revision mode demo</p>
                      </div>
                    </video>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (user) {
                      setLocation("/revision");
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-2"
                >
                  Try Revision Hub →
                </Button>
              </CardContent>
            </Card>

            {/* Chat Feature Demo */}
            <Card className="border-2 border-green-200 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      AI Chat Assistant
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get instant learning help
                    </p>
                  </div>
                </div>

                {/* Chat Video Demo */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg group">
                  <div className="aspect-video rounded-md overflow-hidden bg-black/5 shadow-inner relative transform transition-all duration-500 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full rounded-md object-cover transition-all duration-500 group-hover:brightness-110"
                      style={{ pointerEvents: "none" }}
                    >
                      <source src="/chat.mp4" type="video/mp4" />
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <div className="text-3xl mb-2 animate-pulse">💬</div>
                        <p className="text-sm">Chat assistant demo</p>
                      </div>
                    </video>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (user) {
                      setLocation("/chat");
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2"
                >
                  Try AI Chat →
                </Button>
              </CardContent>
            </Card>

            {/* Find Resources Feature Demo */}
            <Card className="border-2 border-orange-200 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Find Resources
                    </h3>
                    <p className="text-sm text-gray-600">
                      Discover curated learning materials
                    </p>
                  </div>
                </div>

                {/* Find Resources Video Demo */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg group">
                  <div className="aspect-video rounded-md overflow-hidden bg-black/5 shadow-inner relative transform transition-all duration-500 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full rounded-md object-cover transition-all duration-500 group-hover:brightness-110"
                      style={{ pointerEvents: "none" }}
                    >
                      <source src="/findresources.mp4" type="video/mp4" />
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <div className="text-3xl mb-2 animate-pulse">🔍</div>
                        <p className="text-sm">Find Resources demo</p>
                      </div>
                    </video>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (user) {
                      setLocation("/find-resources");
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium py-2"
                >
                  Find Resources →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        id="cta"
        className={`py-16 px-4 transition-all duration-1000 transform ${
          visibleElements.has("cta")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Ready to supercharge your studies?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Start transforming your learning materials into interactive study
            sessions today
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="px-8 py-3 text-lg bg-black hover:bg-gray-800 text-white transform hover:scale-105 transition-all duration-300"
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
