import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  RotateCcw,
  Trophy,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

interface HangmanWord {
  word: string;
  hint: string;
  category: string;
}

export function JigsawGame() {
  const [currentWord, setCurrentWord] = useState<HangmanWord>({
    word: "JAVASCRIPT",
    hint: "Popular programming language for web development",
    category: "Technology",
  });
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("Technology");

  const maxWrongGuesses = 6;
  const themes = [
    "Technology",
    "Science",
    "History",
    "Geography",
    "Sports",
    "Movies",
    "Music",
    "Literature",
    "Food",
    "Animals",
  ];

  const words: Record<string, HangmanWord[]> = {
    Technology: [
      {
        word: "JAVASCRIPT",
        hint: "Popular programming language for web development",
        category: "Technology",
      },
      {
        word: "ALGORITHM",
        hint: "Step-by-step procedure for solving problems",
        category: "Technology",
      },
      {
        word: "DATABASE",
        hint: "Organized collection of data",
        category: "Technology",
      },
      {
        word: "FRAMEWORK",
        hint: "Software platform for developing applications",
        category: "Technology",
      },
      {
        word: "ENCRYPTION",
        hint: "Process of encoding information",
        category: "Technology",
      },
    ],
    Science: [
      {
        word: "MOLECULE",
        hint: "Smallest unit of a chemical compound",
        category: "Science",
      },
      {
        word: "GRAVITY",
        hint: "Force that attracts objects toward Earth",
        category: "Science",
      },
      {
        word: "PHOTOSYNTHESIS",
        hint: "Process plants use to make food",
        category: "Science",
      },
      {
        word: "ELECTRON",
        hint: "Negatively charged particle",
        category: "Science",
      },
      {
        word: "EVOLUTION",
        hint: "Process of gradual change over time",
        category: "Science",
      },
    ],
    History: [
      {
        word: "RENAISSANCE",
        hint: "Period of cultural rebirth in Europe",
        category: "History",
      },
      {
        word: "REVOLUTION",
        hint: "Sudden political or social change",
        category: "History",
      },
      {
        word: "CIVILIZATION",
        hint: "Advanced human society",
        category: "History",
      },
      {
        word: "EMPIRE",
        hint: "Large political unit with territories",
        category: "History",
      },
      {
        word: "DYNASTY",
        hint: "Series of rulers from same family",
        category: "History",
      },
    ],
    Geography: [
      {
        word: "CONTINENT",
        hint: "Large landmass on Earth",
        category: "Geography",
      },
      {
        word: "MOUNTAIN",
        hint: "Natural elevation of Earth's surface",
        category: "Geography",
      },
      {
        word: "EQUATOR",
        hint: "Imaginary line around Earth's middle",
        category: "Geography",
      },
      {
        word: "PENINSULA",
        hint: "Land surrounded by water on three sides",
        category: "Geography",
      },
      {
        word: "VOLCANO",
        hint: "Mountain that can erupt",
        category: "Geography",
      },
    ],
    Sports: [
      {
        word: "BASKETBALL",
        hint: "Game played with hoops and a ball",
        category: "Sports",
      },
      {
        word: "TENNIS",
        hint: "Racket sport played on a court",
        category: "Sports",
      },
      {
        word: "OLYMPICS",
        hint: "International sporting event",
        category: "Sports",
      },
      {
        word: "CHAMPION",
        hint: "Winner of a competition",
        category: "Sports",
      },
      {
        word: "SOCCER",
        hint: "Most popular sport globally",
        category: "Sports",
      },
    ],
    Movies: [
      {
        word: "DIRECTOR",
        hint: "Person who guides film making",
        category: "Movies",
      },
      {
        word: "SCREENPLAY",
        hint: "Written version of a film",
        category: "Movies",
      },
      {
        word: "ACTOR",
        hint: "Person who performs in films",
        category: "Movies",
      },
      {
        word: "CINEMA",
        hint: "Place to watch films",
        category: "Movies",
      },
      {
        word: "ANIMATION",
        hint: "Moving drawings or computer graphics",
        category: "Movies",
      },
    ],
    Music: [
      {
        word: "MELODY",
        hint: "Sequence of musical notes",
        category: "Music",
      },
      {
        word: "RHYTHM",
        hint: "Pattern of musical beats",
        category: "Music",
      },
      {
        word: "GUITAR",
        hint: "Stringed musical instrument",
        category: "Music",
      },
      {
        word: "CONCERT",
        hint: "Live musical performance",
        category: "Music",
      },
      {
        word: "ORCHESTRA",
        hint: "Large group of musicians",
        category: "Music",
      },
    ],
    Literature: [
      {
        word: "NOVEL",
        hint: "Long fictional story in prose",
        category: "Literature",
      },
      {
        word: "POETRY",
        hint: "Written art form with rhythm",
        category: "Literature",
      },
      {
        word: "AUTHOR",
        hint: "Writer of books or stories",
        category: "Literature",
      },
      {
        word: "CHAPTER",
        hint: "Main division of a book",
        category: "Literature",
      },
      {
        word: "NARRATIVE",
        hint: "Spoken or written account of events",
        category: "Literature",
      },
    ],
    Food: [
      {
        word: "CUISINE",
        hint: "Style of cooking",
        category: "Food",
      },
      {
        word: "RECIPE",
        hint: "Instructions for preparing food",
        category: "Food",
      },
      {
        word: "DESSERT",
        hint: "Sweet course after main meal",
        category: "Food",
      },
      {
        word: "INGREDIENT",
        hint: "Component used in cooking",
        category: "Food",
      },
      {
        word: "SPICES",
        hint: "Flavoring for food",
        category: "Food",
      },
    ],
    Animals: [
      {
        word: "ELEPHANT",
        hint: "Largest land mammal",
        category: "Animals",
      },
      {
        word: "PENGUIN",
        hint: "Flightless bird from Antarctica",
        category: "Animals",
      },
      {
        word: "DOLPHIN",
        hint: "Intelligent marine mammal",
        category: "Animals",
      },
      {
        word: "GIRAFFE",
        hint: "Tallest land animal",
        category: "Animals",
      },
      {
        word: "CHEETAH",
        hint: "Fastest land animal",
        category: "Animals",
      },
    ],
  };

  const generateNewWord = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-hangman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: currentTheme }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentWord(data);
        resetGame();
      } else {
        fallbackToLocalWords();
      }
    } catch (error) {
      fallbackToLocalWords();
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackToLocalWords = () => {
    const themeWords = words[currentTheme] || words.Technology;
    const randomWord =
      themeWords[Math.floor(Math.random() * themeWords.length)];
    setCurrentWord(randomWord);
    resetGame();
  };

  const resetGame = () => {
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setCurrentGuess("");
    setGameStatus("playing");
    setShowHint(false);
  };

  const handleGuess = (letter?: string) => {
    const guessLetter = letter || currentGuess;
    if (
      !guessLetter ||
      guessLetter.length !== 1 ||
      guessedLetters.has(guessLetter.toUpperCase())
    ) {
      return;
    }

    const upperLetter = guessLetter.toUpperCase();
    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(upperLetter);
    setGuessedLetters(newGuessedLetters);
    setCurrentGuess("");

    if (!currentWord.word.includes(upperLetter)) {
      setWrongGuesses((prev) => prev + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  const getDisplayWord = () => {
    return currentWord.word
      .split("")
      .map((letter) => (guessedLetters.has(letter) ? letter : "_"))
      .join(" ");
  };

  const getHangmanSVG = () => {
    const parts = [
      // Base
      <line
        key="base"
        x1="10"
        y1="190"
        x2="50"
        y2="190"
        stroke="currentColor"
        strokeWidth="3"
      />,
      // Pole
      <line
        key="pole"
        x1="30"
        y1="190"
        x2="30"
        y2="20"
        stroke="currentColor"
        strokeWidth="3"
      />,
      // Top beam
      <line
        key="beam"
        x1="30"
        y1="20"
        x2="80"
        y2="20"
        stroke="currentColor"
        strokeWidth="3"
      />,
      // Noose
      <line
        key="noose"
        x1="80"
        y1="20"
        x2="80"
        y2="40"
        stroke="currentColor"
        strokeWidth="3"
      />,
      // Head
      <circle
        key="head"
        cx="80"
        cy="50"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />,
      // Body
      <line
        key="body"
        x1="80"
        y1="60"
        x2="80"
        y2="130"
        stroke="currentColor"
        strokeWidth="2"
      />,
      // Left arm
      <line
        key="leftArm"
        x1="80"
        y1="80"
        x2="60"
        y2="100"
        stroke="currentColor"
        strokeWidth="2"
      />,
      // Right arm
      <line
        key="rightArm"
        x1="80"
        y1="80"
        x2="100"
        y2="100"
        stroke="currentColor"
        strokeWidth="2"
      />,
      // Left leg
      <line
        key="leftLeg"
        x1="80"
        y1="130"
        x2="60"
        y2="160"
        stroke="currentColor"
        strokeWidth="2"
      />,
      // Right leg
      <line
        key="rightLeg"
        x1="80"
        y1="130"
        x2="100"
        y2="160"
        stroke="currentColor"
        strokeWidth="2"
      />,
    ];

    // Show parts based on wrong guesses (first 4 are always visible)
    return parts.slice(0, 4 + wrongGuesses);
  };

  useEffect(() => {
    const wordComplete = currentWord.word
      .split("")
      .every((letter) => guessedLetters.has(letter));
    const gameLost = wrongGuesses >= maxWrongGuesses;

    if (wordComplete && gameStatus === "playing") {
      setGameStatus("won");
      setScore((prev) => prev + Math.max(10, 30 - wrongGuesses * 3));
    } else if (gameLost && gameStatus === "playing") {
      setGameStatus("lost");
    }
  }, [guessedLetters, wrongGuesses, currentWord.word, gameStatus]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;

      const letter = e.key.toUpperCase();
      if (letter.match(/[A-Z]/) && letter.length === 1) {
        handleGuess(letter);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStatus, guessedLetters]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 p-3 rounded-xl">
        <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
          <Target className="h-5 w-5" />
          AI Hangman Game
        </h3>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200"
          >
            {currentTheme}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
          >
            Score: {score}
          </Badge>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Hangman Drawing */}
        <div className="space-y-4 w-full lg:w-1/2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border">
            <div className="flex justify-center mb-2">
              <svg
                width="120"
                height="200"
                className="text-gray-700 dark:text-gray-300"
              >
                {getHangmanSVG()}
              </svg>
            </div>
            <div className="flex justify-center gap-2 text-xs">
              <Badge
                variant="outline"
                className={`px-2 py-1 ${
                  wrongGuesses > 0
                    ? "bg-red-50 dark:bg-red-900/30 border-red-300 text-red-700 dark:text-red-300"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                Wrong: {wrongGuesses}/{maxWrongGuesses}
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-900/30 border-green-300 text-green-700 dark:text-green-300 px-2 py-1"
              >
                Correct:{" "}
                {
                  currentWord.word
                    .split("")
                    .filter((letter) => guessedLetters.has(letter)).length
                }
                /{currentWord.word.length}
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <div className="flex justify-center gap-2 flex-wrap">
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="px-2 py-1 text-sm border rounded-lg bg-background"
                disabled={isGenerating}
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
              <Button
                onClick={generateNewWord}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30"
              >
                {isGenerating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "New Word"}
              </Button>
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
                className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/30"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {showHint ? "Hide" : "Show"} Hint
              </Button>
              <Button onClick={resetGame} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
            {/* Manual Input */}
            {gameStatus === "playing" && (
              <div className="flex justify-center gap-2">
                <Input
                  type="text"
                  maxLength={1}
                  value={currentGuess}
                  onChange={(e) =>
                    setCurrentGuess(e.target.value.toUpperCase())
                  }
                  onKeyPress={handleKeyPress}
                  placeholder="Type here"
                  className="w-16 text-center text-base font-bold"
                />
                <Button
                  onClick={() => handleGuess()}
                  disabled={!currentGuess}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Guess
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Word and Alphabet */}
        <div className="space-y-4 w-full lg:w-1/2 self-start">
          {/* Word Display */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border">
            <div className="text-center space-y-2">
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/30 border-blue-300 text-blue-700 dark:text-blue-300 px-2 py-1"
              >
                {currentWord.category}
              </Badge>
              <div className="text-3xl font-mono font-bold tracking-[0.2em] text-blue-700 dark:text-blue-300 min-h-[2.5rem] flex items-center justify-center">
                {getDisplayWord()}
              </div>
            </div>
          </div>
          {/* Alphabet Grid */}
          {gameStatus === "playing" && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border">
              <h4 className="text-base font-semibold text-center mb-2">
                Choose a Letter (or use keyboard)
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-2">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
                  const isGuessed = guessedLetters.has(letter);
                  const isCorrect =
                    isGuessed && currentWord.word.includes(letter);
                  const isWrong =
                    isGuessed && !currentWord.word.includes(letter);
                  return (
                    <Button
                      key={letter}
                      variant="outline"
                      size="sm"
                      onClick={() => handleGuess(letter)}
                      disabled={isGuessed || gameStatus !== "playing"}
                      className={`w-9 h-9 p-0 text-xs font-bold transition-all duration-300 ${
                        isCorrect
                          ? "bg-green-500 text-white border-green-600 scale-95 shadow-lg"
                          : isWrong
                          ? "bg-red-500 text-white border-red-600 scale-95 opacity-60"
                          : "hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-400 hover:scale-105 active:scale-95"
                      }`}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Hint */}
          {showHint && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl border border-yellow-300 dark:border-yellow-700">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Hint:
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    {currentWord.hint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Status Messages */}
      {gameStatus === "won" && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl border border-green-300 dark:border-green-700 text-center">
          <h5 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
            🎉 Excellent Work!
          </h5>
          <p className="text-green-700 dark:text-green-300 text-base">
            You guessed <strong>"{currentWord.word}"</strong> with only{" "}
            {wrongGuesses} wrong guesses!
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Points earned: {Math.max(10, 30 - wrongGuesses * 3)}
          </p>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 p-4 rounded-xl border border-red-300 dark:border-red-700 text-center">
          <h5 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            💀 Game Over!
          </h5>
          <p className="text-red-700 dark:text-red-300 text-base">
            The word was: <strong>"{currentWord.word}"</strong>
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic">
            {currentWord.hint}
          </p>
        </div>
      )}
    </div>
  );
}
