import bcrypt    from 'bcrypt';
import jwt       from 'jsonwebtoken';
import config    from '../config/app.js';
import userRepo  from '../repositories/userRepository.js';

const authService = {

  async login(username, password) {
    const user = await userRepo.findByUsername(username);
    if (!user)            throw { statusCode: 401, message: 'Invalid credentials.' };
    if (!user.is_active)  throw { statusCode: 403, message: 'Account is disabled.' };

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw { statusCode: 401, message: 'Invalid credentials.' };

    const payload = {
      sub:       user.id,
      role:      user.role,
      outlet_id: user.outlet_id,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    return {
      token,
      user: {
        id:        user.id,
        username:  user.username,
        role:      user.role,
        outlet_id: user.outlet_id,
      },
    };
  },

  async createUser({ username, password, role, outlet_id }) {
    const existing = await userRepo.findByUsername(username);
    if (existing) throw { statusCode: 409, message: 'Username already taken.' };

    const hashed = await bcrypt.hash(password, 10);
    return userRepo.create({ username, password: hashed, role, outlet_id });
  },

  async getUsers() {
    return userRepo.findAll();
  },

  async setUserActive(id, is_active) {
    const user = await userRepo.setActive(id, is_active);
    if (!user) throw { statusCode: 404, message: 'User not found.' };
    return user;
  },
};

export default authService;
