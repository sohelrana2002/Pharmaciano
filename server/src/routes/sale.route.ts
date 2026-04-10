import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  saleSchemaValidator,
  updateSaleValidator,
} from "../validators/sale.validator";
import {
  createSale,
  saleList,
  saleInfo,
  updateSale,
  deleteSale,
  createPDF,
} from "../controllers/sale.controller";

const router = Router();

// create sales
router.post(
  "/",
  authenticate,
  authorize(["cashier:manage", "superAdmin:manage"]),
  validate(saleSchemaValidator),
  createSale,
);

// list of sales
router.get(
  "/",
  authenticate,
  authorize(["cashier:manage", "superAdmin:manage"]),
  saleList,
);

// individual sale info
router.get(
  "/:id",
  authenticate,
  authorize(["cashier:manage", "superAdmin:manage"]),
  saleInfo,
);

// update sale
router.put(
  "/:id",
  authenticate,
  authorize(["cashier:manage", "superAdmin:manage"]),
  validate(updateSaleValidator),
  updateSale,
);

// delete sale
router.delete(
  "/:id",
  authenticate,
  authorize(["cashier:manage", "superAdmin:manage"]),
  deleteSale,
);

// generate invoice
router.get(
  "/:id/invoice",
  authenticate,
  authorize(["cashier:manage"]),
  createPDF,
);

export default router;
