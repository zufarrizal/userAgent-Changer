function buildUserAgent(androidVersion, model) {
  return `Mozilla/5.0 (Linux; Android ${androidVersion}; ${model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36`;
}

function toPlatformVersion(androidVersion) {
  const major = String(androidVersion).split(".")[0] || "15";
  return `${major}.0.0`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferYear(label) {
  const explicitYear = label.match(/\b(20\d{2})\b/);
  if (explicitYear) {
    return Number(explicitYear[1]);
  }

  const rules = [
    { year: 2025, patterns: [/S25/, /Pixel 9/, /Xiaomi 15/, /POCO F7/, /OnePlus 13/, /Find X8/, /Reno13/, /X200/, /iQOO 13/, /Neo10/, /GT 7/, /Phone \(3/, /ROG Phone 9/, /Xperia 1 VI/, /Edge 60/, /Razr 60/, /Magic7/, /ThinkPhone 25/] },
    { year: 2024, patterns: [/S24/, /S23/, /Pixel 8/, /Pixel Fold/, /Pixel 7/, /Xiaomi 14/, /14T/, /Note 14/, /OnePlus 12/, /Open/, /Ace 3/, /Nord 4/, /Find X7/, /X100/, /V40/, /iQOO 12/, /GT 6/, /realme 13/, /realme 12/, /Narzo 70/, /Phone \(2a/, /ROG Phone 8/, /Zenfone 11/, /Xperia 5 V/, /Xperia 1 V/, /Edge 50/, /Razr 50/, /Moto G85/, /Moto G75/, /Moto G54/, /Magic6/, /Honor 200/, /Honor X9c/] }
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(label))) {
      return rule.year;
    }
  }

  return 2025;
}

function inferDeviceType(label) {
  if (/Tab|Pad/i.test(label)) return "tablet";
  if (/Fold|Flip|N\d|Razr/i.test(label)) return "foldable";
  if (/ROG|RedMagic|Legion/i.test(label)) return "gaming";
  if (/Armor|CAT|S62|rugged/i.test(label)) return "rugged";
  return "phone";
}

const RAW_DEVICES = [
  { manufacturer: "Samsung", label: "Samsung Galaxy S25 Ultra", model: "SM-S938B", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3.5 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S25+", model: "SM-S936B", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S25", model: "SM-S931B", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S24 Ultra", model: "SM-S928B", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3.5 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S24+", model: "SM-S926B", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S24", model: "SM-S921B", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S24 FE", model: "SM-S721B", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Z Fold6", model: "SM-F956B", androidVersion: "14", width: 375, height: 812, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Z Flip6", model: "SM-F741B", androidVersion: "14", width: 360, height: 780, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy A55", model: "SM-A556B", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "Samsung", label: "Samsung Galaxy A35", model: "SM-A356B", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "Samsung", label: "Samsung Galaxy M55", model: "SM-M556B", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "Samsung", label: "Samsung Galaxy F55", model: "SM-E556B", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S23 Ultra", model: "SM-S918B", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3.5 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S23", model: "SM-S911B", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },

  { manufacturer: "Google", label: "Google Pixel 9 Pro XL", model: "Pixel 9 Pro XL", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3.5 },
  { manufacturer: "Google", label: "Google Pixel 9 Pro", model: "Pixel 9 Pro", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Google", label: "Google Pixel 9", model: "Pixel 9", androidVersion: "15", width: 393, height: 851, deviceScaleFactor: 3 },
  { manufacturer: "Google", label: "Google Pixel 9a", model: "Pixel 9a", androidVersion: "15", width: 393, height: 851, deviceScaleFactor: 2.8 },
  { manufacturer: "Google", label: "Google Pixel 8 Pro", model: "Pixel 8 Pro", androidVersion: "14", width: 412, height: 892, deviceScaleFactor: 3 },
  { manufacturer: "Google", label: "Google Pixel 8", model: "Pixel 8", androidVersion: "14", width: 393, height: 851, deviceScaleFactor: 3 },
  { manufacturer: "Google", label: "Google Pixel 8a", model: "Pixel 8a", androidVersion: "14", width: 393, height: 851, deviceScaleFactor: 2.75 },
  { manufacturer: "Google", label: "Google Pixel Fold", model: "Pixel Fold", androidVersion: "14", width: 360, height: 780, deviceScaleFactor: 3 },
  { manufacturer: "Google", label: "Google Pixel 7 Pro", model: "Pixel 7 Pro", androidVersion: "14", width: 412, height: 892, deviceScaleFactor: 3 },
  { manufacturer: "Google", label: "Google Pixel 7a", model: "Pixel 7a", androidVersion: "14", width: 393, height: 851, deviceScaleFactor: 2.8 },

  { manufacturer: "Xiaomi", label: "Xiaomi 15 Ultra", model: "Xiaomi 15 Ultra", androidVersion: "15", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "Xiaomi", label: "Xiaomi 15 Pro", model: "Xiaomi 15 Pro", androidVersion: "15", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "Xiaomi", label: "Xiaomi 15", model: "Xiaomi 15", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Xiaomi", label: "Xiaomi 14 Ultra", model: "Xiaomi 14 Ultra", androidVersion: "14", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "Xiaomi", label: "Xiaomi 14", model: "Xiaomi 14", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Xiaomi", label: "Xiaomi 14T Pro", model: "Xiaomi 14T Pro", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Xiaomi", label: "Xiaomi 14T", model: "Xiaomi 14T", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Redmi", label: "Redmi Note 14 Pro+", model: "Redmi Note 14 Pro+", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Redmi", label: "Redmi Note 14 Pro", model: "Redmi Note 14 Pro", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Redmi", label: "Redmi Note 14", model: "Redmi Note 14", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "POCO", label: "POCO F7 Ultra", model: "POCO F7 Ultra", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3.5 },
  { manufacturer: "POCO", label: "POCO F7 Pro", model: "POCO F7 Pro", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "POCO", label: "POCO X7 Pro", model: "POCO X7 Pro", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "POCO", label: "POCO X7", model: "POCO X7", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "Xiaomi", label: "Xiaomi 13T Pro", model: "Xiaomi 13T Pro", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },

  { manufacturer: "OnePlus", label: "OnePlus 13", model: "CPH2653", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus 13R", model: "CPH2691", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus 12", model: "CPH2581", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus 12R", model: "CPH2609", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus Open", model: "CPH2551", androidVersion: "14", width: 360, height: 780, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus Ace 5", model: "PKG110", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus Ace 3 Pro", model: "PJD110", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus Nord 4", model: "CPH2663", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },

  { manufacturer: "OPPO", label: "OPPO Find X8 Ultra", model: "PKU110", androidVersion: "15", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "OPPO", label: "OPPO Find X8 Pro", model: "PKC110", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "OPPO", label: "OPPO Find X8", model: "PKB110", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "OPPO", label: "OPPO Find X7 Ultra", model: "PHY110", androidVersion: "14", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "OPPO", label: "OPPO Reno13 Pro", model: "CPH2689", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "OPPO", label: "OPPO Reno13", model: "CPH2687", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "OPPO", label: "OPPO Find N5", model: "PKH110", androidVersion: "15", width: 360, height: 780, deviceScaleFactor: 3 },
  { manufacturer: "OPPO", label: "OPPO Find N3 Flip", model: "PHT110", androidVersion: "14", width: 360, height: 780, deviceScaleFactor: 3 },

  { manufacturer: "vivo", label: "vivo X200 Ultra", model: "V2505A", androidVersion: "15", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "vivo", label: "vivo X200 Pro", model: "V2413A", androidVersion: "15", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "vivo", label: "vivo X200", model: "V2415A", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "vivo", label: "vivo X100 Ultra", model: "V2366A", androidVersion: "14", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "vivo", label: "vivo X100 Pro", model: "V2309A", androidVersion: "14", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "vivo", label: "vivo V40 Pro", model: "V2347", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "vivo", label: "vivo V40", model: "V2348", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "iQOO", label: "iQOO 13", model: "V2408A", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "iQOO", label: "iQOO 12", model: "V2307A", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "iQOO", label: "iQOO Neo10", model: "V2426A", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },

  { manufacturer: "realme", label: "realme GT 7 Pro", model: "RMX5010", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "realme", label: "realme GT 6", model: "RMX3851", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "realme", label: "realme GT 6T", model: "RMX3853", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "realme", label: "realme 13 Pro+", model: "RMX3921", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "realme", label: "realme 13 Pro", model: "RMX3920", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "realme", label: "realme 12 Pro+", model: "RMX3840", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "realme", label: "realme 12 Pro", model: "RMX3842", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "realme", label: "realme Narzo 70 Pro", model: "RMX3868", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },

  { manufacturer: "Nothing", label: "Nothing Phone (3)", model: "A065", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Nothing", label: "Nothing Phone (3a) Pro", model: "A059P", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Nothing", label: "Nothing Phone (3a)", model: "A059", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Nothing", label: "Nothing Phone (2a) Plus", model: "A142P", androidVersion: "14", width: 393, height: 851, deviceScaleFactor: 2.8 },

  { manufacturer: "ASUS", label: "ASUS ROG Phone 9 Pro", model: "ASUS_AI2501", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "ASUS", label: "ASUS ROG Phone 9", model: "ASUS_AI2502", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "ASUS", label: "ASUS ROG Phone 8 Pro", model: "ASUS_AI2401", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "ASUS", label: "ASUS Zenfone 11 Ultra", model: "ASUS_AI2401_H", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },

  { manufacturer: "Sony", label: "Sony Xperia 1 VI", model: "XQ-EC72", androidVersion: "15", width: 384, height: 854, deviceScaleFactor: 3 },
  { manufacturer: "Sony", label: "Sony Xperia 5 V", model: "XQ-DE72", androidVersion: "14", width: 384, height: 854, deviceScaleFactor: 3 },
  { manufacturer: "Sony", label: "Sony Xperia 1 V", model: "XQ-DQ72", androidVersion: "14", width: 384, height: 854, deviceScaleFactor: 3 },

  { manufacturer: "Motorola", label: "Motorola Edge 60 Pro", model: "XT2503-2", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Motorola", label: "Motorola Edge 60", model: "XT2501-1", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Motorola", label: "Motorola Edge 50 Ultra", model: "XT2401-2", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Motorola", label: "Motorola Edge 50 Pro", model: "XT2403-1", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Motorola", label: "Motorola Razr 60 Ultra", model: "XT2551-3", androidVersion: "15", width: 360, height: 780, deviceScaleFactor: 3 },
  { manufacturer: "Motorola", label: "Motorola Razr 50 Ultra", model: "XT2451-3", androidVersion: "14", width: 360, height: 780, deviceScaleFactor: 3 },
  { manufacturer: "Motorola", label: "Moto G85", model: "XT2427-4", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "Motorola", label: "Moto G75", model: "XT2437-2", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },
  { manufacturer: "Motorola", label: "Moto G54", model: "XT2343-3", androidVersion: "14", width: 393, height: 851, deviceScaleFactor: 2.8 },
  { manufacturer: "Motorola", label: "Motorola ThinkPhone 25", model: "XT2550-1", androidVersion: "15", width: 393, height: 873, deviceScaleFactor: 3 },

  { manufacturer: "Honor", label: "Honor Magic7 Pro", model: "BVL-AN00", androidVersion: "15", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "Honor", label: "Honor Magic7", model: "PNN-AN00", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Honor", label: "Honor Magic6 Pro", model: "BVL-AN16", androidVersion: "14", width: 430, height: 932, deviceScaleFactor: 3.5 },
  { manufacturer: "Honor", label: "Honor 200 Pro", model: "ELP-AN00", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 3 },
  { manufacturer: "Honor", label: "Honor X9c", model: "ALI-NX1", androidVersion: "14", width: 393, height: 873, deviceScaleFactor: 2.8 },

  // Legacy devices to cover year range 2015-2023.
  { manufacturer: "Samsung", label: "Samsung Galaxy S6 (2015)", model: "SM-G920F", androidVersion: "5.0", width: 360, height: 640, deviceScaleFactor: 4 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S7 (2016)", model: "SM-G930F", androidVersion: "6.0", width: 360, height: 640, deviceScaleFactor: 4 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S8 (2017)", model: "SM-G950F", androidVersion: "7.0", width: 360, height: 740, deviceScaleFactor: 4 },
  { manufacturer: "Google", label: "Google Pixel 3 XL (2018)", model: "Pixel 3 XL", androidVersion: "8.0", width: 412, height: 847, deviceScaleFactor: 3.5 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S10 (2019)", model: "SM-G973F", androidVersion: "9.0", width: 360, height: 760, deviceScaleFactor: 4 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S20 Ultra (2020)", model: "SM-G988B", androidVersion: "10", width: 412, height: 915, deviceScaleFactor: 3.5 },
  { manufacturer: "Google", label: "Google Pixel 6 Pro (2021)", model: "Pixel 6 Pro", androidVersion: "11", width: 412, height: 892, deviceScaleFactor: 3.5 },
  { manufacturer: "Samsung", label: "Samsung Galaxy S22 Ultra (2022)", model: "SM-S908B", androidVersion: "12", width: 412, height: 915, deviceScaleFactor: 3.5 },
  { manufacturer: "Google", label: "Google Pixel 8 Pro (2023)", model: "Pixel 8 Pro", androidVersion: "13", width: 412, height: 892, deviceScaleFactor: 3 },

  // Additional device types across 2015-2025 (tablet, foldable, gaming, rugged, midrange).
  { manufacturer: "Google", label: "Google Nexus 6P (2015)", model: "Nexus 6P", androidVersion: "6.0", width: 412, height: 732, deviceScaleFactor: 3.5 },
  { manufacturer: "Sony", label: "Sony Xperia Z5 (2015)", model: "E6653", androidVersion: "5.1", width: 360, height: 640, deviceScaleFactor: 3 },
  { manufacturer: "Google", label: "Google Pixel XL (2016)", model: "Pixel XL", androidVersion: "7.1", width: 412, height: 732, deviceScaleFactor: 3.5 },
  { manufacturer: "OnePlus", label: "OnePlus 3T (2016)", model: "A3010", androidVersion: "6.0", width: 360, height: 640, deviceScaleFactor: 3 },
  { manufacturer: "Razer", label: "Razer Phone (2017)", model: "RZ35-0215", androidVersion: "7.1", width: 412, height: 732, deviceScaleFactor: 3.5 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Note8 (2017)", model: "SM-N950F", androidVersion: "7.1", width: 412, height: 846, deviceScaleFactor: 3.5 },
  { manufacturer: "ASUS", label: "ASUS ROG Phone (2018)", model: "ZS600KL", androidVersion: "8.1", width: 412, height: 823, deviceScaleFactor: 3 },
  { manufacturer: "Xiaomi", label: "POCOPHONE F1 (2018)", model: "POCOPHONE F1", androidVersion: "8.1", width: 393, height: 786, deviceScaleFactor: 2.75 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Fold (2019)", model: "SM-F900F", androidVersion: "9.0", width: 360, height: 740, deviceScaleFactor: 3 },
  { manufacturer: "Xiaomi", label: "Redmi Note 8 Pro (2019)", model: "Redmi Note 8 Pro", androidVersion: "9.0", width: 393, height: 786, deviceScaleFactor: 2.75 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Z Fold2 (2020)", model: "SM-F916B", androidVersion: "10", width: 360, height: 800, deviceScaleFactor: 3 },
  { manufacturer: "CAT", label: "CAT S62 Pro (2020)", model: "CAT S62 Pro", androidVersion: "10", width: 360, height: 720, deviceScaleFactor: 2.75 },
  { manufacturer: "Lenovo", label: "Lenovo Tab P11 (2021)", model: "TB-J606F", androidVersion: "11", width: 800, height: 1280, deviceScaleFactor: 2 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Z Flip3 (2021)", model: "SM-F711B", androidVersion: "11", width: 360, height: 760, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Tab S8 (2022)", model: "SM-X700", androidVersion: "12", width: 800, height: 1280, deviceScaleFactor: 2 },
  { manufacturer: "ASUS", label: "ASUS ROG Phone 6 (2022)", model: "ASUS_AI2201", androidVersion: "12", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Xiaomi", label: "Xiaomi Pad 6 (2023)", model: "Xiaomi Pad 6", androidVersion: "13", width: 900, height: 1440, deviceScaleFactor: 2 },
  { manufacturer: "Ulefone", label: "Ulefone Armor 23 Ultra (2023)", model: "Armor 23 Ultra", androidVersion: "13", width: 393, height: 851, deviceScaleFactor: 2.75 },
  { manufacturer: "ZTE", label: "nubia RedMagic 9 Pro (2024)", model: "NX769J", androidVersion: "14", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "OnePlus", label: "OnePlus Pad 2 (2024)", model: "OPD2404", androidVersion: "14", width: 900, height: 1440, deviceScaleFactor: 2 },
  { manufacturer: "ZTE", label: "nubia RedMagic 10 Pro (2025)", model: "NX789J", androidVersion: "15", width: 412, height: 915, deviceScaleFactor: 3 },
  { manufacturer: "Samsung", label: "Samsung Galaxy Tab S10 Ultra (2025)", model: "SM-X926B", androidVersion: "15", width: 944, height: 1600, deviceScaleFactor: 2 }
];

export const DEVICES = RAW_DEVICES.map((device) => {
  const year = device.year || inferYear(device.label);
  const deviceType = device.deviceType || inferDeviceType(device.label);
  return {
    ...device,
    year,
    deviceType,
    id: slugify(device.label),
    userAgent: buildUserAgent(device.androidVersion, device.model),
    platformVersion: toPlatformVersion(device.androidVersion)
  };
}).sort((a, b) => a.year - b.year || a.label.localeCompare(b.label));

export const DEVICE_COUNT = DEVICES.length;

export const DEVICES_BY_ID = DEVICES.reduce((acc, device) => {
  acc[device.id] = device;
  return acc;
}, {});

export const DEVICES_BY_YEAR = DEVICES.reduce((acc, device) => {
  if (!acc[device.year]) acc[device.year] = [];
  acc[device.year].push(device);
  return acc;
}, {});
