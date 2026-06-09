import { useState } from 'react'
import { Bank, SealCheck, CurrencyDollar, ArrowRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import avatarPyae from '../assets/team/pyaesoneaung.jpg'
import avatarKaung from '../assets/team/kaungkhantlin.png'

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function BuilderAvatar({ name, src }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className="about-team-photo"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className="about-team-photo about-team-photo-fallback" aria-hidden="true">
      {getInitials(name)}
    </div>
  )
}

const phases = [
  {
    number: 1,
    title: 'Problem & Scope',
    description:
      'No reliable, unbiased source existed for students planning to study abroad. Scoped the platform to 3 countries and 3 core data points: cost, admission requirements, and legal rules.',
  },
  {
    number: 2,
    title: 'Research & Data Collection',
    description:
      'Pulled data from official university websites, government portals (MoE Taiwan, MoE Thailand, MOE Singapore), QS and THE rankings, and exchange rate references. All data points cross-referenced against at least two sources.',
  },
  {
    number: 3,
    title: 'Cleaning & Structuring',
    description:
      'Standardised currencies, GPA scales, and IELTS vs TOEFL thresholds across all three countries. Gaps were flagged and documented rather than filled with estimates. Singapore GPA data is one known gap in the current dataset.',
  },
  {
    number: 4,
    title: 'Backend & Tools',
    description:
      'FastAPI backend with endpoints for program scoring, admission analytics, cost summaries, and comparison. Program data stored in PostgreSQL with consistent schemas across countries for reliable cross-country queries.',
  },
  {
    number: 5,
    title: 'Frontend & Analytics',
    description:
      'React dashboard covering program comparison, cost calculator, recommendation engine, and analytics views. All data is fetched live from backend endpoints.',
  },
  {
    number: 6,
    title: 'Testing & Refinement',
    description:
      'Tested against real student scenarios across varying budgets, proficiency levels, and target countries. Gaps found in testing were documented. Updates planned for each new university intake period.',
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
    role: 'Data · Backend · Project Research',
    githubName: 'pyaesoneaung-Data',
    githubUrl: 'https://github.com/pyaesoneaung-Data',
    avatar: avatarPyae,
  },
  {
    name: 'Kaung Khant Lin',
    role: 'Data · Frontend · Implementation',
    githubName: 'Kinosaur',
    githubUrl: 'https://github.com/Kinosaur',
    avatar: avatarKaung,
  },
]

const stats = [
  { value: '3', label: 'Countries covered' },
  { value: '15', label: 'Programs in database' },
  { value: 'Apr 2026', label: 'Last verified' },
  { value: 'Beta MVP', label: 'Current status' },
]

function AboutPage() {
  return (
    <div className="page-stack">
      <div className="about-hero">
        <h1 className="about-hero-title">UniMatch</h1>
        <p className="about-hero-tagline">
          Compare universities in Taiwan, Thailand, and Singapore using verified data,
          not agent advice.
        </p>
      </div>

      <section id="mission" className="about-section-block" aria-labelledby="heading-mission">
        <div className="about-section-head">
          <h2 id="heading-mission">Mission</h2>
        </div>
        <p className="about-prose">
          UniMatch started from a real problem: students planning to study abroad were relying on
          agents and social media, both with clear conflicts of interest. This platform gives
          students direct access to actual costs, admission thresholds, and legal information,
          collected from official sources and structured into usable tools.
        </p>
        <dl className="about-stats-row">
          {stats.map((stat) => (
            <div key={stat.label} className="about-stat">
              <dt className="about-stat-label">{stat.label}</dt>
              <dd className="about-stat-value">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="features" className="about-section-block" aria-labelledby="heading-features">
        <div className="about-section-head">
          <h2 id="heading-features">What It Does</h2>
        </div>
        <div className="about-two-col">
          <div className="about-feature-card">
            <h3>Capabilities</h3>
            <ul className="about-feature-list">
              <li>Compare programs across universities</li>
              <li>Estimate real yearly costs, including tuition and living</li>
              <li>Review GPA and IELTS admission thresholds</li>
              <li>Understand visa and work permit rules by country</li>
              <li>Identify red flags in university offers</li>
            </ul>
          </div>
          <div className="about-feature-card">
            <h3>Who it&apos;s for</h3>
            <ul className="about-feature-list">
              <li>Students planning to study abroad in the region</li>
              <li>First-generation international applicants</li>
              <li>Families comparing cost and safety across countries</li>
              <li>Anyone who wants verified data instead of agent advice</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="methodology" className="about-section-block" aria-labelledby="heading-methodology">
        <div className="about-section-head">
          <h2 id="heading-methodology">Methodology</h2>
          <p className="muted-text">
            How this project was researched and built, phase by phase.
          </p>
        </div>
        <div className="about-phase-list">
          {phases.map((phase) => (
            <div key={phase.number} className="about-phase-card">
              <div className="about-phase-header">
                <span className="about-phase-number" aria-label={`Phase ${phase.number}`}>{phase.number}</span>
                <h3 className="about-phase-title">{phase.title}</h3>
              </div>
              <p className="about-phase-desc">{phase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="data" className="about-section-block" aria-labelledby="heading-data">
        <div className="about-section-head">
          <h2 id="heading-data">Data &amp; Sources</h2>
          <p className="muted-text">
            All data is collected from primary sources and reviewed for accuracy.
          </p>
        </div>
        <div className="about-sources-row">
          {sourceCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.title} className="about-source-card">
                <Icon size={20} className="about-source-icon" aria-hidden="true" />
                <div>
                  <h3>{card.title}</h3>
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

      <section id="team" className="about-section-block" aria-labelledby="heading-team">
        <div className="about-section-head">
          <h2 id="heading-team">Meet the Builders</h2>
          <p className="muted-text">Built collaboratively by two student contributors.</p>
        </div>
        <div className="about-team-grid">
          {builders.map((builder) => (
            <article key={builder.githubName} className="about-team-card">
              <BuilderAvatar name={builder.name} src={builder.avatar} />
              <div className="about-builder-info">
                <h3>{builder.name}</h3>
                <p className="muted-text">{builder.role}</p>
                <a
                  className="text-link"
                  href={builder.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`GitHub: ${builder.githubName} (opens in new tab)`}
                >
                  GitHub: {builder.githubName}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="about-closing">
        <p className="about-closing-text">
          Official data from government and university portals, updated each intake. Free to use.
        </p>
        <Link to="/" className="about-closing-cta">
          Start exploring
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export default AboutPage
