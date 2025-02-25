import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'COBIS API',
      version: '1.0.0',
      description: 'COBIS API with docs',
    },
  },
  // Path to the API docs (adjust as needed)
  apis: ['./src/routes/*.ts', './src/routes/imports/*.ts'], // files containing annotations for the OpenAPI Specification
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;