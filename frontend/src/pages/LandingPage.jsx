import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const LandingPage = () => {
  const features = [
    {
      title: 'Event Discovery',
      description: 'Browse and discover college events with advanced filtering and search capabilities.',
      icon: '🎯'
    },
    {
      title: 'Easy Registration',
      description: 'Register for events with just a few clicks and manage your event timeline.',
      icon: '📝'
    },
    {
      title: 'QR Attendance',
      description: 'Mark attendance using secure QR codes for seamless event check-ins.',
      icon: '📱'
    },
    {
      title: 'Digital Certificates',
      description: 'Receive verified digital certificates for attended events automatically.',
      icon: '🏆'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track participation metrics and event performance with detailed analytics.',
      icon: '📊'
    },
    {
      title: 'Club Management',
      description: 'Comprehensive tools for club admins to manage events and track engagement.',
      icon: '⚙️'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-xl text-gray-900">EventHub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
              Centralize Your College
              <span className="text-primary-600"> Event Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 text-balance">
              Streamline event discovery, registration, attendance, and feedback with our 
              comprehensive platform designed for modern college communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Managing Events
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Event Success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From event creation to certificate generation, our platform handles 
              every aspect of college event management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Events Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-100">Students Engaged</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Active Clubs</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gray-900 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Event Management?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of colleges already using EventHub to streamline 
              their event operations and boost student engagement.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-xl text-gray-900">EventHub</span>
            </div>
            <p className="text-gray-600">
              © 2024 EventHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage