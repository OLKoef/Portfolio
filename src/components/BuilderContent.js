import React from 'react';
import { BuilderComponent } from '@builder.io/react';
import { isBuilderConfigured } from '../builder/config';

export default function BuilderContent({ model = 'page', content }) {
  if (!isBuilderConfigured) {
    return (
      <div className="builder-config-warning">
        <h3>🔧 Builder.io Configuration Required</h3>
        <p>To use dynamic content management, please set your <code>REACT_APP_BUILDER_API_KEY</code> environment variable.</p>
      </div>
    );
  }

  return (
    <BuilderComponent 
      model={model} 
      content={content}
      apiKey={process.env.REACT_APP_BUILDER_API_KEY}
    />
  );
}

export function BuilderPage({ urlPath = '/' }) {
  if (!isBuilderConfigured) {
    return null; // Return null to show fallback content in App.js
  }

  return (
    <BuilderComponent 
      model="page"
      url={urlPath}
      apiKey={process.env.REACT_APP_BUILDER_API_KEY}
    />
  );
}
