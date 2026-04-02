import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  TerminalSquare, 
  Network, 
  LayoutTemplate,
  ArrowRight,
  Code2
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    title: 'DSA Guidelines',
    description: 'Master Data Structures and Algorithms with curated notes and problems.',
    icon: <TerminalSquare className="w-8 h-8 text-orange-500" />,
    bgColor: 'bg-orange-500/10',
    borderColor: 'group-hover:border-orange-500/50'
  },
  {
    title: 'System Design',
    description: 'Complete LLD & HLD concepts to help you build scalable applications.',
    icon: <Network className="w-8 h-8 text-blue-500" />,
    bgColor: 'bg-blue-500/10',
    borderColor: 'group-hover:border-blue-500/50'
  },
  {
    title: 'CS Fundamentals',
    description: 'Deep dive into OS, DBMS, and Networking for core technical interviews.',
    icon: <BookOpen className="w-8 h-8 text-green-500" />,
    bgColor: 'bg-green-500/10',
    borderColor: 'group-hover:border-green-500/50'
  },
  {
    title: 'Interview Experiences',
    description: 'Real interview experiences, roadmaps, and last-minute revision guides.',
    icon: <LayoutTemplate className="w-8 h-8 text-purple-500" />,
    bgColor: 'bg-purple-500/10',
    borderColor: 'group-hover:border-purple-500/50'
  }
];

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full py-20 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Welcome to the ultimate tech blog
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Master Tech Concepts By <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-500">
              Intuition & Logic
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The best place to learn DSA, System Design, Core CS Fundamentals, and explore awesome articles on software engineering.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/signup" 
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
            >
              Start Reading <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Feature Cards Section */}
      <section className="w-full py-20 bg-muted/30 border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Explore Categories</h2>
            <p className="text-muted-foreground mt-2">Notes to help you crack SDE interviews and build better software.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${card.borderColor}`}
              >
                <div className={`mb-6 inline-flex p-3 rounded-xl ${card.bgColor}`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
                
                {/* Visual Arrow appears on hover */}
                <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center font-mono text-xl font-bold">
            <span className="text-primary mr-1">&lt;</span>
            BlogSpace
            <span className="text-primary ml-1">/&gt;</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BlogSpace. Inspiring the creative community.
          </p>
          <div className="flex space-x-6">
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
