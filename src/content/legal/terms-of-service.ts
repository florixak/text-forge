import type { LegalDocument } from './types'

export const termsOfService: LegalDocument = {
  title: 'Terms of Service',
  lastUpdated: 'July 10, 2026',
  sections: [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      paragraphs: [
        'These Terms of Service ("Terms") govern your access to and use of TextForge ("TextForge," "we," "us," or "our"), including our website and AI-powered text transformation service (the "Service").',
        '[TODO: Insert legal entity name — e.g., "The Service is operated by [Company Name]."]',
        'By creating an account, signing in, or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Service.',
      ],
    },
    {
      id: 'eligibility',
      title: 'Eligibility',
      paragraphs: [
        'You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Service. By using the Service, you represent that you meet this requirement and have the legal capacity to enter into these Terms.',
        'You may not use the Service for any unlawful purpose or in violation of any applicable laws or regulations.',
      ],
    },
    {
      id: 'user-accounts',
      title: 'User Accounts',
      paragraphs: [
        'You may create an account using email and password or sign in with Google. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
        'Email verification is required before you can use AI features. You must provide accurate and complete information when creating your account and keep your account information up to date.',
        'You must notify us promptly at [TODO: support@textforge.dev] if you suspect unauthorized access to your account.',
      ],
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use',
      paragraphs: [
        'You agree not to use the Service to:',
      ],
      listItems: [
        'Violate any applicable law, regulation, or third-party rights.',
        'Submit content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.',
        'Attempt to circumvent usage limits, token limits, or other plan restrictions.',
        'Use automated tools, bots, or scripts to access the Service in a manner that exceeds reasonable human use.',
        'Resell, sublicense, or redistribute access to the Service or its AI capabilities.',
        'Share your account credentials or allow others to use your account to bypass plan limits.',
        'Reverse engineer, decompile, or attempt to extract the source code of the Service.',
        'Interfere with or disrupt the Service, servers, or networks connected to the Service.',
      ],
    },
    {
      id: 'ai-content-disclaimer',
      title: 'AI-Generated Content Disclaimer',
      highlight: true,
      paragraphs: [
        'The Service uses artificial intelligence to assist with text transformation, structuring, and generation. AI outputs may be inaccurate, incomplete, outdated, or inappropriate. AI-generated content does not constitute professional, legal, medical, financial, or other expert advice.',
        'You are solely responsible for reviewing, validating, and using AI-generated content before relying on it, sharing it, or acting upon it. TextForge is not liable for any decisions, actions, or outcomes resulting from your use of or reliance on AI-generated content.',
        'TextForge does not store your AI input or output on our servers after processing. See our Privacy Policy for details.',
      ],
    },
    {
      id: 'subscription-plans',
      title: 'Subscription Plans',
      paragraphs: [
        'TextForge offers the following plans:',
      ],
      listItems: [
        'Free — $0/month. Includes 40,000 tokens per month, 5,000 tokens per day, 20 AI requests per day, a maximum input length of 2,000 characters, and up to 30 history records. Format conversion without an account is available client-side in your browser.',
        'Pro — $9.99/month. Includes 250,000 tokens per month, 10,000 tokens per day, 250 AI requests per day, a maximum input length of 10,000 characters, and up to 10,000 history records.',
      ],
    },
    {
      id: 'usage-limits',
      title: 'Usage Limits and Token Limits',
      paragraphs: [
        'Your use of AI features is subject to the token limits, request limits, and input length limits associated with your plan. Usage is tracked daily and monthly. If you exceed your limits, AI features will be unavailable until your limits reset or you upgrade your plan.',
        'History records store metadata only (action type and formats), not the content of your conversions or AI interactions.',
      ],
    },
    {
      id: 'fair-use',
      title: 'Fair Use Policy',
      paragraphs: [
        'You agree to use the Service in a manner consistent with normal, personal or professional use. Prohibited uses include automated bulk processing, reselling API access, sharing accounts to circumvent limits, and any activity that degrades the Service for other users.',
        'TextForge reserves the right to throttle, suspend, or terminate access to the Service if we determine, in our sole discretion, that your use violates this Fair Use Policy or poses a risk to the stability, security, or fairness of the Service.',
        'TextForge reserves the right to modify usage limits at any time to protect the stability, security, and fairness of the Service. Where practicable, we will provide reasonable notice before material reductions to plan limits take effect.',
      ],
    },
    {
      id: 'payments',
      title: 'Payments',
      paragraphs: [
        'Pro subscriptions are billed monthly at $9.99 through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.',
        'Subscription prices may change in the future. Existing subscribers will receive advance notice before any pricing changes take effect on their subscription.',
        'Payment card information is collected and processed directly by Stripe. TextForge does not store your card details. By subscribing, you also agree to Stripe\'s terms of service.',
      ],
    },
    {
      id: 'refunds',
      title: 'Refund Policy',
      paragraphs: [
        '[TODO: Specify refund policy with legal counsel, accounting for applicable consumer protection laws in your jurisdictions. Do not rely on this placeholder text for production use.]',
      ],
    },
    {
      id: 'cancellation',
      title: 'Cancellation',
      paragraphs: [
        'You may cancel your Pro subscription at any time from your dashboard. Cancellation takes effect at the end of your current billing period — you will retain Pro access until that date. After the billing period ends, your account will revert to the Free plan.',
        'You may reactivate a canceled subscription before the end of the billing period from your dashboard.',
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      paragraphs: [
        'The Service, including its design, code, features, and branding, is owned by TextForge and protected by intellectual property laws. These Terms do not grant you any rights to our trademarks, logos, or brand features.',
        'You retain ownership of the text and content you submit to the Service. By submitting content for AI processing or format conversion, you grant TextForge a limited, non-exclusive license to process that content solely to provide the Service to you.',
      ],
    },
    {
      id: 'disclaimer-of-warranties',
      title: 'Disclaimer of Warranties',
      paragraphs: [
        'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
        'TextForge does not warrant that the Service will be uninterrupted, error-free, or secure, or that AI-generated content will be accurate or suitable for any particular purpose.',
      ],
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of Liability',
      paragraphs: [
        'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TEXTFORGE AND ITS OPERATORS, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.',
        'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TEXTFORGE\'S TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO TEXTFORGE IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100).',
        'Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability is limited to the fullest extent permitted by law.',
      ],
    },
    {
      id: 'account-termination',
      title: 'Account Termination',
      paragraphs: [
        'We may suspend or terminate your access to the Service at any time, with or without cause, including if you violate these Terms or our Fair Use Policy.',
        'You may delete your account at any time from the dashboard. Account deletion deactivates your account, obfuscates your personal identifiers, cancels active subscriptions, and revokes your sessions. Usage analytics and activity metadata may be retained as described in our Privacy Policy.',
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      paragraphs: [
        '[TODO: Specify governing law and jurisdiction — e.g., "These Terms are governed by the laws of [State/Country], without regard to conflict of law principles. Any disputes shall be resolved in the courts of [Jurisdiction]."]',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to These Terms',
      paragraphs: [
        'We may update these Terms from time to time. When we make material changes, we will update the "Last updated" date at the top of this page. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the Service.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact Us',
      paragraphs: [
        'If you have questions about these Terms, contact us at:',
        '[TODO: support@textforge.dev]',
        '[TODO: Registered business address]',
      ],
    },
  ],
}
