const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure store file exists
if (!fs.existsSync(STORE_PATH)) {
  fs.writeFileSync(
    STORE_PATH,
    JSON.stringify({ users: [], tasks: [] }, null, 2),
    'utf-8'
  );
}

function readData() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], tasks: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Failed to write store.json:', err.message);
  }
}

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 6)
  );
}

const isMongoActive = () => mongoose.connection.readyState === 1;

/**
 * Fallback User Storage
 */
const FallbackUser = {
  async findOne({ email }) {
    const data = readData();
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const found = data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) return null;

    // Attach matchPassword method
    return {
      ...found,
      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, found.password);
      },
    };
  },

  async findById(id) {
    const data = readData();
    const found = data.users.find((u) => u._id === id || u.id === id);
    if (!found) return null;
    return {
      ...found,
      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, found.password);
      },
      async save() {
        const d = readData();
        const index = d.users.findIndex((u) => u._id === found._id);
        if (index !== -1) {
          d.users[index] = { ...d.users[index], ...this };
          writeData(d);
        }
        return this;
      },
    };
  },

  async create({ name, email, password, avatar = '' }) {
    const data = readData();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: generateId(),
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    writeData(data);

    return {
      ...newUser,
      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, newUser.password);
      },
    };
  },
};

/**
 * Fallback Task Storage
 */
const FallbackTask = {
  find(query = {}) {
    const data = readData();
    let results = [...data.tasks];

    // Filter by user
    if (query.user) {
      const targetUser = query.user.toString();
      results = results.filter((t) => t.user && t.user.toString() === targetUser);
    }

    // Status filter
    if (query.status) {
      results = results.filter((t) => t.status === query.status);
    }

    // Priority filter
    if (query.priority) {
      if (query.priority.$in) {
        results = results.filter((t) => query.priority.$in.includes(t.priority));
      } else {
        results = results.filter((t) => t.priority === query.priority);
      }
    }

    // Search filter
    if (query.$or) {
      results = results.filter((t) => {
        return query.$or.some((condition) => {
          if (condition.title) {
            const regex = condition.title.$regex;
            return new RegExp(regex, condition.title.$options || 'i').test(t.title || '');
          }
          if (condition.description) {
            const regex = condition.description.$regex;
            return new RegExp(regex, condition.description.$options || 'i').test(t.description || '');
          }
          if (condition.location) {
            const regex = condition.location.$regex;
            return new RegExp(regex, condition.location.$options || 'i').test(t.location || '');
          }
          return false;
        });
      });
    }

    // Location filter
    if (query.location && query.location.$regex) {
      const reg = new RegExp(query.location.$regex, query.location.$options || 'i');
      results = results.filter((t) => reg.test(t.location || ''));
    }

    // Tag filter
    if (query.tags) {
      results = results.filter((t) => t.tags && t.tags.includes(query.tags));
    }

    // Due date filter
    if (query.dueDate) {
      if (query.dueDate.$gte) {
        const start = new Date(query.dueDate.$gte).getTime();
        results = results.filter((t) => t.dueDate && new Date(t.dueDate).getTime() >= start);
      }
      if (query.dueDate.$lte) {
        const end = new Date(query.dueDate.$lte).getTime();
        results = results.filter((t) => t.dueDate && new Date(t.dueDate).getTime() <= end);
      }
      if (query.dueDate.$lt) {
        const now = new Date(query.dueDate.$lt).getTime();
        results = results.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now);
      }
    }

    const queryObj = {
      _data: results,
      sort(sortObj = { createdAt: -1 }) {
        const [field, order] = Object.entries(sortObj)[0] || ['createdAt', -1];
        this._data.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (!valA && !valB) return 0;
          if (!valA) return 1;
          if (!valB) return -1;
          if (order === 1) return valA > valB ? 1 : -1;
          return valA < valB ? 1 : -1;
        });
        return this;
      },
      skip(count = 0) {
        this._data = this._data.slice(count);
        return this;
      },
      limit(count = 10) {
        this._data = this._data.slice(0, count);
        return this;
      },
      then(resolve, reject) {
        try {
          resolve(this._data);
        } catch (err) {
          reject(err);
        }
      },
    };

    return queryObj;
  },

  async countDocuments(query = {}) {
    const q = this.find(query);
    return q._data.length;
  },

  async findOne({ _id, user }) {
    const data = readData();
    const targetUser = user ? user.toString() : null;
    const found = data.tasks.find(
      (t) => t._id === _id && (!targetUser || t.user.toString() === targetUser)
    );
    if (!found) return null;

    return {
      ...found,
      toObject() {
        return { ...this };
      },
      async save() {
        const d = readData();
        const index = d.tasks.findIndex((t) => t._id === found._id);
        if (index !== -1) {
          d.tasks[index] = {
            ...d.tasks[index],
            ...this,
            updatedAt: new Date().toISOString(),
          };
          writeData(d);
        }
        return d.tasks[index];
      },
    };
  },

  async create(taskData) {
    const data = readData();
    const newTask = {
      _id: generateId(),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.tasks.push(newTask);
    writeData(data);
    return {
      ...newTask,
      toObject() {
        return { ...this };
      },
    };
  },

  async findOneAndDelete({ _id, user }) {
    const data = readData();
    const targetUser = user ? user.toString() : null;
    const index = data.tasks.findIndex(
      (t) => t._id === _id && (!targetUser || t.user.toString() === targetUser)
    );
    if (index === -1) return null;

    const removed = data.tasks.splice(index, 1)[0];
    writeData(data);
    return removed;
  },
};

module.exports = {
  isMongoActive,
  FallbackUser,
  FallbackTask,
};
