import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-t-2xl px-8 py-12 text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11c0 .55.45 1 1 1h3v-6h6v6h3c.55 0 1-.45 1-1V7l-7-5zM8 16H6v-2h2v2zm0-4H6v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-indigo-100 text-lg">EduMinds Solutions - Service Agreement</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-indigo-100">Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="p-8 lg:p-12">
            
            {/* Important Notice */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl p-6 mb-12">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800 mb-2">Important Medical Disclaimer</h3>
                  <p className="text-amber-700 leading-relaxed">
                    EduMinds Solutions provides educational resources and self-assessment tools. 
                    <strong className="text-amber-800"> This platform does NOT provide medical diagnoses, therapy, or substitute professional mental health care.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              
              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">User Responsibilities</h2>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        Accurate Information
                      </h4>
                      <ul className="space-y-2 text-slate-600">
                        <li>• Provide truthful assessment responses</li>
                        <li>• Keep account information current</li>
                        <li>• Use platform for intended purposes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                        Respectful Use
                      </h4>
                      <ul className="space-y-2 text-slate-600">
                        <li>• Avoid harmful or inappropriate content</li>
                        <li>• Respect other users and staff</li>
                        <li>• No system disruption or hacking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Platform Obligations</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Quality Content & Services</h4>
                        <ul className="space-y-1 text-slate-600">
                          <li>• Age-appropriate mental health education</li>
                          <li>• User-friendly, accessible interface</li>
                          <li>• Early recognition support tools</li>
                          <li>• Continuous improvement based on feedback</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-red-600 font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Limitation of Liability</h2>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 text-red-700">Platform Limitations</h4>
                      <ul className="space-y-2 text-slate-600">
                        <li>• No medical diagnoses provided</li>
                        <li>• Not a substitute for professional care</li>
                        <li>• Educational guidance only</li>
                        <li>• Technical issues may occur</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 text-red-700">User Responsibility</h4>
                      <ul className="space-y-2 text-slate-600">
                        <li>• Seek professional help when needed</li>
                        <li>• Use information responsibly</li>
                        <li>• Understand platform limitations</li>
                        <li>• Make informed decisions</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
                    <p className="text-red-800 font-medium text-center">
                      ⚠️ Users assume full responsibility for how they apply platform information
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Account Termination</h2>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Access may be terminated for:</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <span className="text-slate-700 font-medium">Terms Violation</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <span className="text-slate-700 font-medium">Platform Misuse</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <span className="text-slate-700 font-medium">Harmful Behavior</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-amber-600 font-bold text-sm">5</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Emergency Resources</h2>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Crisis Support</h4>
                    <p className="text-slate-600 mb-4">If you're experiencing a mental health crisis, please contact:</p>
                    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <p className="font-semibold text-slate-900">National Suicide Prevention Lifeline</p>
                        <p className="text-2xl font-bold text-red-600">988</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <p className="font-semibold text-slate-900">Crisis Text Line</p>
                        <p className="text-lg font-bold text-blue-600">Text HOME to 741741</p>
                      </div>
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
                <strong>EduMinds Solutions</strong> • Supporting youth mental health education
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

export default TermsOfService;