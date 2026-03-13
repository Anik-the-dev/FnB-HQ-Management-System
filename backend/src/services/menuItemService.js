
import * as menuItemRepo from '../repositories/menuItemRepository.js';

export const getAllMenuItems = async (query) => {         
  const { category, isActive } = query;
  return menuItemRepo.findAll({
    category,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  });
};

export const getMenuItemById = async (id) => {
  const item = await menuItemRepo.findById(id);
  if (!item) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
};

export const createMenuItem = async (body) => {
  return menuItemRepo.create(body);
};

export const updateMenuItem = async (id, fields) => {
  const item = await menuItemRepo.update(id, fields);
  if (!item) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
};

export const deleteMenuItem = async (id) => {
  const item = await menuItemRepo.softDelete(id);
  if (!item) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
};
