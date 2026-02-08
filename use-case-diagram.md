%% Edubuddy Use Case Diagram
usecaseDiagram
  actor Student
  actor "AI Assistant" as AIA

  Student -- (Search for Resources)
  Student -- (Chat with AI)
  Student -- (Take Quizzes)
  Student -- (Use Flashcards)
  Student -- (Play Educational Games)
  Student -- (Manage Study Breaks)
  Student -- (Login/Logout)

  (Search for Resources) ..> (Book Resources) : includes
  (Search for Resources) ..> (Video Resources) : includes
  (Play Educational Games) ..> (Crossword Game) : includes
  (Play Educational Games) ..> (Hangman Game) : includes
  (Play Educational Games) ..> (Memory Game) : includes

  (Chat with AI) -- AIA