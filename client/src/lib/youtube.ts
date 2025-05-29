export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  views: string;
  isPlaylist?: boolean;
  playlistVideos?: YouTubeVideo[];
  isPlaylistVideo?: boolean;
  playlistId?: string;
  playlistTitle?: string;
}

export async function getYouTubeVideos(
  subject: string, 
  timePreference: 'quick' | 'one-shot' | 'playlist' | null,
  page: number = 1
): Promise<YouTubeVideo[]> {
  try {
    // Add variety to search terms for better results
    const searchVariations = [
      subject,
      `${subject} tutorial`,
      `learn ${subject}`,
      `${subject} explained`,
      `${subject} course`,
      `${subject} guide`,
      `${subject} basics`,
      `${subject} advanced`
    ];
    
    const searchTerm = page === 1 ? subject : searchVariations[page % searchVariations.length];
    
    const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchTerm)}&type=${timePreference || 'all'}&page=${page}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch YouTube videos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}
