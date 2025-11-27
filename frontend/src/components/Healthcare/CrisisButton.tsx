import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, AlertTriangle, ExternalLink, Heart } from 'lucide-react';

interface CrisisContact {
  name: string;
  phone: string;
  description: string;
  available: string;
}

const CrisisButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const emergencyContacts: CrisisContact[] = [
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '988',
      description: 'Free and confidential emotional support 24/7',
      available: '24/7',
    },
    {
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Free, 24/7 crisis support via text message',
      available: '24/7',
    },
    {
      name: 'Emergency Services',
      phone: '911',
      description: 'For immediate life-threatening emergencies',
      available: '24/7',
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Treatment referral and information service',
      available: '24/7',
    },
  ];

  const handleCallNow = (phone: string) => {
    // Remove non-numeric characters for tel: link
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone) {
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  const handleViewResources = () => {
    setIsOpen(false);
    navigate('/crisis');
  };

  return (
    <>
      {/* Fixed Crisis Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="crisis-button fixed bottom-6 right-6 z-50 shadow-2xl"
            size="lg"
            aria-label="Crisis Support - Get immediate help"
          >
            <AlertTriangle className="w-6 h-6 mr-2" />
            Crisis Support
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Heart className="w-6 h-6 mr-2" />
              Crisis Support Available
            </DialogTitle>
            <DialogDescription>
              If you're having thoughts of self-harm or suicide, please reach out for help immediately. 
              You are not alone, and support is available 24/7.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Immediate Emergency Alert */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>If this is a life-threatening emergency, call 911 immediately.</strong>
              </AlertDescription>
            </Alert>

            {/* Crisis Contacts */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Crisis Support Contacts</h4>
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{contact.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{contact.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Available: {contact.available}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCallNow(contact.phone)}
                      className="ml-3 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {contact.phone}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleViewResources}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View All Crisis Resources & Safety Planning
              </Button>
            </div>

           
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard shortcut for accessibility */}
      <div className="sr-only">
        Press Alt+C to open crisis support
      </div>
    </>
  );
};

export default CrisisButton;
