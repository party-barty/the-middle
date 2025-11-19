import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Heart, Navigation, Map, Target, Utensils, Zap } from 'lucide-react';
import { sessionStore } from '@/lib/session-store';

export default function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateSession = () => {
    if (!name.trim()) return;
    const session = sessionStore.createSession(name);
    const participant = session.participants[0];
    navigate(`/session/${session.id}?participantId=${participant.id}`);
  };

  const handleJoinSession = () => {
    if (!name.trim() || !sessionCode.trim()) return;
    const participant = sessionStore.joinSession(sessionCode.toUpperCase(), name);
    if (participant) {
      navigate(`/session/${sessionCode.toUpperCase()}?participantId=${participant.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90"></div>
        
        {/* Ad Unit - Desktop Leaderboard (Above Fold) */}
        <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 w-[728px] h-[90px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm z-10">
          Ad Space 728x90
        </div>

        {/* Ad Unit - Mobile Half Banner (Above Fold) */}
        <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-[234px] h-[60px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-xs z-10">
          Ad 234x60
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 md:pt-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Meet Me in The Middle
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
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
              className="h-14 px-8 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold text-lg"
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
              className="h-14 px-8 border-2 font-semibold text-lg"
            >
              Join a Session
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            How The Middle Makes Meetups Easy
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Navigation className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Step 1: Share Your Location (or Set One)
              </h3>
              <p className="text-gray-600 text-lg">
                Choose real-time location or manually set where you'll be — perfect for planning ahead or coordinating travel.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Step 2: See Your Midpoint
              </h3>
              <p className="text-gray-600 text-lg">
                We instantly calculate the fair middle point for everyone in your group and display it on a shared map.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Step 3: Swipe to Decide
              </h3>
              <p className="text-gray-600 text-lg">
                Browse venue recommendations near the midpoint. Swipe right to approve, left to skip. When everyone swipes right on the same place… you have a match!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            Designed for Easier Meetups
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <div className="text-4xl mb-3">📍</div>
                <CardTitle className="text-xl">Flexible Location Input</CardTitle>
                <CardDescription className="text-base">
                  Use live GPS or manually set a location. Ideal for planning future trips.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <div className="text-4xl mb-3">🗺️</div>
                <CardTitle className="text-xl">Map-Based Friend View</CardTitle>
                <CardDescription className="text-base">
                  See everyone's position on the map with live/manual indicators.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <div className="text-4xl mb-3">🎯</div>
                <CardTitle className="text-xl">Smart Midpoint Finder</CardTitle>
                <CardDescription className="text-base">
                  The fairest place to meet, calculated automatically — with the option to lock it.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <div className="text-4xl mb-3">🍽️</div>
                <CardTitle className="text-xl">Venue Recommendations</CardTitle>
                <CardDescription className="text-base">
                  Get curated spots near the midpoint using Google Places data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <div className="text-4xl mb-3">🧡</div>
                <CardTitle className="text-xl">Swipe-to-Match</CardTitle>
                <CardDescription className="text-base">
                  A fun, familiar swipe interface that leads to quick group decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <div className="text-4xl mb-3">⚡</div>
                <CardTitle className="text-xl">Real-Time Sessions</CardTitle>
                <CardDescription className="text-base">
                  Everyone sees every update instantly. No accounts required for your first session.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
            Why People Love The Middle
          </h2>
          
          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <p className="text-lg text-gray-700">
                <strong>Fast group decisions</strong> — no more endless texting or compromising.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <p className="text-lg text-gray-700">
                <strong>Fair for everyone</strong> — midpoint removes the guesswork.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <p className="text-lg text-gray-700">
                <strong>Great recommendations</strong> — powered by trusted Google data.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <p className="text-lg text-gray-700">
                <strong>Perfect for long-distance friends</strong> — plan ahead using manual locations.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <p className="text-lg text-gray-700">
                <strong>Works on any device</strong> — mobile-first, shareable, no app required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <p className="text-2xl md:text-3xl text-gray-800 italic mb-6">
              "We planned a meetup in under 30 seconds. No arguments, no stress — just vibes."
            </p>
            <p className="text-lg text-gray-600 font-semibold">
              — Early Beta User
            </p>
          </div>
        </div>
      </section>

      {/* Ad Unit - Desktop Leaderboard (Below Fold) */}
      <div className="hidden md:flex justify-center py-8 bg-gray-50">
        <div className="w-[728px] h-[90px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
          Ad Space 728x90
        </div>
      </div>

      {/* Ad Unit - Mobile MREC (Below Fold) */}
      <div className="md:hidden flex justify-center py-8 bg-gray-50">
        <div className="w-[300px] h-[250px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
          Ad Space 300x250
        </div>
      </div>

      {/* CTA Section */}
      <section id="get-started" className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Meet in the Middle?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {!showJoin ? (
              <>
                <Card className="border-none shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl">Create a Session</CardTitle>
                    <CardDescription>Start a new meetup and invite friends</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                      className="h-12"
                    />
                    <Button
                      onClick={handleCreateSession}
                      className="w-full h-12 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold"
                      disabled={!name.trim()}
                    >
                      Create Session
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl">Join a Session</CardTitle>
                    <CardDescription>Enter a session code to join friends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setShowJoin(true)}
                      variant="outline"
                      className="w-full h-12 border-2 font-semibold"
                    >
                      Join Existing Session
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-none shadow-xl bg-white md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Join a Session</CardTitle>
                  <CardDescription>Enter your name and session code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                  />
                  <Input
                    placeholder="Session code (e.g., ABC123)"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
                    className="h-12 uppercase"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleJoinSession}
                      className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold"
                      disabled={!name.trim() || !sessionCode.trim()}
                    >
                      Join Session
                    </Button>
                    <Button
                      onClick={() => setShowJoin(false)}
                      variant="outline"
                      className="h-12 px-8"
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
            className="text-white text-lg hover:text-white/80"
            onClick={() => {
              document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn how The Middle works →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">The Middle</span>
            </div>
            
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-rose-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-rose-400 transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="text-center mt-8 text-gray-400 text-sm">
            © The Middle, 2025
          </div>
        </div>
      </footer>
    </div>
  );
}
