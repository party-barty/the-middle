import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Session } from '@/types/session';
import { Copy, Users, MapPin, Navigation, Check, Clock, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface WaitingRoomProps {
  session: Session;
  currentParticipantId: string;
  onReady: () => void;
}

export default function WaitingRoom({ session, currentParticipantId, onReady }: WaitingRoomProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const currentParticipant = session.participants.find(p => p.id === currentParticipantId);
  const readyCount = session.participants.filter(p => p.isReady).length;
  const totalCount = session.participants.length;
  const allReady = readyCount === totalCount;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/session/${session.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share this link with your friends to join the session.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.id);
    toast({
      title: "Session code copied!",
      description: `Code: ${session.id}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-amber-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-xl bg-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Waiting Room</CardTitle>
          <CardDescription className="text-base">
            {allReady 
              ? "Everyone's ready! Starting session..." 
              : "Waiting for everyone to set their location"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Info */}
          <div className="p-4 bg-gradient-to-r from-lime-50 to-teal-50 border border-lime-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Session Code</span>
              <Badge className="bg-lime-500 hover:bg-lime-600 text-lg px-4 py-1">
                {session.id}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex-1 border-lime-400 hover:bg-lime-50 hover:border-lime-500 text-lime-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Link
                  </>
                )}
              </Button>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="sm"
                className="flex-1 border-teal-400 hover:bg-teal-50 hover:border-teal-500 text-teal-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Participants Ready</span>
              <span className="text-sm font-bold text-lime-600">
                {readyCount} / {totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lime-500 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${(readyCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Participants List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Participants</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {session.participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    participant.id === currentParticipantId
                      ? 'bg-lime-50 border-lime-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        participant.isReady 
                          ? 'bg-gradient-to-br from-lime-500 to-teal-500' 
                          : 'bg-gray-300'
                      }`}>
                        {participant.isReady ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {participant.name}
                          {participant.id === currentParticipantId && (
                            <span className="text-xs text-lime-600 ml-2">(You)</span>
                          )}
                        </p>
                        {participant.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            {participant.location.type === 'live' ? (
                              <>
                                <Navigation className="w-3 h-3 text-lime-600" />
                                <span>Live location</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-3 h-3 text-amber-600" />
                                <span>Manual location</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={participant.isReady ? 'default' : 'secondary'}
                      className={participant.isReady 
                        ? 'bg-lime-500 hover:bg-lime-600' 
                        : 'bg-gray-400 hover:bg-gray-500'}
                    >
                      {participant.isReady ? 'Ready' : 'Waiting'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current User Status */}
          {currentParticipant && !currentParticipant.isReady && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium mb-3">
                ⏳ You haven't set your location yet
              </p>
              <Button
                onClick={onReady}
                className="w-full h-12 bg-gradient-to-r from-lime-500 to-teal-500 hover:from-lime-600 hover:to-teal-600 text-white font-semibold"
              >
                Set My Location
              </Button>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-gradient-to-r from-lime-50 to-teal-50 border border-lime-200 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1 text-lime-700">💡 Tip:</p>
            <p>Share the session code or link with friends. Once everyone sets their location, we'll calculate the perfect midpoint!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
