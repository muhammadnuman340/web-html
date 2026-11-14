import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  getCategory,
  getAllCategories,
  convert,
  convertAll,
  convertTemp,
  convertFuel,
  getFormula,
  addCustomUnit
} from '../src/engine/converter'
import { Categories } from '../src/engine/categories'
import {
  parseSmart,
  cleanFloat,
  fmt,
  fmtComma,
  toFrac,
  toShopFraction
} from '../src/utils/numbers'
import { parseNaturalLanguage } from '../src/engine/smartParser'
import { getAllChains, executeChain } from '../src/engine/conversionChains'

function approxEqual(actual: number | null, expected: number, tolerance = 1e-4, msg = ''): void {
  assert.notEqual(actual, null, `${msg}: Expected non-null value, got null`)
  const diff = Math.abs((actual as number) - expected)
  const allowed = Math.max(tolerance, Math.abs(expected) * tolerance)
  assert.ok(
    diff <= allowed,
    `${msg}: Expected ${actual} ≈ ${expected} within tolerance ${allowed} (diff: ${diff})`
  )
}

describe('Task 2 & 3: Category Registry & Integrity', () => {
  it('contains exactly 35 registered categories', () => {
    assert.equal(Categories.length, 35)
    assert.equal(getAllCategories().length, 35)
  })

  it('guarantees unique category IDs across the entire registry', () => {
    const ids = Categories.map(c => c.id)
    const uniqueIds = new Set(ids)
    assert.equal(uniqueIds.size, ids.length, 'Duplicate category ID found')
  })

  it('guarantees unique unit IDs within every category', () => {
    for (const cat of Categories) {
      const unitIds = cat.un.map(u => u.id)
      const uniqueUnitIds = new Set(unitIds)
      assert.equal(
        uniqueUnitIds.size,
        unitIds.length,
        `Duplicate unit ID found in category "${cat.id}"`
      )
    }
  })

  it('verifies all required fields exist on every category definition', () => {
    for (const cat of Categories) {
      assert.ok(typeof cat.id === 'string' && cat.id.length > 0, `Category missing id`)
      assert.ok(typeof cat.lb === 'string' && cat.lb.length > 0, `Category ${cat.id} missing lb`)
      assert.ok(typeof cat.ic === 'string' && cat.ic.length > 0, `Category ${cat.id} missing ic`)
      assert.ok(typeof cat.cl === 'string' && cat.cl.length > 0, `Category ${cat.id} missing cl`)
      assert.ok(Array.isArray(cat.un) && cat.un.length > 0, `Category ${cat.id} has empty units`)
    }
  })

  it('verifies all units have valid required fields and finite positive rates where applicable', () => {
    for (const cat of Categories) {
      for (const u of cat.un) {
        assert.ok(typeof u.id === 'string' && u.id.length > 0, `Unit missing id in ${cat.id}`)
        assert.ok(typeof u.lb === 'string' && u.lb.length > 0, `Unit ${u.id} missing lb in ${cat.id}`)

        if (!cat.sp && cat.id !== 'temp' && cat.id !== 'fuel') {
          assert.ok(
            typeof u.r === 'number' && Number.isFinite(u.r) && u.r > 0,
            `Unit ${u.id} in ${cat.id} has invalid conversion rate ${u.r}`
          )
        }
      }
    }
  })

  it('verifies getCategory lookup retrieves correct category definitions', () => {
    assert.equal(getCategory('length')?.lb, 'Length')
    assert.equal(getCategory('temp')?.lb, 'Temperature')
    assert.equal(getCategory('fuel')?.lb, 'Fuel Economy')
    assert.equal(getCategory('nonexistent'), undefined)
  })

  it('verifies base reference units exist for linear categories', () => {
    const linearCats = Categories.filter(c => !c.sp && c.id !== 'temp' && c.id !== 'fuel')
    for (const cat of linearCats) {
      const baseUnit = cat.un.find(u => u.r === 1)
      assert.ok(baseUnit !== undefined, `Category ${cat.id} is missing a base unit with r === 1`)
    }
  })
})

describe('Task 4: Golden Conversion Known-Answer Tests', () => {
  it('converts Length units accurately against NIST standards', () => {
    assert.equal(convert(1, 'length', 'm', 'cm'), 100)
    assert.equal(convert(1, 'length', 'km', 'm'), 1000)
    assert.equal(convert(1, 'length', 'in', 'cm'), 2.54)
    assert.equal(convert(1, 'length', 'ft', 'in'), 12)
    assert.equal(convert(1, 'length', 'ft', 'm'), 0.3048)
    assert.equal(convert(1, 'length', 'mi', 'ft'), 5280)
    assert.equal(convert(1, 'length', 'mi', 'm'), 1609.344)
    assert.equal(convert(1, 'length', 'yd', 'ft'), 3)
    assert.equal(convert(1, 'length', 'yd', 'm'), 0.9144)
    assert.equal(convert(1, 'length', 'nmi', 'm'), 1852)
  })

  it('converts Mass units accurately against BIPM standards', () => {
    assert.equal(convert(1, 'mass', 'kg', 'g'), 1000)
    assert.equal(convert(1, 'mass', 'g', 'mg'), 1000)
    assert.equal(convert(1, 'mass', 't', 'kg'), 1000)
    assert.equal(convert(1, 'mass', 'lb', 'kg'), 0.453592)
    approxEqual(convert(1, 'mass', 'lb', 'oz'), 16, 1e-4, '1 lb to oz')
    approxEqual(convert(1, 'mass', 'stone', 'lb'), 14, 1e-4, '1 stone to lb')
    approxEqual(convert(1, 'mass', 'oz', 'g'), 28.3495, 1e-4, '1 oz to g')
  })

  it('converts Area units accurately', () => {
    assert.equal(convert(1, 'area', 'm2', 'cm2'), 10000)
    assert.equal(convert(1, 'area', 'km2', 'm2'), 1000000)
    assert.equal(convert(1, 'area', 'ha', 'm2'), 10000)
    assert.equal(convert(1, 'area', 'ac', 'm2'), 4046.86)
    approxEqual(convert(1, 'area', 'ft2', 'in2'), 144, 1e-3, '1 ft2 to in2')
  })

  it('converts Volume units accurately (US liquid definitions)', () => {
    assert.equal(convert(1, 'volume', 'L', 'mL'), 1000)
    assert.equal(convert(1, 'volume', 'm3', 'L'), 1000)
    assert.equal(convert(1, 'volume', 'gal', 'L'), 3.78541)
    approxEqual(convert(1, 'volume', 'gal', 'qt'), 4, 1e-4, '1 gal to qt')
    approxEqual(convert(1, 'volume', 'qt', 'pt'), 2, 1e-4, '1 qt to pt')
    approxEqual(convert(1, 'volume', 'pt', 'floz'), 16, 1e-4, '1 pt to floz')
  })

  it('converts Speed units accurately', () => {
    approxEqual(convert(1, 'speed', 'mps', 'kmh'), 3.6, 1e-4, '1 mps to kmh')
    approxEqual(convert(100, 'speed', 'kmh', 'mph'), 62.1371, 1e-3, '100 kmh to mph')
    assert.equal(convert(1, 'speed', 'mph', 'mps'), 0.44704)
    approxEqual(convert(1, 'speed', 'knot', 'kmh'), 1.852, 1e-4, '1 knot to kmh')
  })

  it('converts Time units accurately', () => {
    assert.equal(convert(1, 'time', 'min', 's'), 60)
    assert.equal(convert(1, 'time', 'hr', 'min'), 60)
    assert.equal(convert(1, 'time', 'hr', 's'), 3600)
    assert.equal(convert(1, 'time', 'day', 'hr'), 24)
    assert.equal(convert(1, 'time', 'day', 's'), 86400)
    assert.equal(convert(1, 'time', 'week', 'day'), 7)
    assert.equal(convert(1, 'time', 'yr', 's'), 31557600)
  })

  it('converts Pressure units accurately', () => {
    assert.equal(convert(1, 'pressure', 'kPa', 'Pa'), 1000)
    assert.equal(convert(1, 'pressure', 'MPa', 'kPa'), 1000)
    assert.equal(convert(1, 'pressure', 'bar', 'Pa'), 100000)
    assert.equal(convert(1, 'pressure', 'bar', 'kPa'), 100)
    assert.equal(convert(1, 'pressure', 'atm', 'Pa'), 101325)
    assert.equal(convert(1, 'pressure', 'atm', 'kPa'), 101.325)
  })

  it('converts Energy units accurately', () => {
    assert.equal(convert(1, 'energy', 'kJ', 'J'), 1000)
    assert.equal(convert(1, 'energy', 'cal', 'J'), 4.184)
    assert.equal(convert(1, 'energy', 'kcal', 'cal'), 1000)
    assert.equal(convert(1, 'energy', 'kWh', 'J'), 3600000)
    assert.equal(convert(1, 'energy', 'BTU', 'J'), 1055.06)
  })

  it('converts Power units accurately', () => {
    assert.equal(convert(1, 'power', 'kW', 'W'), 1000)
    assert.equal(convert(1, 'power', 'MW', 'kW'), 1000)
    assert.equal(convert(1, 'power', 'hp', 'W'), 745.7)
  })

  it('converts Digital Data units accurately', () => {
    assert.equal(convert(1, 'data', 'B', 'bit'), 8)
    assert.equal(convert(1, 'data', 'KB', 'B'), 1000)
    assert.equal(convert(1, 'data', 'MB', 'KB'), 1000)
    assert.equal(convert(1, 'data', 'GB', 'MB'), 1000)
    assert.equal(convert(1, 'data', 'TB', 'GB'), 1000)
  })

  it('converts Angle units accurately', () => {
    assert.equal(convert(1, 'angle', 'deg', 'arcmin'), 60)
    assert.equal(convert(1, 'angle', 'deg', 'arcsec'), 3600)
    assert.equal(convert(1, 'angle', 'grad', 'deg'), 0.9)
  })
})

describe('Task 5: Temperature Test Suite', () => {
  it('converts benchmark Celsius to Fahrenheit values', () => {
    assert.equal(convertTemp(0, 'C', 'F'), 32)
    assert.equal(convertTemp(100, 'C', 'F'), 212)
    assert.equal(convertTemp(-40, 'C', 'F'), -40)
    assert.equal(convertTemp(37, 'C', 'F'), 98.6)
  })

  it('converts benchmark Fahrenheit to Celsius values', () => {
    assert.equal(convertTemp(32, 'F', 'C'), 0)
    assert.equal(convertTemp(212, 'F', 'C'), 100)
    assert.equal(convertTemp(-40, 'F', 'C'), -40)
    approxEqual(convertTemp(98.6, 'F', 'C'), 37, 1e-4, '98.6F to C')
  })

  it('converts Celsius to Kelvin and vice-versa', () => {
    assert.equal(convertTemp(0, 'C', 'K'), 273.15)
    assert.equal(convertTemp(100, 'C', 'K'), 373.15)
    assert.equal(convertTemp(273.15, 'K', 'C'), 0)
    assert.equal(convertTemp(0, 'K', 'C'), -273.15)
  })

  it('converts Fahrenheit to Kelvin directly', () => {
    assert.equal(convertTemp(32, 'F', 'K'), 273.15)
    assert.equal(convertTemp(212, 'F', 'K'), 373.15)
    approxEqual(convertTemp(0, 'K', 'F'), -459.67, 1e-4, '0 K to F')
  })

  it('converts Rankine and Réaumur scales correctly', () => {
    assert.equal(convertTemp(0, 'C', 'R'), 491.67)
    assert.equal(convertTemp(491.67, 'R', 'C'), 0)
    assert.equal(convertTemp(32, 'F', 'R'), 491.67)
    assert.equal(convertTemp(0, 'C', 'Re'), 0)
    assert.equal(convertTemp(100, 'C', 'Re'), 80)
    assert.equal(convertTemp(80, 'Re', 'C'), 100)
  })

  it('handles negative temperatures safely across all scales', () => {
    assert.equal(convertTemp(-10, 'C', 'F'), 14)
    assert.equal(convertTemp(-273.15, 'C', 'K'), 0)
    assert.equal(convertTemp(-100, 'C', 'F'), -148)
  })

  it('preserves identity conversion when from === to', () => {
    assert.equal(convertTemp(25, 'C', 'C'), 25)
    assert.equal(convertTemp(72, 'F', 'F'), 72)
    assert.equal(convertTemp(300, 'K', 'K'), 300)
  })
})

describe('Special Category: Fuel Economy Reciprocal Suite', () => {
  it('converts km/L to L/100km reciprocally', () => {
    assert.equal(convertFuel(10, 'kmL', 'L100km'), 10)
    assert.equal(convertFuel(20, 'kmL', 'L100km'), 5)
    assert.equal(convertFuel(5, 'L100km', 'kmL'), 20)
  })

  it('converts MPG (US) to km/L and L/100km', () => {
    assert.equal(convertFuel(1, 'mpgUS', 'kmL'), 0.425144)
    approxEqual(convertFuel(23.5215, 'mpgUS', 'L100km'), 10, 1e-2, '23.52 MPG US to L100km')
  })

  it('fails safely on zero or negative fuel economy', () => {
    assert.equal(convertFuel(0, 'kmL', 'L100km'), null)
    assert.equal(convertFuel(-15, 'mpgUS', 'kmL'), null)
    assert.equal(convertFuel(NaN, 'kmL', 'L100km'), null)
  })
})

describe('Task 13: Universal Category Coverage — All 24 Categories Tested', () => {
  const categoryTestCases: { cat: string; from: string; to: string; val: number }[] = [
    { cat: 'length', from: 'm', to: 'cm', val: 1 },
    { cat: 'area', from: 'm2', to: 'cm2', val: 1 },
    { cat: 'volume', from: 'L', to: 'mL', val: 1 },
    { cat: 'mass', from: 'kg', to: 'g', val: 1 },
    { cat: 'temp', from: 'C', to: 'F', val: 0 },
    { cat: 'time', from: 'hr', to: 'min', val: 1 },
    { cat: 'speed', from: 'mps', to: 'kmh', val: 1 },
    { cat: 'acceleration', from: 'mps2', to: 'gal', val: 1 },
    { cat: 'force', from: 'N', to: 'dyn', val: 1 },
    { cat: 'pressure', from: 'kPa', to: 'Pa', val: 1 },
    { cat: 'energy', from: 'kJ', to: 'J', val: 1 },
    { cat: 'power', from: 'kW', to: 'W', val: 1 },
    { cat: 'electricity', from: 'kV', to: 'V', val: 1 },
    { cat: 'magnetism', from: 'T', to: 'G', val: 1 },
    { cat: 'frequency', from: 'kHz', to: 'Hz', val: 1 },
    { cat: 'data', from: 'MB', to: 'KB', val: 1 },
    { cat: 'datatransfer', from: 'Mbps', to: 'kbps', val: 1 },
    { cat: 'angle', from: 'deg', to: 'arcmin', val: 1 },
    { cat: 'torque', from: 'Nm', to: 'lbft', val: 1 },
    { cat: 'fuel', from: 'kmL', to: 'L100km', val: 10 },
    { cat: 'density', from: 'gcm3', to: 'kgm3', val: 1 },
    { cat: 'cooking', from: 'cup_c', to: 'tbsp_c', val: 1 },
    { cat: 'textile', from: 'gsm', to: 'oz_yd2', val: 480 },
    { cat: 'astronomy', from: 'ly_a', to: 'au_a', val: 1 },
    { cat: 'flow', from: 'gpm', to: 'Lmin', val: 1 },
    { cat: 'illuminance', from: 'fc', to: 'lx', val: 1 },
    { cat: 'viscosity', from: 'cP', to: 'Pas', val: 1 },
    { cat: 'typography', from: 'px', to: 'pt', val: 16 },
    { cat: 'number-base', from: 'dec', to: 'bin', val: 42 },
    { cat: 'ieee-754', from: 'dec_real', to: 'dec_real', val: 3.14159 },
    { cat: 'pk-numbering', from: 'lakh', to: 'ones', val: 1 },
    { cat: 'statistics', from: 'prob_pct', to: 'dec_odds', val: 50 },
    { cat: 'matrix-format', from: 'csv', to: 'csv', val: 1 },
    { cat: 'scientific-notation', from: 'sci_kilo', to: 'dec_std', val: 1 },
    { cat: 'pk-gpa', from: 'percentage', to: 'hec_gpa4', val: 85 },
  ]

  it('guarantees test execution for every one of the 35 registered categories', () => {
    assert.equal(categoryTestCases.length, 35)
    for (const tc of categoryTestCases) {
      const res = convert(tc.val, tc.cat, tc.from, tc.to)
      assert.notEqual(res, null, `Category ${tc.cat} failed conversion from ${tc.from} to ${tc.to}`)
      assert.ok(typeof res === 'number' && Number.isFinite(res), `Category ${tc.cat} produced non-finite result`)
    }
  })

  it('verifies convertAll returns results for all units in a category', () => {
    const list = convertAll(10, 'length', 'm')
    const lenCat = Categories.find(c => c.id === 'length')!
    assert.equal(list.length, lenCat.un.length)
    const cmEntry = list.find(e => e.id === 'cm')
    assert.equal(cmEntry?.value, 1000)
  })
})

describe('Task 6: Round-Trip Property Tests (A -> B -> A)', () => {
  const testValues = [0.001, 1, 1.5, 100, 12345.6789, 1000000]

  it('preserves values in round-trip length conversions (m <-> ft)', () => {
    for (const v of testValues) {
      const b = convert(v, 'length', 'm', 'ft')
      const a = convert(b!, 'length', 'ft', 'm')
      approxEqual(a, v, 1e-4, `m -> ft -> m for ${v}`)
    }
  })

  it('preserves values in round-trip mass conversions (kg <-> lb)', () => {
    for (const v of testValues) {
      const b = convert(v, 'mass', 'kg', 'lb')
      const a = convert(b!, 'mass', 'lb', 'kg')
      approxEqual(a, v, 1e-4, `kg -> lb -> kg for ${v}`)
    }
  })

  it('preserves values in round-trip temperature conversions (C <-> F)', () => {
    const tempValues = [-100, -40, 0, 25, 37, 100, 250]
    for (const v of tempValues) {
      const b = convert(v, 'temp', 'C', 'F')
      const a = convert(b!, 'temp', 'F', 'C')
      approxEqual(a, v, 1e-4, `C -> F -> C for ${v}`)
    }
  })

  it('preserves values in round-trip volume conversions (L <-> gal)', () => {
    for (const v of testValues) {
      const b = convert(v, 'volume', 'L', 'gal')
      const a = convert(b!, 'volume', 'gal', 'L')
      approxEqual(a, v, 1e-4, `L -> gal -> L for ${v}`)
    }
  })

  it('preserves values in round-trip fuel conversions (kmL <-> L100km)', () => {
    for (const v of [5, 10, 15, 25]) {
      const b = convert(v, 'fuel', 'kmL', 'L100km')
      const a = convert(b!, 'fuel', 'L100km', 'kmL')
      approxEqual(a, v, 1e-4, `kmL -> L100km -> kmL for ${v}`)
    }
  })
})

describe('Task 7: Cross-Unit Consistency (A -> B -> C vs A -> C)', () => {
  it('verifies transitive consistency in length (in -> ft -> m)', () => {
    const v = 120 // 120 inches = 10 ft
    const inToFt = convert(v, 'length', 'in', 'ft')!
    const ftToM = convert(inToFt, 'length', 'ft', 'm')!
    const directInToM = convert(v, 'length', 'in', 'm')!
    approxEqual(ftToM, directInToM, 1e-5, '120 in transitive consistency')
  })

  it('verifies transitive consistency in mass (oz -> lb -> kg)', () => {
    const v = 32 // 32 oz = 2 lbs
    const ozToLb = convert(v, 'mass', 'oz', 'lb')!
    const lbToKg = convert(ozToLb, 'mass', 'lb', 'kg')!
    const directOzToKg = convert(v, 'mass', 'oz', 'kg')!
    approxEqual(lbToKg, directOzToKg, 1e-4, '32 oz transitive consistency')
  })

  it('verifies transitive consistency in time (s -> min -> hr)', () => {
    const v = 7200
    const sToMin = convert(v, 'time', 's', 'min')!
    const minToHr = convert(sToMin, 'time', 'min', 'hr')!
    const directSToHr = convert(v, 'time', 's', 'hr')!
    assert.equal(minToHr, directSToHr)
  })

  it('verifies transitive consistency in energy (cal -> kcal -> J)', () => {
    const v = 5000
    const calToKcal = convert(v, 'energy', 'cal', 'kcal')!
    const kcalToJ = convert(calToKcal, 'energy', 'kcal', 'J')!
    const directCalToJ = convert(v, 'energy', 'cal', 'J')!
    approxEqual(kcalToJ, directCalToJ, 1e-4, '5000 cal transitive consistency')
  })
})

describe('Task 8: Smart Parser NLP Tests', () => {
  it('parses standard natural language queries correctly', () => {
    const res1 = parseNaturalLanguage('10 km to miles')
    assert.equal(res1.type, 'convert')
    assert.equal(res1.value, 10)
    assert.equal(res1.fromUnit, 'km')
    assert.equal(res1.toUnit, 'mi')

    const res2 = parseNaturalLanguage('5 feet to meters')
    assert.equal(res2.type, 'convert')
    assert.equal(res2.value, 5)
    assert.equal(res2.fromUnit, 'ft')
    assert.equal(res2.toUnit, 'm')

    const res3 = parseNaturalLanguage('100 c to f')
    assert.equal(res3.type, 'convert')
    assert.equal(res3.value, 100)
    assert.equal(res3.fromUnit, 'C')
    assert.equal(res3.toUnit, 'F')

    const res4 = parseNaturalLanguage('2.5 kg to lb')
    assert.equal(res4.type, 'convert')
    assert.equal(res4.value, 2.5)
    assert.equal(res4.fromUnit, 'kg')
    assert.equal(res4.toUnit, 'lb')
  })

  it('parses arrow and symbol expressions', () => {
    const arrow = parseNaturalLanguage('100 km -> mi')
    assert.equal(arrow.type, 'convert')
    assert.equal(arrow.value, 100)
    assert.equal(arrow.fromUnit, 'km')
    assert.equal(arrow.toUnit, 'mi')

    const eq = parseNaturalLanguage('50 m = ft')
    assert.equal(eq.type, 'convert')
    assert.equal(eq.value, 50)
    assert.equal(eq.fromUnit, 'm')
    assert.equal(eq.toUnit, 'ft')
  })

  it('parses "how many" sentence structures', () => {
    const hm = parseNaturalLanguage('how many miles in 10 km')
    assert.equal(hm.type, 'convert')
    assert.equal(hm.value, 10)
    assert.equal(hm.fromUnit, 'km')
    assert.equal(hm.toUnit, 'mi')
  })

  it('parses compound feet and inches into decimal feet', () => {
    const compound = parseNaturalLanguage('5 ft 10 in to cm')
    assert.equal(compound.type, 'convert')
    approxEqual(compound.value!, 5 + 10 / 12, 1e-4, '5 ft 10 in to feet')
    assert.equal(compound.fromUnit, 'ft')
    assert.equal(compound.toUnit, 'cm')
  })

  it('handles case insensitivity and extra whitespace gracefully', () => {
    const clean = parseNaturalLanguage('   100   CELSIUS   TO   FAHRENHEIT   ')
    assert.equal(clean.type, 'convert')
    assert.equal(clean.value, 100)
    assert.equal(clean.fromUnit, 'C')
    assert.equal(clean.toUnit, 'F')
  })

  it('parses negative numbers and scientific notation', () => {
    const neg = parseNaturalLanguage('-40 c to f')
    assert.equal(neg.type, 'convert')
    assert.equal(neg.value, -40)
    assert.equal(neg.fromUnit, 'C')
    assert.equal(neg.toUnit, 'F')

    const sci = parseNaturalLanguage('1e3 m to km')
    assert.equal(sci.type, 'convert')
    assert.equal(sci.value, 1000)
    assert.equal(sci.fromUnit, 'm')
    assert.equal(sci.toUnit, 'km')
  })

  it('safely classifies unsupported or malformed expressions as unknown', () => {
    assert.equal(parseNaturalLanguage('').type, 'unknown')
    assert.equal(parseNaturalLanguage('hello world').type, 'unknown')
    assert.equal(parseNaturalLanguage('10 apples to oranges').type, 'unknown')
  })
})

describe('Task 9: Number Parsing & Formatting Utility Suite', () => {
  it('parses simple integers and decimals', () => {
    assert.equal(parseSmart('0'), 0)
    assert.equal(parseSmart('1'), 1)
    assert.equal(parseSmart('-1'), -1)
    assert.equal(parseSmart('1.5'), 1.5)
    assert.equal(parseSmart('0.0001'), 0.0001)
    assert.equal(parseSmart('1000000'), 1000000)
  })

  it('parses locale comma decimals and thousand separators', () => {
    assert.equal(parseSmart('12,5'), 12.5)
    assert.equal(parseSmart('1,000'), 1000)
    assert.equal(parseSmart('1,250.50'), 1250.5)
  })

  it('parses simple fractions and mixed fractions', () => {
    assert.equal(parseSmart('1/2'), 0.5)
    assert.equal(parseSmart('3/4'), 0.75)
    assert.equal(parseSmart('1 1/2'), 1.5)
    assert.equal(parseSmart('5 3/8'), 5.375)
    assert.equal(parseSmart('-1/4'), -0.25)
    assert.equal(parseSmart('-2 1/4'), -2.25)
  })

  it('parses compound imperial architectural syntax', () => {
    approxEqual(parseSmart('5\' 10"', 0.3048), 5 + 10 / 12, 1e-6, '5\' 10"')
    assert.equal(parseSmart('5ft 6in', 0.3048), 5.5)
    approxEqual(parseSmart('5\' 3/4"', 0.3048), 5 + 0.75 / 12, 1e-6, '5\' 3/4"')
  })

  it('fails safely with null on invalid numeric inputs', () => {
    assert.equal(parseSmart('abc'), null)
    assert.equal(parseSmart('--'), null)
    assert.equal(parseSmart('1//2'), null)
    assert.equal(parseSmart('1/0'), null)
    assert.equal(parseSmart('NaN'), null)
    assert.equal(parseSmart('Infinity'), null)
    assert.equal(parseSmart(''), null)
  })

  it('cleans floating point artifacts with cleanFloat', () => {
    assert.equal(cleanFloat(0.1 + 0.2), 0.3)
    assert.equal(cleanFloat(0), 0)
    assert.equal(cleanFloat(NaN), 0)
    assert.equal(cleanFloat(Infinity), 0)
  })

  it('formats numbers with fmt, fmtComma, and toFrac', () => {
    assert.equal(fmt(0), '0')
    assert.equal(fmt(null), '—')
    assert.equal(fmt(undefined), '—')
    assert.equal(fmt(12.3456789, 2), '12.35')
    assert.equal(fmtComma(1234567.89, 2), '1,234,567.89')
    assert.equal(toFrac(0.5), '1/2')
    assert.equal(toFrac(1.75), '1 3/4')
    assert.equal(toFrac(0), '0')
  })

  it('computes shop fractional tolerance via toShopFraction', () => {
    const res = toShopFraction(5.375, 16)
    assert.equal(res.decimalInches, 5.375)
    assert.equal(res.nearestFractionInch, '5 3/8″')
    assert.equal(res.isExact, true)
    assert.equal(res.errorInches, 0)
  })
})

describe('Task 10: Zero, Negative & Extreme Mathematical Values', () => {
  it('correctly handles zero without failing truthiness checks', () => {
    assert.equal(convert(0, 'length', 'm', 'ft'), 0)
    assert.equal(convert(0, 'mass', 'kg', 'lb'), 0)
    assert.equal(convert(0, 'speed', 'mps', 'kmh'), 0)
    assert.equal(convert(0, 'temp', 'C', 'F'), 32)
    assert.equal(convert(0, 'temp', 'C', 'K'), 273.15)
  })

  it('converts negative numbers in valid physical domains', () => {
    assert.equal(convert(-40, 'temp', 'C', 'F'), -40)
    assert.equal(convert(-90, 'angle', 'deg', 'grad'), -100)
    assert.equal(convert(-10, 'force', 'N', 'dyn'), -1000000)
  })

  it('handles sub-micro and extreme values without precision loss', () => {
    assert.equal(convert(1e-9, 'length', 'm', 'nm'), 1)
    assert.equal(convert(1, 'length', 'nm', 'm'), 1e-9)
    assert.equal(convert(1e12, 'data', 'B', 'TB'), 1)
    assert.equal(convert(1, 'data', 'TB', 'B'), 1e12)
    assert.equal(convert(1, 'length', 'ly', 'm'), 9.461e15)
  })
})

describe('Task 14: Contract & Error Handling Behavior', () => {
  it('returns null for unknown categories', () => {
    assert.equal(convert(10, 'unknown_category', 'm', 'ft'), null)
    assert.equal(convert(10, '', 'm', 'ft'), null)
  })

  it('returns null for unknown source or destination units', () => {
    assert.equal(convert(10, 'length', 'nonexistent_unit', 'ft'), null)
    assert.equal(convert(10, 'length', 'm', 'nonexistent_unit'), null)
  })

  it('returns null for NaN and Infinity values', () => {
    assert.equal(convert(NaN, 'length', 'm', 'ft'), null)
    assert.equal(convert(Infinity, 'length', 'm', 'ft'), null)
    assert.equal(convert(-Infinity, 'length', 'm', 'ft'), null)
  })

  it('handles custom unit registration safely', () => {
    const registered = addCustomUnit('length', 'cubit_custom', 'Custom Cubit', 0.5)
    assert.equal(registered, true)
    assert.equal(convert(2, 'length', 'cubit_custom', 'm'), 1)
    // Duplicate ID rejection
    const duplicate = addCustomUnit('length', 'cubit_custom', 'Custom Cubit 2', 0.5)
    assert.equal(duplicate, false)
  })

  it('returns formatted conversion formulas correctly', () => {
    const f1 = getFormula('temp', 'C', 'F')
    assert.equal(f1, '°F = (°C × 9/5) + 32')
    const f2 = getFormula('fuel', 'mpgUS', 'L100km')
    assert.equal(f2, 'L/100km = 235.215 ÷ MPG (US)')
    const f3 = getFormula('length', 'm', 'cm')
    assert.equal(f3, '1 Meter = 100 Centimeter')
  })
})

describe('Pinned exact conversion factors and category integrity', () => {
  it('pins exact NIST and mathematical conversion factors using real convert()', () => {
    function assertRelative(actual: number | null, expected: number, msg: string) {
      assert.notEqual(actual, null, `${msg}: actual is null`)
      const relDiff = Math.abs((actual as number) - expected) / Math.abs(expected)
      assert.ok(
        relDiff < 1e-9,
        `${msg}: actual ${actual} not within 1e-9 of expected ${expected} (relDiff: ${relDiff})`
      )
    }

    // 1 lbf = 4.4482216152605 N
    assertRelative(convert(1, 'force', 'lbf', 'N'), 4.4482216152605, '1 lbf = 4.4482216152605 N')

    // 1 rad = 57.29577951308232 deg (180/Math.PI)
    assertRelative(convert(1, 'angle', 'rad', 'deg'), 180 / Math.PI, '1 rad = 57.29577951308232 deg')

    // 1 mrad = 0.001 rad
    assertRelative(convert(1, 'angle', 'mrad', 'rad'), 0.001, '1 mrad = 0.001 rad')

    // 1 ft/s² = 0.3048 m/s²
    assertRelative(convert(1, 'acceleration', 'ftps2', 'mps2'), 0.3048, '1 ft/s² = 0.3048 m/s²')

    // 1 kN = 1000 N
    assertRelative(convert(1, 'force', 'kN', 'N'), 1000, '1 kN = 1000 N')

    // 1 BTU/h = 0.29307107 W
    assertRelative(convert(1, 'power', 'BTUh', 'W'), 0.29307107, '1 BTU/h = 0.29307107 W')

    // 60 RPM = 1 Hz
    assertRelative(convert(60, 'frequency', 'rpm', 'Hz'), 1, '60 RPM = 1 Hz')
  })

  it('guarantees unit ids are unique within every category', () => {
    for (const cat of Categories) {
      const ids = cat.un.map(u => u.id)
      const uniqueIds = new Set(ids)
      assert.equal(
        uniqueIds.size,
        ids.length,
        `Duplicate unit id found in category "${cat.id}"`
      )
    }
  })

  it('guarantees unit labels are unique within every category', () => {
    for (const cat of Categories) {
      const labels = cat.un.map(u => u.lb)
      const uniqueLabels = new Set(labels)
      assert.equal(
        uniqueLabels.size,
        labels.length,
        `Duplicate unit label found in category "${cat.id}"`
      )
    }
  })
})

describe('Task: Pakistani Regional Units & Multi-Step Chains Verification', () => {
  it('converts Pakistani Area units accurately', () => {
    approxEqual(convert(1, 'area', 'marla_soc', 'ft2') || 0, 225, 1e-3, 'marla_soc to ft2')
    approxEqual(convert(1, 'area', 'marla_cap', 'ft2') || 0, 250, 1e-3, 'marla_cap to ft2')
    approxEqual(convert(1, 'area', 'marla', 'ft2') || 0, 272.25, 1e-3, 'marla to ft2')
    approxEqual(convert(1, 'area', 'kanal', 'marla') || 0, 20, 1e-3, 'kanal to marla')
    approxEqual(convert(1, 'area', 'killa', 'kanal') || 0, 8, 1e-3, 'killa to kanal')
    approxEqual(convert(1, 'area', 'murabba', 'killa') || 0, 25, 1e-3, 'murabba to killa')
    approxEqual(convert(1, 'area', 'marla', 'sarsahi') || 0, 9, 1e-3, 'marla to sarsahi')
  })

  it('converts Pakistani Mass units accurately against Mandi and Jeweler standards', () => {
    approxEqual(convert(1, 'mass', 'tola', 'g') || 0, 11.6638038, 1e-4, 'tola to g')
    approxEqual(convert(1, 'mass', 'tola', 'masha') || 0, 12, 1e-4, 'tola to masha')
    approxEqual(convert(1, 'mass', 'tola', 'ratti') || 0, 96, 1e-4, 'tola to ratti')
    approxEqual(convert(1, 'mass', 'maund_pk', 'kg') || 0, 40, 1e-4, 'maund_pk to kg')
    approxEqual(convert(1, 'mass', 'seer', 'tola') || 0, 80, 1e-4, 'seer to tola')
    approxEqual(convert(1, 'mass', 'pao', 'g') || 0, 250, 1e-4, 'pao to g')
    approxEqual(convert(1, 'mass', 'dhari', 'kg') || 0, 5, 1e-4, 'dhari to kg')
  })

  it('converts Pakistani Length units accurately', () => {
    assert.equal(convert(1, 'length', 'karam', 'm'), 1.6764)
    assert.equal(convert(1, 'length', 'girah', 'm'), 0.05715)
  })

  it('verifies 9 total conversion chains (cricket-nrr retired to ToolsHub)', () => {
    const chains = getAllChains()
    assert.equal(chains.length, 9)
    
    // Test area-plot-price chain
    const areaRes = executeChain('area-plot-price', 1)
    assert.ok(areaRes !== null)
    assert.equal(areaRes.links.length, 4)

    // Test gold-karat-price chain
    const goldRes = executeChain('gold-karat-price', 1)
    assert.ok(goldRes !== null)
    assert.equal(goldRes.links.length, 4)


  })
})

describe('Task C2 & D: Textile Conversions & Dimensional Integrity', () => {
  it('correctly converts between GSM and oz/yd² with source constant 33.9057474', () => {
    // 1 oz/yd² = 33.9057474 g/m²
    const gsmVal = convert(1, 'textile', 'oz_yd2', 'gsm')
    assert.equal(gsmVal, 33.9057474)

    // 480 GSM worked example -> 480 / 33.9057474 ≈ 14.1569
    const ozVal = convert(480, 'textile', 'gsm', 'oz_yd2')
    assert.ok(Math.abs((ozVal ?? 0) - 14.15689) < 1e-4, '480 GSM must convert to ~14.16 oz/yd²')

    // 10 oz canvas worked example -> 10 * 33.9057474 = 339.057474
    const canvasGsm = convert(10, 'textile', 'oz_yd2', 'gsm')
    assert.equal(canvasGsm, 339.057474)
  })

  it('prevents cross-dimensional conversions in mixed-dimension categories', () => {
    // Electricity: Current (A) cannot convert to Voltage (V)
    assert.equal(convert(1, 'electricity', 'A', 'V'), null)
    // Electricity: Capacitance (uF) cannot convert to Resistance (ohm)
    assert.equal(convert(1, 'electricity', 'uF', 'ohm'), null)
    // Astronomy: Distance (au_a) cannot convert to Mass (sm)
    assert.equal(convert(1, 'astronomy', 'au_a', 'sm'), null)
    // Magnetism: Field (T) cannot convert to Flux (Wb)
    assert.equal(convert(1, 'magnetism', 'T', 'Wb'), null)
  })

  it('allows valid same-dimension conversions in mixed categories', () => {
    // Current to current
    assert.equal(convert(1, 'electricity', 'A', 'mA'), 1000)
    // Voltage to voltage
    assert.equal(convert(1, 'electricity', 'kV', 'V'), 1000)
    // Astronomy distance to distance
    assert.equal(convert(1, 'astronomy', 'ly_a', 'au_a'), 63241.1)
  })

  it('dimension guard does not affect untagged categories (length, mass, temp) in convert() and convertAll()', () => {
    // Length: untagged category converts identically to main
    assert.equal(convert(1, 'length', 'm', 'cm'), 100)
    assert.equal(convert(1, 'length', 'km', 'm'), 1000)
    assert.equal(convert(1, 'length', 'ft', 'in'), 12)
    assert.equal(convert(1, 'length', 'ft', 'm'), 0.3048)
    approxEqual(convert(1, 'length', 'm', 'ft'), 3.28084, 1e-4)
    approxEqual(convert(100, 'length', 'cm', 'in'), 39.3701, 1e-4)
    approxEqual(convert(1, 'length', 'km', 'mi'), 0.621371, 1e-4)
    const lengthCat = getCategory('length')
    const lengthAll = convertAll(1, 'length', 'm')
    assert.ok(lengthCat && lengthAll.length === lengthCat.un.length, 'convertAll must return all length units without filtering')
    assert.equal(lengthAll.find(u => u.id === 'cm')?.value, 100)
    assert.equal(lengthAll.find(u => u.id === 'km')?.value, 0.001)
    approxEqual(lengthAll.find(u => u.id === 'ft')?.value ?? null, 3.28084, 1e-4)

    // Mass: untagged category converts identically to main
    assert.equal(convert(1, 'mass', 'kg', 'g'), 1000)
    assert.equal(convert(1, 'mass', 'lb', 'oz'), 16)
    approxEqual(convert(1, 'mass', 'kg', 'lb'), 2.20462, 1e-4)
    approxEqual(convert(1, 'mass', 'lb', 'kg'), 0.453592, 1e-4)
    approxEqual(convert(1, 'mass', 'tola', 'g'), 11.6638038, 1e-4)
    const massCat = getCategory('mass')
    const massAll = convertAll(1, 'mass', 'kg')
    assert.ok(massCat && massAll.length === massCat.un.length, 'convertAll must return all mass units without filtering')
    assert.equal(massAll.find(u => u.id === 'g')?.value, 1000)
    approxEqual(massAll.find(u => u.id === 'lb')?.value ?? null, 2.20462, 1e-4)

    // Temp: untagged category converts identically to main
    assert.equal(convert(100, 'temp', 'C', 'F'), 212)
    assert.equal(convert(0, 'temp', 'C', 'F'), 32)
    assert.equal(convert(32, 'temp', 'F', 'C'), 0)
    assert.equal(convert(100, 'temp', 'C', 'K'), 373.15)
    const tempCat = getCategory('temp')
    const tempAll = convertAll(100, 'temp', 'C')
    assert.ok(tempCat && tempAll.length === tempCat.un.length, 'convertAll must return all temp units without filtering')
    assert.equal(tempAll.find(u => u.id === 'F')?.value, 212)
    assert.equal(tempAll.find(u => u.id === 'K')?.value, 373.15)
  })

  it('guarantees convertAll in tagged categories never returns cross-dimensional units', () => {
    // Electricity from current (A) must only return current units (mA, A)
    const elecCurrent = convertAll(1, 'electricity', 'A')
    assert.equal(elecCurrent.length, 2)
    assert.deepEqual(elecCurrent.map(u => u.id).sort(), ['A', 'mA'])
    assert.equal(elecCurrent.find(u => u.id === 'V'), undefined)
    assert.equal(elecCurrent.find(u => u.id === 'ohm'), undefined)

    // Astronomy from distance (au_a) must only return distance units (au_a, ly_a, pc_a)
    const astroDist = convertAll(1, 'astronomy', 'au_a')
    assert.equal(astroDist.length, 3)
    assert.deepEqual(astroDist.map(u => u.id).sort(), ['au_a', 'ly_a', 'pc_a'])
    assert.equal(astroDist.find(u => u.id === 'sm'), undefined)
    assert.equal(astroDist.find(u => u.id === 'em'), undefined)

    // Magnetism from field (T) must only return field units (G, T)
    const magField = convertAll(1, 'magnetism', 'T')
    assert.equal(magField.length, 2)
    assert.deepEqual(magField.map(u => u.id).sort(), ['G', 'T'])
    assert.equal(magField.find(u => u.id === 'Wb'), undefined)
  })
})
