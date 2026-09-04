import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Enterprise Multi-Tenant AI CRM & WhatsApp Marketing Suite API",
      version: "1.0.0",
      description:
        "Production-grade RESTful API documentation for Multi-Tenant CRM, Lead Ingestion & Conversion, Deal Pipeline Management, Customer Accounts, AI Knowledge Base, and WhatsApp Cloud Marketing.",
      contact: {
        name: "Infotattva Engineering",
        email: "support@infotattva.com"
      }
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your Bearer JWT token obtained from POST /auth/login"
        }
      },
      schemas: {
        Lead: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            location: { type: "string" },
            serviceInterest: { type: "string" },
            source: { type: "string" },
            status: { type: "string" },
            assignedTo: { type: "string" },
            createdAt: { type: "string" }
          }
        },
        Customer: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            companyName: { type: "string" },
            createdAt: { type: "string" }
          }
        },
        Deal: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            dealValue: { type: "number" },
            probability: { type: "number" },
            expectedRevenue: { type: "number" },
            stage: { type: "string", enum: ["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] },
            lossReason: { type: "string" },
            closedAt: { type: "string" },
            createdAt: { type: "string" }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string", example: "Invalid request input" }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      "/auth/login": {
        post: {
          summary: "Authenticate user & receive JWT token",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "pradeep@infotattva.com" },
                    password: { type: "string", example: "securepassword" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "JWT authentication successful" },
            "401": { description: "Invalid credentials" }
          }
        }
      },
      "/leads": {
        get: {
          summary: "Get server-side paginated leads with filtering & search",
          tags: ["Leads"],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "status", schema: { type: "string" } },
            { in: "query", name: "source", schema: { type: "string" } }
          ],
          responses: {
            "200": { description: "List of leads with pagination metadata" },
            "401": { description: "Unauthorized" }
          }
        },
        post: {
          summary: "Create a new lead manually in workspace",
          tags: ["Leads"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "phone"],
                  properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    email: { type: "string" },
                    serviceInterest: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Lead created successfully" }
          }
        }
      },
      "/leads/{id}/convert": {
        post: {
          summary: "Execute transactional conversion: Lead -> Customer -> Deal",
          tags: ["Leads"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["dealTitle"],
                  properties: {
                    dealTitle: { type: "string", example: "Enterprise Deal" },
                    dealValue: { type: "number", example: 15000 },
                    dealProbability: { type: "number", example: 60 },
                    dealStage: { type: "string", example: "QUALIFICATION" },
                    companyName: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Lead converted into Customer & Deal within database transaction" },
            "409": { description: "Duplicate conversion conflict" }
          }
        }
      },
      "/deals": {
        get: {
          summary: "Get deals list filtered by stage",
          tags: ["Deals Pipeline"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Deals list and pipeline total expected revenue" }
          }
        },
        post: {
          summary: "Create new deal in pipeline",
          tags: ["Deals Pipeline"],
          security: [{ bearerAuth: [] }],
          responses: {
            "201": { description: "Deal created" }
          }
        }
      },
      "/deals/{id}/stage": {
        patch: {
          summary: "Update deal stage with stage transition & loss reason validation",
          tags: ["Deals Pipeline"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["stage"],
                  properties: {
                    stage: { type: "string", enum: ["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] },
                    lossReason: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Deal stage updated and expected revenue recalculated" },
            "422": { description: "Missing loss reason for LOST deal or invalid transition" }
          }
        }
      },
      "/customers": {
        get: {
          summary: "Get converted customer accounts",
          tags: ["Customers"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Customers list with linked deals" }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
