
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Book, Video, Globe, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Resource {
  title: string;
  url: string;
  description?: string;
  type: 'article' | 'video' | 'course' | 'documentation' | 'other';
  isFree?: boolean;
}

async function searchLearnAnything(topic: string): Promise<Resource[]> {
  const response = await fetch(`/api/learn-anything/search?topic=${encodeURIComponent(topic)}`);
  if (!response.ok) {
    throw new Error('Failed to search resources');
  }
  return response.json();
}

export default function FindResources() {
  const [searchTopic, setSearchTopic] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [additionalResourcesCount, setAdditionalResourcesCount] = useState(0);

  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['/api/learn-anything/search', currentTopic],
    queryFn: () => searchLearnAnything(currentTopic),
    enabled: !!currentTopic,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTopic.trim()) {
      setCurrentTopic(searchTopic.trim());
      setAdditionalResourcesCount(0);
    }
  };

  const generateMoreResources = (topic: string, batch: number): Resource[] => {
    const allResourceSets = [
      // Batch 1 - Educational platforms
      [
        {
          title: `${topic} - freeCodeCamp`,
          url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(topic)}`,
          description: `Interactive coding tutorials and articles about ${topic}`,
          type: 'course' as const,
          isFree: true
        },
        {
          title: `${topic} - Khan Academy`,
          url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(topic)}`,
          description: `Comprehensive courses and exercises on ${topic}`,
          type: 'course' as const,
          isFree: true
        },
        {
          title: `${topic} - MIT OpenCourseWare`,
          url: `https://ocw.mit.edu/search/?q=${encodeURIComponent(topic)}`,
          description: `MIT university-level courses on ${topic}`,
          type: 'course' as const,
          isFree: true
        },
        {
          title: `${topic} - YouTube Educational Channels`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
          description: `Video tutorials and lectures about ${topic}`,
          type: 'video' as const,
          isFree: true
        },
        {
          title: `${topic} - MDN Web Docs`,
          url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`,
          description: `Comprehensive web development documentation for ${topic}`,
          type: 'documentation' as const,
          isFree: true
        }
      ],
      // Batch 2 - Community and forums
      [
        {
          title: `${topic} - Reddit Community Discussions`,
          url: `https://www.reddit.com/search/?q=${encodeURIComponent(topic)}`,
          description: `Active community discussions and recommendations about ${topic}`,
          type: 'other' as const,
          isFree: true
        },
        {
          title: `${topic} - Stack Overflow`,
          url: `https://stackoverflow.com/search?q=${encodeURIComponent(topic)}`,
          description: `Programming questions and answers related to ${topic}`,
          type: 'other' as const,
          isFree: true
        },
        {
          title: `${topic} - Dev.to Articles`,
          url: `https://dev.to/search?q=${encodeURIComponent(topic)}`,
          description: `Developer community articles and tutorials about ${topic}`,
          type: 'article' as const,
          isFree: true
        },
        {
          title: `${topic} - GitHub Repositories`,
          url: `https://github.com/search?q=${encodeURIComponent(topic)}`,
          description: `Open source projects and code examples for ${topic}`,
          type: 'other' as const,
          isFree: true
        },
        {
          title: `${topic} - W3Schools`,
          url: `https://www.w3schools.com/search/search_w3schools.asp?searchvalue=${encodeURIComponent(topic)}`,
          description: `Web development tutorials and references for ${topic}`,
          type: 'documentation' as const,
          isFree: true
        }
      ],
      // Batch 3 - Academic and research
      [
        {
          title: `${topic} - Academic Papers`,
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`,
          description: `Research papers and academic resources on ${topic}`,
          type: 'article' as const,
          isFree: true
        },
        {
          title: `${topic} - Learning Roadmap`,
          url: `https://roadmap.sh/search?q=${encodeURIComponent(topic)}`,
          description: `Step-by-step learning path and roadmap for ${topic}`,
          type: 'other' as const,
          isFree: true
        },
        {
          title: `${topic} - Quora Q&A`,
          url: `https://www.quora.com/search?q=${encodeURIComponent(topic)}`,
          description: `Expert answers and insights about ${topic}`,
          type: 'other' as const,
          isFree: true
        },
        {
          title: `${topic} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(topic)}`,
          description: `Comprehensive encyclopedia articles about ${topic}`,
          type: 'article' as const,
          isFree: true
        },
        {
          title: `${topic} - TED Talks`,
          url: `https://www.ted.com/search?q=${encodeURIComponent(topic)}`,
          description: `Inspirational talks and presentations about ${topic}`,
          type: 'video' as const,
          isFree: true
        }
      ],
      // Batch 4 - Additional resources
      [
        {
          title: `${topic} - Crash Course Videos`,
          url: `https://www.youtube.com/results?search_query=crash+course+${encodeURIComponent(topic)}`,
          description: `Educational crash course videos about ${topic}`,
          type: 'video' as const,
          isFree: true
        },
        {
          title: `${topic} - Open Library`,
          url: `https://openlibrary.org/search?q=${encodeURIComponent(topic)}`,
          description: `Access to books and publications about ${topic}`,
          type: 'other' as const,
          isFree: true
        },
        {
          title: `${topic} - Awesome Lists`,
          url: `https://github.com/sindresorhus/awesome#${encodeURIComponent(topic.toLowerCase())}`,
          description: `Curated list of awesome ${topic} resources`,
          type: 'other' as const,
          isFree: true
        },
        {
          title: `${topic} - Mozilla Developer Network`,
          url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`,
          description: `Web development documentation and guides for ${topic}`,
          type: 'documentation' as const,
          isFree: true
        },
        {
          title: `${topic} - CodePen Examples`,
          url: `https://codepen.io/search/pens?q=${encodeURIComponent(topic)}`,
          description: `Interactive code examples and demos for ${topic}`,
          type: 'other' as const,
          isFree: true
        }
      ]
    ];

    const batchIndex = (batch - 1) % allResourceSets.length;
    return allResourceSets[batchIndex];
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Book className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'documentation':
        return <Book className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'video':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'documentation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filter to show only free resources and remove duplicates
  const freeResources = resources ? resources.filter(resource => resource.isFree !== false) : [];
  
  // Generate additional resources and remove duplicates
  const allGeneratedResources = Array.from({ length: additionalResourcesCount }, (_, batchIndex) =>
    generateMoreResources(currentTopic, batchIndex + 1)
  ).flat();

  // Create a set of existing URLs to avoid duplicates
  const existingUrls = new Set(freeResources.map(resource => resource.url.toLowerCase()));
  
  // Filter out duplicates from generated resources
  const uniqueGeneratedResources = allGeneratedResources.filter(resource => {
    const normalizedUrl = resource.url.toLowerCase();
    if (existingUrls.has(normalizedUrl)) {
      return false;
    }
    existingUrls.add(normalizedUrl);
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            Find Learning Resources
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover curated learning resources for any topic you want to master.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter a topic to find resources (e.g., Python, Machine Learning, React)"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !searchTopic.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {currentTopic && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                Resources for "{currentTopic}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Searching for resources...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">Failed to search resources. Please try again.</p>
                  <Button onClick={() => setCurrentTopic('')} variant="outline">
                    Clear Search
                  </Button>
                </div>
              )}

              {freeResources && freeResources.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No resources found for "{currentTopic}"</p>
                  <Button onClick={() => setCurrentTopic('')} variant="outline">
                    Try Another Topic
                  </Button>
                </div>
              )}

              {freeResources && freeResources.length > 0 && (
                <div className="space-y-4">
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                      Found {freeResources.length + uniqueGeneratedResources.length} unique resources for "{currentTopic}"
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {freeResources.map((resource, index) => (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getResourceColor(resource.type)}>
                                {getResourceIcon(resource.type)}
                                <span className="ml-1 capitalize">{resource.type}</span>
                              </Badge>
                            </div>
                            
                            <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                              {resource.title}
                            </h3>
                            
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {resource.description}
                              </p>
                            )}
                            
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit Resource
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {uniqueGeneratedResources.length > 0 && (
                      <>
                        <div className="border-t border-border pt-4 mt-6">
                          <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Additional Learning Resources
                          </h4>
                        </div>
                        {uniqueGeneratedResources.map((resource, index) => (
                          <div
                            key={`additional-${index}`}
                            className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors bg-muted/20"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getResourceColor(resource.type)}>
                                    {getResourceIcon(resource.type)}
                                    <span className="ml-1 capitalize">{resource.type}</span>
                                  </Badge>
                                </div>
                                
                                <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                                  {resource.title}
                                </h3>
                                
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {resource.description}
                                </p>
                                
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visit Resource
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  
                  {/* More Resources button at the bottom */}
                  <div className="mt-6 text-center border-t border-border pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setAdditionalResourcesCount(prev => prev + 1)}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Search className="h-4 w-4" />
                      More Resources
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
