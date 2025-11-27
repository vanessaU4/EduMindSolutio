import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Video, Headphones, MapPin, Folder, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ArticleForm from './ArticleForm';
import VideoForm from './VideoForm';
import AudioForm from './AudioForm';
import MentalHealthResourceForm from './MentalHealthResourceForm';
import { contentService, ArticleFormData, VideoFormData, AudioFormData, ResourceFormData } from '@/services/contentService';

type ContentType = 'article' | 'video' | 'audio' | 'resource';

interface ContentUploadFormProps {
  onClose?: () => void;
}

const ContentUploadForm: React.FC<ContentUploadFormProps> = ({ onClose }) => {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const { toast } = useToast();

  const contentTypes = [
    {
      id: 'article' as ContentType,
      name: 'Article',
      description: 'Educational mental health articles and blog posts',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'video' as ContentType,
      name: 'Video',
      description: 'Educational videos and tutorials',
      icon: Video,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'audio' as ContentType,
      name: 'Audio Content',
      description: 'Guided meditations, podcasts, and audio resources',
      icon: Headphones,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'resource' as ContentType,
      name: 'Mental Health Resource',
      description: 'Directory of therapists, clinics, and support services',
      icon: MapPin,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const handleSubmit = async (data: any) => {
    try {
      switch (selectedType) {
        case 'article':
          await contentService.createArticle(data as ArticleFormData);
          toast({
            title: "Success",
            description: "Article created successfully",
          });
          break;
        case 'video':
          await contentService.createVideo(data as VideoFormData);
          toast({
            title: "Success",
            description: "Video created successfully",
          });
          break;
        case 'audio':
          await contentService.createAudioContent(data as AudioFormData);
          toast({
            title: "Success",
            description: "Audio content created successfully",
          });
          break;
        case 'resource':
          await contentService.createResource(data as ResourceFormData);
          toast({
            title: "Success",
            description: "Mental health resource created successfully",
          });
          break;
        default:
          throw new Error('Unknown content type');
      }
      
      // Reset form or close
      setSelectedType(null);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create content",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setSelectedType(null);
    if (onClose) {
      onClose();
    }
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  if (selectedType) {
    const commonProps = {
      onSubmit: handleSubmit,
      onCancel: handleBack,
      isEditing: false
    };

    switch (selectedType) {
      case 'article':
        return <ArticleForm {...commonProps} />;
      case 'video':
        return <VideoForm {...commonProps} />;
      case 'audio':
        return <AudioForm {...commonProps} />;
      case 'resource':
        return <MentalHealthResourceForm {...commonProps} />;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create New Content
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">What type of content would you like to create?</Label>
              <p className="text-sm text-gray-600 mt-1">
                Choose the type of content you want to add to the mental health platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentTypes.map((type) => (
                <Card 
                  key={type.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center`}>
                        <type.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Content Guidelines</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensure all content is accurate and evidence-based</li>
                <li>• Use clear, accessible language appropriate for your audience</li>
                <li>• Include proper citations and references where applicable</li>
                <li>• Review content for sensitivity and potential triggers</li>
                <li>• Add appropriate tags and categories for discoverability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentUploadForm;
