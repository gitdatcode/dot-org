import React, { useEffect, useState } from 'react';
import GhostRenderer, { type GhostBlock } from './GhostRenderer';
import { parseGhostContent, extractGhostContent } from '../../lib/ghost/parseGhostContent';

export interface GhostContentProps {
  html?: string;
  url?: string;
  className?: string;
}

/**
 * Component to render Ghost content from either HTML or a URL
 */
const GhostContent: React.FC<GhostContentProps> = ({ html, url, className = '' }) => {
  const [blocks, setBlocks] = useState<GhostBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If HTML is provided directly, parse it
    if (html) {
      try {
        // Ensure we're in the browser before parsing
        if (typeof window !== 'undefined') {
          const parsedBlocks = parseGhostContent(html);
          setBlocks(parsedBlocks);
        } else {
          // In SSR, just set a simple block that will be replaced during hydration
          setBlocks([{ type: 'html', html }]);
        }
      } catch (err) {
        console.error('Error parsing Ghost content:', err);
        setError('Failed to parse content');
      }
      return;
    }

    // If URL is provided, fetch and parse the content
    if (url) {
      setLoading(true);
      setError(null);

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.status}`);
          }
          return response.text();
        })
        .then((htmlContent) => {
          // Extract the main content from the full page
          const contentHtml = extractGhostContent(htmlContent);
          const parsedBlocks = parseGhostContent(contentHtml);
          setBlocks(parsedBlocks);
        })
        .catch((err) => {
          console.error('Error fetching Ghost content:', err);
          setError(err.message || 'Failed to load content');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [html, url]);

  if (loading) {
    return <div className="ghost-content-loading">Loading content...</div>;
  }

  if (error) {
    return <div className="ghost-content-error">Error: {error}</div>;
  }

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return <GhostRenderer blocks={blocks} className={className} />;
};

export default GhostContent;
