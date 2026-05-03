import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Clock3,
  Code2,
  DollarSign,
  Landmark,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Globe2,
} from 'lucide-react'

const missionCards = [
  {
    title: 'Mission',
    description: 'Help students make safer, more informed education decisions.',
    icon: Target,
  },
  {
    title: 'Focus',
    description: 'Transparent comparison, real cost, admissions, legal information.',
    icon: Search,
  },
  {
    title: 'Growth',
    description: 'Expanding beyond initial countries to more regions and more data over time.',
    icon: TrendingUp,
  },
]

const methodologySteps = [
  {
    step: 'Plan',
    description: 'Define scope, questions, and success metrics.',
  },
  {
    step: 'Collect',
    description: 'Gather data from official sources and trusted references.',
  },
  {
    step: 'Clean & Structure',
    description: 'Standardize, validate, and structure data for consistency.',
  },
  {
    step: 'Build & Analyze',
    description: 'Build tools and run analyses to generate insights.',
  },
  {
    step: 'Test & Improve',
    description: 'Test with real users and improve accuracy continuously.',
  },
]

const mvpCards = [
  {
    title: 'Real-Cost Calculator',
    description: 'Estimate total cost of attendance including living expenses.',
  },
  {
    title: 'Major Matcher',
    description: 'Find majors and programs that fit your goals.',
  },
  {
    title: 'Legal Guardrail Dashboard',
    description: 'Understand visas, work rules, and policy requirements.',
  },
  {
    title: 'Accessibility Filters',
    description: 'Filter by language, accommodation, and campus support.',
  },
  {
    title: 'Red Flag Guide',
    description: 'Spot risks early with our red flag checklist.',
  },
]

const platformFacts = [
  {
    label: 'Countries covered (initial)',
    value: 'Starting point, not the final scope',
    icon: Globe2,
  },
  {
    label: 'Core stack',
    value: 'FastAPI + React + PostgreSQL',
    icon: Code2,
  },
  {
    label: 'Dataset verification',
    value: 'April 2026',
    icon: ShieldCheck,
  },
  {
    label: 'Project status',
    value: 'Beta MVP',
    icon: Clock3,
  },
]

const builders = [
  {
    name: 'Pyae Sone Aung',
    role: 'Data / Analytics / Project Research',
    githubName: 'pyaesoneaung-Data',
    githubUrl: 'https://github.com/pyaesoneaung-Data',
  },
  {
    name: 'Zaw Myo Aung',
    role: 'Frontend / UI / Implementation',
    githubName: 'Kinosaur',
    githubUrl: 'https://github.com/Kinosaur',
  },
]

const sourceCards = [
  {
    title: 'Official Sources',
    description: 'Universities, government portals, and regulators.',
    icon: Landmark,
  },
  {
    title: 'Rankings',
    description: 'Trusted rankings and accreditation databases.',
    icon: BadgeCheck,
  },
  {
    title: 'Exchange Rates',
    description: 'Verified FX providers for accurate conversions.',
    icon: DollarSign,
  },
]

function AboutPage() {
  return (
    <div className="page-stack about-page" id="top">
      <section className="about-hero">
        <div className="about-photo-placeholder about-photo-placeholder-hero">
          <span>Hero Photo Placeholder — graduating students / studying abroad / campus skyline</span>
        </div>

        <div className="about-hero-copy">
          <h1>
            About <span className="about-accent">UniMatch</span>
          </h1>
          <p className="about-lead">
            A student-built platform helping students compare universities using verified data, not marketing hype.
          </p>
          <p className="about-supporting-copy">
            Built to start with verified data and designed to expand across many countries over time.
          </p>

          <div className="about-hero-actions">
            <Link className="about-button about-button-primary" to="/">
              Explore Platform
            </Link>
            <a className="about-button about-button-secondary" href="#methodology">
              View Methodology
            </a>
          </div>
        </div>
      </section>

      <section className="about-card-grid about-mission-grid">
        {missionCards.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.title} className="about-card about-icon-card">
              <div className="about-icon-circle" aria-hidden="true">
                <Icon size={26} strokeWidth={1.8} />
              </div>
              <div className="about-card-copy">
                <h2 className="about-card-title about-accent">{card.title}</h2>
                <p>{card.description}</p>
              </div>
            </article>
          )
        })}
      </section>

      <section className="about-two-column-section">
        <div className="about-section-copy">
          <h2>
            Why <span className="about-accent">UniMatch</span>?
          </h2>
          <p>
            UniMatch is a trustworthy comparison platform that helps students and families make confident education decisions with verified data, clear explanations, and practical tools.
          </p>

          <div className="about-photo-placeholder about-photo-placeholder-secondary">
            <span>Photo Placeholder — students researching together / comparing universities</span>
          </div>
        </div>

        <div className="about-stack">
          <article className="about-card" id="features">
            <h3 className="about-accent">What the platform does</h3>
            <ul className="about-list">
              <li>Compare programs across universities</li>
              <li>Estimate real costs (tuition + living)</li>
              <li>Summarize admission requirements</li>
              <li>Show legal / work guardrails (visas, policies)</li>
              <li>Organize verified information in one place</li>
            </ul>
          </article>

          <article className="about-card">
            <h3 className="about-accent">Who it is for</h3>
            <ul className="about-list">
              <li>First-generation students</li>
              <li>International applicants</li>
              <li>Families</li>
              <li>Anyone who wants verified university information</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="about-section" id="methodology">
        <div className="about-section-heading about-section-heading-centered">
          <h2>
            Our <span className="about-accent">Methodology</span>
          </h2>
        </div>

        <div className="about-methodology-grid">
          {methodologySteps.map((item, index) => (
            <article key={item.step} className="about-step-card">
              <span className="about-step-badge">{index + 1}</span>
              <h3>{item.step}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <p className="about-section-note about-section-note-centered">
          Designed to support ongoing data expansion across more countries and institutions.
        </p>
      </section>

      <section className="about-section" id="mvp">
        <div className="about-section-heading about-section-heading-centered">
          <h2>
            What&apos;s included in the <span className="about-accent">MVP</span>
          </h2>
        </div>

        <div className="about-card-grid about-mvp-grid">
          {mvpCards.map((card) => (
            <article key={card.title} className="about-card about-mvp-card">
              <div className="about-mini-placeholder" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-card-grid about-facts-grid">
        {platformFacts.map((fact) => {
          const Icon = fact.icon
          return (
            <article key={fact.label} className="about-fact-card">
              <div className="about-icon-circle about-icon-circle-small" aria-hidden="true">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div className="about-card-copy">
                <span className="about-fact-label">{fact.label}</span>
                <strong className="about-fact-value">{fact.value}</strong>
              </div>
            </article>
          )
        })}
      </section>

      <section className="about-section" id="team">
        <div className="about-section-heading about-section-heading-centered">
          <h2>Meet the Builders</h2>
          <p>Built collaboratively by student contributors.</p>
        </div>

        <div className="about-card-grid about-builders-grid">
          {builders.map((builder) => (
            <article key={builder.githubName} className="about-builder-card">
              <div className="about-avatar-placeholder" aria-hidden="true">
                <span>Profile Photo Placeholder</span>
              </div>

              <div className="about-builder-copy">
                <h3 className="about-accent">{builder.name}</h3>
                <p className="about-builder-role">{builder.role}</p>
                <p className="about-builder-link-row">
                  GitHub:{' '}
                  <a
                    className="about-inline-link"
                    href={builder.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {builder.githubName}
                  </a>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-sources-intro">
          <div className="about-section-heading">
            <h2 className="about-accent">Data &amp; Sources</h2>
          </div>

          <div className="about-sources-copy">
            <p className="about-section-intro">
              We collect data from official university websites, government portals, rankings providers, and exchange-rate references. Every dataset is reviewed and verified for reliability.
            </p>
            <p className="about-section-note">More sources and countries will be added over time.</p>
          </div>
        </div>

        <div className="about-card-grid about-sources-grid">
          {sourceCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.title} className="about-card about-icon-card">
                <div className="about-icon-circle about-icon-circle-small" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="about-card-copy">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="about-cta">
        <div className="about-cta-copy">
          <h2>Helping students choose with confidence</h2>
        </div>
        <Link className="about-button about-button-inverse" to="/">
          Start Exploring
        </Link>
      </section>

      <section className="about-footer">
        <div className="about-footer-grid">
          <div className="about-footer-column">
            <h3 className="about-accent">UniMatch</h3>
            <p>
              A student-built platform that brings transparency to university decisions through verified data and practical tools.
            </p>
          </div>

          <div className="about-footer-column">
            <h3>Platform</h3>
            <ul className="about-footer-list">
              <li><a className="about-footer-link" href="#top">About</a></li>
              <li><a className="about-footer-link" href="#features">Features</a></li>
              <li><a className="about-footer-link" href="#methodology">Methodology</a></li>
              <li><a className="about-footer-link" href="#mvp">MVP</a></li>
              <li><a className="about-footer-link" href="#team">Team</a></li>
            </ul>
          </div>

          <div className="about-footer-column">
            <h3>Support</h3>
            <ul className="about-footer-list">
              <li>Help Center</li>
              <li>FAQ</li>
              <li>Feedback</li>
              <li>Privacy Policy</li>
              <li>Terms of Use</li>
            </ul>
          </div>

          <div className="about-footer-column">
            <h3>Contact / Project</h3>
            <ul className="about-footer-list">
              <li>Email: contact@unimatch.app</li>
              <li>GitHub: unimatch-platform</li>
              <li>Location: Student Project</li>
              <li>Built for transparency</li>
            </ul>
          </div>
        </div>

        <p className="about-footer-bottom">© 2026 UniMatch | Student-built transparency platform</p>
      </section>
    </div>
  )
}

export default AboutPage
