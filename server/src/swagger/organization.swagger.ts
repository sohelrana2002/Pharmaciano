/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: API endpoints for managing organizations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         tradeLicenseNo:
 *           type: string
 *         drugLicenseNo:
 *           type: string
 *         vatRegistrationNo:
 *           type: string
 *         address:
 *           type: string
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *         subscriptionPlan:
 *           type: string
 *           enum: [FREE, BASIC, PRO, ENTERPRISE]
 *         isActive:
 *           type: boolean
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - tradeLicenseNo
 *               - drugLicenseNo
 *               - address
 *               - contact
 *               - subscriptionPlan
 *             properties:
 *               name:
 *                 type: string
 *               tradeLicenseNo:
 *                 type: string
 *               drugLicenseNo:
 *                 type: string
 *               vatRegistrationNo:
 *                 type: string
 *               address:
 *                 type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [FREE, BASIC, PRO, ENTERPRISE]
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Organization already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/organizations:
 *   get:
 *     summary: Get list of all active organizations
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     organization:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Organization'
 *       404:
 *         description: No organization found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/organizations/{id}:
 *   get:
 *     summary: Get individual organization info
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *       409:
 *         description: Invalid organization ID
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/organizations/{id}:
 *   put:
 *     summary: Update an existing organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               tradeLicenseNo:
 *                 type: string
 *               drugLicenseNo:
 *                 type: string
 *               vatRegistrationNo:
 *                 type: string
 *               address:
 *                 type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [FREE, BASIC, PRO, ENTERPRISE]
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Invalid ID or validation failed
 *       404:
 *         description: Organization not found
 *       409:
 *         description: Duplicate field exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/organizations/{id}:
 *   delete:
 *     summary: Delete an organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *       404:
 *         description: Organization not found
 *       409:
 *         description: Invalid organization ID
 *       500:
 *         description: Internal server error
 */
