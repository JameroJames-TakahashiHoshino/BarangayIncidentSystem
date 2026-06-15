const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Barangay Incident Reporting System API',
    version: '1.0.0',
    description: 'API documentation for the Barangay Incident Reporting System.'
  },
  servers: [
    {
      url: '/api',
      description: 'Base API path'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['resident', 'admin', 'personnel'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully.' },
          400: { description: 'Validation error.' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful.' },
          401: { description: 'Invalid credentials.' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        responses: {
          200: { description: 'Profile fetched successfully.' },
          401: { description: 'Unauthorized.' }
        }
      }
    },
    '/incidents': {
      post: {
        summary: 'Create incident (resident)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'location', 'incidentDate'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  incidentDate: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Incident created.' },
          400: { description: 'Validation error.' }
        }
      }
    },
    '/incidents/my-reports': {
      get: {
        summary: 'Get resident incidents',
        responses: {
          200: { description: 'Incidents fetched.' },
          401: { description: 'Unauthorized.' }
        }
      }
    },
    '/incidents/resident/{id}': {
      patch: {
        summary: 'Resident update incident',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  location: { type: 'string' },
                  incidentDate: { type: 'string', format: 'date' },
                  residentNotes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Incident updated.' },
          400: { description: 'Validation error.' }
        }
      }
    },
    '/incidents/admin/all': {
      get: {
        summary: 'Admin list all incidents',
        responses: {
          200: { description: 'Incidents fetched.' },
          403: { description: 'Forbidden.' }
        }
      }
    },
    '/incidents/admin/{id}': {
      patch: {
        summary: 'Admin update incident',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  adminNotes: { type: 'string' },
                  assignedTo: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Incident updated.' },
          403: { description: 'Forbidden.' }
        }
      }
    },
    '/incidents/personnel/assigned': {
      get: {
        summary: 'Personnel list assigned incidents',
        responses: {
          200: { description: 'Incidents fetched.' },
          403: { description: 'Forbidden.' }
        }
      }
    },
    '/incidents/personnel/{id}': {
      patch: {
        summary: 'Personnel update incident',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  personnelNotes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Incident updated.' },
          403: { description: 'Forbidden.' }
        }
      }
    },
    '/users': {
      get: {
        summary: 'Admin list users',
        responses: {
          200: { description: 'Users fetched.' },
          403: { description: 'Forbidden.' }
        }
      }
    },
    '/users/{id}': {
      patch: {
        summary: 'Admin update user',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['resident', 'admin', 'personnel'] },
                  password: { type: 'string', minLength: 6 },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'User updated.' },
          403: { description: 'Forbidden.' }
        }
      },
      delete: {
        summary: 'Admin delete user',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'User deleted.' },
          403: { description: 'Forbidden.' }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: []
};

module.exports = swaggerJSDoc(options);
