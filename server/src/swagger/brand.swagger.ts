/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: API endpoints for managing brands
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d789
 *         name:
 *           type: string
 *           example: Pfizer
 *         manufacturer:
 *           type: string
 *           example: Pfizer Inc.
 *         country:
 *           type: string
 *           example: USA
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdBy:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d123
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
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
 *               - manufacturer
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pfizer
 *               manufacturer:
 *                 type: string
 *                 example: Pfizer Inc.
 *               country:
 *                 type: string
 *                 example: USA
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Brand already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Get list of all active brands
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 length:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     brands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Get individual brand info
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details
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
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Invalid brand ID
 *       404:
 *         description: Brand not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   put:
 *     summary: Update an existing brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pfizer Updated
 *               manufacturer:
 *                 type: string
 *                 example: Pfizer Ltd.
 *               country:
 *                 type: string
 *                 example: UK
 *     responses:
 *       200:
 *         description: Brand updated successfully
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
 *       400:
 *         description: Validation failed or invalid ID
 *       404:
 *         description: Brand not found
 *       409:
 *         description: Brand name already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   delete:
 *     summary: Delete a brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       400:
 *         description: Invalid brand ID
 *       404:
 *         description: Brand not found
 *       500:
 *         description: Internal server error
 */
