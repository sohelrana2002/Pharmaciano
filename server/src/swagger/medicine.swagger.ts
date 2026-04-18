/**
 * @swagger
 * tags:
 *   - name: Medicines
 *     description: Medicine management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       required:
 *         - name
 *         - genericName
 *         - categoryName
 *         - brandName
 *         - dosageForm
 *         - strength
 *         - unit
 *         - unitPrice
 *         - unitsPerStrip
 *         - isPrescriptionRequired
 *         - taxRate
 *         - isActive
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         name:
 *           type: string
 *         genericName:
 *           type: string
 *         categoryName:
 *           type: string
 *         brandName:
 *           type: string
 *         dosageForm:
 *           type: string
 *         strength:
 *           type: string
 *         unit:
 *           type: string
 *         unitPrice:
 *           type: number
 *         unitsPerStrip:
 *           type: number
 *         stripPrice:
 *           type: number
 *         isPrescriptionRequired:
 *           type: boolean
 *         taxRate:
 *           type: number
 *         categoryId:
 *           type: string
 *         brandId:
 *           type: string
 *         createdBy:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   parameters:
 *     medicineId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Medicine ID
 *     page:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *     limit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 20
 *     isActive:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: boolean
 *     medicineSearch:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search by name, strength, or unit
 */

/**
 * @swagger
 * /api/v1/medicines:
 *   post:
 *     summary: Create a new medicine
 *     tags: [Medicines]
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
 *               - isPrescriptionRequired
 *               - taxRate
 *               - isActive
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
 *         description: Invalid category or brand
 *       409:
 *         description: Medicine already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/medicines:
 *   get:
 *     summary: Get list of medicines
 *     tags: [Medicines]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/isActive'
 *       - $ref: '#/components/parameters/medicineSearch'
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
 *                 total:
 *                   type: integer
 *                 active:
 *                   type: integer
 *                 inActive:
 *                   type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     count:
 *                       type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     medicine:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Medicine'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   get:
 *     summary: Get individual medicine info
 *     tags: [Medicines]
 *     parameters:
 *       - $ref: '#/components/parameters/medicineId'
 *     responses:
 *       200:
 *         description: Medicine found
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
 *                     medicine:
 *                       $ref: '#/components/schemas/Medicine'
 *       404:
 *         description: Medicine not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   put:
 *     summary: Update a medicine
 *     tags: [Medicines]
 *     parameters:
 *       - $ref: '#/components/parameters/medicineId'
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
 *         description: Validation failed or invalid ID
 *       404:
 *         description: Medicine, category, or brand not found
 *       409:
 *         description: Duplicate medicine name
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/medicines/{id}:
 *   delete:
 *     summary: Delete a medicine
 *     tags: [Medicines]
 *     parameters:
 *       - $ref: '#/components/parameters/medicineId'
 *     responses:
 *       200:
 *         description: Medicine deleted successfully
 *       404:
 *         description: Medicine not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
