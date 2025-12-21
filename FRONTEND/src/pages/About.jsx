import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            About SkillSwap
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connecting learners and mentors worldwide through innovative technology and collaborative learning experiences.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="glass p-8 rounded-2xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed text-center">
              SkillSwap is a revolutionary platform designed to democratize education and skill development.
              We believe that everyone should have access to quality learning experiences, regardless of their
              location, background, or financial status. Our platform connects passionate learners with experienced
              mentors, creating a global community of knowledge sharing and skill development.
            </p>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-center mb-12 text-purple-400">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-xl text-center"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Community</h3>
              <p className="text-gray-300">Connect with learners and mentors from around the world in our diverse community.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-xl text-center"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Skill Matching</h3>
              <p className="text-gray-300">Advanced algorithms match you with the perfect learning partners based on your goals.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-xl text-center"
            >
              <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.22 2.22a.75.75 0 0 1 1.06 0L10 8.94l6.72-6.72a.75.75 0 1 1 1.06 1.06L11.06 10l6.72 6.72a.75.75 0 0 1-1.06 1.06L10 11.06l-6.72 6.72a.75.75 0 0 1-1.06-1.06L8.94 10 2.22 3.28a.75.75 0 0 0-1.06-1.06z" clipRule="evenodd" transform="rotate(45 10 10)" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Calls</h3>
              <p className="text-gray-300">Seamless video communication for interactive learning sessions and mentorship.</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Developers Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-center mb-12 text-pink-400">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-8 rounded-xl text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold">
                JG
              </div>
              <h3 className="text-2xl font-semibold mb-2">Jayesh Gayri</h3>
              <p className="text-gray-300 mb-4">Full Stack Developer</p>
              <p className="text-sm text-gray-400">Passionate about creating innovative solutions and user-centric applications.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-8 rounded-xl text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold">
                HS
              </div>
              <h3 className="text-2xl font-semibold mb-2">Haridrumad Singh Jhala</h3>
              <p className="text-gray-300 mb-4">Frontend Developer</p>
              <p className="text-sm text-gray-400">Expert in creating beautiful and responsive user interfaces with modern technologies.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass p-8 rounded-xl text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold">
                PJ
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pankaj Joshi</h3>
              <p className="text-gray-300 mb-4">Backend Developer</p>
              <p className="text-sm text-gray-400">Specialized in building robust server architectures and scalable APIs.</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="glass p-8 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-green-400">Get In Touch</h2>
            <p className="text-lg text-gray-300 mb-8">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                View Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}