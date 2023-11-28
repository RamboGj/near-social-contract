function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }
  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }
  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }
  return desc;
}

// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
  PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
  TypeBrand["BIGINT"] = "bigint";
  TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
function assert(expression, message) {
  if (!expression) {
    throw new Error("assertion failed: " + message);
  }
}
function getValueWithOptions(value, options = {
  deserializer: deserialize
}) {
  if (value === null) {
    return options?.defaultValue ?? null;
  }
  const deserialized = deserialize(value);
  if (deserialized === undefined || deserialized === null) {
    return options?.defaultValue ?? null;
  }
  if (options?.reconstructor) {
    return options.reconstructor(deserialized);
  }
  return deserialized;
}
function serializeValueWithOptions(value, {
  serializer
} = {
  serializer: serialize
}) {
  return serializer(value);
}
function serialize(valueToSerialize) {
  return encode(JSON.stringify(valueToSerialize, function (key, value) {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [TYPE_KEY]: TypeBrand.BIGINT
      };
    }
    if (typeof this[key] === "object" && this[key] !== null && this[key] instanceof Date) {
      return {
        value: this[key].toISOString(),
        [TYPE_KEY]: TypeBrand.DATE
      };
    }
    return value;
  }));
}
function deserialize(valueToDeserialize) {
  return JSON.parse(decode(valueToDeserialize), (_, value) => {
    if (value !== null && typeof value === "object" && Object.keys(value).length === 2 && Object.keys(value).every(key => ["value", TYPE_KEY].includes(key))) {
      switch (value[TYPE_KEY]) {
        case TypeBrand.BIGINT:
          return BigInt(value["value"]);
        case TypeBrand.DATE:
          return new Date(value["value"]);
      }
    }
    return value;
  });
}
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
function bytes(s) {
  return env.latin1_string_to_uint8array(s);
}
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
function str(a) {
  return env.uint8array_to_latin1_string(a);
}
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
function encode(s) {
  return env.utf8_string_to_uint8array(s);
}
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
function decode(a) {
  return env.uint8array_to_utf8_string(a);
}

var CurveType;
(function (CurveType) {
  CurveType[CurveType["ED25519"] = 0] = "ED25519";
  CurveType[CurveType["SECP256K1"] = 1] = "SECP256K1";
})(CurveType || (CurveType = {}));
var DataLength;
(function (DataLength) {
  DataLength[DataLength["ED25519"] = 32] = "ED25519";
  DataLength[DataLength["SECP256K1"] = 64] = "SECP256K1";
})(DataLength || (DataLength = {}));

/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
var PromiseResult;
(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
var PromiseError;
(function (PromiseError) {
  PromiseError[PromiseError["Failed"] = 0] = "Failed";
  PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
function log(...params) {
  env.log(params.reduce((accumulated, parameter, index) => {
    // Stringify undefined
    const param = parameter === undefined ? "undefined" : parameter;
    // Convert Objects to strings and convert to string
    const stringified = typeof param === "object" ? JSON.stringify(param) : `${param}`;
    if (index === 0) {
      return stringified;
    }
    return `${accumulated} ${stringified}`;
  }, ""));
}
/**
 * Returns the account ID of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
function signerAccountId() {
  env.signer_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
function currentAccountId() {
  env.current_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the current block timestamp.
 */
function blockTimestamp() {
  return env.block_timestamp();
}
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
function attachedDeposit() {
  return env.attached_deposit();
}
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
function storageReadRaw(key) {
  const returnValue = env.storage_read(key, 0);
  if (returnValue !== 1n) {
    return null;
  }
  return env.read_register(0);
}
/**
 * Checks for the existance of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
function storageHasKeyRaw(key) {
  return env.storage_has_key(key) === 1n;
}
/**
 * Checks for the existance of a value under the provided utf-8 string key in NEAR storage.
 *
 * @param key - The utf-8 string key to check for in storage.
 */
function storageHasKey(key) {
  return storageHasKeyRaw(encode(key));
}
/**
 * Get the last written or removed value from NEAR storage.
 */
function storageGetEvictedRaw() {
  return env.read_register(EVICTED_REGISTER);
}
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
function storageWriteRaw(key, value) {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
function storageRemoveRaw(key) {
  return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided utf-8 string key from NEAR storage.
 *
 * @param key - The utf-8 string key to be removed.
 */
function storageRemove(key) {
  return storageRemoveRaw(encode(key));
}
/**
 * Returns the arguments passed to the current smart contract call.
 */
function inputRaw() {
  env.input(0);
  return env.read_register(0);
}
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 */
function input() {
  return decode(inputRaw());
}

/**
 * A lookup map that stores data in NEAR storage.
 */
class LookupMap {
  /**
   * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }
  /**
   * Checks whether the collection contains the value.
   *
   * @param key - The value for which to check the presence.
   */
  containsKey(key) {
    const storageKey = this.keyPrefix + key;
    return storageHasKey(storageKey);
  }
  /**
   * Get the data stored at the provided key.
   *
   * @param key - The key at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(key, options) {
    const storageKey = this.keyPrefix + key;
    const value = storageReadRaw(encode(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes and retrieves the element with the provided key.
   *
   * @param key - The key at which to remove data.
   * @param options - Options for retrieving the data.
   */
  remove(key, options) {
    const storageKey = this.keyPrefix + key;
    if (!storageRemove(storageKey)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Store a new value at the provided key.
   *
   * @param key - The key at which to store in the collection.
   * @param newValue - The value to store in the collection.
   * @param options - Options for retrieving and storing the data.
   */
  set(key, newValue, options) {
    const storageKey = this.keyPrefix + key;
    const storageValue = serializeValueWithOptions(newValue, options);
    if (!storageWriteRaw(encode(storageKey), storageValue)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of key-value pairs.
   *
   * @param keyValuePairs - The key-value pairs to extend the collection with.
   * @param options - Options for storing the data.
   */
  extend(keyValuePairs, options) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value, options);
    }
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    return new LookupMap(data.keyPrefix);
  }
}

function indexToKey(prefix, index) {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);
  const key = str(array);
  return prefix + key;
}
/**
 * An iterable implementation of vector that stores its content on the trie.
 * Uses the following map: index -> element
 */
class Vector {
  /**
   * @param prefix - The byte prefix to use when storing elements inside this collection.
   * @param length - The initial length of the collection. By default 0.
   */
  constructor(prefix, length = 0) {
    this.prefix = prefix;
    this.length = length;
  }
  /**
   * Checks whether the collection is empty.
   */
  isEmpty() {
    return this.length === 0;
  }
  /**
   * Get the data stored at the provided index.
   *
   * @param index - The index at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(index, options) {
    if (index >= this.length) {
      return options?.defaultValue ?? null;
    }
    const storageKey = indexToKey(this.prefix, index);
    const value = storageReadRaw(bytes(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes an element from the vector and returns it in serialized form.
   * The removed element is replaced by the last element of the vector.
   * Does not preserve ordering, but is `O(1)`.
   *
   * @param index - The index at which to remove the element.
   * @param options - Options for retrieving and storing the data.
   */
  swapRemove(index, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    if (index + 1 === this.length) {
      return this.pop(options);
    }
    const key = indexToKey(this.prefix, index);
    const last = this.pop(options);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(last, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Adds data to the collection.
   *
   * @param element - The data to store.
   * @param options - Options for storing the data.
   */
  push(element, options) {
    const key = indexToKey(this.prefix, this.length);
    this.length += 1;
    storageWriteRaw(bytes(key), serializeValueWithOptions(element, options));
  }
  /**
   * Removes and retrieves the element with the highest index.
   *
   * @param options - Options for retrieving the data.
   */
  pop(options) {
    if (this.isEmpty()) {
      return options?.defaultValue ?? null;
    }
    const lastIndex = this.length - 1;
    const lastKey = indexToKey(this.prefix, lastIndex);
    this.length -= 1;
    assert(storageRemoveRaw(bytes(lastKey)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Replaces the data stored at the provided index with the provided data and returns the previously stored data.
   *
   * @param index - The index at which to replace the data.
   * @param element - The data to replace with.
   * @param options - Options for retrieving and storing the data.
   */
  replace(index, element, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    const key = indexToKey(this.prefix, index);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(element, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of elements.
   *
   * @param elements - The elements to extend the collection with.
   */
  extend(elements) {
    for (const element of elements) {
      this.push(element);
    }
  }
  [Symbol.iterator]() {
    return new VectorIterator(this);
  }
  /**
   * Create a iterator on top of the default collection iterator using custom options.
   *
   * @param options - Options for retrieving and storing the data.
   */
  createIteratorWithOptions(options) {
    return {
      [Symbol.iterator]: () => new VectorIterator(this, options)
    };
  }
  /**
   * Return a JavaScript array of the data stored within the collection.
   *
   * @param options - Options for retrieving and storing the data.
   */
  toArray(options) {
    const array = [];
    const iterator = options ? this.createIteratorWithOptions(options) : this;
    for (const value of iterator) {
      array.push(value);
    }
    return array;
  }
  /**
   * Remove all of the elements stored within the collection.
   */
  clear() {
    for (let index = 0; index < this.length; index++) {
      const key = indexToKey(this.prefix, index);
      storageRemoveRaw(bytes(key));
    }
    this.length = 0;
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    const vector = new Vector(data.prefix, data.length);
    return vector;
  }
}
/**
 * An iterator for the Vector collection.
 */
class VectorIterator {
  /**
   * @param vector - The vector collection to create an iterator for.
   * @param options - Options for retrieving and storing data.
   */
  constructor(vector, options) {
    this.vector = vector;
    this.options = options;
    this.current = 0;
  }
  next() {
    if (this.current >= this.vector.length) {
      return {
        value: null,
        done: true
      };
    }
    const value = this.vector.get(this.current, this.options);
    this.current += 1;
    return {
      value,
      done: false
    };
  }
}

/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
function view(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
function call({
  privateFunction = false,
  payableFunction = false
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, descriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (...args) {
      if (privateFunction && predecessorAccountId() !== currentAccountId()) {
        throw new Error("Function is private");
      }
      if (!payableFunction && attachedDeposit() > 0n) {
        throw new Error("Function is not payable");
      }
      return originalMethod.apply(this, args);
    };
  };
}
function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return target => {
    return class extends target {
      static _create() {
        return new target();
      }
      static _getState() {
        const rawState = storageReadRaw(bytes("STATE"));
        return rawState ? this._deserialize(rawState) : null;
      }
      static _saveToStorage(objectToSave) {
        storageWriteRaw(bytes("STATE"), this._serialize(objectToSave));
      }
      static _getArgs() {
        return JSON.parse(input() || "{}");
      }
      static _serialize(value, forReturn = false) {
        if (forReturn) {
          return encode(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
        }
        return serializer(value);
      }
      static _deserialize(value) {
        return deserializer(value);
      }
      static _reconstruct(classObject, plainObject) {
        for (const item in classObject) {
          const reconstructor = classObject[item].constructor?.reconstruct;
          classObject[item] = reconstructor ? reconstructor(plainObject[item]) : plainObject[item];
        }
        return classObject;
      }
      static _requireInit() {
        return requireInit;
      }
    };
  };
}

class Post {
  constructor({
    author,
    content,
    timestamp
  }) {
    this.author = author;
    this.content = content;
    this.timestamp = timestamp;
  }
}
class User {
  constructor({
    username
  }) {
    this.username = username;
    this.friends = [];
    this.posts = [];
  }
}

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2;
// Social Midia Smart Contract with Near to connect with RE-NFT test
// REQUIREMENTS:
/*
 - GET all posts - DONE
 - GET specific user posts - DONE
 - CALL create new post - DONE

 - GET friends from user - DONE
 - GET posts from user friends - DONE
 - CALL add friend - DONE

 - CALL create user - DONE
*/
let SocialNear = (_dec = NearBindgen({}), _dec2 = view(), _dec3 = view(), _dec4 = view(), _dec5 = view(), _dec6 = view(), _dec7 = call({}), _dec8 = call({}), _dec9 = call({}), _dec(_class = (_class2 = class SocialNear {
  users = new LookupMap("accountId"); // accountId => User
  friends = new LookupMap("accountId"); // accountId => User[]
  posts = new Vector("v-uid"); // Post[]

  get_all_posts() {
    log(`All posts: ${this.posts.toArray()}`);
    return this.posts.toArray();
  }
  get_post_by_user(username) {
    const posts = this.users.get(username).posts;
    log(`Specific posts from ${username}: ${posts}`);
    return posts;
  }
  get_posts_from_user_friends() {
    const friendsPosts = [];
    const user = this.users.get(signerAccountId());
    log("User: " + user);
    const userFriends = this.friends.get(signerAccountId());
    log("userFriends", userFriends);
    userFriends.forEach(({
      posts
    }) => {
      friendsPosts.push(...posts);
    });
    log("friendsPosts: " + friendsPosts);
    return friendsPosts;
  }
  get_user(accountId) {
    log(this.users.get(accountId));
    return this.users.get(signerAccountId());
  }
  get_user_friends(username) {
    const user = this.users.get(signerAccountId());
    const friends = user.friends;
    log(`${username} friends are: ${friends}`);
    return friends;
  }
  add_post({
    content
  }) {
    const userExists = verifyUserExistence(this.users);
    assert(userExists, "User is not registered on the platform.");
    const newPost = new Post({
      author: signerAccountId(),
      content,
      timestamp: blockTimestamp()
    }); // I need to divide near.blockTimestamp() by 1000000 ( 10**6) on FE

    log(`New post: ${newPost}`);

    // Add post to posts array
    // Add post to user posts array
    this.posts.push(newPost);
    this.users.get(signerAccountId()).posts.push(newPost);
  }
  add_new_friend(accountId) {
    const userToAddFriend = this.users.get(signerAccountId());
    log("userToAddFriend", userToAddFriend);
    const friendAlreadyAdded = userToAddFriend.friends.filter(friend => {
      return friend.username === accountId;
    }).length > 0 ? true : false;
    assert(!friendAlreadyAdded, "Friend already added. Reverting call.");
    const friend = this.users.get(accountId);

    // Add friend to user friends array
    userToAddFriend.friends.push(friend);
  }

  // call this when user connect wallet for the first time
  create_user() {
    const userExists = verifyUserExistence(this.users);
    assert(!userExists, "User already exist. Reverting call.");
    const newUser = new User({
      username: signerAccountId()
    });
    this.users.set(signerAccountId(), newUser);
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "get_all_posts", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "get_all_posts"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_post_by_user", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "get_post_by_user"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_posts_from_user_friends", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "get_posts_from_user_friends"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_user", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "get_user"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_user_friends", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "get_user_friends"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "add_post", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "add_post"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "add_new_friend", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "add_new_friend"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "create_user", [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "create_user"), _class2.prototype)), _class2)) || _class);
function create_user() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.create_user(_args);
  SocialNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function add_new_friend() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.add_new_friend(_args);
  SocialNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function add_post() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.add_post(_args);
  SocialNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function get_user_friends() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.get_user_friends(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function get_user() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.get_user(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function get_posts_from_user_friends() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.get_posts_from_user_friends(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function get_post_by_user() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.get_post_by_user(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function get_all_posts() {
  const _state = SocialNear._getState();
  if (!_state && SocialNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = SocialNear._create();
  if (_state) {
    SocialNear._reconstruct(_contract, _state);
  }
  const _args = SocialNear._getArgs();
  const _result = _contract.get_all_posts(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(SocialNear._serialize(_result, true));
}
function verifyUserExistence(users) {
  const userExists = users.containsKey(signerAccountId());
  log("user", userExists);
  log("users.get(near.signerAccountId())", users.get(signerAccountId()));
  return userExists;
}

export { add_new_friend, add_post, create_user, get_all_posts, get_post_by_user, get_posts_from_user_friends, get_user, get_user_friends };
//# sourceMappingURL=social_near.js.map
