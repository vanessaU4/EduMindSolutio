import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentService, MentalHealthResource, extractArrayFromResponse } from '@/services/contentService';
import { LifeBuoy, Link as LinkIcon, Shield } from 'lucide-react';

const ResourceDirectory: React.FC = () => {
  const [resources, setResources] = useState<MentalHealthResource[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await contentService.getResources();
        const resourcesArray = extractArrayFromResponse(response);
        setResources(resourcesArray);
      } catch (e) {
        console.error('Failed to load resources:', e);
        setResources([]);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-healthcare-primary" />
          <h1 className="text-2xl font-bold">Mental Health Resources</h1>
          <Badge variant="outline" className="hipaa-compliant ml-2"><Shield className="w-3 h-3 mr-1" /> Safe & Trusted</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Emergency and Crisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg border">
              <div className="font-medium">988 Suicide & Crisis Lifeline</div>
              <div className="text-sm text-muted-foreground">Call or text 988</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="font-medium">Crisis Text Line</div>
              <div className="text-sm text-muted-foreground">Text HOME to 741741</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Helpful Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.length === 0 ? (
              <p className="text-muted-foreground">No resources available.</p>
            ) : (
              resources.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border hover:border-healthcare-primary transition-colors flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-healthcare-primary" />
                  <div className="font-medium">{r.name}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResourceDirectory;
