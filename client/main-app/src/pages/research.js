import { FiBook, FiGlobe, FiCheckCircle, FiUsers, FiAward, FiTrendingUp, FiFileText, FiVideo, FiCalendar, FiTarget } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";

export default function Research() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const services = [
    {
      id: 1,
      title: "Research Publishing",
      description: "Publish your research findings through peer-reviewed journals and academic platforms.",
      points: [
        "Manuscript preparation & editing",
        "Journal selection guidance",
        "Submission strategy",
        "Peer review support",
        "Publication ethics guidance"
      ]
    },
    {
      id: 2,
      title: "International Conferences & Workshops",
      description: "Connect with global researchers and present your work at prestigious venues.",
      points: [
        "Conference identification",
        "Paper submission support",
        "Presentation preparation",
        "Poster design assistance",
        "Networking guidance"
      ]
    },
  ];

  const features = [
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: "Expert Review",
      description: "Get feedback from experienced researchers"
    },
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Connect with international research community"
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Ensure research meets publication standards"
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Career Growth",
      description: "Advance your academic profile"
    },
  ];

  const researchProcess = [
    {
      step: 1,
      title: "Consultation",
      description: "Discuss your research goals and objectives with our experts"
    },
    {
      step: 2,
      title: "Planning",
      description: "Develop a comprehensive research and publication strategy"
    },
    {
      step: 3,
      title: "Execution",
      description: "Conduct research with guidance and support"
    },
    {
      step: 4,
      title: "Documentation",
      description: "Prepare manuscripts and presentation materials"
    },
    {
      step: 5,
      title: "Submission",
      description: "Submit to journals or conferences"
    },
    {
      step: 6,
      title: "Success",
      description: "Publication or presentation at venues"
    },
  ];

  const stats = [
    { number: "500+", label: "Published Researchers" },
    { number: "200+", label: "Journals Partnered" },
    { number: "50+", label: "International Conferences" },
    { number: "95%", label: "Publication Success Rate" },
  ];

  const faqItems = [
    {
      question: "How long does the publication process take?",
      answer: "The timeline varies depending on the journal and research field. Typically, from submission to publication takes 3-12 months. We help expedite the process through proper preparation."
    },
    {
      question: "What is your publication success rate?",
      answer: "Our researchers have a 95% publication success rate through comprehensive support, proper manuscript preparation, and strategic journal selection."
    },
    {
      question: "Do you work with specific research fields?",
      answer: "Yes, we support research across all academic disciplines including STEM, social sciences, humanities, and professional fields."
    },
    {
      question: "What's included in the conference support?",
      answer: "We provide paper submission guidance, presentation preparation, poster design, abstract writing assistance, and networking support."
    },
    {
      question: "How much does research support cost?",
      answer: "Our pricing is flexible and based on your specific needs. We offer packages for manuscript preparation, conference support, and comprehensive research guidance."
    },
  ];

  const benefits = [
    "One-on-one mentoring with experienced researchers",
    "Access to publishing resources and templates",
    "Direct support throughout the entire process",
    "Networking opportunities with global researchers",
    "Career advancement through publications",
    "Professional development workshops",
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 to-gray-900">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Advance Your <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Research Career</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Transform your research into published work. Get expert guidance on publication, conferences, and building your academic profile globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                  Start Your Research Journey
                </button>
              </Link>
              <button className="px-8 py-4 bg-[#1E1E2E] text-white font-bold rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-[#1a1a2e]/50 rounded-lg border border-purple-500/20">
                <p className="text-3xl md:text-4xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 md:px-6 bg-[#0F0F0F]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Research Services</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive support for every stage of your research and publication journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#1a1a2e] rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-purple-600/20 rounded-lg">
                    {service.id === 1 ? (
                      <FiFileText size={32} className="text-purple-400" />
                    ) : (
                      <FiGlobe size={32} className="text-purple-400" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-3">
                  {service.points.map((point, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <FiCheckCircle className="text-purple-400 w-5 h-5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Our Platform ?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-[#1a1a2e] rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all text-center">
                <div className="text-purple-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Process */}
      <section className="py-20 px-4 md:px-6 bg-[#0F0F0F]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">6-Step Process</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From research to publication, we guide you at every step
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchProcess.map((item, index) => (
              <div key={index} className="relative">
                {index < researchProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-20 -right-3 w-6 h-1 bg-linear-to-r from-purple-600 to-pink-600"></div>
                )}
                <div className="bg-[#1a1a2e] rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all relative z-10">
                  <div className="w-12 h-12 bg-linear-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-white font-bold mb-2 text-lg">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Researchers <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Choose Us ?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Join thousands of successful researchers who have published their work in top-tier journals and presented at international conferences.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-400 w-6 h-6 mt-1 shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link href="/contact">
                <button className="px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                  Get Personalized Guidance
                </button>
              </Link>
            </div>

            <div className="bg-[#1a1a2e] rounded-xl p-8 border border-purple-500/20">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <FiTarget className="text-purple-400 w-8 h-8 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Goal-Oriented</h3>
                    <p className="text-gray-400 text-sm">Customized plans based on your research and career goals</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <FiUsers className="text-purple-400 w-8 h-8 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Expert Mentors</h3>
                    <p className="text-gray-400 text-sm">Learn from experienced researchers and published authors</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <FiVideo className="text-purple-400 w-8 h-8 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Flexible Learning</h3>
                    <p className="text-gray-400 text-sm">Online sessions, resources, and 24/7 support available</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <FiAward className="text-purple-400 w-8 h-8 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Proven Results</h3>
                    <p className="text-gray-400 text-sm">95% publication success rate among our researchers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-6 bg-[#0F0F0F]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-[#1a1a2e] rounded-lg border border-purple-500/20 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#2a2a3e]/50 transition-all"
                >
                  <h3 className="text-white font-semibold text-left">{item.question}</h3>
                  <span className={`text-purple-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 py-4 bg-[#2a2a3e]/30 text-gray-400 border-t border-purple-500/20">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-12 border border-purple-500/30">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Publish Your <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Research?</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Get personalized guidance from our research experts and join hundreds of successfully published researchers
            </p>
            <Link href="/contact">
              <button className="px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 inline-flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                Schedule Free Consultation
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}