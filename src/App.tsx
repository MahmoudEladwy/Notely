import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, BarChart3, Settings, Bell, Search, Upload, Play, Pause, 
  Download, Share2, CheckCircle2, Clock, ChevronLeft, Menu, 
  ArrowRight, Star, FileText, Target, Award 
} from 'lucide-react';
import { format } from 'date-fns';

type Page = 
  | 'landing' 
  | 'login' 
  | 'signup' 
  | 'dashboard' 
  | 'upload' 
  | 'meeting' 
  | 'pricing' 
  | 'settings' 
  | 'notifications' 
  | 'notfound';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  status: 'completed' | 'processing';
  score: number;
}

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Q3 Pipeline Review with Acme Corp',
    date: '2025-01-15T10:00:00',
    duration: '47 min',
    participants: ['Sarah Chen', 'Michael Torres', 'Alex Rivera'],
    status: 'completed',
    score: 94,
  },
  {
    id: '2',
    title: 'Discovery Call - Vertex Solutions',
    date: '2025-01-14T14:30:00',
    duration: '32 min',
    participants: ['Jordan Lee', 'Priya Patel'],
    status: 'completed',
    score: 87,
  },
  {
    id: '3',
    title: 'Negotiation Session - Lumina Health',
    date: '2025-01-13T09:15:00',
    duration: '65 min',
    participants: ['Taylor Brooks', 'Casey Morgan', 'Sam Kim'],
    status: 'processing',
    score: 91,
  },
];

const mockTranscript = [
  { time: "00:12", speaker: "Sarah Chen", text: "Thanks for joining everyone. Let's start with the pipeline numbers for this quarter." },
  { time: "00:45", speaker: "Michael Torres", text: "We've closed 7 deals totaling $2.4M. The biggest one was with Acme at $980k." },
  { time: "01:22", speaker: "Alex Rivera", text: "I have a few follow ups from last week. The prospect at Vertex is very interested in our enterprise plan." },
  { time: "02:10", speaker: "Sarah Chen", text: "Excellent. Let's make sure to get that proposal sent by EOD tomorrow." },
];

const mockActionItems = [
  { id: 1, text: "Send proposal to Vertex Solutions by EOD tomorrow", completed: false, assignee: "Alex Rivera" },
  { id: 2, text: "Follow up with Lumina Health on pricing concerns", completed: true, assignee: "Sarah Chen" },
  { id: 3, text: "Schedule technical deep dive with Acme Corp engineering team", completed: false, assignee: "Michael Torres" },
];

const mockTopics = ["Pipeline Review", "Deal Negotiation", "Product Feedback", "Competitive Landscape", "Q4 Planning"];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(42);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'actions' | 'topics'>('transcript');
  const [actionItems, setActionItems] = useState(mockActionItems);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeetings, setFilteredMeetings] = useState(mockMeetings);

  // Simulate upload progress
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFiles(['acme_q3_review.mp3', 'vertex_discovery_call.webm']);
          setTimeout(() => {
            setCurrentPage('dashboard');
            setShowNotification(true);
          }, 800);
          return 100;
        }
        return prev + 12;
      });
    }, 180);
  };

  // Toggle action item
  const toggleActionItem = (id: number) => {
    setActionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Filter meetings
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMeetings(mockMeetings);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMeetings(
        mockMeetings.filter(m => 
          m.title.toLowerCase().includes(query) || 
          m.participants.some(p => p.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery]);

  // Auto progress for audio
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentPage === 'meeting') {
      interval = setInterval(() => {
        setProgress(prev => (prev + 1) % 100);
      }, 280);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentPage]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    if (page === 'meeting' && !selectedMeeting) {
      setSelectedMeeting(mockMeetings[0]);
    }
  };

  const resetToLanding = () => {
    setCurrentPage('landing');
    setSelectedMeeting(null);
    setIsPlaying(false);
    setProgress(42);
    setUploadedFiles([]);
    setSearchQuery('');
  };

  // Fake login handler
  const handleLogin = () => {
    setCurrentPage('dashboard');
  };

  const handleSignup = () => {
    setCurrentPage('dashboard');
  };

  const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tighter text-white">{title}</h1>
        {subtitle && <p className="text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const Button = ({ 
    children, 
    variant = "primary", 
    onClick,
    className = "" 
  }: { 
    children: React.ReactNode; 
    variant?: "primary" | "secondary" | "outline" | "ghost"; 
    onClick?: () => void;
    className?: string;
  }) => {
    const base = "px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.985]";
    
    const styles = {
      primary: "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700",
      outline: "border border-zinc-700 hover:bg-zinc-900 text-zinc-300",
      ghost: "text-zinc-400 hover:text-white hover:bg-zinc-900"
    };

    return (
      <button 
        onClick={onClick}
        className={`${base} ${styles[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  const StatCard = ({ icon: Icon, label, value, change }: { 
    icon: React.ElementType; 
    label: string; 
    value: string; 
    change?: string;
  }) => (
    <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 card-hover">
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-2xl bg-zinc-800">
          <Icon className="w-6 h-6 text-violet-400" />
        </div>
        {change && (
          <div className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
            <span>+{change}</span>
          </div>
        )}
      </div>
      <div className="mt-8">
        <div className="text-4xl font-semibold text-white tracking-tighter">{value}</div>
        <div className="text-sm text-zinc-500 mt-1">{label}</div>
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-screen-2xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-2xl tracking-tighter">notely</div>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <a href="#features" className="nav-link text-zinc-400 hover:text-white">Features</a>
            <a href="#demo" className="nav-link text-zinc-400 hover:text-white">Demo</a>
            <a href="#pricing" onClick={() => navigateTo('pricing')} className="nav-link text-zinc-400 hover:text-white">Pricing</a>
            <a href="#" className="nav-link text-zinc-400 hover:text-white">Resources</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigateTo('login')}>
              Log in
            </Button>
            <Button onClick={() => navigateTo('signup')}>
              Get started free
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="pt-28 pb-16 px-6 max-w-screen-2xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            NEW: CRM Auto-sync with Salesforce & Hubspot
          </div>
          
          <h1 className="text-7xl md:text-8xl font-semibold tracking-tighter leading-none mb-6">
            AI that turns<br />sales calls into<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">revenue</span>
          </h1>
          
          <p className="max-w-lg mx-auto text-xl text-zinc-400 mb-10">
            Automatically transcribe, summarize, and extract action items from every sales call. 
            Built for teams that close.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigateTo('dashboard')} className="text-lg px-10 py-4 text-base">
              Try for free <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button variant="secondary" onClick={() => navigateTo('upload')} className="text-lg px-8 py-4 text-base">
              <Upload className="w-5 h-5" /> Upload a demo call
            </Button>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-8 text-xs uppercase tracking-widest text-zinc-500">
              <div>Trusted at</div>
              <div className="flex items-center gap-8 opacity-75">
                <div className="font-mono text-lg">stripe</div>
                <div className="font-semibold">notion</div>
                <div>linear</div>
                <div className="font-mono">vercel</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST BAR */}
      <div className="border-y border-white/10 py-6 bg-zinc-900/50">
        <div className="max-w-screen-2xl mx-auto px-8 flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-60">
          {['Salesforce', 'HubSpot', 'Outreach', 'Gong', 'Zoom', 'Clari'].map((brand, i) => (
            <div key={i} className="font-medium tracking-wider text-sm">{brand}</div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="max-w-screen-2xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <div className="uppercase tracking-[3px] text-xs font-mono text-violet-400 mb-3">POWERFUL AI</div>
          <h2 className="text-5xl font-semibold tracking-tighter">Everything your sales team needs</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <FileText className="w-7 h-7" />,
              title: "Instant Transcripts",
              desc: "Hyper-accurate speech-to-text with speaker identification and filler word removal.",
              color: "indigo"
            },
            {
              icon: <Target className="w-7 h-7" />,
              title: "Smart Summaries",
              desc: "AI-generated executive summaries focused on buyer signals, objections, and next steps.",
              color: "violet"
            },
            {
              icon: <CheckCircle2 className="w-7 h-7" />,
              title: "Action Items",
              desc: "Automatically extracted tasks with assignees, due dates and CRM sync.",
              color: "emerald"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -8 }}
              className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-10 hover:border-violet-500/30 transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${feature.color}-500/10 to-transparent flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-3xl font-semibold tracking-tight mb-4">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              
              <div className="h-px bg-white/10 my-8" />
              
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="px-3 py-1 bg-white/5 rounded-lg">+87% faster follow-up</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PRODUCT PREVIEW */}
      <div id="demo" className="bg-black py-20">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-5/12">
              <div className="sticky top-24">
                <div className="inline px-4 py-2 text-xs rounded-3xl border border-white/10 bg-white/5">LIVE DEMO</div>
                <h2 className="text-6xl font-semibold tracking-tighter leading-none mt-6 mb-6">See how the magic happens</h2>
                <p className="text-xl text-zinc-400">Watch how Notely turns a 43 minute sales call into 4 action items, 12 insights, and a perfect CRM update in seconds.</p>
                
                <Button onClick={() => navigateTo('upload')} className="mt-8 px-8">
                  Upload your own recording <Upload className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="lg:w-7/12 relative">
              <div onClick={() => navigateTo('meeting')} className="cursor-pointer bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-11 bg-zinc-950 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/70"></div>
                  </div>
                  <div className="mx-auto text-[10px] font-mono text-zinc-500">notely.app/meeting/9382k • LIVE</div>
                </div>
                
                <div className="aspect-video bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:5px_5px]"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-inner">
                      <Play className="w-8 h-8 text-white ml-0.5" />
                    </div>
                    <div className="text-white/70 text-sm">Click to view full interactive demo</div>
                    <div className="text-[10px] text-zinc-500 mt-8">43:19 • Acme Corp • 3 participants</div>
                  </div>
                  
                  <div className="absolute bottom-8 left-8 right-8 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="bg-white h-2.5 w-3/5 rounded-full relative">
                      <div className="absolute -top-3 right-0 w-5 h-5 bg-white rounded-full shadow-xl flex items-center justify-center">
                        <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="max-w-screen-2xl mx-auto px-8 py-24 border-b border-white/10">
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <div className="text-violet-400 text-sm font-medium tracking-widest mb-4">TESTIMONIALS</div>
            <h2 className="text-5xl font-semibold tracking-tighter leading-none">Sales leaders love Notely</h2>
          </div>
          
          <div className="md:col-span-7 space-y-6">
            {[
              {
                quote: "Notely cut our follow-up time by 70%. The action items are so accurate our reps actually enjoy using it.",
                name: "Priya Sharma",
                role: "VP of Sales @ Lumina",
                avatar: "PS"
              },
              {
                quote: "The summaries are better than what my AEs write. The insights on buyer sentiment are scary good.",
                name: "Marcus Rivera",
                role: "Head of Revenue @ Vertex",
                avatar: "MR"
              }
            ].map((t, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <div className="text-2xl leading-tight tracking-tight text-zinc-200">“{t.quote}”</div>
                <div className="flex items-center gap-4 mt-10">
                  <div className="w-10 h-10 bg-zinc-700 rounded-2xl flex items-center justify-center text-xs font-mono tracking-widest">{t.avatar}</div>
                  <div>
                    <div>{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING TEASER */}
      <div id="pricing" className="max-w-screen-2xl mx-auto px-8 py-24">
        <div className="text-center mb-12">
          <div className="text-sm uppercase font-medium text-emerald-400 tracking-widest">Simple pricing. Real value.</div>
          <h2 className="text-5xl font-semibold tracking-tighter mt-3">Choose the plan that scales with your team</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: "29", desc: "Perfect for solo reps", cta: "Start free trial", popular: false },
            { name: "Growth", price: "79", desc: "Best for growing teams", cta: "Start free trial", popular: true },
            { name: "Enterprise", price: "Custom", desc: "For large revenue orgs", cta: "Talk to sales", popular: false }
          ].map((plan, index) => (
            <div key={index} className={`rounded-3xl p-8 border ${plan.popular ? 'border-violet-500 shadow-2xl shadow-violet-500/20 relative' : 'border-zinc-800'} bg-zinc-900 flex flex-col`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1 text-xs font-semibold bg-violet-600 rounded-full">MOST POPULAR</div>
              )}
              
              <div className="font-semibold text-2xl mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-6xl font-semibold tracking-tighter">${plan.price}</span>
                {plan.price !== "Custom" && <span className="text-zinc-400">/mo</span>}
              </div>
              
              <p className="text-zinc-400 mb-8 flex-1">{plan.desc}</p>
              
              <Button 
                variant={plan.popular ? "primary" : "secondary"} 
                onClick={() => navigateTo('pricing')}
                className="w-full"
              >
                {plan.cta}
              </Button>
              
              <ul className="mt-8 space-y-4 text-sm">
                {["Unlimited recordings", "AI summaries", "Action item extraction", "Export to CSV & PDF", "Slack alerts"].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/10 py-20 text-sm">
        <div className="max-w-screen-2xl mx-auto px-8 grid grid-cols-2 md:grid-cols-5 gap-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Mic className="text-white w-4 h-4" />
              </div>
              <span className="font-semibold text-xl tracking-tight">notely</span>
            </div>
            <div className="text-zinc-500 max-w-[170px]">AI Meeting Intelligence for modern sales teams.</div>
          </div>
          
          <div>
            <div className="uppercase text-xs tracking-widest text-zinc-500 mb-6">PRODUCT</div>
            <div className="space-y-4 text-zinc-400">
              <div onClick={() => navigateTo('dashboard')} className="hover:text-white cursor-pointer">Dashboard</div>
              <div onClick={() => navigateTo('upload')} className="hover:text-white cursor-pointer">Upload</div>
              <div onClick={() => navigateTo('meeting')} className="hover:text-white cursor-pointer">Meeting Viewer</div>
            </div>
          </div>
          
          <div>
            <div className="uppercase text-xs tracking-widest text-zinc-500 mb-6">COMPANY</div>
            <div className="space-y-4 text-zinc-400">
              <div className="hover:text-white cursor-pointer">About</div>
              <div className="hover:text-white cursor-pointer">Blog</div>
              <div className="hover:text-white cursor-pointer">Careers</div>
              <div onClick={() => navigateTo('pricing')} className="hover:text-white cursor-pointer">Pricing</div>
            </div>
          </div>
          
          <div>
            <div className="uppercase text-xs tracking-widest text-zinc-500 mb-6">RESOURCES</div>
            <div className="space-y-4 text-zinc-400">
              <div className="hover:text-white cursor-pointer">Help Center</div>
              <div className="hover:text-white cursor-pointer">Integrations</div>
              <div className="hover:text-white cursor-pointer">What's new</div>
              <div className="hover:text-white cursor-pointer">Contact sales</div>
            </div>
          </div>
          
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest mb-4">GET IN TOUCH</div>
              <a href="#" className="block text-white hover:underline">hello@notely.ai</a>
            </div>
            
            <div className="text-[10px] text-zinc-500">© {new Date().getFullYear()} Notely, Inc. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderLogin = () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left visual panel */}
        <div className="hidden md:flex flex-col justify-center h-full bg-zinc-900 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(at_30%_20%,rgba(129,140,248,0.15),transparent)]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 w-11 h-11 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-4xl tracking-tighter text-white">notely</div>
                <div className="text-xs text-indigo-400 -mt-1">SALES OS</div>
              </div>
            </div>
            
            <div className="max-w-xs">
              <h2 className="text-5xl font-semibold tracking-tighter leading-none mb-6 text-white">Welcome back to the most productive sales team on earth.</h2>
              <p className="text-zinc-400">Your last call summary is waiting. 3 action items need attention.</p>
            </div>
            
            <div className="mt-auto pt-12 text-xs flex items-center gap-4 text-zinc-500">
              <div className="flex -space-x-4">
                <div className="w-7 h-7 bg-zinc-700 border-2 border-zinc-900 rounded-2xl flex items-center justify-center text-[10px]">JD</div>
                <div className="w-7 h-7 bg-violet-600 border-2 border-zinc-900 rounded-2xl flex items-center justify-center text-[10px]">SP</div>
              </div>
              <div>2 teammates online right now</div>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-10 md:p-14">
          <div className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-zinc-400 mt-3">Enter your workspace to continue</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-400 block mb-2">Email address</label>
              <input type="email" defaultValue="maya@acmecorp.com" className="w-full bg-black border border-zinc-800 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none text-white" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Password</label>
                <span onClick={() => alert("Password reset flow would go here")} className="text-xs text-violet-400 hover:underline cursor-pointer">Forgot?</span>
              </div>
              <input type="password" defaultValue="••••••••••" className="w-full bg-black border border-zinc-800 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none text-white" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-500" />
              <span className="text-sm text-zinc-400">Keep me signed in</span>
            </label>

            <Button onClick={handleLogin} className="w-full py-4 text-base">Sign in to workspace</Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-zinc-500 bg-zinc-900 px-6">or continue with</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleLogin} className="flex items-center justify-center gap-3 border border-zinc-700 hover:bg-zinc-950 transition-colors h-14 rounded-2xl text-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button onClick={handleLogin} className="flex items-center justify-center gap-3 border border-zinc-700 hover:bg-zinc-950 transition-colors h-14 rounded-2xl text-sm">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[13px] font-bold">S</div>
                SSO
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500 mt-8">
            Don't have an account? <span onClick={() => navigateTo('signup')} className="text-violet-400 hover:underline cursor-pointer">Sign up free</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div onClick={resetToLanding} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-3xl tracking-tighter text-white">notely</span>
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">
          <h2 className="text-3xl font-semibold text-center mb-2">Create your workspace</h2>
          <p className="text-center text-zinc-400 text-sm mb-10">14-day free trial. No credit card required.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-xs tracking-wider mb-2">FULL NAME</label>
              <input type="text" placeholder="Taylor Kim" className="bg-zinc-950 border border-zinc-700 w-full rounded-2xl py-4 px-5 placeholder:text-zinc-500 focus:outline-none focus:border-violet-400" />
            </div>
            
            <div>
              <label className="block text-zinc-400 text-xs tracking-wider mb-2">WORK EMAIL</label>
              <input type="email" placeholder="you@company.com" className="bg-zinc-950 border border-zinc-700 w-full rounded-2xl py-4 px-5 placeholder:text-zinc-500 focus:outline-none focus:border-violet-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs tracking-wider mb-2">PASSWORD</label>
                <input type="password" placeholder="••••••••" className="bg-zinc-950 border border-zinc-700 w-full rounded-2xl py-4 px-5 placeholder:text-zinc-500 focus:outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs tracking-wider mb-2">CONFIRM</label>
                <input type="password" placeholder="••••••••" className="bg-zinc-950 border border-zinc-700 w-full rounded-2xl py-4 px-5 placeholder:text-zinc-500 focus:outline-none focus:border-violet-400" />
              </div>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer text-xs">
              <input type="checkbox" className="mt-0.5 accent-violet-500" defaultChecked />
              <span className="text-zinc-400">I agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span></span>
            </label>
            
            <Button onClick={handleSignup} className="w-full py-4 mt-4">Create free account</Button>
            
            <div className="text-xs text-center text-zinc-400 mt-6">
              Already have an account? <span className="text-white cursor-pointer hover:underline" onClick={() => navigateTo('login')}>Sign in</span>
            </div>
          </div>
        </div>
        
        <div className="text-center text-[10px] text-zinc-500 mt-8">Secured with enterprise-grade encryption</div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-zinc-800 bg-zinc-950 flex-shrink-0 overflow-hidden`}>
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div className="font-semibold tracking-tighter text-3xl">notely</div>
          </div>
        </div>
        
        <div className="px-3 pt-8">
          <div onClick={() => navigateTo('upload')} className="mx-3 mb-8 flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-amber-300 active:bg-white transition-all font-semibold py-3.5 rounded-3xl cursor-pointer">
            <Upload className="w-4 h-4" /> NEW MEETING
          </div>
          
          <div className="px-3 mb-2 text-xs font-mono tracking-widest text-zinc-500">CORE</div>
          
          <div onClick={() => navigateTo('dashboard')} className="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-white bg-white/10 mx-2 mb-1 cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </div>
          <div onClick={() => navigateTo('meeting')} className="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 mx-2 mb-1 cursor-pointer">
            <FileText className="w-4 h-4" />
            <span className="font-medium">All Meetings</span>
          </div>
          
          <div className="px-3 mt-8 mb-2 text-xs font-mono tracking-widest text-zinc-500">WORKSPACE</div>
          
          <div onClick={() => navigateTo('notifications')} className="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 mx-2 mb-1 cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="font-medium">Notifications</span>
            <div className="ml-auto bg-red-500 text-[10px] px-1.5 rounded">3</div>
          </div>
          <div onClick={() => navigateTo('settings')} className="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 mx-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            <span className="font-medium">Settings</span>
          </div>
        </div>
        
        <div className="absolute bottom-8 px-6 w-72">
          <div className="rounded-3xl bg-zinc-900 p-5 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center text-xs font-bold text-black">SK</div>
              <div className="leading-none">
                <div className="font-medium">Sam Kessler</div>
                <div className="text-zinc-500">Enterprise AE</div>
              </div>
            </div>
            
            <div className="h-px bg-white/10 my-6" />
            
            <div onClick={resetToLanding} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-xs cursor-pointer">
              <ChevronLeft className="w-3 h-3" /> BACK TO LANDING
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="h-16 border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-lg px-8 flex items-center justify-between z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="font-medium flex items-center gap-2">
              <span>Pipeline Q1 • </span> 
              <span className="text-emerald-400 text-sm font-mono">12 MEETINGS THIS WEEK</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-8 relative">
            <div className="absolute left-5 top-1/2 -mt-2 text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text" 
              placeholder="Search meetings, people, topics..." 
              className="w-full bg-zinc-800 border-none focus:ring-1 focus:ring-violet-400 h-11 pl-12 rounded-3xl text-sm placeholder:text-zinc-500" 
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div onClick={() => navigateTo('notifications')} className="relative cursor-pointer">
              <Bell className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-medium">3</div>
            </div>
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('settings')}>
              <div className="text-right text-sm">
                <div className="font-medium text-white">Maya Patel</div>
                <div className="text-[10px] text-emerald-400 -mt-0.5">Online</div>
              </div>
              <div className="w-8 h-8 bg-rose-200 text-rose-800 rounded-2xl flex items-center justify-center font-semibold">MP</div>
            </div>
            
            <Button variant="secondary" onClick={() => navigateTo('upload')} className="text-sm px-5 py-2">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          <PageHeader title="Good morning, Maya" subtitle="Here's what's happening with your deals this week" />
          
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={BarChart3} label="Meetings this month" value="27" change="4" />
            <StatCard icon={Target} label="Avg. call score" value="91.4" change="6" />
            <StatCard icon={Clock} label="Time saved" value="41h" change="12" />
            <StatCard icon={Award} label="Deals influenced" value="14" change="3" />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="font-medium flex items-center gap-4">
              RECENT MEETINGS
              <div className="text-xs bg-white/10 text-white px-3 py-1 rounded-3xl">LAST 30 DAYS</div>
            </div>
            
            <div onClick={() => navigateTo('meeting')} className="text-sm flex items-center gap-2 text-violet-400 cursor-pointer hover:text-violet-300">
              View all <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          
          {/* Meetings Table */}
          <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs font-mono text-zinc-500">
                  <th className="pl-8 py-5 font-normal">MEETING</th>
                  <th className="py-5 font-normal">DATE</th>
                  <th className="py-5 font-normal">PARTICIPANTS</th>
                  <th className="py-5 font-normal">DURATION</th>
                  <th className="py-5 font-normal text-center">SCORE</th>
                  <th className="pr-8 py-5 font-normal text-right"></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-800">
                {filteredMeetings.map((meeting) => (
                  <tr 
                    key={meeting.id} 
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      navigateTo('meeting');
                    }}
                    className="meeting-row hover:bg-zinc-800/70 cursor-pointer group"
                  >
                    <td className="pl-8 py-6">
                      <div className="font-medium text-white group-hover:text-violet-300 transition-colors">{meeting.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 font-mono">call_{meeting.id}.mp3</div>
                    </td>
                    <td className="py-6 text-zinc-400 text-sm">{format(new Date(meeting.date), 'MMM dd, yyyy')}</td>
                    <td className="py-6">
                      <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 3).map((p, i) => (
                          <div key={i} className="w-7 h-7 bg-zinc-700 border-2 border-zinc-900 rounded-2xl flex items-center justify-center text-[10px] text-white/70">{p.substring(0,1)}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-6 text-zinc-400">{meeting.duration}</td>
                    <td className="py-6 text-center">
                      <div className={`inline-block text-xs px-4 py-1 rounded-3xl font-medium ${meeting.score > 90 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                        {meeting.score}%
                      </div>
                    </td>
                    <td className="pr-8 text-right">
                      <div className="text-xs text-zinc-500 group-hover:text-zinc-300 font-mono">VIEW →</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* ACTIVITY FEED */}
          <div className="mt-16">
            <div className="flex justify-between items-baseline mb-6">
              <div className="uppercase text-xs tracking-[1px] font-medium">Latest AI Insights</div>
              <div className="text-xs text-violet-400">View full activity log →</div>
            </div>
            
            <div className="space-y-3">
              {[
                "Notely extracted 4 action items from the Acme discovery call. 1 marked urgent.",
                "Sarah closed the loop on the Vertex proposal. AI suggests next step: technical workshop.",
                "Lumina Health call summary published to shared Notion workspace.",
                "New objection handling playbook recommended based on patterns from last 3 calls."
              ].map((activity, index) => (
                <div key={index} className="flex gap-5 bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl px-6 py-5 text-sm">
                  <div className="text-emerald-400 mt-px">→</div>
                  <div className="flex-1 text-zinc-300">{activity}</div>
                  <div className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">just now</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => navigateTo('dashboard')} className="flex items-center text-sm text-zinc-400 hover:text-white">
            <ChevronLeft className="mr-1" /> Back
          </button>
          <div className="text-xl font-semibold tracking-tight">Upload new recording</div>
        </div>
        
        <div 
          onClick={simulateUpload}
          className="border border-dashed border-zinc-700 hover:border-violet-400 transition-all rounded-3xl h-96 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
        >
          {isUploading ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-8 border-4 border-zinc-700 border-t-violet-500 animate-spin rounded-full"></div>
              <div className="text-xl font-medium">Uploading audio...</div>
              <div className="text-sm text-zinc-400 mt-3">This usually takes 18 seconds</div>
              
              <div className="w-72 h-2.5 bg-zinc-800 rounded-full mx-auto mt-10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all" style={{width: `${uploadProgress}%`}}></div>
              </div>
              <div className="text-xs text-right text-zinc-500 w-72 mx-auto mt-1">{uploadProgress}%</div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-zinc-400" />
              </div>
              <div className="text-2xl font-medium mb-2">Drop your meeting audio here</div>
              <div className="text-zinc-400">or click to browse from computer</div>
              <div className="text-xs text-zinc-500 mt-12">Supports MP3, M4A, WAV • Max 250MB</div>
            </>
          )}
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <div className="text-sm uppercase tracking-widest text-zinc-400 mb-4">Recently uploaded</div>
            {uploadedFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 mb-3">
                <div className="flex items-center gap-4">
                  <FileText className="text-emerald-400" />
                  <div>
                    <div className="text-white">{file}</div>
                    <div className="text-xs text-emerald-400">Processed successfully • Ready for review</div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigateTo('meeting')}>Review notes</Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12 text-xs text-zinc-500">Your files are encrypted end-to-end and stored securely in the US.</div>
      </div>
    </div>
  );

  const renderMeetingDetails = () => {
    if (!selectedMeeting) return <div className="p-20 text-center text-zinc-400">No meeting selected</div>;

    return (
      <div className="h-screen bg-zinc-950 flex flex-col text-white overflow-hidden">
        {/* Meeting Header */}
        <div className="h-16 border-b border-zinc-800 bg-zinc-900 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('dashboard')} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
              <ChevronLeft className="w-4 h-4" /> All meetings
            </button>
            
            <div className="h-3.5 w-px bg-zinc-700 mx-2" />
            
            <div>
              <div className="font-semibold">{selectedMeeting.title}</div>
              <div className="text-xs text-zinc-500">{format(new Date(selectedMeeting.date), 'EEEE, MMMM dd • h:mm a')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-800 text-xs px-4 h-9 rounded-3xl">
              <div className={`w-2 h-2 rounded-full ${selectedMeeting.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
              <span>{selectedMeeting.status.toUpperCase()}</span>
            </div>
            
            <Button variant="outline" onClick={() => {}}>
              <Download className="w-4 h-4" /> Export
            </Button>
            
            <Button onClick={() => setShowNotification(true)}>
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Info */}
          <div className="w-80 border-r border-zinc-800 bg-zinc-900 p-8 flex-shrink-0 hidden lg:block">
            <div className="uppercase text-xs text-zinc-500 mb-4 tracking-wider">PARTICIPANTS</div>
            
            {selectedMeeting.participants.map((participant, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-6 last:mb-0">
                <div className="w-9 h-9 bg-zinc-700 rounded-2xl flex items-center justify-center text-xs font-semibold ring-2 ring-offset-4 ring-offset-zinc-900 ring-zinc-800">
                  {participant.split(" ").map(n => n[0]).join('')}
                </div>
                <div>
                  <div>{participant}</div>
                  <div className="text-xs text-zinc-500">Sales • {idx === 0 ? 'Host' : 'Attendee'}</div>
                </div>
              </div>
            ))}
            
            <div className="my-12 h-px bg-zinc-800" />
            
            <div>
              <div className="uppercase text-xs tracking-widest text-zinc-500 mb-4">MEETING INSIGHTS</div>
              <div className="space-y-6 text-sm">
                <div className="flex justify-between items-center">
                  <div className="text-zinc-400">Sentiment</div>
                  <div className="text-emerald-400 font-medium">Very Positive</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-zinc-400">Objections raised</div>
                  <div>2</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-zinc-400">Next steps identified</div>
                  <div className="font-medium text-violet-400">4</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Audio Player */}
            <div className="h-20 border-b border-zinc-800 bg-zinc-900 px-8 flex items-center gap-6 flex-shrink-0">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 flex-shrink-0 bg-white text-zinc-950 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              
              <div className="flex-1">
                <div className="h-1 bg-zinc-700 rounded-full relative cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = ((e.clientX - rect.left) / rect.width) * 100;
                  setProgress(Math.max(0, Math.min(100, percent)));
                }}>
                  <div className="absolute h-1 bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                  <div className="absolute w-4 h-4 -mt-1.5 bg-white rounded-full shadow-xl left-[calc(42%-8px)]" style={{ left: `calc(${progress}% - 8px)` }}></div>
                </div>
              </div>
              
              <div className="font-mono text-xs text-zinc-400 w-20 text-right">{progress}%</div>
              
              <div className="text-xs px-4 py-2 bg-zinc-800 rounded-3xl text-white/70 flex items-center">
                {selectedMeeting.duration}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="px-8 pt-8 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center text-sm gap-8 font-medium">
                {(['transcript', 'summary', 'actions', 'topics'] as const).map((tab) => (
                  <div 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer pb-4 transition-all border-b-2 ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {tab === 'actions' ? 'Action Items' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 p-8 overflow-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'transcript' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="max-w-3xl mx-auto space-y-8"
                  >
                    {mockTranscript.map((line, index) => (
                      <div key={index} className="transcript-line flex gap-6 group rounded-2xl p-5 hover:bg-zinc-900 transition-all">
                        <div className="font-mono text-xs text-zinc-500 w-14 flex-shrink-0 pt-1">{line.time}</div>
                        <div>
                          <div className="text-xs uppercase text-violet-400 mb-1 tracking-widest font-medium">{line.speaker}</div>
                          <div className="leading-relaxed text-zinc-200">{line.text}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
                
                {activeTab === 'summary' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                  >
                    <div className="prose prose-invert max-w-none">
                      <h3 className="text-xl text-white mb-4 font-medium">Executive Summary</h3>
                      <p className="text-zinc-400 leading-relaxed">The team reviewed the Q3 pipeline and highlighted several key opportunities. The Acme Corp deal is very likely to close within the next 10 days. Vertex Solutions expressed interest in an enterprise license and will be receiving a custom proposal tomorrow. Several objections were raised about pricing which the team will address using the new playbook.</p>
                      
                      <div className="mt-12">
                        <div className="uppercase text-xs font-medium text-zinc-400 mb-4">KEY BUYING SIGNALS DETECTED</div>
                        <div className="grid grid-cols-2 gap-4">
                          {["Budget confirmed", "Technical win likely", "Champion identified", "Timeline: 21 days"].map((s,i) => (
                            <div key={i} className="bg-zinc-900 border-l-4 border-l-emerald-400 p-5 rounded-2xl text-sm">{s}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'actions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="text-sm text-zinc-400 mb-6">AI extracted the following tasks from the transcript. They have been synced to your linear and salesforce.</div>
                    
                    <div className="space-y-4">
                      {actionItems.map((item) => (
                        <div key={item.id} onClick={() => toggleActionItem(item.id)} className="flex gap-4 items-start bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 p-5 rounded-3xl cursor-pointer group">
                          <div className={`mt-1 w-6 h-6 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                            {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className={`${item.completed ? 'line-through text-zinc-400' : ''}`}>{item.text}</div>
                            <div className="text-xs mt-3 flex items-center gap-4">
                              <div className="bg-zinc-800 text-zinc-400 px-3 py-px rounded">Due in 3 days</div>
                              <div className="text-violet-400">Assigned to {item.assignee}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'topics' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                  >
                    <div className="flex flex-wrap gap-3">
                      {mockTopics.map((topic, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-700 px-7 py-4 rounded-3xl text-sm hover:border-violet-300 transition-all cursor-pointer">
                          #{topic}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-16 bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
                      <div className="text-xs uppercase font-medium mb-6 text-zinc-400">RECOMMENDED FOLLOW-UP EMAILS</div>
                      <div className="space-y-6">
                        <div className="p-5 bg-black/40 rounded-2xl text-sm">Thank you for a productive conversation. As discussed, attached is the enterprise pricing proposal for your review. Looking forward to your feedback by Friday.</div>
                        <div className="p-5 bg-black/40 rounded-2xl text-sm">Hi team, quick recap of our conversation today. We identified 3 major areas of improvement for your current CRM workflows...</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPricing = () => (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-xl mx-auto px-8 pt-16">
        <button onClick={resetToLanding} className="flex items-center text-sm mb-12 text-zinc-400 hover:text-zinc-200">
          ← Back to marketing site
        </button>
        
        <div className="text-center mb-16">
          <div className="inline-flex px-5 py-2 rounded-3xl bg-white/5 text-xs tracking-[0.125em]">BILLED ANNUALLY SAVE 25%</div>
          <h1 className="text-6xl font-semibold tracking-tighter mt-6">Simple, transparent pricing</h1>
          <p className="mt-4 max-w-xs mx-auto text-zinc-400">Scale with your team. Pause or cancel anytime.</p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-zinc-900 rounded-3xl p-1 text-sm">
            <div onClick={() => setPricingPeriod('monthly')} className={`px-8 py-2.5 rounded-3xl cursor-pointer transition-all ${pricingPeriod === 'monthly' ? 'bg-zinc-700 shadow-inner' : ''}`}>Monthly</div>
            <div onClick={() => setPricingPeriod('yearly')} className={`px-8 py-2.5 rounded-3xl cursor-pointer transition-all ${pricingPeriod === 'yearly' ? 'bg-zinc-700 shadow-inner' : ''}`}>Yearly <span className="text-emerald-400 text-xs ml-1">(−25%)</span></div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tier: "Starter", monthly: 29, yearly: 22, users: "1", color: "" },
            { tier: "Team", monthly: 79, yearly: 59, users: "5", color: "border-violet-400 shadow-2xl shadow-violet-500/30 scale-[1.04] z-10", badge: "RECOMMENDED" },
            { tier: "Business", monthly: 179, yearly: 139, users: "20", color: "" }
          ].map((plan, i) => (
            <div key={i} className={`rounded-3xl border border-zinc-700 p-8 flex flex-col ${plan.color}`}>
              {plan.badge && <div className="text-center -mt-4 mb-6"><span className="bg-violet-600 text-xs px-6 py-1 rounded-full">{plan.badge}</span></div>}
              
              <div className="font-semibold text-4xl">{plan.tier}</div>
              <div className="flex items-baseline gap-x-3 mt-8">
                <span className="text-7xl font-semibold tabular-nums tracking-tighter">${pricingPeriod === 'monthly' ? plan.monthly : plan.yearly}</span>
                <div className="text-sm text-zinc-400">per seat<br />{pricingPeriod}</div>
              </div>
              
              <Button 
                variant={i === 1 ? "primary" : "outline"} 
                className="mt-10 mb-8"
                onClick={() => alert(`Welcome to ${plan.tier} plan! (demo)`)}
              >
                Get started
              </Button>
              
              <ul className="space-y-4 text-sm mt-auto">
                <li className="flex gap-2"><CheckCircle2 className="text-emerald-400 w-4 h-4 mt-px" /> Unlimited AI transcriptions</li>
                <li className="flex gap-2"><CheckCircle2 className="text-emerald-400 w-4 h-4 mt-px" /> Smart summaries + insights</li>
                <li className="flex gap-2"><CheckCircle2 className="text-emerald-400 w-4 h-4 mt-px" /> {plan.users} users included</li>
                <li className="flex gap-2"><CheckCircle2 className="text-emerald-400 w-4 h-4 mt-px" /> Salesforce &amp; Linear sync</li>
                <li className="flex gap-2"><CheckCircle2 className="text-emerald-400 w-4 h-4 mt-px" /> Priority support</li>
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-24 border border-white/10 rounded-3xl p-8 md:p-16">
          <div className="max-w-md mx-auto text-center">
            <div className="uppercase text-xs font-medium mb-3 tracking-widest">ENTERPRISE</div>
            <h3 className="text-4xl font-semibold tracking-tight">Need something custom?</h3>
            <p className="mt-4 text-zinc-400">Dedicated infrastructure, custom SLAs, on-premise options, and more.</p>
            <Button className="mt-8" variant="secondary">Contact our sales team</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="h-screen bg-zinc-950 text-white overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
            <p className="text-zinc-400">Manage your profile and workspace preferences</p>
          </div>
          <button onClick={() => navigateTo('dashboard')} className="px-6 py-3 text-sm border border-zinc-700 rounded-2xl">Done</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar nav */}
          <div className="lg:col-span-3 space-y-1 text-sm">
            {["Profile", "Billing", "Notifications", "Team", "Appearance", "Integrations"].map(label => (
              <div key={label} className={`px-5 py-4 rounded-2xl cursor-pointer ${label === "Profile" ? "bg-white text-zinc-900" : "hover:bg-zinc-900"}`}>{label}</div>
            ))}
          </div>
          
          {/* Main form area */}
          <div className="lg:col-span-9 bg-zinc-900 rounded-3xl p-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-400 rounded-3xl flex items-center justify-center text-5xl font-light text-white">MP</div>
              <div>
                <div className="font-semibold text-3xl">Maya Patel</div>
                <div className="text-emerald-400">maya@notely.ai</div>
                <div className="text-xs mt-4 inline-block bg-white/10 px-4 py-2 rounded-3xl">Enterprise Customer</div>
              </div>
            </div>
            
            <div className="space-y-10">
              <div>
                <label className="block text-xs text-zinc-400 mb-3">DISPLAY NAME</label>
                <input defaultValue="Maya Patel" className="bg-zinc-950 w-full rounded-2xl px-7 py-5 outline-none border border-transparent focus:border-white/30" />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-400 mb-3">BIO</label>
                <textarea defaultValue="AE @ Notely. Closing enterprise deals and building delightful products." className="bg-zinc-950 w-full rounded-3xl px-7 py-5 outline-none border border-transparent focus:border-white/30 h-28 resize-y" />
              </div>
              
              <div className="pt-6 border-t border-zinc-700">
                <div className="text-xs uppercase text-red-400 tracking-widest mb-4">DANGER ZONE</div>
                <div className="border border-red-900/60 bg-red-950/30 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <div className="font-medium">Delete workspace</div>
                    <div className="text-xs text-red-300">This action cannot be undone. All data will be lost.</div>
                  </div>
                  <button onClick={() => alert("This would permanently delete the workspace in a real app.")} className="px-8 py-3 text-xs border border-red-400 text-red-400 rounded-2xl hover:bg-red-950">DELETE</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">Notifications</h1>
          <div className="flex gap-2 text-xs">
            <div className="bg-white text-black px-5 py-2 rounded-3xl cursor-pointer">All</div>
            <div className="px-5 py-2 rounded-3xl border border-zinc-700 cursor-pointer">Unread</div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { title: "New meeting summary ready", desc: "Q3 Pipeline Review with Acme Corp • 3 new action items", time: "11m ago", unread: true },
            { title: "Call score improved", desc: "Your average meeting score rose to 94 this week", time: "4h ago", unread: false },
            { title: "Sarah assigned you an action item", desc: "Follow up with legal on the new MSA", time: "Yesterday", unread: true }
          ].map((n, index) => (
            <div key={index} className={`p-6 rounded-3xl flex gap-6 border ${n.unread ? 'border-violet-400 bg-zinc-900' : 'border-zinc-800'}`}>
              <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-2xl flex items-center justify-center">
                {n.unread ? <Bell className="w-4 h-4 text-violet-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-lg">{n.title}</div>
                <div className="text-zinc-400 mt-1">{n.desc}</div>
                <div className="text-xs text-zinc-500 mt-5">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div onClick={() => navigateTo('dashboard')} className="mt-12 text-center text-xs text-zinc-400 underline cursor-pointer">Back to dashboard</div>
      </div>
    </div>
  );

  const render404 = () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-transparent tracking-tighter leading-none mb-6">404</div>
        <div className="text-2xl font-medium mb-3">Page not found</div>
        <p className="text-zinc-400 max-w-xs mx-auto">The page you are looking for doesn't exist or has been moved.</p>
        
        <Button onClick={resetToLanding} className="mt-10">Return to homepage</Button>
      </div>
    </div>
  );

  // Render correct page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return renderLanding();
      case 'login':
        return renderLogin();
      case 'signup':
        return renderSignup();
      case 'dashboard':
        return renderDashboard();
      case 'upload':
        return renderUpload();
      case 'meeting':
        return renderMeetingDetails();
      case 'pricing':
        return renderPricing();
      case 'settings':
        return renderSettings();
      case 'notifications':
        return renderNotifications();
      case 'notfound':
        return render404();
      default:
        return renderLanding();
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {renderCurrentPage()}
      </AnimatePresence>

      {/* Global notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-8 right-8 bg-zinc-900 border border-emerald-400 text-emerald-400 rounded-3xl px-6 py-4 shadow-2xl flex items-center gap-3 z-[999]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <div>
              Meeting processed successfully.<br />
              <span className="text-xs text-emerald-300">Acme Corp pipeline review is ready</span>
            </div>
            <button onClick={() => setShowNotification(false)} className="ml-6 text-xs px-4 py-2 bg-emerald-900 rounded-2xl">DISMISS</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
