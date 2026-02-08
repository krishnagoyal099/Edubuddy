sequenceDiagram
    participant Student
    participant UI
    participant Server
    participant AIAssistant
    participant Database

    Student->>UI: Enter search query
    UI->>Server: Send search request
    Server->>AIAssistant: (Optional) Get recommendations
    AIAssistant-->>Server: Return suggestions
    Server->>Database: Query resources
    Database-->>Server: Return resource data
    Server-->>UI: Send search results
    UI-->>Student: Display resources