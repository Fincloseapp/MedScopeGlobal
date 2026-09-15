import { GLOBAL_LOCALES, getLocaleConfig, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { hostnameFromWebsite, SALES_ICP_SEEDS } from "@/lib/sales/icp";
import {
  domainMatchesWebsite,
  isPersonalMailbox,
  isRoleBasedEmail,
  normalizeSalesEmail,
} from "@/lib/sales/legal";
import type { SalesIcpSector } from "@/lib/sales/types";

export type CampaignSeed = {
  locale: GlobalLocaleCode;
  country: string;
  company: string;
  website: string;
  sector: SalesIcpSector;
  role: string;
  email: string;
};

/** locale, ISO country, company, website, sector, role local-part */
type RawSeed = [GlobalLocaleCode, string, string, string, SalesIcpSector, string];

const EXTRA: RawSeed[] = [
  ["cs", "CZ", "Fakultní nemocnice Motol", "https://www.fnmotol.cz", "clinic", "info"],
  ["cs", "CZ", "IKEM", "https://www.ikem.cz", "clinic", "info"],
  ["cs", "CZ", "Nemocnice Na Homolce", "https://www.homolka.cz", "clinic", "info"],
  ["cs", "CZ", "Všeobecná fakultní nemocnice", "https://www.vfn.cz", "clinic", "info"],
  ["cs", "CZ", "FN Brno", "https://www.fnbrno.cz", "clinic", "info"],
  ["cs", "CZ", "FN Olomouc", "https://www.fnol.cz", "clinic", "info"],
  ["cs", "CZ", "Fakultní nemocnice Ostrava", "https://www.fno.cz", "clinic", "info"],
  ["cs", "CZ", "Medicover Czech", "https://www.medicover.cz", "clinic", "info"],
  ["cs", "CZ", "Pronatal", "https://www.pronatal.cz", "clinic", "info"],
  ["cs", "CZ", "Iscare", "https://www.iscare.cz", "clinic", "info"],
  ["cs", "CZ", "BTL Industries", "https://www.btlnet.com", "medtech", "marketing"],
  ["cs", "CZ", "Contipro", "https://www.contipro.com", "pharma_otc", "info"],
  ["cs", "CZ", "Ella-CS", "https://www.ellacs.eu", "medtech", "info"],
  ["cs", "CZ", "Hartmann-Rico", "https://www.hartmann.info", "medtech", "info"],
  ["cs", "CZ", "Teva Czech", "https://www.teva.cz", "pharma_rx", "media"],
  ["cs", "CZ", "Sanofi Czech", "https://www.sanofi.cz", "pharma_rx", "media"],
  ["cs", "CZ", "Pfizer Czech", "https://www.pfizer.cz", "pharma_rx", "media"],
  ["cs", "CZ", "Novartis Czech", "https://www.novartis.cz", "pharma_rx", "media"],
  ["cs", "CZ", "MojeLékárna", "https://www.mojelekarna.cz", "pharmacy", "info"],
  ["sk", "SK", "Univerzitná nemocnica Bratislava", "https://www.unb.sk", "clinic", "info"],
  ["sk", "SK", "Národný ústav srdcových a cievnych chorôb", "https://www.nusch.sk", "clinic", "info"],
  ["sk", "SK", "Svet zdravia", "https://www.svetzdravia.com", "clinic", "info"],
  ["sk", "SK", "ProCare", "https://www.procare.sk", "clinic", "info"],
  ["sk", "SK", "Penta Hospitals Slovakia", "https://www.pentahospitals.sk", "clinic", "info"],
  ["sk", "SK", "Unilabs Slovensko", "https://www.unilabs.sk", "lab", "info"],
  ["sk", "SK", "Dr. Max Slovensko", "https://www.drmax.sk", "pharmacy", "marketing"],
  ["sk", "SK", "Benu Slovensko", "https://www.benu.sk", "pharmacy", "info"],
  ["sk", "SK", "Pilulka Slovensko", "https://www.pilulka.sk", "pharmacy", "marketing"],
  ["sk", "SK", "Saneca Pharmaceuticals", "https://www.saneca.com", "pharma_rx", "info"],
  ["sk", "SK", "HARTMANN-RICO SK", "https://www.hartmann.sk", "medtech", "info"],
  ["sk", "SK", "B. Braun Slovakia", "https://www.bbraun.sk", "medtech", "info"],
  ["sk", "SK", "Medirex", "https://www.medirex.sk", "lab", "info"],
  ["sk", "SK", "Synlab Slovensko", "https://www.synlab.sk", "lab", "info"],
  ["sk", "SK", "Affidea Slovensko", "https://www.affidea.sk", "diagnostics", "info"],
  ["pl", "PL", "Lux Med", "https://www.luxmed.pl", "clinic", "info"],
  ["pl", "PL", "Medicover Polska", "https://www.medicover.pl", "clinic", "info"],
  ["pl", "PL", "NEUCA", "https://www.neuca.pl", "pharmacy", "info"],
  ["pl", "PL", "Pelion", "https://www.pelion.eu", "pharmacy", "info"],
  ["pl", "PL", "DOZ", "https://www.doz.pl", "pharmacy", "marketing"],
  ["pl", "PL", "Polpharma", "https://www.polpharma.pl", "pharma_rx", "media"],
  ["pl", "PL", "Adamed", "https://www.adamed.com", "pharma_rx", "info"],
  ["pl", "PL", "Aflofarm", "https://www.aflofarm.com.pl", "pharma_otc", "info"],
  ["pl", "PL", "Synevo Polska", "https://www.synevo.pl", "lab", "info"],
  ["pl", "PL", "Diagnostyka", "https://www.diag.pl", "lab", "info"],
  ["pl", "PL", "American Heart of Poland", "https://www.ahop.pl", "clinic", "info"],
  ["pl", "PL", "Scanmed", "https://www.scanmed.pl", "clinic", "info"],
  ["pl", "PL", "Enel-Med", "https://www.enel.pl", "clinic", "info"],
  ["pl", "PL", "Gemini", "https://www.gemini.pl", "pharmacy", "info"],
  ["pl", "PL", "Super-Pharm Polska", "https://www.superpharm.pl", "pharmacy", "info"],
  ["de", "DE", "Fresenius", "https://www.fresenius.com", "medtech", "info"],
  ["de", "DE", "B. Braun SE", "https://www.bbraun.com", "medtech", "info"],
  ["de", "DE", "Otto Bock", "https://www.ottobock.com", "medtech", "info"],
  ["de", "DE", "Asklepios Kliniken", "https://www.asklepios.com", "clinic", "info"],
  ["de", "DE", "Helios Kliniken", "https://www.helios-gesundheit.de", "clinic", "info"],
  ["de", "DE", "Rhön-Klinikum", "https://www.rhoen-klinikum-ag.com", "clinic", "info"],
  ["de", "DE", "Sana Kliniken", "https://www.sana.de", "clinic", "info"],
  ["de", "DE", "Medios AG", "https://www.medios.ag", "pharmacy", "info"],
  ["de", "DE", "DocMorris", "https://www.docmorris.de", "pharmacy", "info"],
  ["de", "DE", "Shop Apotheke", "https://www.shop-apotheke.com", "pharmacy", "info"],
  ["de", "DE", "Synlab Germany", "https://www.synlab.de", "lab", "info"],
  ["de", "DE", "Limbach Gruppe", "https://www.limbachgruppe.com", "lab", "info"],
  ["de", "DE", "Carl Zeiss Meditec", "https://www.zeiss.com", "medtech", "info"],
  ["de", "DE", "Drägerwerk", "https://www.draeger.com", "medtech", "info"],
  ["de", "DE", "Eckert & Ziegler", "https://www.ezag.com", "medtech", "info"],
  ["fr", "FR", "Sanofi", "https://www.sanofi.com", "pharma_rx", "media"],
  ["fr", "FR", "bioMérieux", "https://www.biomerieux.com", "diagnostics", "info"],
  ["fr", "FR", "Ramsay Santé", "https://www.ramsaygds.fr", "clinic", "info"],
  ["fr", "FR", "Elsan", "https://www.elsan.care", "clinic", "info"],
  ["fr", "FR", "Pierre Fabre", "https://www.pierre-fabre.com", "pharma_otc", "info"],
  ["fr", "FR", "Servier", "https://www.servier.com", "pharma_rx", "media"],
  ["fr", "FR", "Ipsen", "https://www.ipsen.com", "pharma_rx", "media"],
  ["fr", "FR", "Vivalto Santé", "https://www.vivalto-sante.com", "clinic", "info"],
  ["fr", "FR", "Doctolib", "https://www.doctolib.fr", "digital_health", "press"],
  ["fr", "FR", "Cerba HealthCare", "https://www.cerbahealthcare.com", "lab", "info"],
  ["fr", "FR", "Biogroup", "https://www.biogroup.fr", "lab", "info"],
  ["fr", "FR", "Urgo Medical", "https://www.urgo.com", "medtech", "info"],
  ["fr", "FR", "Air Liquide Healthcare", "https://www.airliquide.com", "medtech", "media"],
  ["fr", "FR", "UCB", "https://www.ucb.com", "pharma_rx", "media"],
  ["fr", "FR", "Agfa HealthCare", "https://www.agfa.com", "digital_health", "info"],
  ["it", "IT", "Bracco", "https://www.bracco.com", "diagnostics", "info"],
  ["it", "IT", "Recordati", "https://www.recordati.com", "pharma_rx", "media"],
  ["it", "IT", "Menarini", "https://www.menarini.com", "pharma_rx", "media"],
  ["it", "IT", "Humanitas", "https://www.humanitas.it", "clinic", "info"],
  ["it", "IT", "Gruppo San Donato", "https://www.gsd.it", "clinic", "info"],
  ["it", "IT", "Diasorin", "https://www.diasorin.com", "diagnostics", "info"],
  ["it", "IT", "Sorin / LivaNova IT", "https://www.livanova.com", "medtech", "info"],
  ["it", "IT", "Amplifon", "https://www.amplifon.com", "clinic", "info"],
  ["it", "IT", "Angelini Pharma", "https://www.angelinipharma.com", "pharma_rx", "media"],
  ["it", "IT", "Chiesi", "https://www.chiesi.com", "pharma_rx", "media"],
  ["it", "IT", "Dompé", "https://www.dompe.com", "pharma_rx", "info"],
  ["it", "IT", "Istituto Auxologico", "https://www.auxologico.it", "clinic", "info"],
  ["it", "IT", "Synlab Italia", "https://www.synlab.it", "lab", "info"],
  ["it", "IT", "Centro Diagnostico Italiano", "https://www.cdi.it", "lab", "info"],
  ["es", "ES", "Grifols", "https://www.grifols.com", "pharma_rx", "media"],
  ["es", "ES", "Quirónsalud", "https://www.quironsalud.es", "clinic", "info"],
  ["es", "ES", "HM Hospitales", "https://www.hmhospitales.com", "clinic", "info"],
  ["es", "ES", "Vithas", "https://www.vithas.es", "clinic", "info"],
  ["es", "ES", "Cinfa", "https://www.cinfa.com", "pharma_otc", "info"],
  ["es", "ES", "Esteve", "https://www.esteve.com", "pharma_rx", "info"],
  ["es", "ES", "Almirall", "https://www.almirall.com", "pharma_rx", "media"],
  ["es", "ES", "Rovi", "https://www.rovi.es", "pharma_rx", "info"],
  ["es", "ES", "Farmasierra", "https://www.farmasierra.com", "pharma_otc", "info"],
  ["es", "ES", "Adeslas", "https://www.adeslas.es", "insurance", "info"],
  ["es", "ES", "Sanitas", "https://www.sanitas.es", "clinic", "info"],
  ["es", "ES", "Laboratorios Ordesa", "https://www.ordesa.es", "pharma_otc", "info"],
  ["es", "ES", "Werfen", "https://www.werfen.com", "diagnostics", "info"],
  ["es", "ES", "Echevarne", "https://www.echevarne.com", "lab", "info"],
  ["pt", "PT", "José de Mello Saúde", "https://www.josedemellosaude.pt", "clinic", "info"],
  ["pt", "PT", "CUF", "https://www.cuf.pt", "clinic", "info"],
  ["pt", "PT", "Lusíadas Saúde", "https://www.lusiadas.pt", "clinic", "info"],
  ["pt", "PT", "BIAL", "https://www.bial.com", "pharma_rx", "info"],
  ["pt", "PT", "Tecnimede", "https://www.tecnimede.com", "pharma_rx", "info"],
  ["pt", "PT", "Bluepharma", "https://www.bluepharma.pt", "pharma_rx", "info"],
  ["pt", "PT", "Hovione", "https://www.hovione.com", "pharma_rx", "info"],
  ["pt", "PT", "Unilabs Portugal", "https://www.unilabs.pt", "lab", "info"],
  ["pt", "PT", "Joaquim Chaves Saúde", "https://www.jcs.pt", "lab", "info"],
  ["pt", "PT", "Wells", "https://www.wells.pt", "pharmacy", "info"],
  ["pt", "PT", "Farmácia Portuguesa", "https://www.farmaciasportuguesas.pt", "pharmacy", "info"],
  ["pt-BR", "BR", "Fleury", "https://www.fleury.com.br", "lab", "info"],
  ["pt-BR", "BR", "Dasa", "https://www.dasa.com.br", "lab", "info"],
  ["pt-BR", "BR", "Hapvida", "https://www.hapvida.com.br", "clinic", "info"],
  ["pt-BR", "BR", "NotreDame Intermédica", "https://www.gndi.com.br", "clinic", "info"],
  ["pt-BR", "BR", "Eurofarma", "https://www.eurofarma.com.br", "pharma_rx", "info"],
  ["pt-BR", "BR", "Aché", "https://www.ache.com.br", "pharma_rx", "info"],
  ["pt-BR", "BR", "EMS", "https://www.ems.com.br", "pharma_rx", "info"],
  ["pt-BR", "BR", "Hypera", "https://www.hypera.com.br", "pharma_otc", "info"],
  ["pt-BR", "BR", "Drogasil / RD", "https://www.rd.com.br", "pharmacy", "info"],
  ["pt-BR", "BR", "RaiaDrogasil", "https://www.raiadrogasil.com.br", "pharmacy", "info"],
  ["pt-BR", "BR", "Hospital Albert Einstein", "https://www.einstein.br", "clinic", "info"],
  ["pt-BR", "BR", "Hospital Sírio-Libanês", "https://www.hospitalsiriolibanes.org.br", "clinic", "info"],
  ["pt-BR", "BR", "Oncoclínicas", "https://www.grupooncoclinicas.com", "clinic", "info"],
  ["ro", "RO", "MedLife", "https://www.medlife.ro", "clinic", "info"],
  ["ro", "RO", "Regina Maria", "https://www.reginamaria.ro", "clinic", "info"],
  ["ro", "RO", "Sanador", "https://www.sanador.ro", "clinic", "info"],
  ["ro", "RO", "Antibiotice Iași", "https://www.antibiotice.ro", "pharma_rx", "info"],
  ["ro", "RO", "Terapia", "https://www.terapia.ro", "pharma_rx", "info"],
  ["ro", "RO", "Zentiva România", "https://www.zentiva.ro", "pharma_rx", "media"],
  ["ro", "RO", "Synevo România", "https://www.synevo.ro", "lab", "info"],
  ["ro", "RO", "Catena", "https://www.catena.ro", "pharmacy", "info"],
  ["ro", "RO", "Help Net", "https://www.helpnet.ro", "pharmacy", "info"],
  ["ro", "RO", "Sensiblu", "https://www.sensiblu.com", "pharmacy", "info"],
  ["ro", "RO", "Phoenix România", "https://www.phoenix.ro", "pharmacy", "info"],
  ["hu", "HU", "Richter Gedeon", "https://www.gedeonrichter.com", "pharma_rx", "media"],
  ["hu", "HU", "Egis", "https://www.egis.hu", "pharma_rx", "info"],
  ["hu", "HU", "Medicover Hungary", "https://www.medicover.hu", "clinic", "info"],
  ["hu", "HU", "Affidea Hungary", "https://www.affidea.hu", "diagnostics", "info"],
  ["hu", "HU", "Synlab Hungary", "https://www.synlab.hu", "lab", "info"],
  ["hu", "HU", "Béres Gyógyszergyár", "https://www.beres.hu", "pharma_otc", "info"],
  ["hu", "HU", "ALKALOID", "https://www.alkaloid.com.mk", "pharma_otc", "info"],
  ["hu", "HU", "Patika Plus", "https://www.patikaplus.hu", "pharmacy", "info"],
  ["hu", "HU", "BENU Magyarország", "https://www.benu.hu", "pharmacy", "info"],
  ["hu", "HU", "Semmelweis Klinikai Központ", "https://semmelweis.hu", "clinic", "info"],
  ["hu", "HU", "Szent Imre Kórház", "https://www.szentimrekorhaz.hu", "clinic", "info"],
  ["ru", "RU", "Invitro", "https://www.invitro.ru", "lab", "info"],
  ["ru", "RU", "Gemotest", "https://www.gemotest.ru", "lab", "info"],
  ["ru", "RU", "Helix", "https://www.helix.ru", "lab", "info"],
  ["ru", "RU", "R-Pharm", "https://www.r-pharm.com", "pharma_rx", "info"],
  ["ru", "RU", "Pharmstandard", "https://www.pharmstd.com", "pharma_rx", "info"],
  ["ru", "RU", "Biocad", "https://www.biocad.ru", "pharma_rx", "info"],
  ["ru", "RU", "Geropharm", "https://www.geropharm.com", "pharma_rx", "info"],
  ["ru", "RU", "Medsi", "https://www.medsi.ru", "clinic", "info"],
  ["ru", "RU", "European Medical Center", "https://www.emcmos.ru", "clinic", "info"],
  ["ru", "RU", "Mother and Child", "https://www.mamako.ru", "clinic", "info"],
  ["uk", "UA", "Darnitsa", "https://www.darnitsa.ua", "pharma_rx", "info"],
  ["uk", "UA", "Farmak", "https://farmak.ua", "pharma_rx", "info"],
  ["uk", "UA", "Arterium", "https://www.arterium.ua", "pharma_rx", "info"],
  ["uk", "UA", "Dobrobut", "https://www.dobrobut.com", "clinic", "info"],
  ["uk", "UA", "Boris", "https://www.boris.kiev.ua", "clinic", "info"],
  ["uk", "UA", "Synevo Ukraine", "https://www.synevo.ua", "lab", "info"],
  ["uk", "UA", "Esculab", "https://esculab.com", "lab", "info"],
  ["uk", "UA", "Apteka 911", "https://apteka911.ua", "pharmacy", "info"],
  ["uk", "UA", "ANC", "https://anc.ua", "pharmacy", "info"],
  ["uk", "UA", "Oxford Medical", "https://www.oxford-med.com.ua", "clinic", "info"],
  ["be", "BY", "Belmedpreparaty", "https://www.belmedpreparaty.com", "pharma_rx", "info"],
  ["be", "BY", "Lekpharm", "https://www.lekpharm.by", "pharma_rx", "info"],
  ["be", "BY", "Nativita", "https://www.nativita.by", "pharma_otc", "info"],
  ["be", "BY", "Synesis Health", "https://synesis.by", "digital_health", "info"],
  ["be", "BY", "Invitro Belarus", "https://www.invitro.by", "lab", "info"],
  ["be", "BY", "Synevo Belarus", "https://www.synevo.by", "lab", "info"],
  ["zh-CN", "CN", "Mindray", "https://www.mindray.com", "medtech", "info"],
  ["zh-CN", "CN", "Fosun Pharma", "https://www.fosunpharma.com", "pharma_rx", "info"],
  ["zh-CN", "CN", "WuXi Biologics", "https://www.wuxibiologics.com", "pharma_rx", "info"],
  ["zh-CN", "CN", "MicroPort", "https://www.microport.com", "medtech", "info"],
  ["zh-CN", "CN", "United Imaging", "https://www.united-imaging.com", "medtech", "info"],
  ["zh-CN", "CN", "CSPC", "https://www.cspc.com.hk", "pharma_rx", "info"],
  ["zh-CN", "CN", "Sino Biopharm", "https://www.sinobiopharm.com", "pharma_rx", "info"],
  ["zh-CN", "CN", "Hansoh", "https://www.hspharm.com", "pharma_rx", "info"],
  ["zh-CN", "CN", "Ali Health", "https://www.alihealth.cn", "digital_health", "info"],
  ["zh-CN", "CN", "Ping An Good Doctor", "https://www.pagd.net", "digital_health", "info"],
  ["ja", "JP", "Terumo", "https://www.terumo.com", "medtech", "info"],
  ["ja", "JP", "Olympus", "https://www.olympus-global.com", "medtech", "info"],
  ["ja", "JP", "Sysmex", "https://www.sysmex.co.jp", "diagnostics", "info"],
  ["ja", "JP", "Nihon Kohden", "https://www.nihonkohden.com", "medtech", "info"],
  ["ja", "JP", "Takeda", "https://www.takeda.com", "pharma_rx", "media"],
  ["ja", "JP", "Astellas", "https://www.astellas.com", "pharma_rx", "media"],
  ["ja", "JP", "Daiichi Sankyo", "https://www.daiichisankyo.com", "pharma_rx", "media"],
  ["ja", "JP", "Chugai", "https://www.chugai-pharm.co.jp", "pharma_rx", "info"],
  ["ja", "JP", "Eisai", "https://www.eisai.com", "pharma_rx", "media"],
  ["ja", "JP", "Otsuka", "https://www.otsuka.co.jp", "pharma_rx", "info"],
  ["ja", "JP", "Fujifilm Healthcare", "https://www.fujifilm.com", "medtech", "info"],
  ["ko", "KR", "Samsung Medison", "https://www.samsungmedison.com", "medtech", "info"],
  ["ko", "KR", "Celltrion", "https://www.celltrion.com", "pharma_rx", "info"],
  ["ko", "KR", "Seegene", "https://www.seegene.com", "diagnostics", "info"],
  ["ko", "KR", "Osstem Implant", "https://www.osstem.com", "medtech", "info"],
  ["ko", "KR", "Yuhan", "https://www.yuhan.co.kr", "pharma_rx", "info"],
  ["ko", "KR", "Hanmi", "https://www.hanmipharm.com", "pharma_rx", "info"],
  ["ko", "KR", "GC Biopharma", "https://www.greencross.com", "pharma_rx", "info"],
  ["ko", "KR", "VUNO", "https://www.vuno.co", "digital_health", "info"],
  ["ko", "KR", "Lunit", "https://www.lunit.io", "digital_health", "info"],
  ["ko", "KR", "Hugel", "https://www.hugel.co.kr", "medtech", "info"],
  ["vi", "VN", "Vinmec", "https://www.vinmec.com", "clinic", "info"],
  ["vi", "VN", "Hoàn Mỹ", "https://www.hoanmy.com", "clinic", "info"],
  ["vi", "VN", "DHG Pharma", "https://www.dhgpharma.com.vn", "pharma_rx", "info"],
  ["vi", "VN", "Traphaco", "https://www.traphaco.com.vn", "pharma_otc", "info"],
  ["vi", "VN", "Imexpharm", "https://www.imexpharm.com", "pharma_rx", "info"],
  ["vi", "VN", "FPT Long Châu", "https://nhathuoclongchau.com.vn", "pharmacy", "info"],
  ["vi", "VN", "Pharmacity", "https://www.pharmacity.vn", "pharmacy", "info"],
  ["vi", "VN", "Medlatec", "https://medlatec.vn", "lab", "info"],
  ["vi", "VN", "FV Hospital", "https://www.fvhospital.com", "clinic", "info"],
  ["id", "ID", "Kalbe Farma", "https://www.kalbe.co.id", "pharma_rx", "info"],
  ["id", "ID", "Kimia Farma", "https://www.kimiafarma.co.id", "pharmacy", "info"],
  ["id", "ID", "Siloam Hospitals", "https://www.siloamhospitals.com", "clinic", "info"],
  ["id", "ID", "Dexa Medica", "https://www.dexamedica.com", "pharma_rx", "info"],
  ["id", "ID", "Sido Muncul", "https://www.sidomuncul.co.id", "pharma_otc", "info"],
  ["id", "ID", "Tempo Scan Pacific", "https://www.temposcan.co.id", "pharma_otc", "info"],
  ["id", "ID", "Mitra Keluarga", "https://www.mitrakeluarga.com", "clinic", "info"],
  ["id", "ID", "Prodia", "https://www.prodia.co.id", "lab", "info"],
  ["id", "ID", "Halodoc", "https://www.halodoc.com", "digital_health", "info"],
  ["en", "INT", "Medtronic", "https://www.medtronic.com", "medtech", "info"],
  ["en", "INT", "Abbott", "https://www.abbott.com", "medtech", "info"],
  ["en", "INT", "Boston Scientific", "https://www.bostonscientific.com", "medtech", "info"],
  ["en", "INT", "Stryker", "https://www.stryker.com", "medtech", "info"],
  ["en", "INT", "Zimmer Biomet", "https://www.zimmerbiomet.com", "medtech", "info"],
  ["en", "INT", "Baxter", "https://www.baxter.com", "medtech", "info"],
  ["en", "INT", "Becton Dickinson", "https://www.bd.com", "medtech", "info"],
  ["en", "INT", "IQVIA", "https://www.iqvia.com", "digital_health", "media"],
  ["en", "INT", "GE HealthCare", "https://www.gehealthcare.com", "medtech", "info"],
  ["en", "INT", "Philips Health", "https://www.philips.com", "medtech", "info"],
  ["en-US", "US", "HCA Healthcare", "https://www.hcahealthcare.com", "clinic", "info"],
  ["en-US", "US", "Labcorp", "https://www.labcorp.com", "lab", "info"],
  ["en-US", "US", "Quest Diagnostics", "https://www.questdiagnostics.com", "lab", "info"],
  ["en-US", "US", "CVS Health", "https://www.cvshealth.com", "pharmacy", "info"],
  ["en-US", "US", "Walgreens Boots Alliance", "https://www.walgreensbootsalliance.com", "pharmacy", "media"],
  ["en-US", "US", "Teladoc Health", "https://www.teladochealth.com", "digital_health", "media"],
  ["en-US", "US", "Cardinal Health", "https://www.cardinalhealth.com", "pharmacy", "info"],
  ["en-US", "US", "McKesson", "https://www.mckesson.com", "pharmacy", "info"],
  ["en-US", "US", "Thermo Fisher Scientific", "https://www.thermofisher.com", "diagnostics", "info"],
  ["en-US", "US", "Illumina", "https://www.illumina.com", "diagnostics", "info"],
  ["en-UK", "GB", "GSK", "https://www.gsk.com", "pharma_rx", "media"],
  ["en-UK", "GB", "AstraZeneca", "https://www.astrazeneca.com", "pharma_rx", "media"],
  ["en-UK", "GB", "Smith+Nephew", "https://www.smith-nephew.com", "medtech", "info"],
  ["en-UK", "GB", "Convatec", "https://www.convatec.com", "medtech", "info"],
  ["en-UK", "GB", "Nuffield Health", "https://www.nuffieldhealth.com", "clinic", "info"],
  ["en-UK", "GB", "Spire Healthcare", "https://www.spirehealthcare.com", "clinic", "info"],
  ["en-UK", "GB", "Bupa", "https://www.bupa.co.uk", "insurance", "info"],
  ["en-UK", "GB", "Boots", "https://www.boots.com", "pharmacy", "info"],
  ["en-UK", "GB", "Haleon", "https://www.haleon.com", "pharma_otc", "media"],
  ["en-UK", "GB", "Oxford Biomedica", "https://www.oxb.com", "pharma_rx", "info"],
];

function roleFromSuggested(suggested: string): string {
  return suggested.replace(/@$/u, "").trim().toLowerCase();
}

function rawFromIcp(): RawSeed[] {
  return SALES_ICP_SEEDS.map((seed) => [
    "cs",
    seed.country,
    seed.company,
    seed.website,
    seed.sector,
    roleFromSuggested(seed.suggestedRole),
  ]);
}

function emailFor(website: string, role: string): string | null {
  const host = hostnameFromWebsite(website);
  if (!host) return null;
  return normalizeSalesEmail(`${role}@${host}`);
}

export function isCampaignEmailSendable(email: string, website: string): boolean {
  if (!isRoleBasedEmail(email)) return false;
  if (isPersonalMailbox(email)) return false;
  if (!domainMatchesWebsite(email, website)) return false;
  return true;
}

function toSeed(raw: RawSeed): CampaignSeed | null {
  const [locale, country, company, website, sector, role] = raw;
  if (company.includes("skip")) return null;
  const email = emailFor(website, role);
  if (!email || !isCampaignEmailSendable(email, website)) return null;
  return { locale, country, company, website, sector, role, email };
}

function uniqueSendable(rows: CampaignSeed[]): CampaignSeed[] {
  const seen = new Set<string>();
  const out: CampaignSeed[] = [];
  for (const row of rows) {
    if (seen.has(row.email)) continue;
    seen.add(row.email);
    out.push(row);
  }
  return out;
}

export const CAMPAIGN_ROSTER: CampaignSeed[] = uniqueSendable(
  [...rawFromIcp(), ...EXTRA].map(toSeed).filter((row): row is CampaignSeed => Boolean(row))
);

export function campaignSeedsForLocale(locale: string): CampaignSeed[] {
  return CAMPAIGN_ROSTER.filter((row) => row.locale === locale);
}

export function campaignLocaleCoverage(): Array<{
  locale: GlobalLocaleCode;
  label: string;
  country: string;
  sendable: number;
}> {
  return GLOBAL_LOCALES.map((item) => {
    const rows = campaignSeedsForLocale(item.code);
    return {
      locale: item.code,
      label: item.label,
      country: rows[0]?.country ?? "",
      sendable: rows.length,
    };
  });
}

export function campaignLocaleMeta(locale: string) {
  return getLocaleConfig(locale);
}
