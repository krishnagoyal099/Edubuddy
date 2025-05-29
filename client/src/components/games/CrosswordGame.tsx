import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
}

interface GridCell {
  letter: string;
  number?: number;
  isActive: boolean;
  clueIds: number[];
  conflictingNumbers?: string;
}

export function CrosswordGame() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("Technology");
  const [showAnswers, setShowAnswers] = useState(false);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);

  const [clues, setClues] = useState<CrosswordClue[]>([
    {
      number: 1,
      direction: "across",
      clue: "Programming language created by Guido van Rossum",
      answer: "PYTHON",
      startRow: 0,
      startCol: 0,
    },
    {
      number: 2,
      direction: "down",
      clue: "Structured collection of data",
      answer: "ARRAY",
      startRow: 0,
      startCol: 0,
    },
    {
      number: 3,
      direction: "across",
      clue: "Web markup language",
      answer: "HTML",
      startRow: 2,
      startCol: 1,
    },
    {
      number: 4,
      direction: "down",
      clue: "Basic unit of computer memory",
      answer: "BYTE",
      startRow: 0,
      startCol: 4,
    },
    {
      number: 5,
      direction: "across",
      clue: "Network protocol for web pages",
      answer: "HTTP",
      startRow: 1,
      startCol: 2,
    },
  ]);

  const gridSize = 8;
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

  // Validate and fix clue positions
  const validateAndFixClues = (clues: CrosswordClue[]): CrosswordClue[] => {
    return clues.map((clue) => {
      const answer = clue.answer;
      let { startRow, startCol } = clue;

      // Ensure the word fits within the grid
      if (clue.direction === "across") {
        if (startCol + answer.length > gridSize) {
          startCol = Math.max(0, gridSize - answer.length);
        }
        if (startRow >= gridSize) {
          startRow = gridSize - 1;
        }
      } else {
        if (startRow + answer.length > gridSize) {
          startRow = Math.max(0, gridSize - answer.length);
        }
        if (startCol >= gridSize) {
          startCol = gridSize - 1;
        }
      }

      return { ...clue, startRow, startCol };
    });
  };

  // Create a proper crossword grid with conflict detection
  const createGrid = (): GridCell[][] => {
    const grid: GridCell[][] = Array(gridSize)
      .fill(null)
      .map(() =>
        Array(gridSize)
          .fill(null)
          .map(() => ({
            letter: "",
            isActive: false,
            clueIds: [],
            conflictingNumbers: undefined,
          }))
      );

    const validatedClues = validateAndFixClues(clues);

    // First pass: mark all active cells and detect conflicts
    validatedClues.forEach((clue) => {
      for (let i = 0; i < clue.answer.length; i++) {
        const row =
          clue.direction === "across" ? clue.startRow : clue.startRow + i;
        const col =
          clue.direction === "across" ? clue.startCol + i : clue.startCol;

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          const cell = grid[row][col];
          cell.isActive = true;
          cell.clueIds.push(clue.number);

          // Set the letter for validation
          if (!cell.letter) {
            cell.letter = clue.answer[i];
          } else if (cell.letter !== clue.answer[i]) {
            // Letter conflict - this shouldn't happen in a well-designed crossword
            console.warn(
              `Letter conflict at ${row},${col}: ${cell.letter} vs ${clue.answer[i]}`
            );
          }
        }
      }
    });

    // Second pass: assign numbers and handle conflicts
    validatedClues.forEach((clue) => {
      const startRow = clue.startRow;
      const startCol = clue.startCol;

      if (
        startRow >= 0 &&
        startRow < gridSize &&
        startCol >= 0 &&
        startCol < gridSize
      ) {
        const cell = grid[startRow][startCol];

        if (!cell.number) {
          cell.number = clue.number;
        } else if (cell.number !== clue.number) {
          // Number conflict - show both numbers
          const existingNumber = cell.number;
          const newNumber = clue.number;
          cell.conflictingNumbers = `${Math.min(
            existingNumber,
            newNumber
          )}/${Math.max(existingNumber, newNumber)}`;
        }
      }
    });

    return grid;
  };

  const grid = createGrid();

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const handleCellChange = (row: number, col: number, value: string) => {
    if (value.length <= 1 && /^[A-Za-z]*$/.test(value)) {
      const cellKey = getCellKey(row, col);
      setAnswers((prev) => ({
        ...prev,
        [cellKey]: value.toUpperCase(),
      }));

      // Auto-advance to next cell
      if (value) {
        moveToNextCell(row, col);
      }
    }
  };

  const moveToNextCell = (currentRow: number, currentCol: number) => {
    // Find the next active cell in reading order (left to right, top to bottom)
    for (let row = currentRow; row < gridSize; row++) {
      const startCol = row === currentRow ? currentCol + 1 : 0;
      for (let col = startCol; col < gridSize; col++) {
        if (grid[row][col].isActive) {
          setFocusedCell(getCellKey(row, col));
          setTimeout(() => {
            const nextInput = document.querySelector(
              `input[data-cell="${row}-${col}"]`
            ) as HTMLInputElement;
            nextInput?.focus();
          }, 10);
          return;
        }
      }
    }

    // If no cell found after current position, start from beginning
    for (let row = 0; row <= currentRow; row++) {
      const endCol = row === currentRow ? currentCol : gridSize;
      for (let col = 0; col < endCol; col++) {
        if (grid[row][col].isActive) {
          setFocusedCell(getCellKey(row, col));
          setTimeout(() => {
            const nextInput = document.querySelector(
              `input[data-cell="${row}-${col}"]`
            ) as HTMLInputElement;
            nextInput?.focus();
          }, 10);
          return;
        }
      }
    }
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !answers[getCellKey(row, col)]) {
      // Move to previous active cell
      for (let r = row; r >= 0; r--) {
        const startCol = r === row ? col - 1 : gridSize - 1;
        for (let c = startCol; c >= 0; c--) {
          if (grid[r][c].isActive) {
            setFocusedCell(getCellKey(r, c));
            const prevInput = document.querySelector(
              `input[data-cell="${r}-${c}"]`
            ) as HTMLInputElement;
            prevInput?.focus();
            return;
          }
        }
      }
    }
  };

  const checkAnswers = () => {
    const newCompletedWords = new Set<number>();
    let newScore = 0;

    clues.forEach((clue) => {
      let isCorrect = true;
      let wordFromGrid = "";

      for (let i = 0; i < clue.answer.length; i++) {
        const row =
          clue.direction === "across" ? clue.startRow : clue.startRow + i;
        const col =
          clue.direction === "across" ? clue.startCol + i : clue.startCol;

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          const cellKey = getCellKey(row, col);
          const cellValue = answers[cellKey] || "";
          wordFromGrid += cellValue;

          if (cellValue !== clue.answer[i]) {
            isCorrect = false;
          }
        } else {
          isCorrect = false;
        }
      }

      if (isCorrect && wordFromGrid === clue.answer) {
        newCompletedWords.add(clue.number);
        newScore += 20;
      }
    });

    setCompletedWords(newCompletedWords);
    setScore(newScore);
  };

  const resetGame = () => {
    setAnswers({});
    setCompletedWords(new Set());
    setScore(0);
    setShowHints(false);
    setShowAnswers(false);
    setFocusedCell(null);
  };

  const getCorrectAnswer = (row: number, col: number) => {
    for (const clue of clues) {
      for (let i = 0; i < clue.answer.length; i++) {
        const cellRow =
          clue.direction === "across" ? clue.startRow : clue.startRow + i;
        const cellCol =
          clue.direction === "across" ? clue.startCol + i : clue.startCol;

        if (cellRow === row && cellCol === col) {
          return clue.answer[i];
        }
      }
    }
    return "";
  };

  useEffect(() => {
    checkAnswers();
  }, [answers]);

  const generateNewCrossword = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-crossword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: currentTheme }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.clues && Array.isArray(data.clues)) {
          setClues(data.clues);
          resetGame();
        }
      }
    } catch (error) {
      console.error("Error generating crossword:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-xl">
        <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
          <CheckCircle className="h-6 w-6" />
          AI Crossword Puzzle
        </h3>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
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
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Crossword Grid */}
        <div className="space-y-4 w-full lg:w-1/2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border">
            <div
              className="grid gap-1 mx-auto w-fit"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const cellKey = getCellKey(rowIndex, colIndex);
                  const currentValue = showAnswers
                    ? getCorrectAnswer(rowIndex, colIndex)
                    : answers[cellKey] || "";

                  return (
                    <div key={cellKey} className="relative">
                      {cell.isActive ? (
                        <div className="relative">
                          <Input
                            data-cell={`${rowIndex}-${colIndex}`}
                            type="text"
                            maxLength={1}
                            value={currentValue}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                colIndex,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(rowIndex, colIndex, e)
                            }
                            onFocus={() => setFocusedCell(cellKey)}
                            className={`w-12 h-12 text-center p-0 font-bold text-lg border-2 transition-all ${
                              showAnswers
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 text-blue-800 dark:text-blue-200"
                                : focusedCell === cellKey
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                                : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                            }`}
                            disabled={showAnswers}
                          />
                          {(cell.number || cell.conflictingNumbers) && (
                            <span className="absolute -top-1 -left-1 text-xs font-bold text-purple-600 bg-white dark:bg-gray-800 px-1 rounded-full border min-w-[18px] text-center">
                              {cell.conflictingNumbers || cell.number}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-900 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2 flex-wrap">
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background"
              disabled={isGenerating}
            >
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>

            <Button
              onClick={generateNewCrossword}
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
              {isGenerating ? "Generating..." : "New Puzzle"}
            </Button>

            <Button
              onClick={() => setShowHints(!showHints)}
              variant="outline"
              size="sm"
              className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/30"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              {showHints ? "Hide" : "Show"} Hints
            </Button>

            <Button
              onClick={() => setShowAnswers(!showAnswers)}
              variant="outline"
              size="sm"
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30"
            >
              {showAnswers ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {showAnswers ? "Hide" : "Show"} Answers
            </Button>

            <Button onClick={resetGame} variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Clues */}
        <div className="space-y-4 w-full lg:w-1/2 self-start">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border">
            <h4 className="text-lg font-semibold mb-4 text-center">Clues</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {clues.map((clue) => (
                <div
                  key={clue.number}
                  className={`p-3 rounded-lg transition-all ${
                    completedWords.has(clue.number)
                      ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                      : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {clue.number} {clue.direction.toUpperCase()}:
                      </span>
                      <p className="text-sm mt-1">{clue.clue}</p>
                      {showHints && !completedWords.has(clue.number) && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Starts with: {clue.answer[0]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {completedWords.has(clue.number) && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {clue.answer.length} letters
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {completedWords.size === clues.length && (
        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 p-6 rounded-xl border border-green-300 dark:border-green-700 text-center">
          <h5 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            🎉 Outstanding!
          </h5>
          <p className="text-green-700 dark:text-green-300 text-lg">
            You completed the {currentTheme} crossword with a perfect score of{" "}
            {score}!
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            Ready for a new challenge? Try a different theme!
          </p>
        </div>
      )}
    </div>
  );
}
