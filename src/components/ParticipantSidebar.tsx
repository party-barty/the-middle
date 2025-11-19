import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Session } from '@/types/session';
import { Users, MapPin, Heart, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface ParticipantSidebarProps {
  session: Session;
  currentParticipantId: string;
}

export default function ParticipantSidebar({ session, currentParticipantId }: ParticipantSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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

  const getVoteStats = (participantId: string) => {
    const votes = session.votes.filter(v => v.participantId === participantId);
    const likes = votes.filter(v => v.vote === 'like').length;
    const passes = votes.filter(v => v.vote === 'pass').length;
    return { likes, passes, total: votes.length };
  };

  if (collapsed) {
    return (
      <div className="bg-white border-l border-gray-200 p-2 flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex flex-col gap-2">
          {session.participants.map((participant) => (
            <Avatar
              key={participant.id}
              className={`${getAvatarColor(participant.id)} border-2 ${
                participant.id === currentParticipantId ? 'border-lime-500' : 'border-white'
              } w-8 h-8`}
            >
              <AvatarFallback className="text-white font-semibold text-xs">
                {getInitials(participant.name)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-sm">Participants</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(true)}
          className="w-6 h-6 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {session.participants.map((participant) => {
          const stats = getVoteStats(participant.id);
          const isCurrentUser = participant.id === currentParticipantId;

          return (
            <Card
              key={participant.id}
              className={`p-3 ${
                isCurrentUser ? 'bg-lime-50 border-lime-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <Avatar className={`${getAvatarColor(participant.id)} border-2 border-white`}>
                  <AvatarFallback className="text-white font-semibold text-xs">
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {participant.name}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  {participant.isHost && (
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-300 mb-1">
                      Host
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {participant.location?.type === 'live' ? 'Live' : 'Manual'}
                      </span>
                    </div>
                  </div>
                  {stats.total > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-1 text-green-600">
                        <Heart className="w-3 h-3 fill-green-600" />
                        <span>{stats.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <X className="w-3 h-3" />
                        <span>{stats.passes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
