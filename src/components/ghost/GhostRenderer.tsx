import React from 'react'
import BookmarkCard from './cards/BookmarkCard'
import ButtonCard from './cards/ButtonCard'
import CalloutCard from './cards/CalloutCard'
import FileCard from './cards/FileCard'
import GalleryCard from './cards/GalleryCard'
import HeaderCard from './cards/HeaderCard'
import ProductCard from './cards/ProductCard'
import SignupCard from './cards/SignupCard'
import ToggleCard from './cards/ToggleCard'

export interface GhostBlock {
  type: string
  html?: string
  attributes?: Record<string, any>
  children?: GhostBlock[]
}

export interface GhostRendererProps {
  blocks: GhostBlock[]
  className?: string
}

const GhostRenderer: React.FC<GhostRendererProps> = ({ blocks, className = '' }) => {
  if (!blocks || blocks.length === 0) {
    return null
  }

  return (
    <div className={`ghost-content ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}

function paragraphContent(blockHtml: string) {
  return blockHtml ? blockHtml.replace(/<\/?p>/g, '') : ''
}

function renderBlock(block: GhostBlock, index: number): React.ReactNode {
  switch (block.type) {
    case 'paragraph':
      // If block.html contains p tags, extract the content from between them
      return <p key={index} className="text-secondary" dangerouslySetInnerHTML={{ __html: paragraphContent(block.html || '') }} />

    case 'heading': {
      const level = block.attributes?.level || 1
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      return <Tag key={index} className="text-balance text-secondary-focus" dangerouslySetInnerHTML={{ __html: block.html || '' }} />
    }

    case 'list': {
      const ListTag = block.attributes?.ordered ? 'ol' : 'ul'
      return (
        <ListTag key={index}>
          {block.children?.map((item, itemIndex) => (
            <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item.html || '' }} />
          ))}
        </ListTag>
      )
    }

    case 'image':
      return (
        <figure key={index} className="ghost-image max-w-xl mx-auto">
          <img
            src={block.attributes?.src}
            alt={block.attributes?.alt || ''}
            loading="lazy"
          />
          {block.attributes?.caption && (
            <figcaption dangerouslySetInnerHTML={{ __html: block.attributes.caption }} />
          )}
        </figure>
      )

    case 'gallery':
      return <GalleryCard key={index} {...block.attributes} />

    case 'bookmark':
      return <BookmarkCard key={index} {...block.attributes} />

    case 'product':
      return <ProductCard key={index} {...block.attributes} />

    case 'file':
      return <FileCard key={index} {...block.attributes} />

    case 'callout':
      return <CalloutCard key={index} {...block.attributes} html={block.html} />

    case 'button':
      return <ButtonCard key={index} {...block.attributes} />

    case 'toggle':
      return <ToggleCard key={index} {...block.attributes} html={block.html} />

    case 'header':
      return <HeaderCard key={index} {...block.attributes} />

    case 'signup':
      return <SignupCard key={index} {...block.attributes} />

    case 'html':
      return <div key={index} dangerouslySetInnerHTML={{ __html: block.html || '' }} />

    case 'divider':
      return <hr key={index} className="ghost-divider" />

    case 'table': {
      return (
        <div key={index} className="overflow-x-auto my-8">
          <table dangerouslySetInnerHTML={{ __html: block.html || '' }} />
        </div>
      )
    }

    default:
      console.warn(`Unsupported block type: ${block.type}`)
      return <div key={index} dangerouslySetInnerHTML={{ __html: block.html || '' }} />
  }
}

export default GhostRenderer
