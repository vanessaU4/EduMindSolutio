import React from 'react';
import { Sparkles, Heart, Zap, Star, ArrowRight, Users, BookOpen, Award } from 'lucide-react';

const SheNationsColorDemo: React.FC = () => {
  return (
    <div className="min-h-screen shenations-hero-bg">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-shenations-purple rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div 
          className="absolute top-40 right-10 w-72 h-72 bg-shenations-pink rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div 
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-shenations-indigo rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: '4s' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="shenations-badge mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-shenations-purple mr-2" />
              <span className="text-sm font-medium text-gray-700">
                She-Nations Color System Demo
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="block text-gray-900">Advanced Color System</span>
              <span className="block shenations-gradient-text">For EduMindSolutions</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Experience the beautiful She-Nations inspired color palette with advanced gradients, 
              animations, and modern design components.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
              <button className="shenations-button-primary group">
                Explore Colors
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="shenations-button-secondary">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Color Palette Showcase */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold shenations-gradient-text mb-4">Color Palette</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three primary colors working in harmony: Purple for creativity, Pink for empowerment, and Indigo for trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Purple Showcase */}
            <div className="shenations-card shenations-hover-lift">
              <div className="bg-shenations-purple w-16 h-16 rounded-2xl mb-6 mx-auto animate-glow"></div>
              <h3 className="text-2xl font-bold text-shenations-purple mb-4">Purple</h3>
              <p className="text-gray-600 mb-6">Creativity, wisdom, and transformation. The primary color representing innovation and growth.</p>
              <div className="flex flex-wrap gap-2">
                <div className="w-8 h-8 rounded bg-shenations-purple-100"></div>
                <div className="w-8 h-8 rounded bg-shenations-purple-300"></div>
                <div className="w-8 h-8 rounded bg-shenations-purple-500"></div>
                <div className="w-8 h-8 rounded bg-shenations-purple-600"></div>
                <div className="w-8 h-8 rounded bg-shenations-purple-800"></div>
              </div>
            </div>

            {/* Pink Showcase */}
            <div className="shenations-card shenations-hover-lift">
              <div className="bg-shenations-pink w-16 h-16 rounded-2xl mb-6 mx-auto animate-glow" style={{ animationDelay: '0.5s' }}></div>
              <h3 className="text-2xl font-bold text-shenations-pink mb-4">Pink</h3>
              <p className="text-gray-600 mb-6">Compassion, nurturing, and empowerment. The accent color symbolizing care and support.</p>
              <div className="flex flex-wrap gap-2">
                <div className="w-8 h-8 rounded bg-shenations-pink-100"></div>
                <div className="w-8 h-8 rounded bg-shenations-pink-300"></div>
                <div className="w-8 h-8 rounded bg-shenations-pink-500"></div>
                <div className="w-8 h-8 rounded bg-shenations-pink-600"></div>
                <div className="w-8 h-8 rounded bg-shenations-pink-800"></div>
              </div>
            </div>

            {/* Indigo Showcase */}
            <div className="shenations-card shenations-hover-lift">
              <div className="bg-shenations-indigo w-16 h-16 rounded-2xl mb-6 mx-auto animate-glow" style={{ animationDelay: '1s' }}></div>
              <h3 className="text-2xl font-bold text-shenations-indigo mb-4">Indigo</h3>
              <p className="text-gray-600 mb-6">Trust, stability, and professionalism. The complement color ensuring reliability and confidence.</p>
              <div className="flex flex-wrap gap-2">
                <div className="w-8 h-8 rounded bg-shenations-indigo-100"></div>
                <div className="w-8 h-8 rounded bg-shenations-indigo-300"></div>
                <div className="w-8 h-8 rounded bg-shenations-indigo-500"></div>
                <div className="w-8 h-8 rounded bg-shenations-indigo-600"></div>
                <div className="w-8 h-8 rounded bg-shenations-indigo-800"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Component Examples */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold shenations-gradient-text mb-4">Component Examples</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how the She-Nations color system enhances various UI components with modern design patterns.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Users, title: "Community", color: "purple", description: "Connect with like-minded individuals in our vibrant community." },
              { icon: BookOpen, title: "Learning", color: "pink", description: "Access comprehensive courses and educational resources." },
              { icon: Award, title: "Achievement", color: "indigo", description: "Earn certifications and track your progress." },
              { icon: Heart, title: "Wellness", color: "purple", description: "Focus on mental health and personal well-being." },
              { icon: Zap, title: "Innovation", color: "pink", description: "Discover cutting-edge tools and technologies." },
              { icon: Star, title: "Excellence", color: "indigo", description: "Strive for excellence in everything you do." }
            ].map((feature, index) => (
              <div key={feature.title} className="shenations-card shenations-hover-lift animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-shenations-${feature.color} rounded-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold text-shenations-${feature.color} mb-4`}>{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Button Showcase */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold mb-8 shenations-gradient-text">Button Variations</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="shenations-button-primary">Primary Button</button>
              <button className="shenations-button-secondary">Secondary Button</button>
              <button className="healthcare-button-primary">Healthcare Primary</button>
              <button className="healthcare-button-secondary">Healthcare Secondary</button>
            </div>
          </div>

          {/* Animation Showcase */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-8 shenations-gradient-text">Animation Effects</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="shenations-card animate-float">
                <div className="w-16 h-16 bg-shenations-purple rounded-full mx-auto mb-4"></div>
                <p className="text-sm font-medium">Float</p>
              </div>
              <div className="shenations-card animate-pulse-slow">
                <div className="w-16 h-16 bg-shenations-pink rounded-full mx-auto mb-4"></div>
                <p className="text-sm font-medium">Pulse</p>
              </div>
              <div className="shenations-card animate-glow">
                <div className="w-16 h-16 bg-shenations-indigo rounded-full mx-auto mb-4"></div>
                <p className="text-sm font-medium">Glow</p>
              </div>
              <div className="shenations-card animate-fade-in">
                <div className="w-16 h-16 shenations-gradient-bg rounded-full mx-auto mb-4"></div>
                <p className="text-sm font-medium">Fade In</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="shenations-cta-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="shenations-badge mb-8">
              <Sparkles className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-medium text-white">Ready to Implement</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Your Design
            </h2>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Implement the She-Nations color system in your components and create beautiful, 
              empowering user experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="shenations-button-secondary">
                View Documentation
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-shenations-purple transition-all duration-300">
                Explore Components
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SheNationsColorDemo;
