import type { CategoryDef } from '../types'

export const Categories: CategoryDef[] = [
  {
    id: 'length', lb: 'Length', ic: '📏', cl: '#6c63ff',
    al: ['distance', 'meter', 'kilometer', 'mile', 'foot', 'inch'],
    un: [
      { id: 'angstrom', lb: 'Angstrom', r: 1e-10, s: 'S', al: ['Å'] },
      { id: 'pm', lb: 'Picometer', r: 1e-12, s: 'S' },
      { id: 'nm', lb: 'Nanometer', r: 1e-9, s: 'M' },
      { id: 'um', lb: 'Micrometer', r: 1e-6, s: 'M' },
      { id: 'mm', lb: 'Millimeter', r: 0.001, s: 'M' },
      { id: 'cm', lb: 'Centimeter', r: 0.01, s: 'M' },
      { id: 'dm', lb: 'Decimeter', r: 0.1, s: 'M' },
      { id: 'm', lb: 'Meter', r: 1, s: 'M' },
      { id: 'km', lb: 'Kilometer', r: 1e3, s: 'M' },
      { id: 'mil', lb: 'Thou / Mil', r: 2.54e-5, s: 'I', al: ['thou'] },
      { id: 'pt', lb: 'Point', r: 0.0254 / 72, s: 'I', al: ['points'] },
      { id: 'in', lb: 'Inch', r: 0.0254, s: 'I' },
      { id: 'hand', lb: 'Hand', r: 0.1016, s: 'I' },
      { id: 'ft', lb: 'Foot', r: 0.3048, s: 'I', al: ['feet'] },
      { id: 'cubit', lb: 'Cubit', r: 0.4572, s: 'O' },
      { id: 'yd', lb: 'Yard', r: 0.9144, s: 'I', al: ['gaz'] },
      { id: 'girah', lb: 'Girah (Fabric - 2.25 in)', r: 0.05715, s: 'O', al: ['girah', 'gira'] },
      { id: 'karam', lb: 'Karam / Gatha (5.5 ft)', r: 1.6764, s: 'O', al: ['karam', 'gatha', 'land pace'] },
      { id: 'fathom', lb: 'Fathom', r: 1.8288, s: 'I', al: ['fathoms'] },
      { id: 'rod', lb: 'Rod', r: 5.0292, s: 'I' },
      { id: 'chain', lb: 'Chain', r: 20.1168, s: 'I' },
      { id: 'furlong', lb: 'Furlong', r: 201.168, s: 'I' },
      { id: 'mi', lb: 'Mile', r: 1609.344, s: 'I' },
      { id: 'nmi', lb: 'Nautical Mile', r: 1852, s: 'O' },
      { id: 'er', lb: 'Earth Radius', r: 6371000, s: 'S' },
      { id: 'ld', lb: 'Lunar Distance', r: 3.844e8, s: 'S' },
      { id: 'sr', lb: 'Solar Radius', r: 6.957e8, s: 'S' },
      { id: 'au', lb: 'Astronomical Unit', r: 1.496e11, s: 'S' },
      { id: 'ly', lb: 'Light Year', r: 9.461e15, s: 'S' },
      { id: 'pc', lb: 'Parsec', r: 3.086e16, s: 'S' }
    ]
  },
  {
    id: 'area', lb: 'Area', ic: '▣', cl: '#9b59b6',
    un: [
      { id: 'barn', lb: 'Barn', r: 1e-28, s: 'S' },
      { id: 'mm2', lb: 'mm²', r: 1e-6, s: 'M' },
      { id: 'cm2', lb: 'cm²', r: 1e-4, s: 'M' },
      { id: 'in2', lb: 'in²', r: 0.00064516, s: 'I' },
      { id: 'ft2', lb: 'ft²', r: 0.092903, s: 'I' },
      { id: 'yd2', lb: 'yd²', r: 0.836127, s: 'I' },
      { id: 'm2', lb: 'm²', r: 1, s: 'M' },
      { id: 'ac', lb: 'Acre', r: 4046.86, s: 'I' },
      { id: 'ha', lb: 'Hectare', r: 10000, s: 'M' },
      { id: 'km2', lb: 'km²', r: 1e6, s: 'M' },
      { id: 'mi2', lb: 'mi²', r: 2.59e6, s: 'I' },
      { id: 'twp', lb: 'Township', r: 9.324e7, s: 'I' },
      { id: 'marla_soc', lb: 'Marla (Society - 225 sq ft)', r: 20.903184, s: 'O', al: ['marla 225', 'marla society', 'dha marla', 'bahria marla'] },
      { id: 'marla_cap', lb: 'Marla (Capital - 250 sq ft)', r: 23.22576, s: 'O', al: ['marla 250', 'cda marla', 'islamabad marla', 'rawalpindi marla'] },
      { id: 'marla', lb: 'Marla (Standard/Govt - 272.25 sq ft)', r: 25.29285264, s: 'O', al: ['marla', 'marlas', 'standard marla', 'punjab marla', 'patwari marla'] },
      { id: 'gaz_sq', lb: 'Square Yard / Gaz', r: 0.83612736, s: 'O', al: ['gaz', 'square gaz', 'sq gaz', 'square yard gaz'] },
      { id: 'sarsahi', lb: 'Sarsahi (Sq Karam)', r: 2.81031696, s: 'O', al: ['sarsahi', 'sq karam'] },
      { id: 'kanal', lb: 'Kanal (20 Marlas)', r: 505.8570528, s: 'O', al: ['kanal', 'kanals'] },
      { id: 'killa', lb: 'Killa / Acre (PK)', r: 4046.8564224, s: 'O', al: ['killa', 'qila'] },
      { id: 'murabba', lb: 'Murabba (25 Acres)', r: 101171.41056, s: 'O', al: ['murabba', 'morabba'] }
    ]
  },
  {
    id: 'volume', lb: 'Volume', ic: '🧪', cl: '#3498db',
    un: [
      { id: 'drop', lb: 'Drop', r: 5e-5, s: 'O' },
      { id: 'mL', lb: 'Milliliter', r: 0.001, s: 'M' },
      { id: 'cm3', lb: 'Cubic Centimeter', r: 0.001, s: 'M', al: ['cc'] },
      { id: 'cL', lb: 'Centiliter', r: 0.01, s: 'M' },
      { id: 'dL', lb: 'Deciliter', r: 0.1, s: 'M' },
      { id: 'tsp', lb: 'Teaspoon', r: 0.00492892, s: 'I' },
      { id: 'tbsp', lb: 'Tablespoon', r: 0.0147868, s: 'I' },
      { id: 'in3', lb: 'Cubic Inch', r: 0.0163871, s: 'I' },
      { id: 'impfloz', lb: 'Imperial Fl Oz', r: 0.0284130625, s: 'I', al: ['uk fluid ounce'] },
      { id: 'floz', lb: 'Fluid Ounce', r: 0.0295735, s: 'I', al: ['fl oz', 'fluid ounces', 'us fluid ounce'] },
      { id: 'cup', lb: 'Cup', r: 0.24, s: 'I' },
      { id: 'pt', lb: 'Pint', r: 0.473176, s: 'I', al: ['pints', 'us pint'] },
      { id: 'imppt', lb: 'Imperial Pint', r: 0.56826125, s: 'I', al: ['uk pint'] },
      { id: 'L', lb: 'Liter', r: 1, s: 'M' },
      { id: 'qt', lb: 'Quart', r: 0.946353, s: 'I' },
      { id: 'gal', lb: 'Gallon', r: 3.78541, s: 'I', al: ['gallons', 'us gallon'] },
      { id: 'impgal', lb: 'Imperial Gallon', r: 4.54609, s: 'I', al: ['uk gallon'] },
      { id: 'ft3', lb: 'Cubic Foot', r: 28.3168, s: 'I' },
      { id: 'bbl', lb: 'Barrel', r: 158.987, s: 'I' },
      { id: 'yd3', lb: 'Cubic Yard', r: 764.554857984, s: 'I', al: ['cubic yards', 'cu yd'] },
      { id: 'm3', lb: 'Cubic Meter', r: 1000, s: 'M' }
    ]
  },
  {
    id: 'mass', lb: 'Mass', ic: '⚖️', cl: '#2ecc71',
    al: ['weight', 'gram', 'kilogram', 'pound'],
    un: [
      { id: 'amu', lb: 'Atomic Mass Unit', r: 1.660539e-27, s: 'S' },
      { id: 'ug', lb: 'Microgram', r: 1e-9, s: 'M' },
      { id: 'mg', lb: 'Milligram', r: 1e-6, s: 'M' },
      { id: 'gr', lb: 'Grain', r: 6.4799e-5, s: 'I' },
      { id: 'ct', lb: 'Carat', r: 0.0002, s: 'O' },
      { id: 'g', lb: 'Gram', r: 0.001, s: 'M' },
      { id: 'dwt', lb: 'Pennyweight', r: 0.00155517384, s: 'O' },
      { id: 'oz', lb: 'Ounce', r: 0.0283495, s: 'I' },
      { id: 'ozt', lb: 'Troy Ounce', r: 0.0311034768, s: 'O', al: ['troy oz', 'gold ounce'] },
      { id: 'lbt', lb: 'Troy Pound', r: 0.3732417216, s: 'O' },
      { id: 'lb', lb: 'Pound', r: 0.453592, s: 'I', al: ['lbs'] },
      { id: 'kg', lb: 'Kilogram', r: 1, s: 'M' },
      { id: 'stone', lb: 'Stone', r: 6.35029, s: 'I' },
      { id: 'slug', lb: 'Slug', r: 14.5939029372, s: 'I' },
      { id: 'q', lb: 'Metric Quintal', r: 100, s: 'M', al: ['quintal'] },
      { id: 'sh tn', lb: 'Short Ton', r: 907.185, s: 'I' },
      { id: 't', lb: 'Metric Ton', r: 1000, s: 'M' },
      { id: 'lg tn', lb: 'Long Ton', r: 1016.05, s: 'I' },
      { id: 'ratti', lb: 'Ratti', r: 0.000121497956, s: 'O', al: ['ratti'] },
      { id: 'masha', lb: 'Masha', r: 0.00097198365, s: 'O', al: ['masha'] },
      { id: 'tola', lb: 'Tola (PK Standard)', r: 0.0116638038, s: 'O', al: ['tola', 'tolas', 'bhori'] },
      { id: 'chhatank', lb: 'Chhatank', r: 0.058319019, s: 'O', al: ['chhatank', 'chatank'] },
      { id: 'pao', lb: 'Pao (250g)', r: 0.25, s: 'O', al: ['pao', 'paao', 'pow'] },
      { id: 'seer', lb: 'Seer', r: 0.9331043, s: 'O', al: ['seer', 'ser'] },
      { id: 'dhari', lb: 'Dhari (5 kg)', r: 5, s: 'O', al: ['dhari'] },
      { id: 'maund_trad', lb: 'Maund (Traditional Imperial - 37.32 kg)', r: 37.324172, s: 'O', al: ['traditional maund', 'bengal maund'] },
      { id: 'maund_pk', lb: 'Maund / Mann (Mandi Standard - 40 kg)', r: 40, s: 'O', al: ['maund', 'mann', 'mon', 'pakistani maund'] }
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
      { id: 'ftps2', lb: 'ft/s²', r: 0.3048, s: 'I' },
      { id: 'gforce', lb: 'g-force', r: 9.80665, s: 'O' }
    ]
  },
  {
    id: 'force', lb: 'Force', ic: '💪', cl: '#e91e63',
    un: [
      { id: 'dyn', lb: 'Dyne', r: 1e-5, s: 'M' },
      { id: 'N', lb: 'Newton', r: 1, s: 'M' },
      { id: 'lbf', lb: 'Pound-force', r: 4.4482216152605, s: 'I' },
      { id: 'kgf', lb: 'Kilogram-force', r: 9.80665, s: 'M' },
      { id: 'kN', lb: 'Kilonewton', r: 1e3, s: 'M' }
    ]
  },
  {
    id: 'pressure', lb: 'Pressure', ic: '🔵', cl: '#00bcd4',
    un: [
      { id: 'Pa', lb: 'Pascal', r: 1, s: 'M' },
      { id: 'hPa', lb: 'Hectopascal', r: 100, s: 'M' },
      { id: 'mbar', lb: 'Millibar', r: 100, s: 'M', al: ['mb'] },
      { id: 'torr', lb: 'Torr', r: 133.322, s: 'O' },
      { id: 'mmHg', lb: 'mmHg', r: 133.322, s: 'O' },
      { id: 'inH2O', lb: 'inH₂O', r: 249.08891, s: 'I', al: ['inches of water'] },
      { id: 'kPa', lb: 'Kilopascal', r: 1e3, s: 'M' },
      { id: 'inHg', lb: 'inHg', r: 3386.389, s: 'O', al: ['inches of mercury'] },
      { id: 'psi', lb: 'PSI', r: 6894.76, s: 'I' },
      { id: 'bar', lb: 'Bar', r: 1e5, s: 'M' },
      { id: 'atm', lb: 'Atmosphere', r: 101325, s: 'O' },
      { id: 'MPa', lb: 'Megapascal', r: 1e6, s: 'M' },
      { id: 'ksi', lb: 'ksi', r: 6894757.293, s: 'I', al: ['kilopound per square inch'] }
    ]
  },
  {
    id: 'energy', lb: 'Energy', ic: '⚡', cl: '#f39c12',
    un: [
      { id: 'eV', lb: 'Electronvolt', r: 1.602e-19, s: 'S' },
      { id: 'J', lb: 'Joule', r: 1, s: 'M' },
      { id: 'cal', lb: 'Calorie', r: 4.184, s: 'M' },
      { id: 'BTU', lb: 'BTU', r: 1055.06, s: 'I' },
      { id: 'kJ', lb: 'Kilojoule', r: 1e3, s: 'M' },
      { id: 'Wh', lb: 'Watt-hour', r: 3600, s: 'O' },
      { id: 'kcal', lb: 'Kilocalorie', r: 4184, s: 'M' },
      { id: 'kWh', lb: 'Kilowatt-hour', r: 3.6e6, s: 'O' },
      { id: 'therm', lb: 'Therm', r: 1.055e8, s: 'I' }
    ]
  },
  {
    id: 'power', lb: 'Power', ic: '💡', cl: '#ff9800',
    un: [
      { id: 'BTUh', lb: 'BTU/h', r: 0.29307107, s: 'I' },
      { id: 'W', lb: 'Watt', r: 1, s: 'M' },
      { id: 'ps', lb: 'Metric Horsepower (PS)', r: 735.49875, s: 'O', al: ['ch', 'cv'] },
      { id: 'hp', lb: 'Horsepower', r: 745.7, s: 'I' },
      { id: 'kW', lb: 'Kilowatt', r: 1e3, s: 'M' },
      { id: 'tr', lb: 'Ton of Refrigeration', r: 3516.852842, s: 'I', al: ['refrigeration ton', 'tons of ac'] },
      { id: 'MW', lb: 'Megawatt', r: 1e6, s: 'M' },
      { id: 'GW', lb: 'Gigawatt', r: 1e9, s: 'M' }
    ]
  },
  {
    id: 'electricity', lb: 'Electricity', ic: '⚡', cl: '#00e5ff',
    un: [
      { id: 'uF', lb: 'Microfarad', r: 1e-6, s: 'M' },
      { id: 'mA', lb: 'Milliampere', r: 0.001, s: 'M' },
      { id: 'A', lb: 'Ampere', r: 1, s: 'M' },
      { id: 'V', lb: 'Volt', r: 1, s: 'M' },
      { id: 'ohm', lb: 'Ohm', r: 1, s: 'M' },
      { id: 'C', lb: 'Coulomb', r: 1, s: 'S' },
      { id: 'F', lb: 'Farad', r: 1, s: 'M' },
      { id: 'kV', lb: 'Kilovolt', r: 1e3, s: 'M' },
      { id: 'kohm', lb: 'Kilo-ohm', r: 1e3, s: 'M' },
      { id: 'Mohm', lb: 'Mega-ohm', r: 1e6, s: 'M' }
    ]
  },
  {
    id: 'magnetism', lb: 'Magnetism', ic: '🧲', cl: '#e040fb',
    un: [
      { id: 'G', lb: 'Gauss', r: 1e-4, s: 'M' },
      { id: 'T', lb: 'Tesla', r: 1, s: 'M' },
      { id: 'Wb', lb: 'Weber', r: 1, s: 'S' }
    ]
  },
  {
    id: 'frequency', lb: 'Frequency', ic: '〰️', cl: '#607d8b',
    un: [
      { id: 'rpm', lb: 'RPM', r: 1 / 60, s: 'O' },
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
      { id: 'KiB', lb: 'Kibibyte (KiB)', r: 1024, s: 'S' },
      { id: 'MB', lb: 'MB', r: 1e6, s: 'M' },
      { id: 'MiB', lb: 'Mebibyte (MiB)', r: 1048576, s: 'S' },
      { id: 'GB', lb: 'GB', r: 1e9, s: 'M', al: ['gigabyte', 'gigabytes'] },
      { id: 'GiB', lb: 'Gibibyte (GiB)', r: 1073741824, s: 'S', al: ['gibibyte', 'gibibytes'] },
      { id: 'TB', lb: 'TB', r: 1e12, s: 'M' },
      { id: 'TiB', lb: 'Tebibyte (TiB)', r: 1099511627776, s: 'S' },
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
      { id: 'arcsec', lb: 'Arcsecond', r: 1 / 3600, s: 'O' },
      { id: 'arcmin', lb: 'Arcminute', r: 1 / 60, s: 'O' },
      { id: 'mrad', lb: 'Milliradian', r: 0.18 / Math.PI, s: 'S' },
      { id: 'grad', lb: 'Gradian', r: 0.9, s: 'O' },
      { id: 'deg', lb: 'Degree', r: 1, s: 'M' },
      { id: 'rad', lb: 'Radian', r: 180 / Math.PI, s: 'S' }
    ]
  },
  {
    id: 'torque', lb: 'Torque', ic: '🔧', cl: '#ff5722',
    un: [
      { id: 'Nmm', lb: 'N·mm', r: 0.001, s: 'M' },
      { id: 'ozin', lb: 'oz-in', r: 0.007061551814226044, s: 'I', al: ['ounce-inch'] },
      { id: 'Ncm', lb: 'N·cm', r: 0.01, s: 'M' },
      { id: 'lbin', lb: 'lb-in', r: 0.1129848290276167, s: 'I', al: ['in-lb', 'pound-inch', 'pound-inches', 'inch-pound'] },
      { id: 'Nm', lb: 'N·m', r: 1, s: 'M', al: ['newton-meter', 'newton-meters'] },
      { id: 'lbft', lb: 'lb-ft', r: 1.35582, s: 'I', al: ['pound-foot', 'pound-feet', 'foot-pound', 'foot-pounds'] },
      { id: 'kgfm', lb: 'kgf·m', r: 9.80665, s: 'M', al: ['kgf-m'] }
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
      { id: 'lbft3', lb: 'lb/ft³', r: 16.0185, s: 'I' },
      { id: 'gcm3', lb: 'g/cm³', r: 1000, s: 'M' }
    ]
  },
  {
    id: 'cooking', lb: 'Cooking', ic: '🍳', cl: '#ffc107',
    un: [
      { id: 'pinch', lb: 'Pinch', r: 0.308, s: 'I' },
      { id: 'dash', lb: 'Dash', r: 0.615, s: 'I' },
      { id: 'mL_c', lb: 'Milliliter', r: 1, s: 'M' },
      { id: 'tsp_c', lb: 'Teaspoon', r: 5, s: 'I' },
      { id: 'tbsp_c', lb: 'Tablespoon', r: 15, s: 'I' },
      { id: 'floz_c', lb: 'Fluid Ounce', r: 29.5735, s: 'I' },
      { id: 'jigger', lb: 'Jigger', r: 44.36029434375, s: 'I', al: ['jiggers'] },
      { id: 'stick_c', lb: 'Stick of Butter', r: 120, s: 'I', al: ['stick', 'sticks'] },
      { id: 'cup_c', lb: 'Cup', r: 240, s: 'I' }
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
      { id: 'em', lb: 'Earth Mass', r: 3.003e-6, s: 'S' },
      { id: 'sm', lb: 'Solar Mass', r: 1, s: 'S' },
      { id: 'au_a', lb: 'AU', r: 1, s: 'S' },
      { id: 'ly_a', lb: 'Light Year', r: 63241.1, s: 'S' },
      { id: 'pc_a', lb: 'Parsec', r: 206265, s: 'S' }
    ]
  },
  {
    id: 'flow', lb: 'Flow Rate', ic: '💧', cl: '#00bcd4',
    al: ['volumetric flow', 'discharge', 'flow', 'gpm', 'cfm', 'liters per minute'],
    un: [
      { id: 'bpd', lb: 'Barrels per Day', r: 0.0000018401307283333333, s: 'I', al: ['bpd', 'barrel per day', 'barrels per day'] },
      { id: 'Lmin', lb: 'Liter per Minute', r: 0.000016666666666666667, s: 'M', al: ['l/min', 'lpm', 'liters per minute'] },
      { id: 'gpm', lb: 'Gallon per Minute', r: 0.0000630901964, s: 'I', al: ['gpm', 'gallon per minute', 'gallons per minute'] },
      { id: 'm3h', lb: 'Cubic Meter per Hour', r: 0.0002777777777777778, s: 'M', al: ['m3/h', 'cubic meter per hour', 'cubic meters per hour'] },
      { id: 'cfm', lb: 'Cubic Feet per Minute', r: 0.0004719474432, s: 'I', al: ['cfm', 'cubic foot per minute', 'cubic feet per minute'] },
      { id: 'Ls', lb: 'Liter per Second', r: 0.001, s: 'M', al: ['l/s', 'lps', 'liter per second', 'liters per second'] },
      { id: 'm3s', lb: 'Cubic Meter per Second', r: 1, s: 'M', al: ['m3/s', 'cubic meter per second', 'cubic meters per second'] }
    ]
  },
  {
    id: 'illuminance', lb: 'Illuminance', ic: '💡', cl: '#ffb300',
    al: ['light', 'lux', 'foot-candle', 'illumination', 'phot'],
    un: [
      { id: 'nox', lb: 'Nox', r: 0.001, s: 'S', al: ['nox'] },
      { id: 'lx', lb: 'Lux', r: 1, s: 'M', al: ['lux', 'lx'] },
      { id: 'fc', lb: 'Foot-candle', r: 10.763910416709722, s: 'I', al: ['fc', 'foot-candles', 'foot candles', 'foot candle'] },
      { id: 'ph', lb: 'Phot', r: 10000, s: 'S', al: ['phot', 'phots'] }
    ]
  },
  {
    id: 'viscosity', lb: 'Viscosity', ic: '🍯', cl: '#8d6e63',
    al: ['dynamic viscosity', 'centipoise', 'poise', 'pascal second'],
    un: [
      { id: 'cP', lb: 'Centipoise', r: 0.001, s: 'O', al: ['cp', 'centipoise'] },
      { id: 'mPas', lb: 'Millipascal-second', r: 0.001, s: 'M', al: ['mpas', 'mpa-s', 'millipascal-second'] },
      { id: 'P', lb: 'Poise', r: 0.1, s: 'O', al: ['poise'] },
      { id: 'Pas', lb: 'Pascal-second', r: 1, s: 'M', al: ['pas', 'pa-s', 'pascal-second'] },
      { id: 'lbfts', lb: 'Pound per Foot-second', r: 1.48816394357, s: 'I', al: ['lb/ft-s', 'pound per foot-second', 'pound per foot second'] }
    ]
  },
  {
    id: 'typography', lb: 'Typography', ic: '🔤', cl: '#ec407a',
    al: ['css units', 'font size', 'pixels', 'points', 'rem', 'em', 'pica'],
    un: [
      { id: 'px', lb: 'Pixel', r: 1, s: 'O', al: ['pixels', 'pixel', 'px'] },
      { id: 'pt', lb: 'Point', r: 1.3333333333333333, s: 'I', al: ['points', 'point', 'pt'] },
      { id: 'mm', lb: 'Millimeter', r: 3.779527559055118, s: 'M', al: ['millimeter', 'millimeters', 'mm'] },
      { id: 'pica', lb: 'Pica', r: 16, s: 'I', al: ['picas', 'pica', 'pc'] },
      { id: 'rem', lb: 'Root EM', r: 16, s: 'O', al: ['rem', 'rems'] },
      { id: 'em', lb: 'EM', r: 16, s: 'O', al: ['em', 'ems'] },
      { id: 'cm', lb: 'Centimeter', r: 37.79527559055118, s: 'M', al: ['centimeter', 'centimeters', 'cm'] },
      { id: 'in', lb: 'Inch', r: 96, s: 'I', al: ['inches', 'inch', 'in'] }
    ]
  },
  {
    id: 'number-base', lb: 'Number Base', ic: '🔢', cl: '#00bcd4', sp: true,
    al: ['radix', 'binary', 'hexadecimal', 'octal', 'decimal', 'base conversion', 'gray code', 'bcd'],
    un: [
      { id: 'dec', lb: 'Decimal (Base 10)', r: 1, s: 'M', al: ['base 10', 'denary'] },
      { id: 'bin', lb: 'Binary (Base 2)', s: 'S', al: ['base 2'] },
      { id: 'oct', lb: 'Octal (Base 8)', s: 'S', al: ['base 8'] },
      { id: 'hex', lb: 'Hexadecimal (Base 16)', s: 'S', al: ['base 16', 'hex'] },
      { id: 'base32', lb: 'Base 32', s: 'S' },
      { id: 'base36', lb: 'Base 36', s: 'S' },
      { id: 'bcd', lb: 'BCD (8421 Binary Coded)', s: 'S' },
      { id: 'gray', lb: 'Gray Code (Reflected Binary)', s: 'S' }
    ]
  },
  {
    id: 'ieee-754', lb: 'IEEE-754 Float', ic: '🧮', cl: '#ff9800', sp: true,
    al: ['floating point', 'fp16', 'fp32', 'fp64', 'single precision', 'double precision', 'half precision', 'hex float'],
    un: [
      { id: 'dec_real', lb: 'Decimal Real Number', r: 1, s: 'M' },
      { id: 'fp16', lb: 'FP16 Half Precision (1-5-10)', s: 'S' },
      { id: 'fp32', lb: 'FP32 Single Precision (1-8-23)', s: 'S' },
      { id: 'fp64', lb: 'FP64 Double Precision (1-11-52)', s: 'S' },
      { id: 'hex_float', lb: 'Hexadecimal Float (0x...)', s: 'S' }
    ]
  },
  {
    id: 'pk-numbering', lb: 'South Asian Numbering', ic: '🏦', cl: '#4caf50',
    al: ['lakh', 'crore', 'arab', 'kharab', 'hazar', 'pakistani numbering', 'desi numbers', 'million billion'],
    un: [
      { id: 'ones', lb: 'Units / Ones', r: 1, s: 'M', al: ['one', 'units'] },
      { id: 'hazar', lb: 'Hazar (1,000)', r: 1e3, s: 'O', al: ['hazar', 'thousand pk'] },
      { id: 'lakh', lb: 'Lakh (100,000 / 10⁵)', r: 1e5, s: 'O', al: ['lakh', 'lac', 'lac rupees'] },
      { id: 'crore', lb: 'Crore (10 Million / 10⁷)', r: 1e7, s: 'O', al: ['crore', 'karor', 'cr'] },
      { id: 'arab', lb: 'Arab (1 Billion / 10⁹)', r: 1e9, s: 'O', al: ['arab', 'billion pk'] },
      { id: 'kharab', lb: 'Kharab (100 Billion / 10¹¹)', r: 1e11, s: 'O', al: ['kharab'] },
      { id: 'neel', lb: 'Neel (10 Trillion / 10¹³)', r: 1e13, s: 'O', al: ['neel'] },
      { id: 'k_std', lb: 'Thousand (K / 10³)', r: 1e3, s: 'S' },
      { id: 'm_std', lb: 'Million (M / 10⁶)', r: 1e6, s: 'S' },
      { id: 'b_std', lb: 'Billion (B / 10⁹)', r: 1e9, s: 'S' },
      { id: 't_std', lb: 'Trillion (T / 10¹²)', r: 1e12, s: 'S' }
    ]
  },
  {
    id: 'statistics', lb: 'Statistics & Odds', ic: '📊', cl: '#3f51b5', sp: true,
    al: ['z-score', 'percentile', 'probability', 'betting odds', 'moneyline', 'p-value', 'odds converter'],
    un: [
      { id: 'prob_pct', lb: 'Implied Probability (%)', r: 1, s: 'M', al: ['probability', 'chance'] },
      { id: 'percentile', lb: 'Percentile Rank (%)', s: 'S' },
      { id: 'z_score', lb: 'Z-Score (σ)', s: 'S', al: ['z score', 'standard score'] },
      { id: 'p_val_two', lb: 'Two-Tailed P-Value', s: 'S' },
      { id: 'dec_odds', lb: 'Decimal Odds (European)', s: 'O', al: ['decimal odds'] },
      { id: 'frac_odds', lb: 'Fractional Odds (UK/Traditional)', s: 'O', al: ['fractional odds'] },
      { id: 'us_moneyline', lb: 'American Moneyline (+/-)', s: 'O', al: ['moneyline', 'american odds'] }
    ]
  },
  {
    id: 'matrix-format', lb: 'Matrix & Arrays', ic: '🧱', cl: '#009688', sp: true,
    al: ['matrix', 'latex matrix', 'numpy array', 'matlab matrix', 'csv grid', 'json 2d array'],
    un: [
      { id: 'csv', lb: 'CSV / TSV Grid', r: 1, s: 'M', al: ['csv', 'tsv'] },
      { id: 'latex_b', lb: 'LaTeX bmatrix ([...])', s: 'S', al: ['bmatrix'] },
      { id: 'latex_p', lb: 'LaTeX pmatrix ((...))', s: 'S', al: ['pmatrix'] },
      { id: 'numpy', lb: 'Python NumPy (np.array)', s: 'S', al: ['numpy', 'python array'] },
      { id: 'matlab', lb: 'MATLAB / Octave ([a b; c d])', s: 'S', al: ['matlab', 'octave'] },
      { id: 'json_2d', lb: 'JSON 2D Array', s: 'S', al: ['json', 'nested array'] }
    ]
  },
  {
    id: 'scientific-notation', lb: 'Scientific & Fractions', ic: '🔬', cl: '#9c27b0',
    al: ['scientific notation', 'engineering notation', 'e notation', 'ppm', 'ppb', 'ppt', 'parts per million'],
    un: [
      { id: 'dec_std', lb: 'Standard Decimal', r: 1, s: 'M' },
      { id: 'sci_kilo', lb: 'Kilo (10³)', r: 1e3, s: 'S' },
      { id: 'sci_mega', lb: 'Mega (10⁶)', r: 1e6, s: 'S' },
      { id: 'sci_giga', lb: 'Giga (10⁹)', r: 1e9, s: 'S' },
      { id: 'sci_milli', lb: 'Milli (10⁻³)', r: 1e-3, s: 'S' },
      { id: 'sci_micro', lb: 'Micro (10⁻⁶)', r: 1e-6, s: 'S' },
      { id: 'sci_nano', lb: 'Nano (10⁻⁹)', r: 1e-9, s: 'S' },
      { id: 'ppm', lb: 'Parts-Per-Million (ppm / 10⁻⁶)', r: 1e-6, s: 'S', al: ['ppm'] },
      { id: 'ppb', lb: 'Parts-Per-Billion (ppb / 10⁻⁹)', r: 1e-9, s: 'S', al: ['ppb'] },
      { id: 'ppt', lb: 'Parts-Per-Trillion (ppt / 10⁻¹²)', r: 1e-12, s: 'S', al: ['ppt'] },
      { id: 'pct', lb: 'Percentage (%)', r: 0.01, s: 'M', al: ['percent', '%'] },
      { id: 'permille', lb: 'Permille (‰)', r: 0.001, s: 'M', al: ['permille', 'per thousand'] }
    ]
  },
  {
    id: 'pk-gpa', lb: 'HEC GPA & Marks', ic: '🎓', cl: '#e91e63', sp: true,
    al: ['hec gpa', 'gpa converter', 'fsc marks', 'matric marks', 'mdcat aggregate', 'percentage to gpa', 'ecat'],
    un: [
      { id: 'percentage', lb: 'Percentage Marks (%)', r: 1, s: 'M', al: ['percent', '%'] },
      { id: 'hec_gpa4', lb: 'HEC 4.00 Scale CGPA', s: 'O', al: ['hec gpa', 'cgpa 4'] },
      { id: 'gpa5', lb: '5.00 Scale CGPA', s: 'O', al: ['cgpa 5'] },
      { id: 'matric_fsc1100', lb: 'Matric / FSc Marks (Out of 1100)', s: 'O', al: ['fsc marks', 'matric marks', '1100'] },
      { id: 'matric_fsc1200', lb: 'Matric / FSc Marks (Out of 1200)', s: 'O', al: ['1200'] },
      { id: 'mdcat_agg', lb: 'MDCAT / ECAT Aggregate (%)', s: 'O', al: ['mdcat', 'aggregate'] }
    ]
  },
  {
    id: 'cricket-overs', lb: 'Cricket Base-6', ic: '🏏', cl: '#8bc34a', sp: true,
    al: ['cricket overs', 'overs to balls', 'run rate', 'cricket balls', 'net run rate', 'base 6 overs'],
    un: [
      { id: 'overs_balls', lb: 'Cricket Overs (e.g. 14.3)', r: 1, s: 'O', al: ['overs', 'overs.balls'] },
      { id: 'true_overs', lb: 'True Decimal Overs (14.50)', s: 'S', al: ['decimal overs'] },
      { id: 'balls', lb: 'Legal Deliveries / Balls', s: 'S', al: ['balls', 'deliveries'] },
      { id: 'run_rate_6', lb: 'Run Rate Metric (Per 6 Balls)', s: 'O', al: ['rr', 'run rate'] }
    ]
  }
]

