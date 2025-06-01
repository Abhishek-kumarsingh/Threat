'use client';

import React, { useEffect, useRef } from 'react';

interface MermaidDiagramProps {
  diagram: string;
  className?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ diagram, className = '' }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (typeof window !== 'undefined' && mermaidRef.current) {
        try {
          // Dynamically import mermaid to avoid SSR issues
          const mermaid = (await import('mermaid')).default;
          
          // Initialize mermaid with configuration
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis'
            }
          });

          // Clear previous content
          mermaidRef.current.innerHTML = '';

          // Generate unique ID for this diagram
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Render the diagram
          const { svg } = await mermaid.render(id, diagram);
          
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Error rendering Mermaid diagram:', error);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `
              <div class="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p class="text-red-600 font-medium">Error rendering diagram</p>
                <p class="text-red-500 text-sm mt-1">Please check the diagram syntax</p>
              </div>
            `;
          }
        }
      }
    };

    renderDiagram();
  }, [diagram]);

  return (
    <div 
      ref={mermaidRef} 
      className={`mermaid-container ${className}`}
      style={{ 
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading diagram...</span>
      </div>
    </div>
  );
};

export default MermaidDiagram;
