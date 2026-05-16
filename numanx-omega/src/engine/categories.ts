import type { CategoryDef } from '../types'

export const Categories: CategoryDef[] = [
  {
    id: 'length', lb: 'Length', ic: '📏', cl: '#6c63ff',
    al: ['distance', 'meter', 'kilometer', 'mile', 'foot', 'inch'],
    un: [
      { id: 'nm', lb: 'Nanometer', r: 1e-9, s: 'M' },
      { id: 'um', lb: 'Micrometer', r: 1e-6, s: 'M' },
      { id: 'mm', lb: 'Millimeter', r: 0.001, s: 'M' },
      { id: 'cm', lb: 'Centimeter', r: 0.01, s: 'M' },
      { id: 'dm', lb: 'Decimeter', r: 0.1, s: 'M' },
      { id: 'm', lb: 'Meter', r: 1, s: 'M' },
      { id: 'km', lb: 'Kilometer', r: 1e3, s: 'M' },
      { id: 'in', lb: 'Inch', r: 0.0254, s: 'I' },
      { id: 'ft', lb: 'Foot', r: 0.3048, s: 'I', al: ['feet'] },
      { id: 'yd', lb: 'Yard', r: 0.9144, s: 'I' },
      { id: 'mi', lb: 'Mile', r: 1609.344, s: 'I' },
      { id: 'nmi', lb: 'Nautical Mile', r: 1852, s: 'O' },
      { id: 'furlong', lb: 'Furlong', r: 201.168, s: 'I' },
      { id: 'chain', lb: 'Chain', r: 20.1168, s: 'I' },
      { id: 'rod', lb: 'Rod', r: 5.0292, s: 'I' },
      { id: 'hand', lb: 'Hand', r: 0.1016, s: 'I' },
      { id: 'cubit', lb: 'Cubit', r: 0.4572, s: 'O' },
      { id: 'ly', lb: 'Light Year', r: 9.461e15, s: 'S' },
      { id: 'au', lb: 'Astronomical Unit', r: 1.496e11, s: 'S' },
      { id: 'pc', lb: 'Parsec', r: 3.086e16, s: 'S' },
      { id: 'ld', lb: 'Lunar Distance', r: 3.844e8, s: 'S' },
      { id: 'sr', lb: 'Solar Radius', r: 6.957e8, s: 'S' },
      { id: 'er', lb: 'Earth Radius', r: 6371000, s: 'S' }
    ]
  },
  {
    id: 'area', lb: 'Area', ic: '▣', cl: '#9b59b6',
    un: [
      { id: 'mm2', lb: 'mm²', r: 1e-6, s: 'M' },
      { id: 'cm2', lb: 'cm²', r: 1e-4, s: 'M' },
      { id: 'm2', lb: 'm²', r: 1, s: 'M' },
      { id: 'km2', lb: 'km²', r: 1e6, s: 'M' },
      { id: 'in2', lb: 'in²', r: 0.00064516, s: 'I' },
      { id: 'ft2', lb: 'ft²', r: 0.092903, s: 'I' },
      { id: 'yd2', lb: 'yd²', r: 0.836127, s: 'I' },
      { id: 'ac', lb: 'Acre', r: 4046.86, s: 'I' },
      { id: 'ha', lb: 'Hectare', r: 10000, s: 'M' },
      { id: 'mi2', lb: 'mi²', r: 2.59e6, s: 'I' },
      { id: 'twp', lb: 'Township', r: 9.324e7, s: 'I' },
      { id: 'barn', lb: 'Barn', r: 1e-28, s: 'S' }
    ]
  },
  {
    id: 'volume', lb: 'Volume', ic: '🧪', cl: '#3498db',
    un: [
      { id: 'mL', lb: 'Milliliter', r: 0.001, s: 'M' },
      { id: 'L', lb: 'Liter', r: 1, s: 'M' },
      { id: 'm3', lb: 'Cubic Meter', r: 1000, s: 'M' },
      { id: 'in3', lb: 'Cubic Inch', r: 0.0163871, s: 'I' },
      { id: 'ft3', lb: 'Cubic Foot', r: 28.3168, s: 'I' },
      { id: 'gal', lb: 'Gallon', r: 3.78541, s: 'I' },
      { id: 'qt', lb: 'Quart', r: 0.946353, s: 'I' },
      { id: 'pt', lb: 'Pint', r: 0.473176, s: 'I' },
      { id: 'bbl', lb: 'Barrel', r: 158.987, s: 'I' },
      { id: 'floz', lb: 'Fluid Ounce', r: 0.0295735, s: 'I' },
      { id: 'tbsp', lb: 'Tablespoon', r: 0.0147868, s: 'I' },
      { id: 'tsp', lb: 'Teaspoon', r: 0.00492892, s: 'I' },
      { id: 'cup', lb: 'Cup', r: 0.24, s: 'I' },
      { id: 'drop', lb: 'Drop', r: 5e-5, s: 'O' }
    ]
  },
  {
    id: 'mass', lb: 'Mass', ic: '⚖️', cl: '#2ecc71',
    al: ['weight', 'gram', 'kilogram', 'pound'],
    un: [
      { id: 'ug', lb: 'Microgram', r: 1e-9, s: 'M' },
      { id: 'mg', lb: 'Milligram', r: 1e-6, s: 'M' },
      { id: 'g', lb: 'Gram', r: 0.001, s: 'M' },
      { id: 'kg', lb: 'Kilogram', r: 1, s: 'M' },
      { id: 't', lb: 'Metric Ton', r: 1000, s: 'M' },
      { id: 'oz', lb: 'Ounce', r: 0.0283495, s: 'I' },
      { id: 'lb', lb: 'Pound', r: 0.453592, s: 'I', al: ['lbs'] },
      { id: 'stone', lb: 'Stone', r: 6.35029, s: 'I' },
      { id: 'sh tn', lb: 'Short Ton', r: 907.185, s: 'I' },
      { id: 'lg tn', lb: 'Long Ton', r: 1016.05, s: 'I' },
      { id: 'ct', lb: 'Carat', r: 0.0002, s: 'O' },
      { id: 'gr', lb: 'Grain', r: 6.4799e-5, s: 'I' },
      { id: 'amu', lb: 'Atomic Mass Unit', r: 1.660539e-27, s: 'S' }
    ]
  },
  {
    id: 'temp', lb: 'Temperature', ic: '🌡️', cl: '#e74c3c', sp: true,
    al: ['celsius', 'fahrenheit', 'kelvin'],
    un: [
      { id: 'C', lb: '°C', s: 'M', al: ['celsius'] },
      { id: 'F', lb: '°F', s: 'I', al: ['fahrenheit'] },
      { id: 'K', lb: 'K', s: 'S', al: ['kelvin'] },
      { id: 'R', lb: '°Rankine', s: 'S' },
      { id: 'Re', lb: '°Réaumur', s: 'O' }
    ]
  },
  {
    id: 'time', lb: 'Time', ic: '⏱️', cl: '#1abc9c',
    un: [
      { id: 'ns', lb: 'Nanosecond', r: 1e-9, s: 'S' },
      { id: 'us', lb: 'Microsecond', r: 1e-6, s: 'S' },
      { id: 'ms', lb: 'Millisecond', r: 0.001, s: 'S' },
      { id: 's', lb: 'Second', r: 1, s: 'S' },
      { id: 'min', lb: 'Minute', r: 60, s: 'S' },
      { id: 'hr', lb: 'Hour', r: 3600, s: 'S' },
      { id: 'day', lb: 'Day', r: 86400, s: 'S' },
      { id: 'week', lb: 'Week', r: 604800, s: 'S' },
      { id: 'mo', lb: 'Month', r: 2629800, s: 'S' },
      { id: 'yr', lb: 'Year', r: 31557600, s: 'S' },
      { id: 'decade', lb: 'Decade', r: 3.1558e8, s: 'S' },
      { id: 'century', lb: 'Century', r: 3.1558e9, s: 'S' },
      { id: 'millennium', lb: 'Millennium', r: 3.1558e10, s: 'S' }
    ]
  },
  {
    id: 'speed', lb: 'Speed', ic: '🚀', cl: '#e67e22',
    un: [
      { id: 'mps', lb: 'm/s', r: 1, s: 'M' },
      { id: 'kmh', lb: 'km/h', r: 0.277778, s: 'M' },
      { id: 'mph', lb: 'mph', r: 0.44704, s: 'I' },
      { id: 'knot', lb: 'Knot', r: 0.514444, s: 'O' },
      { id: 'mach', lb: 'Mach', r: 343, s: 'O' },
      { id: 'c', lb: 'Speed of Light', r: 299792458, s: 'S' }
    ]
  },
  {
    id: 'acceleration', lb: 'Acceleration', ic: '🚀', cl: '#e91e63',
    un: [
      { id: 'mps2', lb: 'm/s²', r: 1, s: 'M' },
      { id: 'gal', lb: 'Gal', r: 0.01, s: 'O' },
      { id: 'gforce', lb: 'g-force', r: 9.80665, s: 'O' }
    ]
  },
  {
    id: 'force', lb: 'Force', ic: '💪', cl: '#e91e63',
    un: [
      { id: 'N', lb: 'Newton', r: 1, s: 'M' },
      { id: 'dyn', lb: 'Dyne', r: 1e-5, s: 'M' },
      { id: 'lbf', lb: 'Pound-force', r: 4.44822, s: 'I' },
      { id: 'kgf', lb: 'Kilogram-force', r: 9.80665, s: 'M' }
    ]
  },
  {
    id: 'pressure', lb: 'Pressure', ic: '🔵', cl: '#00bcd4',
    un: [
      { id: 'Pa', lb: 'Pascal', r: 1, s: 'M' },
      { id: 'kPa', lb: 'Kilopascal', r: 1e3, s: 'M' },
      { id: 'MPa', lb: 'Megapascal', r: 1e6, s: 'M' },
      { id: 'bar', lb: 'Bar', r: 1e5, s: 'M' },
      { id: 'psi', lb: 'PSI', r: 6894.76, s: 'I' },
      { id: 'atm', lb: 'Atmosphere', r: 101325, s: 'O' },
      { id: 'torr', lb: 'Torr', r: 133.322, s: 'O' },
      { id: 'mmHg', lb: 'mmHg', r: 133.322, s: 'O' }
    ]
  },
  {
    id: 'energy', lb: 'Energy', ic: '⚡', cl: '#f39c12',
    un: [
      { id: 'J', lb: 'Joule', r: 1, s: 'M' },
      { id: 'kJ', lb: 'Kilojoule', r: 1e3, s: 'M' },
      { id: 'cal', lb: 'Calorie', r: 4.184, s: 'M' },
      { id: 'kcal', lb: 'Kilocalorie', r: 4184, s: 'M' },
      { id: 'Wh', lb: 'Watt-hour', r: 3600, s: 'O' },
      { id: 'kWh', lb: 'Kilowatt-hour', r: 3.6e6, s: 'O' },
      { id: 'eV', lb: 'Electronvolt', r: 1.602e-19, s: 'S' },
      { id: 'BTU', lb: 'BTU', r: 1055.06, s: 'I' },
      { id: 'therm', lb: 'Therm', r: 1.055e8, s: 'I' }
    ]
  },
  {
    id: 'power', lb: 'Power', ic: '💡', cl: '#ff9800',
    un: [
      { id: 'W', lb: 'Watt', r: 1, s: 'M' },
      { id: 'kW', lb: 'Kilowatt', r: 1e3, s: 'M' },
      { id: 'MW', lb: 'Megawatt', r: 1e6, s: 'M' },
      { id: 'hp', lb: 'Horsepower', r: 745.7, s: 'I' }
    ]
  },
  {
    id: 'electricity', lb: 'Electricity', ic: '⚡', cl: '#00e5ff',
    un: [
      { id: 'A', lb: 'Ampere', r: 1, s: 'M' },
      { id: 'mA', lb: 'Milliampere', r: 0.001, s: 'M' },
      { id: 'V', lb: 'Volt', r: 1, s: 'M' },
      { id: 'kV', lb: 'Kilovolt', r: 1e3, s: 'M' },
      { id: 'ohm', lb: 'Ohm', r: 1, s: 'M' },
      { id: 'kohm', lb: 'Kilo-ohm', r: 1e3, s: 'M' },
      { id: 'Mohm', lb: 'Mega-ohm', r: 1e6, s: 'M' },
      { id: 'F', lb: 'Farad', r: 1, s: 'M' },
      { id: 'uF', lb: 'Microfarad', r: 1e-6, s: 'M' },
      { id: 'C', lb: 'Coulomb', r: 1, s: 'S' }
    ]
  },
  {
    id: 'magnetism', lb: 'Magnetism', ic: '🧲', cl: '#e040fb',
    un: [
      { id: 'T', lb: 'Tesla', r: 1, s: 'M' },
      { id: 'G', lb: 'Gauss', r: 1e-4, s: 'M' },
      { id: 'Wb', lb: 'Weber', r: 1, s: 'S' }
    ]
  },
  {
    id: 'frequency', lb: 'Frequency', ic: '〰️', cl: '#607d8b',
    un: [
      { id: 'Hz', lb: 'Hertz', r: 1, s: 'M' },
      { id: 'kHz', lb: 'kHz', r: 1e3, s: 'M' },
      { id: 'MHz', lb: 'MHz', r: 1e6, s: 'M' },
      { id: 'GHz', lb: 'GHz', r: 1e9, s: 'M' },
      { id: 'THz', lb: 'THz', r: 1e12, s: 'M' }
    ]
  },
  {
    id: 'data', lb: 'Data Storage', ic: '💾', cl: '#34495e',
    un: [
      { id: 'bit', lb: 'Bit', r: 0.125, s: 'M' },
      { id: 'B', lb: 'Byte', r: 1, s: 'M' },
      { id: 'KB', lb: 'KB', r: 1e3, s: 'M' },
      { id: 'MB', lb: 'MB', r: 1e6, s: 'M' },
      { id: 'GB', lb: 'GB', r: 1e9, s: 'M' },
      { id: 'TB', lb: 'TB', r: 1e12, s: 'M' },
      { id: 'PB', lb: 'PB', r: 1e15, s: 'M' },
      { id: 'EB', lb: 'EB', r: 1e18, s: 'M' },
      { id: 'ZB', lb: 'ZB', r: 1e21, s: 'M' },
      { id: 'YB', lb: 'YB', r: 1e24, s: 'M' }
    ]
  },
  {
    id: 'datatransfer', lb: 'Data Transfer', ic: '🌐', cl: '#00acc1',
    un: [
      { id: 'bps', lb: 'bps', r: 1, s: 'M' },
      { id: 'kbps', lb: 'Kbps', r: 1e3, s: 'M' },
      { id: 'Mbps', lb: 'Mbps', r: 1e6, s: 'M' },
      { id: 'Gbps', lb: 'Gbps', r: 1e9, s: 'M' },
      { id: 'Tbps', lb: 'Tbps', r: 1e12, s: 'M' }
    ]
  },
  {
    id: 'angle', lb: 'Angle', ic: '∡', cl: '#00bcd4',
    un: [
      { id: 'deg', lb: 'Degree', r: 1, s: 'M' },
      { id: 'rad', lb: 'Radian', r: 57.2958, s: 'S' },
      { id: 'grad', lb: 'Gradian', r: 0.9, s: 'O' },
      { id: 'arcmin', lb: 'Arcminute', r: 1 / 60, s: 'O' },
      { id: 'arcsec', lb: 'Arcsecond', r: 1 / 3600, s: 'O' }
    ]
  },
  {
    id: 'torque', lb: 'Torque', ic: '🔧', cl: '#ff5722',
    un: [
      { id: 'Nm', lb: 'N·m', r: 1, s: 'M' },
      { id: 'lbft', lb: 'lb-ft', r: 1.35582, s: 'I' }
    ]
  },
  {
    id: 'fuel', lb: 'Fuel Economy', ic: '⛽', cl: '#4caf50', sp: true,
    un: [
      { id: 'mpgUS', lb: 'MPG (US)' },
      { id: 'mpgUK', lb: 'MPG (UK)' },
      { id: 'kmL', lb: 'km/L' },
      { id: 'L100km', lb: 'L/100km' }
    ]
  },
  {
    id: 'density', lb: 'Density', ic: '⬡', cl: '#795548',
    un: [
      { id: 'kgm3', lb: 'kg/m³', r: 1, s: 'M' },
      { id: 'gcm3', lb: 'g/cm³', r: 1000, s: 'M' },
      { id: 'lbft3', lb: 'lb/ft³', r: 16.0185, s: 'I' }
    ]
  },
  {
    id: 'cooking', lb: 'Cooking', ic: '🍳', cl: '#ffc107',
    un: [
      { id: 'cup_c', lb: 'Cup', r: 240, s: 'I' },
      { id: 'tbsp_c', lb: 'Tablespoon', r: 15, s: 'I' },
      { id: 'tsp_c', lb: 'Teaspoon', r: 5, s: 'I' },
      { id: 'dash', lb: 'Dash', r: 0.615, s: 'I' },
      { id: 'pinch', lb: 'Pinch', r: 0.308, s: 'I' },
      { id: 'floz_c', lb: 'Fluid Ounce', r: 29.5735, s: 'I' },
      { id: 'mL_c', lb: 'Milliliter', r: 1, s: 'M' }
    ]
  },
  {
    id: 'textile', lb: 'Textile', ic: '🧵', cl: '#ab47bc',
    un: [
      { id: 'gsm', lb: 'GSM', r: 1, s: 'O' },
      { id: 'tc', lb: 'Thread Count', r: 1, s: 'O' },
      { id: 'yc', lb: 'Yarn Count', r: 1, s: 'O' }
    ]
  },
  {
    id: 'astronomy', lb: 'Astronomy', ic: '🌌', cl: '#7c4dff',
    un: [
      { id: 'au_a', lb: 'AU', r: 1, s: 'S' },
      { id: 'ly_a', lb: 'Light Year', r: 63241.1, s: 'S' },
      { id: 'pc_a', lb: 'Parsec', r: 206265, s: 'S' },
      { id: 'sm', lb: 'Solar Mass', r: 1, s: 'S' },
      { id: 'em', lb: 'Earth Mass', r: 3.003e-6, s: 'S' }
    ]
  },
]
