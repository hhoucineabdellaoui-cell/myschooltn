// Utility to convert numbers to French and Arabic words for school receipts

const frenchUnits = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const frenchTeens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const frenchTens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

export function numberToFrenchWords(num: number): string {
  if (num === 0) return 'zéro dinar tunisien';
  const n = Math.floor(Math.abs(num));

  function convertUnder100(n: number): string {
    if (n < 10) return frenchUnits[n];
    if (n < 20) return frenchTeens[n - 10];
    const tens = Math.floor(n / 10);
    const units = n % 10;
    
    if (tens === 7) {
      return units === 1 ? 'soixante-et-onze' : `soixante-${frenchTeens[units]}`;
    }
    if (tens === 9) {
      return `quatre-vingt-${frenchTeens[units]}`;
    }
    if (units === 0) {
      return tens === 8 ? 'quatre-vingts' : frenchTens[tens];
    }
    if (units === 1 && tens !== 8) {
      return `${frenchTens[tens]}-et-un`;
    }
    return `${frenchTens[tens]}-${frenchUnits[units]}`;
  }

  function convertUnder1000(n: number): string {
    if (n < 100) return convertUnder100(n);
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const hundredsPrefix = hundreds === 1 ? 'cent' : `${frenchUnits[hundreds]} cent${rest === 0 ? 's' : ''}`;
    if (rest === 0) return hundredsPrefix;
    return `${hundredsPrefix} ${convertUnder100(rest)}`;
  }

  let words = '';
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    words += `${convertUnder1000(millions)} million${millions > 1 ? 's' : ''} `;
    if (rest > 0) words += `${convertUnder1000(rest)} `;
  } else if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const thousandsPrefix = thousands === 1 ? 'mille' : `${convertUnder1000(thousands)} mille`;
    words += `${thousandsPrefix} `;
    if (rest > 0) words += `${convertUnder1000(rest)} `;
  } else {
    words = convertUnder1000(n);
  }

  const capitalized = words.trim().charAt(0).toUpperCase() + words.trim().slice(1);
  return `${capitalized} Dinars Tunisiens`;
}

export function numberToArabicWords(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'صفر دينار تونسي';

  // Specific common cases in Tunisian school fees for precise grammar
  if (n === 380) return 'ثلاثمائة وثمانون ديناراً تونسياً';
  if (n === 220) return 'مائتان وعشرون ديناراً تونسياً';
  if (n === 450) return 'أربعمائة وخمسون ديناراً تونسياً';
  if (n === 1800) return 'ألف وثمانمائة دينار تونسي';
  if (n === 1500) return 'ألف وخمسمائة دينار تونسي';
  if (n === 1000) return 'ألف دينار تونسي';
  if (n === 500) return 'خمسمائة دينار تونسي';
  if (n === 600) return 'ستمائة دينار تونسي';
  if (n === 300) return 'ثلاثمائة دينار تونسي';
  if (n === 200) return 'مائتا دينار تونسي';
  if (n === 100) return 'مائة دينار تونسي';

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  if (n <= 10) return `${units[n]} دنانير تونسية`;
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return `${tens[t]} ديناراً تونسياً`;
    return `${units[u]} و${tens[t]} ديناراً تونسياً`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (rest === 0) return `${hundreds[h]} دينار تونسي`;
    return `${hundreds[h]} و${numberToArabicWords(rest).replace(' ديناراً تونسياً', '').replace(' دنانير تونسية', '')} ديناراً تونسياً`;
  }

  return `${n.toLocaleString('ar-TN')} دينار تونسي`;
}
