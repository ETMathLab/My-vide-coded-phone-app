/**
 * Safe arithmetic expression evaluator for the calculator display.
 * Supports +, −, ×, ÷, decimals, and unary minus without eval().
 */

export function normalizeExpressionForEval(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .trim();
}

export function evaluateExpression(rawExpr: string): { value: number | null; isComplete: boolean } {
  const cleaned = normalizeExpressionForEval(rawExpr);
  if (!cleaned || cleaned === '-') {
    return { value: 0, isComplete: false };
  }

  // Strip trailing operator for live preview while typing e.g. "12 + "
  const hasTrailingOp = /[+\-*/.]$/.test(cleaned);
  const evalTarget = hasTrailingOp ? cleaned.replace(/[+\-*/.]+$/, '') : cleaned;

  if (!evalTarget || evalTarget === '-') {
    return { value: 0, isComplete: false };
  }

  const tokens = tokenize(evalTarget);
  if (!tokens) {
    return { value: null, isComplete: false };
  }

  const result = computeShuntingYard(tokens);
  if (result === null || !Number.isFinite(result)) {
    return { value: null, isComplete: false };
  }

  return { value: result, isComplete: !hasTrailingOp };
}

type Token = { type: 'num'; val: number } | { type: 'op'; val: '+' | '-' | '*' | '/' };

function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }

    const prev = tokens[tokens.length - 1];
    const isUnaryMinus =
      ch === '-' && (tokens.length === 0 || (prev && prev.type === 'op'));

    if (isUnaryMinus || /[0-9.]/.test(ch)) {
      let numStr = '';
      if (isUnaryMinus) {
        numStr += '-';
        i++;
      }
      let dotCount = 0;
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        if (expr[i] === '.') {
          dotCount++;
          if (dotCount > 1) return null;
        }
        numStr += expr[i];
        i++;
      }
      if (numStr === '-' || numStr === '.' || numStr === '-.') return null;
      const parsed = Number(numStr);
      if (Number.isNaN(parsed)) return null;
      tokens.push({ type: 'num', val: parsed });
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'op', val: ch });
      i++;
      continue;
    }

    return null;
  }

  return tokens;
}

function computeShuntingYard(tokens: Token[]): number | null {
  const values: number[] = [];
  const ops: Array<'+' | '-' | '*' | '/'> = [];

  const prec = (op: '+' | '-' | '*' | '/') => (op === '*' || op === '/' ? 2 : 1);

  const applyTop = (): boolean => {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (op === undefined || a === undefined || b === undefined) return false;
    if (op === '+') values.push(a + b);
    else if (op === '-') values.push(a - b);
    else if (op === '*') values.push(a * b);
    else if (op === '/') {
      if (b === 0) return false;
      values.push(a / b);
    }
    return true;
  };

  for (const t of tokens) {
    if (t.type === 'num') {
      values.push(t.val);
    } else {
      while (ops.length > 0 && prec(ops[ops.length - 1]) >= prec(t.val)) {
        if (!applyTop()) return null;
      }
      ops.push(t.val);
    }
  }

  while (ops.length > 0) {
    if (!applyTop()) return null;
  }

  return values.length === 1 ? values[0] : null;
}

export function formatConvertedNumber(val: number): string {
  if (!Number.isFinite(val)) return '—';
  if (Object.is(val, -0) || Math.abs(val) < 1e-12) return '0';

  const abs = Math.abs(val);
  let decimals = 2;
  if (abs >= 10000) decimals = 1;
  else if (abs >= 100) decimals = 2;
  else if (abs >= 1) decimals = 2;
  else if (abs >= 0.01) decimals = 3;
  else decimals = 4;

  // Strip unnecessary trailing zeros cleanly
  const fixed = Number(val.toFixed(decimals));
  return fixed.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
  });
}

export function formatRawNumberForDisplay(val: number): string {
  if (!Number.isFinite(val)) return '0';
  if (Object.is(val, -0)) return '0';
  // Prevent floating point noise like 0.30000000000000004
  const rounded = Number(val.toPrecision(10));
  return String(rounded);
}
