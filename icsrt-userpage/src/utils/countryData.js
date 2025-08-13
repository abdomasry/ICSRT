// Shared country/calling-code dataset and helpers

export const countryCodes = [
  { code: '93', name: 'Afghanistan', nameAr: 'أفغانستان' },
  { code: '355', name: 'Albania', nameAr: 'ألبانيا' },
  { code: '213', name: 'Algeria', nameAr: 'الجزائر' },
  { code: '54', name: 'Argentina', nameAr: 'الأرجنتين' },
  { code: '374', name: 'Armenia', nameAr: 'أرمينيا' },
  { code: '61', name: 'Australia', nameAr: 'أستراليا' },
  { code: '43', name: 'Austria', nameAr: 'النمسا' },
  { code: '994', name: 'Azerbaijan', nameAr: 'أذربيجان' },
  { code: '973', name: 'Bahrain', nameAr: 'البحرين' },
  { code: '880', name: 'Bangladesh', nameAr: 'بنغلاديش' },
  { code: '375', name: 'Belarus', nameAr: 'بيلاروسيا' },
  { code: '32', name: 'Belgium', nameAr: 'بلجيكا' },
  { code: '55', name: 'Brazil', nameAr: 'البرازيل' },
  { code: '359', name: 'Bulgaria', nameAr: 'بلغاريا' },
  { code: '855', name: 'Cambodia', nameAr: 'كمبوديا' },
  { code: '237', name: 'Cameroon', nameAr: 'الكاميرون' },
  { code: '1', name: 'Canada', nameAr: 'كندا' },
  { code: '56', name: 'Chile', nameAr: 'تشيلي' },
  { code: '86', name: 'China', nameAr: 'الصين' },
  { code: '57', name: 'Colombia', nameAr: 'كولومبيا' },
  { code: '506', name: 'Costa Rica', nameAr: 'كوستاريكا' },
  { code: '385', name: 'Croatia', nameAr: 'كرواتيا' },
  { code: '357', name: 'Cyprus', nameAr: 'قبرص' },
  { code: '420', name: 'Czech Republic', nameAr: 'جمهورية التشيك' },
  { code: '45', name: 'Denmark', nameAr: 'الدنمارك' },
  { code: '20', name: 'Egypt', nameAr: 'مصر' },
  { code: '372', name: 'Estonia', nameAr: 'إستونيا' },
  { code: '251', name: 'Ethiopia', nameAr: 'إثيوبيا' },
  { code: '358', name: 'Finland', nameAr: 'فنلندا' },
  { code: '33', name: 'France', nameAr: 'فرنسا' },
  { code: '995', name: 'Georgia', nameAr: 'جورجيا' },
  { code: '49', name: 'Germany', nameAr: 'ألمانيا' },
  { code: '233', name: 'Ghana', nameAr: 'غانا' },
  { code: '30', name: 'Greece', nameAr: 'اليونان' },
  { code: '36', name: 'Hungary', nameAr: 'المجر' },
  { code: '354', name: 'Iceland', nameAr: 'آيسلندا' },
  { code: '91', name: 'India', nameAr: 'الهند' },
  { code: '62', name: 'Indonesia', nameAr: 'إندونيسيا' },
  { code: '98', name: 'Iran', nameAr: 'إيران' },
  { code: '964', name: 'Iraq', nameAr: 'العراق' },
  { code: '353', name: 'Ireland', nameAr: 'أيرلندا' },
  { code: '972', name: 'Israel', nameAr: 'إسرائيل' },
  { code: '39', name: 'Italy', nameAr: 'إيطاليا' },
  { code: '81', name: 'Japan', nameAr: 'اليابان' },
  { code: '962', name: 'Jordan', nameAr: 'الأردن' },
  { code: '7', name: 'Kazakhstan', nameAr: 'كازاخستان' },
  { code: '254', name: 'Kenya', nameAr: 'كينيا' },
  { code: '965', name: 'Kuwait', nameAr: 'الكويت' },
  { code: '371', name: 'Latvia', nameAr: 'لاتفيا' },
  { code: '961', name: 'Lebanon', nameAr: 'لبنان' },
  { code: '218', name: 'Libya', nameAr: 'ليبيا' },
  { code: '370', name: 'Lithuania', nameAr: 'ليتوانيا' },
  { code: '352', name: 'Luxembourg', nameAr: 'لوكسمبورغ' },
  { code: '60', name: 'Malaysia', nameAr: 'ماليزيا' },
  { code: '212', name: 'Morocco', nameAr: 'المغرب' },
  { code: '31', name: 'Netherlands', nameAr: 'هولندا' },
  { code: '64', name: 'New Zealand', nameAr: 'نيوزيلندا' },
  { code: '234', name: 'Nigeria', nameAr: 'نيجيريا' },
  { code: '47', name: 'Norway', nameAr: 'النرويج' },
  { code: '968', name: 'Oman', nameAr: 'عمان' },
  { code: '92', name: 'Pakistan', nameAr: 'باكستان' },
  { code: '970', name: 'Palestine', nameAr: 'فلسطين' },
  { code: '48', name: 'Poland', nameAr: 'بولندا' },
  { code: '351', name: 'Portugal', nameAr: 'البرتغال' },
  { code: '974', name: 'Qatar', nameAr: 'قطر' },
  { code: '40', name: 'Romania', nameAr: 'رومانيا' },
  { code: '7', name: 'Russia', nameAr: 'روسيا' },
  { code: '966', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
  { code: '27', name: 'South Africa', nameAr: 'جنوب أفريقيا' },
  { code: '82', name: 'South Korea', nameAr: 'كوريا الجنوبية' },
  { code: '34', name: 'Spain', nameAr: 'إسبانيا' },
  { code: '249', name: 'Sudan', nameAr: 'السودان' },
  { code: '46', name: 'Sweden', nameAr: 'السويد' },
  { code: '41', name: 'Switzerland', nameAr: 'سويسرا' },
  { code: '963', name: 'Syria', nameAr: 'سوريا' },
  { code: '216', name: 'Tunisia', nameAr: 'تونس' },
  { code: '90', name: 'Turkey', nameAr: 'تركيا' },
  { code: '380', name: 'Ukraine', nameAr: 'أوكرانيا' },
  { code: '971', name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة' },
  { code: '44', name: 'United Kingdom', nameAr: 'المملكة المتحدة' },
  { code: '1', name: 'United States', nameAr: 'الولايات المتحدة' },
  { code: '967', name: 'Yemen', nameAr: 'اليمن' },
  { code: '260', name: 'Zambia', nameAr: 'زامبيا' },
  { code: '263', name: 'Zimbabwe', nameAr: 'زيمبابوي' }
];

export const nameToCode = new Map(countryCodes.map(c => [c.name, c.code]));
export const codeToName = new Map(countryCodes.map(c => [String(c.code), c.name]));
export const codeToArabicName = new Map(countryCodes.map(c => [String(c.code), c.nameAr]));

export function getCodeByName(name) {
  return nameToCode.get(name) || '';
}

export function getNameByCode(code) {
  return codeToName.get(String(code)) || '';
}

export function getArabicNameByCode(code) {
  return codeToArabicName.get(String(code)) || '';
}

export function getUniqueCountries() {
  const seen = new Set();
  const result = [];
  for (const c of countryCodes) {
    if (!seen.has(c.name)) {
      seen.add(c.name);
      result.push({ name: c.name, nameAr: c.nameAr });
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
