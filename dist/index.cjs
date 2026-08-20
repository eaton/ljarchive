'use strict';

var is = require('@sindresorhus/is');
var leb = require('@thi.ng/leb128');
var zod = require('zod');
var dayjs = require('dayjs');
var fastXmlParser = require('fast-xml-parser');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var leb__namespace = /*#__PURE__*/_interopNamespaceDefault(leb);

class Context {
  code = "";
  scopes = [["vars"]];
  bitFields = [];
  tmpVariableCount = 0;
  references = /* @__PURE__ */ new Map();
  importPath;
  imports = [];
  reverseImports = /* @__PURE__ */ new Map();
  useContextVariables = false;
  constructor(importPath, useContextVariables) {
    this.importPath = importPath;
    this.useContextVariables = useContextVariables;
  }
  generateVariable(name) {
    const scopes = [...this.scopes[this.scopes.length - 1]];
    if (name) {
      scopes.push(name);
    }
    return scopes.join(".");
  }
  generateOption(val) {
    switch (typeof val) {
      case "number":
        return val.toString();
      case "string":
        return this.generateVariable(val);
      case "function":
        return `${this.addImport(val)}.call(${this.generateVariable()}, vars)`;
    }
  }
  generateError(err) {
    this.pushCode(`throw new Error(${err});`);
  }
  generateTmpVariable() {
    return "$tmp" + this.tmpVariableCount++;
  }
  pushCode(code) {
    this.code += code + "\n";
  }
  pushPath(name) {
    if (name) {
      this.scopes[this.scopes.length - 1].push(name);
    }
  }
  popPath(name) {
    if (name) {
      this.scopes[this.scopes.length - 1].pop();
    }
  }
  pushScope(name) {
    this.scopes.push([name]);
  }
  popScope() {
    this.scopes.pop();
  }
  addImport(im) {
    if (!this.importPath) return `(${im})`;
    let id = this.reverseImports.get(im);
    if (!id) {
      id = this.imports.push(im) - 1;
      this.reverseImports.set(im, id);
    }
    return `${this.importPath}[${id}]`;
  }
  addReference(alias) {
    if (!this.references.has(alias)) {
      this.references.set(alias, { resolved: false, requested: false });
    }
  }
  markResolved(alias) {
    const reference = this.references.get(alias);
    if (reference) {
      reference.resolved = true;
    }
  }
  markRequested(aliasList) {
    aliasList.forEach((alias) => {
      const reference = this.references.get(alias);
      if (reference) {
        reference.requested = true;
      }
    });
  }
  getUnresolvedReferences() {
    return Array.from(this.references).filter(([_, reference]) => !reference.resolved && !reference.requested).map(([alias, _]) => alias);
  }
}
const aliasRegistry = /* @__PURE__ */ new Map();
const FUNCTION_PREFIX = "___parser_";
const PRIMITIVE_SIZES = {
  uint8: 1,
  uint16le: 2,
  uint16be: 2,
  uint32le: 4,
  uint32be: 4,
  int8: 1,
  int16le: 2,
  int16be: 2,
  int32le: 4,
  int32be: 4,
  int64be: 8,
  int64le: 8,
  uint64be: 8,
  uint64le: 8,
  floatle: 4,
  floatbe: 4,
  doublele: 8,
  doublebe: 8
};
const PRIMITIVE_NAMES = {
  uint8: "Uint8",
  uint16le: "Uint16",
  uint16be: "Uint16",
  uint32le: "Uint32",
  uint32be: "Uint32",
  int8: "Int8",
  int16le: "Int16",
  int16be: "Int16",
  int32le: "Int32",
  int32be: "Int32",
  int64be: "BigInt64",
  int64le: "BigInt64",
  uint64be: "BigUint64",
  uint64le: "BigUint64",
  floatle: "Float32",
  floatbe: "Float32",
  doublele: "Float64",
  doublebe: "Float64"
};
const PRIMITIVE_LITTLE_ENDIANS = {
  uint8: false,
  uint16le: true,
  uint16be: false,
  uint32le: true,
  uint32be: false,
  int8: false,
  int16le: true,
  int16be: false,
  int32le: true,
  int32be: false,
  int64be: false,
  int64le: true,
  uint64be: false,
  uint64le: true,
  floatle: true,
  floatbe: false,
  doublele: true,
  doublebe: false
};
class Parser {
  varName = "";
  type = "";
  options = {};
  next;
  head;
  compiled;
  endian = "be";
  constructorFn;
  alias;
  useContextVariables = false;
  constructor() {
  }
  static start() {
    return new Parser();
  }
  primitiveGenerateN(type, ctx) {
    const typeName = PRIMITIVE_NAMES[type];
    const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
    ctx.pushCode(
      `${ctx.generateVariable(
        this.varName
      )} = dataView.get${typeName}(offset, ${littleEndian});`
    );
    ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]};`);
  }
  primitiveN(type, varName, options) {
    return this.setNextParser(type, varName, options);
  }
  useThisEndian(type) {
    return type + this.endian.toLowerCase();
  }
  uint8(varName, options = {}) {
    return this.primitiveN("uint8", varName, options);
  }
  uint16(varName, options = {}) {
    return this.primitiveN(this.useThisEndian("uint16"), varName, options);
  }
  uint16le(varName, options = {}) {
    return this.primitiveN("uint16le", varName, options);
  }
  uint16be(varName, options = {}) {
    return this.primitiveN("uint16be", varName, options);
  }
  uint32(varName, options = {}) {
    return this.primitiveN(this.useThisEndian("uint32"), varName, options);
  }
  uint32le(varName, options = {}) {
    return this.primitiveN("uint32le", varName, options);
  }
  uint32be(varName, options = {}) {
    return this.primitiveN("uint32be", varName, options);
  }
  int8(varName, options = {}) {
    return this.primitiveN("int8", varName, options);
  }
  int16(varName, options = {}) {
    return this.primitiveN(this.useThisEndian("int16"), varName, options);
  }
  int16le(varName, options = {}) {
    return this.primitiveN("int16le", varName, options);
  }
  int16be(varName, options = {}) {
    return this.primitiveN("int16be", varName, options);
  }
  int32(varName, options = {}) {
    return this.primitiveN(this.useThisEndian("int32"), varName, options);
  }
  int32le(varName, options = {}) {
    return this.primitiveN("int32le", varName, options);
  }
  int32be(varName, options = {}) {
    return this.primitiveN("int32be", varName, options);
  }
  bigIntVersionCheck() {
    if (!DataView.prototype.getBigInt64)
      throw new Error("BigInt64 is unsupported on this runtime");
  }
  int64(varName, options = {}) {
    this.bigIntVersionCheck();
    return this.primitiveN(this.useThisEndian("int64"), varName, options);
  }
  int64be(varName, options = {}) {
    this.bigIntVersionCheck();
    return this.primitiveN("int64be", varName, options);
  }
  int64le(varName, options = {}) {
    this.bigIntVersionCheck();
    return this.primitiveN("int64le", varName, options);
  }
  uint64(varName, options = {}) {
    this.bigIntVersionCheck();
    return this.primitiveN(this.useThisEndian("uint64"), varName, options);
  }
  uint64be(varName, options = {}) {
    this.bigIntVersionCheck();
    return this.primitiveN("uint64be", varName, options);
  }
  uint64le(varName, options = {}) {
    this.bigIntVersionCheck();
    return this.primitiveN("uint64le", varName, options);
  }
  floatle(varName, options = {}) {
    return this.primitiveN("floatle", varName, options);
  }
  floatbe(varName, options = {}) {
    return this.primitiveN("floatbe", varName, options);
  }
  doublele(varName, options = {}) {
    return this.primitiveN("doublele", varName, options);
  }
  doublebe(varName, options = {}) {
    return this.primitiveN("doublebe", varName, options);
  }
  bitN(size, varName, options) {
    options.length = size;
    return this.setNextParser("bit", varName, options);
  }
  bit1(varName, options = {}) {
    return this.bitN(1, varName, options);
  }
  bit2(varName, options = {}) {
    return this.bitN(2, varName, options);
  }
  bit3(varName, options = {}) {
    return this.bitN(3, varName, options);
  }
  bit4(varName, options = {}) {
    return this.bitN(4, varName, options);
  }
  bit5(varName, options = {}) {
    return this.bitN(5, varName, options);
  }
  bit6(varName, options = {}) {
    return this.bitN(6, varName, options);
  }
  bit7(varName, options = {}) {
    return this.bitN(7, varName, options);
  }
  bit8(varName, options = {}) {
    return this.bitN(8, varName, options);
  }
  bit9(varName, options = {}) {
    return this.bitN(9, varName, options);
  }
  bit10(varName, options = {}) {
    return this.bitN(10, varName, options);
  }
  bit11(varName, options = {}) {
    return this.bitN(11, varName, options);
  }
  bit12(varName, options = {}) {
    return this.bitN(12, varName, options);
  }
  bit13(varName, options = {}) {
    return this.bitN(13, varName, options);
  }
  bit14(varName, options = {}) {
    return this.bitN(14, varName, options);
  }
  bit15(varName, options = {}) {
    return this.bitN(15, varName, options);
  }
  bit16(varName, options = {}) {
    return this.bitN(16, varName, options);
  }
  bit17(varName, options = {}) {
    return this.bitN(17, varName, options);
  }
  bit18(varName, options = {}) {
    return this.bitN(18, varName, options);
  }
  bit19(varName, options = {}) {
    return this.bitN(19, varName, options);
  }
  bit20(varName, options = {}) {
    return this.bitN(20, varName, options);
  }
  bit21(varName, options = {}) {
    return this.bitN(21, varName, options);
  }
  bit22(varName, options = {}) {
    return this.bitN(22, varName, options);
  }
  bit23(varName, options = {}) {
    return this.bitN(23, varName, options);
  }
  bit24(varName, options = {}) {
    return this.bitN(24, varName, options);
  }
  bit25(varName, options = {}) {
    return this.bitN(25, varName, options);
  }
  bit26(varName, options = {}) {
    return this.bitN(26, varName, options);
  }
  bit27(varName, options = {}) {
    return this.bitN(27, varName, options);
  }
  bit28(varName, options = {}) {
    return this.bitN(28, varName, options);
  }
  bit29(varName, options = {}) {
    return this.bitN(29, varName, options);
  }
  bit30(varName, options = {}) {
    return this.bitN(30, varName, options);
  }
  bit31(varName, options = {}) {
    return this.bitN(31, varName, options);
  }
  bit32(varName, options = {}) {
    return this.bitN(32, varName, options);
  }
  namely(alias) {
    aliasRegistry.set(alias, this);
    this.alias = alias;
    return this;
  }
  skip(length, options = {}) {
    return this.seek(length, options);
  }
  seek(relOffset, options = {}) {
    if (options.assert) {
      throw new Error("assert option on seek is not allowed.");
    }
    return this.setNextParser("seek", "", { length: relOffset });
  }
  string(varName, options) {
    if (!options.zeroTerminated && !options.length && !options.greedy) {
      throw new Error(
        "One of length, zeroTerminated, or greedy must be defined for string."
      );
    }
    if ((options.zeroTerminated || options.length) && options.greedy) {
      throw new Error(
        "greedy is mutually exclusive with length and zeroTerminated for string."
      );
    }
    if (options.stripNull && !(options.length || options.greedy)) {
      throw new Error(
        "length or greedy must be defined if stripNull is enabled."
      );
    }
    options.encoding = options.encoding || "utf8";
    return this.setNextParser("string", varName, options);
  }
  buffer(varName, options) {
    if (!options.length && !options.readUntil) {
      throw new Error("length or readUntil must be defined for buffer.");
    }
    return this.setNextParser("buffer", varName, options);
  }
  wrapped(varName, options) {
    if (typeof options !== "object" && typeof varName === "object") {
      options = varName;
      varName = "";
    }
    if (!options || !options.wrapper || !options.type) {
      throw new Error("Both wrapper and type must be defined for wrapped.");
    }
    if (!options.length && !options.readUntil) {
      throw new Error("length or readUntil must be defined for wrapped.");
    }
    return this.setNextParser("wrapper", varName, options);
  }
  array(varName, options) {
    if (!options.readUntil && !options.length && !options.lengthInBytes) {
      throw new Error(
        "One of readUntil, length and lengthInBytes must be defined for array."
      );
    }
    if (!options.type) {
      throw new Error("type is required for array.");
    }
    if (typeof options.type === "string" && !aliasRegistry.has(options.type) && !(options.type in PRIMITIVE_SIZES)) {
      throw new Error(`Array element type "${options.type}" is unknown.`);
    }
    return this.setNextParser("array", varName, options);
  }
  choice(varName, options) {
    if (typeof options !== "object" && typeof varName === "object") {
      options = varName;
      varName = "";
    }
    if (!options) {
      throw new Error("tag and choices are are required for choice.");
    }
    if (!options.tag) {
      throw new Error("tag is requird for choice.");
    }
    if (!options.choices) {
      throw new Error("choices is required for choice.");
    }
    for (const keyString in options.choices) {
      const key = parseInt(keyString, 10);
      const value = options.choices[key];
      if (isNaN(key)) {
        throw new Error(`Choice key "${keyString}" is not a number.`);
      }
      if (typeof value === "string" && !aliasRegistry.has(value) && !(value in PRIMITIVE_SIZES)) {
        throw new Error(`Choice type "${value}" is unknown.`);
      }
    }
    return this.setNextParser("choice", varName, options);
  }
  nest(varName, options) {
    if (typeof options !== "object" && typeof varName === "object") {
      options = varName;
      varName = "";
    }
    if (!options || !options.type) {
      throw new Error("type is required for nest.");
    }
    if (!(options.type instanceof Parser) && !aliasRegistry.has(options.type)) {
      throw new Error("type must be a known parser name or a Parser object.");
    }
    if (!(options.type instanceof Parser) && !varName) {
      throw new Error(
        "type must be a Parser object if the variable name is omitted."
      );
    }
    return this.setNextParser("nest", varName, options);
  }
  pointer(varName, options) {
    if (options.offset == null) {
      throw new Error("offset is required for pointer.");
    }
    if (!options.type) {
      throw new Error("type is required for pointer.");
    }
    if (typeof options.type === "string" && !(options.type in PRIMITIVE_SIZES) && !aliasRegistry.has(options.type)) {
      throw new Error(`Pointer type "${options.type}" is unknown.`);
    }
    return this.setNextParser("pointer", varName, options);
  }
  saveOffset(varName, options = {}) {
    return this.setNextParser("saveOffset", varName, options);
  }
  endianness(endianness) {
    switch (endianness.toLowerCase()) {
      case "little":
        this.endian = "le";
        break;
      case "big":
        this.endian = "be";
        break;
      default:
        throw new Error('endianness must be one of "little" or "big"');
    }
    return this;
  }
  endianess(endianess) {
    return this.endianness(endianess);
  }
  useContextVars(useContextVariables = true) {
    this.useContextVariables = useContextVariables;
    return this;
  }
  create(constructorFn) {
    if (!(constructorFn instanceof Function)) {
      throw new Error("Constructor must be a Function object.");
    }
    this.constructorFn = constructorFn;
    return this;
  }
  getContext(importPath) {
    const ctx = new Context(importPath, this.useContextVariables);
    ctx.pushCode(
      "var dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);"
    );
    if (!this.alias) {
      this.addRawCode(ctx);
    } else {
      this.addAliasedCode(ctx);
      ctx.pushCode(`return ${FUNCTION_PREFIX + this.alias}(0).result;`);
    }
    return ctx;
  }
  getCode() {
    const importPath = "imports";
    return this.getContext(importPath).code;
  }
  addRawCode(ctx) {
    ctx.pushCode("var offset = 0;");
    ctx.pushCode(
      `var vars = ${this.constructorFn ? "new constructorFn()" : "{}"};`
    );
    ctx.pushCode("vars.$parent = null;");
    ctx.pushCode("vars.$root = vars;");
    this.generate(ctx);
    this.resolveReferences(ctx);
    ctx.pushCode("delete vars.$parent;");
    ctx.pushCode("delete vars.$root;");
    ctx.pushCode("return vars;");
  }
  addAliasedCode(ctx) {
    ctx.pushCode(`function ${FUNCTION_PREFIX + this.alias}(offset, context) {`);
    ctx.pushCode(
      `var vars = ${this.constructorFn ? "new constructorFn()" : "{}"};`
    );
    ctx.pushCode(
      "var ctx = Object.assign({$parent: null, $root: vars}, context || {});"
    );
    ctx.pushCode(`vars = Object.assign(vars, ctx);`);
    this.generate(ctx);
    ctx.markResolved(this.alias);
    this.resolveReferences(ctx);
    ctx.pushCode(
      "Object.keys(ctx).forEach(function (item) { delete vars[item]; });"
    );
    ctx.pushCode("return { offset: offset, result: vars };");
    ctx.pushCode("}");
    return ctx;
  }
  resolveReferences(ctx) {
    const references = ctx.getUnresolvedReferences();
    ctx.markRequested(references);
    references.forEach((alias) => {
      aliasRegistry.get(alias)?.addAliasedCode(ctx);
    });
  }
  compile() {
    const importPath = "imports";
    const ctx = this.getContext(importPath);
    this.compiled = new Function(
      importPath,
      "TextDecoder",
      `return function (buffer, constructorFn) { ${ctx.code} };`
    )(ctx.imports, TextDecoder);
  }
  sizeOf() {
    let size = NaN;
    if (Object.keys(PRIMITIVE_SIZES).indexOf(this.type) >= 0) {
      size = PRIMITIVE_SIZES[this.type];
    } else if (this.type === "string" && typeof this.options.length === "number") {
      size = this.options.length;
    } else if (this.type === "buffer" && typeof this.options.length === "number") {
      size = this.options.length;
    } else if (this.type === "array" && typeof this.options.length === "number") {
      let elementSize = NaN;
      if (typeof this.options.type === "string") {
        elementSize = PRIMITIVE_SIZES[this.options.type];
      } else if (this.options.type instanceof Parser) {
        elementSize = this.options.type.sizeOf();
      }
      size = this.options.length * elementSize;
    } else if (this.type === "seek") {
      size = this.options.length;
    } else if (this.type === "nest") {
      size = this.options.type.sizeOf();
    } else if (!this.type) {
      size = 0;
    }
    if (this.next) {
      size += this.next.sizeOf();
    }
    return size;
  }
  // Follow the parser chain till the root and start parsing from there
  parse(buffer) {
    if (!this.compiled) {
      this.compile();
    }
    return this.compiled(buffer, this.constructorFn);
  }
  setNextParser(type, varName, options) {
    const parser = new Parser();
    parser.type = type;
    parser.varName = varName;
    parser.options = options;
    parser.endian = this.endian;
    if (this.head) {
      this.head.next = parser;
    } else {
      this.next = parser;
    }
    this.head = parser;
    return this;
  }
  // Call code generator for this parser
  generate(ctx) {
    if (this.type) {
      switch (this.type) {
        case "uint8":
        case "uint16le":
        case "uint16be":
        case "uint32le":
        case "uint32be":
        case "int8":
        case "int16le":
        case "int16be":
        case "int32le":
        case "int32be":
        case "int64be":
        case "int64le":
        case "uint64be":
        case "uint64le":
        case "floatle":
        case "floatbe":
        case "doublele":
        case "doublebe":
          this.primitiveGenerateN(this.type, ctx);
          break;
        case "bit":
          this.generateBit(ctx);
          break;
        case "string":
          this.generateString(ctx);
          break;
        case "buffer":
          this.generateBuffer(ctx);
          break;
        case "seek":
          this.generateSeek(ctx);
          break;
        case "nest":
          this.generateNest(ctx);
          break;
        case "array":
          this.generateArray(ctx);
          break;
        case "choice":
          this.generateChoice(ctx);
          break;
        case "pointer":
          this.generatePointer(ctx);
          break;
        case "saveOffset":
          this.generateSaveOffset(ctx);
          break;
        case "wrapper":
          this.generateWrapper(ctx);
          break;
      }
      if (this.type !== "bit") this.generateAssert(ctx);
    }
    const varName = ctx.generateVariable(this.varName);
    if (this.options.formatter && this.type !== "bit") {
      this.generateFormatter(ctx, varName, this.options.formatter);
    }
    return this.generateNext(ctx);
  }
  generateAssert(ctx) {
    if (!this.options.assert) {
      return;
    }
    const varName = ctx.generateVariable(this.varName);
    switch (typeof this.options.assert) {
      case "function":
        {
          const func = ctx.addImport(this.options.assert);
          ctx.pushCode(`if (!${func}.call(vars, ${varName})) {`);
        }
        break;
      case "number":
        ctx.pushCode(`if (${this.options.assert} !== ${varName}) {`);
        break;
      case "string":
        ctx.pushCode(
          `if (${JSON.stringify(this.options.assert)} !== ${varName}) {`
        );
        break;
      default:
        throw new Error(
          "assert option must be a string, number or a function."
        );
    }
    ctx.generateError(
      `"Assertion error: ${varName} is " + ${JSON.stringify(
        this.options.assert.toString()
      )}`
    );
    ctx.pushCode("}");
  }
  // Recursively call code generators and append results
  generateNext(ctx) {
    if (this.next) {
      ctx = this.next.generate(ctx);
    }
    return ctx;
  }
  nextNotBit() {
    if (this.next) {
      if (this.next.type === "nest") {
        if (this.next.options && this.next.options.type instanceof Parser) {
          if (this.next.options.type.next) {
            return this.next.options.type.next.type !== "bit";
          }
          return false;
        } else {
          return true;
        }
      } else {
        return this.next.type !== "bit";
      }
    } else {
      return true;
    }
  }
  generateBit(ctx) {
    const parser = JSON.parse(JSON.stringify(this));
    parser.options = this.options;
    parser.generateAssert = this.generateAssert.bind(this);
    parser.generateFormatter = this.generateFormatter.bind(this);
    parser.varName = ctx.generateVariable(parser.varName);
    ctx.bitFields.push(parser);
    if (!this.next || this.nextNotBit()) {
      const val = ctx.generateTmpVariable();
      ctx.pushCode(`var ${val} = 0;`);
      const getMaxBits = (from = 0) => {
        let sum2 = 0;
        for (let i = from; i < ctx.bitFields.length; i++) {
          const length = ctx.bitFields[i].options.length;
          if (sum2 + length > 32) break;
          sum2 += length;
        }
        return sum2;
      };
      const getBytes = (sum2) => {
        if (sum2 <= 8) {
          ctx.pushCode(`${val} = dataView.getUint8(offset);`);
          sum2 = 8;
        } else if (sum2 <= 16) {
          ctx.pushCode(`${val} = dataView.getUint16(offset);`);
          sum2 = 16;
        } else if (sum2 <= 24) {
          ctx.pushCode(
            `${val} = (dataView.getUint16(offset) << 8) | dataView.getUint8(offset + 2);`
          );
          sum2 = 24;
        } else {
          ctx.pushCode(`${val} = dataView.getUint32(offset);`);
          sum2 = 32;
        }
        ctx.pushCode(`offset += ${sum2 / 8};`);
        return sum2;
      };
      let bitOffset = 0;
      const isBigEndian = this.endian === "be";
      let sum = 0;
      let rem = 0;
      ctx.bitFields.forEach((parser2, i) => {
        let length = parser2.options.length;
        if (length > rem) {
          if (rem) {
            const mask2 = -1 >>> 32 - rem;
            ctx.pushCode(
              `${parser2.varName} = (${val} & 0x${mask2.toString(16)}) << ${length - rem};`
            );
            length -= rem;
          }
          bitOffset = 0;
          rem = sum = getBytes(getMaxBits(i) - rem);
        }
        const offset = isBigEndian ? sum - bitOffset - length : bitOffset;
        const mask = -1 >>> 32 - length;
        ctx.pushCode(
          `${parser2.varName} ${length < parser2.options.length ? "|=" : "="} ${val} >> ${offset} & 0x${mask.toString(16)};`
        );
        if (parser2.options.length === 32) {
          ctx.pushCode(`${parser2.varName} >>>= 0`);
        }
        if (parser2.options.assert) {
          parser2.generateAssert(ctx);
        }
        if (parser2.options.formatter) {
          parser2.generateFormatter(
            ctx,
            parser2.varName,
            parser2.options.formatter
          );
        }
        bitOffset += length;
        rem -= length;
      });
      ctx.bitFields = [];
    }
  }
  generateSeek(ctx) {
    const length = ctx.generateOption(this.options.length);
    ctx.pushCode(`offset += ${length};`);
  }
  generateString(ctx) {
    const name = ctx.generateVariable(this.varName);
    const start = ctx.generateTmpVariable();
    const encoding = this.options.encoding;
    const isHex = encoding.toLowerCase() === "hex";
    const toHex = 'b => b.toString(16).padStart(2, "0")';
    if (this.options.length && this.options.zeroTerminated) {
      const len = this.options.length;
      ctx.pushCode(`var ${start} = offset;`);
      ctx.pushCode(
        `while(dataView.getUint8(offset++) !== 0 && offset - ${start} < ${len});`
      );
      const end = `offset - ${start} < ${len} ? offset - 1 : offset`;
      ctx.pushCode(
        isHex ? `${name} = Array.from(buffer.subarray(${start}, ${end}), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(${start}, ${end}));`
      );
    } else if (this.options.length) {
      const len = ctx.generateOption(this.options.length);
      ctx.pushCode(
        isHex ? `${name} = Array.from(buffer.subarray(offset, offset + ${len}), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(offset, offset + ${len}));`
      );
      ctx.pushCode(`offset += ${len};`);
    } else if (this.options.zeroTerminated) {
      ctx.pushCode(`var ${start} = offset;`);
      ctx.pushCode("while(dataView.getUint8(offset++) !== 0);");
      ctx.pushCode(
        isHex ? `${name} = Array.from(buffer.subarray(${start}, offset - 1), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(${start}, offset - 1));`
      );
    } else if (this.options.greedy) {
      ctx.pushCode(`var ${start} = offset;`);
      ctx.pushCode("while(buffer.length > offset++);");
      ctx.pushCode(
        isHex ? `${name} = Array.from(buffer.subarray(${start}, offset), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(${start}, offset));`
      );
    }
    if (this.options.stripNull) {
      ctx.pushCode(`${name} = ${name}.replace(/\\x00+$/g, '')`);
    }
  }
  generateBuffer(ctx) {
    const varName = ctx.generateVariable(this.varName);
    if (typeof this.options.readUntil === "function") {
      const pred = this.options.readUntil;
      const start = ctx.generateTmpVariable();
      const cur = ctx.generateTmpVariable();
      ctx.pushCode(`var ${start} = offset;`);
      ctx.pushCode(`var ${cur} = 0;`);
      ctx.pushCode(`while (offset < buffer.length) {`);
      ctx.pushCode(`${cur} = dataView.getUint8(offset);`);
      const func = ctx.addImport(pred);
      ctx.pushCode(
        `if (${func}.call(${ctx.generateVariable()}, ${cur}, buffer.subarray(offset))) break;`
      );
      ctx.pushCode(`offset += 1;`);
      ctx.pushCode(`}`);
      ctx.pushCode(`${varName} = buffer.subarray(${start}, offset);`);
    } else if (this.options.readUntil === "eof") {
      ctx.pushCode(`${varName} = buffer.subarray(offset);`);
    } else {
      const len = ctx.generateOption(this.options.length);
      ctx.pushCode(`${varName} = buffer.subarray(offset, offset + ${len});`);
      ctx.pushCode(`offset += ${len};`);
    }
    if (this.options.clone) {
      ctx.pushCode(`${varName} = buffer.constructor.from(${varName});`);
    }
  }
  generateArray(ctx) {
    const length = ctx.generateOption(this.options.length);
    const lengthInBytes = ctx.generateOption(this.options.lengthInBytes);
    const type = this.options.type;
    const counter = ctx.generateTmpVariable();
    const lhs = ctx.generateVariable(this.varName);
    const item = ctx.generateTmpVariable();
    const key = this.options.key;
    const isHash = typeof key === "string";
    if (isHash) {
      ctx.pushCode(`${lhs} = {};`);
    } else {
      ctx.pushCode(`${lhs} = [];`);
    }
    if (typeof this.options.readUntil === "function") {
      ctx.pushCode("do {");
    } else if (this.options.readUntil === "eof") {
      ctx.pushCode(
        `for (var ${counter} = 0; offset < buffer.length; ${counter}++) {`
      );
    } else if (lengthInBytes !== void 0) {
      ctx.pushCode(
        `for (var ${counter} = offset + ${lengthInBytes}; offset < ${counter}; ) {`
      );
    } else {
      ctx.pushCode(
        `for (var ${counter} = ${length}; ${counter} > 0; ${counter}--) {`
      );
    }
    if (typeof type === "string") {
      if (!aliasRegistry.get(type)) {
        const typeName = PRIMITIVE_NAMES[type];
        const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
        ctx.pushCode(
          `var ${item} = dataView.get${typeName}(offset, ${littleEndian});`
        );
        ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]};`);
      } else {
        const tempVar = ctx.generateTmpVariable();
        ctx.pushCode(`var ${tempVar} = ${FUNCTION_PREFIX + type}(offset, {`);
        if (ctx.useContextVariables) {
          const parentVar = ctx.generateVariable();
          ctx.pushCode(`$parent: ${parentVar},`);
          ctx.pushCode(`$root: ${parentVar}.$root,`);
          if (!this.options.readUntil && lengthInBytes === void 0) {
            ctx.pushCode(`$index: ${length} - ${counter},`);
          }
        }
        ctx.pushCode(`});`);
        ctx.pushCode(
          `var ${item} = ${tempVar}.result; offset = ${tempVar}.offset;`
        );
        if (type !== this.alias) ctx.addReference(type);
      }
    } else if (type instanceof Parser) {
      ctx.pushCode(`var ${item} = {};`);
      const parentVar = ctx.generateVariable();
      ctx.pushScope(item);
      if (ctx.useContextVariables) {
        ctx.pushCode(`${item}.$parent = ${parentVar};`);
        ctx.pushCode(`${item}.$root = ${parentVar}.$root;`);
        if (!this.options.readUntil && lengthInBytes === void 0) {
          ctx.pushCode(`${item}.$index = ${length} - ${counter};`);
        }
      }
      type.generate(ctx);
      if (ctx.useContextVariables) {
        ctx.pushCode(`delete ${item}.$parent;`);
        ctx.pushCode(`delete ${item}.$root;`);
        ctx.pushCode(`delete ${item}.$index;`);
      }
      ctx.popScope();
    }
    if (isHash) {
      ctx.pushCode(`${lhs}[${item}.${key}] = ${item};`);
    } else {
      ctx.pushCode(`${lhs}.push(${item});`);
    }
    ctx.pushCode("}");
    if (typeof this.options.readUntil === "function") {
      const pred = this.options.readUntil;
      const func = ctx.addImport(pred);
      ctx.pushCode(
        `while (!${func}.call(${ctx.generateVariable()}, ${item}, buffer.subarray(offset)));`
      );
    }
  }
  generateChoiceCase(ctx, varName, type) {
    if (typeof type === "string") {
      const varName2 = ctx.generateVariable(this.varName);
      if (!aliasRegistry.has(type)) {
        const typeName = PRIMITIVE_NAMES[type];
        const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
        ctx.pushCode(
          `${varName2} = dataView.get${typeName}(offset, ${littleEndian});`
        );
        ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]}`);
      } else {
        const tempVar = ctx.generateTmpVariable();
        ctx.pushCode(`var ${tempVar} = ${FUNCTION_PREFIX + type}(offset, {`);
        if (ctx.useContextVariables) {
          ctx.pushCode(`$parent: ${varName2}.$parent,`);
          ctx.pushCode(`$root: ${varName2}.$root,`);
        }
        ctx.pushCode(`});`);
        ctx.pushCode(
          `${varName2} = ${tempVar}.result; offset = ${tempVar}.offset;`
        );
        if (type !== this.alias) ctx.addReference(type);
      }
    } else if (type instanceof Parser) {
      ctx.pushPath(varName);
      type.generate(ctx);
      ctx.popPath(varName);
    }
  }
  generateChoice(ctx) {
    const tag = ctx.generateOption(this.options.tag);
    const nestVar = ctx.generateVariable(this.varName);
    if (this.varName) {
      ctx.pushCode(`${nestVar} = {};`);
      if (ctx.useContextVariables) {
        const parentVar = ctx.generateVariable();
        ctx.pushCode(`${nestVar}.$parent = ${parentVar};`);
        ctx.pushCode(`${nestVar}.$root = ${parentVar}.$root;`);
      }
    }
    ctx.pushCode(`switch(${tag}) {`);
    for (const tagString in this.options.choices) {
      const tag2 = parseInt(tagString, 10);
      const type = this.options.choices[tag2];
      ctx.pushCode(`case ${tag2}:`);
      this.generateChoiceCase(ctx, this.varName, type);
      ctx.pushCode("break;");
    }
    ctx.pushCode("default:");
    if (this.options.defaultChoice) {
      this.generateChoiceCase(ctx, this.varName, this.options.defaultChoice);
    } else {
      ctx.generateError(`"Met undefined tag value " + ${tag} + " at choice"`);
    }
    ctx.pushCode("}");
    if (this.varName && ctx.useContextVariables) {
      ctx.pushCode(`delete ${nestVar}.$parent;`);
      ctx.pushCode(`delete ${nestVar}.$root;`);
    }
  }
  generateNest(ctx) {
    const nestVar = ctx.generateVariable(this.varName);
    if (this.options.type instanceof Parser) {
      if (this.varName) {
        ctx.pushCode(`${nestVar} = {};`);
        if (ctx.useContextVariables) {
          const parentVar = ctx.generateVariable();
          ctx.pushCode(`${nestVar}.$parent = ${parentVar};`);
          ctx.pushCode(`${nestVar}.$root = ${parentVar}.$root;`);
        }
      }
      ctx.pushPath(this.varName);
      this.options.type.generate(ctx);
      ctx.popPath(this.varName);
      if (this.varName && ctx.useContextVariables) {
        if (ctx.useContextVariables) {
          ctx.pushCode(`delete ${nestVar}.$parent;`);
          ctx.pushCode(`delete ${nestVar}.$root;`);
        }
      }
    } else if (aliasRegistry.has(this.options.type)) {
      const tempVar = ctx.generateTmpVariable();
      ctx.pushCode(
        `var ${tempVar} = ${FUNCTION_PREFIX + this.options.type}(offset, {`
      );
      if (ctx.useContextVariables) {
        const parentVar = ctx.generateVariable();
        ctx.pushCode(`$parent: ${parentVar},`);
        ctx.pushCode(`$root: ${parentVar}.$root,`);
      }
      ctx.pushCode(`});`);
      ctx.pushCode(
        `${nestVar} = ${tempVar}.result; offset = ${tempVar}.offset;`
      );
      if (this.options.type !== this.alias) {
        ctx.addReference(this.options.type);
      }
    }
  }
  generateWrapper(ctx) {
    const wrapperVar = ctx.generateVariable(this.varName);
    const wrappedBuf = ctx.generateTmpVariable();
    if (typeof this.options.readUntil === "function") {
      const pred = this.options.readUntil;
      const start = ctx.generateTmpVariable();
      const cur = ctx.generateTmpVariable();
      ctx.pushCode(`var ${start} = offset;`);
      ctx.pushCode(`var ${cur} = 0;`);
      ctx.pushCode(`while (offset < buffer.length) {`);
      ctx.pushCode(`${cur} = dataView.getUint8(offset);`);
      const func2 = ctx.addImport(pred);
      ctx.pushCode(
        `if (${func2}.call(${ctx.generateVariable()}, ${cur}, buffer.subarray(offset))) break;`
      );
      ctx.pushCode(`offset += 1;`);
      ctx.pushCode(`}`);
      ctx.pushCode(`${wrappedBuf} = buffer.subarray(${start}, offset);`);
    } else if (this.options.readUntil === "eof") {
      ctx.pushCode(`${wrappedBuf} = buffer.subarray(offset);`);
    } else {
      const len = ctx.generateOption(this.options.length);
      ctx.pushCode(`${wrappedBuf} = buffer.subarray(offset, offset + ${len});`);
      ctx.pushCode(`offset += ${len};`);
    }
    if (this.options.clone) {
      ctx.pushCode(`${wrappedBuf} = buffer.constructor.from(${wrappedBuf});`);
    }
    const tempBuf = ctx.generateTmpVariable();
    const tempOff = ctx.generateTmpVariable();
    const tempView = ctx.generateTmpVariable();
    const func = ctx.addImport(this.options.wrapper);
    ctx.pushCode(
      `${wrappedBuf} = ${func}.call(this, ${wrappedBuf}).subarray(0);`
    );
    ctx.pushCode(`var ${tempBuf} = buffer;`);
    ctx.pushCode(`var ${tempOff} = offset;`);
    ctx.pushCode(`var ${tempView} = dataView;`);
    ctx.pushCode(`buffer = ${wrappedBuf};`);
    ctx.pushCode(`offset = 0;`);
    ctx.pushCode(
      `dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);`
    );
    if (this.options.type instanceof Parser) {
      if (this.varName) {
        ctx.pushCode(`${wrapperVar} = {};`);
      }
      ctx.pushPath(this.varName);
      this.options.type.generate(ctx);
      ctx.popPath(this.varName);
    } else if (aliasRegistry.has(this.options.type)) {
      const tempVar = ctx.generateTmpVariable();
      ctx.pushCode(
        `var ${tempVar} = ${FUNCTION_PREFIX + this.options.type}(0);`
      );
      ctx.pushCode(`${wrapperVar} = ${tempVar}.result;`);
      if (this.options.type !== this.alias) {
        ctx.addReference(this.options.type);
      }
    }
    ctx.pushCode(`buffer = ${tempBuf};`);
    ctx.pushCode(`dataView = ${tempView};`);
    ctx.pushCode(`offset = ${tempOff};`);
  }
  generateFormatter(ctx, varName, formatter) {
    if (typeof formatter === "function") {
      const func = ctx.addImport(formatter);
      ctx.pushCode(
        `${varName} = ${func}.call(${ctx.generateVariable()}, ${varName});`
      );
    }
  }
  generatePointer(ctx) {
    const type = this.options.type;
    const offset = ctx.generateOption(this.options.offset);
    const tempVar = ctx.generateTmpVariable();
    const nestVar = ctx.generateVariable(this.varName);
    ctx.pushCode(`var ${tempVar} = offset;`);
    ctx.pushCode(`offset = ${offset};`);
    if (this.options.type instanceof Parser) {
      ctx.pushCode(`${nestVar} = {};`);
      if (ctx.useContextVariables) {
        const parentVar = ctx.generateVariable();
        ctx.pushCode(`${nestVar}.$parent = ${parentVar};`);
        ctx.pushCode(`${nestVar}.$root = ${parentVar}.$root;`);
      }
      ctx.pushPath(this.varName);
      this.options.type.generate(ctx);
      ctx.popPath(this.varName);
      if (ctx.useContextVariables) {
        ctx.pushCode(`delete ${nestVar}.$parent;`);
        ctx.pushCode(`delete ${nestVar}.$root;`);
      }
    } else if (aliasRegistry.has(this.options.type)) {
      const tempVar2 = ctx.generateTmpVariable();
      ctx.pushCode(
        `var ${tempVar2} = ${FUNCTION_PREFIX + this.options.type}(offset, {`
      );
      if (ctx.useContextVariables) {
        const parentVar = ctx.generateVariable();
        ctx.pushCode(`$parent: ${parentVar},`);
        ctx.pushCode(`$root: ${parentVar}.$root,`);
      }
      ctx.pushCode(`});`);
      ctx.pushCode(
        `${nestVar} = ${tempVar2}.result; offset = ${tempVar2}.offset;`
      );
      if (this.options.type !== this.alias) {
        ctx.addReference(this.options.type);
      }
    } else if (Object.keys(PRIMITIVE_SIZES).indexOf(this.options.type) >= 0) {
      const typeName = PRIMITIVE_NAMES[type];
      const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
      ctx.pushCode(
        `${nestVar} = dataView.get${typeName}(offset, ${littleEndian});`
      );
      ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]};`);
    }
    ctx.pushCode(`offset = ${tempVar};`);
  }
  generateSaveOffset(ctx) {
    const varName = ctx.generateVariable(this.varName);
    ctx.pushCode(`${varName} = offset`);
  }
}

function ticksToDate(input) {
  const epochTicks = 621355968000000000n;
  const ticksPerMillisecond = 10000n;
  const maxDateMilliseconds = 8640000000000000n;
  const ticks = BigInt(input);
  const ticksSinceEpoch = ticks - epochTicks;
  const millisecondsSinceEpoch = ticksSinceEpoch / ticksPerMillisecond;
  if (millisecondsSinceEpoch > maxDateMilliseconds) {
    throw new Error("Result exceeds max Date");
  }
  if (millisecondsSinceEpoch === 0n) return void 0;
  return new Date(Number(millisecondsSinceEpoch));
}

const bool = Parser.start().nest({
  type: Parser.start().uint16le("type", { assert: 264 }).uint8("data", { formatter: (i) => !!i }),
  formatter: (v) => v.data
});
const bitmask = Parser.start().nest({
  type: Parser.start().uint16le("type", { assert: 2056 }).buffer("data", {
    length: 4,
    formatter: (b) => {
      const hex = b.toString("hex");
      return hex.length ? hex : void 0;
    }
  }),
  formatter: (i) => {
    if (i.data === void 0 || i.data === "00000000") {
      return void 0;
    } else {
      return i.data;
    }
  }
});
const entityIdField = Parser.start().nest({
  type: Parser.start().uint16("Check", { assert: 2056 }).uint32le("data"),
  formatter: (i) => i.data || void 0
});
const timestamp$1 = Parser.start().nest({
  type: Parser.start().uint16le("type", { assert: 3336 }).uint64le("data", { formatter: (t) => t === 0n ? void 0 : ticksToDate(t) }),
  formatter: (v) => v.data
});
const varStr = Parser.start().useContextVars(true).nest({
  type: Parser.start().buffer("offset", {
    length: 3,
    formatter: (b) => leb__namespace.decodeULEB128(new Uint8Array(b))
  }).seek(function(...args) {
    const offset = this.offset[1] - 3;
    return offset;
  }).string("string", {
    length: function() {
      const length = Number(this.offset[0]);
      return length;
    }
  }),
  formatter: function(data) {
    return data.string || void 0;
  }
});
const strings = /* @__PURE__ */ new Map();
function resetStringTable() {
  strings.clear();
}
const optStr = Parser.start().useContextVars().nest({
  type: Parser.start().uint8("fieldType", { assert: (t) => t === 6 || t === 9 }).uint32le("fieldID").choice("data", {
    tag: "fieldType",
    choices: {
      6: Parser.start().nest({ type: varStr }),
      9: Parser.start()
    }
  }),
  formatter: (v) => {
    if (v.fieldType === 9) {
      return strings.get(v.fieldID);
    }
    if (is.emptyObject(v.data)) {
      return void 0;
    }
    if (typeof v.data === "string") {
      strings.set(v.fieldID, v.data);
    }
    return v.data;
  }
});
const recordCount = Parser.start().nest({
  type: Parser.start().int8("marker").int8("id").int32le("unknown1").int32le("unknown2").int32le("length").seek(1).array("spacers", { type: optStr, length: "length" }),
  formatter: (data) => data.length
});
const recordHeader = Parser.start().nest({
  type: Parser.start().uint8("marker", { assert: 16 }).uint32le("recordId").uint32le("fieldCount"),
  formatter: () => ({})
});

const fileHeader = Parser.start().seek(22).nest("assembly", { type: varStr }).seek(5).nest("class", { type: varStr }).uint32le("tableCount").array("tableNames", { type: varStr, length: "tableCount" }).seek("tableCount").array("tableTypes", { type: varStr, length: "tableCount", formatter: () => void 0 }).seek(4).array("tableSpacer", { type: optStr, length: "tableCount", formatter: () => void 0 }).nest("optionsRows", { type: recordCount }).nest("moodsRows", { type: recordCount }).nest("userpicsRows", { type: recordCount }).nest("usersRows", { type: recordCount }).nest("eventsRows", { type: recordCount }).nest("commentsRows", { type: recordCount });
const fileFooter = Parser.start().seek(5).nest("serializer", { type: varStr }).seek(4).nest("data", { type: varStr }).nest("unity", { type: varStr }).nest("assembly", { type: varStr }).seek(4);
const options$1 = Parser.start().nest({ type: recordHeader }).nest("server", { type: optStr }).nest("defaultUserPic", { type: optStr }).nest("fullName", { type: optStr }).nest("userName", { type: optStr }).nest("passwordHash", { type: optStr }).nest("lastSynced", { type: timestamp$1 }).nest("unknown", { type: bool });
const mood$1 = Parser.start().nest({ type: recordHeader }).nest("id", { type: entityIdField }).nest("name", { type: optStr }).nest("parentId", { type: entityIdField });
const userPic$1 = Parser.start().nest({ type: recordHeader }).nest("keyword", { type: optStr }).nest("url", { type: optStr });
const user$1 = Parser.start().nest({ type: recordHeader }).nest("id", { type: entityIdField }).nest("name", { type: optStr });
const event$2 = Parser.start().nest({
  type: Parser.start().nest({ type: recordHeader }).nest("id", { type: entityIdField }).nest("date", { type: timestamp$1 }).nest("security", { type: optStr }).nest("audience", { type: bitmask }).nest("subject", { type: optStr }).nest("body", { type: optStr }).nest("unknown1", { type: optStr }).nest("mood", { type: optStr }).nest("moodId", { type: entityIdField }).nest("music", { type: optStr }).nest("isPreformatted", { type: bool }).nest("noComments", { type: bool }).nest("userPicKeyword", { type: optStr }).nest("unknown2", { type: bool }).nest("isBackdated", { type: bool }).nest("noEmail", { type: bool }).nest("unknown2", { type: bool }).nest("revision", { type: entityIdField }).nest("commentAlter", { type: entityIdField }).nest("syndicationId", { type: optStr }).nest("syndicationUrl", { type: optStr }).nest("lastModified", { type: timestamp$1 })
});
const comment$2 = Parser.start().useContextVars().nest({
  type: Parser.start().nest({ type: recordHeader }).nest("id", { type: entityIdField }).nest("userId", { type: entityIdField }).nest("commentStatus", { type: optStr }).nest("eventId", { type: entityIdField }).nest("parentId", { type: entityIdField }).nest("body", { type: optStr }).nest("subject", { type: optStr }).nest("date", { type: timestamp$1 })
});
const file$2 = Parser.start().endianess("little").nest("header", { type: fileHeader }).nest("options", { type: options$1 }).array("moods", {
  type: mood$1,
  length: function() {
    return this.header.moodsRows;
  }
}).array("userPics", {
  type: userPic$1,
  length: function() {
    return this.header.userpicsRows;
  }
}).array("users", {
  type: user$1,
  length: function() {
    return this.header.usersRows;
  }
}).array("events", {
  type: event$2,
  length: function() {
    return this.header.eventsRows;
  }
}).array("comments", {
  type: comment$2,
  length: function() {
    return this.header.commentsRows;
  }
}).nest("footer", { type: fileFooter });

const options = zod.z.object({
  defaultUserPic: zod.z.string().url().optional(),
  userName: zod.z.string(),
  fullName: zod.z.string()
});
const mood = zod.z.object({
  id: zod.z.number(),
  name: zod.z.string(),
  parentId: zod.z.number().optional()
});
const user = zod.z.object({
  id: zod.z.number().default(0),
  name: zod.z.string()
});
const userPic = zod.z.object({
  keyword: zod.z.string().optional(),
  url: zod.z.string().optional()
});
const event$1 = zod.z.object({
  id: zod.z.number(),
  date: zod.z.coerce.date(),
  security: zod.z.string().optional(),
  audience: zod.z.string().optional(),
  subject: zod.z.string().optional(),
  body: zod.z.string().optional(),
  mood: zod.z.string().optional(),
  moodId: zod.z.number().optional(),
  music: zod.z.string().optional(),
  isPreformatted: zod.z.boolean().optional(),
  noComments: zod.z.boolean().optional(),
  userPicKeyword: zod.z.string().optional(),
  isBackdated: zod.z.boolean().optional(),
  noEmail: zod.z.boolean().optional(),
  revision: zod.z.number().optional(),
  commentAlter: zod.z.number().optional(),
  syndicationId: zod.z.string().optional(),
  syndicationUrl: zod.z.string().optional(),
  lastModified: zod.z.coerce.date().optional()
});
const comment$1 = zod.z.object({
  id: zod.z.number(),
  /** Resolve the author's name through `users`, which is keyed by this id. */
  userId: zod.z.number().default(0),
  /**
   * LiveJournal's comment state: `A`ctive, `D`eleted, `S`creened. Left as a
   * plain string rather than an enum — an unrecognized value would fail
   * validation, and the array-level `.catch()` would then drop the whole
   * comment rather than the one field.
   */
  commentStatus: zod.z.string().optional(),
  eventId: zod.z.number(),
  parentId: zod.z.number().optional(),
  body: zod.z.string().optional(),
  subject: zod.z.string().optional(),
  /**
   * Optional because a deleted comment has none. LJArchive keeps those as
   * tombstones — id, author, and a `D` status, with no date, body, or subject
   * — and requiring a date drops every one of them, silently, via the
   * array-level `.catch()`. The record that a comment existed and was removed
   * is worth keeping.
   */
  date: zod.z.coerce.date().optional()
});
const schema$2 = zod.z.object({
  options,
  moods: zod.z.array(mood.optional().catch(() => void 0)).transform((i) => i.filter((i2) => i2 !== void 0)),
  userPics: zod.z.array(userPic.optional().catch(() => void 0)).transform((m) => m.filter((i) => i !== void 0)),
  users: zod.z.array(user.optional().catch(() => void 0)).transform((m) => m.filter((i) => i !== void 0)),
  events: zod.z.array(event$1.optional().catch(() => void 0)).transform((m) => m.filter((i) => i !== void 0)),
  comments: zod.z.array(comment$1.optional().catch(() => void 0)).transform((m) => m.filter((i) => i !== void 0))
});

function parse$2(input) {
  resetStringTable();
  const raw = file$2.parse(input);
  return schema$2.parse(raw);
}

var index$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  file: file$2,
  parse: parse$2,
  schema: schema$2
});

const file$1 = {
  parse: function(input, options = {}) {
    const parser = new fastXmlParser.XMLParser(options);
    return parser.parse(input.toString());
  }
};
function oneOrMany(schema2) {
  return schema2.or(zod.z.array(schema2)).transform((i) => i !== void 0 && Array.isArray(i) ? i : [i]);
}
const pdate = zod.z.string().transform((d) => dayjs(d).toDate());
const comment = zod.z.object({
  itemid: zod.z.number(),
  parentId: zod.z.number().optional(),
  event: zod.z.string().optional(),
  eventtime: pdate,
  author: zod.z.object({
    name: zod.z.string(),
    email: zod.z.string().optional()
  })
});
const event = zod.z.object({
  itemid: zod.z.number(),
  eventtime: pdate,
  subject: zod.z.string().optional(),
  event: zod.z.string().optional(),
  current_mood: zod.z.string().optional(),
  current_music: zod.z.string().optional(),
  comment: oneOrMany(comment).optional()
});
const schema$1 = zod.z.object({
  livejournal: zod.z.object({
    entry: oneOrMany(event)
  })
});

function parse$1(input) {
  const raw = file$1.parse(input);
  return schema$1.parse(raw);
}

var index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  file: file$1,
  parse: parse$1,
  schema: schema$1
});

const varString = Parser.start().nest({
  type: Parser.start().uint16le("mark").seek(1).uint8("length", { formatter: (l) => l * 2 }).choice("data", {
    tag: "length",
    choices: {
      510: Parser.start().nest({
        type: Parser.start().uint16le("length", { formatter: (l) => l * 2 }).string("string", { length: "length", encoding: "utf-16le" })
      }),
      0: Parser.start()
    },
    defaultChoice: Parser.start().nest({
      type: Parser.start().seek(-1).uint8("length", { formatter: (l) => l * 2 }).string("string", { length: "length", encoding: "utf-16le" })
    })
  }),
  formatter: (d) => d.data?.string || void 0
});
const timestamp = Parser.start().nest({
  type: Parser.start().uint32le("data", { formatter: (t) => new Date(t * 1e3) }),
  formatter: (v) => v.data
});
const file = Parser.start().endianess("little").uint16le("check1", { assert: 65535 }).uint16le("check2", { assert: 8 }).uint16le("check3", { assert: 6 }).string("typeCode", { length: 10, stripNull: true, assert: "CEntry" }).array("unknownStrings", { type: varString, length: 11 }).int32le("id").int32le("unknown1").nest("userName", { type: varString }).nest("fullName", { type: varString }).nest("body", { type: varString }).nest("subject", { type: varString }).int32le("unknown2").int32le("unknown3").nest("date", { type: timestamp }).int32le("unknown4").nest("music", { type: varString }).nest("mood", { type: varString }).int32le("moodId").nest("userPic", { type: varString });

const schema = zod.z.object({
  id: zod.z.number(),
  date: zod.z.date(),
  userName: zod.z.string().optional(),
  fullName: zod.z.string().optional(),
  subject: zod.z.string().optional(),
  body: zod.z.string().optional(),
  mood: zod.z.string().optional(),
  music: zod.z.string().optional(),
  userPic: zod.z.string().optional()
});

function parse(input) {
  const raw = file.parse(input);
  return schema.parse(raw);
}

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  file: file,
  parse: parse,
  schema: schema,
  timestamp: timestamp
});

function parseCutTag(markup, trim = false) {
  const cutExp = /<lj-cut(?:\s+text=([^>]*))?>/is;
  const closeExp = /<\/lj-cut>/is;
  let cut = cutExp.exec(markup) ?? void 0;
  const output = {};
  if (!cut) {
    output.preCut = trim ? markup.trim() : markup;
  } else {
    let cutText = cut[1]?.replaceAll(/(^['"]|['"]$)/g, "");
    let [preCut, postCutRaw] = markup.split(cut[0]);
    let hiddenText = void 0;
    let postCut = void 0;
    if (closeExp.test(postCutRaw)) {
      [hiddenText, postCut] = postCutRaw.split(closeExp);
    } else {
      postCut = postCutRaw;
    }
    preCut = trim ? preCut?.trim() : preCut;
    cutText = trim ? cutText?.trim() : cutText;
    hiddenText = trim ? hiddenText?.trim() : hiddenText;
    postCut = trim ? postCut?.trim() : postCut;
    if (preCut) output.preCut = preCut;
    if (cutText) output.cutText = cutText;
    if (hiddenText) output.hiddenText = hiddenText;
    if (postCut) output.postCut = postCut;
  }
  return { ...output };
}

function parseUserTags(html) {
  const matches = html.matchAll(/<lj user=['"]?(\w*)['"]?[^>]*>/gi) ?? [];
  return Object.fromEntries([...matches].map((m) => [m[0], m[1]]));
}

exports.lja = index$2;
exports.parseCutTag = parseCutTag;
exports.parseUserTags = parseUserTags;
exports.slj = index;
exports.xml = index$1;
