import React from 'react';
import { BuilderComponent, builder } from '@builder.io/react';
import '../builder/config';

export default function BuilderContent({ model = 'page', content }) {
  return (
    <BuilderComponent 
      model={model} 
      content={content}
      apiKey={process.env.REACT_APP_BUILDER_API_KEY}
    />
  );
}

export function BuilderPage({ urlPath = '/' }) {
  return (
    <BuilderComponent 
      model="page"
      url={urlPath}
      apiKey={process.env.REACT_APP_BUILDER_API_KEY}
    />
  );
}
