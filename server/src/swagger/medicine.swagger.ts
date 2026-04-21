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
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         genericName:
 *           type: string
 *         dosageForm:
 *           type: string
 *         strength:
 *           type: number
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
 *         isActive:
 *           type: boolean
 *         barcode:
 *           type: string
 *         searchText:
 *           type: string
 *         categoryId:
 *           type: string
 *         brandId:
 *           type: string
 *         organizationId:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time

 *     CreateMedicineUser:
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
 *       properties:
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
 *           type: number
 *         unit:
 *           type: string
 *         unitPrice:
 *           type: number
 *         unitsPerStrip:
 *           type: number
 *         isPrescriptionRequired:
 *           type: boolean
 *         taxRate:
 *           type: number
 *         isActive:
 *           type: boolean

 *     CreateMedicineSuperAdmin:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateMedicineUser'
 *         - type: object
 *           required:
 *             - organizationName
 *           properties:
 *             organizationName:
 *               type: string
 *               description: Required for Super Admin

 *     UpdateMedicineUser:
 *       type: object
 *       properties:
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
 *           type: number
 *         unit:
 *           type: string
 *         unitPrice:
 *           type: number
 *         unitsPerStrip:
 *           type: number
 *         isPrescriptionRequired:
 *           type: boolean
 *         taxRate:
 *           type: number
 *         isActive:
 *           type: boolean

 *     UpdateMedicineSuperAdmin:
 *       allOf:
 *         - $ref: '#/components/schemas/UpdateMedicineUser'
 *         - type: object
 *           properties:
 *             organizationName:
 *               type: string
 *               description: Only for Super Admin

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

 *     medicineLimit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 20

 *     medicineSearch:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search medicine by name, generic name or barcode (e.g. napa, paracetamol, MED-XXXX)

 *     isActive:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: boolean
 */

/**
 * @swagger
 * /api/v1/medicines:
 *   post:
 *     summary: Create a new medicine
 *     tags: [Medicines]
 *     description: |
 *       - Normal users: organization comes from token
 *       - Super Admin: must provide organizationName
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateMedicineUser'
 *               - $ref: '#/components/schemas/CreateMedicineSuperAdmin'
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       404:
 *         description: Organization / Category / Brand not found
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
 *       - $ref: '#/components/parameters/medicineLimit'
 *       - $ref: '#/components/parameters/medicineSearch'
 *       - $ref: '#/components/parameters/isActive'
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
 *     description: |
 *       - Normal users: cannot change organization
 *       - Super Admin: can update organizationName
 *     parameters:
 *       - $ref: '#/components/parameters/medicineId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateMedicineUser'
 *               - $ref: '#/components/schemas/UpdateMedicineSuperAdmin'
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *       404:
 *         description: Not found
 *       409:
 *         description: Duplicate medicine
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
 *         description: Not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
