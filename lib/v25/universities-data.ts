/** České lékařské fakulty — statický katalog + slug mapování */
export type CzMedicalFaculty = {
  slug: string;
  name: string;
  shortName: string;
  url: string;
  city: string;
};

export const CZ_MEDICAL_FACULTIES: CzMedicalFaculty[] = [
  { slug: "lf-uk-1", name: "1. lékařská fakulta UK", shortName: "1. LF UK", url: "https://www.lf1.cuni.cz", city: "Praha" },
  { slug: "lf-uk-2", name: "2. lékařská fakulta UK", shortName: "2. LF UK", url: "https://www.lf2.cuni.cz", city: "Praha" },
  { slug: "lf-uk-3", name: "3. lékařská fakulta UK", shortName: "3. LF UK", url: "https://www.lf3.cuni.cz", city: "Plzeň" },
  { slug: "lf-mu", name: "Lékařská fakulta MU", shortName: "LF MU", url: "https://www.med.muni.cz", city: "Brno" },
  { slug: "lf-up", name: "Lékařská fakulta UP", shortName: "LF UP", url: "https://www.lf.upol.cz", city: "Olomouc" },
  { slug: "lf-os", name: "Lékařská fakulta Ostravské univerzity", shortName: "LF OU", url: "https://www.osu.cz/lf", city: "Ostrava" },
  { slug: "lf-plzen", name: "Lékařská fakulta v Plzni UK", shortName: "LF Plzeň", url: "https://www.lfp.cuni.cz", city: "Plzeň" },
  { slug: "lf-hk", name: "Lékařská fakulta v Hradci Králové UK", shortName: "LF HK", url: "https://www.lfhk.cuni.cz", city: "Hradec Králové" },
];

export function getFacultyBySlug(slug: string) {
  return CZ_MEDICAL_FACULTIES.find((f) => f.slug === slug) ?? null;
}
