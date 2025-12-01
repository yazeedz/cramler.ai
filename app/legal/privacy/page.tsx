import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Cramler',
  description: 'Privacy Policy for Cramler educational platform',
}

export default function PrivacyPage() {
  return (
    <div className="h-screen bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective June 20, 2025</strong>
          </p>

          <p className="text-lg text-gray-700 mb-8">
            At Cramler Inc, we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, and share your personal information.
          </p>

          <p className="mb-8">
            This Privacy Policy ("<strong>Policy</strong>") describes how Cramler Inc ("<strong>Cramler</strong>", "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") collects, uses, and protects your personal information when you use our educational services, including our website, mobile applications, and related services (collectively, the "<strong>Services</strong>").
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Information You Provide</h3>
          <p className="mb-4">
            We collect information you voluntarily provide to us, including:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, date of birth, and other information you provide when creating an account</li>
            <li><strong>Educational Information:</strong> School name, grade level, courses of study, and academic goals</li>
            <li><strong>Profile Information:</strong> Profile photos, personal preferences, and study interests</li>
            <li><strong>Communication Data:</strong> Messages, questions, and feedback you send to us</li>
            <li><strong>Payment Information:</strong> Billing details for subscription services (processed securely by third-party payment processors)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Automatically Collected Information</h3>
          <p className="mb-4">
            We automatically collect certain information when you use our Services:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent studying, test scores, and progress metrics</li>
            <li><strong>Device Information:</strong> Device type, operating system, browser type, and mobile device identifiers</li>
            <li><strong>Log Data:</strong> IP address, access times, and pages requested</li>
            <li><strong>Location Data:</strong> General geographic location based on IP address (not precise location)</li>
            <li><strong>Cookies and Tracking:</strong> Information collected through cookies, web beacons, and similar technologies</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Educational Records</h3>
          <p className="mb-6">
            We collect and maintain educational records related to your use of our Services, including study progress, test results, learning analytics, and performance data. These records are protected under applicable educational privacy laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          
          <p className="mb-4">
            We use your personal information for the following purposes:
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Educational Services</h3>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Providing personalized study materials and recommendations</li>
            <li>Tracking your learning progress and performance</li>
            <li>Generating practice tests and assessments</li>
            <li>Providing feedback and explanations</li>
            <li>Creating custom study plans</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Account Management</h3>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Creating and maintaining your account</li>
            <li>Authenticating your identity</li>
            <li>Processing payments and subscriptions</li>
            <li>Providing customer support</li>
            <li>Sending important account notifications</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Service Improvement</h3>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Analyzing usage patterns to improve our Services</li>
            <li>Developing new features and educational content</li>
            <li>Conducting research to enhance learning effectiveness</li>
            <li>Ensuring platform security and preventing fraud</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Communications</h3>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Sending educational content and study reminders</li>
            <li>Providing updates about our Services</li>
            <li>Responding to your questions and requests</li>
            <li>Sending marketing communications (with your consent)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing and Disclosure</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">We Do Not Sell Personal Information</h3>
          <p className="mb-4">
            We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Limited Sharing</h3>
          <p className="mb-4">
            We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li><strong>Service Providers:</strong> With trusted third-party service providers who help us operate our Services (subject to strict confidentiality agreements)</li>
            <li><strong>Parents/Guardians:</strong> With parents or guardians of users under 18 years old, as permitted by law</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to affected users)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Aggregated Data</h3>
          <p className="mb-6">
            We may share aggregated, anonymized data that cannot identify individual users for research, analytics, and educational purposes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          
          <p className="mb-4">
            We implement comprehensive security measures to protect your personal information:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li><strong>Encryption:</strong> Data is encrypted in transit and at rest using industry-standard protocols</li>
            <li><strong>Access Controls:</strong> Strict access controls limit who can view your personal information</li>
            <li><strong>Regular Audits:</strong> We conduct regular security audits and assessments</li>
            <li><strong>Employee Training:</strong> Our employees receive privacy and security training</li>
            <li><strong>Incident Response:</strong> We have procedures in place to respond to security incidents</li>
          </ul>

          <p className="mb-6">
            Despite our security measures, no system is 100% secure. We encourage you to use strong passwords and protect your account credentials.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Student Privacy Rights</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Educational Privacy</h3>
          <p className="mb-4">
            We comply with applicable student privacy laws, including the Family Educational Rights and Privacy Act (FERPA) where applicable. Educational records are protected and disclosed only as permitted by law.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Children's Privacy</h3>
          <p className="mb-4">
            We comply with the Children's Online Privacy Protection Act (COPPA) for users under 13 years old:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>We obtain verifiable parental consent before collecting information from children under 13</li>
            <li>We limit the collection of information from children to what is necessary for educational purposes</li>
            <li>Parents can review, modify, or delete their child's information</li>
            <li>We do not condition a child's participation on providing more information than necessary</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Privacy Rights</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Access and Control</h3>
          <p className="mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of the personal information we have about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal restrictions)</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Opt-out:</strong> Opt out of marketing communications and certain data processing</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Exercising Your Rights</h3>
          <p className="mb-6">
            To exercise these rights, contact us through our website or through your account settings. We will respond to your request within 30 days and may require verification of your identity.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Types of Cookies</h3>
          <p className="mb-4">
            We use the following types of cookies and similar technologies:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Necessary for basic functionality and security</li>
            <li><strong>Performance Cookies:</strong> Help us understand how you use our Services</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Provide insights into user behavior and service performance</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Cookie Management</h3>
          <p className="mb-6">
            You can manage cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our Services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
          
          <p className="mb-4">
            We retain your personal information for as long as necessary to:
          </p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>Provide our Services to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
            <li>Maintain educational records as required by law</li>
          </ul>

          <p className="mb-6">
            When you delete your account, we will delete or anonymize your personal information within 90 days, except where retention is required by law.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. International Data Transfers</h2>
          
          <p className="mb-6">
            Our Services are based in the United States. If you are accessing our Services from outside the U.S., your information may be transferred to, stored, and processed in the United States. We ensure appropriate safeguards are in place for international data transfers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Third-Party Services</h2>
          
          <p className="mb-4">
            Our Services may contain links to third-party websites or integrate with third-party services. This Privacy Policy does not apply to those third-party services. We encourage you to review the privacy policies of any third-party services you use.
          </p>

          <p className="mb-6">
            We may use third-party analytics and advertising services that collect information about your use of our Services. These services are governed by their own privacy policies.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to This Privacy Policy</h2>
          
          <p className="mb-6">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by email or through our Services. Your continued use of our Services after such notice constitutes acceptance of the updated Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact Information</h2>
          
          <p className="mb-6">
            If you have questions about this Privacy Policy or our privacy practices, please contact us through our website.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Last updated: June 20, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}