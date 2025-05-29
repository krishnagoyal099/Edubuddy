import axios from "axios";
import * as cheerio from "cheerio";

interface Resource {
  title: string;
  url: string;
  description?: string;
  type: "article" | "video" | "course" | "documentation" | "other";
}

export async function searchLearnAnything(topic: string): Promise<Resource[]> {
  try {
    console.log(`Searching for resources on topic: ${topic}`);

    // Use comprehensive multi-source resource discovery
    return await comprehensiveResourceDiscovery(topic);
  } catch (error) {
    console.error("Error in searchLearnAnything:", error);
    return generateIntelligentFallback(topic);
  }
}

async function comprehensiveResourceDiscovery(
  topic: string
): Promise<Resource[]> {
  const resources: Resource[] = [];

  // Multi-source intelligent resource discovery
  const discoveryPromises = [
    scrapeGitHubResources(topic),
    scrapeStackOverflowResources(topic),
    scrapeMediumResources(topic),
    scrapeDevToResources(topic),
    discoverOfficialDocumentation(topic),
    discoverEducationalPlatforms(topic),
    scrapeRedditResources(topic),
    discoverOpenCourseware(topic),
  ];

  try {
    const results = await Promise.allSettled(discoveryPromises);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        resources.push(...result.value);
      }
    });

    // Sort by relevance and quality indicators
    const sortedResources = resources
      .filter((resource) => resource.title && resource.url)
      .sort(
        (a, b) =>
          calculateResourceScore(b, topic) - calculateResourceScore(a, topic)
      )
      .slice(0, 15); // Top 15 resources

    return sortedResources;
  } catch (error) {
    console.error("Error in comprehensive resource discovery:", error);
    return generateIntelligentFallback(topic);
  }
}

async function scrapeGitHubResources(topic: string): Promise<Resource[]> {
  const resources: Resource[] = [];

  try {
    // Search for awesome lists and tutorials
    const searchQueries = [
      `awesome ${topic}`,
      `${topic} tutorial`,
      `learn ${topic}`,
      `${topic} examples`,
      `${topic} guide`,
    ];

    for (const query of searchQueries.slice(0, 2)) {
      // Limit to avoid rate limiting
      try {
        const searchUrl = `https://github.com/search?q=${encodeURIComponent(
          query
        )}&type=repositories&sort=stars`;

        const response = await axios.get(searchUrl, {
          timeout: 8000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        const $ = cheerio.load(response.data);

        $("article.Box-row").each((i, element) => {
          if (i >= 3) return false; // Limit results per query

          const $element = $(element);
          const titleLink = $element.find("h3 a").first();
          const title = titleLink.text().trim();
          const href = titleLink.attr("href");
          const description = $element.find("p").first().text().trim();

          if (href && title) {
            const fullUrl = href.startsWith("http")
              ? href
              : `https://github.com${href}`;

            resources.push({
              title: `${title} (GitHub)`,
              url: fullUrl,
              description: description || `GitHub repository for ${topic}`,
              type: "other",
            });
          }
        });

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error searching GitHub for "${query}":`, error);
      }
    }
  } catch (error) {
    console.error("Error in GitHub discovery:", error);
  }

  return resources;
}

async function scrapeStackOverflowResources(
  topic: string
): Promise<Resource[]> {
  const resources: Resource[] = [];

  try {
    const searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(
      topic
    )}`;

    const response = await axios.get(searchUrl, {
      timeout: 8000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    $(".s-post-summary").each((i, element) => {
      if (i >= 3) return false; // Limit to top 3 results

      const $element = $(element);
      const titleLink = $element
        .find(".s-post-summary--content-title a")
        .first();
      const title = titleLink.text().trim();
      const href = titleLink.attr("href");
      const excerpt = $element
        .find(".s-post-summary--content-excerpt")
        .text()
        .trim();

      if (href && title) {
        const fullUrl = href.startsWith("http")
          ? href
          : `https://stackoverflow.com${href}`;

        resources.push({
          title: `${title} (Stack Overflow)`,
          url: fullUrl,
          description: excerpt || `Stack Overflow discussion about ${topic}`,
          type: "article",
        });
      }
    });
  } catch (error) {
    console.error("Error in Stack Overflow discovery:", error);
  }

  return resources;
}

async function scrapeMediumResources(topic: string): Promise<Resource[]> {
  const resources: Resource[] = [];

  try {
    const searchUrl = `https://medium.com/search?q=${encodeURIComponent(
      topic
    )}`;

    const response = await axios.get(searchUrl, {
      timeout: 8000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // Medium has dynamic content, so we'll create conceptual resources
    resources.push({
      title: `${topic} Articles on Medium`,
      url: searchUrl,
      description: `Curated articles and tutorials about ${topic} from Medium writers`,
      type: "article",
    });
  } catch (error) {
    console.error("Error in Medium discovery:", error);
  }

  return resources;
}

async function scrapeDevToResources(topic: string): Promise<Resource[]> {
  const resources: Resource[] = [];

  try {
    const searchUrl = `https://dev.to/search?q=${encodeURIComponent(topic)}`;

    resources.push({
      title: `${topic} Tutorials on Dev.to`,
      url: searchUrl,
      description: `Developer tutorials and articles about ${topic} on Dev.to community`,
      type: "article",
    });
  } catch (error) {
    console.error("Error in Dev.to discovery:", error);
  }

  return resources;
}

async function scrapeRedditResources(topic: string): Promise<Resource[]> {
  const resources: Resource[] = [];

  try {
    // Try to find relevant subreddits
    const topicLower = topic.toLowerCase().replace(/\s+/g, "");
    const potentialSubreddits = [
      `r/${topicLower}`,
      `r/learn${topicLower}`,
      `r/${topicLower}help`,
      "r/programming",
      "r/learnprogramming",
    ];

    resources.push({
      title: `${topic} Community Discussions`,
      url: `https://www.reddit.com/search/?q=${encodeURIComponent(topic)}`,
      description: `Community discussions, tips, and resources about ${topic} on Reddit`,
      type: "other",
    });
  } catch (error) {
    console.error("Error in Reddit discovery:", error);
  }

  return resources;
}

async function discoverOfficialDocumentation(
  topic: string
): Promise<Resource[]> {
  const resources: Resource[] = [];

  // Generate documentation URLs based on topic
  const topicNormalized = topic.toLowerCase().replace(/\s+/g, "");
  const docPatterns = [
    `https://docs.${topicNormalized}.org`,
    `https://${topicNormalized}.readthedocs.io`,
    `https://developer.mozilla.org/en-US/docs/Web/${topic}`,
    `https://www.w3schools.com/${topicNormalized}`,
    `https://devdocs.io/${topicNormalized}`,
  ];

  for (const url of docPatterns) {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status === 200,
      });

      if (response.status === 200) {
        resources.push({
          title: `${topic} Official Documentation`,
          url: url,
          description: `Official documentation and reference for ${topic}`,
          type: "documentation",
        });
        break; // Only add the first working documentation
      }
    } catch (error) {
      // Continue to next pattern
    }
  }

  return resources;
}

async function discoverEducationalPlatforms(
  topic: string
): Promise<Resource[]> {
  const resources: Resource[] = [];

  // Generate course platform URLs
  const courseUrls = [
    {
      name: "freeCodeCamp",
      url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(
        topic
      )}`,
      description: `Free ${topic} tutorials and projects`,
    },
    {
      name: "Khan Academy",
      url: `https://www.khanacademy.org/search?search_again=1&page_search_query=${encodeURIComponent(
        topic
      )}`,
      description: `${topic} lessons and exercises`,
    },
    {
      name: "Coursera",
      url: `https://www.coursera.org/search?query=${encodeURIComponent(topic)}`,
      description: `${topic} courses from universities`,
    },
    {
      name: "edX",
      url: `https://www.edx.org/search?q=${encodeURIComponent(topic)}`,
      description: `${topic} courses from top institutions`,
    },
  ];

  courseUrls.forEach((course) => {
    resources.push({
      title: `Learn ${topic} on ${course.name}`,
      url: course.url,
      description: course.description,
      type: "course",
    });
  });

  return resources;
}

async function discoverOpenCourseware(topic: string): Promise<Resource[]> {
  const resources: Resource[] = [];

  // MIT OpenCourseWare and other open resources
  const openResources = [
    {
      name: "MIT OpenCourseWare",
      url: `https://ocw.mit.edu/search/?q=${encodeURIComponent(topic)}`,
      description: `Free ${topic} courses from MIT`,
    },
    {
      name: "Stanford Online",
      url: `https://online.stanford.edu/search-catalog?keywords=${encodeURIComponent(
        topic
      )}`,
      description: `${topic} courses from Stanford University`,
    },
    {
      name: "Harvard Online Learning",
      url: `https://pll.harvard.edu/catalog?keywords=${encodeURIComponent(
        topic
      )}`,
      description: `${topic} courses from Harvard University`,
    },
  ];

  openResources.forEach((resource) => {
    resources.push({
      title: `${topic} on ${resource.name}`,
      url: resource.url,
      description: resource.description,
      type: "course",
    });
  });

  return resources;
}

function calculateResourceScore(resource: Resource, topic: string): number {
  let score = 0;

  const titleLower = resource.title.toLowerCase();
  const urlLower = resource.url.toLowerCase();
  const topicLower = topic.toLowerCase();

  // Prioritize free resources
  const freeResourceDomains = [
    "freecodecamp.org",
    "w3schools.com",
    "mozilla.org",
    "github.com",
    "stackoverflow.com",
    "dev.to",
    "youtube.com",
    "theodinproject.com",
    "khan",
    "mit.edu/ocw",
  ];

  // Give highest score to free platforms
  freeResourceDomains.forEach((domain) => {
    if (urlLower.includes(domain)) score += 15;
  });

  // Penalize potentially paid platforms
  const paidPlatforms = [
    "coursera.org",
    "udemy.com",
    "pluralsight.com",
    "linkedin.com/learning",
  ];
  paidPlatforms.forEach((platform) => {
    if (urlLower.includes(platform)) score -= 5;
  });

  // Title relevance
  if (titleLower.includes(topicLower)) score += 8;

  // Prioritize free-indicating keywords in title
  const freeKeywords = ["free", "open source", "open-source", "opensource"];
  freeKeywords.forEach((keyword) => {
    if (titleLower.includes(keyword)) score += 10;
  });

  // Type preferences
  const typeScores = {
    documentation: 7, // Free documentation
    article: 6, // Usually free
    video: 5, // Mixed free/paid
    course: 4, // Often paid
    other: 3,
  };
  score += typeScores[resource.type] || 0;

  // Quality indicators in title
  const qualityKeywords = [
    "tutorial",
    "guide",
    "learn",
    "beginner",
    "complete",
  ];
  qualityKeywords.forEach((keyword) => {
    if (titleLower.includes(keyword)) score += 2;
  });

  return score;
}

function generateIntelligentFallback(topic: string): Resource[] {
  // Enhanced fallback with more intelligent resource generation
  const topicWords = topic.toLowerCase().split(" ");
  const mainKeyword = topicWords[0];

  return [
    {
      title: `${topic} - Complete Learning Path`,
      url: `https://www.google.com/search?q=${encodeURIComponent(
        `${topic} tutorial complete guide learn`
      )}`,
      description: `Comprehensive search results for learning ${topic} from beginner to advanced level`,
      type: "other" as const,
    },
    {
      title: `${topic} GitHub Repositories`,
      url: `https://github.com/search?q=${encodeURIComponent(
        `awesome ${topic} tutorial`
      )}`,
      description: `Open source projects, examples, and learning resources for ${topic}`,
      type: "other" as const,
    },
    {
      title: `${topic} Stack Overflow`,
      url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(
        mainKeyword
      )}`,
      description: `Community discussions, questions, and expert answers about ${topic}`,
      type: "article" as const,
    },
    {
      title: `Learn ${topic} - Free Resources`,
      url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(
        topic
      )}`,
      description: `Free tutorials, projects, and interactive lessons for ${topic}`,
      type: "course" as const,
    },
    {
      title: `${topic} Documentation Hub`,
      url: `https://devdocs.io/${encodeURIComponent(mainKeyword)}`,
      description: `Official documentation and API references for ${topic}`,
      type: "documentation" as const,
    },
  ];
}

// Function to scrape topic page links (keeping this for backward compatibility)
export async function scrapeTopicPageLinks(): Promise<string[]> {
  return [
    "https://github.com/topics",
    "https://stackoverflow.com/tags",
    "https://www.freecodecamp.org/news/tag/programming/",
    "https://dev.to/t/programming",
    "https://medium.com/topic/programming",
  ];
}
