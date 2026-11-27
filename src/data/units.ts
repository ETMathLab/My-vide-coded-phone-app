export type CategoryId =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'cooking'
  | 'speed'
  | 'area'
  | 'fuel'
  | 'pressure';

export type UnitSystem = 'metric' | 'us';

export interface UnitDef {
  id: string;
  symbol: string;
  name: string;
  system: UnitSystem;
  /** Convert from this unit to the category's base unit */
  toBase: (value: number) => number;
  /** Convert from the category's base unit to this unit */
  fromBase: (baseValue: number) => number;
}

export interface PresetDef {
  label: string;
  value: number;
  unitId: string;
  note: string;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  defaultFrom: string;
  defaultTo: string;
  units: UnitDef[];
  presets: PresetDef[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'length',
    label: 'Length',
    defaultFrom: 'cm',
    defaultTo: 'in',
    // Base unit: meters (m)
    units: [
      { id: 'mm', symbol: 'mm', name: 'Millimeters', system: 'metric', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: 'cm', symbol: 'cm', name: 'Centimeters', system: 'metric', toBase: (v) => v / 100, fromBase: (b) => b * 100 },
      { id: 'm', symbol: 'm', name: 'Meters', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      { id: 'km', symbol: 'km', name: 'Kilometers', system: 'metric', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'in', symbol: 'in', name: 'Inches', system: 'us', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
      { id: 'ft', symbol: 'ft', name: 'Feet', system: 'us', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'yd', symbol: 'yd', name: 'Yards', system: 'us', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      { id: 'mi', symbol: 'mi', name: 'Miles', system: 'us', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
    ],
    presets: [
      { label: '10 mm', value: 10, unitId: 'mm', note: 'Bolt / wrench' },
      { label: '30 cm', value: 30, unitId: 'cm', note: 'Ruler' },
      { label: '175 cm', value: 175, unitId: 'cm', note: 'Height' },
      { label: '1.8 m', value: 1.8, unitId: 'm', note: 'Doorway' },
      { label: '5 km', value: 5, unitId: 'km', note: '5K run' },
      { label: '100 km', value: 100, unitId: 'km', note: 'Road trip' },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    // Base unit: grams (g)
    units: [
      { id: 'mg', symbol: 'mg', name: 'Milligrams', system: 'metric', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: 'g', symbol: 'g', name: 'Grams', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kg', symbol: 'kg', name: 'Kilograms', system: 'metric', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 't', symbol: 't', name: 'Metric Tonnes', system: 'metric', toBase: (v) => v * 1_000_000, fromBase: (b) => b / 1_000_000 },
      { id: 'oz', symbol: 'oz', name: 'Ounces', system: 'us', toBase: (v) => v * 28.349523125, fromBase: (b) => b / 28.349523125 },
      { id: 'lb', symbol: 'lb', name: 'Pounds', system: 'us', toBase: (v) => v * 453.59237, fromBase: (b) => b / 453.59237 },
      { id: 'uston', symbol: 'ton', name: 'US Short Tons', system: 'us', toBase: (v) => v * 907184.74, fromBase: (b) => b / 907184.74 },
    ],
    presets: [
      { label: '100 g', value: 100, unitId: 'g', note: 'Ingredient' },
      { label: '250 g', value: 250, unitId: 'g', note: 'Butter / pack' },
      { label: '500 g', value: 500, unitId: 'g', note: 'Half kilo' },
      { label: '1 kg', value: 1, unitId: 'kg', note: 'Grocery' },
      { label: '23 kg', value: 23, unitId: 'kg', note: 'Airline bag' },
      { label: '75 kg', value: 75, unitId: 'kg', note: 'Body weight' },
    ],
  },
  {
    id: 'temperature',
    label: 'Temp',
    defaultFrom: 'c',
    defaultTo: 'f',
    // Base unit: Celsius
    units: [
      { id: 'c', symbol: '°C', name: 'Celsius', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      { id: 'f', symbol: '°F', name: 'Fahrenheit', system: 'us', toBase: (v) => (v - 32) * (5 / 9), fromBase: (b) => b * (9 / 5) + 32 },
      { id: 'k', symbol: 'K', name: 'Kelvin', system: 'metric', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
    ],
    presets: [
      { label: '0 °C', value: 0, unitId: 'c', note: 'Freezing' },
      { label: '21 °C', value: 21, unitId: 'c', note: 'Room temp' },
      { label: '37 °C', value: 37, unitId: 'c', note: 'Body temp' },
      { label: '100 °C', value: 100, unitId: 'c', note: 'Boiling' },
      { label: '180 °C', value: 180, unitId: 'c', note: 'Bake oven' },
      { label: '220 °C', value: 220, unitId: 'c', note: 'Roast oven' },
    ],
  },
  {
    id: 'cooking',
    label: 'Cooking',
    defaultFrom: 'ml',
    defaultTo: 'cup',
    // Base unit: milliliters (mL) using exact US Customary liquid measures
    units: [
      { id: 'ml', symbol: 'mL', name: 'Milliliters', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      { id: 'l', symbol: 'L', name: 'Liters', system: 'metric', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'tsp', symbol: 'tsp', name: 'US Teaspoons', system: 'us', toBase: (v) => v * 4.92892159375, fromBase: (b) => b / 4.92892159375 },
      { id: 'tbsp', symbol: 'tbsp', name: 'US Tablespoons', system: 'us', toBase: (v) => v * 14.78676478125, fromBase: (b) => b / 14.78676478125 },
      { id: 'floz', symbol: 'fl oz', name: 'US Fluid Oz', system: 'us', toBase: (v) => v * 29.5735295625, fromBase: (b) => b / 29.5735295625 },
      { id: 'cup', symbol: 'cup', name: 'US Cups', system: 'us', toBase: (v) => v * 236.5882365, fromBase: (b) => b / 236.5882365 },
      { id: 'pt', symbol: 'pt', name: 'US Pints', system: 'us', toBase: (v) => v * 473.176473, fromBase: (b) => b / 473.176473 },
      { id: 'qt', symbol: 'qt', name: 'US Quarts', system: 'us', toBase: (v) => v * 946.352946, fromBase: (b) => b / 946.352946 },
      { id: 'gal', symbol: 'gal', name: 'US Gallons', system: 'us', toBase: (v) => v * 3785.411784, fromBase: (b) => b / 3785.411784 },
    ],
    presets: [
      { label: '5 mL', value: 5, unitId: 'ml', note: '1 tsp' },
      { label: '15 mL', value: 15, unitId: 'ml', note: '1 tbsp' },
      { label: '250 mL', value: 250, unitId: 'ml', note: '1 metric cup' },
      { label: '500 mL', value: 500, unitId: 'ml', note: 'Bottle' },
      { label: '1 L', value: 1, unitId: 'l', note: 'Carton' },
      { label: '4 L', value: 4, unitId: 'l', note: 'Jug (~1 gal)' },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    // Base unit: m/s
    units: [
      { id: 'kmh', symbol: 'km/h', name: 'Kilometers/hr', system: 'metric', toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      { id: 'ms', symbol: 'm/s', name: 'Meters/sec', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      { id: 'mph', symbol: 'mph', name: 'Miles/hr', system: 'us', toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      { id: 'fts', symbol: 'ft/s', name: 'Feet/sec', system: 'us', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
    ],
    presets: [
      { label: '30 km/h', value: 30, unitId: 'kmh', note: 'School zone' },
      { label: '50 km/h', value: 50, unitId: 'kmh', note: 'City street' },
      { label: '80 km/h', value: 80, unitId: 'kmh', note: 'Rural road' },
      { label: '100 km/h', value: 100, unitId: 'kmh', note: 'Highway' },
      { label: '120 km/h', value: 120, unitId: 'kmh', note: 'Freeway' },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    defaultFrom: 'sqm',
    defaultTo: 'sqft',
    // Base unit: square meters (m²)
    units: [
      { id: 'sqcm', symbol: 'cm²', name: 'Sq Centimeters', system: 'metric', toBase: (v) => v / 10000, fromBase: (b) => b * 10000 },
      { id: 'sqm', symbol: 'm²', name: 'Sq Meters', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      { id: 'ha', symbol: 'ha', name: 'Hectares', system: 'metric', toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
      { id: 'sqkm', symbol: 'km²', name: 'Sq Kilometers', system: 'metric', toBase: (v) => v * 1_000_000, fromBase: (b) => b / 1_000_000 },
      { id: 'sqin', symbol: 'sq in', name: 'Sq Inches', system: 'us', toBase: (v) => v * 0.00064516, fromBase: (b) => b / 0.00064516 },
      { id: 'sqft', symbol: 'sq ft', name: 'Sq Feet', system: 'us', toBase: (v) => v * 0.09290304, fromBase: (b) => b / 0.09290304 },
      { id: 'sqyd', symbol: 'sq yd', name: 'Sq Yards', system: 'us', toBase: (v) => v * 0.83612736, fromBase: (b) => b / 0.83612736 },
      { id: 'acre', symbol: 'acres', name: 'Acres', system: 'us', toBase: (v) => v * 4046.8564224, fromBase: (b) => b / 4046.8564224 },
      { id: 'sqmi', symbol: 'sq mi', name: 'Sq Miles', system: 'us', toBase: (v) => v * 2_589_988.110336, fromBase: (b) => b / 2_589_988.110336 },
    ],
    presets: [
      { label: '20 m²', value: 20, unitId: 'sqm', note: 'Bedroom' },
      { label: '85 m²', value: 85, unitId: 'sqm', note: 'Apartment' },
      { label: '150 m²', value: 150, unitId: 'sqm', note: 'House' },
      { label: '1 ha', value: 1, unitId: 'ha', note: 'Land lot' },
    ],
  },
  {
    id: 'fuel',
    label: 'Fuel',
    defaultFrom: 'l100km',
    defaultTo: 'mpg',
    // Base unit: km/L
    units: [
      {
        id: 'l100km',
        symbol: 'L/100km',
        name: 'Liters per 100 km',
        system: 'metric',
        toBase: (v) => (v === 0 ? 0 : 100 / v),
        fromBase: (b) => (b === 0 ? 0 : 100 / b),
      },
      { id: 'kml', symbol: 'km/L', name: 'Kilometers/Liter', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      {
        id: 'mpg',
        symbol: 'mpg',
        name: 'Miles/Gallon (US)',
        system: 'us',
        toBase: (v) => v * 0.425143707,
        fromBase: (b) => b / 0.425143707,
      },
    ],
    presets: [
      { label: '4 L/100km', value: 4, unitId: 'l100km', note: 'Hybrid' },
      { label: '6.5 L/100km', value: 6.5, unitId: 'l100km', note: 'Sedan' },
      { label: '9 L/100km', value: 9, unitId: 'l100km', note: 'SUV' },
      { label: '12 L/100km', value: 12, unitId: 'l100km', note: 'Truck' },
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure',
    defaultFrom: 'bar',
    defaultTo: 'psi',
    // Base unit: kPa
    units: [
      { id: 'kpa', symbol: 'kPa', name: 'Kilopascals', system: 'metric', toBase: (v) => v, fromBase: (b) => b },
      { id: 'bar', symbol: 'bar', name: 'Bar', system: 'metric', toBase: (v) => v * 100, fromBase: (b) => b / 100 },
      { id: 'hpa', symbol: 'hPa', name: 'Hectopascals', system: 'metric', toBase: (v) => v / 10, fromBase: (b) => b * 10 },
      { id: 'psi', symbol: 'psi', name: 'Pounds/sq in', system: 'us', toBase: (v) => v * 6.894757293, fromBase: (b) => b / 6.894757293 },
      { id: 'inhg', symbol: 'inHg', name: 'Inches Mercury', system: 'us', toBase: (v) => v * 3.386389, fromBase: (b) => b / 3.386389 },
    ],
    presets: [
      { label: '2.2 bar', value: 2.2, unitId: 'bar', note: 'Car tire' },
      { label: '2.5 bar', value: 2.5, unitId: 'bar', note: 'Loaded tire' },
      { label: '240 kPa', value: 240, unitId: 'kpa', note: 'Tire kPa' },
      { label: '1013 hPa', value: 1013, unitId: 'hpa', note: 'Sea level' },
    ],
  },
];

export function convertUnit(value: number, fromUnit: UnitDef, toUnit: UnitDef): number {
  if (!Number.isFinite(value)) return 0;
  if (fromUnit.id === toUnit.id) return value;
  const base = fromUnit.toBase(value);
  return toUnit.fromBase(base);
}

/**
 * Returns practical everyday breakdown strings (like 5' 8.9", 3 lb 4.9 oz, or fractional inches).
 */
export function getEverydayBreakdown(
  category: CategoryId,
  value: number,
  fromUnit: UnitDef,
  toUnit: UnitDef
): string | null {
  if (!Number.isFinite(value)) return null;

  if (category === 'length' && toUnit.system === 'us') {
    const meters = fromUnit.toBase(value);
    const totalInches = meters / 0.0254;
    if (toUnit.id === 'in' || toUnit.id === 'ft') {
      const absInches = Math.abs(totalInches);
      const sign = totalInches < 0 ? '-' : '';
      if (absInches >= 12 && absInches < 600) {
        const feet = Math.floor(absInches / 12);
        const remInches = absInches - feet * 12;
        return `${sign}${feet} ft ${remInches.toFixed(1)} in`;
      }
      if (absInches > 0 && absInches < 24) {
        // Nearest 1/16 inch for tape measure / DIY
        const sixteenths = Math.round(absInches * 16);
        const whole = Math.floor(sixteenths / 16);
        let num = sixteenths % 16;
        let den = 16;
        if (num > 0) {
          while (num % 2 === 0 && den > 1) {
            num /= 2;
            den /= 2;
          }
          return whole > 0 ? `Tape measure ~ ${sign}${whole} ${num}/${den}"` : `Tape measure ~ ${sign}${num}/${den}"`;
        }
      }
    }
  }

  if (category === 'weight' && toUnit.system === 'us') {
    const grams = fromUnit.toBase(value);
    const totalOz = grams / 28.349523125;
    if ((toUnit.id === 'lb' || toUnit.id === 'oz') && Math.abs(totalOz) >= 16 && Math.abs(totalOz) < 3200) {
      const sign = totalOz < 0 ? '-' : '';
      const absOz = Math.abs(totalOz);
      const lbs = Math.floor(absOz / 16);
      const oz = absOz - lbs * 16;
      return `${sign}${lbs} lb ${oz.toFixed(1)} oz`;
    }
  }

  if (category === 'temperature') {
    const celsius = fromUnit.toBase(value);
    if (Math.abs(celsius - 0) <= 1) return 'Water freezes';
    if (Math.abs(celsius - 21) <= 2) return 'Comfortable room';
    if (Math.abs(celsius - 37) <= 0.6) return 'Normal body temp';
    if (Math.abs(celsius - 100) <= 1) return 'Water boils';
    if (celsius >= 175 && celsius <= 185) return 'Moderate baking oven';
    if (celsius >= 195 && celsius <= 205) return 'Hot baking oven';
  }

  if (category === 'cooking' && toUnit.system === 'us') {
    const ml = fromUnit.toBase(value);
    const cups = ml / 236.5882365;
    if (toUnit.id === 'cup' && cups > 0 && cups < 1) {
      const tbsp = ml / 14.78676478125;
      const floz = ml / 29.5735295625;
      return `${floz.toFixed(2)} fl oz · ${tbsp.toFixed(1)} tbsp`;
    }
  }

  return null;
}
