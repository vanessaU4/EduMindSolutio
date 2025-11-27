import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { contentService, Article, Video, AudioContent } from '@/services/contentService';
import { BookOpen, Video as VideoIcon, Headphones, Layers } from 'lucide-react';

const EducationCenter: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [audios, setAudios] = useState<AudioContent[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, v, au] = await Promise.all([
          contentService.getArticles(),
          contentService.getVideos(),
          contentService.getAudioContent(),
        ]);
        setArticles(Array.isArray(a) ? a : a.results || []);
        setVideos(Array.isArray(v) ? v : v.results || []);
        setAudios(Array.isArray(au) ? au : au.results || []);
      } catch (e) {
        setArticles([]);
        setVideos([]);
        setAudios([]);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-healthcare-primary" /> Featured Articles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!articles || !Array.isArray(articles) || articles.length === 0 ? (
              <p className="text-muted-foreground">No articles available.</p>
            ) : (
              articles.map((a) => (
                <div key={a.id} className="p-3 rounded-lg border hover:border-healthcare-primary transition-colors">
                  <div className="font-medium">{a.title}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><VideoIcon className="w-4 h-4 text-healthcare-primary" /> Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!videos || !Array.isArray(videos) || videos.length === 0 ? (
              <p className="text-muted-foreground">No videos available.</p>
            ) : (
              videos.map((v) => (
                <div key={v.id} className="p-3 rounded-lg border hover:border-healthcare-primary transition-colors">
                  <div className="font-medium">{v.title}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Headphones className="w-4 h-4 text-healthcare-primary" /> Audio Guides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!audios || !Array.isArray(audios) || audios.length === 0 ? (
              <p className="text-muted-foreground">No audio content available.</p>
            ) : (
              audios.map((au) => (
                <div key={au.id} className="p-3 rounded-lg border hover:border-healthcare-primary transition-colors">
                  <div className="font-medium">{au.title}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default EducationCenter;
