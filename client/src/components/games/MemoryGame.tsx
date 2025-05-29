
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RotateCcw, Star, Zap, Trophy } from 'lucide-react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  isAnimating: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const difficultySettings = {
  easy: { pairs: 6, gridCols: 4, timeLimit: null },
  medium: { pairs: 8, gridCols: 4, timeLimit: 60 },
  hard: { pairs: 12, gridCols: 6, timeLimit: 45 }
};

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const cardValues = ['🚀', '💻', '📚', '🎯', '🧠', '⚡', '🔥', '💎', '🌟', '🎮', '🏆', '🎨'];

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      setGameStatus('lost');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const initializeGame = () => {
    const settings = difficultySettings[difficulty];
    const gameValues = cardValues.slice(0, settings.pairs);
    const gameCards = [...gameValues, ...gameValues]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
        isAnimating: false,
      }));
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatches(0);
    setAttempts(0);
    setCombo(0);
    setMaxCombo(0);
    setScore(0);
    setTimeLeft(settings.timeLimit);
    setGameStatus('playing');
  };

  const flipCard = (id: number) => {
    if (flippedCards.length === 2 || gameStatus !== 'playing') return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    newCards[id].isAnimating = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setAttempts(prev => prev + 1);
      const [first, second] = newFlippedCards;
      
      if (cards[first].value === cards[second].value) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          matchedCards[first].isAnimating = false;
          matchedCards[second].isAnimating = false;
          setCards(matchedCards);
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          // Update combo and score
          const newCombo = combo + 1;
          setCombo(newCombo);
          setMaxCombo(prev => Math.max(prev, newCombo));
          
          const baseScore = 100;
          const comboBonus = newCombo * 10;
          const timeBonus = timeLeft ? Math.floor(timeLeft / 5) : 0;
          setScore(prev => prev + baseScore + comboBonus + timeBonus);
          
          // Check win condition
          if (matches + 1 === difficultySettings[difficulty].pairs) {
            setGameStatus('won');
          }
        }, 600);
      } else {
        // No match
        setCombo(0);
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          resetCards[first].isAnimating = false;
          resetCards[second].isAnimating = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1200);
      }
    }

    // Remove animation state after flip animation
    setTimeout(() => {
      const updatedCards = [...newCards];
      updatedCards[id].isAnimating = false;
      setCards(updatedCards);
    }, 300);
  };

  const getAccuracy = () => {
    if (attempts === 0) return 100;
    return Math.round((matches / attempts) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Enhanced Memory Game
        </h4>
        <div className="flex gap-2">
          {timeLeft !== null && (
            <Badge 
              variant="secondary" 
              className={`${timeLeft <= 10 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}
            >
              ⏱️ {formatTime(timeLeft)}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            <Star className="mr-1 h-3 w-3" />
            {score}
          </Badge>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="flex justify-center gap-2 mb-4">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
          <Button
            key={level}
            variant={difficulty === level ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficulty(level)}
            className={difficulty === level ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Button>
        ))}
      </div>

      {/* Stats Display */}
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>Matches: {matches}/{difficultySettings[difficulty].pairs}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-4 w-4 text-orange-500" />
          <span>Combo: {combo}</span>
        </div>
        <div className="text-muted-foreground">
          Accuracy: {getAccuracy()}%
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className={`grid gap-2 mx-auto w-fit p-4 rounded-lg border-2 border-dashed transition-all duration-300 ${
          gameStatus === 'won' 
            ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
            : gameStatus === 'lost'
            ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
            : 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
        }`}
        style={{ gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridCols}, 1fr)` }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flipCard(card.id)}
            disabled={gameStatus !== 'playing'}
            className={`w-14 h-14 text-lg font-bold rounded-lg transition-all duration-300 transform ${
              card.isFlipped || card.isMatched
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-105 shadow-lg'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 hover:scale-105 hover:shadow-md'
            } ${
              card.isAnimating ? 'animate-pulse' : ''
            } ${
              card.isMatched ? 'ring-2 ring-green-400' : ''
            }`}
          >
            {card.isFlipped || card.isMatched ? card.value : '?'}
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        <Button 
          onClick={initializeGame} 
          variant="outline" 
          size="sm"
          className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30"
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          New Game
        </Button>
      </div>

      {/* Game Status Messages */}
      {gameStatus === 'won' && (
        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg border border-green-300 dark:border-green-700">
          <h5 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5" />
            🎉 Congratulations!
          </h5>
          <p className="text-green-700 dark:text-green-300">
            Score: {score} | Max Combo: {maxCombo} | Accuracy: {getAccuracy()}%
          </p>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border border-red-300 dark:border-red-700">
          <h5 className="font-bold text-red-800 dark:text-red-200 mb-2">⏰ Time's Up!</h5>
          <p className="text-red-700 dark:text-red-300">
            You matched {matches} out of {difficultySettings[difficulty].pairs} pairs
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>🎯 Match pairs to earn points and build combos</p>
        <p>⚡ Consecutive matches increase your combo multiplier</p>
        <p>🏆 Higher difficulty = more points but less time!</p>
      </div>
    </div>
  );
}
