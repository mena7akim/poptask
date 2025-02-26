require("dotenv").config();

const { authDocs } = require("../docs");

module.exports = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Taskaty API Documentation",
      version: "1.0.0",
      description: "API documentation for Taskaty project",
    },
    servers: [
      {
        url: process.env.SERVER_URL,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RequestLoginResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "OK",
            },
            result: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "OTP has been sent to your email.",
                },
                data: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["register", "login"],
                      example: "register",
                    },
                  },
                },
              },
            },
          },
        },
        Login: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
          example: {
            email: "example@email.com",
            password: "password",
          },
        },
        Register: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
            },
            otp: {
              type: "string",
            },
          },
          example: {
            email: "example@email.com",
            otp: "123456",
          },
        },
        CreateProfile: {
          type: "object",
          required: ["firstName", "lastName", "password"],
          properties: {
            firstName: {
              type: "string",
            },
            lastName: {
              type: "string",
            },
            password: {
              type: "string",
            },
            profileImage: {
              type: "string",
            },
          },
          example: {
            firstName: "John",
            lastName: "Doe",
            password: "password",
            profileImage: "https://example.com/image.jpg",
          },
        },
        UpdateProfile: {
          type: "object",
          properties: {
            firstName: {
              type: "string",
            },
            lastName: {
              type: "string",
            },
            profileImage: {
              type: "string",
            },
          },
          example: {
            firstName: "John",
            lastName: "Doe",
            profileImage: "https://example.com/image.jpg",
          },
        },
        PasswordReset: {
          type: "object",
          required: ["email", "password", "otp"],
          properties: {
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
            otp: {
              type: "string",
            },
          },
          example: {
            email: "example@gmail.com",
            password: "password",
            otp: "123456",
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "number",
            },
            email: {
              type: "string",
            },
            firstName: {
              type: "string",
            },
            lastName: {
              type: "string",
            },
            profileImage: {
              type: "string",
            },
          },
          example: {
            id: 1,
            email: "example@email.com",
            firstName: "John",
            lastName: "Doe",
            profileImage: "https://example.com/image.jpg",
          },
        },
        Project: {
          type: "object",
          required: ["teamId", "name", "description", "deadline"],
          properties: {
            id: {
              type: "integer",
              description: "The unique identifier for the task.",
              example: 1,
            },
            teamId: {
              type: "integer",
              description: "The ID of the team this task belongs to.",
              example: 2,
            },
            name: {
              type: "string",
              description: "The name of the project.",
              example: "Assignment 1",
            },
            description: {
              type: "string",
              description: "A description of the project.",
              example: "AI Linear Regression Assignment.",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description:
                "The deadline for the project. Must be a valid date in the future.",
              example: "2013-09-29T18:46:19Z",
            },
          },
          example: {
            id: 1,
            teamId: 2,
            name: "Design Homepage",
            description:
              "Create a responsive design for the homepage with the new branding guidelines.",
            deadline: "2013-09-29T18:46:19Z",
          },
        },
        Task: {
          type: "object",
          description:
            "A task associated with a project, including its status and priority.",
          required: [
            "projectId",
            "name",
            "content",
            "statusId",
            "priority",
            "dependancies",
          ],
          properties: {
            id: {
              type: "integer",
              format: "int32",
              description: "The unique identifier for the task.",
              example: 1,
            },
            projectId: {
              type: "integer",
              format: "int32",
              description: "The ID of the project this task belongs to.",
              example: 10,
            },
            name: {
              type: "string",
              maxLength: 255,
              description: "The name of the task.",
              example: "Implement Authentication",
            },
            description: {
              type: "string",
              description: "A detailed description of the task.",
              example:
                "Develop the authentication module using JWT and OAuth2.",
            },
            content: {
              type: "string",
              description: "the content of the task.",
              example: "Ensure compliance with security standards.",
            },
            statusId: {
              type: "integer",
              format: "int32",
              description:
                "References the TaskStatus model's ID indicating the current status of the task.",
              example: 3,
            },
            priority: {
              type: "string",
              enum: ["Low", "Medium", "High"],
              description: "The priority level of the task.",
              default: "Medium",
              example: "High",
            },
            dependancies: {
              type: "array",
              items: {
                type: "number",
              },
              description:
                "array with ids of the tasks that this task depends on",
              example: [1, 3, 5],
            },
          },
          example: {
            id: 1,
            projectId: 10,
            name: "Implement Authentication",
            description:
              "Develop the authentication module using JWT and OAuth2.",
            content: "Ensure compliance with security standards.",
            statusId: 3,
            priority: "High",
            dependancies: [1, 3, 5],
          },
        },
        Team: {
          type: "object",
          description: "A team within the organization.",
          required: ["name", "icon", "description"],
          properties: {
            id: {
              type: "integer",
              format: "int32",
              description: "The unique identifier for the team.",
              example: 1,
            },
            name: {
              type: "string",
              maxLength: 255,
              description: "The name of the team. Must be unique.",
              example: "Engineering Team",
            },
            icon: {
              type: "string",
              format: "uri",
              description: "URL of the team's icon.",
              example: "https://example.com/icons/engineering.png",
            },
            description: {
              type: "string",
              description: "A detailed description of the team.",
              example:
                "Responsible for developing and maintaining the company's products.",
            },
          },
          example: {
            id: 1,
            name: "Engineering Team",
            icon: "https://example.com/icons/engineering.png",
            description:
              "Responsible for developing and maintaining the company's products.",
          },
        },
        TeamMember: {
          type: "object",
          description:
            "Represents the association between a User and a Team, including the permissions level of the user within the team.",
          required: ["userId", "teamId", "permissions"],
          properties: {
            id: {
              type: "integer",
              format: "int32",
              description:
                "The unique identifier for the team member association.",
              example: 1,
            },
            userId: {
              type: "integer",
              format: "int32",
              description: "The ID of the user associated with the team.",
              example: 25,
            },
            teamId: {
              type: "integer",
              format: "int32",
              description: "The ID of the team associated with the user.",
              example: 10,
            },
            permissions: {
              type: "string",
              enum: ["admin", "editor", "viewer"],
              description: "The permission level of the user within the team.",
              default: "viewer",
              example: "editor",
            },
          },
          example: {
            id: 1,
            userId: 25,
            teamId: 10,
            permissions: "editor",
          },
        },
        Invitation: {
          type: "object",
          description:
            "Represents an invitation sent to a user to join a team.",
          required: ["teamId", "inviteeEmail", "expiresAt"],
          properties: {
            id: {
              type: "integer",
              format: "int32",
              description: "The unique identifier for the invitation.",
              example: 1,
            },
            teamId: {
              type: "integer",
              format: "int32",
              description:
                "The ID of the team to which the user is being invited.",
              example: 10,
            },
            inviteeEmail: {
              type: "string",
              format: "email",
              maxLength: 255,
              description: "The email address of the user being invited.",
              example: "user@example.com",
            },
          },
          example: {
            id: 1,
            teamId: 10,
            inviteeEmail: "user@example.com",
          },
        },
        InternalServerError: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "FAILED",
            },
            result: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Internal Server Error",
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
  },

  apis: [`${__dirname}/../routes/*.js`],
};
