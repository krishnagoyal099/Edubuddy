classDiagram
  class BookResources
  class BreakModal
  class ChatMessage
  class ChatModal
  class Flashcard
  class Header
  class LearningInterface
  class LoginModal
  class QuizQuestion
  class QuizStack
  class SearchSection
  class ThemeProvider
  class UrlInputForm
  class VideoResources

  class MemStorage {
    +getUserByUsername(username)
    +getUserByEmail(email)
    +getUserById(id)
    +createUser(insertUser)
    +createLearningHistory()
    +createBreakSession()
    +getLearningHistory(userId)
    +getBreakSessions(userId)
    +createVideo(data)
    +updateVideo()
    +createMessage(message)
    +getMessagesBySession(sessionId)
    +clearMessagesBySession(sessionId)
    +deleteMessagesBySession(sessionId)
  }

  class IStorage

  MemStorage --|> IStorage

  %% Example relationships (expand as needed)
  LoginModal --> MemStorage : uses
  QuizStack --> QuizQuestion : contains
  BookResources --> VideoResources : may reference
  LearningInterface --> BookResources : uses
  LearningInterface --> VideoResources : uses
  ChatModal --> ChatMessage : contains