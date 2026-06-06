import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowRight, ShieldCheck, Zap, BarChart2, Users, FileText,
  CheckCircle, Globe, TrendingUp, Package, Star, ChevronRight
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold text-primary tracking-tight">VendorBridge</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#workflow" className="hover:text-text-primary transition-colors">How it Works</a>
            <a href="#stats"    className="hover:text-text-primary transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard"
                className="btn btn-primary flex items-center gap-2 text-sm">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register"
                  className="btn btn-primary text-sm flex items-center gap-2">
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #2D4A3E, transparent)' }} />
        <div className="absolute top-60 -left-40 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #B87333, transparent)' }} />

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Star size={12} fill="currentColor" /> Procurement Made Intelligent
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-6 tracking-tight">
            Simplify Your<br />
            <span className="text-primary">Vendor Procurement</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-text-secondary leading-relaxed mb-10">
            VendorBridge streamlines your entire procurement lifecycle — from RFQs and quotations
            to purchase orders and invoices — in one unified, intelligent platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn btn-primary px-8 py-3 text-base flex items-center gap-2 shadow-lg shadow-primary/20">
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
              <ArrowRight size={18} />
            </Link>
            <a href="#workflow"
              className="btn border border-border text-text-primary hover:border-primary hover:text-primary px-8 py-3 text-base flex items-center gap-2 transition-colors">
              See How It Works <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section id="stats" className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Vendors Managed',    value: '2,400+' },
            { label: 'RFQs Processed',     value: '18,000+' },
            { label: 'Cost Savings',        value: '23%' },
            { label: 'Faster Approvals',    value: '4×' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold text-primary font-mono mb-1">{value}</p>
              <p className="text-sm text-text-secondary font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Everything You Need</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              A complete procurement suite built for modern procurement teams.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="workflow" className="py-24 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">How It Works</h2>
            <p className="text-text-secondary">
              Your end-to-end procurement journey in four simple steps.
            </p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-border hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {steps.map((step, i) => (
                <StepCard key={step.title} step={i + 1} {...step} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-primary rounded-2xl p-12 relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #ffffff, transparent)' }} />
            <h2 className="text-4xl font-bold text-white mb-4 relative">
              Ready to Streamline Procurement?
            </h2>
            <p className="text-white/80 mb-8 relative">
              Join procurement teams that trust VendorBridge to manage their entire supply chain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link to="/register"
                className="bg-white text-primary font-semibold px-8 py-3 rounded-md hover:bg-white/90 transition-colors flex items-center gap-2">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="border border-white/40 text-white px-8 py-3 rounded-md hover:bg-white/10 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold text-primary">VendorBridge</span>
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} VendorBridge. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link to="/login"    className="hover:text-text-primary transition-colors">Login</Link>
            <Link to="/register" className="hover:text-text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ── Data ── */
const features = [
  {
    icon: FileText,
    title: 'Smart RFQ Management',
    desc: 'Create, publish and track Requests for Quotation with deadlines, line items, and automatic vendor notifications.',
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    icon: Users,
    title: 'Vendor Portal',
    desc: 'Onboard vendors, manage profiles, and compare quotations side-by-side for the best value.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-Level Approvals',
    desc: 'Configurable approval workflows ensure every PO is reviewed and sanctioned before commitment.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: Package,
    title: 'Purchase Orders',
    desc: 'Auto-generate POs from approved quotations with PDF export and full audit trails.',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: TrendingUp,
    title: 'Invoice Tracking',
    desc: 'Monitor invoice statuses, flag overdue payments, and send reminders automatically via email.',
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    icon: BarChart2,
    title: 'Analytics & Reports',
    desc: 'Deep insights into spending patterns, vendor performance, and procurement cycle times.',
    color: 'text-info',
    bg: 'bg-info/10',
  },
];

const steps = [
  { title: 'Create RFQ',     desc: 'Define requirements and set deadlines for vendor submissions.' },
  { title: 'Compare Bids',   desc: 'Receive quotations and evaluate them side-by-side.' },
  { title: 'Approve & Order', desc: 'Route through approvals, then auto-generate the PO.' },
  { title: 'Track Invoice',   desc: 'Monitor delivery, receive invoices, and close the loop.' },
];

/* ── Sub-components ── */
const FeatureCard = ({ icon: Icon, title, desc, color, bg }) => (
  <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all duration-300 group">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} className={color} />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ step, title, desc }) => (
  <div className="flex flex-col items-center text-center relative">
    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-primary/25 z-10 relative">
      {step}
    </div>
    <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
