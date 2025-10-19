const jwt = require('jsonwebtoken');

// Mock Firestore-like database for development
class MockQuery {
  constructor(data = []) {
    this.data = data;
    this.filters = [];
    this.orderByField = null;
    this.orderByDirection = 'asc';
  }

  where(field, operator, value) {
    const newQuery = new MockQuery(this.data);
    newQuery.filters = [...this.filters, { field, operator, value }];
    newQuery.orderByField = this.orderByField;
    newQuery.orderByDirection = this.orderByDirection;
    return newQuery;
  }

  orderBy(field, direction = 'asc') {
    const newQuery = new MockQuery(this.data);
    newQuery.filters = [...this.filters];
    newQuery.orderByField = field;
    newQuery.orderByDirection = direction;
    return newQuery;
  }

  async get() {
    let filtered = this.data;
    for (const filter of this.filters) {
      filtered = filtered.filter(doc => {
        const docValue = doc.data[filter.field];
        if (filter.operator === '==') return docValue === filter.value;
        if (filter.operator === '<') return docValue < filter.value;
        if (filter.operator === '>') return docValue > filter.value;
        if (filter.operator === '<=') return docValue <= filter.value;
        if (filter.operator === '>=') return docValue >= filter.value;
        return true;
      });
    }

    if (this.orderByField) {
      filtered.sort((a, b) => {
        const aVal = a.data[this.orderByField];
        const bVal = b.data[this.orderByField];
        if (aVal < bVal) return this.orderByDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.orderByDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return {
      docs: filtered,
      empty: filtered.length === 0,
    };
  }
}

class MockDocRef {
  constructor(path, db) {
    this.path = path;
    this.db = db;
  }

  collection(name) {
    return new MockCollectionRef(`${this.path}/${name}`, this.db);
  }

  async get() {
    const data = this.db.getDoc(this.path);
    return {
      exists: !!data,
      data: () => data,
      id: this.path.split('/').pop(),
    };
  }

  async set(data) {
    this.db.setDoc(this.path, data);
  }

  async update(data) {
    this.db.updateDoc(this.path, data);
  }

  async delete() {
    this.db.deleteDoc(this.path);
  }
}

class MockCollectionRef {
  constructor(path, db) {
    this.path = path;
    this.db = db;
  }

  doc(id) {
    return new MockDocRef(`${this.path}/${id}`, this.db);
  }

  where(field, operator, value) {
    const docs = this.db.getCollection(this.path);
    const query = new MockQuery(docs);
    return query.where(field, operator, value);
  }

  async get() {
    const docs = this.db.getCollection(this.path);
    return {
      docs,
      empty: docs.length === 0,
    };
  }

  async add(data) {
    const id = `doc_${Date.now()}`;
    this.db.setDoc(`${this.path}/${id}`, data);
    return { id };
  }
}

class MockFirestore {
  constructor() {
    this.store = new Map();
  }

  collection(name) {
    return new MockCollectionRef(name, this);
  }

  getCollection(path) {
    const prefix = path + '/';
    const docs = [];
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith(prefix)) {
        const id = key.substring(prefix.length).split('/')[0];
        docs.push({
          id,
          data: () => value,
        });
      }
    }
    return docs;
  }

  getDoc(path) {
    return this.store.get(path);
  }

  setDoc(path, data) {
    this.store.set(path, data);
  }

  updateDoc(path, data) {
    const existing = this.store.get(path) || {};
    this.store.set(path, { ...existing, ...data });
  }

  deleteDoc(path) {
    this.store.delete(path);
  }
}

const mockDb = new MockFirestore();

const initializeFirebase = () => {
  console.log('✅ Firebase initialized in mock mode (development)');
  console.log('📝 Using in-memory database for development');
};

const getDb = () => {
  return mockDb;
};

const getAuth = () => {
  return {
    createUser: async (email, password) => {
      const uid = `user_${Date.now()}`;
      return { uid, email };
    },
    verifyIdToken: async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        return decoded;
      } catch (error) {
        throw new Error('Invalid token');
      }
    },
  };
};

module.exports = {
  initializeFirebase,
  getDb,
  getAuth,
};

