import * as outletRepo from "../repositories/outletRepository.js";
import * as menuItemRepo from "../repositories/menuItemRepository.js";
import * as inventoryRepo from "../repositories/inventoryRepository.js";

export const getAllOutlets = async () => {
  return outletRepo.findAll();
};

export const getOutletById = async (id) => {
  const outlet = await outletRepo.findById(id);
  if (!outlet) {
    const err = new Error("Outlet not found");
    err.statusCode = 404;
    throw err;
  }
  return outlet;
};

export const createOutlet = async (body) => {
  return outletRepo.create(body);
};

export const updateOutlet = async (id, fields) => {
  const outlet = await outletRepo.update(id, fields);
  if (!outlet) {
    const err = new Error("Outlet not found");
    err.statusCode = 404;
    throw err;
  }
  return outlet;
};

// Menu Assignment

export const getOutletMenu = async (outletId) => {
  await getOutletById(outletId);
  return outletRepo.findOutletMenu(outletId);
};

export const assignMenuItemToOutlet = async (
  outletId,
  { menu_item_id, override_price },
) => {
  await getOutletById(outletId);

  const menuItem = await menuItemRepo.findById(menu_item_id);
  if (!menuItem) {
    const err = new Error("Menu item not found");
    err.statusCode = 404;
    throw err;
  }

  const existing = await outletRepo.findOutletMenuItem(outletId, menu_item_id);
  if (existing) {
    const err = new Error("Menu item already assigned to this outlet");
    err.statusCode = 409;
    throw err;
  }

  // Assign menu item
  const assignment = await outletRepo.assignMenuItem({
    outlet_id: outletId,
    menu_item_id,
    override_price,
  });

  // Auto-create inventory row with 0 stock when item is assigned
  await inventoryRepo.setStock(outletId, menu_item_id, 0);

  return assignment;
};

export const updateOutletMenuItemAssignment = async (
  outletId,
  menuItemId,
  fields,
) => {
  const assignment = await outletRepo.updateMenuItemAssignment(
    outletId,
    menuItemId,
    fields,
  );
  if (!assignment) {
    const err = new Error("Assignment not found");
    err.statusCode = 404;
    throw err;
  }
  return assignment;
};

export const removeOutletMenuItemAssignment = async (outletId, menuItemId) => {
  const removed = await outletRepo.removeMenuItemAssignment(
    outletId,
    menuItemId,
  );
  if (!removed) {
    const err = new Error("Assignment not found");
    err.statusCode = 404;
    throw err;
  }

  const inventoryRemoved = await inventoryRepo.removeInventory(
    outletId,
    menuItemId,
  );
  if (!inventoryRemoved) {
    console.warn(
      `[inventory] No inventory row found for outlet=${outletId} item=${menuItemId} — skipped`,
    );
    const err = new Error("No inventory row found ");
    err.statusCode = 404;
    throw err;
  }

  return true;
};
