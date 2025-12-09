import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ENAP Reservas API",
      version: "1.0.0",
      description: "Documentación oficial del backend ENAP Reservas",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Servidor local de desarrollo",
      },
    ],
  },

  // Archivos donde pondremos anotaciones Swagger (si quieres)
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
  ],
});
