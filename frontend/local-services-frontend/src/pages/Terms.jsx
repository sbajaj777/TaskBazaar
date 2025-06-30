import React from 'react';
import { Shield, FileText, Users, AlertTriangle } from 'lucide-react';

const Terms = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
        <p className="text-lg text-gray-600">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
            <p className="text-yellow-700">
              By using our TaskBazaar platform, you agree to be bound by these terms and conditions. 
              Please read them carefully before using our services.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            1. Platform Overview
          </h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              Our TaskBazaar platform ("Platform") connects customers with local service providers including 
              plumbers, electricians, watchmen, babysitters, mehandi designers, and other home and personal service professionals.
            </p>
            <p className="mb-4">
              We act as an intermediary platform and do not directly provide services. All services are performed by 
              independent service providers who register on our platform.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Registration & Accounts</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              <strong>For Customers:</strong> You may browse services without registration, but creating an account 
              allows you to save preferences, contact providers, and leave reviews.
            </p>
            <p className="mb-4">
              <strong>For Service Providers:</strong> You must register and verify your profile to offer services. 
              You are responsible for maintaining accurate information about your services, rates, and availability.
            </p>
            <p className="mb-4">
              All users must provide accurate information and are responsible for maintaining the security of their accounts.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Provider Responsibilities</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide accurate information about qualifications, experience, and services offered</li>
              <li>Honor quoted rates and service commitments made through the platform</li>
              <li>Maintain appropriate licenses and insurance as required by local regulations</li>
              <li>Conduct services professionally and safely</li>
              <li>Respond to customer inquiries in a timely manner</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Customer Responsibilities</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide accurate information about service requirements</li>
              <li>Communicate clearly with service providers about expectations</li>
              <li>Ensure safe working conditions for service providers</li>
              <li>Make payments as agreed with service providers</li>
              <li>Leave honest and fair reviews based on actual experiences</li>
              <li>Respect service providers' time and professional boundaries</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Platform Usage Rules</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4"><strong>Prohibited Activities:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Posting false or misleading information</li>
              <li>Harassing or discriminating against other users</li>
              <li>Using the platform for illegal activities</li>
              <li>Attempting to bypass the platform for direct transactions to avoid fees</li>
              <li>Creating fake reviews or manipulating ratings</li>
              <li>Sharing inappropriate or offensive content</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            6. Limitation of Liability
          </h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              Our platform serves as a marketplace connecting customers with independent service providers. 
              We do not employ service providers and are not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Quality of services provided</li>
              <li>Disputes between customers and service providers</li>
              <li>Damages or injuries occurring during service provision</li>
              <li>Payment disputes or non-payment issues</li>
              <li>Verification of service provider qualifications beyond basic profile checks</li>
            </ul>
            <p className="mb-4">
              Users engage with service providers at their own risk and are encouraged to verify credentials, 
              insurance, and references independently.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payments & Fees</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              Payment arrangements are made directly between customers and service providers. Our platform may 
              charge service providers a listing or transaction fee, which will be clearly communicated upon registration.
            </p>
            <p className="mb-4">
              We are not responsible for payment processing or disputes. All financial transactions occur directly 
              between customers and service providers.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Reviews & Ratings</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              Our review system helps maintain quality standards. Reviews must be:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Based on actual service experiences</li>
              <li>Honest and constructive</li>
              <li>Free from discriminatory or offensive language</li>
              <li>Relevant to the service provided</li>
            </ul>
            <p className="mb-4">
              We reserve the right to remove reviews that violate these guidelines or appear fraudulent.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacy & Data Protection</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              We collect and use personal information as outlined in our Privacy Policy. By using our platform, 
              you consent to our data collection and usage practices.
            </p>
            <p className="mb-4">
              We implement appropriate security measures but cannot guarantee absolute security of user data.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Dispute Resolution</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              For disputes between customers and service providers, we encourage direct communication first. 
              If needed, our support team can provide mediation assistance, but we cannot force resolution.
            </p>
            <p className="mb-4">
              Legal disputes should be resolved through appropriate local authorities and courts.
            </p>
          </div>
        </section>

        {/* Section 11 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Platform Modifications</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              We reserve the right to modify, suspend, or discontinue any aspect of our platform with reasonable notice. 
              We may also update these terms periodically.
            </p>
            <p className="mb-4">
              Continued use of the platform after changes constitutes acceptance of updated terms.
            </p>
          </div>
        </section>

        {/* Section 12 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              We may terminate or suspend accounts for violations of these terms. Users may also delete their 
              accounts at any time through their profile settings.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              For questions about these terms or platform-related issues, please contact us:
            </p>
            <div className="bg-white rounded p-4">
              <p><strong>Email:</strong> bajajshivam178@gmail.com</p>
              
              <p><strong>Phone:</strong> +91 7728058141</p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer Notice */}
      <div className="text-center mt-8 text-gray-600">
        <p>
          These terms are effective as of the date listed above and govern your use of our TaskBazaar platform.
        </p>
      </div>
    </div>
  </div>
);

export default Terms;