import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import SessionHistory from '@/components/SessionHistory';
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  Trash2, 
  LogOut, 
  Save,
  X,
  Camera,
  History
} from 'lucide-react';
import { Participant } from '@/types/session';

interface ProfileSettingsProps {
  participant: Participant;
  sessionId: string;
  onUpdate: (updates: Partial<Participant>) => void;
  onLeaveSession: () => void;
  onClose: () => void;
}

export default function ProfileSettings({
  participant,
  sessionId,
  onUpdate,
  onLeaveSession,
  onClose
}: ProfileSettingsProps) {
  const [name, setName] = useState(participant.name);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(participant.location?.type === 'live');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      '#f43f5e', '#f97316', '#f59e0b', '#84cc16', 
      '#14b8a6', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    await onUpdate({ name: name.trim() });
    setIsSaving(false);
  };

  const handleLocationToggle = (enabled: boolean) => {
    setLocationSharing(enabled);
    if (enabled) {
      // Request live location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            onUpdate({
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                type: 'live'
              }
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            setLocationSharing(false);
          }
        );
      }
    } else {
      // Keep current location but mark as manual
      if (participant.location) {
        onUpdate({
          location: {
            ...participant.location,
            type: 'manual'
          }
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Profile & Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarFallback 
                    className="text-2xl font-bold text-white"
                    style={{ backgroundColor: getAvatarColor(participant.id) }}
                  >
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 p-0 rounded-full shadow-md"
                  disabled
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Your avatar color is automatically generated</p>
                {participant.isHost && (
                  <Badge variant="default" className="bg-gradient-to-r from-lime-500 to-teal-500">
                    Session Host
                  </Badge>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-12"
              />
            </div>

            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Session ID</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{sessionId.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Joined</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(participant.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Location Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Live Location Sharing</p>
                  <p className="text-sm text-gray-600">Automatically update your location in real-time</p>
                </div>
                <Switch
                  checked={locationSharing}
                  onCheckedChange={handleLocationToggle}
                />
              </div>

              {participant.location && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Current Location</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {participant.location.address || `${participant.location.lat.toFixed(4)}, ${participant.location.lng.toFixed(4)}`}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {participant.location.type === 'live' ? '📍 Live' : '📌 Manual'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Match Notifications</p>
                  <p className="text-sm text-gray-600">Get notified when a venue match is found</p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Participant Updates</p>
                  <p className="text-sm text-gray-600">When participants join or leave</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Session History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Session History</h3>
            </div>

            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50 font-semibold"
            >
              <History className="w-5 h-5 mr-2" />
              View Past Sessions & Reviews
            </Button>
          </div>

          <Separator />

          {/* Privacy & Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy & Data</h3>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-gray-700">
                <strong>No account required:</strong> Your data is only stored for this session
              </p>
              <p className="text-sm text-gray-700">
                <strong>Location privacy:</strong> Only shared with session participants
              </p>
              <p className="text-sm text-gray-700">
                <strong>Auto-delete:</strong> All data is removed 24 hours after session ends
              </p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim() || name === participant.name}
              className="w-full h-12 bg-gradient-to-r from-lime-500 to-teal-500 hover:from-lime-600 hover:to-teal-600 text-white font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              onClick={onLeaveSession}
              variant="outline"
              className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Leave Session
            </Button>

            {participant.isHost && (
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                disabled
              >
                <Trash2 className="w-5 h-5 mr-2" />
                End Session (Host Only)
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Session History Modal */}
      {showHistory && (
        <SessionHistory
          participantId={participant.id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
