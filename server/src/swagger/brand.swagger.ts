/**
 * @swagger
 * tags:
 *   name: Brand
 *   description: Brand management APIs
 */

/**
 * @swagger
 * /api/v1/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brand]
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
 *                 example: Panadol
 *               manufacturer:
 *                 type: string
 *                 example: GlaxoSmithKline
 *               country:
 *                 type: string
 *                 example: UK
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
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Get list of brands
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter brands by active status
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
 *                 total:
 *                   type: integer
 *                 active:
 *                   type: integer
 *                 inActive:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     brands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Get individual brand info
 *     tags: [Brand]
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
 *         description: Brand info found
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
 *       404:
 *         description: Brand not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   put:
 *     summary: Update brand info
 *     tags: [Brand]
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
 *               manufacturer:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       404:
 *         description: Brand not found
 *       409:
 *         description: Duplicate brand name
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   delete:
 *     summary: Delete a brand
 *     tags: [Brand]
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
 *       404:
 *         description: Brand not found
 *       500:
 *         description: Server error
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
 *         organizationId:
 *           type: string
 *         branchId:
 *           type: string
 *         warehouseId:
 *           type: string
 *         name:
 *           type: string
 *         manufacturer:
 *           type: string
 *         country:
 *           type: string
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
