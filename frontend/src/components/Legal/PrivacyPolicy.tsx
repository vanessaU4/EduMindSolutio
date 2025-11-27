import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl px-8 py-12 text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-blue-100 text-lg">EduMinds Solutions - Protecting Your Privacy</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              
              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Data Privacy & Security</h2>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <ul className="space-y-3 text-slate-700 leading-relaxed">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      The platform collects minimal information necessary to operate its services
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      No personally identifiable information (PII) is shared with third parties without user consent
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Assessment responses are stored securely and used solely for educational purposes
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      EduMinds follows industry-standard data protection protocols
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Information We Collect</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-slate-900 mb-3">Account Data</h4>
                    <ul className="space-y-2 text-slate-600">
                      <li>• Username and email address</li>
                      <li>• Profile preferences</li>
                      <li>• Account settings</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-slate-900 mb-3">Usage Data</h4>
                    <ul className="space-y-2 text-slate-600">
                      <li>• Assessment responses</li>
                      <li>• Platform interactions</li>
                      <li>• Anonymous analytics</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">How We Use Your Information</h2>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Service Delivery</h4>
                      <ul className="space-y-2 text-slate-600">
                        <li>• Personalized mental health resources</li>
                        <li>• Platform security and functionality</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Improvement</h4>
                      <ul className="space-y-2 text-slate-600">
                        <li>• Feature enhancement</li>
                        <li>• Educational content optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-amber-600 font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Your Rights</h2>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium text-slate-700">Access your data</span>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium text-slate-700">Request corrections</span>
                    </div>
                
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 rounded-b-2xl px-8 py-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-slate-600 mb-4 md:mb-0">
                <strong>EduMinds Solutions</strong> • Committed to your privacy and security
              </div>
              <div className="text-sm text-slate-500">
                Document version 1.0 • Last updated {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;