import { b as derived, w as writable, s as storage } from "./store-875eeb2f.js";
import { __assign, __extends, __spreadArray } from "tslib";
import "bops";
import { g as get_store_value } from "./index-f5dba6f6.js";
var isMergeableObject = function isMergeableObject2(value) {
  return isNonNullObject(value) && !isSpecial(value);
};
function isNonNullObject(value) {
  return !!value && typeof value === "object";
}
function isSpecial(value) {
  var stringValue = Object.prototype.toString.call(value);
  return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
}
var canUseSymbol = typeof Symbol === "function" && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
function isReactElement(value) {
  return value.$$typeof === REACT_ELEMENT_TYPE;
}
function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}
function cloneUnlessOtherwiseSpecified(value, options) {
  return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
}
function defaultArrayMerge(target, source, options) {
  return target.concat(source).map(function(element) {
    return cloneUnlessOtherwiseSpecified(element, options);
  });
}
function getMergeFunction(key, options) {
  if (!options.customMerge) {
    return deepmerge;
  }
  var customMerge = options.customMerge(key);
  return typeof customMerge === "function" ? customMerge : deepmerge;
}
function getEnumerableOwnPropertySymbols(target) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
    return target.propertyIsEnumerable(symbol);
  }) : [];
}
function getKeys(target) {
  return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}
function propertyIsOnObject(object, property) {
  try {
    return property in object;
  } catch (_2) {
    return false;
  }
}
function propertyIsUnsafe(target, key) {
  return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
}
function mergeObject(target, source, options) {
  var destination = {};
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach(function(key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  getKeys(source).forEach(function(key) {
    if (propertyIsUnsafe(target, key)) {
      return;
    }
    if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
      destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
  return destination;
}
function deepmerge(target, source, options) {
  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
  var sourceIsArray = Array.isArray(source);
  var targetIsArray = Array.isArray(target);
  var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options);
  }
}
deepmerge.all = function deepmergeAll(array, options) {
  if (!Array.isArray(array)) {
    throw new Error("first argument should be an array");
  }
  return array.reduce(function(prev, next) {
    return deepmerge(prev, next, options);
  }, {});
};
var deepmerge_1 = deepmerge;
var cjs = deepmerge_1;
var ErrorKind;
(function(ErrorKind2) {
  ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
  ErrorKind2[ErrorKind2["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
  ErrorKind2[ErrorKind2["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
  ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
  ErrorKind2[ErrorKind2["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
  ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
  ErrorKind2[ErrorKind2["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
  ErrorKind2[ErrorKind2["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
  ErrorKind2[ErrorKind2["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
  ErrorKind2[ErrorKind2["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
  ErrorKind2[ErrorKind2["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
  ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
  ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
  ErrorKind2[ErrorKind2["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
  ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
  ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
  ErrorKind2[ErrorKind2["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
  ErrorKind2[ErrorKind2["INVALID_TAG"] = 23] = "INVALID_TAG";
  ErrorKind2[ErrorKind2["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
  ErrorKind2[ErrorKind2["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
  ErrorKind2[ErrorKind2["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
})(ErrorKind || (ErrorKind = {}));
var TYPE;
(function(TYPE2) {
  TYPE2[TYPE2["literal"] = 0] = "literal";
  TYPE2[TYPE2["argument"] = 1] = "argument";
  TYPE2[TYPE2["number"] = 2] = "number";
  TYPE2[TYPE2["date"] = 3] = "date";
  TYPE2[TYPE2["time"] = 4] = "time";
  TYPE2[TYPE2["select"] = 5] = "select";
  TYPE2[TYPE2["plural"] = 6] = "plural";
  TYPE2[TYPE2["pound"] = 7] = "pound";
  TYPE2[TYPE2["tag"] = 8] = "tag";
})(TYPE || (TYPE = {}));
var SKELETON_TYPE;
(function(SKELETON_TYPE2) {
  SKELETON_TYPE2[SKELETON_TYPE2["number"] = 0] = "number";
  SKELETON_TYPE2[SKELETON_TYPE2["dateTime"] = 1] = "dateTime";
})(SKELETON_TYPE || (SKELETON_TYPE = {}));
function isLiteralElement(el) {
  return el.type === TYPE.literal;
}
function isArgumentElement(el) {
  return el.type === TYPE.argument;
}
function isNumberElement(el) {
  return el.type === TYPE.number;
}
function isDateElement(el) {
  return el.type === TYPE.date;
}
function isTimeElement(el) {
  return el.type === TYPE.time;
}
function isSelectElement(el) {
  return el.type === TYPE.select;
}
function isPluralElement(el) {
  return el.type === TYPE.plural;
}
function isPoundElement(el) {
  return el.type === TYPE.pound;
}
function isTagElement(el) {
  return el.type === TYPE.tag;
}
function isNumberSkeleton(el) {
  return !!(el && typeof el === "object" && el.type === SKELETON_TYPE.number);
}
function isDateTimeSkeleton(el) {
  return !!(el && typeof el === "object" && el.type === SKELETON_TYPE.dateTime);
}
var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;
var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
function parseDateTimeSkeleton(skeleton) {
  var result = {};
  skeleton.replace(DATE_TIME_REGEX, function(match) {
    var len = match.length;
    switch (match[0]) {
      case "G":
        result.era = len === 4 ? "long" : len === 5 ? "narrow" : "short";
        break;
      case "y":
        result.year = len === 2 ? "2-digit" : "numeric";
        break;
      case "Y":
      case "u":
      case "U":
      case "r":
        throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");
      case "q":
      case "Q":
        throw new RangeError("`q/Q` (quarter) patterns are not supported");
      case "M":
      case "L":
        result.month = ["numeric", "2-digit", "short", "long", "narrow"][len - 1];
        break;
      case "w":
      case "W":
        throw new RangeError("`w/W` (week) patterns are not supported");
      case "d":
        result.day = ["numeric", "2-digit"][len - 1];
        break;
      case "D":
      case "F":
      case "g":
        throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");
      case "E":
        result.weekday = len === 4 ? "short" : len === 5 ? "narrow" : "short";
        break;
      case "e":
        if (len < 4) {
          throw new RangeError("`e..eee` (weekday) patterns are not supported");
        }
        result.weekday = ["short", "long", "narrow", "short"][len - 4];
        break;
      case "c":
        if (len < 4) {
          throw new RangeError("`c..ccc` (weekday) patterns are not supported");
        }
        result.weekday = ["short", "long", "narrow", "short"][len - 4];
        break;
      case "a":
        result.hour12 = true;
        break;
      case "b":
      case "B":
        throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");
      case "h":
        result.hourCycle = "h12";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "H":
        result.hourCycle = "h23";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "K":
        result.hourCycle = "h11";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "k":
        result.hourCycle = "h24";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "j":
      case "J":
      case "C":
        throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");
      case "m":
        result.minute = ["numeric", "2-digit"][len - 1];
        break;
      case "s":
        result.second = ["numeric", "2-digit"][len - 1];
        break;
      case "S":
      case "A":
        throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");
      case "z":
        result.timeZoneName = len < 4 ? "short" : "long";
        break;
      case "Z":
      case "O":
      case "v":
      case "V":
      case "X":
      case "x":
        throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead");
    }
    return "";
  });
  return result;
}
var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
function parseNumberSkeletonFromString(skeleton) {
  if (skeleton.length === 0) {
    throw new Error("Number skeleton cannot be empty");
  }
  var stringTokens = skeleton.split(WHITE_SPACE_REGEX).filter(function(x2) {
    return x2.length > 0;
  });
  var tokens = [];
  for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
    var stringToken = stringTokens_1[_i];
    var stemAndOptions = stringToken.split("/");
    if (stemAndOptions.length === 0) {
      throw new Error("Invalid number skeleton");
    }
    var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
    for (var _a2 = 0, options_1 = options; _a2 < options_1.length; _a2++) {
      var option = options_1[_a2];
      if (option.length === 0) {
        throw new Error("Invalid number skeleton");
      }
    }
    tokens.push({ stem, options });
  }
  return tokens;
}
function icuUnitToEcma(unit) {
  return unit.replace(/^(.*?)-/, "");
}
var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
function parseSignificantPrecision(str) {
  var result = {};
  if (str[str.length - 1] === "r") {
    result.roundingPriority = "morePrecision";
  } else if (str[str.length - 1] === "s") {
    result.roundingPriority = "lessPrecision";
  }
  str.replace(SIGNIFICANT_PRECISION_REGEX, function(_2, g1, g2) {
    if (typeof g2 !== "string") {
      result.minimumSignificantDigits = g1.length;
      result.maximumSignificantDigits = g1.length;
    } else if (g2 === "+") {
      result.minimumSignificantDigits = g1.length;
    } else if (g1[0] === "#") {
      result.maximumSignificantDigits = g1.length;
    } else {
      result.minimumSignificantDigits = g1.length;
      result.maximumSignificantDigits = g1.length + (typeof g2 === "string" ? g2.length : 0);
    }
    return "";
  });
  return result;
}
function parseSign(str) {
  switch (str) {
    case "sign-auto":
      return {
        signDisplay: "auto"
      };
    case "sign-accounting":
    case "()":
      return {
        currencySign: "accounting"
      };
    case "sign-always":
    case "+!":
      return {
        signDisplay: "always"
      };
    case "sign-accounting-always":
    case "()!":
      return {
        signDisplay: "always",
        currencySign: "accounting"
      };
    case "sign-except-zero":
    case "+?":
      return {
        signDisplay: "exceptZero"
      };
    case "sign-accounting-except-zero":
    case "()?":
      return {
        signDisplay: "exceptZero",
        currencySign: "accounting"
      };
    case "sign-never":
    case "+_":
      return {
        signDisplay: "never"
      };
  }
}
function parseConciseScientificAndEngineeringStem(stem) {
  var result;
  if (stem[0] === "E" && stem[1] === "E") {
    result = {
      notation: "engineering"
    };
    stem = stem.slice(2);
  } else if (stem[0] === "E") {
    result = {
      notation: "scientific"
    };
    stem = stem.slice(1);
  }
  if (result) {
    var signDisplay = stem.slice(0, 2);
    if (signDisplay === "+!") {
      result.signDisplay = "always";
      stem = stem.slice(2);
    } else if (signDisplay === "+?") {
      result.signDisplay = "exceptZero";
      stem = stem.slice(2);
    }
    if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
      throw new Error("Malformed concise eng/scientific notation");
    }
    result.minimumIntegerDigits = stem.length;
  }
  return result;
}
function parseNotationOptions(opt) {
  var result = {};
  var signOpts = parseSign(opt);
  if (signOpts) {
    return signOpts;
  }
  return result;
}
function parseNumberSkeleton(tokens) {
  var result = {};
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    switch (token.stem) {
      case "percent":
      case "%":
        result.style = "percent";
        continue;
      case "%x100":
        result.style = "percent";
        result.scale = 100;
        continue;
      case "currency":
        result.style = "currency";
        result.currency = token.options[0];
        continue;
      case "group-off":
      case ",_":
        result.useGrouping = false;
        continue;
      case "precision-integer":
      case ".":
        result.maximumFractionDigits = 0;
        continue;
      case "measure-unit":
      case "unit":
        result.style = "unit";
        result.unit = icuUnitToEcma(token.options[0]);
        continue;
      case "compact-short":
      case "K":
        result.notation = "compact";
        result.compactDisplay = "short";
        continue;
      case "compact-long":
      case "KK":
        result.notation = "compact";
        result.compactDisplay = "long";
        continue;
      case "scientific":
        result = __assign(__assign(__assign({}, result), { notation: "scientific" }), token.options.reduce(function(all, opt2) {
          return __assign(__assign({}, all), parseNotationOptions(opt2));
        }, {}));
        continue;
      case "engineering":
        result = __assign(__assign(__assign({}, result), { notation: "engineering" }), token.options.reduce(function(all, opt2) {
          return __assign(__assign({}, all), parseNotationOptions(opt2));
        }, {}));
        continue;
      case "notation-simple":
        result.notation = "standard";
        continue;
      case "unit-width-narrow":
        result.currencyDisplay = "narrowSymbol";
        result.unitDisplay = "narrow";
        continue;
      case "unit-width-short":
        result.currencyDisplay = "code";
        result.unitDisplay = "short";
        continue;
      case "unit-width-full-name":
        result.currencyDisplay = "name";
        result.unitDisplay = "long";
        continue;
      case "unit-width-iso-code":
        result.currencyDisplay = "symbol";
        continue;
      case "scale":
        result.scale = parseFloat(token.options[0]);
        continue;
      case "integer-width":
        if (token.options.length > 1) {
          throw new RangeError("integer-width stems only accept a single optional option");
        }
        token.options[0].replace(INTEGER_WIDTH_REGEX, function(_2, g1, g2, g3, g4, g5) {
          if (g1) {
            result.minimumIntegerDigits = g2.length;
          } else if (g3 && g4) {
            throw new Error("We currently do not support maximum integer digits");
          } else if (g5) {
            throw new Error("We currently do not support exact integer digits");
          }
          return "";
        });
        continue;
    }
    if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
      result.minimumIntegerDigits = token.stem.length;
      continue;
    }
    if (FRACTION_PRECISION_REGEX.test(token.stem)) {
      if (token.options.length > 1) {
        throw new RangeError("Fraction-precision stems only accept a single optional option");
      }
      token.stem.replace(FRACTION_PRECISION_REGEX, function(_2, g1, g2, g3, g4, g5) {
        if (g2 === "*") {
          result.minimumFractionDigits = g1.length;
        } else if (g3 && g3[0] === "#") {
          result.maximumFractionDigits = g3.length;
        } else if (g4 && g5) {
          result.minimumFractionDigits = g4.length;
          result.maximumFractionDigits = g4.length + g5.length;
        } else {
          result.minimumFractionDigits = g1.length;
          result.maximumFractionDigits = g1.length;
        }
        return "";
      });
      var opt = token.options[0];
      if (opt === "w") {
        result = __assign(__assign({}, result), { trailingZeroDisplay: "stripIfInteger" });
      } else if (opt) {
        result = __assign(__assign({}, result), parseSignificantPrecision(opt));
      }
      continue;
    }
    if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
      result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
      continue;
    }
    var signOpts = parseSign(token.stem);
    if (signOpts) {
      result = __assign(__assign({}, result), signOpts);
    }
    var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
    if (conciseScientificAndEngineeringOpts) {
      result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
    }
  }
  return result;
}
var timeData = {
  "AX": [
    "H"
  ],
  "BQ": [
    "H"
  ],
  "CP": [
    "H"
  ],
  "CZ": [
    "H"
  ],
  "DK": [
    "H"
  ],
  "FI": [
    "H"
  ],
  "ID": [
    "H"
  ],
  "IS": [
    "H"
  ],
  "ML": [
    "H"
  ],
  "NE": [
    "H"
  ],
  "RU": [
    "H"
  ],
  "SE": [
    "H"
  ],
  "SJ": [
    "H"
  ],
  "SK": [
    "H"
  ],
  "AS": [
    "h",
    "H"
  ],
  "BT": [
    "h",
    "H"
  ],
  "DJ": [
    "h",
    "H"
  ],
  "ER": [
    "h",
    "H"
  ],
  "GH": [
    "h",
    "H"
  ],
  "IN": [
    "h",
    "H"
  ],
  "LS": [
    "h",
    "H"
  ],
  "PG": [
    "h",
    "H"
  ],
  "PW": [
    "h",
    "H"
  ],
  "SO": [
    "h",
    "H"
  ],
  "TO": [
    "h",
    "H"
  ],
  "VU": [
    "h",
    "H"
  ],
  "WS": [
    "h",
    "H"
  ],
  "001": [
    "H",
    "h"
  ],
  "AL": [
    "h",
    "H",
    "hB"
  ],
  "TD": [
    "h",
    "H",
    "hB"
  ],
  "ca-ES": [
    "H",
    "h",
    "hB"
  ],
  "CF": [
    "H",
    "h",
    "hB"
  ],
  "CM": [
    "H",
    "h",
    "hB"
  ],
  "fr-CA": [
    "H",
    "h",
    "hB"
  ],
  "gl-ES": [
    "H",
    "h",
    "hB"
  ],
  "it-CH": [
    "H",
    "h",
    "hB"
  ],
  "it-IT": [
    "H",
    "h",
    "hB"
  ],
  "LU": [
    "H",
    "h",
    "hB"
  ],
  "NP": [
    "H",
    "h",
    "hB"
  ],
  "PF": [
    "H",
    "h",
    "hB"
  ],
  "SC": [
    "H",
    "h",
    "hB"
  ],
  "SM": [
    "H",
    "h",
    "hB"
  ],
  "SN": [
    "H",
    "h",
    "hB"
  ],
  "TF": [
    "H",
    "h",
    "hB"
  ],
  "VA": [
    "H",
    "h",
    "hB"
  ],
  "CY": [
    "h",
    "H",
    "hb",
    "hB"
  ],
  "GR": [
    "h",
    "H",
    "hb",
    "hB"
  ],
  "CO": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "DO": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "KP": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "KR": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "NA": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "PA": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "PR": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "VE": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "AC": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "AI": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "BW": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "BZ": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "CC": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "CK": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "CX": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "DG": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "FK": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "GB": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "GG": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "GI": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "IE": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "IM": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "IO": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "JE": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "LT": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "MK": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "MN": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "MS": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NF": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NG": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NR": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NU": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "PN": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "SH": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "SX": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "TA": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "ZA": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "af-ZA": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "AR": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "CL": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "CR": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "CU": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "EA": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-BO": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-BR": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-EC": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-ES": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-GQ": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-PE": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "GT": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "HN": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "IC": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "KG": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "KM": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "LK": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "MA": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "MX": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "NI": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "PY": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "SV": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "UY": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "JP": [
    "H",
    "h",
    "K"
  ],
  "AD": [
    "H",
    "hB"
  ],
  "AM": [
    "H",
    "hB"
  ],
  "AO": [
    "H",
    "hB"
  ],
  "AT": [
    "H",
    "hB"
  ],
  "AW": [
    "H",
    "hB"
  ],
  "BE": [
    "H",
    "hB"
  ],
  "BF": [
    "H",
    "hB"
  ],
  "BJ": [
    "H",
    "hB"
  ],
  "BL": [
    "H",
    "hB"
  ],
  "BR": [
    "H",
    "hB"
  ],
  "CG": [
    "H",
    "hB"
  ],
  "CI": [
    "H",
    "hB"
  ],
  "CV": [
    "H",
    "hB"
  ],
  "DE": [
    "H",
    "hB"
  ],
  "EE": [
    "H",
    "hB"
  ],
  "FR": [
    "H",
    "hB"
  ],
  "GA": [
    "H",
    "hB"
  ],
  "GF": [
    "H",
    "hB"
  ],
  "GN": [
    "H",
    "hB"
  ],
  "GP": [
    "H",
    "hB"
  ],
  "GW": [
    "H",
    "hB"
  ],
  "HR": [
    "H",
    "hB"
  ],
  "IL": [
    "H",
    "hB"
  ],
  "IT": [
    "H",
    "hB"
  ],
  "KZ": [
    "H",
    "hB"
  ],
  "MC": [
    "H",
    "hB"
  ],
  "MD": [
    "H",
    "hB"
  ],
  "MF": [
    "H",
    "hB"
  ],
  "MQ": [
    "H",
    "hB"
  ],
  "MZ": [
    "H",
    "hB"
  ],
  "NC": [
    "H",
    "hB"
  ],
  "NL": [
    "H",
    "hB"
  ],
  "PM": [
    "H",
    "hB"
  ],
  "PT": [
    "H",
    "hB"
  ],
  "RE": [
    "H",
    "hB"
  ],
  "RO": [
    "H",
    "hB"
  ],
  "SI": [
    "H",
    "hB"
  ],
  "SR": [
    "H",
    "hB"
  ],
  "ST": [
    "H",
    "hB"
  ],
  "TG": [
    "H",
    "hB"
  ],
  "TR": [
    "H",
    "hB"
  ],
  "WF": [
    "H",
    "hB"
  ],
  "YT": [
    "H",
    "hB"
  ],
  "BD": [
    "h",
    "hB",
    "H"
  ],
  "PK": [
    "h",
    "hB",
    "H"
  ],
  "AZ": [
    "H",
    "hB",
    "h"
  ],
  "BA": [
    "H",
    "hB",
    "h"
  ],
  "BG": [
    "H",
    "hB",
    "h"
  ],
  "CH": [
    "H",
    "hB",
    "h"
  ],
  "GE": [
    "H",
    "hB",
    "h"
  ],
  "LI": [
    "H",
    "hB",
    "h"
  ],
  "ME": [
    "H",
    "hB",
    "h"
  ],
  "RS": [
    "H",
    "hB",
    "h"
  ],
  "UA": [
    "H",
    "hB",
    "h"
  ],
  "UZ": [
    "H",
    "hB",
    "h"
  ],
  "XK": [
    "H",
    "hB",
    "h"
  ],
  "AG": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "AU": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "BB": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "BM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "BS": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "CA": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "DM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "en-001": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "FJ": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "FM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "GD": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "GM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "GU": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "GY": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "JM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "KI": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "KN": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "KY": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "LC": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "LR": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "MH": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "MP": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "MW": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "NZ": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SB": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SG": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SL": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SS": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SZ": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "TC": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "TT": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "UM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "US": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "VC": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "VG": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "VI": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "ZM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "BO": [
    "H",
    "hB",
    "h",
    "hb"
  ],
  "EC": [
    "H",
    "hB",
    "h",
    "hb"
  ],
  "ES": [
    "H",
    "hB",
    "h",
    "hb"
  ],
  "GQ": [
    "H",
    "hB",
    "h",
    "hb"
  ],
  "PE": [
    "H",
    "hB",
    "h",
    "hb"
  ],
  "AE": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "ar-001": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "BH": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "DZ": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "EG": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "EH": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "HK": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "IQ": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "JO": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "KW": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "LB": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "LY": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "MO": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "MR": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "OM": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "PH": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "PS": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "QA": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "SA": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "SD": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "SY": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "TN": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "YE": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "AF": [
    "H",
    "hb",
    "hB",
    "h"
  ],
  "LA": [
    "H",
    "hb",
    "hB",
    "h"
  ],
  "CN": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "LV": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "TL": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "zu-ZA": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "CD": [
    "hB",
    "H"
  ],
  "IR": [
    "hB",
    "H"
  ],
  "hi-IN": [
    "hB",
    "h",
    "H"
  ],
  "kn-IN": [
    "hB",
    "h",
    "H"
  ],
  "ml-IN": [
    "hB",
    "h",
    "H"
  ],
  "te-IN": [
    "hB",
    "h",
    "H"
  ],
  "KH": [
    "hB",
    "h",
    "H",
    "hb"
  ],
  "ta-IN": [
    "hB",
    "h",
    "hb",
    "H"
  ],
  "BN": [
    "hb",
    "hB",
    "h",
    "H"
  ],
  "MY": [
    "hb",
    "hB",
    "h",
    "H"
  ],
  "ET": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "gu-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "mr-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "pa-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "TW": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "KE": [
    "hB",
    "hb",
    "H",
    "h"
  ],
  "MM": [
    "hB",
    "hb",
    "H",
    "h"
  ],
  "TZ": [
    "hB",
    "hb",
    "H",
    "h"
  ],
  "UG": [
    "hB",
    "hb",
    "H",
    "h"
  ]
};
function getBestPattern(skeleton, locale) {
  var skeletonCopy = "";
  for (var patternPos = 0; patternPos < skeleton.length; patternPos++) {
    var patternChar = skeleton.charAt(patternPos);
    if (patternChar === "j") {
      var extraLength = 0;
      while (patternPos + 1 < skeleton.length && skeleton.charAt(patternPos + 1) === patternChar) {
        extraLength++;
        patternPos++;
      }
      var hourLen = 1 + (extraLength & 1);
      var dayPeriodLen = extraLength < 2 ? 1 : 3 + (extraLength >> 1);
      var dayPeriodChar = "a";
      var hourChar = getDefaultHourSymbolFromLocale(locale);
      if (hourChar == "H" || hourChar == "k") {
        dayPeriodLen = 0;
      }
      while (dayPeriodLen-- > 0) {
        skeletonCopy += dayPeriodChar;
      }
      while (hourLen-- > 0) {
        skeletonCopy = hourChar + skeletonCopy;
      }
    } else if (patternChar === "J") {
      skeletonCopy += "H";
    } else {
      skeletonCopy += patternChar;
    }
  }
  return skeletonCopy;
}
function getDefaultHourSymbolFromLocale(locale) {
  var hourCycle = locale.hourCycle;
  if (hourCycle === void 0 && locale.hourCycles && locale.hourCycles.length) {
    hourCycle = locale.hourCycles[0];
  }
  if (hourCycle) {
    switch (hourCycle) {
      case "h24":
        return "k";
      case "h23":
        return "H";
      case "h12":
        return "h";
      case "h11":
        return "K";
      default:
        throw new Error("Invalid hourCycle");
    }
  }
  var languageTag = locale.language;
  var regionTag;
  if (languageTag !== "root") {
    regionTag = locale.maximize().region;
  }
  var hourCycles = timeData[regionTag || ""] || timeData[languageTag || ""] || timeData["".concat(languageTag, "-001")] || timeData["001"];
  return hourCycles[0];
}
var _a;
var SPACE_SEPARATOR_START_REGEX = new RegExp("^".concat(SPACE_SEPARATOR_REGEX.source, "*"));
var SPACE_SEPARATOR_END_REGEX = new RegExp("".concat(SPACE_SEPARATOR_REGEX.source, "*$"));
function createLocation(start, end) {
  return { start, end };
}
var hasNativeStartsWith = !!String.prototype.startsWith;
var hasNativeFromCodePoint = !!String.fromCodePoint;
var hasNativeFromEntries = !!Object.fromEntries;
var hasNativeCodePointAt = !!String.prototype.codePointAt;
var hasTrimStart = !!String.prototype.trimStart;
var hasTrimEnd = !!String.prototype.trimEnd;
var hasNativeIsSafeInteger = !!Number.isSafeInteger;
var isSafeInteger = hasNativeIsSafeInteger ? Number.isSafeInteger : function(n) {
  return typeof n === "number" && isFinite(n) && Math.floor(n) === n && Math.abs(n) <= 9007199254740991;
};
var REGEX_SUPPORTS_U_AND_Y = true;
try {
  var re = RE("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec("a")) === null || _a === void 0 ? void 0 : _a[0]) === "a";
} catch (_2) {
  REGEX_SUPPORTS_U_AND_Y = false;
}
var startsWith = hasNativeStartsWith ? function startsWith2(s2, search, position) {
  return s2.startsWith(search, position);
} : function startsWith3(s2, search, position) {
  return s2.slice(position, position + search.length) === search;
};
var fromCodePoint = hasNativeFromCodePoint ? String.fromCodePoint : function fromCodePoint2() {
  var codePoints = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    codePoints[_i] = arguments[_i];
  }
  var elements = "";
  var length = codePoints.length;
  var i2 = 0;
  var code;
  while (length > i2) {
    code = codePoints[i2++];
    if (code > 1114111)
      throw RangeError(code + " is not a valid code point");
    elements += code < 65536 ? String.fromCharCode(code) : String.fromCharCode(((code -= 65536) >> 10) + 55296, code % 1024 + 56320);
  }
  return elements;
};
var fromEntries = hasNativeFromEntries ? Object.fromEntries : function fromEntries2(entries) {
  var obj = {};
  for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
    var _a2 = entries_1[_i], k2 = _a2[0], v2 = _a2[1];
    obj[k2] = v2;
  }
  return obj;
};
var codePointAt = hasNativeCodePointAt ? function codePointAt2(s2, index) {
  return s2.codePointAt(index);
} : function codePointAt3(s2, index) {
  var size = s2.length;
  if (index < 0 || index >= size) {
    return void 0;
  }
  var first = s2.charCodeAt(index);
  var second;
  return first < 55296 || first > 56319 || index + 1 === size || (second = s2.charCodeAt(index + 1)) < 56320 || second > 57343 ? first : (first - 55296 << 10) + (second - 56320) + 65536;
};
var trimStart = hasTrimStart ? function trimStart2(s2) {
  return s2.trimStart();
} : function trimStart3(s2) {
  return s2.replace(SPACE_SEPARATOR_START_REGEX, "");
};
var trimEnd = hasTrimEnd ? function trimEnd2(s2) {
  return s2.trimEnd();
} : function trimEnd3(s2) {
  return s2.replace(SPACE_SEPARATOR_END_REGEX, "");
};
function RE(s2, flag) {
  return new RegExp(s2, flag);
}
var matchIdentifierAtIndex;
if (REGEX_SUPPORTS_U_AND_Y) {
  var IDENTIFIER_PREFIX_RE_1 = RE("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  matchIdentifierAtIndex = function matchIdentifierAtIndex2(s2, index) {
    var _a2;
    IDENTIFIER_PREFIX_RE_1.lastIndex = index;
    var match = IDENTIFIER_PREFIX_RE_1.exec(s2);
    return (_a2 = match[1]) !== null && _a2 !== void 0 ? _a2 : "";
  };
} else {
  matchIdentifierAtIndex = function matchIdentifierAtIndex2(s2, index) {
    var match = [];
    while (true) {
      var c2 = codePointAt(s2, index);
      if (c2 === void 0 || _isWhiteSpace(c2) || _isPatternSyntax(c2)) {
        break;
      }
      match.push(c2);
      index += c2 >= 65536 ? 2 : 1;
    }
    return fromCodePoint.apply(void 0, match);
  };
}
var Parser = function() {
  function Parser2(message, options) {
    if (options === void 0) {
      options = {};
    }
    this.message = message;
    this.position = { offset: 0, line: 1, column: 1 };
    this.ignoreTag = !!options.ignoreTag;
    this.locale = options.locale;
    this.requiresOtherClause = !!options.requiresOtherClause;
    this.shouldParseSkeletons = !!options.shouldParseSkeletons;
  }
  Parser2.prototype.parse = function() {
    if (this.offset() !== 0) {
      throw Error("parser can only be used once");
    }
    return this.parseMessage(0, "", false);
  };
  Parser2.prototype.parseMessage = function(nestingLevel, parentArgType, expectingCloseTag) {
    var elements = [];
    while (!this.isEOF()) {
      var char = this.char();
      if (char === 123) {
        var result = this.parseArgument(nestingLevel, expectingCloseTag);
        if (result.err) {
          return result;
        }
        elements.push(result.val);
      } else if (char === 125 && nestingLevel > 0) {
        break;
      } else if (char === 35 && (parentArgType === "plural" || parentArgType === "selectordinal")) {
        var position = this.clonePosition();
        this.bump();
        elements.push({
          type: TYPE.pound,
          location: createLocation(position, this.clonePosition())
        });
      } else if (char === 60 && !this.ignoreTag && this.peek() === 47) {
        if (expectingCloseTag) {
          break;
        } else {
          return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
        }
      } else if (char === 60 && !this.ignoreTag && _isAlpha(this.peek() || 0)) {
        var result = this.parseTag(nestingLevel, parentArgType);
        if (result.err) {
          return result;
        }
        elements.push(result.val);
      } else {
        var result = this.parseLiteral(nestingLevel, parentArgType);
        if (result.err) {
          return result;
        }
        elements.push(result.val);
      }
    }
    return { val: elements, err: null };
  };
  Parser2.prototype.parseTag = function(nestingLevel, parentArgType) {
    var startPosition = this.clonePosition();
    this.bump();
    var tagName = this.parseTagName();
    this.bumpSpace();
    if (this.bumpIf("/>")) {
      return {
        val: {
          type: TYPE.literal,
          value: "<".concat(tagName, "/>"),
          location: createLocation(startPosition, this.clonePosition())
        },
        err: null
      };
    } else if (this.bumpIf(">")) {
      var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
      if (childrenResult.err) {
        return childrenResult;
      }
      var children = childrenResult.val;
      var endTagStartPosition = this.clonePosition();
      if (this.bumpIf("</")) {
        if (this.isEOF() || !_isAlpha(this.char())) {
          return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
        }
        var closingTagNameStartPosition = this.clonePosition();
        var closingTagName = this.parseTagName();
        if (tagName !== closingTagName) {
          return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
        }
        this.bumpSpace();
        if (!this.bumpIf(">")) {
          return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
        }
        return {
          val: {
            type: TYPE.tag,
            value: tagName,
            children,
            location: createLocation(startPosition, this.clonePosition())
          },
          err: null
        };
      } else {
        return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
      }
    } else {
      return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
    }
  };
  Parser2.prototype.parseTagName = function() {
    var startOffset = this.offset();
    this.bump();
    while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
      this.bump();
    }
    return this.message.slice(startOffset, this.offset());
  };
  Parser2.prototype.parseLiteral = function(nestingLevel, parentArgType) {
    var start = this.clonePosition();
    var value = "";
    while (true) {
      var parseQuoteResult = this.tryParseQuote(parentArgType);
      if (parseQuoteResult) {
        value += parseQuoteResult;
        continue;
      }
      var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
      if (parseUnquotedResult) {
        value += parseUnquotedResult;
        continue;
      }
      var parseLeftAngleResult = this.tryParseLeftAngleBracket();
      if (parseLeftAngleResult) {
        value += parseLeftAngleResult;
        continue;
      }
      break;
    }
    var location = createLocation(start, this.clonePosition());
    return {
      val: { type: TYPE.literal, value, location },
      err: null
    };
  };
  Parser2.prototype.tryParseLeftAngleBracket = function() {
    if (!this.isEOF() && this.char() === 60 && (this.ignoreTag || !_isAlphaOrSlash(this.peek() || 0))) {
      this.bump();
      return "<";
    }
    return null;
  };
  Parser2.prototype.tryParseQuote = function(parentArgType) {
    if (this.isEOF() || this.char() !== 39) {
      return null;
    }
    switch (this.peek()) {
      case 39:
        this.bump();
        this.bump();
        return "'";
      case 123:
      case 60:
      case 62:
      case 125:
        break;
      case 35:
        if (parentArgType === "plural" || parentArgType === "selectordinal") {
          break;
        }
        return null;
      default:
        return null;
    }
    this.bump();
    var codePoints = [this.char()];
    this.bump();
    while (!this.isEOF()) {
      var ch = this.char();
      if (ch === 39) {
        if (this.peek() === 39) {
          codePoints.push(39);
          this.bump();
        } else {
          this.bump();
          break;
        }
      } else {
        codePoints.push(ch);
      }
      this.bump();
    }
    return fromCodePoint.apply(void 0, codePoints);
  };
  Parser2.prototype.tryParseUnquoted = function(nestingLevel, parentArgType) {
    if (this.isEOF()) {
      return null;
    }
    var ch = this.char();
    if (ch === 60 || ch === 123 || ch === 35 && (parentArgType === "plural" || parentArgType === "selectordinal") || ch === 125 && nestingLevel > 0) {
      return null;
    } else {
      this.bump();
      return fromCodePoint(ch);
    }
  };
  Parser2.prototype.parseArgument = function(nestingLevel, expectingCloseTag) {
    var openingBracePosition = this.clonePosition();
    this.bump();
    this.bumpSpace();
    if (this.isEOF()) {
      return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
    }
    if (this.char() === 125) {
      this.bump();
      return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
    }
    var value = this.parseIdentifierIfPossible().value;
    if (!value) {
      return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
    }
    this.bumpSpace();
    if (this.isEOF()) {
      return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
    }
    switch (this.char()) {
      case 125: {
        this.bump();
        return {
          val: {
            type: TYPE.argument,
            value,
            location: createLocation(openingBracePosition, this.clonePosition())
          },
          err: null
        };
      }
      case 44: {
        this.bump();
        this.bumpSpace();
        if (this.isEOF()) {
          return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
      }
      default:
        return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
    }
  };
  Parser2.prototype.parseIdentifierIfPossible = function() {
    var startingPosition = this.clonePosition();
    var startOffset = this.offset();
    var value = matchIdentifierAtIndex(this.message, startOffset);
    var endOffset = startOffset + value.length;
    this.bumpTo(endOffset);
    var endPosition = this.clonePosition();
    var location = createLocation(startingPosition, endPosition);
    return { value, location };
  };
  Parser2.prototype.parseArgumentOptions = function(nestingLevel, expectingCloseTag, value, openingBracePosition) {
    var _a2;
    var typeStartPosition = this.clonePosition();
    var argType = this.parseIdentifierIfPossible().value;
    var typeEndPosition = this.clonePosition();
    switch (argType) {
      case "":
        return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
      case "number":
      case "date":
      case "time": {
        this.bumpSpace();
        var styleAndLocation = null;
        if (this.bumpIf(",")) {
          this.bumpSpace();
          var styleStartPosition = this.clonePosition();
          var result = this.parseSimpleArgStyleIfPossible();
          if (result.err) {
            return result;
          }
          var style = trimEnd(result.val);
          if (style.length === 0) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
          }
          var styleLocation = createLocation(styleStartPosition, this.clonePosition());
          styleAndLocation = { style, styleLocation };
        }
        var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
        if (argCloseResult.err) {
          return argCloseResult;
        }
        var location_1 = createLocation(openingBracePosition, this.clonePosition());
        if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, "::", 0)) {
          var skeleton = trimStart(styleAndLocation.style.slice(2));
          if (argType === "number") {
            var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
            if (result.err) {
              return result;
            }
            return {
              val: { type: TYPE.number, value, location: location_1, style: result.val },
              err: null
            };
          } else {
            if (skeleton.length === 0) {
              return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
            }
            var dateTimePattern = skeleton;
            if (this.locale) {
              dateTimePattern = getBestPattern(skeleton, this.locale);
            }
            var style = {
              type: SKELETON_TYPE.dateTime,
              pattern: dateTimePattern,
              location: styleAndLocation.styleLocation,
              parsedOptions: this.shouldParseSkeletons ? parseDateTimeSkeleton(dateTimePattern) : {}
            };
            var type = argType === "date" ? TYPE.date : TYPE.time;
            return {
              val: { type, value, location: location_1, style },
              err: null
            };
          }
        }
        return {
          val: {
            type: argType === "number" ? TYPE.number : argType === "date" ? TYPE.date : TYPE.time,
            value,
            location: location_1,
            style: (_a2 = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a2 !== void 0 ? _a2 : null
          },
          err: null
        };
      }
      case "plural":
      case "selectordinal":
      case "select": {
        var typeEndPosition_1 = this.clonePosition();
        this.bumpSpace();
        if (!this.bumpIf(",")) {
          return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign({}, typeEndPosition_1)));
        }
        this.bumpSpace();
        var identifierAndLocation = this.parseIdentifierIfPossible();
        var pluralOffset = 0;
        if (argType !== "select" && identifierAndLocation.value === "offset") {
          if (!this.bumpIf(":")) {
            return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
          }
          this.bumpSpace();
          var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
          if (result.err) {
            return result;
          }
          this.bumpSpace();
          identifierAndLocation = this.parseIdentifierIfPossible();
          pluralOffset = result.val;
        }
        var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
        if (optionsResult.err) {
          return optionsResult;
        }
        var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
        if (argCloseResult.err) {
          return argCloseResult;
        }
        var location_2 = createLocation(openingBracePosition, this.clonePosition());
        if (argType === "select") {
          return {
            val: {
              type: TYPE.select,
              value,
              options: fromEntries(optionsResult.val),
              location: location_2
            },
            err: null
          };
        } else {
          return {
            val: {
              type: TYPE.plural,
              value,
              options: fromEntries(optionsResult.val),
              offset: pluralOffset,
              pluralType: argType === "plural" ? "cardinal" : "ordinal",
              location: location_2
            },
            err: null
          };
        }
      }
      default:
        return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
    }
  };
  Parser2.prototype.tryParseArgumentClose = function(openingBracePosition) {
    if (this.isEOF() || this.char() !== 125) {
      return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
    }
    this.bump();
    return { val: true, err: null };
  };
  Parser2.prototype.parseSimpleArgStyleIfPossible = function() {
    var nestedBraces = 0;
    var startPosition = this.clonePosition();
    while (!this.isEOF()) {
      var ch = this.char();
      switch (ch) {
        case 39: {
          this.bump();
          var apostrophePosition = this.clonePosition();
          if (!this.bumpUntil("'")) {
            return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
          }
          this.bump();
          break;
        }
        case 123: {
          nestedBraces += 1;
          this.bump();
          break;
        }
        case 125: {
          if (nestedBraces > 0) {
            nestedBraces -= 1;
          } else {
            return {
              val: this.message.slice(startPosition.offset, this.offset()),
              err: null
            };
          }
          break;
        }
        default:
          this.bump();
          break;
      }
    }
    return {
      val: this.message.slice(startPosition.offset, this.offset()),
      err: null
    };
  };
  Parser2.prototype.parseNumberSkeletonFromString = function(skeleton, location) {
    var tokens = [];
    try {
      tokens = parseNumberSkeletonFromString(skeleton);
    } catch (e) {
      return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
    }
    return {
      val: {
        type: SKELETON_TYPE.number,
        tokens,
        location,
        parsedOptions: this.shouldParseSkeletons ? parseNumberSkeleton(tokens) : {}
      },
      err: null
    };
  };
  Parser2.prototype.tryParsePluralOrSelectOptions = function(nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
    var _a2;
    var hasOtherClause = false;
    var options = [];
    var parsedSelectors = /* @__PURE__ */ new Set();
    var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
    while (true) {
      if (selector.length === 0) {
        var startPosition = this.clonePosition();
        if (parentArgType !== "select" && this.bumpIf("=")) {
          var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
          if (result.err) {
            return result;
          }
          selectorLocation = createLocation(startPosition, this.clonePosition());
          selector = this.message.slice(startPosition.offset, this.offset());
        } else {
          break;
        }
      }
      if (parsedSelectors.has(selector)) {
        return this.error(parentArgType === "select" ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
      }
      if (selector === "other") {
        hasOtherClause = true;
      }
      this.bumpSpace();
      var openingBracePosition = this.clonePosition();
      if (!this.bumpIf("{")) {
        return this.error(parentArgType === "select" ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
      }
      var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
      if (fragmentResult.err) {
        return fragmentResult;
      }
      var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
      if (argCloseResult.err) {
        return argCloseResult;
      }
      options.push([
        selector,
        {
          value: fragmentResult.val,
          location: createLocation(openingBracePosition, this.clonePosition())
        }
      ]);
      parsedSelectors.add(selector);
      this.bumpSpace();
      _a2 = this.parseIdentifierIfPossible(), selector = _a2.value, selectorLocation = _a2.location;
    }
    if (options.length === 0) {
      return this.error(parentArgType === "select" ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
    }
    if (this.requiresOtherClause && !hasOtherClause) {
      return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
    }
    return { val: options, err: null };
  };
  Parser2.prototype.tryParseDecimalInteger = function(expectNumberError, invalidNumberError) {
    var sign = 1;
    var startingPosition = this.clonePosition();
    if (this.bumpIf("+"))
      ;
    else if (this.bumpIf("-")) {
      sign = -1;
    }
    var hasDigits = false;
    var decimal = 0;
    while (!this.isEOF()) {
      var ch = this.char();
      if (ch >= 48 && ch <= 57) {
        hasDigits = true;
        decimal = decimal * 10 + (ch - 48);
        this.bump();
      } else {
        break;
      }
    }
    var location = createLocation(startingPosition, this.clonePosition());
    if (!hasDigits) {
      return this.error(expectNumberError, location);
    }
    decimal *= sign;
    if (!isSafeInteger(decimal)) {
      return this.error(invalidNumberError, location);
    }
    return { val: decimal, err: null };
  };
  Parser2.prototype.offset = function() {
    return this.position.offset;
  };
  Parser2.prototype.isEOF = function() {
    return this.offset() === this.message.length;
  };
  Parser2.prototype.clonePosition = function() {
    return {
      offset: this.position.offset,
      line: this.position.line,
      column: this.position.column
    };
  };
  Parser2.prototype.char = function() {
    var offset = this.position.offset;
    if (offset >= this.message.length) {
      throw Error("out of bound");
    }
    var code = codePointAt(this.message, offset);
    if (code === void 0) {
      throw Error("Offset ".concat(offset, " is at invalid UTF-16 code unit boundary"));
    }
    return code;
  };
  Parser2.prototype.error = function(kind, location) {
    return {
      val: null,
      err: {
        kind,
        message: this.message,
        location
      }
    };
  };
  Parser2.prototype.bump = function() {
    if (this.isEOF()) {
      return;
    }
    var code = this.char();
    if (code === 10) {
      this.position.line += 1;
      this.position.column = 1;
      this.position.offset += 1;
    } else {
      this.position.column += 1;
      this.position.offset += code < 65536 ? 1 : 2;
    }
  };
  Parser2.prototype.bumpIf = function(prefix2) {
    if (startsWith(this.message, prefix2, this.offset())) {
      for (var i2 = 0; i2 < prefix2.length; i2++) {
        this.bump();
      }
      return true;
    }
    return false;
  };
  Parser2.prototype.bumpUntil = function(pattern) {
    var currentOffset = this.offset();
    var index = this.message.indexOf(pattern, currentOffset);
    if (index >= 0) {
      this.bumpTo(index);
      return true;
    } else {
      this.bumpTo(this.message.length);
      return false;
    }
  };
  Parser2.prototype.bumpTo = function(targetOffset) {
    if (this.offset() > targetOffset) {
      throw Error("targetOffset ".concat(targetOffset, " must be greater than or equal to the current offset ").concat(this.offset()));
    }
    targetOffset = Math.min(targetOffset, this.message.length);
    while (true) {
      var offset = this.offset();
      if (offset === targetOffset) {
        break;
      }
      if (offset > targetOffset) {
        throw Error("targetOffset ".concat(targetOffset, " is at invalid UTF-16 code unit boundary"));
      }
      this.bump();
      if (this.isEOF()) {
        break;
      }
    }
  };
  Parser2.prototype.bumpSpace = function() {
    while (!this.isEOF() && _isWhiteSpace(this.char())) {
      this.bump();
    }
  };
  Parser2.prototype.peek = function() {
    if (this.isEOF()) {
      return null;
    }
    var code = this.char();
    var offset = this.offset();
    var nextCode = this.message.charCodeAt(offset + (code >= 65536 ? 2 : 1));
    return nextCode !== null && nextCode !== void 0 ? nextCode : null;
  };
  return Parser2;
}();
function _isAlpha(codepoint) {
  return codepoint >= 97 && codepoint <= 122 || codepoint >= 65 && codepoint <= 90;
}
function _isAlphaOrSlash(codepoint) {
  return _isAlpha(codepoint) || codepoint === 47;
}
function _isPotentialElementNameChar(c2) {
  return c2 === 45 || c2 === 46 || c2 >= 48 && c2 <= 57 || c2 === 95 || c2 >= 97 && c2 <= 122 || c2 >= 65 && c2 <= 90 || c2 == 183 || c2 >= 192 && c2 <= 214 || c2 >= 216 && c2 <= 246 || c2 >= 248 && c2 <= 893 || c2 >= 895 && c2 <= 8191 || c2 >= 8204 && c2 <= 8205 || c2 >= 8255 && c2 <= 8256 || c2 >= 8304 && c2 <= 8591 || c2 >= 11264 && c2 <= 12271 || c2 >= 12289 && c2 <= 55295 || c2 >= 63744 && c2 <= 64975 || c2 >= 65008 && c2 <= 65533 || c2 >= 65536 && c2 <= 983039;
}
function _isWhiteSpace(c2) {
  return c2 >= 9 && c2 <= 13 || c2 === 32 || c2 === 133 || c2 >= 8206 && c2 <= 8207 || c2 === 8232 || c2 === 8233;
}
function _isPatternSyntax(c2) {
  return c2 >= 33 && c2 <= 35 || c2 === 36 || c2 >= 37 && c2 <= 39 || c2 === 40 || c2 === 41 || c2 === 42 || c2 === 43 || c2 === 44 || c2 === 45 || c2 >= 46 && c2 <= 47 || c2 >= 58 && c2 <= 59 || c2 >= 60 && c2 <= 62 || c2 >= 63 && c2 <= 64 || c2 === 91 || c2 === 92 || c2 === 93 || c2 === 94 || c2 === 96 || c2 === 123 || c2 === 124 || c2 === 125 || c2 === 126 || c2 === 161 || c2 >= 162 && c2 <= 165 || c2 === 166 || c2 === 167 || c2 === 169 || c2 === 171 || c2 === 172 || c2 === 174 || c2 === 176 || c2 === 177 || c2 === 182 || c2 === 187 || c2 === 191 || c2 === 215 || c2 === 247 || c2 >= 8208 && c2 <= 8213 || c2 >= 8214 && c2 <= 8215 || c2 === 8216 || c2 === 8217 || c2 === 8218 || c2 >= 8219 && c2 <= 8220 || c2 === 8221 || c2 === 8222 || c2 === 8223 || c2 >= 8224 && c2 <= 8231 || c2 >= 8240 && c2 <= 8248 || c2 === 8249 || c2 === 8250 || c2 >= 8251 && c2 <= 8254 || c2 >= 8257 && c2 <= 8259 || c2 === 8260 || c2 === 8261 || c2 === 8262 || c2 >= 8263 && c2 <= 8273 || c2 === 8274 || c2 === 8275 || c2 >= 8277 && c2 <= 8286 || c2 >= 8592 && c2 <= 8596 || c2 >= 8597 && c2 <= 8601 || c2 >= 8602 && c2 <= 8603 || c2 >= 8604 && c2 <= 8607 || c2 === 8608 || c2 >= 8609 && c2 <= 8610 || c2 === 8611 || c2 >= 8612 && c2 <= 8613 || c2 === 8614 || c2 >= 8615 && c2 <= 8621 || c2 === 8622 || c2 >= 8623 && c2 <= 8653 || c2 >= 8654 && c2 <= 8655 || c2 >= 8656 && c2 <= 8657 || c2 === 8658 || c2 === 8659 || c2 === 8660 || c2 >= 8661 && c2 <= 8691 || c2 >= 8692 && c2 <= 8959 || c2 >= 8960 && c2 <= 8967 || c2 === 8968 || c2 === 8969 || c2 === 8970 || c2 === 8971 || c2 >= 8972 && c2 <= 8991 || c2 >= 8992 && c2 <= 8993 || c2 >= 8994 && c2 <= 9e3 || c2 === 9001 || c2 === 9002 || c2 >= 9003 && c2 <= 9083 || c2 === 9084 || c2 >= 9085 && c2 <= 9114 || c2 >= 9115 && c2 <= 9139 || c2 >= 9140 && c2 <= 9179 || c2 >= 9180 && c2 <= 9185 || c2 >= 9186 && c2 <= 9254 || c2 >= 9255 && c2 <= 9279 || c2 >= 9280 && c2 <= 9290 || c2 >= 9291 && c2 <= 9311 || c2 >= 9472 && c2 <= 9654 || c2 === 9655 || c2 >= 9656 && c2 <= 9664 || c2 === 9665 || c2 >= 9666 && c2 <= 9719 || c2 >= 9720 && c2 <= 9727 || c2 >= 9728 && c2 <= 9838 || c2 === 9839 || c2 >= 9840 && c2 <= 10087 || c2 === 10088 || c2 === 10089 || c2 === 10090 || c2 === 10091 || c2 === 10092 || c2 === 10093 || c2 === 10094 || c2 === 10095 || c2 === 10096 || c2 === 10097 || c2 === 10098 || c2 === 10099 || c2 === 10100 || c2 === 10101 || c2 >= 10132 && c2 <= 10175 || c2 >= 10176 && c2 <= 10180 || c2 === 10181 || c2 === 10182 || c2 >= 10183 && c2 <= 10213 || c2 === 10214 || c2 === 10215 || c2 === 10216 || c2 === 10217 || c2 === 10218 || c2 === 10219 || c2 === 10220 || c2 === 10221 || c2 === 10222 || c2 === 10223 || c2 >= 10224 && c2 <= 10239 || c2 >= 10240 && c2 <= 10495 || c2 >= 10496 && c2 <= 10626 || c2 === 10627 || c2 === 10628 || c2 === 10629 || c2 === 10630 || c2 === 10631 || c2 === 10632 || c2 === 10633 || c2 === 10634 || c2 === 10635 || c2 === 10636 || c2 === 10637 || c2 === 10638 || c2 === 10639 || c2 === 10640 || c2 === 10641 || c2 === 10642 || c2 === 10643 || c2 === 10644 || c2 === 10645 || c2 === 10646 || c2 === 10647 || c2 === 10648 || c2 >= 10649 && c2 <= 10711 || c2 === 10712 || c2 === 10713 || c2 === 10714 || c2 === 10715 || c2 >= 10716 && c2 <= 10747 || c2 === 10748 || c2 === 10749 || c2 >= 10750 && c2 <= 11007 || c2 >= 11008 && c2 <= 11055 || c2 >= 11056 && c2 <= 11076 || c2 >= 11077 && c2 <= 11078 || c2 >= 11079 && c2 <= 11084 || c2 >= 11085 && c2 <= 11123 || c2 >= 11124 && c2 <= 11125 || c2 >= 11126 && c2 <= 11157 || c2 === 11158 || c2 >= 11159 && c2 <= 11263 || c2 >= 11776 && c2 <= 11777 || c2 === 11778 || c2 === 11779 || c2 === 11780 || c2 === 11781 || c2 >= 11782 && c2 <= 11784 || c2 === 11785 || c2 === 11786 || c2 === 11787 || c2 === 11788 || c2 === 11789 || c2 >= 11790 && c2 <= 11798 || c2 === 11799 || c2 >= 11800 && c2 <= 11801 || c2 === 11802 || c2 === 11803 || c2 === 11804 || c2 === 11805 || c2 >= 11806 && c2 <= 11807 || c2 === 11808 || c2 === 11809 || c2 === 11810 || c2 === 11811 || c2 === 11812 || c2 === 11813 || c2 === 11814 || c2 === 11815 || c2 === 11816 || c2 === 11817 || c2 >= 11818 && c2 <= 11822 || c2 === 11823 || c2 >= 11824 && c2 <= 11833 || c2 >= 11834 && c2 <= 11835 || c2 >= 11836 && c2 <= 11839 || c2 === 11840 || c2 === 11841 || c2 === 11842 || c2 >= 11843 && c2 <= 11855 || c2 >= 11856 && c2 <= 11857 || c2 === 11858 || c2 >= 11859 && c2 <= 11903 || c2 >= 12289 && c2 <= 12291 || c2 === 12296 || c2 === 12297 || c2 === 12298 || c2 === 12299 || c2 === 12300 || c2 === 12301 || c2 === 12302 || c2 === 12303 || c2 === 12304 || c2 === 12305 || c2 >= 12306 && c2 <= 12307 || c2 === 12308 || c2 === 12309 || c2 === 12310 || c2 === 12311 || c2 === 12312 || c2 === 12313 || c2 === 12314 || c2 === 12315 || c2 === 12316 || c2 === 12317 || c2 >= 12318 && c2 <= 12319 || c2 === 12320 || c2 === 12336 || c2 === 64830 || c2 === 64831 || c2 >= 65093 && c2 <= 65094;
}
function pruneLocation(els) {
  els.forEach(function(el) {
    delete el.location;
    if (isSelectElement(el) || isPluralElement(el)) {
      for (var k2 in el.options) {
        delete el.options[k2].location;
        pruneLocation(el.options[k2].value);
      }
    } else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
      delete el.style.location;
    } else if ((isDateElement(el) || isTimeElement(el)) && isDateTimeSkeleton(el.style)) {
      delete el.style.location;
    } else if (isTagElement(el)) {
      pruneLocation(el.children);
    }
  });
}
function parse(message, opts) {
  if (opts === void 0) {
    opts = {};
  }
  opts = __assign({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
  var result = new Parser(message, opts).parse();
  if (result.err) {
    var error = SyntaxError(ErrorKind[result.err.kind]);
    error.location = result.err.location;
    error.originalMessage = result.err.message;
    throw error;
  }
  if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
    pruneLocation(result.val);
  }
  return result.val;
}
function memoize(fn, options) {
  var cache = options && options.cache ? options.cache : cacheDefault;
  var serializer = options && options.serializer ? options.serializer : serializerDefault;
  var strategy = options && options.strategy ? options.strategy : strategyDefault;
  return strategy(fn, {
    cache,
    serializer
  });
}
function isPrimitive(value) {
  return value == null || typeof value === "number" || typeof value === "boolean";
}
function monadic(fn, cache, serializer, arg) {
  var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function variadic(fn, cache, serializer) {
  var args = Array.prototype.slice.call(arguments, 3);
  var cacheKey = serializer(args);
  var computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
  return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
  var strategy = fn.length === 1 ? monadic : variadic;
  return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
  return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
function strategyMonadic(fn, options) {
  return assemble(fn, this, monadic, options.cache.create(), options.serializer);
}
var serializerDefault = function() {
  return JSON.stringify(arguments);
};
function ObjectWithoutPrototypeCache() {
  this.cache = /* @__PURE__ */ Object.create(null);
}
ObjectWithoutPrototypeCache.prototype.get = function(key) {
  return this.cache[key];
};
ObjectWithoutPrototypeCache.prototype.set = function(key, value) {
  this.cache[key] = value;
};
var cacheDefault = {
  create: function create() {
    return new ObjectWithoutPrototypeCache();
  }
};
var strategies = {
  variadic: strategyVariadic,
  monadic: strategyMonadic
};
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2["MISSING_VALUE"] = "MISSING_VALUE";
  ErrorCode2["INVALID_VALUE"] = "INVALID_VALUE";
  ErrorCode2["MISSING_INTL_API"] = "MISSING_INTL_API";
})(ErrorCode || (ErrorCode = {}));
var FormatError = function(_super) {
  __extends(FormatError2, _super);
  function FormatError2(msg, code, originalMessage) {
    var _this = _super.call(this, msg) || this;
    _this.code = code;
    _this.originalMessage = originalMessage;
    return _this;
  }
  FormatError2.prototype.toString = function() {
    return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
  };
  return FormatError2;
}(Error);
var InvalidValueError = function(_super) {
  __extends(InvalidValueError2, _super);
  function InvalidValueError2(variableId, value, options, originalMessage) {
    return _super.call(this, 'Invalid values for "'.concat(variableId, '": "').concat(value, '". Options are "').concat(Object.keys(options).join('", "'), '"'), ErrorCode.INVALID_VALUE, originalMessage) || this;
  }
  return InvalidValueError2;
}(FormatError);
var InvalidValueTypeError = function(_super) {
  __extends(InvalidValueTypeError2, _super);
  function InvalidValueTypeError2(value, type, originalMessage) {
    return _super.call(this, 'Value for "'.concat(value, '" must be of type ').concat(type), ErrorCode.INVALID_VALUE, originalMessage) || this;
  }
  return InvalidValueTypeError2;
}(FormatError);
var MissingValueError = function(_super) {
  __extends(MissingValueError2, _super);
  function MissingValueError2(variableId, originalMessage) {
    return _super.call(this, 'The intl string context variable "'.concat(variableId, '" was not provided to the string "').concat(originalMessage, '"'), ErrorCode.MISSING_VALUE, originalMessage) || this;
  }
  return MissingValueError2;
}(FormatError);
var PART_TYPE;
(function(PART_TYPE2) {
  PART_TYPE2[PART_TYPE2["literal"] = 0] = "literal";
  PART_TYPE2[PART_TYPE2["object"] = 1] = "object";
})(PART_TYPE || (PART_TYPE = {}));
function mergeLiteral(parts) {
  if (parts.length < 2) {
    return parts;
  }
  return parts.reduce(function(all, part) {
    var lastPart = all[all.length - 1];
    if (!lastPart || lastPart.type !== PART_TYPE.literal || part.type !== PART_TYPE.literal) {
      all.push(part);
    } else {
      lastPart.value += part.value;
    }
    return all;
  }, []);
}
function isFormatXMLElementFn(el) {
  return typeof el === "function";
}
function formatToParts(els, locales, formatters, formats, values, currentPluralValue, originalMessage) {
  if (els.length === 1 && isLiteralElement(els[0])) {
    return [
      {
        type: PART_TYPE.literal,
        value: els[0].value
      }
    ];
  }
  var result = [];
  for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
    var el = els_1[_i];
    if (isLiteralElement(el)) {
      result.push({
        type: PART_TYPE.literal,
        value: el.value
      });
      continue;
    }
    if (isPoundElement(el)) {
      if (typeof currentPluralValue === "number") {
        result.push({
          type: PART_TYPE.literal,
          value: formatters.getNumberFormat(locales).format(currentPluralValue)
        });
      }
      continue;
    }
    var varName = el.value;
    if (!(values && varName in values)) {
      throw new MissingValueError(varName, originalMessage);
    }
    var value = values[varName];
    if (isArgumentElement(el)) {
      if (!value || typeof value === "string" || typeof value === "number") {
        value = typeof value === "string" || typeof value === "number" ? String(value) : "";
      }
      result.push({
        type: typeof value === "string" ? PART_TYPE.literal : PART_TYPE.object,
        value
      });
      continue;
    }
    if (isDateElement(el)) {
      var style = typeof el.style === "string" ? formats.date[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : void 0;
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }
    if (isTimeElement(el)) {
      var style = typeof el.style === "string" ? formats.time[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : formats.time.medium;
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }
    if (isNumberElement(el)) {
      var style = typeof el.style === "string" ? formats.number[el.style] : isNumberSkeleton(el.style) ? el.style.parsedOptions : void 0;
      if (style && style.scale) {
        value = value * (style.scale || 1);
      }
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getNumberFormat(locales, style).format(value)
      });
      continue;
    }
    if (isTagElement(el)) {
      var children = el.children, value_1 = el.value;
      var formatFn = values[value_1];
      if (!isFormatXMLElementFn(formatFn)) {
        throw new InvalidValueTypeError(value_1, "function", originalMessage);
      }
      var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
      var chunks = formatFn(parts.map(function(p2) {
        return p2.value;
      }));
      if (!Array.isArray(chunks)) {
        chunks = [chunks];
      }
      result.push.apply(result, chunks.map(function(c2) {
        return {
          type: typeof c2 === "string" ? PART_TYPE.literal : PART_TYPE.object,
          value: c2
        };
      }));
    }
    if (isSelectElement(el)) {
      var opt = el.options[value] || el.options.other;
      if (!opt) {
        throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      }
      result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
      continue;
    }
    if (isPluralElement(el)) {
      var opt = el.options["=".concat(value)];
      if (!opt) {
        if (!Intl.PluralRules) {
          throw new FormatError('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n', ErrorCode.MISSING_INTL_API, originalMessage);
        }
        var rule = formatters.getPluralRules(locales, { type: el.pluralType }).select(value - (el.offset || 0));
        opt = el.options[rule] || el.options.other;
      }
      if (!opt) {
        throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      }
      result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
      continue;
    }
  }
  return mergeLiteral(result);
}
function mergeConfig(c1, c2) {
  if (!c2) {
    return c1;
  }
  return __assign(__assign(__assign({}, c1 || {}), c2 || {}), Object.keys(c1).reduce(function(all, k2) {
    all[k2] = __assign(__assign({}, c1[k2]), c2[k2] || {});
    return all;
  }, {}));
}
function mergeConfigs(defaultConfig, configs) {
  if (!configs) {
    return defaultConfig;
  }
  return Object.keys(defaultConfig).reduce(function(all, k2) {
    all[k2] = mergeConfig(defaultConfig[k2], configs[k2]);
    return all;
  }, __assign({}, defaultConfig));
}
function createFastMemoizeCache(store) {
  return {
    create: function() {
      return {
        get: function(key) {
          return store[key];
        },
        set: function(key, value) {
          store[key] = value;
        }
      };
    }
  };
}
function createDefaultFormatters(cache) {
  if (cache === void 0) {
    cache = {
      number: {},
      dateTime: {},
      pluralRules: {}
    };
  }
  return {
    getNumberFormat: memoize(function() {
      var _a2;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return new ((_a2 = Intl.NumberFormat).bind.apply(_a2, __spreadArray([void 0], args, false)))();
    }, {
      cache: createFastMemoizeCache(cache.number),
      strategy: strategies.variadic
    }),
    getDateTimeFormat: memoize(function() {
      var _a2;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return new ((_a2 = Intl.DateTimeFormat).bind.apply(_a2, __spreadArray([void 0], args, false)))();
    }, {
      cache: createFastMemoizeCache(cache.dateTime),
      strategy: strategies.variadic
    }),
    getPluralRules: memoize(function() {
      var _a2;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return new ((_a2 = Intl.PluralRules).bind.apply(_a2, __spreadArray([void 0], args, false)))();
    }, {
      cache: createFastMemoizeCache(cache.pluralRules),
      strategy: strategies.variadic
    })
  };
}
var IntlMessageFormat = function() {
  function IntlMessageFormat2(message, locales, overrideFormats, opts) {
    var _this = this;
    if (locales === void 0) {
      locales = IntlMessageFormat2.defaultLocale;
    }
    this.formatterCache = {
      number: {},
      dateTime: {},
      pluralRules: {}
    };
    this.format = function(values) {
      var parts = _this.formatToParts(values);
      if (parts.length === 1) {
        return parts[0].value;
      }
      var result = parts.reduce(function(all, part) {
        if (!all.length || part.type !== PART_TYPE.literal || typeof all[all.length - 1] !== "string") {
          all.push(part.value);
        } else {
          all[all.length - 1] += part.value;
        }
        return all;
      }, []);
      if (result.length <= 1) {
        return result[0] || "";
      }
      return result;
    };
    this.formatToParts = function(values) {
      return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, void 0, _this.message);
    };
    this.resolvedOptions = function() {
      return {
        locale: _this.resolvedLocale.toString()
      };
    };
    this.getAst = function() {
      return _this.ast;
    };
    this.locales = locales;
    this.resolvedLocale = IntlMessageFormat2.resolveLocale(locales);
    if (typeof message === "string") {
      this.message = message;
      if (!IntlMessageFormat2.__parse) {
        throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");
      }
      this.ast = IntlMessageFormat2.__parse(message, {
        ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag,
        locale: this.resolvedLocale
      });
    } else {
      this.ast = message;
    }
    if (!Array.isArray(this.ast)) {
      throw new TypeError("A message must be provided as a String or AST.");
    }
    this.formats = mergeConfigs(IntlMessageFormat2.formats, overrideFormats);
    this.formatters = opts && opts.formatters || createDefaultFormatters(this.formatterCache);
  }
  Object.defineProperty(IntlMessageFormat2, "defaultLocale", {
    get: function() {
      if (!IntlMessageFormat2.memoizedDefaultLocale) {
        IntlMessageFormat2.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale;
      }
      return IntlMessageFormat2.memoizedDefaultLocale;
    },
    enumerable: false,
    configurable: true
  });
  IntlMessageFormat2.memoizedDefaultLocale = null;
  IntlMessageFormat2.resolveLocale = function(locales) {
    var supportedLocales = Intl.NumberFormat.supportedLocalesOf(locales);
    if (supportedLocales.length > 0) {
      return new Intl.Locale(supportedLocales[0]);
    }
    return new Intl.Locale(typeof locales === "string" ? locales : locales[0]);
  };
  IntlMessageFormat2.__parse = parse;
  IntlMessageFormat2.formats = {
    number: {
      integer: {
        maximumFractionDigits: 0
      },
      currency: {
        style: "currency"
      },
      percent: {
        style: "percent"
      }
    },
    date: {
      short: {
        month: "numeric",
        day: "numeric",
        year: "2-digit"
      },
      medium: {
        month: "short",
        day: "numeric",
        year: "numeric"
      },
      long: {
        month: "long",
        day: "numeric",
        year: "numeric"
      },
      full: {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    },
    time: {
      short: {
        hour: "numeric",
        minute: "numeric"
      },
      medium: {
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      },
      long: {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short"
      },
      full: {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short"
      }
    }
  };
  return IntlMessageFormat2;
}();
var o = IntlMessageFormat;
const r = {}, i = (e, n, t) => t ? (n in r || (r[n] = {}), e in r[n] || (r[n][e] = t), t) : t, l = (e, n) => {
  if (n == null)
    return;
  if (n in r && e in r[n])
    return r[n][e];
  const t = E(n);
  for (let o2 = 0; o2 < t.length; o2++) {
    const r2 = c(t[o2], e);
    if (r2)
      return i(e, n, r2);
  }
};
let a;
const s = writable({});
function u(e) {
  return e in a;
}
function c(e, n) {
  if (!u(e))
    return null;
  const t = function(e2) {
    return a[e2] || null;
  }(e);
  return function(e2, n2) {
    if (n2 == null)
      return;
    if (n2 in e2)
      return e2[n2];
    const t2 = n2.split(".");
    let o2 = e2;
    for (let e3 = 0; e3 < t2.length; e3++)
      if (typeof o2 == "object") {
        if (e3 > 0) {
          const n3 = t2.slice(e3, t2.length).join(".");
          if (n3 in o2) {
            o2 = o2[n3];
            break;
          }
        }
        o2 = o2[t2[e3]];
      } else
        o2 = void 0;
    return o2;
  }(t, n);
}
function m(e, ...n) {
  delete r[e], s.update((o2) => (o2[e] = cjs.all([o2[e] || {}, ...n]), o2));
}
derived([s], ([e]) => Object.keys(e));
s.subscribe((e) => a = e);
const d = {};
function g(e) {
  return d[e];
}
function h(e) {
  return e != null && E(e).some((e2) => {
    var n;
    return (n = g(e2)) === null || n === void 0 ? void 0 : n.size;
  });
}
function w(e, n) {
  const t = Promise.all(n.map((n2) => (function(e2, n3) {
    d[e2].delete(n3), d[e2].size === 0 && delete d[e2];
  }(e, n2), n2().then((e2) => e2.default || e2))));
  return t.then((n2) => m(e, ...n2));
}
const p = {};
function b(e) {
  if (!h(e))
    return e in p ? p[e] : Promise.resolve();
  const n = function(e2) {
    return E(e2).map((e3) => {
      const n2 = g(e3);
      return [e3, n2 ? [...n2] : []];
    }).filter(([, e3]) => e3.length > 0);
  }(e);
  return p[e] = Promise.all(n.map(([e2, n2]) => w(e2, n2))).then(() => {
    if (h(e))
      return b(e);
    delete p[e];
  }), p[e];
}
function y(e, n) {
  g(e) || function(e2) {
    d[e2] = /* @__PURE__ */ new Set();
  }(e);
  const t = g(e);
  g(e).has(n) || (u(e) || s.update((n2) => (n2[e] = {}, n2)), t.add(n));
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function v(e, n) {
  var t = {};
  for (var o2 in e)
    Object.prototype.hasOwnProperty.call(e, o2) && n.indexOf(o2) < 0 && (t[o2] = e[o2]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function") {
    var r2 = 0;
    for (o2 = Object.getOwnPropertySymbols(e); r2 < o2.length; r2++)
      n.indexOf(o2[r2]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o2[r2]) && (t[o2[r2]] = e[o2[r2]]);
  }
  return t;
}
function O({ locale: e, id: n }) {
  console.warn(`[svelte-i18n] The message "${n}" was not found in "${E(e).join('", "')}".${h(P()) ? "\n\nNote: there are at least one loader still registered to this locale that wasn't executed." : ""}`);
}
const j = { fallbackLocale: null, loadingDelay: 200, formats: { number: { scientific: { notation: "scientific" }, engineering: { notation: "engineering" }, compactLong: { notation: "compact", compactDisplay: "long" }, compactShort: { notation: "compact", compactDisplay: "short" } }, date: { short: { month: "numeric", day: "numeric", year: "2-digit" }, medium: { month: "short", day: "numeric", year: "numeric" }, long: { month: "long", day: "numeric", year: "numeric" }, full: { weekday: "long", month: "long", day: "numeric", year: "numeric" } }, time: { short: { hour: "numeric", minute: "numeric" }, medium: { hour: "numeric", minute: "numeric", second: "numeric" }, long: { hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "short" }, full: { hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "short" } } }, warnOnMissingMessages: true, handleMissingMessage: void 0, ignoreTag: true };
function M() {
  return j;
}
function $(e) {
  const { formats: n } = e, t = v(e, ["formats"]), o2 = e.initialLocale || e.fallbackLocale;
  return t.warnOnMissingMessages && (delete t.warnOnMissingMessages, t.handleMissingMessage == null ? t.handleMissingMessage = O : console.warn('[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.')), Object.assign(j, t, { initialLocale: o2 }), n && ("number" in n && Object.assign(j.formats.number, n.number), "date" in n && Object.assign(j.formats.date, n.date), "time" in n && Object.assign(j.formats.time, n.time)), D.set(o2);
}
const k = writable(false);
let T;
const L = writable(null);
function x(e) {
  return e.split("-").map((e2, n, t) => t.slice(0, n + 1).join("-")).reverse();
}
function E(e, n = M().fallbackLocale) {
  const t = x(e);
  return n ? [.../* @__PURE__ */ new Set([...t, ...x(n)])] : t;
}
function P() {
  return T != null ? T : void 0;
}
L.subscribe((e) => {
  T = e != null ? e : void 0, typeof window != "undefined" && e != null && document.documentElement.setAttribute("lang", e);
});
const D = Object.assign(Object.assign({}, L), { set: (e) => {
  if (e && function(e2) {
    if (e2 == null)
      return;
    const n = E(e2);
    for (let e3 = 0; e3 < n.length; e3++) {
      const t = n[e3];
      if (u(t))
        return t;
    }
  }(e) && h(e)) {
    const { loadingDelay: n } = M();
    let t;
    return typeof window != "undefined" && P() != null && n ? t = window.setTimeout(() => k.set(true), n) : k.set(true), b(e).then(() => {
      L.set(e);
    }).finally(() => {
      clearTimeout(t), k.set(false);
    });
  }
  return L.set(e);
} }), F = () => typeof window == "undefined" ? null : window.navigator.language || window.navigator.languages[0], C = (e) => {
  const n = /* @__PURE__ */ Object.create(null);
  return (t) => {
    const o2 = JSON.stringify(t);
    return o2 in n ? n[o2] : n[o2] = e(t);
  };
}, G = (e, n) => {
  const { formats: t } = M();
  if (e in t && n in t[e])
    return t[e][n];
  throw new Error(`[svelte-i18n] Unknown "${n}" ${e} format.`);
}, J = C((e) => {
  var { locale: n, format: t } = e, o2 = v(e, ["locale", "format"]);
  if (n == null)
    throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
  return t && (o2 = G("number", t)), new Intl.NumberFormat(n, o2);
}), U = C((e) => {
  var { locale: n, format: t } = e, o2 = v(e, ["locale", "format"]);
  if (n == null)
    throw new Error('[svelte-i18n] A "locale" must be set to format dates');
  return t ? o2 = G("date", t) : Object.keys(o2).length === 0 && (o2 = G("date", "short")), new Intl.DateTimeFormat(n, o2);
}), V = C((e) => {
  var { locale: n, format: t } = e, o2 = v(e, ["locale", "format"]);
  if (n == null)
    throw new Error('[svelte-i18n] A "locale" must be set to format time values');
  return t ? o2 = G("time", t) : Object.keys(o2).length === 0 && (o2 = G("time", "short")), new Intl.DateTimeFormat(n, o2);
}), _ = (e = {}) => {
  var { locale: n = P() } = e, t = v(e, ["locale"]);
  return J(Object.assign({ locale: n }, t));
}, q = (e = {}) => {
  var { locale: n = P() } = e, t = v(e, ["locale"]);
  return U(Object.assign({ locale: n }, t));
}, B = (e = {}) => {
  var { locale: n = P() } = e, t = v(e, ["locale"]);
  return V(Object.assign({ locale: n }, t));
}, H = C((e, n = P()) => new o(e, n, M().formats, { ignoreTag: M().ignoreTag })), K = (e, n = {}) => {
  var t, o2, r2, i2;
  let a2 = n;
  typeof e == "object" && (a2 = e, e = a2.id);
  const { values: s2, locale: u2 = P(), default: c2 } = a2;
  if (u2 == null)
    throw new Error("[svelte-i18n] Cannot format a message without first setting the initial locale.");
  let m2 = l(e, u2);
  if (m2) {
    if (typeof m2 != "string")
      return console.warn(`[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof m2}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`), m2;
  } else
    m2 = (i2 = (r2 = (o2 = (t = M()).handleMissingMessage) === null || o2 === void 0 ? void 0 : o2.call(t, { locale: u2, id: e, defaultValue: c2 })) !== null && r2 !== void 0 ? r2 : c2) !== null && i2 !== void 0 ? i2 : e;
  if (!s2)
    return m2;
  let f = m2;
  try {
    f = H(m2, u2).format(s2);
  } catch (n2) {
    console.warn(`[svelte-i18n] Message "${e}" has syntax error:`, n2.message);
  }
  return f;
}, Q = (e, n) => B(n).format(e), R = (e, n) => q(n).format(e), W = (e, n) => _(n).format(e), X = (e, n = P()) => l(e, n), Y = derived([D, s], () => K), ee = derived([D], () => Q);
derived([D], () => R);
derived([D], () => W);
derived([D, s], () => X);
function ie(e) {
  return b(e || P() || M().initialLocale);
}
const browser = false;
function marshalMap(u2) {
  return JSON.stringify(Array.from(u2.entries()));
}
function unmarshalMap(s2) {
  return new Map(JSON.parse(s2));
}
const ulos = storage("user-login-options", /* @__PURE__ */ new Map(), marshalMap, unmarshalMap);
const currentUlid = storage("current-user-login-id", "anonymous");
const prefix = "/api/v2/";
class Response {
  constructor(raw) {
    this.data = raw.data;
    this.errors = raw.errors ? raw.errors.map((e) => new ResponseError(e)) : [];
  }
  hasErrors() {
    return this.errors.length > 0;
  }
  toString() {
    return `Response: ${this.data} ${this.errors}`;
  }
}
class ResponseError {
  constructor(raw) {
    this.code = raw.code;
    this.message = raw.message;
    this.data = raw.data;
  }
  toString() {
    return `${this.code}: ${this.message}`;
  }
  toError() {
    if (this.code === "missing_perms") {
      return new MissingPermsError(this.data.missing_perms, this.data.reason);
    }
    return new TypeError(`${this.code}: ${this.message} (${JSON.stringify(this.data)})`);
  }
}
class MissingPermsError extends TypeError {
  constructor(missingPerms, reason) {
    super(`Missing permissions: ${missingPerms.join(", ")} (${reason})`);
    this.name = "MissingPerms";
    this.missingPerms = missingPerms;
    this.reason = reason;
  }
}
class EnhanceYourCalmError extends TypeError {
  constructor(limit) {
    super(`Enhance your calm: ${limit}`);
    this.name = "EnhanceYourCalm";
    this.limit = limit;
  }
}
class UnauthenticatedError extends TypeError {
  constructor() {
    super("Unauthenticated");
    this.name = "Unauthenticated";
  }
}
class ManyErrors extends Error {
  constructor(errors) {
    super(`${errors.length} errors: ${errors.map((e) => e.toString()).join(", ")}`);
    this.name = "ManyErrors";
    this.errors = errors;
  }
}
class Ax {
  constructor(raw) {
    this.aps = raw.aps.map((a2) => new Ap(a2));
    this.afs = raw.afs.map((a2) => new Af(a2));
    console.log("axc-done", this.aps, raw.aps);
  }
}
class Ap {
  constructor(ap) {
    console.log("apc", ap);
    this.uuid = ap.uuid;
    this.name = ap.name;
    this.reqs = ap.reqs;
    console.log("apc2", this);
  }
  toInput() {
    return {
      uuid: this.uuid,
      name: this.name,
      reqs: this.reqs
    };
  }
}
class Af {
  constructor(af) {
    this.uuid = af.uuid;
    this.name = af.name;
    this.verifier = af.verifier;
    this.params = af.params;
    this.public_params = af.public_params;
  }
  toInput() {
    return {
      uuid: this.uuid,
      name: this.name,
      verifier: this.verifier,
      params: this.params
    };
  }
}
class Handler {
  get name() {
    return this.name_;
  }
  constructor(client2, name) {
    this.client = client2;
    this.name_ = encodeURI(name);
  }
  assertNoErrors(res) {
    this.client._assertNoErrors(res);
  }
  key(ref) {
    return `generic_handler_${this.name_}_${ref.toString()}`;
  }
  cGet(ref) {
    return JSON.parse(window.localStorage.getItem(this.key(ref)));
  }
  cSet(ref, v2) {
    window.localStorage.setItem(this.key(ref), JSON.stringify({ time: new Date(), v: v2 }));
  }
  cDel(ref) {
    window.localStorage.setItem(this.key(ref), void 0);
  }
  async deref(ref) {
    const cached = this.cGet(ref);
    if (cached) {
      return cached.v;
    }
    const r2 = await this.client._fetch(`generic/deref/${this.name}?ref=${encodeURIComponent(ref.toString())}`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    const v2 = r2.data.single;
    this.cSet(ref, v2);
    return v2;
  }
  async assign(ref, v2) {
    const r2 = await this.client._fetch(`generic/assign/${this.name}?ref=${encodeURIComponent(ref.toString())}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ v: v2 })
    });
    this.assertNoErrors(r2);
    this.cSet(ref, v2);
  }
  async del(ref) {
    const r2 = await this.client._fetch(`generic/assign/${this.name}?ref=${encodeURIComponent(ref.toString())}`, {
      method: "DELETE"
    });
    this.assertNoErrors(r2);
    this.cDel(ref);
  }
  async seek(direction, offset, length) {
    offset = offset === null ? 0 : offset;
    const r2 = await this.client._fetch(`generic/seek/${this.name}?${new URLSearchParams({
      direction,
      offset,
      length: length.toString()
    })}`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.refs;
  }
  async anchor(direction) {
    const r2 = await this.client._fetch(`generic/anchor/${this.name}?${new URLSearchParams({ direction })}`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.anchor;
  }
  async total() {
    const r2 = await this.client._fetch(`generic/total/${this.name}`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.total;
  }
}
class BaseClient {
  constructor(baseUrl2) {
    this.disabled = !browser;
    this.baseUrl = new URL(baseUrl2);
    this.log = new Handler(this, "log");
  }
  get currentUlo() {
    if (get_store_value(currentUlid) === void 0) {
      return "anonymous";
    }
    return get_store_value(ulos).get(currentUlid);
  }
  toString() {
    return `[BaseClient ${this.baseUrl} ${this.currentToken}]`;
  }
  uloWith(ulid) {
    const this2 = new BaseClient(this.baseUrl.toString());
    this2.uloUse(ulid);
    return this2;
  }
  uloDel(ulid) {
    const ulos2 = get_store_value(ulos);
    ulos2.delete(ulid);
    ulos.set(ulos2);
  }
  uloUse(ulid) {
    const ulo = get_store_value(ulos).get(ulid);
    if (ulo === void 0)
      throw new Error(`No such ULO: ${ulid}`);
    console.log(`use ulo with ulid ${ulid}: ${JSON.stringify(ulo)}`);
    this.currentToken = ulo.token;
    this.currentUid = ulo.uid;
    currentUlid.set(ulid);
  }
  uloAdd(ulo) {
    const ulos2 = get_store_value(ulos);
    ulos2.set(ulo.ulid, ulo);
    ulos.set(ulos2);
  }
  loadCurrent() {
    const c2 = get_store_value(currentUlid);
    if (c2 === "anonymous") {
      this.uloReset();
    } else if (c2) {
      try {
        this.uloUse(c2);
      } catch (e) {
        if (e.message.includes("No such ULO")) {
          console.log(`no such ULO (${e}), so reset`);
          this.uloReset();
        } else {
          throw e;
        }
      }
    }
  }
  uloReset() {
    this.currentToken = null;
    this.currentUid = null;
    currentUlid.set("anonymous");
  }
  async getCsrfToken() {
    const r2 = await this.fetch(`csrf_token`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.csrf_token;
  }
  async commonOpts(method, headers) {
    return {
      method,
      credentials: "include",
      headers: {
        ...method !== "GET" ? { "X-CSRFToken": await this.getCsrfToken() } : {},
        ...this.currentToken ? { "X-Airy-Token": this.currentToken } : {},
        ...headers
      }
    };
  }
  _assertNoErrors(res) {
    this.assertNoErrors(res);
  }
  assertNoErrors(res) {
    if (res.hasErrors()) {
      if (res.errors.length === 1) {
        throw res.errors[0].toError();
      } else {
        const errors = res.errors.map((e) => e.toError());
        throw new ManyErrors(errors);
      }
    }
  }
  _fetch(url, opts) {
    return this.fetch(url, opts);
  }
  async fetch(url, opts) {
    if (this.disabled)
      throw new TypeError("can only fetch in a browser");
    const prefix2 = new URL(prefix, this.baseUrl);
    console.log(`fetch ${url} with token ${this.currentToken}`);
    try {
      const r2 = await fetch(new URL(url, prefix2.href).href, {
        ...opts,
        ...await this.commonOpts(opts.method, opts.headers)
      });
      switch (r2.status) {
        case 200:
          break;
        case 401:
          throw new UnauthenticatedError();
          return;
        case 429:
          {
            const limit = (await r2.json()).errors[0].data;
            throw new EnhanceYourCalmError(limit);
          }
          return;
        case 430:
          throw new TypeError("CSRF token not found");
          return;
        default:
          throw new TypeError(`unexpected status ${r2.status}`);
      }
      const raw = await r2.json();
      console.log("raw", raw);
      const r22 = new Response(raw);
      console.log("r2", r22);
      return r22;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
class Client extends BaseClient {
  uloWith(ulid) {
    const this2 = new Client(this.baseUrl.toString());
    this2.uloUse(ulid);
    return this2;
  }
  async userExists(slug) {
    const r2 = await this.fetch(`user/exists?slug=${encodeURIComponent(slug)}`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.exists;
  }
  async synchedLogin() {
    const r2 = await this.fetch(`login/sync`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.user;
  }
  async loginSync() {
    const r2 = await this.fetch(`login/sync`, {
      method: "POST"
    });
    this.assertNoErrors(r2);
    console.log(`synched login with token ${this.currentToken}`);
  }
  async loggedIn() {
    return !!this.currentToken;
  }
  async checkLoggedIn() {
    const r2 = await this.fetch(`logged_in`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.logged_in;
  }
  async status() {
    const r2 = await this.fetch(`status`, {
      method: "GET"
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "not_logged_in") {
      throw new TypeError("not logged in");
    } else {
      this.assertNoErrors(r2);
      return r2.data;
    }
  }
  async loginStop() {
    const r2 = await this.fetch(`login/stop`, {
      method: "POST"
    });
    this.assertNoErrors(r2);
  }
  async loginStart(slug) {
    const r2 = await this.fetch(`login/start`, {
      method: "POST",
      body: new URLSearchParams({ slug })
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "user_not_found") {
      return null;
    } else {
      this.assertNoErrors(r2);
      return r2.data;
    }
  }
  async loginChoose(apid) {
    const r2 = await this.fetch(`login/choose`, {
      method: "POST",
      body: new URLSearchParams({ apid })
    });
    this.assertNoErrors(r2);
    return r2.data;
  }
  async loginAttempt(afid, attempt, setToken = true) {
    const r2 = await this.fetch(`login/attempt`, {
      method: "POST",
      body: new URLSearchParams({ afid, attempt })
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "verification_failed") {
      return {
        success: false,
        cur_done: false,
        all_done: false,
        msg: r2.errors[0].data
      };
    } else {
      this.assertNoErrors(r2);
      if (r2.data.all_done && setToken) {
        this.uloAdd({
          uid: r2.data.uid,
          ulid: r2.data.ulid,
          slug: r2.data.slug,
          name: r2.data.name,
          token: r2.data.token
        });
        this.uloUse(r2.data.ulid);
      }
      return {
        success: true,
        ...r2.data
      };
    }
  }
  async logout(setToken = true) {
    const r2 = await this.fetch(`logout`, {
      method: "POST"
    });
    this.assertNoErrors(r2);
    if (setToken) {
      this.currentToken = null;
      this.currentUid = null;
    }
    return r2.data;
  }
  async signup(setToken = true) {
    const r2 = await this.fetch(`signup`, {
      method: "POST"
    });
    this.assertNoErrors(r2);
    if (setToken) {
      this.uloAdd({
        uid: r2.data.uid,
        ulid: r2.data.ulid,
        slug: null,
        name: null,
        token: r2.data.token
      });
      this.uloUse(r2.data.ulid);
    }
    return r2.data;
  }
  async remoteDecide(token) {
    const r2 = await this.fetch(`remote/decide`, {
      method: "POST",
      body: new URLSearchParams({ token })
    });
    this.assertNoErrors(r2);
  }
  remoteWait(uid, token) {
    return new Promise((resolve, reject) => {
      const prefix2 = new URL(prefix, this.baseUrl);
      const es = new EventSource(new URL(`remote/wait?uid=${uid}&token=${token}`, prefix2.href).href);
      es.addEventListener("decided", () => {
        es.close();
        resolve(null);
      });
      es.addEventListener("timeout", () => {
        es.close();
        reject(new TypeError("timeout"));
      });
    });
  }
  async getAx() {
    const r2 = await this.fetch(`config/ax`, {
      method: "GET"
    });
    console.log("getAx1", r2.data);
    console.log("getAx3", new Ax(r2.data));
    return new Ax(r2.data);
  }
  async submitAx(req) {
    const r2 = await this.fetch(`config/ax`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req)
    });
    this.assertNoErrors(r2);
    return r2.data;
  }
  async user(uid) {
    const r2 = await this.fetch(`user/${uid}`, {
      method: "GET"
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "user_not_found") {
      return null;
    } else {
      this.assertNoErrors(r2);
      return r2.data;
    }
  }
  async clearTafs() {
    const r2 = await this.fetch("config/ax/taf/clear", {
      method: "POST"
    });
    this.assertNoErrors(r2);
  }
  async allocTaf() {
    const r2 = await this.fetch("config/ax/taf/alloc", {
      method: "POST"
    });
    this.assertNoErrors(r2);
    return r2.data.tafid;
  }
  async deallocTaf(tafid) {
    const r2 = await this.fetch(`config/ax/taf/dealloc?tafid=${encodeURIComponent(tafid)}`, {
      method: "POST",
      body: new URLSearchParams({ tafid })
    });
    this.assertNoErrors(r2);
  }
  async genTaf(tafid, af, cont = false) {
    const r2 = await this.fetch(`config/ax/taf/gen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cont,
        tafid,
        name: af.name,
        verifier: af.verifier,
        gen_params: af.params
      })
    });
    return r2.data.taf;
  }
  async verifyTaf(tafid, attempt) {
    const r2 = await this.fetch(`config/ax/taf/verify`, {
      method: "POST",
      body: new URLSearchParams({ tafid, attempt })
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "verification_failed") {
      return { success: false, done: false, msg: r2.errors[0].data };
    } else {
      this.assertNoErrors(r2);
      return { success: true, done: r2.data.done, feedback: r2.data.feedback };
    }
  }
  async getId() {
    const r2 = await this.fetch(`config/id`, {
      method: "GET"
    });
    console.warn("getId", r2);
    return r2.data.user;
  }
  async submitId(req) {
    const r2 = await this.fetch(`config/id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req)
    });
    this.assertNoErrors(r2);
  }
  async submitImg(img) {
    const formData = new FormData();
    formData.append("img", img);
    const r2 = await this.fetch(`config/id/img`, {
      method: "POST",
      body: formData
    });
    this.assertNoErrors(r2);
  }
  async ulsList() {
    const r2 = await this.fetch("uls", {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.uls.map((ul) => {
      return {
        ...ul,
        start: new Date(ul.start),
        last: ul.last ? new Date(ul.last) : null,
        end: ul.end ? new Date(ul.end) : null
      };
    });
  }
  async actionUl(action, ulid, name) {
    const r2 = await this.fetch(`uls/${action}`, {
      method: "POST",
      body: new URLSearchParams({ ulid, ...name ? { name } : {} })
    });
    this.assertNoErrors(r2);
  }
  async revokeUl(ulid) {
    await this.actionUl("revoke", ulid);
  }
  async deleteUl(ulid) {
    await this.actionUl("delete", ulid);
  }
  async editUl(ulid, name) {
    await this.actionUl("edit", ulid, name);
  }
  async grantsList() {
    const r2 = await this.fetch("oauth/grants", {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.grants;
  }
  async grantsRevoke(grantId) {
    const r2 = await this.fetch("oauth/grants/revoke", {
      method: "POST",
      body: new URLSearchParams({ grant_id: grantId })
    });
    this.assertNoErrors(r2);
  }
  async getAzrq(azrqid) {
    const r2 = await this.fetch(`oauth/azrq?azrqid=${encodeURIComponent(azrqid)}`, {
      method: "GET"
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "azrq_not_found") {
      return null;
    } else {
      this.assertNoErrors(r2);
      return r2.data.args;
    }
  }
  async stepAzrq(azrqid) {
    const args = await this.getAzrq(azrqid);
    if (args == null) {
      return null;
    }
    args.azrqid = azrqid;
    const r2 = await this.fetch(`oauth/az/step?${new URLSearchParams(args)}`, {
      method: "POST"
    });
    this.assertNoErrors(r2);
    return r2.data.grant;
  }
  async oclient(oclid) {
    const r2 = await this.fetch(`oauth/oclient?oclid=${encodeURIComponent(oclid)}`, {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.oclient;
  }
  async oclientsList() {
    const r2 = await this.fetch("oauth/oclients", {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.oclients.map((oclient) => ({
      ...oclient,
      contacts: oclient.contacts ? oclient.contacts : [],
      jwks: oclient.jwks ? oclient.jwks : []
    }));
  }
  async oclientAction(action, oclid, ocl) {
    const r2 = await this.fetch(`oauth/oclients/${action}`, {
      method: "POST",
      body: JSON.stringify({
        ...oclid ? { oclid } : {},
        ...ocl ? { ocl } : {}
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    this.assertNoErrors(r2);
  }
  async oclientDelete(oclid) {
    await this.oclientAction("delete", oclid);
  }
  async oclientEdit(oclid, ocl) {
    await this.oclientAction("edit", oclid, ocl);
  }
  async logList() {
    const r2 = await this.fetch("logs", {
      method: "GET"
    });
    this.assertNoErrors(r2);
    return r2.data.logs.map((log) => ({
      ...log,
      created: new Date(log.created)
    }));
  }
  async emailVerifyStart(emailId) {
    const r2 = await this.fetch(`email/verify/start`, {
      method: "POST",
      body: new URLSearchParams({ email_id: emailId.toString() })
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "not_yours") {
      throw new Error(r2.errors[0].message);
    } else {
      this.assertNoErrors(r2);
    }
  }
  async emailInfo(token) {
    const r2 = await this.fetch(`email/info?token=${encodeURIComponent(token)}`, {
      method: "GET"
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "token_not_found") {
      throw new Error(r2.errors[0].message);
    } else {
      this.assertNoErrors(r2);
      return r2.data.email;
    }
  }
  async emailVerify(token) {
    const r2 = await this.fetch(`email/verify`, {
      method: "POST",
      body: new URLSearchParams({ token })
    });
    if (r2.errors.length === 1 && r2.errors[0].code === "email_mismatch") {
      throw new Error(r2.errors[0].message);
    } else if (r2.errors.length === 1 && r2.errors[0].code === "token_invalid") {
      throw new Error(r2.errors[0].message);
    } else {
      this.assertNoErrors(r2);
    }
  }
}
const baseUrl = "http://localhost:8080";
const client = new Client(baseUrl);
export { $, F, Handler as H, Y, client as a, currentUlid as c, ee as e, ie as i, k, ulos as u, y };
