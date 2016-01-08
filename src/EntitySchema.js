export default class EntitySchema {
  constructor(key, options = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('A string non-empty key is required');
    }

    this._key = key;

    const idAttribute = options.idAttribute || 'id';
    this._getId = typeof idAttribute === 'function' ? idAttribute : x => x[idAttribute];

    this._template = options.template || {};
  }

  getKey() {
    return this._key;
  }

  getTemplate() {
    return this._template;
  }

  getId(entity) {
    return this._getId(entity);
  }

  getAssociations() {
    return Object.keys(this).filter(k => !k.startsWith('_'));
  }

  define(nestedSchema) {
    for (let key in nestedSchema) {
      if (nestedSchema.hasOwnProperty(key)) {
        this[key] = nestedSchema[key];
      }
    }
    return this;
  }

  hasOne(association, key = association.getKey()) {
    this.define({
      [key]: association
    });
    return this;
  }

  belongsTo(association, key = this.getKey()) {
    association.define({
      [key]: this,
    });
    return this;
  }

  hasMany(association, key = association.getKey()) {
    this.define({
      [key]: arrayOf(association)
    });
    return this;
  }

  hasAndBelongsToMany(association, key = association.getKey()) {
    // to avoid (nearly) infinite association nesting
    const _this = Object.assign({}, this);
    this.hasMany(association, key);
    association.hasMany(_this, this.getKey());
    return this;
  }
}
