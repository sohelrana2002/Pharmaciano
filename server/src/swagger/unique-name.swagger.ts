/**
 * @swagger
 * tags:
 *   name: All necessary unique name
 *   description: Common APIs for fetching shared resources
 */

/**
 * @swagger
 * /api/v1/unique-names:
 *   get:
 *     summary: Get all unique names from multiple collections
 *     description: Returns distinct (unique) names for organization, branch, role, medicine, category, brand, and batch numbers.
 *     tags: [All necessary unique name]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unique names fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Unique name found successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizationName:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["ABC Pharma", "XYZ Ltd"]
 *                     branchName:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Dhaka Branch", "Chittagong Branch"]
 *                     roleName:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Admin", "Manager", "Cashier"]
 *                     medicineName:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Napa", "Seclo"]
 *                     categoryName:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Tablet", "Capsule"]
 *                     brandName:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Beximco", "Square"]
 *                     batchNo:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["BATCH-001", "BATCH-002"]
 *       404:
 *         description: কোনো নির্দিষ্ট collection এ data পাওয়া যায়নি
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Organization name not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 */
