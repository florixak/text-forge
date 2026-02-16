type MetadataConfig = {
  title: string
  description: string
  robots?: string
}

type RouteMetadata = {
  [key: string]: MetadataConfig
}

const routeMetadataConfig: RouteMetadata = {
  '/': {
    title: 'TextForge - AI Text Tool',
    description:
      'Text Forge is an AI-powered text generation and editing tool designed to help you create, refine, and enhance your written content with ease.',
    robots: 'index, follow',
  },
  '/signin': {
    title: 'Sign In - TextForge',
    description:
      'Sign in to your TextForge account to access powerful AI text generation and editing features. Create, refine, and enhance your written content with ease.',
    robots: 'index, follow',
  },
  '/signup': {
    title: 'Sign Up - TextForge',
    description:
      'Create a TextForge account to unlock powerful AI text generation and editing features. Sign up now to start creating, refining, and enhancing your written content with ease.',
    robots: 'index, follow',
  },
  '/plans': {
    title: 'Choose Your Plan - TextForge',
    description:
      'Explore TextForge subscription plans and find the perfect fit for your AI text generation needs. Upgrade for enhanced features and increased limits.',
    robots: 'index, follow',
  },
  '/ai-structuring': {
    title: 'AI Structuring - TextForge',
    description:
      'Use AI to structure unstructured text into JSON, CSV, or XML. Ideal for extraction, transformation, and organization.',
    robots: 'noindex, nofollow',
  },
  '/history': {
    title: 'History - TextForge',
    description:
      'View your usage history, including actions taken and formats used.',
    robots: 'noindex, nofollow',
  },
  '/verify-email': {
    title: 'Verify Email - TextForge',
    description:
      'Verify your email address to complete your TextForge account setup and unlock powerful AI text generation features.',
    robots: 'noindex, nofollow',
  },
  '/dashboard': {
    title: 'Dashboard - TextForge',
    description:
      'View your TextForge dashboard with usage statistics, token limits, and quick actions.',
    robots: 'noindex, nofollow',
  },
}

function buildMetaMeta(
  config: MetadataConfig,
  canonicalUrl: string,
  ogImageUrl: string,
) {
  return [
    {
      title: config.title,
    },
    {
      name: 'description',
      content: config.description,
    },
    { property: 'og:title', content: config.title },
    {
      property: 'og:description',
      content: config.description,
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: ogImageUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: config.title },
    {
      name: 'twitter:description',
      content: config.description,
    },
    { name: 'twitter:image', content: ogImageUrl },
    ...(config.robots ? [{ name: 'robots', content: config.robots }] : []),
  ]
}

export function getMetadata(path: string) {
  const config = routeMetadataConfig[path]
  if (!config) {
    return {
      meta: [],
      links: [],
    }
  }

  let baseUrl: URL
  try {
    baseUrl = new URL(import.meta.env.VITE_BASE_URL || 'http://localhost:3000')
  } catch {
    baseUrl = new URL('http://localhost:3000')
  }
  const canonicalUrl = new URL(path, baseUrl).toString()
  const ogImageUrl = new URL('/og-image.png', baseUrl).toString()

  return {
    meta: buildMetaMeta(config, canonicalUrl, ogImageUrl),
    links: [{ rel: 'canonical', href: canonicalUrl }],
  }
}
