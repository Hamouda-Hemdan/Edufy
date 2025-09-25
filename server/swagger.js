/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: Test successful
 */

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User management
 *   - name: Meeting
 *     description: Meeting management
 *   - name: Session
 *     description: Session management
 *   - name: Profile
 *     description: Profile management
 *   - name: Chat
 *     description: Chat messaging
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: User signup
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signup successful
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: User profile data
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /api/meeting:
 *   post:
 *     summary: Create a meeting
 *     tags: [Meeting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Meeting created
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/sessions:
 *   get:
 *     summary: Get all sessions for a meeting
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *     responses:
 *       200:
 *         description: List of sessions for the meeting
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: string
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/sessions:
 *   post:
 *     summary: Create a session for a meeting (only after meeting ends)
 *     description: Session creation is only allowed after the meeting has ended.
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Session created
 *       400:
 *         description: Invalid input or meeting not ended
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/sessions/{sessionId}:
 *   delete:
 *     summary: Delete a session for a meeting
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Session deleted
 *       404:
 *         description: Session not found
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/chat/messages:
 *   get:
 *     summary: Get all chat messages in a meeting
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *     responses:
 *       200:
 *         description: List of chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   user:
 *                     type: string
 *                   message:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/chat/messages:
 *   post:
 *     summary: Send a chat message in a meeting
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/join:
 *   post:
 *     summary: Join a meeting
 *     tags: [Meeting]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *     responses:
 *       200:
 *         description: Joined meeting
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/meetings/{meetingId}/leave:
 *   post:
 *     summary: Leave a meeting
 *     tags: [Meeting]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *     responses:
 *       200:
 *         description: Left meeting
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/meetings/{meetingId}:
 *   get:
 *     summary: Get meeting details and participants
 *     tags: [Meeting]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The meeting ID
 *     responses:
 *       200:
 *         description: Meeting details and participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 topic:
 *                   type: string
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Meeting not found
 */

const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Edufy API",
      version: "1.0.0",
      description:
        "API documentation for Edufy backend (user, meeting, session, profile, etc.)",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.resolve(__filename)], // Use absolute path for Swagger docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
