import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  MapPin,
  Target,
  X,
  Award,
  Activity
} from 'lucide-react';
import { Session } from '@/types/session';

interface SessionInsightsProps {
  session: Session;
  onClose: () => void;
}

export default function SessionInsights({ session, onClose }: SessionInsightsProps) {
  const insights = useMemo(() => {
    const now = new Date();
    const createdAt = new Date(session.createdAt);
    const durationMs = now.getTime() - createdAt.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;

    // Calculate total votes
    const totalApproves = Object.values(session.votes).reduce(
      (sum, votes) => sum + votes.filter(v => v.approved).length,
      0
    );
    const totalRejects = Object.values(session.votes).reduce(
      (sum, votes) => sum + votes.filter(v => !v.approved).length,
      0
    );
    const totalVotes = totalApproves + totalRejects;

    // Calculate match rate
    const venuesWithVotes = Object.keys(session.votes).length;
    const matchRate = session.matchedVenue && venuesWithVotes > 0 
      ? ((1 / venuesWithVotes) * 100).toFixed(1)
      : 0;

    // Calculate participant engagement
    const participantStats = session.participants.map(p => {
      const participantVotes = Object.values(session.votes).reduce(
        (sum, votes) => sum + votes.filter(v => v.participantId === p.id).length,
        0
      );
      return {
        name: p.name,
        votes: participantVotes,
        isReady: p.isReady,
        hasLocation: !!p.location,
      };
    });

    // Most active participant
    const mostActive = participantStats.reduce((max, p) => 
      p.votes > max.votes ? p : max
    , participantStats[0]);

    // Category analysis
    const categoryCount: Record<string, number> = {};
    session.venues.forEach(v => {
      const category = v.category || 'other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Approval rate
    const approvalRate = totalVotes > 0 
      ? ((totalApproves / totalVotes) * 100).toFixed(1)
      : 0;

    return {
      duration: durationHours > 0 
        ? `${durationHours}h ${remainingMinutes}m`
        : `${durationMinutes}m`,
      totalVotes,
      totalApproves,
      totalRejects,
      matchRate,
      participantStats,
      mostActive,
      topCategories,
      approvalRate: Number(approvalRate),
      venuesShown: session.venues.length,
      venuesWithVotes,
    };
  }, [session]);

  const getEngagementColor = (votes: number) => {
    if (votes === 0) return 'bg-gray-200';
    if (votes < 5) return 'bg-yellow-200';
    if (votes < 10) return 'bg-lime-200';
    return 'bg-green-200';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Session Insights</h2>
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
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-medium text-blue-700">Duration</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{insights.duration}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-medium text-purple-700">Participants</p>
              </div>
              <p className="text-2xl font-bold text-purple-900">{session.participants.length}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-lime-50 to-lime-100 border-lime-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-lime-600" />
                <p className="text-xs font-medium text-lime-700">Total Votes</p>
              </div>
              <p className="text-2xl font-bold text-lime-900">{insights.totalVotes}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <p className="text-xs font-medium text-teal-700">Venues</p>
              </div>
              <p className="text-2xl font-bold text-teal-900">{insights.venuesShown}</p>
            </Card>
          </div>

          <Separator />

          {/* Voting Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Voting Statistics
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 border-2 border-green-200 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                    <p className="font-medium text-green-900">Approvals</p>
                  </div>
                  <Badge className="bg-green-600">{insights.totalApproves}</Badge>
                </div>
                <Progress value={insights.approvalRate} className="h-2" />
                <p className="text-xs text-green-700 mt-2">{insights.approvalRate}% approval rate</p>
              </Card>

              <Card className="p-4 border-2 border-red-200 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                    <p className="font-medium text-red-900">Rejections</p>
                  </div>
                  <Badge className="bg-red-600">{insights.totalRejects}</Badge>
                </div>
                <Progress value={100 - insights.approvalRate} className="h-2" />
                <p className="text-xs text-red-700 mt-2">{(100 - insights.approvalRate).toFixed(1)}% rejection rate</p>
              </Card>
            </div>

            {session.matchedVenue && (
              <Card className="p-4 bg-gradient-to-r from-lime-100 to-teal-100 border-2 border-lime-300">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-lime-700" />
                  <p className="font-semibold text-lime-900">Match Found!</p>
                </div>
                <p className="text-sm text-lime-800">
                  <strong>{session.matchedVenue.name}</strong> - Everyone agreed on this venue
                </p>
                <p className="text-xs text-lime-700 mt-1">
                  Match rate: {insights.matchRate}% ({insights.venuesWithVotes} venues reviewed)
                </p>
              </Card>
            )}
          </div>

          <Separator />

          {/* Participant Engagement */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participant Engagement
            </h3>

            <div className="space-y-3">
              {insights.participantStats.map((p, idx) => (
                <Card key={idx} className="p-4 border-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getEngagementColor(p.votes)}`}
                      />
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.name === insights.mostActive.name && p.votes > 0 && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
                          <Award className="w-3 h-3 mr-1" />
                          Most Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{p.votes} votes</Badge>
                      {p.hasLocation && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <MapPin className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={insights.totalVotes > 0 ? (p.votes / insights.totalVotes) * 100 : 0} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {insights.totalVotes > 0 
                      ? `${((p.votes / insights.totalVotes) * 100).toFixed(1)}% of total votes`
                      : 'No votes yet'
                    }
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Top Categories */}
          {insights.topCategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Venue Categories
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                {insights.topCategories.map(([category, count], idx) => (
                  <Card key={category} className="p-4 border-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 capitalize">
                        {category.replace(/_/g, ' ')}
                      </p>
                      <Badge variant="secondary">#{idx + 1}</Badge>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-600">
                      {((count / insights.venuesShown) * 100).toFixed(1)}% of venues
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Session Info */}
          <Card className="p-4 bg-gray-50 border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Session Information</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Session ID</p>
                <p className="font-mono font-semibold text-gray-900">{session.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-semibold text-gray-900">
                  {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <Badge variant={session.isLocked ? 'secondary' : 'default'}>
                  {session.isLocked ? 'Locked' : 'Active'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Midpoint</p>
                <p className="font-semibold text-gray-900">
                  {session.midpoint 
                    ? `${session.midpoint.lat.toFixed(4)}, ${session.midpoint.lng.toFixed(4)}`
                    : 'Not calculated'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
