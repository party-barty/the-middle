import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Heart, Navigation, Map, Target, Utensils, Zap, Sparkles } from 'lucide-react';
import { sessionStore } from '@/lib/session-store';

export default function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateSession = async () => {
    if (!name.trim()) return;
    try {
      const session = await sessionStore.createSession(name);
      const participant = session.participants[0];
      navigate(`/session/${session.id}?participantId=${participant.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
    }
  };

  const handleJoinSession = async () => {
    if (!name.trim() || !sessionCode.trim()) return;
    const code = sessionCode.toUpperCase();
    try {
      const participant = await sessionStore.joinSession(code, name);
      if (participant) {
        navigate(`/session/${code}?participantId=${participant.id}`);
      } else {
        alert('Session not found. Please check the session code and try again.');
      }
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-amber-50 to-teal-50">
      {/* Isomorphic Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Ad Unit - Desktop Leaderboard (Above Fold) */}
        <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 w-[728px] h-[90px] bg-white/60 backdrop-blur-md border border-lime-200 rounded-2xl flex items-center justify-center text-lime-600 text-sm z-10 shadow-lg">
          Ad Space 728x90
        </div>

        {/* Ad Unit - Mobile Half Banner (Above Fold) */}
        <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-[234px] h-[60px] bg-white/60 backdrop-blur-md border border-lime-200 rounded-2xl flex items-center justify-center text-lime-600 text-xs z-10 shadow-lg">
          Ad 234x60
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 md:pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lime-500/10 to-teal-500/10 border border-lime-300/30 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-lime-600" />
            <span className="text-sm font-semibold text-lime-700">Meet smarter, not harder</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-lime-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
            Meet Me in The Middle
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 mb-4 font-semibold">
            Find the perfect place to meet — instantly.
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            The Middle calculates the geographic midpoint between friends and recommends the best nearby spots everyone will love.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
              }}
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-lime-600 to-teal-600 hover:from-lime-700 hover:to-teal-700 text-white font-semibold text-lg shadow-xl shadow-lime-500/30 hover:shadow-2xl hover:shadow-lime-500/40 transition-all duration-300 hover:scale-105"
            >
              Create a Session
            </Button>
            <Button
              onClick={() => {
                setShowJoin(true);
                document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
              }}
              size="lg"
              variant="outline"
              className="h-14 px-8 border-2 border-lime-400 bg-white/80 backdrop-blur-sm hover:bg-lime-50 hover:border-lime-500 font-semibold text-lg text-lime-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Join a Session
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-lime-600 to-teal-600 bg-clip-text text-transparent">
            How The Middle Makes Meetups Easy
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Three simple steps to your perfect meetup</p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Navigation className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-lime-100 text-lime-700 rounded-full text-sm font-bold mb-3">Step 1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Share Your Location
              </h3>
              <p className="text-gray-600 text-lg">
                Choose real-time location or manually set where you'll be — perfect for planning ahead or coordinating travel.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-3">Step 2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                See Your Midpoint
              </h3>
              <p className="text-gray-600 text-lg">
                We instantly calculate the fair middle point for everyone in your group and display it on a shared map.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-3">Step 3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Swipe to Decide
              </h3>
              <p className="text-gray-600 text-lg">
                Browse venue recommendations near the midpoint. Swipe right to approve, left to skip. When everyone swipes right on the same place… you have a match!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-100/50 via-amber-100/50 to-teal-100/50"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-lime-600 to-teal-600 bg-clip-text text-transparent">
            Designed for Easier Meetups
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Everything you need in one beautiful interface</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="text-5xl mb-3">📍</div>
                <CardTitle className="text-xl bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">Flexible Location Input</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Use live GPS or manually set a location. Ideal for planning future trips.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="text-5xl mb-3">🗺️</div>
                <CardTitle className="text-xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Map-Based Friend View</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  See everyone's position on the map with live/manual indicators.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="text-5xl mb-3">🎯</div>
                <CardTitle className="text-xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Smart Midpoint Finder</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  The fairest place to meet, calculated automatically — with the option to lock it.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-400 to-green-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="text-5xl mb-3">🍽️</div>
                <CardTitle className="text-xl bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">Venue Recommendations</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Get curated spots near the midpoint using Google Places data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="text-5xl mb-3">🧡</div>
                <CardTitle className="text-xl bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Swipe-to-Match</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  A fun, familiar swipe interface that leads to quick group decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="text-5xl mb-3">⚡</div>
                <CardTitle className="text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Real-Time Sessions</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Everyone sees every update instantly. No accounts required for your first session.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-lime-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
            Why People Love The Middle
          </h2>
          <p className="text-gray-600 mb-12 text-lg">Real benefits for real people</p>
          
          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-lime-50 to-emerald-50 border border-lime-200 hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <p className="text-lg text-gray-700 pt-1">
                <strong className="text-lime-700">Fast group decisions</strong> — no more endless texting or compromising.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <p className="text-lg text-gray-700 pt-1">
                <strong className="text-amber-700">Fair for everyone</strong> — midpoint removes the guesswork.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <p className="text-lg text-gray-700 pt-1">
                <strong className="text-teal-700">Great recommendations</strong> — powered by trusted Google data.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-lime-50 to-green-50 border border-lime-200 hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌍</span>
              </div>
              <p className="text-lg text-gray-700 pt-1">
                <strong className="text-lime-700">Perfect for long-distance friends</strong> — plan ahead using manual locations.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📱</span>
              </div>
              <p className="text-lg text-gray-700 pt-1">
                <strong className="text-emerald-700">Works on any device</strong> — mobile-first, shareable, no app required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-100 via-amber-100 to-teal-100"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-lime-200">
            <div className="flex justify-center mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-3xl text-amber-400">⭐</span>
                ))}
              </div>
            </div>
            <p className="text-2xl md:text-3xl text-gray-800 italic mb-6 font-medium">
              "We planned a meetup in under 30 seconds. No arguments, no stress — just vibes."
            </p>
            <p className="text-lg text-lime-700 font-semibold">
              — Early Beta User
            </p>
          </div>
        </div>
      </section>

      {/* Ad Unit - Desktop Leaderboard (Below Fold) */}
      <div className="hidden md:flex justify-center py-8 bg-white/50 backdrop-blur-sm">
        <div className="w-[728px] h-[90px] bg-white/60 backdrop-blur-md border border-lime-200 rounded-2xl flex items-center justify-center text-lime-600 text-sm shadow-lg">
          Ad Space 728x90
        </div>
      </div>

      {/* Ad Unit - Mobile MREC (Below Fold) */}
      <div className="md:hidden flex justify-center py-8 bg-white/50 backdrop-blur-sm">
        <div className="w-[300px] h-[250px] bg-white/60 backdrop-blur-md border border-lime-200 rounded-2xl flex items-center justify-center text-lime-600 text-sm shadow-lg">
          Ad Space 300x250
        </div>
      </div>

      {/* CTA Section */}
      <section id="get-started" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-600 via-amber-600 to-teal-600"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Meet in the Middle?
          </h2>
          <p className="text-xl text-white/90 mb-8">Start planning your perfect meetup in seconds</p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {!showJoin ? (
              <>
                <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-md hover:scale-105 transition-transform duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-lime-600 to-teal-600 bg-clip-text text-transparent">Create a Session</CardTitle>
                    <CardDescription>Start a new meetup and invite friends</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                      className="h-12 border-lime-200 focus:border-lime-400 focus:ring-lime-400"
                    />
                    <Button
                      onClick={handleCreateSession}
                      className="w-full h-12 bg-gradient-to-r from-lime-600 to-teal-600 hover:from-lime-700 hover:to-teal-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                      disabled={!name.trim()}
                    >
                      Create Session
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-md hover:scale-105 transition-transform duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Join a Session</CardTitle>
                    <CardDescription>Enter a session code to join friends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setShowJoin(true)}
                      variant="outline"
                      className="w-full h-12 border-2 border-lime-400 bg-white hover:bg-lime-50 hover:border-lime-500 font-semibold text-lime-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Join Existing Session
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-md md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-2xl bg-gradient-to-r from-lime-600 to-teal-600 bg-clip-text text-transparent">Join a Session</CardTitle>
                  <CardDescription>Enter your name and session code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 border-lime-200 focus:border-lime-400 focus:ring-lime-400"
                  />
                  <Input
                    placeholder="Session code (e.g., ABC123)"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
                    className="h-12 uppercase border-lime-200 focus:border-lime-400 focus:ring-lime-400"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleJoinSession}
                      className="flex-1 h-12 bg-gradient-to-r from-lime-600 to-teal-600 hover:from-lime-700 hover:to-teal-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                      disabled={!name.trim() || !sessionCode.trim()}
                    >
                      Join Session
                    </Button>
                    <Button
                      onClick={() => setShowJoin(false)}
                      variant="outline"
                      className="h-12 px-8 border-2 border-lime-400 hover:bg-lime-50 hover:border-lime-500 text-lime-700"
                    >
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Button
            variant="link"
            className="text-white text-lg hover:text-white/80 font-medium"
            onClick={() => {
              document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn how The Middle works →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-lime-900 to-teal-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-lime-500 via-amber-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold">The Middle</span>
            </div>
            
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-lime-300 transition-colors font-medium">Privacy</a>
              <a href="#" className="hover:text-lime-300 transition-colors font-medium">Terms</a>
            </div>
          </div>
          
          <div className="text-center mt-8 text-gray-300 text-sm">
            © The Middle, 2025
          </div>
        </div>
      </footer>
    </div>
  );
}