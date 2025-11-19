import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Session } from '@/types/session';
import { Copy, Users, MapPin, Navigation, Check, Clock, Share2, Lock, Unlock, UserX, LogOut, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { sessionStore } from '@/lib/session-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WaitingRoomProps {
  session: Session;
  currentParticipantId: string;
  onReady: () => void;
  onLeave?: () => void;
}

export default function WaitingRoom({ session, currentParticipantId, onReady, onLeave }: WaitingRoomProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [showEndSession, setShowEndSession] = useState(false);

  const currentParticipant = session.participants.find(p => p.id === currentParticipantId);
  const isHost = currentParticipant?.isHost || session.hostId === currentParticipantId;
  const readyCount = session.participants.filter(p => p.isReady).length;
  const totalCount = session.participants.length;
  const allReady = readyCount === totalCount;

  // Update activity every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      sessionStore.updateParticipantActivity(currentParticipantId);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentParticipantId]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${session.id}`;
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

  const handleShare = async () => {
    const link = `${window.location.origin}/join/${session.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my session on The Middle',
          text: `Join me to find the perfect meetup spot! Session code: ${session.id}`,
          url: link,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleLockSession = async () => {
    await sessionStore.lockSession(session.id, !session.isLocked);
    toast({
      title: session.isLocked ? "Session unlocked" : "Session locked",
      description: session.isLocked 
        ? "New participants can now join" 
        : "No new participants can join",
    });
  };

  const handleRemoveParticipant = async (participantId: string) => {
    await sessionStore.removeParticipant(session.id, participantId);
    setParticipantToRemove(null);
    toast({
      title: "Participant removed",
      description: "The participant has been removed from the session",
    });
  };

  const handleEndSession = async () => {
    await sessionStore.endSession(session.id);
    setShowEndSession(false);
    toast({
      title: "Session ended",
      description: "The session has been ended",
    });
    onLeave?.();
  };

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
      'bg-rose-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-lime-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getActivityStatus = (lastActive?: string) => {
    if (!lastActive) return 'active';
    const diff = Date.now() - new Date(lastActive).getTime();
    if (diff < 60000) return 'active'; // < 1 min
    if (diff < 300000) return 'idle'; // < 5 min
    return 'away';
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Session Code</span>
                {session.isLocked && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
              <Badge className="bg-lime-500 hover:bg-lime-600 text-lg px-4 py-1">
                {session.id}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
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
              <span className="text-sm font-semibold text-gray-700">Ready Status</span>
              <Badge variant="secondary" className="bg-lime-100 text-lime-700">
                {readyCount} / {totalCount}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-lime-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(readyCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Participants List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Participants</span>
              <span className="text-xs text-gray-500">
                {totalCount} / {session.maxParticipants || 10}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {session.participants.map((participant) => {
                const activityStatus = getActivityStatus(participant.lastActive);
                return (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className={`${getAvatarColor(participant.id)} border-2 border-white`}>
                          <AvatarFallback className="text-white font-semibold">
                            {getInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            activityStatus === 'active'
                              ? 'bg-green-500'
                              : activityStatus === 'idle'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{participant.name}</span>
                          {participant.isHost && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                              Host
                            </Badge>
                          )}
                          {participant.id === currentParticipantId && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {participant.location ? (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>Location set</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Setting location...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.isReady ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting
                        </Badge>
                      )}
                      {isHost && participant.id !== currentParticipantId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setParticipantToRemove(participant.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!currentParticipant?.isReady && (
              <Button
                onClick={onReady}
                disabled={!currentParticipant?.location}
                className="flex-1 h-12 bg-gradient-to-r from-lime-600 to-teal-600 hover:from-lime-700 hover:to-teal-700 text-white font-semibold"
              >
                <Check className="w-5 h-5 mr-2" />
                I'm Ready
              </Button>
            )}
            {isHost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleLockSession}>
                    {session.isLocked ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Session
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Lock Session
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowEndSession(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    End Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Participant Dialog */}
      <AlertDialog open={!!participantToRemove} onOpenChange={() => setParticipantToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this participant from the session? They can rejoin if the session is not locked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => participantToRemove && handleRemoveParticipant(participantToRemove)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Session Dialog */}
      <AlertDialog open={showEndSession} onOpenChange={setShowEndSession}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this session? All participants will be disconnected and the session data will be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndSession}
              className="bg-red-600 hover:bg-red-700"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}