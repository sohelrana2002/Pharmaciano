/**
 * @swagger
 * tags:
 *   name: Medicines
 *   description: API endpoints for managing medicines
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Napa
 *         genericName:
 *           type: string
 *           example: Paracetamol
 *         categoryName:
 *           type: string
 *           example: Painkiller
 *         brandName:
 *           type: string
 *           example: Beximco
 *         dosageForm:
 *           type: string
 *           example: Tablet
 *         strength:
 *           type: string
 *           example: 500
 *         unit:
 *           type: string
 *           example: mg
 *         unitPrice:
 *           type: number
 *           example: 2
 *         unitsPerStrip:
 *           type: number
 *           example: 10
 *         stripPrice:
 *           type: number
 *           example: 20
 *         isPrescriptionRequired:
 *           type: boolean
 *           example: false
 *         taxRate:
 *           type: number
 *           example: 5
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/medicines:
 *   post:
 *     summary: Create a new medicine
 *     tags: [Medicines]
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
 *               - genericName
 *               - categoryName
 *               - brandName
 *               - dosageForm
 *               - strength
 *               - unit
 *               - unitPrice
 *               - unitsPerStrip
 *             properties:
 *               name:
 *                 type: string
 *               genericName:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               brandName:
 *                 type: string
 *               dosageForm:
 *                 type: string
 *               strength:
 *                 type: string
 *               unit:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               unitsPerStrip:
 *                 type: number
 *               isPrescriptionRequired:
 *                 type: boolean
 *               taxRate:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Invalid category or brand name
 *       409:
 *         description: Medicine already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/medicines:
 *   get:
 *     summary: Get list of all active medicines
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medicines
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
 *                     medicine:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Medicine'
 *       404:
 *         description: No medicine found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   get:
 *     summary: Get individual medicine details
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medicine'
 *       404:
 *         description: Medicine not found
 *       409:
 *         description: Invalid medicine ID
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   put:
 *     summary: Update an existing medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               genericName:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               brandName:
 *                 type: string
 *               dosageForm:
 *                 type: string
 *               strength:
 *                 type: string
 *               unit:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               unitsPerStrip:
 *                 type: number
 *               isPrescriptionRequired:
 *                 type: boolean
 *               taxRate:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Medicine not found or invalid category/brand
 *       409:
 *         description: Duplicate medicine name or invalid ID
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   delete:
 *     summary: Delete a medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine deleted successfully
 *       404:
 *         description: Medicine not found
 *       409:
 *         description: Invalid medicine ID
 *       500:
 *         description: Internal server error
 */
