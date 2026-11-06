// ============================================================================
// OpenAPI 3.0.3 Specification Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Rich Rlephant Marketing Whatsapp API',
      version: '1.0.0',
      description: 'Official Public Developer REST API for the Rich Rlephant WhatsApp Business Platform. Enables programmatic message dispatch, contact synchronization, template management, and outbound webhook event streaming.',
      contact: {
        name: 'Developer Support',
        url: 'https://rich-rlephant.com/developers',
        email: 'api-support@rich-rlephant.com',
      },
    },
    servers: [
      {
        url: 'https://api.rich-rlephant.com',
        description: 'Production API Gateway',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key (rlep_live_...)',
          description: 'Provide your secret API Key prefixed with rlep_live_ or rlep_test_',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
        SendMessageRequest: {
          type: 'object',
          required: ['to', 'type'],
          properties: {
            to: {
              type: 'string',
              description: 'Recipient phone number in international E.164 format (e.g., +971501234567 or +919876543210)',
              example: '+971501234567',
            },
            type: {
              type: 'string',
              enum: ['text', 'template'],
              description: 'Message type. Outside the 24h customer care window, only template is permitted.',
            },
            text: {
              type: 'object',
              properties: {
                body: { type: 'string', example: 'Hello! How can our support team assist you today?' },
              },
            },
            template: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'welcome_package_v1' },
                language: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'en_US' },
                  },
                },
                components: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    paths: {
      '/api/v1/messages': {
        post: {
          summary: 'Send WhatsApp Message',
          description: 'Dispatches an outbound WhatsApp message. Enforces 24-hour service window rules and recipient consent policies.',
          parameters: [
            {
              name: 'Idempotency-Key',
              in: 'header',
              required: false,
              schema: { type: 'string' },
              description: 'Unique client-supplied idempotency key to prevent accidental duplicate sends.',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SendMessageRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Message accepted for delivery',
            },
            '401': {
              description: 'Unauthorized - invalid API key',
            },
            '403': {
              description: 'Forbidden - outside 24h service window or missing permissions',
            },
            '422': {
              description: 'Validation failed - invalid phone number or payload',
            },
          },
        },
      },
      '/api/v1/contacts': {
        get: {
          summary: 'List Contacts',
          description: 'Retrieves contacts registered under the authenticated tenant workspace.',
          responses: {
            '200': { description: 'List of contacts' },
          },
        },
        post: {
          summary: 'Create or Update Contact',
          description: 'Upserts a contact and registers explicit opt-in consent proof.',
          responses: {
            '201': { description: 'Contact saved' },
          },
        },
      },
      '/api/v1/templates': {
        get: {
          summary: 'List Approved Templates',
          description: 'Retrieves Meta-approved message templates synchronized for the tenant.',
          responses: {
            '200': { description: 'List of templates' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}

