import type { LegalDocument } from './types'

export const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  lastUpdated: 'July 10, 2026',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      paragraphs: [
        'This Privacy Policy describes how TextForge ("TextForge," "we," "us," or "our") collects, uses, and protects personal information when you use our website and AI-powered text transformation service (the "Service").',
        '[TODO: Insert legal entity name and registered business address — e.g., "TextForge is operated by [Company Name], located at [Address]."]',
        'By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.',
      ],
    },
    {
      id: 'ai-privacy-guarantee',
      title: 'Our Commitment: Your AI Content Stays Off Our Servers',
      highlight: true,
      paragraphs: [
        'When you use AI features (Assist, Structure, or Generate), the text you submit is transmitted to OpenAI for processing. TextForge does not store your AI input or AI-generated output on our servers after processing completes.',
        'We retain only usage metrics (such as token counts and request counts) and activity metadata (such as the action type and input/output formats — not the content itself). Your draft content may be saved locally in your browser; see the Cookies and Local Storage section below.',
      ],
    },
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      paragraphs: [
        'We collect the following categories of information depending on how you use the Service:',
      ],
      listItems: [
        'Account information: name, email address, email verification status, profile image (if provided via Google sign-in), subscription plan (Free or Pro), and account status.',
        'Authentication data: password hash (for email/password accounts) and OAuth tokens when you sign in with Google.',
        'Session information: session tokens stored in cookies, and optionally your IP address and browser user agent stored with your session record.',
        'Billing information: Stripe customer ID, subscription status, billing period dates, and related subscription metadata. Payment card details are processed directly by Stripe; TextForge does not store card numbers.',
        'Usage metrics: daily and monthly token counts, request counts, and per-feature usage counters (Assist, Structure, Generate).',
        'Activity history metadata: action type (convert, structure, or generate), input and output formats, and timestamp. We do not store the text content of your conversions or AI interactions.',
        'Browser local storage: theme preference and draft input/output text stored on your device (see Cookies and Local Storage).',
        'Communications: emails we send to you (verification, email change confirmation, payment notifications) and any messages you send to our support team.',
      ],
    },
    {
      id: 'how-we-use-information',
      title: 'How We Use Your Information',
      paragraphs: ['We use the information we collect to:'],
      listItems: [
        'Provide, operate, and maintain the Service, including format conversion, AI features, and usage history.',
        'Create and manage your account, authenticate you, and verify your email address.',
        'Enforce plan limits (token limits, request limits, input length limits, and history record limits).',
        'Process subscriptions and payments through Stripe.',
        'Send transactional emails such as email verification, email change confirmation, and payment notifications via Resend.',
        'Protect the security and integrity of the Service, prevent abuse, and comply with legal obligations.',
        'Improve the Service based on aggregated usage patterns.',
      ],
    },
    {
      id: 'ai-processing',
      title: 'AI Processing',
      paragraphs: [
        'TextForge uses OpenAI to power AI features. When you use Assist, Structure, or Generate, your input text is sent to OpenAI for processing. The AI-generated response is returned to you through the Service.',
        'As stated above, TextForge does not store your AI input or output on our servers after processing. OpenAI\'s handling of data submitted through their API is governed by OpenAI\'s own terms and privacy policies. We encourage you to review OpenAI\'s policies at https://openai.com/policies.',
        'Email verification is required before you can use AI features.',
      ],
    },
    {
      id: 'stripe-payments',
      title: 'Payment Processing',
      paragraphs: [
        'Subscription payments for the Pro plan ($9.99/month) are processed by Stripe, Inc. When you subscribe, you are redirected to Stripe\'s hosted checkout page. Stripe collects and processes your payment card information directly.',
        'TextForge stores only subscription-related metadata (such as Stripe customer ID, subscription status, and billing period dates). We never receive or store your full payment card number.',
        'Stripe\'s privacy policy is available at https://stripe.com/privacy.',
      ],
    },
    {
      id: 'third-party-services',
      title: 'Third-Party Services',
      paragraphs: [
        'We use the following third-party services that may process your personal data:',
      ],
      listItems: [
        'Better Auth — authentication and session management.',
        'Google — OAuth sign-in (name, email, and profile image from your Google account).',
        'OpenAI — AI text processing for Assist, Structure, and Generate features.',
        'Stripe — subscription billing and payment processing.',
        'Resend — transactional email delivery.',
        '[TODO: Database hosting provider name and region — e.g., "Neon (US East)" or "Supabase (EU West)".]',
      ],
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      paragraphs: [
        'We retain personal data only as long as necessary for the purposes described in this policy:',
      ],
      listItems: [
        'Active account data (name, email, plan, session records) is retained while your account is active and as needed to provide the Service.',
        'Upon account deletion, your personal identifiers are obfuscated (your email is replaced with a non-functional placeholder) and your account is deactivated. You will lose access to the Service and cannot recover your account.',
        'Usage analytics and activity metadata (token counts, request counts, action types, and format metadata) may be retained after account deletion, but only as long as necessary for legitimate business purposes — such as billing reconciliation, abuse prevention, and service improvement — and legal obligations (such as tax and regulatory compliance). When no longer required, this data is deleted or further anonymized.',
        'AI input and output text is not retained on TextForge servers after processing.',
        'Browser local storage data (theme preference and draft content) remains on your device until you clear it through your browser settings.',
        'Stripe may retain payment and billing records according to Stripe\'s own retention policies and applicable law.',
      ],
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      paragraphs: [
        'Depending on your location, you may have the following rights regarding your personal data:',
      ],
      listItems: [
        'Access — request a copy of the personal data we hold about you.',
        'Rectification — request correction of inaccurate personal data (you can update your name in the dashboard; email changes require confirmation).',
        'Erasure — request deletion of your personal data. You can delete your account from the dashboard, which obfuscates your identifiers and deactivates your account.',
        'Portability — request your data in a structured, commonly used format.',
        'Objection — object to processing of your personal data in certain circumstances.',
        'Restriction — request restriction of processing in certain circumstances.',
        'Withdraw consent — where processing is based on consent, withdraw it at any time.',
        'Lodge a complaint — with a supervisory authority in your jurisdiction if you believe your rights have been violated.',
        'To exercise any of these rights, contact us at [TODO: support@textforge.dev — single contact email for privacy and support inquiries]. We will respond within the timeframe required by applicable law.',
        '[TODO: If applicable, insert EU/UK representative or Data Protection Officer contact details.]',
        'Automated data export is not currently available through the Service. Contact us if you need a copy of your data.',
      ],
    },
    {
      id: 'security',
      title: 'Security',
      paragraphs: [
        'We implement reasonable technical and organizational measures designed to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include encrypted connections (HTTPS), secure session management, and access controls.',
        'No method of transmission over the Internet or electronic storage is completely secure. While we strive to protect your personal data, we cannot guarantee absolute security.',
      ],
    },
    {
      id: 'cookies-and-local-storage',
      title: 'Cookies and Local Storage',
      paragraphs: [
        'We use the following cookies and browser storage mechanisms:',
      ],
      listItems: [
        'Session cookies — set by Better Auth to maintain your authenticated session. These are essential for the Service to function when you are signed in.',
        'Theme preference — stored in localStorage under the key "textforge-theme" (values: dark, light, or system).',
        'Draft content — stored in localStorage under the keys "convert-data", "ai-structure-data", and "ai-generate-data". These store your input, output, and format preferences locally on your device. This data is not transmitted to our servers unless you explicitly use AI features or save authenticated history.',
        'TextForge does not use third-party analytics or advertising trackers in production. We do not use Google Analytics, PostHog, or similar services.',
      ],
    },
    {
      id: 'childrens-privacy',
      title: 'Children\'s Privacy',
      paragraphs: [
        'The Service is not directed at children under the age of 13 (or 16 in the European Economic Area). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us at [TODO: support@textforge.dev] and we will take steps to delete it.',
      ],
    },
    {
      id: 'international-transfers',
      title: 'International Data Transfers',
      paragraphs: [
        'TextForge and our third-party processors (including OpenAI, Stripe, Google, and Resend) may process your data in the United States and other countries. If you are located outside the United States, your data may be transferred to and processed in countries with different data protection laws.',
        '[TODO: If you serve EU/UK users, specify applicable transfer safeguards — e.g., Standard Contractual Clauses or adequacy decisions.]',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of the Service after changes constitutes acceptance of the updated policy.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact Us',
      paragraphs: [
        'If you have questions about this Privacy Policy or our data practices, contact us at:',
        '[TODO: support@textforge.dev]',
        '[TODO: Registered business address]',
      ],
    },
  ],
}
