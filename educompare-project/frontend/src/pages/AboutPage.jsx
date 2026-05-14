import { Bank, SealCheck, CurrencyDollar } from '@phosphor-icons/react'
import { useAppShell } from '../context/AppShellContext'
import IconImage from '../components/IconImage'
import logoLight from '../assets/logo/logo_light_without_text.svg'
import logoDark from '../assets/logo/logo_dark_without_text.svg'

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const phases = [
  {
    number: 1,
    title: 'Problem & Scope',
    description:
      'Identified that students planning to study abroad in the region had no reliable, unbiased source. Most relied on agents or social media, both of which have clear conflicts of interest. We defined what "verified" means for this project, then scoped the initial 3 countries and core data points: cost, admission requirements, and legal rules.',
  },
  {
    number: 2,
    title: 'Research & Data Collection',
    description:
      'Pulled data directly from official university websites, government education portals (MoE Taiwan, Ministry of Education Thailand, MOE Singapore), QS and THE rankings, and verified exchange rate references. Every data point was cross-referenced against at least two sources before inclusion.',
  },
  {
    number: 3,
    title: 'Cleaning & Structuring',
    description:
      'Standardised formats across all three countries: currencies, GPA scales, and IELTS versus TOEFL thresholds. Data gaps were flagged and documented honestly rather than filled with estimates. Singapore GPA data is one known gap in the current dataset.',
  },
  {
    number: 4,
    title: 'Backend & Tools',
    description:
      'Built a FastAPI backend with endpoints for program scoring, admission analytics, cost summaries, and comparison. All program data is stored in PostgreSQL with consistent schemas across countries, making cross-country comparison queries reliable and fast.',
  },
  {
    number: 5,
    title: 'Frontend & Analytics',
    description:
      'Built the React dashboard: program comparison, cost calculator, recommendation engine, and two analytics pages. Cost Overview covers tuition and living cost breakdown with monthly commitment figures. Admission Overview shows average GPA and IELTS thresholds per country with program-level tables.',
  },
  {
    number: 6,
    title: 'Testing & Refinement',
    description:
      'Tested against real student scenarios: varying budgets, different English proficiency levels, and different target countries. Data gaps identified in testing were documented. An update cycle is set for each new university intake period.',
  },
]

const sourceCards = [
  {
    title: 'Official Sources',
    description: 'University websites, government portals, and regulatory bodies.',
    icon: Bank,
  },
  {
    title: 'Rankings',
    description: 'QS and THE world rankings, plus accreditation databases.',
    icon: SealCheck,
  },
  {
    title: 'Exchange Rates',
    description: 'Verified exchange rate sources for accurate USD conversions.',
    icon: CurrencyDollar,
  },
]

const builders = [
  {
    name: 'Pyae Sone Aung',
    role: 'Data · Analytics · Project Research',
    githubName: 'pyaesoneaung-Data',
    githubUrl: 'https://github.com/pyaesoneaung-Data',
  },
  {
    name: 'Kaung Khant Lin',
    role: 'Frontend · UI · Implementation',
    githubName: 'Kinosaur',
    githubUrl: 'https://github.com/Kinosaur',
  },
]

const stats = [
  { value: '3', label: 'Countries covered' },
  { value: '15', label: 'Programs in database' },
  { value: 'Apr 2026', label: 'Data verified' },
  { value: 'Beta MVP', label: 'Current status' },
]

function AboutPage() {
  const { theme } = useAppShell()
  const logoSrc = theme === 'dark' ? logoDark : logoLight

  return (
    <div className="page-stack">
      <div className="about-hero">
        <div className="about-hero-brand">
          <IconImage src={logoSrc} alt="UniMatch logo" className="about-hero-logo" />
          <span className="about-hero-name">UniMatch</span>
        </div>
        <p className="about-hero-tagline">
          A student-built platform for comparing universities in Taiwan, Thailand, and Singapore,
          built on verified data rather than marketing.
        </p>
      </div>

      <section id="mission" className="about-section-block">
        <div className="about-section-head">
          <h3>Mission</h3>
        </div>
        <p className="about-prose">
          UniMatch started from a real problem: students planning to study abroad in the region
          were relying on agents and social media, both of which have obvious conflicts of
          interest. This platform gives students a direct source with actual costs, real admission
          thresholds, and honest legal information, all collected from official sources and
          structured into tools anyone can use.
        </p>
        <div className="about-stats-row">
          {stats.map((stat) => (
            <div key={stat.label} className="about-stat">
              <span className="about-stat-value">{stat.value}</span>
              <span className="about-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="about-section-block">
        <div className="about-section-head">
          <h3>Features</h3>
        </div>
        <div className="about-two-col">
          <div className="about-feature-card">
            <h4>What it does</h4>
            <ul className="about-feature-list">
              <li>Compare programs across universities</li>
              <li>Estimate real yearly costs, including tuition and living</li>
              <li>Review GPA and IELTS admission thresholds</li>
              <li>Understand visa and work permit rules by country</li>
              <li>Identify red flags in university offers</li>
            </ul>
          </div>
          <div className="about-feature-card">
            <h4>Who it&apos;s for</h4>
            <ul className="about-feature-list">
              <li>Students planning to study abroad in the region</li>
              <li>First-generation international applicants</li>
              <li>Families comparing cost and safety across countries</li>
              <li>Anyone who wants verified data instead of agent advice</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="methodology" className="about-section-block">
        <div className="about-section-head">
          <h3>Methodology</h3>
          <p className="muted-text">
            How this project was researched and built, phase by phase.
          </p>
        </div>
        <div className="about-phase-list">
          {phases.map((phase) => (
            <div key={phase.number} className="about-phase-card">
              <div className="about-phase-header">
                <span className="about-phase-number" aria-hidden="true">{phase.number}</span>
                <h4 className="about-phase-title">{phase.title}</h4>
              </div>
              <p className="about-phase-desc">{phase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="data" className="about-section-block">
        <div className="about-section-head">
          <h3>Data &amp; Sources</h3>
          <p className="muted-text">
            All data is collected from primary sources and reviewed for accuracy.
          </p>
        </div>
        <div className="about-sources-row">
          {sourceCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.title} className="about-source-card">
                <Icon size={20} strokeWidth={1.8} className="about-source-icon" aria-hidden="true" />
                <div>
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              </article>
            )
          })}
        </div>
        <p className="muted-text about-footnote">
          Additional countries and institutions are planned for future updates.
        </p>
      </section>

      <section id="team" className="about-section-block">
        <div className="about-section-head">
          <h3>Meet the Builders</h3>
          <p className="muted-text">Built collaboratively by two student contributors.</p>
        </div>
        <div className="about-team-grid">
          {builders.map((builder) => (
            <article key={builder.githubName} className="about-team-card">
              <div className="about-avatar" aria-hidden="true">{getInitials(builder.name)}</div>
              <div className="about-builder-info">
                <h4>{builder.name}</h4>
                <p className="muted-text">{builder.role}</p>
                <a
                  className="text-link"
                  href={builder.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub: {builder.githubName}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AboutPage
