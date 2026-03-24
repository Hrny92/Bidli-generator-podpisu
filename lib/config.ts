// ============================================================
//  KONFIGURACE GENERÁTORU PODPISŮ
//  Upravte tento soubor podle potřeby.
// ============================================================

export type Division = {
  id: string
  label: string
  color: string
  /** Přepíše logo (pro BIG divize). Musí být název souboru v public/images/ */
  logoOverride?: string
  companies: string[]
  /** true = skryje výběr odznaků (Specialista / Patriot / EC) */
  hideBadges?: boolean
}

// ------------------------------------------------------------
// DIVIZE — barvy a přiřazené firmy
// ------------------------------------------------------------
export const DIVISIONS: Division[] = [
  {
    id: 'reality',
    label: 'Reality, development',
    color: '#EF8625',
    companies: [
      'BIDLI reality, a. s.',
    ],
  },
  {
    id: 'finance',
    label: 'Finance, investice',
    color: '#3FB1E1',
    companies: [
      'BIDLI finance a poradenství, s.r.o.',
      'BIDLI poradenství BT, s.r.o.',
      'BIDLI finance, a.s.',
    ],
  },
  {
    id: 'energie',
    label: 'Energie, technologie',
    color: '#39B07B',
    companies: [
      'BIDLI energie, a. s.',
      'BIDLI technologie, a.s.',
    ],
  },
  {
    id: 'holding',
    label: 'Holding',
    color: '#142F4C',
    companies: [
      'BIDLI holding, a. s.',
    ],
  },
  {
    id: 'biginvest',
    label: 'BIG Invest',
    color: '#000000',
    logoOverride: 'BIG-Invest@300x.png',
    hideBadges: true,
    companies: [
      'B.I.G. Invest, o.c.p., a.s.',
    ],
  },
  {
    id: 'bigcapital',
    label: 'BIG Capital',
    color: '#000000',
    logoOverride: 'BIG-Capital@300x.png',
    hideBadges: true,
    companies: [
      'B.I.G. Capital, a.s.',
    ],
  },
]

// ------------------------------------------------------------
// POZICE — předvolené možnosti v selectu
// ------------------------------------------------------------
export const POSITIONS: string[] = [
  'Realitní makléř',
  'Finanční poradce',
  'Investiční specialista',
  'Energetický specialista',
  'Konzultant technologií',
  'Vedoucí obchodní skupiny',
  'Teamleader',
  'Manažer obchodního týmu',
  'Oblastní manažer',
  'Regionální manažer',
  'Regionální ředitel',
  'Zemský manažer',
  'Zemský ředitel',
  'Regionální manažer holdingu',
  'Obchodní ředitel holdingu',
  'Regionální ředitel holdingu',
  'Divizní ředitel',
  'Regionální specialistka',
]

// ------------------------------------------------------------
// POBOČKY — label zobrazený v selectu + adresa v podpisu
// ------------------------------------------------------------
export const BRANCHES: { label: string; address: string }[] = [
  { label: 'Brno',                    address: 'Londýnské nám. 853/1, 639 00 Brno'                              },
  { label: 'České Budějovice',        address: 'Pražská tř. 1813/3, 370 01 České Budějovice'                   },
  { label: 'Chomutov',                address: 'Palackého 3995, 430 04 Chomutov'                               },
  { label: 'Hradec Králové',          address: 'Chelčického 967/10, 500 02 Hradec Králové'                     },
  { label: 'Jeseník',                 address: 'Poštovní ul. 1331/1a, 790 01 Jeseník'                          },
  { label: 'Kladno',                  address: 'ul. Komenského čp. 404, 272 01 Kladno'                         },
  { label: 'Kolín',                   address: 'Karlovo náměstí 72, 280 02 Kolín'                              },
  { label: 'Liberec',                 address: 'Soukenné nám. 23/10, 460 07 Liberec III'                       },
  { label: 'Litoměřice',              address: 'Dlouhá č. p. 180, Litoměřice'                                  },
  { label: 'Mohelnice',               address: 'nám. Tyrše a Fügnera 194/1, 789 85 Mohelnice'                  },
  { label: 'Most',                    address: 'Jaroslava Průchy 1682/1, 434 01 Most'                          },
  { label: 'Nový Jičín',              address: 'Štefánikova 2086/12, 741 01 Nový Jičín'                        },
  { label: 'Olomouc',                 address: 'Hodolanská 611/35, 779 00 Olomouc'                             },
  { label: 'Opava',                   address: 'náměstí Svaté Hedviky 2680/9, 746 01 Opava'                    },
  { label: 'Ostrava',                 address: 'Novoveská 2056/5i, 709 00 Ostrava'                             },
  { label: 'Pardubice',               address: '17. listopadu 400, 530 02 Pardubice'                           },
  { label: 'Plzeň',                   address: 'Nepomucká 1327/133a, 326 00 Plzeň'                             },
  { label: 'Praha',                   address: 'Jindřišská 889/17, 110 00 Praha 1'                             },
  { label: 'Přerov',                  address: 'Lipnická 535, 750 02 Přerov'                                   },
  { label: 'Rožnov pod Radhoštěm',   address: 'Bučiska 621, 756 61 Rožnov pod Radhoštěm'                      },
  { label: 'Teplice',                 address: 'U Nádraží 902/8, 415 01 Teplice'                               },
  { label: 'Ústí nad Labem',          address: 'Dlouhá 3458, 400 01 Ústí nad Labem'                            },
  { label: 'Vestec',                  address: 'Vídeňská 400, 252 42 Vestec'                                   },
  { label: 'Zlín',                    address: 'Zahradní 1215, 763 02 Zlín'                                    },
  { label: 'Znojmo',                  address: 'nám. Armády 1033/14, 669 02 Znojmo'                            },
]

// ------------------------------------------------------------
// POVOLENÉ E-MAILOVÉ DOMÉNY
// ------------------------------------------------------------
export const EMAIL_DOMAINS: string[] = [
  '@bidli.cz',
  '@bigcapital.cz',
  '@biginvest.cz',
  '@biginvest.sk',
]

// ------------------------------------------------------------
// TEXT DISCLAIMER (zobrazuje se pod logem)
// ------------------------------------------------------------
export const DISCLAIMER =
  'Tento e-mail a k němu připojené dokumenty mohou být důvěrné a jsou určeny pouze jeho adresátům. Nejste-li adresátem, informujte laskavě neprodleně jeho odesílatele, obsah i s přílohami a kopiemi vymažte ze svého systému a e-mail nerozšiřujte, nekopírujte, nezveřejňujte ani jinak neužívejte.'

// ------------------------------------------------------------
// LOGO LOGIC — výběr obrázku podle odznaků
// Soubory musí být v public/images/
// ------------------------------------------------------------
export function getLogo(
  division: Division,
  isSpecialist: boolean,
  isPatriot: boolean,
  isEC: boolean,
): string {
  // BIG divize mají fixní logo
  if (division.logoOverride) return `/images/${division.logoOverride}`

  // Kombinace odznaků → soubor
  // Všechny tři
  if (isSpecialist && isPatriot && isEC)  return '/images/Bidli-ABC.png'
  // Dvojice
  if (isSpecialist && isPatriot && !isEC) return '/images/Bidli-AB.png'   // ⚠️ soubor Bidli-AB.png musí být v public/images/
  if (isSpecialist && !isPatriot && isEC) return '/images/Bidli-AC.png'   // ⚠️ soubor Bidli-AC.png musí být v public/images/
  if (!isSpecialist && isPatriot && isEC) return '/images/Bidli-BC.png'
  // Jednotlivé
  if (isSpecialist && !isPatriot && !isEC) return '/images/Bidli-A.png'
  if (!isSpecialist && isPatriot && !isEC) return '/images/Bidli-B.png'
  if (!isSpecialist && !isPatriot && isEC) return '/images/Bidli-C.png'

  // Žádné odznaky
  return '/images/Bidli.png'
}
