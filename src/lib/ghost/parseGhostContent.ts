import type { GhostBlock } from '../../components/ghost/GhostRenderer';

/**
 * Parses Ghost HTML content into structured blocks
 * @param html The HTML content from Ghost
 * @returns An array of GhostBlock objects
 */
export function parseGhostContent(html: string): GhostBlock[] {
  if (!html) {
    return [];
  }

  // Create a temporary DOM element to parse the HTML
  let doc;

  // Check if we're in a browser environment
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, 'text/html');
  } else {
    // In server environment, return a simple block
    // This will be replaced on the client side when hydrated
    return [
      {
        type: 'html',
        html: html,
      }
    ];
  }

  const blocks: GhostBlock[] = [];

  // Process each top-level element in the body
  Array.from(doc.body.children).forEach((element) => {
    const block = processElement(element);
    if (block) {
      blocks.push(block);
    }
  });

  return blocks;
}

/**
 * Process a DOM element into a GhostBlock
 */
function processElement(element: Element): GhostBlock | null {
  // Skip empty elements
  if (!element.textContent?.trim() && !element.classList.contains('kg-card')) {
    return null;
  }

  // Process based on element type
  if (element.tagName === 'P') {
    return {
      type: 'paragraph',
      html: element.outerHTML,
    };
  }

  if (/^H[1-6]$/.test(element.tagName)) {
    return {
      type: 'heading',
      html: element.innerHTML,
      attributes: {
        level: parseInt(element.tagName.substring(1), 10),
      },
    };
  }

  if (element.tagName === 'UL' || element.tagName === 'OL') {
    const children: GhostBlock[] = [];
    Array.from(element.children).forEach((child) => {
      if (child.tagName === 'LI') {
        children.push({
          type: 'listItem',
          html: child.innerHTML,
        });
      }
    });

    return {
      type: 'list',
      attributes: {
        ordered: element.tagName === 'OL',
      },
      children,
    };
  }

  if (element.tagName === 'FIGURE') {
    // Check if it's an image
    const img = element.querySelector('img');
    if (img) {
      const figcaption = element.querySelector('figcaption');
      return {
        type: 'image',
        attributes: {
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt') || '',
          caption: figcaption ? figcaption.innerHTML : '',
        },
      };
    }

    // Check if it's a gallery
    if (element.classList.contains('kg-gallery-card')) {
      const images = Array.from(element.querySelectorAll('.kg-gallery-image img')).map((img) => ({
        url: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        width: img.getAttribute('width') ? parseInt(img.getAttribute('width') || '0', 10) : undefined,
        height: img.getAttribute('height') ? parseInt(img.getAttribute('height') || '0', 10) : undefined,
      }));

      return {
        type: 'gallery',
        attributes: {
          images,
        },
      };
    }

    // Check if it's a bookmark
    if (element.classList.contains('kg-bookmark-card')) {
      const container = element.querySelector('.kg-bookmark-container');
      const url = container?.getAttribute('href') || '';
      const title = element.querySelector('.kg-bookmark-title')?.textContent || '';
      const description = element.querySelector('.kg-bookmark-description')?.textContent || '';
      const author = element.querySelector('.kg-bookmark-author')?.textContent || '';
      const publisher = element.querySelector('.kg-bookmark-publisher')?.textContent || '';
      const thumbnail = element.querySelector('.kg-bookmark-thumbnail img')?.getAttribute('src') || '';
      const icon = element.querySelector('.kg-bookmark-icon')?.getAttribute('src') || '';

      return {
        type: 'bookmark',
        attributes: {
          url,
          title,
          description,
          author,
          publisher,
          thumbnail,
          icon,
        },
      };
    }
  }

  // Process card elements
  if (element.classList.contains('kg-card')) {
    // Product card
    if (element.classList.contains('kg-product-card')) {
      const image = element.querySelector('.kg-product-card-image')?.getAttribute('src') || '';
      const imageWidth = element.querySelector('.kg-product-card-image')?.getAttribute('width');
      const imageHeight = element.querySelector('.kg-product-card-image')?.getAttribute('height');
      const title = element.querySelector('.kg-product-card-title')?.textContent || '';
      const description = element.querySelector('.kg-product-card-description')?.textContent || '';
      const buttonText = element.querySelector('.kg-product-card-button span')?.textContent || 'Buy now';
      const buttonUrl = element.querySelector('.kg-product-card-button')?.getAttribute('href') || '#';

      // Count active rating stars
      const activeStars = element.querySelectorAll('.kg-product-card-rating-active').length;

      return {
        type: 'product',
        attributes: {
          image,
          imageWidth: imageWidth ? parseInt(imageWidth, 10) : undefined,
          imageHeight: imageHeight ? parseInt(imageHeight, 10) : undefined,
          title,
          description,
          buttonText,
          buttonUrl,
          rating: activeStars,
        },
      };
    }

    // File card
    if (element.classList.contains('kg-file-card')) {
      const url = element.querySelector('.kg-file-card-container')?.getAttribute('href') || '';
      const title = element.querySelector('.kg-file-card-title')?.textContent || '';
      const caption = element.querySelector('.kg-file-card-caption')?.textContent || '';
      const fileName = element.querySelector('.kg-file-card-filename')?.textContent || '';
      const fileSize = element.querySelector('.kg-file-card-filesize')?.textContent || '';

      return {
        type: 'file',
        attributes: {
          url,
          title,
          caption,
          fileName,
          fileSize,
        },
      };
    }

    // Callout card
    if (element.classList.contains('kg-callout-card')) {
      const emoji = element.querySelector('.kg-callout-emoji')?.textContent || '💡';
      const html = element.querySelector('.kg-callout-text')?.innerHTML || '';

      // Determine background color from class or style
      let backgroundColor;
      const htmlElement = element as HTMLElement;
      if (htmlElement.style?.backgroundColor) {
        backgroundColor = htmlElement.style.backgroundColor;
      } else {
        // Check for color classes
        const colorClasses = ['blue', 'green', 'yellow', 'red', 'pink', 'purple'];
        for (const color of colorClasses) {
          if (element.classList.contains(`kg-callout-card-${color}`)) {
            backgroundColor = color;
            break;
          }
        }
      }

      return {
        type: 'callout',
        html,
        attributes: {
          emoji,
          backgroundColor,
          textColor: (element as HTMLElement).style?.color,
        },
      };
    }

    // Button card
    if (element.classList.contains('kg-button-card')) {
      const button = element.querySelector('.kg-btn');
      const buttonText = button?.textContent || 'Learn more';
      const buttonUrl = button?.getAttribute('href') || '#';

      // Determine alignment
      let alignment = 'center';
      if (element.classList.contains('kg-align-left')) alignment = 'left';
      else if (element.classList.contains('kg-align-right')) alignment = 'right';

      return {
        type: 'button',
        attributes: {
          buttonText,
          buttonUrl,
          alignment,
          buttonColor: (button as HTMLElement)?.style?.backgroundColor,
          buttonTextColor: (button as HTMLElement)?.style?.color,
        },
      };
    }

    // Toggle card
    if (element.classList.contains('kg-toggle-card')) {
      const heading = element.querySelector('.kg-toggle-heading-text')?.textContent || '';
      const html = element.querySelector('.kg-toggle-content')?.innerHTML || '';

      return {
        type: 'toggle',
        html,
        attributes: {
          heading,
        },
      };
    }

    // Header card
    if (element.classList.contains('kg-header-card')) {
      const heading = element.querySelector('.kg-header-card-heading')?.textContent || '';
      const subheading = element.querySelector('.kg-header-card-subheading')?.textContent || '';
      const backgroundColor = element.getAttribute('data-background-color') || (element as HTMLElement).style?.backgroundColor;
      const textColor = element.querySelector('[data-text-color]')?.getAttribute('data-text-color') || '';

      // Determine alignment
      let alignment = 'center';
      const textContainer = element.querySelector('.kg-header-card-text');
      if (textContainer?.classList.contains('kg-align-left')) alignment = 'left';
      else if (textContainer?.classList.contains('kg-align-right')) alignment = 'right';

      return {
        type: 'header',
        attributes: {
          heading,
          subheading,
          backgroundColor,
          textColor,
          alignment,
        },
      };
    }

    // Signup card
    if (element.classList.contains('kg-signup-card')) {
      const heading = element.querySelector('.kg-signup-card-heading')?.textContent || '';
      const subheading = element.querySelector('.kg-signup-card-subheading')?.textContent || '';
      const buttonText = element.querySelector('.kg-signup-card-button-default')?.textContent || 'Subscribe';
      const disclaimer = element.querySelector('.kg-signup-card-disclaimer')?.textContent || '';
      const backgroundColor = (element as HTMLElement).style?.backgroundColor;
      const headingElement = element.querySelector('.kg-signup-card-heading') as HTMLElement;
      const textColor = headingElement?.style?.color;
      const buttonElement = element.querySelector('.kg-signup-card-button') as HTMLElement;

      return {
        type: 'signup',
        attributes: {
          heading,
          subheading,
          buttonText,
          disclaimer,
          backgroundColor,
          textColor,
          buttonColor: buttonElement?.style?.backgroundColor,
          buttonTextColor: buttonElement?.style?.color,
        },
      };
    }
  }

  // Handle dividers
  if (element.tagName === 'HR') {
    return {
      type: 'divider',
    };
  }

  // Default fallback for other elements
  return {
    type: 'html',
    html: element.outerHTML,
  };
}

/**
 * Utility function to extract Ghost content from a full HTML page
 * @param html Full HTML page from Ghost
 * @returns The content HTML
 */
export function extractGhostContent(html: string): string {
  // Check if we're in a browser environment
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Look for the main content section
    const contentSection = doc.querySelector('.gh-content');

    if (contentSection) {
      return contentSection.innerHTML;
    }
  }

  // If we're in a server environment or couldn't find the content section,
  // return the original HTML
  return html;
}
