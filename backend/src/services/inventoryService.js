import * as inventoryRepo from '../repositories/inventoryRepository.js';
import * as outletRepo    from '../repositories/outletRepository.js';
import * as menuItemRepo  from '../repositories/menuItemRepository.js';

export const getOutletInventory = async (outletId) => {
  const outlet = await outletRepo.findById(outletId);
  if (!outlet) {
    const err = new Error('Outlet not found');
    err.statusCode = 404;
    throw err;
  }
  return inventoryRepo.findByOutlet(outletId);
};

export const setStock = async (outletId, menuItemId, quantity, lowStockThreshold) => {
  // Verify both exist
  const outlet = await outletRepo.findById(outletId);
  if (!outlet) {
    const err = new Error('Outlet not found');
    err.statusCode = 404;
    throw err;
  }
  const menuItem = await menuItemRepo.findById(menuItemId);
  if (!menuItem) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }
  return inventoryRepo.setStock(outletId, menuItemId, quantity, lowStockThreshold);
};

export const adjustStock = async (outletId, menuItemId, adjustment) => {
  const inventory = await inventoryRepo.findOne(outletId, menuItemId);
  if (!inventory) {
    const err = new Error('Inventory record not found');
    err.statusCode = 404;
    throw err;
  }

  // Pre-check before hitting DB constraint
  if (inventory.quantity_on_hand + adjustment < 0) {
    const err = new Error(`Insufficient stock. Current: ${inventory.quantity_on_hand}, adjustment: ${adjustment}`);
    err.statusCode = 400;
    throw err;
  }

  return inventoryRepo.adjustStock(outletId, menuItemId, adjustment);
};


