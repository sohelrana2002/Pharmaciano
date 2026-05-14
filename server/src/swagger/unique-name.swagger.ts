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
 *     description: Returns distinct (unique) names for organization, branch, role, and warehouse.
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
 *                     warehouseName:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["central-warehouse", "rajshahi-warehouse"]
 *       404:
 *         description: Collection data not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Collection name not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 */
