import { builder } from '@builder.io/react';

// Initialize Builder.io with your API key
const builderApiKey = process.env.REACT_APP_BUILDER_API_KEY;

if (builderApiKey) {
  builder.init(builderApiKey);
} else {
  console.warn('Builder.io API key not found. Please set REACT_APP_BUILDER_API_KEY environment variable.');
}

export { builder };
export const isBuilderConfigured = !!builderApiKey;
