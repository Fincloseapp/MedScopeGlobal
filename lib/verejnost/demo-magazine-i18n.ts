/**
 * Static magazine translations for demo / seed slugs.
 * Used when AI translation is unavailable so non-Czech visitors can still read.
 */
import { pickCopyLocale, type CopyLocale } from "@/lib/i18n/copy-locale";

export type DemoArticleCopy = {
  title: string;
  excerpt: string;
  content: string;
  meta_description?: string;
};

function pack(
  rows: Record<CopyLocale, DemoArticleCopy>
): Record<CopyLocale, DemoArticleCopy> {
  return rows;
}

const SLEEP = pack({
  cs: {
    title: "Zdravý spánek: praktické rady pro každodenní režim",
    excerpt: "Jak si nastavit režim dne, hygienu spánku a kdy vyhledat lékaře — srozumitelně pro každého.",
    content: `<p>Kvalitní spánek ovlivňuje imunitu, náladu i schopnost soustředit se. Není potřeba složitých postupů — stačí několik konkrétních kroků.</p><h2>Pravidelný režim</h2><p>Usínejte a vstávejte přibližně ve stejnou dobu i o víkendu. Tělo si lépe udrží biologické hodiny.</p><h2>Prostředí ložnice</h2><ul><li>Temná, tichá a chladnější místnost (cca 18–20 °C).</li><li>Omezte obrazovky hodinu před spaním.</li><li>Kofein a alkohol nejlépe ukončit několik hodin před spánkem.</li></ul><p><em>Informace nenahrazují lékařskou péči. Při dlouhodobých poruchách spánku kontaktujte praktického lékaře.</em></p>`,
    meta_description: "Praktický průvodce zdravým spánkem: režim dne, hygiena ložnice a varovné signály.",
  },
  en: {
    title: "Healthy sleep: practical steps for a daily routine",
    excerpt: "How to set a daily rhythm, sleep hygiene, and when to see a doctor — explained clearly.",
    content: `<p>Good sleep supports immunity, mood and focus. You do not need a complicated protocol — a few concrete steps help.</p><h2>A regular rhythm</h2><p>Go to bed and wake up at roughly the same time, including weekends. The body keeps its clock more easily.</p><h2>The bedroom</h2><ul><li>Dark, quiet and cooler (about 18–20 °C).</li><li>Limit screens in the hour before sleep.</li><li>Stop caffeine and alcohol several hours before bed.</li></ul><p><em>This is not a substitute for medical care. If sleep problems last, contact your GP.</em></p>`,
    meta_description: "A practical sleep guide: daily rhythm, bedroom hygiene and warning signs.",
  },
  sk: {
    title: "Zdravý spánok: praktické rady pre každodenný režim",
    excerpt: "Ako si nastaviť režim dňa, hygienu spánku a kedy vyhľadať lekára — zrozumiteľne pre každého.",
    content: `<p>Kvalitný spánok ovplyvňuje imunitu, náladu aj schopnosť sústrediť sa. Netreba zložité postupy — stačí niekoľko konkrétnych krokov.</p><h2>Pravidelný režim</h2><p>Zaspávajte a vstávajte približne v rovnakom čase aj cez víkend. Telo si lepšie udrží biologické hodiny.</p><h2>Prostredie spálne</h2><ul><li>Tmavá, tichá a chladnejšia miestnosť (cca 18–20 °C).</li><li>Obmedzte obrazovky hodinu pred spaním.</li><li>Kofeín a alkohol ukončite niekoľko hodín pred spánkom.</li></ul><p><em>Informácie nenahrádzajú lekársku starostlivosť. Pri dlhodobých poruchách spánku kontaktujte praktického lekára.</em></p>`,
    meta_description: "Praktický sprievodca zdravým spánkom: režim dňa, hygiena spálne a varovné signály.",
  },
  de: {
    title: "Gesunder Schlaf: praktische Schritte für den Alltag",
    excerpt: "Tagesrhythmus, Schlafhygiene und wann Sie einen Arzt aufsuchen sollten — klar erklärt.",
    content: `<p>Guter Schlaf stärkt Immunsystem, Stimmung und Konzentration. Es braucht kein kompliziertes Protokoll — einige konkrete Schritte helfen.</p><h2>Ein regelmäßiger Rhythmus</h2><p>Gehen Sie ungefähr zur gleichen Zeit ins Bett und stehen Sie zur gleichen Zeit auf, auch am Wochenende.</p><h2>Das Schlafzimmer</h2><ul><li>Dunkel, ruhig und kühler (etwa 18–20 °C).</li><li>Bildschirme in der Stunde vor dem Schlaf begrenzen.</li><li>Koffein und Alkohol mehrere Stunden vorher beenden.</li></ul><p><em>Kein Ersatz für medizinische Versorgung. Bei anhaltenden Schlafproblemen wenden Sie sich an Ihre Hausärztin oder Ihren Hausarzt.</em></p>`,
    meta_description: "Praktischer Schlafratgeber: Tagesrhythmus, Schlafzimmer und Warnzeichen.",
  },
  fr: {
    title: "Un sommeil sain : gestes concrets pour le quotidien",
    excerpt: "Rythme de la journée, hygiène du sommeil et moment de consulter — expliqué clairement.",
    content: `<p>Un bon sommeil soutient l’immunité, l’humeur et la concentration. Pas besoin d’un protocole complexe — quelques gestes suffisent.</p><h2>Un rythme régulier</h2><p>Couchez-vous et levez-vous à peu près à la même heure, y compris le week-end.</p><h2>La chambre</h2><ul><li>Sombre, calme et plus fraîche (environ 18–20 °C).</li><li>Limitez les écrans une heure avant de dormir.</li><li>Arrêtez caféine et alcool plusieurs heures avant.</li></ul><p><em>Ces informations ne remplacent pas des soins médicaux. Si les troubles durent, contactez votre médecin.</em></p>`,
    meta_description: "Guide pratique du sommeil : rythme, chambre et signes d’alerte.",
  },
  es: {
    title: "Sueño saludable: pasos prácticos para el día a día",
    excerpt: "Cómo fijar un ritmo diario, higiene del sueño y cuándo ver al médico — con claridad.",
    content: `<p>Dormir bien ayuda a la inmunidad, el ánimo y la concentración. No hace falta un protocolo complicado — bastan unos pasos concretos.</p><h2>Un ritmo regular</h2><p>Acuéstese y levántese a aproximadamente la misma hora, también el fin de semana.</p><h2>El dormitorio</h2><ul><li>Oscuro, silencioso y más fresco (unos 18–20 °C).</li><li>Limite las pantallas una hora antes de dormir.</li><li>Deje cafeína y alcohol varias horas antes.</li></ul><p><em>Esto no sustituye la atención médica. Si el problema dura, consulte a su médico de cabecera.</em></p>`,
    meta_description: "Guía práctica del sueño: ritmo diario, dormitorio y señales de alarma.",
  },
  it: {
    title: "Sonno sano: passi pratici per la routine quotidiana",
    excerpt: "Come impostare il ritmo della giornata, l’igiene del sonno e quando vedere il medico.",
    content: `<p>Un sonno di qualità sostiene immunità, umore e concentrazione. Non serve un protocollo complicato — bastano alcuni passi concreti.</p><h2>Un ritmo regolare</h2><p>Andate a letto e svegliatevi più o meno alla stessa ora, anche nel fine settimana.</p><h2>La camera</h2><ul><li>Buia, silenziosa e più fresca (circa 18–20 °C).</li><li>Limitate gli schermi un’ora prima di dormire.</li><li>Interrompete caffeina e alcol alcune ore prima.</li></ul><p><em>Le informazioni non sostituiscono le cure mediche. Se i disturbi durano, contattate il medico di base.</em></p>`,
    meta_description: "Guida pratica al sonno: ritmo, camera e segnali di allarme.",
  },
  pl: {
    title: "Zdrowy sen: praktyczne kroki na co dzień",
    excerpt: "Jak ustawić rytm dnia, higienę snu i kiedy zgłosić się do lekarza — jasno wyjaśnione.",
    content: `<p>Dobry sen wspiera odporność, nastrój i koncentrację. Nie potrzeba skomplikowanego protokołu — wystarczy kilka konkretnych kroków.</p><h2>Regularny rytm</h2><p>Kładźcie się i wstawajcie mniej więcej o tej samej porze, także w weekend.</p><h2>Sypialnia</h2><ul><li>Ciemna, cicha i chłodniejsza (ok. 18–20 °C).</li><li>Ograniczcie ekrany godzinę przed snem.</li><li>Kofeinę i alkohol skończcie kilka godzin wcześniej.</li></ul><p><em>Informacje nie zastępują opieki medycznej. Przy długotrwałych zaburzeniach snu skontaktujcie się z lekarzem rodzinnym.</em></p>`,
    meta_description: "Praktyczny przewodnik po śnie: rytm dnia, sypialnia i sygnały ostrzegawcze.",
  },
  ro: {
    title: "Somn sănătos: pași practici pentru rutina zilnică",
    excerpt: "Cum să vă setați ritmul zilei, igiena somnului și când să mergeți la medic.",
    content: `<p>Un somn bun susține imunitatea, dispoziția și concentrarea. Nu e nevoie de un protocol complicat — câțiva pași concreți ajută.</p><h2>Un ritm regulat</h2><p>Mergeți la culcare și treziți-vă aproximativ la aceeași oră, inclusiv în weekend.</p><h2>Dormitorul</h2><ul><li>Întunecat, liniștit și mai răcoros (circa 18–20 °C).</li><li>Limitați ecranele cu o oră înainte de somn.</li><li>Opriți cafeina și alcoolul cu câteva ore înainte.</li></ul><p><em>Informațiile nu înlocuiesc îngrijirea medicală. Dacă tulburările persistă, contactați medicul de familie.</em></p>`,
    meta_description: "Ghid practic pentru somn: ritm, dormitor și semne de alarmă.",
  },
  hu: {
    title: "Egészséges alvás: gyakorlati lépések a mindennapokra",
    excerpt: "Hogyan állítson be napi ritmust, alváshigiénét, és mikor keressen orvost.",
    content: `<p>A jó alvás támogatja az immunitást, a hangulatot és a koncentrációt. Nincs szükség bonyolult protokollra — néhány konkrét lépés segít.</p><h2>Rendszeres ritmus</h2><p>Nagyjából ugyanakkor feküdjön le és keljen fel, hétvégén is.</p><h2>A hálószoba</h2><ul><li>Sötét, csendes és hűvösebb (kb. 18–20 °C).</li><li>Korlátozza a képernyőket elalvás előtt egy órával.</li><li>A koffeint és az alkoholt néhány órával korábban fejezze be.</li></ul><p><em>Az információ nem helyettesíti az orvosi ellátást. Tartós alvászavar esetén keresse háziorvosát.</em></p>`,
    meta_description: "Gyakorlati alvásútmutató: ritmus, hálószoba és figyelmeztető jelek.",
  },
  ru: {
    title: "Здоровый сон: практические шаги на каждый день",
    excerpt: "Как настроить ритм дня, гигиену сна и когда обратиться к врачу.",
    content: `<p>Качественный сон поддерживает иммунитет, настроение и концентрацию. Сложный протокол не нужен — достаточно нескольких конкретных шагов.</p><h2>Регулярный ритм</h2><p>Ложитесь и вставайте примерно в одно и то же время, включая выходные.</p><h2>Спальня</h2><ul><li>Тёмная, тихая и прохладнее (около 18–20 °C).</li><li>Ограничьте экраны за час до сна.</li><li>Кофеин и алкоголь завершите за несколько часов.</li></ul><p><em>Информация не заменяет медицинскую помощь. При длительных нарушениях сна обратитесь к терапевту.</em></p>`,
    meta_description: "Практический гид по сну: ритм дня, спальня и тревожные признаки.",
  },
  uk: {
    title: "Здоровий сон: практичні кроки на щодень",
    excerpt: "Як налаштувати ритм дня, гігієну сну і коли звернутися до лікаря.",
    content: `<p>Якісний сон підтримує імунітет, настрій і концентрацію. Складний протокол не потрібен — достатньо кількох конкретних кроків.</p><h2>Регулярний ритм</h2><p>Лягайте і вставайте приблизно в той самий час, включно з вихідними.</p><h2>Спальня</h2><ul><li>Темна, тиха й прохолодніша (близько 18–20 °C).</li><li>Обмежте екрани за годину до сну.</li><li>Кофеїн і алкоголь завершіть за кілька годин.</li></ul><p><em>Інформація не замінює медичну допомогу. За тривалих порушень сну зверніться до сімейного лікаря.</em></p>`,
    meta_description: "Практичний гід зі сну: ритм дня, спальня і тривожні ознаки.",
  },
  be: {
    title: "Здаровы сон: практычныя крокі на кожны дзень",
    excerpt: "Як наладзіць рытм дня, гігіену сну і калі звярнуцца да ўрача.",
    content: `<p>Якасны сон падтрымлівае імунітэт, настрой і канцэнтрацыю. Складаны пратакол не патрэбны — дастаткова некалькіх канкрэтных крокаў.</p><h2>Рэгулярны рытм</h2><p>Кладзіцеся і ўставайце прыкладна ў той самы час, уключаючы выхадныя.</p><h2>Спальня</h2><ul><li>Цёмная, ціхая і прахаладнейшая (каля 18–20 °C).</li><li>Абмяжуйце экраны за гадзіну да сну.</li><li>Кафеін і алкаголь завяршыце за некалькі гадзін.</li></ul><p><em>Інфармацыя не замяняе медыцынскую дапамогу. Пры доўгіх парушэннях сну звярніцеся да ўчастковага ўрача.</em></p>`,
    meta_description: "Практычны гід па сне: рытм дня, спальня і трывожныя прыкметы.",
  },
  ko: {
    title: "건강한 수면: 일상 루틴을 위한 실질적 조언",
    excerpt: "하루 리듬과 수면 위생을 맞추는 법, 그리고 의사를 찾아야 할 때.",
    content: `<p>좋은 수면은 면역, 기분, 집중력을 돕습니다. 복잡한 프로토콜은 필요 없습니다. 몇 가지 구체적인 단계면 충분합니다.</p><h2>규칙적인 리듬</h2><p>주말에도 비슷한 시간에 잠들고 일어나세요. 몸이 생체시계를 더 잘 유지합니다.</p><h2>침실 환경</h2><ul><li>어둡고 조용하며 더 시원하게 (약 18–20 °C).</li><li>잠들기 한 시간 전에는 화면을 줄이세요.</li><li>카페인과 알코올은 몇 시간 전에 멈추세요.</li></ul><p><em>이 정보는 진료를 대체하지 않습니다. 수면 문제가 오래가면 주치의에게 문의하세요.</em></p>`,
    meta_description: "수면 실전 가이드: 하루 리듬, 침실 위생, 경고 신호.",
  },
  vi: {
    title: "Giấc ngủ lành: bước thực tế cho nhịp ngày",
    excerpt: "Cách đặt nhịp ngày, vệ sinh giấc ngủ và khi nào nên gặp bác sĩ.",
    content: `<p>Ngủ tốt hỗ trợ miễn dịch, tâm trạng và tập trung. Không cần quy trình phức tạp — vài bước cụ thể đã giúp.</p><h2>Nhịp đều đặn</h2><p>Đi ngủ và thức dậy gần cùng giờ, cả cuối tuần. Cơ thể giữ đồng hồ sinh học dễ hơn.</p><h2>Phòng ngủ</h2><ul><li>Tối, yên và mát hơn (khoảng 18–20 °C).</li><li>Hạn chế màn hình một giờ trước khi ngủ.</li><li>Ngừng caffeine và rượu vài giờ trước.</li></ul><p><em>Thông tin không thay chăm sóc y tế. Nếu rối loạn kéo dài, hãy liên hệ bác sĩ gia đình.</em></p>`,
    meta_description: "Hướng dẫn ngủ thực tế: nhịp ngày, phòng ngủ và dấu hiệu cảnh báo.",
  },
  id: {
    title: "Tidur sehat: langkah praktis untuk rutinitas harian",
    excerpt: "Cara mengatur ritme hari, kebersihan tidur, dan kapan menemui dokter.",
    content: `<p>Tidur berkualitas mendukung imunitas, suasana hati, dan fokus. Tidak perlu protokol rumit — beberapa langkah konkret membantu.</p><h2>Ritme teratur</h2><p>Tidur dan bangun pada waktu yang kurang lebih sama, termasuk akhir pekan.</p><h2>Kamar tidur</h2><ul><li>Gelap, tenang, dan lebih sejuk (sekitar 18–20 °C).</li><li>Batasi layar satu jam sebelum tidur.</li><li>Hentikan kafein dan alkohol beberapa jam sebelumnya.</li></ul><p><em>Informasi ini tidak menggantikan perawatan medis. Jika gangguan tidur berlangsung, hubungi dokter umum.</em></p>`,
    meta_description: "Panduan tidur praktis: ritme harian, kamar, dan tanda peringatan.",
  },
  ja: {
    title: "健康な睡眠：日常のリズムのための具体的な助言",
    excerpt: "一日のリズムと睡眠衛生の整え方、受診の目安をわかりやすく。",
    content: `<p>質の高い睡眠は免疫、気分、集中を支えます。複雑な手順は不要です。具体的な一歩がいくつかあれば十分です。</p><h2>規則正しいリズム</h2><p>週末も含め、ほぼ同じ時刻に寝て起きましょう。体が体内時計を保ちやすくなります。</p><h2>寝室</h2><ul><li>暗く静かで、やや涼しく（約 18–20 °C）。</li><li>寝る一時間前は画面を控える。</li><li>カフェインとアルコールは数時間前に終える。</li></ul><p><em>情報は医療の代替ではありません。睡眠の不調が続くときはかかりつけ医に相談してください。</em></p>`,
    meta_description: "睡眠の実践ガイド：リズム、寝室、警告サイン。",
  },
  "zh-CN": {
    title: "健康睡眠：日常作息的实用建议",
    excerpt: "如何设定一天的节律、睡眠卫生，以及何时就医 — 清楚说明。",
    content: `<p>优质睡眠有助于免疫、情绪和专注。不必复杂流程 — 几个具体步骤即可。</p><h2>规律节律</h2><p>即使周末也尽量在相近时间入睡和起床。身体更容易维持生物钟。</p><h2>卧室环境</h2><ul><li>黑暗、安静、略凉（约 18–20 °C）。</li><li>睡前一小时减少屏幕。</li><li>咖啡因和酒精最好提前数小时停止。</li></ul><p><em>信息不能替代医疗。睡眠问题持续时，请联系家庭医生。</em></p>`,
    meta_description: "实用睡眠指南：作息、卧室卫生与警示信号。",
  },
});

const PREVENTION = pack({
  cs: {
    title: "Prevence: screening a očkování v praxi",
    excerpt: "Proč se vyplatí preventivní prohlídky, jaké screeningy jsou běžné a jak se orientovat v očkování.",
    content: `<p>Prevence je nejlevnější cesta ke zdraví. V Česku existuje síť preventivních programů pro různé věkové skupiny.</p><h2>Preventivní prohlídky</h2><p>Praktický lékař vás pravidelně zve na preventivní prohlídky podle věku a rizikových faktorů.</p><h2>Screeningové programy</h2><ul><li>Mamografický screening u žen.</li><li>Kolorektální screening (krev ve stolici, kolonoskopie).</li><li>Screening karcinomu děložního hrdla.</li></ul><p><em>VitaScope · Veřejné zdraví · Obsah pro vzdělávání.</em></p>`,
    meta_description: "Přehled preventivních prohlídek, screeningových programů a očkování.",
  },
  en: {
    title: "Prevention: screening and vaccination in practice",
    excerpt: "Why check-ups pay off, which screenings are common, and how to find your way around vaccination.",
    content: `<p>Prevention is the cheapest path to health. Many countries run programmes for different age groups — including Czechia.</p><h2>Check-ups</h2><p>Your GP invites you to preventive visits according to age and risk factors.</p><h2>Screening programmes</h2><ul><li>Mammography screening for women.</li><li>Colorectal screening (stool blood test, colonoscopy).</li><li>Cervical cancer screening.</li></ul><p><em>VitaScope · Public health · Educational content.</em></p>`,
    meta_description: "An overview of check-ups, screening programmes and vaccination.",
  },
  sk: {
    title: "Prevencia: skríning a očkovanie v praxi",
    excerpt: "Prečo sa oplatia preventívne prehliadky, aké skríningy sú bežné a ako sa orientovať v očkovaní.",
    content: `<p>Prevencia je najlacnejšia cesta k zdraviu. Existuje sieť programov pre rôzne vekové skupiny.</p><h2>Preventívne prehliadky</h2><p>Praktický lekár vás pravidelne pozýva podľa veku a rizikových faktorov.</p><h2>Skríningové programy</h2><ul><li>Mamografický skríning u žien.</li><li>Kolorektálny skríning (krv v stolici, kolonoskopia).</li><li>Skríning karcinómu krčka maternice.</li></ul><p><em>VitaScope · Verejné zdravie · Obsah na vzdelávanie.</em></p>`,
    meta_description: "Prehľad preventívnych prehliadok, skríningov a očkovania.",
  },
  de: {
    title: "Prävention: Screening und Impfung in der Praxis",
    excerpt: "Warum sich Vorsorge lohnt, welche Screenings üblich sind und wie Sie Impfungen einordnen.",
    content: `<p>Prävention ist der günstigste Weg zur Gesundheit. Es gibt Programme für verschiedene Altersgruppen.</p><h2>Vorsorgeuntersuchungen</h2><p>Ihre Hausarztpraxis lädt Sie je nach Alter und Risikofaktoren ein.</p><h2>Screening-Programme</h2><ul><li>Mammografie-Screening für Frauen.</li><li>Darmkrebs-Screening (Stuhltest, Koloskopie).</li><li>Screening auf Gebärmutterhalskrebs.</li></ul><p><em>VitaScope · Öffentliche Gesundheit · Bildungsinhalt.</em></p>`,
    meta_description: "Überblick zu Vorsorge, Screening und Impfung.",
  },
  fr: {
    title: "Prévention : dépistage et vaccination au quotidien",
    excerpt: "Pourquoi les bilans valent la peine, quels dépistages sont courants et comment s’orienter dans la vaccination.",
    content: `<p>La prévention est le chemin le moins coûteux vers la santé. Des programmes existent pour différents âges.</p><h2>Bilans de prévention</h2><p>Votre médecin vous convie selon l’âge et les facteurs de risque.</p><h2>Programmes de dépistage</h2><ul><li>Dépistage mammographique chez les femmes.</li><li>Dépistage colorectal (sang dans les selles, coloscopie).</li><li>Dépistage du cancer du col de l’utérus.</li></ul><p><em>VitaScope · Santé publique · Contenu éducatif.</em></p>`,
    meta_description: "Aperçu des bilans, dépistages et vaccinations.",
  },
  es: {
    title: "Prevención: cribado y vacunación en la práctica",
    excerpt: "Por qué merecen la pena las revisiones, qué cribados son habituales y cómo orientarse en la vacunación.",
    content: `<p>La prevención es el camino más barato hacia la salud. Hay programas para distintos grupos de edad.</p><h2>Revisiones</h2><p>Su médico de cabecera le cita según la edad y los factores de riesgo.</p><h2>Programas de cribado</h2><ul><li>Cribado mamográfico en mujeres.</li><li>Cribado colorrectal (sangre en heces, colonoscopia).</li><li>Cribado del cáncer de cuello uterino.</li></ul><p><em>VitaScope · Salud pública · Contenido educativo.</em></p>`,
    meta_description: "Panorama de revisiones, cribados y vacunación.",
  },
  it: {
    title: "Prevenzione: screening e vaccinazione nella pratica",
    excerpt: "Perché convengono i controlli, quali screening sono comuni e come orientarsi sui vaccini.",
    content: `<p>La prevenzione è la via meno costosa verso la salute. Esistono programmi per diverse fasce d’età.</p><h2>Controlli di prevenzione</h2><p>Il medico di famiglia vi invita in base a età e fattori di rischio.</p><h2>Programmi di screening</h2><ul><li>Screening mammografico per le donne.</li><li>Screening colorettale (sangue occulto, colonscopia).</li><li>Screening del tumore del collo dell’utero.</li></ul><p><em>VitaScope · Salute pubblica · Contenuto educativo.</em></p>`,
    meta_description: "Panoramica su controlli, screening e vaccinazione.",
  },
  pl: {
    title: "Profilaktyka: przesiew i szczepienia w praktyce",
    excerpt: "Dlaczego opłacają się badania kontrolne, jakie przesiewy są częste i jak się odnaleźć w szczepieniach.",
    content: `<p>Profilaktyka to najtańsza droga do zdrowia. Istnieją programy dla różnych grup wieku.</p><h2>Badania profilaktyczne</h2><p>Lekarz rodzinny zaprasza według wieku i czynników ryzyka.</p><h2>Programy przesiewowe</h2><ul><li>Przesiew mammograficzny u kobiet.</li><li>Przesiew jelita grubego (krew w stolcu, kolonoskopia).</li><li>Przesiew raka szyjki macicy.</li></ul><p><em>VitaScope · Zdrowie publiczne · Treść edukacyjna.</em></p>`,
    meta_description: "Przegląd badań, przesiewów i szczepień.",
  },
  ro: {
    title: "Prevenție: screening și vaccinare în practică",
    excerpt: "De ce merită controalele, ce screeninguri sunt obișnuite și cum să vă orientați în vaccinare.",
    content: `<p>Prevenția este calea cea mai ieftină spre sănătate. Există programe pentru diferite vârste.</p><h2>Controale preventive</h2><p>Medicul de familie vă cheamă după vârstă și factori de risc.</p><h2>Programe de screening</h2><ul><li>Screening mamografic la femei.</li><li>Screening colorectal (sânge în scaun, colonoscopie).</li><li>Screening pentru cancer de col uterin.</li></ul><p><em>VitaScope · Sănătate publică · Conținut educațional.</em></p>`,
    meta_description: "Prezentare a controalelor, screeningului și vaccinării.",
  },
  hu: {
    title: "Megelőzés: szűrés és védőoltás a gyakorlatban",
    excerpt: "Miért éri meg a szűrővizsgálat, milyen szűrések gyakoriak, és hogyan igazodjon az oltásokban.",
    content: `<p>A megelőzés a legolcsóbb út az egészséghez. Különböző korosztályoknak vannak programok.</p><h2>Megelőző vizsgálatok</h2><p>A háziorvos kor és rizikófaktorok szerint hívja.</p><h2>Szűrőprogramok</h2><ul><li>Mammográfiás szűrés nőknél.</li><li>Kolorektális szűrés (székletvér, kolonoszkópia).</li><li>Méhnyakrák-szűrés.</li></ul><p><em>VitaScope · Népegészség · Oktatási tartalom.</em></p>`,
    meta_description: "Áttekintés a vizsgálatról, szűrésről és oltásról.",
  },
  ru: {
    title: "Профилактика: скрининг и вакцинация на практике",
    excerpt: "Почему важны осмотры, какие скрининги распространены и как ориентироваться в прививках.",
    content: `<p>Профилактика — самый дешёвый путь к здоровью. Есть программы для разных возрастов.</p><h2>Профилактические осмотры</h2><p>Терапевт приглашает вас по возрасту и факторам риска.</p><h2>Скрининговые программы</h2><ul><li>Маммографический скрининг у женщин.</li><li>Колоректальный скрининг (кровь в стуле, колоноскопия).</li><li>Скрининг рака шейки матки.</li></ul><p><em>VitaScope · Общественное здоровье · Образовательный материал.</em></p>`,
    meta_description: "Обзор осмотров, скрининга и вакцинации.",
  },
  uk: {
    title: "Профілактика: скринінг і вакцинація на практиці",
    excerpt: "Чому варті профілактичні огляди, які скринінги поширені і як орієнтуватися в щепленнях.",
    content: `<p>Профілактика — найдешевший шлях до здоров’я. Є програми для різних вікових груп.</p><h2>Профілактичні огляди</h2><p>Сімейний лікар запрошує за віком і факторами ризику.</p><h2>Скринінгові програми</h2><ul><li>Мамографічний скринінг у жінок.</li><li>Колоректальний скринінг (кров у калі, колоноскопія).</li><li>Скринінг раку шийки матки.</li></ul><p><em>VitaScope · Громадське здоров’я · Освітній зміст.</em></p>`,
    meta_description: "Огляд оглядів, скринінгу та вакцинації.",
  },
  be: {
    title: "Прафілактыка: скрынінг і вакцынацыя на практыцы",
    excerpt: "Чаму вартыя прафілактычныя агляды, якія скрынінгі пашыраныя і як арыентавацца ў прышчэпках.",
    content: `<p>Прафілактыка — самы танны шлях да здароўя. Ёсць праграмы для розных узростаў.</p><h2>Прафілактычныя агляды</h2><p>Урач запрашае паводле ўзросту і фактараў рызыкі.</p><h2>Скрынінгавыя праграмы</h2><ul><li>Мамаграфічны скрынінг у жанчын.</li><li>Каларэктальны скрынінг (кроў у кале, каланаскапія).</li><li>Скрынінг раку шыйкі маткі.</li></ul><p><em>VitaScope · Грамадскае здароўе · Адукацыйны змест.</em></p>`,
    meta_description: "Агляд аглядаў, скрынінгу і вакцынацыі.",
  },
  ko: {
    title: "예방: 실제 검진과 예방접종",
    excerpt: "검진이 왜 가치 있는지, 흔한 선별검사, 접종을 어떻게 볼지.",
    content: `<p>예방은 건강으로 가는 가장 저렴한 길입니다. 연령대별 프로그램이 있습니다.</p><h2>예방 검진</h2><p>주치의가 나이와 위험 요인에 따라 부릅니다.</p><h2>선별 프로그램</h2><ul><li>여성 유방촬영 선별.</li><li>대장 선별(분변잠혈, 대장내시경).</li><li>자궁경부암 선별.</li></ul><p><em>VitaScope · 공중보건 · 교육 콘텐츠.</em></p>`,
    meta_description: "검진, 선별, 예방접종 개요.",
  },
  vi: {
    title: "Phòng ngừa: tầm soát và tiêm chủng trong thực tế",
    excerpt: "Vì sao khám định kỳ đáng làm, tầm soát nào phổ biến và cách định hướng tiêm chủng.",
    content: `<p>Phòng ngừa là con đường rẻ nhất tới sức khỏe. Có chương trình cho nhiều nhóm tuổi.</p><h2>Khám phòng ngừa</h2><p>Bác sĩ gia đình mời bạn theo tuổi và yếu tố nguy cơ.</p><h2>Chương trình tầm soát</h2><ul><li>Tầm soát nhũ ảnh ở phụ nữ.</li><li>Tầm soát đại trực tràng (máu trong phân, nội soi).</li><li>Tầm soát ung thư cổ tử cung.</li></ul><p><em>VitaScope · Y tế công cộng · Nội dung giáo dục.</em></p>`,
    meta_description: "Tổng quan khám, tầm soát và tiêm chủng.",
  },
  id: {
    title: "Pencegahan: skrining dan vaksinasi dalam praktik",
    excerpt: "Mengapa pemeriksaan berkala berharga, skrining mana yang umum, dan cara menavigasi vaksinasi.",
    content: `<p>Pencegahan adalah jalan termurah menuju kesehatan. Ada program untuk berbagai usia.</p><h2>Pemeriksaan pencegahan</h2><p>Dokter umum mengundang Anda sesuai usia dan faktor risiko.</p><h2>Program skrining</h2><ul><li>Skrining mamografi pada perempuan.</li><li>Skrining kolorektal (darah pada tinja, kolonoskopi).</li><li>Skrining kanker serviks.</li></ul><p><em>VitaScope · Kesehatan masyarakat · Konten edukasi.</em></p>`,
    meta_description: "Ikhtisar pemeriksaan, skrining, dan vaksinasi.",
  },
  ja: {
    title: "予防：現場の検診とワクチン",
    excerpt: "健診がなぜ価値があるか、よくある検診、ワクチンの向き合い方。",
    content: `<p>予防は健康への最も費用対効果の高い道です。年齢層ごとのプログラムがあります。</p><h2>予防健診</h2><p>かかりつけ医が年齢とリスク因子に応じて案内します。</p><h2>検診プログラム</h2><ul><li>女性のマンモグラフィ検診。</li><li>大腸検診（便潜血、大腸内視鏡）。</li><li>子宮頸がん検診。</li></ul><p><em>VitaScope · 公衆衛生 · 教育コンテンツ。</em></p>`,
    meta_description: "健診・検診・ワクチンの概要。",
  },
  "zh-CN": {
    title: "预防：实践中的筛查与疫苗接种",
    excerpt: "为何值得做体检、常见筛查有哪些，以及如何看待接种。",
    content: `<p>预防是通往健康最省成本的路。不同年龄段都有项目。</p><h2>预防体检</h2><p>家庭医生会按年龄和风险因素邀请您。</p><h2>筛查项目</h2><ul><li>女性乳腺钼靶筛查。</li><li>结直肠筛查（便潜血、结肠镜）。</li><li>宫颈癌筛查。</li></ul><p><em>VitaScope · 公共卫生 · 教育内容。</em></p>`,
    meta_description: "体检、筛查与接种概览。",
  },
});

const SYMPTOMS = pack({
  cs: {
    title: "Symptomy: kdy vyhledat lékaře a kdy počkat",
    excerpt: "Jak rozlišit běžné příznaky od signálů, které vyžadují rychlou lékařskou pomoc.",
    content: `<p>Ne každý kašel nebo bolest hlavy znamená vážné onemocnění. Na druhou stranu některé příznaky nesmíme podceňovat.</p><h2>Okamžitě vyhledejte pomoc</h2><ul><li>Bolest na hrudi, dušnost v klidu.</li><li>Náhlá silná bolest hlavy nebo porucha řeči.</li><li>Silné krvácení nebo ztráta vědomí.</li></ul><p><em>VitaScope · Veřejné zdraví · V akutních stavech volejte 155.</em></p>`,
    meta_description: "Kdy vyhledat lékaře a kdy počkat: akutní příznaky a varovné signály.",
  },
  en: {
    title: "Symptoms: when to see a doctor and when to wait",
    excerpt: "How to tell ordinary symptoms from signs that need prompt medical help.",
    content: `<p>Not every cough or headache is a serious disease. Some signs, though, must not be ignored.</p><h2>Seek help immediately</h2><ul><li>Chest pain, breathlessness at rest.</li><li>Sudden severe headache or speech trouble.</li><li>Heavy bleeding or loss of consciousness.</li></ul><p><em>VitaScope · Public health · In emergencies call your local emergency number.</em></p>`,
    meta_description: "When to see a doctor and when to wait: acute signs and warnings.",
  },
  sk: {
    title: "Symptómy: kedy vyhľadať lekára a kedy počkať",
    excerpt: "Ako odlíšiť bežné príznaky od signálov, ktoré vyžadujú rýchlu lekársku pomoc.",
    content: `<p>Nie každý kašeľ alebo bolesť hlavy znamená vážne ochorenie. Niektoré príznaky však nesmieme podceniť.</p><h2>Okamžite vyhľadajte pomoc</h2><ul><li>Bolesť na hrudi, dýchavičnosť v pokoji.</li><li>Náhla silná bolesť hlavy alebo porucha reči.</li><li>Silné krvácanie alebo strata vedomia.</li></ul><p><em>VitaScope · Verejné zdravie · V akútnych stavoch volajte 155.</em></p>`,
    meta_description: "Kedy vyhľadať lekára a kedy počkať: akútne príznaky a varovné signály.",
  },
  de: {
    title: "Symptome: wann zum Arzt und wann abwarten",
    excerpt: "Wie Sie gewöhnliche Beschwerden von Zeichen unterscheiden, die rasche Hilfe brauchen.",
    content: `<p>Nicht jeder Husten oder Kopfschmerz ist eine schwere Krankheit. Manche Zeichen dürfen Sie jedoch nicht unterschätzen.</p><h2>Sofort Hilfe holen</h2><ul><li>Brustschmerz, Atemnot in Ruhe.</li><li>Plötzlicher starker Kopfschmerz oder Sprachstörung.</li><li>Starke Blutung oder Bewusstlosigkeit.</li></ul><p><em>VitaScope · Öffentliche Gesundheit · Im Notfall den lokalen Notruf wählen.</em></p>`,
    meta_description: "Wann zum Arzt, wann warten: akute Zeichen und Warnsignale.",
  },
  fr: {
    title: "Symptômes : quand consulter et quand attendre",
    excerpt: "Comment distinguer des signes ordinaires de ceux qui demandent une aide médicale rapide.",
    content: `<p>Toute toux ou tout mal de tête n’est pas une maladie grave. Certains signes, toutefois, ne doivent pas être négligés.</p><h2>Demandez de l’aide immédiatement</h2><ul><li>Douleur thoracique, essoufflement au repos.</li><li>Mal de tête soudain et intense ou trouble de la parole.</li><li>Saignement abondant ou perte de conscience.</li></ul><p><em>VitaScope · Santé publique · En urgence, composez le numéro local.</em></p>`,
    meta_description: "Quand consulter, quand attendre : signes aigus et alertes.",
  },
  es: {
    title: "Síntomas: cuándo ver al médico y cuándo esperar",
    excerpt: "Cómo distinguir síntomas habituales de señales que requieren ayuda médica rápida.",
    content: `<p>No toda tos o dolor de cabeza es una enfermedad grave. Algunas señales, sin embargo, no deben minusvalorarse.</p><h2>Busque ayuda de inmediato</h2><ul><li>Dolor en el pecho, falta de aire en reposo.</li><li>Dolor de cabeza intenso y súbito o trastorno del habla.</li><li>Sangrado intenso o pérdida de conocimiento.</li></ul><p><em>VitaScope · Salud pública · En urgencias llame al número local.</em></p>`,
    meta_description: "Cuándo ver al médico y cuándo esperar: signos agudos y alertas.",
  },
  it: {
    title: "Sintomi: quando vedere il medico e quando aspettare",
    excerpt: "Come distinguere sintomi comuni da segnali che richiedono aiuto medico rapido.",
    content: `<p>Non ogni tosse o mal di testa è una malattia grave. Alcuni segni, però, non vanno sottovalutati.</p><h2>Cercate aiuto subito</h2><ul><li>Dolore al petto, dispnea a riposo.</li><li>Mal di testa improvviso e forte o disturbo del linguaggio.</li><li>Emorragia intensa o perdita di coscienza.</li></ul><p><em>VitaScope · Salute pubblica · In emergenza chiamate il numero locale.</em></p>`,
    meta_description: "Quando vedere il medico e quando aspettare: segni acuti e allarmi.",
  },
  pl: {
    title: "Objawy: kiedy iść do lekarza, a kiedy poczekać",
    excerpt: "Jak odróżnić zwykłe dolegliwości od sygnałów, które wymagają szybkiej pomocy.",
    content: `<p>Nie każdy kaszel ani ból głowy oznacza poważną chorobę. Niektórych objawów jednak nie wolno bagatelizować.</p><h2>Szukajcie pomocy natychmiast</h2><ul><li>Ból w klatce piersiowej, duszność w spoczynku.</li><li>Nagły silny ból głowy lub zaburzenie mowy.</li><li>Silne krwawienie lub utrata przytomności.</li></ul><p><em>VitaScope · Zdrowie publiczne · W stanach ostrych dzwońcie pod lokalny numer alarmowy.</em></p>`,
    meta_description: "Kiedy do lekarza, a kiedy poczekać: ostre objawy i ostrzeżenia.",
  },
  ro: {
    title: "Simptome: când să mergeți la medic și când să așteptați",
    excerpt: "Cum să deosebiți simptome obișnuite de semne care cer ajutor medical rapid.",
    content: `<p>Nu orice tuse sau durere de cap înseamnă o boală gravă. Unele semne însă nu trebuie subestimate.</p><h2>Cereți ajutor imediat</h2><ul><li>Durere în piept, lipsă de aer în repaus.</li><li>Durere de cap bruscă și puternică sau tulburare de vorbire.</li><li>Sângerare intensă sau pierderea conștienței.</li></ul><p><em>VitaScope · Sănătate publică · În urgență sunați numărul local.</em></p>`,
    meta_description: "Când la medic, când așteptați: semne acute și alerte.",
  },
  hu: {
    title: "Tünetek: mikor keressen orvost, és mikor várjon",
    excerpt: "Hogyan különböztethető meg a hétköznapi panasz a gyors orvosi segítséget igénylő jelektől.",
    content: `<p>Nem minden köhögés vagy fejfájás jelent súlyos betegséget. Egyes jeleket azonban nem szabad bagatellizálni.</p><h2>Azonnal kérjen segítséget</h2><ul><li>Mellkasi fájdalom, nyugalmi nehézlégzés.</li><li>Hirtelen erős fejfájás vagy beszédzavar.</li><li>Erős vérzés vagy eszméletvesztés.</li></ul><p><em>VitaScope · Népegészség · Sürgős esetben hívja a helyi segélyhívót.</em></p>`,
    meta_description: "Mikor orvoshoz, mikor várjon: heveny jelek és figyelmeztetések.",
  },
  ru: {
    title: "Симптомы: когда к врачу, а когда подождать",
    excerpt: "Как отличить обычные признаки от сигналов, требующих быстрой медицинской помощи.",
    content: `<p>Не каждый кашель или головная боль — тяжёлая болезнь. Некоторые признаки, однако, нельзя недооценивать.</p><h2>Ищите помощь сразу</h2><ul><li>Боль в груди, одышка в покое.</li><li>Внезапная сильная головная боль или нарушение речи.</li><li>Сильное кровотечение или потеря сознания.</li></ul><p><em>VitaScope · Общественное здоровье · В острых состояниях звоните по местному номеру экстренной помощи.</em></p>`,
    meta_description: "Когда к врачу, когда подождать: острые признаки и тревожные сигналы.",
  },
  uk: {
    title: "Симптоми: коли до лікаря, а коли зачекати",
    excerpt: "Як відрізнити звичайні ознаки від сигналів, що потребують швидкої медичної допомоги.",
    content: `<p>Не кожен кашель чи головний біль означає тяжку хворобу. Деякі ознаки, однак, не можна недооцінювати.</p><h2>Шукайте допомогу негайно</h2><ul><li>Біль у грудях, задишка в спокої.</li><li>Раптовий сильний головний біль або порушення мовлення.</li><li>Сильна кровотеча або втрата свідомості.</li></ul><p><em>VitaScope · Громадське здоров’я · У гострих станах телефонуйте за місцевим номером екстреної допомоги.</em></p>`,
    meta_description: "Коли до лікаря, коли зачекати: гострі ознаки та попередження.",
  },
  be: {
    title: "Сімптомы: калі да ўрача, а калі пачакаць",
    excerpt: "Як адрозніць звычайныя прыкметы ад сігналаў, якія патрабуюць хуткай медыцынскай дапамогі.",
    content: `<p>Не кожны кашаль ці галаўны боль — цяжкая хвароба. Некаторыя прыкметы, аднак, нельга недаацэньваць.</p><h2>Шукайце дапамогу адразу</h2><ul><li>Боль у грудзях, задышка ў спакоі.</li><li>Раптоўны моцны галаўны боль або парушэнне маўлення.</li><li>Моцнае крывацёк або страта прытомнасці.</li></ul><p><em>VitaScope · Грамадскае здароўе · У вострых станах тэлефануйце па мясцовым нумары экстранай дапамогі.</em></p>`,
    meta_description: "Калі да ўрача, калі пачакаць: вострыя прыкметы і папярэджанні.",
  },
  ko: {
    title: "증상: 언제 의사를 찾고 언제 기다릴까",
    excerpt: "흔한 증상과 신속한 의료 도움이 필요한 신호를 구별하는 법.",
    content: `<p>모든 기침이나 두통이 중병은 아닙니다. 다만 일부 신호는 가볍게 보면 안 됩니다.</p><h2>즉시 도움을 받으세요</h2><ul><li>가슴 통증, 안정 시 호흡곤란.</li><li>갑작스러운 심한 두통 또는 언어 장애.</li><li>심한 출혈 또는 의식 소실.</li></ul><p><em>VitaScope · 공중보건 · 응급 시 지역 응급번호로 전화하세요.</em></p>`,
    meta_description: "의사를 찾을 때와 기다릴 때: 급성 징후와 경고.",
  },
  vi: {
    title: "Triệu chứng: khi nào gặp bác sĩ và khi nào chờ",
    excerpt: "Cách phân biệt triệu chứng thường gặp với tín hiệu cần trợ giúp y tế nhanh.",
    content: `<p>Không phải mọi ho hay đau đầu đều là bệnh nặng. Một số dấu hiệu thì không được xem nhẹ.</p><h2>Tìm giúp ngay</h2><ul><li>Đau ngực, khó thở khi nghỉ.</li><li>Đau đầu đột ngột dữ dội hoặc rối loạn lời nói.</li><li>Chảy máu nhiều hoặc mất ý thức.</li></ul><p><em>VitaScope · Y tế công cộng · Cấp cứu hãy gọi số khẩn cấp địa phương.</em></p>`,
    meta_description: "Khi gặp bác sĩ, khi chờ: dấu hiệu cấp và cảnh báo.",
  },
  id: {
    title: "Gejala: kapan ke dokter dan kapan menunggu",
    excerpt: "Cara membedakan keluhan biasa dari tanda yang butuh bantuan medis cepat.",
    content: `<p>Tidak setiap batuk atau sakit kepala berarti penyakit serius. Beberapa tanda, bagaimanapun, tidak boleh diremehkan.</p><h2>Cari bantuan segera</h2><ul><li>Nyeri dada, sesak napas saat istirahat.</li><li>Sakit kepala hebat mendadak atau gangguan bicara.</li><li>Pendarahan hebat atau kehilangan kesadaran.</li></ul><p><em>VitaScope · Kesehatan masyarakat · Dalam darurat, telepon nomor darurat setempat.</em></p>`,
    meta_description: "Kapan ke dokter, kapan menunggu: tanda akut dan peringatan.",
  },
  ja: {
    title: "症状：いつ受診し、いつ様子を見るか",
    excerpt: "ありふれた症状と、速やかな医療が必要な合図を見分ける方法。",
    content: `<p>咳や頭痛のすべてが重い病気ではありません。ただし、軽く見てはいけない兆候もあります。</p><h2>すぐに助けを求めてください</h2><ul><li>胸痛、安静時の息切れ。</li><li>突然の強い頭痛や言語の障害。</li><li>大量出血や意識消失。</li></ul><p><em>VitaScope · 公衆衛生 · 緊急時は地域の救急番号へ。</em></p>`,
    meta_description: "受診の目安と経過観察：急性の兆候と警告。",
  },
  "zh-CN": {
    title: "症状：何时就医、何时观察",
    excerpt: "如何区分常见不适与需要迅速医疗帮助的信号。",
    content: `<p>并非每次咳嗽或头痛都是重病。但有些信号绝不能轻视。</p><h2>立即求助</h2><ul><li>胸痛、静息时气促。</li><li>突发剧烈头痛或言语障碍。</li><li>大量出血或意识丧失。</li></ul><p><em>VitaScope · 公共卫生 · 急症请拨打当地急救电话。</em></p>`,
    meta_description: "何时就医、何时等待：急性征象与警示。",
  },
});

const CARDIO = pack({
  cs: {
    title: "Rozhovor s kardiologem: prevence srdečních onemocnění v každodenním životě",
    excerpt: "Kardiolog vysvětluje, jak pohyb, strava a kontrola rizikových faktorů chrání srdce — bez strašení.",
    content: `<p><strong>VitaScope:</strong> Co je nejdůležitější prevence srdečních onemocnění pro běžného člověka?</p><p><strong>Kardiolog:</strong> Pravidelný pohyb, kontrola krevního tlaku a cholesterolu a nekouření. Malé změny mají velký dopad.</p><h2>Praktické kroky</h2><ul><li>150 minut středně intenzivního pohybu týdně.</li><li>Omezení soli a průmyslově zpracovaných potravin.</li><li>Preventivní prohlídka u praktického lékaře jednou ročně.</li></ul><p><em>VitaScope · Rozhovory · Informace nenahrazují vyšetření u kardiologa.</em></p>`,
    meta_description: "Rozhovor s kardiologem o prevenci infarktu a mrtvice: pohyb, strava, tlak a cholesterol.",
  },
  en: {
    title: "Interview with a cardiologist: preventing heart disease in daily life",
    excerpt: "A cardiologist explains how movement, food and risk-factor control protect the heart — without scare tactics.",
    content: `<p><strong>VitaScope:</strong> What matters most for preventing heart disease in ordinary life?</p><p><strong>Cardiologist:</strong> Regular movement, blood-pressure and cholesterol control, and not smoking. Small changes have a large effect.</p><h2>Practical steps</h2><ul><li>150 minutes of moderate activity a week.</li><li>Less salt and ultra-processed food.</li><li>A preventive visit with your GP once a year.</li></ul><p><em>VitaScope · Interviews · This does not replace a cardiology examination.</em></p>`,
    meta_description: "A cardiologist on preventing heart attack and stroke: movement, food, pressure and cholesterol.",
  },
  sk: {
    title: "Rozhovor s kardiológom: prevencia srdcových ochorení v každodennom živote",
    excerpt: "Kardiológ vysvetľuje, ako pohyb, strava a kontrola rizikových faktorov chránia srdce — bez strašenia.",
    content: `<p><strong>VitaScope:</strong> Čo je najdôležitejšia prevencia srdcových ochorení pre bežného človeka?</p><p><strong>Kardiológ:</strong> Pravidelný pohyb, kontrola krvného tlaku a cholesterolu a nefajčenie. Malé zmeny majú veľký dopad.</p><h2>Praktické kroky</h2><ul><li>150 minút stredne intenzívneho pohybu týždenne.</li><li>Obmedzenie soli a priemyselne spracovaných potravín.</li><li>Preventívna prehliadka u praktického lekára raz za rok.</li></ul><p><em>VitaScope · Rozhovory · Informácie nenahrádzajú vyšetrenie u kardiológa.</em></p>`,
    meta_description: "Rozhovor s kardiológom o prevencii infarktu a mŕtvice: pohyb, strava, tlak a cholesterol.",
  },
  de: {
    title: "Gespräch mit einem Kardiologen: Herzprävention im Alltag",
    excerpt: "Ein Kardiologe erklärt, wie Bewegung, Ernährung und Risikokontrolle das Herz schützen — ohne Panik.",
    content: `<p><strong>VitaScope:</strong> Was zählt am meisten zur Vorbeugung von Herzkrankheiten?</p><p><strong>Kardiologe:</strong> Regelmäßige Bewegung, Kontrolle von Blutdruck und Cholesterin und nicht rauchen. Kleine Änderungen haben große Wirkung.</p><h2>Praktische Schritte</h2><ul><li>150 Minuten moderate Aktivität pro Woche.</li><li>Weniger Salz und stark verarbeitete Lebensmittel.</li><li>Ein Vorsorgetermin beim Hausarzt einmal im Jahr.</li></ul><p><em>VitaScope · Gespräche · Kein Ersatz für eine kardiologische Untersuchung.</em></p>`,
    meta_description: "Kardiologe zur Vorbeugung von Infarkt und Schlaganfall: Bewegung, Ernährung, Druck, Cholesterin.",
  },
  fr: {
    title: "Entretien avec un cardiologue : prévenir les maladies du cœur au quotidien",
    excerpt: "Un cardiologue explique comment le mouvement, l’alimentation et le contrôle des risques protègent le cœur — sans faire peur.",
    content: `<p><strong>VitaScope :</strong> Qu’est-ce qui compte le plus pour prévenir les maladies du cœur ?</p><p><strong>Cardiologue :</strong> Un mouvement régulier, le contrôle de la tension et du cholestérol, et ne pas fumer. De petits changements ont un grand effet.</p><h2>Gestes concrets</h2><ul><li>150 minutes d’activité modérée par semaine.</li><li>Moins de sel et d’aliments ultra-transformés.</li><li>Un bilan chez le médecin une fois par an.</li></ul><p><em>VitaScope · Entretiens · Ceci ne remplace pas un examen cardiologique.</em></p>`,
    meta_description: "Un cardiologue sur la prévention de l’infarctus et de l’AVC : mouvement, alimentation, tension, cholestérol.",
  },
  es: {
    title: "Conversación con un cardiólogo: prevenir las enfermedades del corazón en el día a día",
    excerpt: "Un cardiólogo explica cómo el movimiento, la comida y el control de riesgos protegen el corazón — sin alarmismo.",
    content: `<p><strong>VitaScope:</strong> ¿Qué importa más para prevenir las enfermedades del corazón?</p><p><strong>Cardiólogo:</strong> Movimiento regular, control de la tensión y el colesterol, y no fumar. Los cambios pequeños tienen un gran efecto.</p><h2>Pasos prácticos</h2><ul><li>150 minutos de actividad moderada a la semana.</li><li>Menos sal y alimentos ultraprocesados.</li><li>Una visita preventiva con el médico una vez al año.</li></ul><p><em>VitaScope · Entrevistas · Esto no sustituye una exploración cardiológica.</em></p>`,
    meta_description: "Un cardiólogo sobre prevenir infarto e ictus: movimiento, comida, tensión y colesterol.",
  },
  it: {
    title: "Colloquio con un cardiologo: prevenire le malattie del cuore nella vita quotidiana",
    excerpt: "Un cardiologo spiega come movimento, alimentazione e controllo dei rischi proteggono il cuore — senza allarmismo.",
    content: `<p><strong>VitaScope:</strong> Cosa conta di più per prevenire le malattie del cuore?</p><p><strong>Cardiologo:</strong> Movimento regolare, controllo di pressione e colesterolo, e non fumare. Piccoli cambiamenti hanno un grande effetto.</p><h2>Passi pratici</h2><ul><li>150 minuti di attività moderata a settimana.</li><li>Meno sale e cibi ultra-processati.</li><li>Una visita preventiva dal medico una volta all’anno.</li></ul><p><em>VitaScope · Interviste · Non sostituisce una visita cardiologica.</em></p>`,
    meta_description: "Un cardiologo sulla prevenzione di infarto e ictus: movimento, cibo, pressione, colesterolo.",
  },
  pl: {
    title: "Rozmowa z kardiologiem: zapobieganie chorobom serca na co dzień",
    excerpt: "Kardiolog wyjaśnia, jak ruch, jedzenie i kontrola czynników ryzyka chronią serce — bez straszenia.",
    content: `<p><strong>VitaScope:</strong> Co jest najważniejsze w profilaktyce chorób serca?</p><p><strong>Kardiolog:</strong> Regularny ruch, kontrola ciśnienia i cholesterolu oraz niepalenie. Małe zmiany mają duży wpływ.</p><h2>Praktyczne kroki</h2><ul><li>150 minut umiarkowanej aktywności tygodniowo.</li><li>Mniej soli i żywności wysoko przetworzonej.</li><li>Wizyta profilaktyczna u lekarza raz w roku.</li></ul><p><em>VitaScope · Rozmowy · Informacje nie zastępują badania u kardiologa.</em></p>`,
    meta_description: "Kardiolog o zapobieganiu zawałowi i udarowi: ruch, jedzenie, ciśnienie, cholesterol.",
  },
  ro: {
    title: "Convorbire cu un cardiolog: prevenirea bolilor de inimă în viața de zi cu zi",
    excerpt: "Un cardiolog explică cum mișcarea, alimentația și controlul riscurilor protejează inima — fără spaimă.",
    content: `<p><strong>VitaScope:</strong> Ce contează cel mai mult pentru prevenirea bolilor de inimă?</p><p><strong>Cardiolog:</strong> Mișcare regulată, controlul tensiunii și al colesterolului și renunțarea la fumat. Schimbările mici au un efect mare.</p><h2>Pași practici</h2><ul><li>150 de minute de activitate moderată pe săptămână.</li><li>Mai puțină sare și alimente ultraprocesate.</li><li>Un control preventiv la medic o dată pe an.</li></ul><p><em>VitaScope · Interviuri · Nu înlocuiește un consult cardiologic.</em></p>`,
    meta_description: "Un cardiolog despre prevenirea infarctului și a AVC: mișcare, alimentație, tensiune, colesterol.",
  },
  hu: {
    title: "Beszélgetés kardiológussal: a szívbetegségek megelőzése a mindennapokban",
    excerpt: "Egy kardiológus elmagyarázza, hogyan védi a szívet a mozgás, az étkezés és a rizikókontroll — riogatás nélkül.",
    content: `<p><strong>VitaScope:</strong> Mi a legfontosabb a szívbetegségek megelőzésében?</p><p><strong>Kardiológus:</strong> Rendszeres mozgás, a vérnyomás és a koleszterin ellenőrzése, és a nem dohányzás. A kis változásoknak nagy hatása van.</p><h2>Gyakorlati lépések</h2><ul><li>Heti 150 perc közepes intenzitású mozgás.</li><li>Kevesebb só és ultrfeldolgozott élelmiszer.</li><li>Évente egyszer megelőző vizit a háziorvosnál.</li></ul><p><em>VitaScope · Beszélgetések · Nem helyettesíti a kardiológiai vizsgálatot.</em></p>`,
    meta_description: "Kardiológus az infarktus és a stroke megelőzéséről: mozgás, étkezés, nyomás, koleszterin.",
  },
  ru: {
    title: "Разговор с кардиологом: профилактика болезней сердца в повседневной жизни",
    excerpt: "Кардиолог объясняет, как движение, питание и контроль рисков защищают сердце — без запугивания.",
    content: `<p><strong>VitaScope:</strong> Что важнее всего для профилактики болезней сердца?</p><p><strong>Кардиолог:</strong> Регулярное движение, контроль давления и холестерина и отказ от курения. Малые изменения дают большой эффект.</p><h2>Практические шаги</h2><ul><li>150 минут умеренной активности в неделю.</li><li>Меньше соли и ультраобработанных продуктов.</li><li>Профилактический визит к терапевту раз в год.</li></ul><p><em>VitaScope · Беседы · Это не заменяет осмотр кардиолога.</em></p>`,
    meta_description: "Кардиолог о профилактике инфаркта и инсульта: движение, питание, давление, холестерин.",
  },
  uk: {
    title: "Розмова з кардіологом: профілактика хвороб серця в повсякденному житті",
    excerpt: "Кардіолог пояснює, як рух, харчування і контроль ризиків захищають серце — без залякування.",
    content: `<p><strong>VitaScope:</strong> Що найважливіше для профілактики хвороб серця?</p><p><strong>Кардіолог:</strong> Регулярний рух, контроль тиску й холестерину і не палити. Малі зміни дають великий ефект.</p><h2>Практичні кроки</h2><ul><li>150 хвилин помірної активності на тиждень.</li><li>Менше солі й ультраоброблених продуктів.</li><li>Профілактичний візит до лікаря раз на рік.</li></ul><p><em>VitaScope · Розмови · Це не замінює огляд кардіолога.</em></p>`,
    meta_description: "Кардіолог про профілактику інфаркту та інсульту: рух, харчування, тиск, холестерин.",
  },
  be: {
    title: "Размова з кардыёлагам: прафілактыка хвароб сэрца ў штодзённым жыцці",
    excerpt: "Кардыёлаг тлумачыць, як рух, харчаванне і кантроль рызык абараняюць сэрца — без запалохвання.",
    content: `<p><strong>VitaScope:</strong> Што найважнейшае для прафілактыкі хвароб сэрца?</p><p><strong>Кардыёлаг:</strong> Рэгулярны рух, кантроль ціску і халестэрыну і не паліць. Малыя змены даюць вялікі эфект.</p><h2>Практычныя крокі</h2><ul><li>150 хвілін умеранай актыўнасці на тыдзень.</li><li>Менш солі і ультраапрацаваных прадуктаў.</li><li>Прафілактычны візіт да ўрача раз на год.</li></ul><p><em>VitaScope · Размовы · Гэта не замяняе агляд кардыёлага.</em></p>`,
    meta_description: "Кардыёлаг пра прафілактыку інфаркту і інсульту: рух, харчаванне, ціск, халестэрын.",
  },
  ko: {
    title: "심장전문의 인터뷰: 일상에서 심장병을 예방하기",
    excerpt: "심장전문의가 움직임, 식사, 위험요인 관리가 심장을 어떻게 지키는지 설명합니다 — 공포 없이.",
    content: `<p><strong>VitaScope:</strong> 심장병 예방에서 가장 중요한 것은 무엇입니까?</p><p><strong>심장전문의:</strong> 규칙적인 움직임, 혈압과 콜레스테롤 관리, 금연. 작은 변화가 큰 영향을 줍니다.</p><h2>실질적 단계</h2><ul><li>주 150분의 중등도 활동.</li><li>소금과 초가공식품을 줄이기.</li><li>1년에 한 번 주치의 예방 방문.</li></ul><p><em>VitaScope · 인터뷰 · 심장내과 진찰을 대체하지 않습니다.</em></p>`,
    meta_description: "심장전문의가 말하는 심근경색·뇌졸중 예방: 움직임, 식사, 혈압, 콜레스테롤.",
  },
  vi: {
    title: "Phỏng vấn bác sĩ tim: phòng bệnh tim trong đời sống hằng ngày",
    excerpt: "Bác sĩ tim giải thích cách vận động, ăn uống và kiểm soát nguy cơ bảo vệ tim — không dọa dẫm.",
    content: `<p><strong>VitaScope:</strong> Điều gì quan trọng nhất để phòng bệnh tim?</p><p><strong>Bác sĩ tim:</strong> Vận động đều, kiểm soát huyết áp và cholesterol, và không hút thuốc. Thay đổi nhỏ có tác động lớn.</p><h2>Bước thực tế</h2><ul><li>150 phút hoạt động vừa mỗi tuần.</li><li>Ít muối và thực phẩm siêu chế biến.</li><li>Khám phòng ngừa với bác sĩ gia đình mỗi năm một lần.</li></ul><p><em>VitaScope · Phỏng vấn · Không thay khám tim mạch.</em></p>`,
    meta_description: "Bác sĩ tim về phòng nhồi máu và đột quỵ: vận động, ăn uống, huyết áp, cholesterol.",
  },
  id: {
    title: "Wawancara dengan kardiolog: mencegah penyakit jantung dalam hidup sehari-hari",
    excerpt: "Seorang kardiolog menjelaskan bagaimana gerak, makanan, dan kontrol risiko melindungi jantung — tanpa menakut-nakuti.",
    content: `<p><strong>VitaScope:</strong> Apa yang paling penting untuk mencegah penyakit jantung?</p><p><strong>Kardiolog:</strong> Gerak teratur, kontrol tekanan darah dan kolesterol, serta tidak merokok. Perubahan kecil berdampak besar.</p><h2>Langkah praktis</h2><ul><li>150 menit aktivitas sedang per minggu.</li><li>Kurangi garam dan makanan ultraproses.</li><li>Kunjungan pencegahan ke dokter umum sekali setahun.</li></ul><p><em>VitaScope · Wawancara · Ini tidak menggantikan pemeriksaan kardiologi.</em></p>`,
    meta_description: "Kardiolog tentang pencegahan serangan jantung dan stroke: gerak, makanan, tekanan, kolesterol.",
  },
  ja: {
    title: "循環器医への取材：日常で心臓病を防ぐ",
    excerpt: "循環器医が、動き・食事・リスク管理が心臓を守る仕組みを説明します — 脅しなしで。",
    content: `<p><strong>VitaScope:</strong> 心臓病の予防で最も大切なことは何ですか。</p><p><strong>循環器医:</strong> 規則的な動き、血圧とコレステロールの管理、禁煙。小さな変化が大きな効果をもたらします。</p><h2>具体的な一歩</h2><ul><li>週 150 分の中等度の活動。</li><li>塩分と超加工食品を減らす。</li><li>年に一度、かかりつけ医での予防受診。</li></ul><p><em>VitaScope · 取材 · 循環器の診察の代替ではありません。</em></p>`,
    meta_description: "循環器医が語る心筋梗塞と脳卒中の予防：動き、食事、血圧、コレステロール。",
  },
  "zh-CN": {
    title: "与心脏科医生对谈：日常生活中预防心脏病",
    excerpt: "心脏科医生说明运动、饮食与风险控制如何保护心脏 — 不靠恐吓。",
    content: `<p><strong>VitaScope：</strong>预防心脏病最重要的是什么？</p><p><strong>心脏科医生：</strong>规律活动、控制血压与胆固醇、不吸烟。小改变有大影响。</p><h2>实用步骤</h2><ul><li>每周 150 分钟中等强度活动。</li><li>少盐、少超加工食品。</li><li>每年一次家庭医生预防就诊。</li></ul><p><em>VitaScope · 访谈 · 不能替代心脏科检查。</em></p>`,
    meta_description: "心脏科医生谈预防心梗与中风：运动、饮食、血压、胆固醇。",
  },
});

const DIET = pack({
  cs: {
    title: "Vyvážená strava bez extrémů: středomořský talíř v české kuchyni",
    excerpt: "Zapomeňte na drastické diety. Středomořský talíř jde přeložit do domácí kuchyně — s olivovým olejem, zeleninou sezóny a realistickým týdenním plánem.",
    content: `<p>Středomořský talíř není dovolená v Řecku, ale praktický model: hodně zeleniny, celozrnné přílohy, luštěniny, ryby a kvalitní tuky.</p><h2>Jak vypadá talíř v praxi</h2><ul><li>Polovina talíře: zelenina.</li><li>Čtvrtina: celozrnná příloha.</li><li>Čtvrtina: bílkovina.</li><li>Tuk: lžíce olivového oleje nebo hrst ořechů.</li></ul><p><em>VitaScope · Životní styl · Informace nenahrazují individuální lékařskou péči.</em></p>`,
    meta_description: "Vyvážená strava bez extrémů: středomořský talíř v domácí kuchyni.",
  },
  en: {
    title: "Balanced eating without extremes: a Mediterranean plate at home",
    excerpt: "Forget crash diets. The Mediterranean plate translates into home cooking — olive oil, seasonal vegetables and a realistic weekly plan.",
    content: `<p>The Mediterranean plate is not a holiday in Greece. It is a practical model: plenty of vegetables, whole-grain sides, legumes, fish and good fats.</p><h2>What the plate looks like</h2><ul><li>Half the plate: vegetables.</li><li>A quarter: a whole-grain side.</li><li>A quarter: protein.</li><li>Fat: a spoon of olive oil or a handful of nuts.</li></ul><p><em>VitaScope · Lifestyle · This does not replace personal medical care.</em></p>`,
    meta_description: "Balanced eating without extremes: a Mediterranean plate at home.",
  },
  sk: {
    title: "Vyvážená strava bez extrémov: stredomorský tanier v domácej kuchyni",
    excerpt: "Zabudnite na drastické diéty. Stredomorský tanier ide preložiť do domácej kuchyne — s olivovým olejom, sezónnou zeleninou a realistickým týždenným plánom.",
    content: `<p>Stredomorský tanier nie je dovolenka v Grécku, ale praktický model: veľa zeleniny, celozrnné prílohy, strukoviny, ryby a kvalitné tuky.</p><h2>Ako vyzerá tanier v praxi</h2><ul><li>Polovica taniera: zelenina.</li><li>Štvrtina: celozrnná príloha.</li><li>Štvrtina: bielkovina.</li><li>Tuk: lyžica olivového oleja alebo hrsť orechov.</li></ul><p><em>VitaScope · Životný štýl · Informácie nenahrádzajú individuálnu lekársku starostlivosť.</em></p>`,
    meta_description: "Vyvážená strava bez extrémov: stredomorský tanier v domácej kuchyni.",
  },
  de: {
    title: "Ausgewogene Ernährung ohne Extreme: der mediterrane Teller zu Hause",
    excerpt: "Vergessen Sie Crash-Diäten. Der mediterrane Teller lässt sich in die Hausküche übersetzen — Olivenöl, Saisongemüse und ein realistischer Wochenplan.",
    content: `<p>Der mediterrane Teller ist kein Urlaub in Griechenland, sondern ein praktisches Modell: viel Gemüse, Vollkornbeilagen, Hülsenfrüchte, Fisch und gute Fette.</p><h2>So sieht der Teller aus</h2><ul><li>Die Hälfte: Gemüse.</li><li>Ein Viertel: Vollkornbeilage.</li><li>Ein Viertel: Eiweiß.</li><li>Fett: ein Löffel Olivenöl oder eine Handvoll Nüsse.</li></ul><p><em>VitaScope · Lebensstil · Kein Ersatz für individuelle medizinische Versorgung.</em></p>`,
    meta_description: "Ausgewogene Ernährung ohne Extreme: mediterraner Teller zu Hause.",
  },
  fr: {
    title: "Une alimentation équilibrée sans extrêmes : l’assiette méditerranéenne à la maison",
    excerpt: "Oubliez les régimes drastiques. L’assiette méditerranéenne se traduit en cuisine maison — huile d’olive, légumes de saison et un plan hebdomadaire réaliste.",
    content: `<p>L’assiette méditerranéenne n’est pas des vacances en Grèce, mais un modèle pratique : beaucoup de légumes, des accompagnements complets, des légumineuses, du poisson et de bonnes graisses.</p><h2>À quoi ressemble l’assiette</h2><ul><li>La moitié : légumes.</li><li>Un quart : accompagnement complet.</li><li>Un quart : protéines.</li><li>Graisse : une cuillère d’huile d’olive ou une poignée de noix.</li></ul><p><em>VitaScope · Mode de vie · Ceci ne remplace pas des soins médicaux individuels.</em></p>`,
    meta_description: "Alimentation équilibrée sans extrêmes : assiette méditerranéenne à la maison.",
  },
  es: {
    title: "Alimentación equilibrada sin extremos: el plato mediterráneo en casa",
    excerpt: "Olvídese de las dietas drásticas. El plato mediterráneo se traduce a la cocina casera — aceite de oliva, verdura de temporada y un plan semanal realista.",
    content: `<p>El plato mediterráneo no es unas vacaciones en Grecia, sino un modelo práctico: mucha verdura, guarniciones integrales, legumbres, pescado y grasas de calidad.</p><h2>Cómo se ve el plato</h2><ul><li>La mitad: verdura.</li><li>Un cuarto: guarnición integral.</li><li>Un cuarto: proteína.</li><li>Grasa: una cucharada de aceite de oliva o un puñado de frutos secos.</li></ul><p><em>VitaScope · Estilo de vida · No sustituye una atención médica individual.</em></p>`,
    meta_description: "Alimentación equilibrada sin extremos: plato mediterráneo en casa.",
  },
  it: {
    title: "Alimentazione equilibrata senza estremi: il piatto mediterraneo a casa",
    excerpt: "Dimenticate le diete drastiche. Il piatto mediterraneo si traduce in cucina casalinga — olio d’oliva, verdure di stagione e un piano settimanale realistico.",
    content: `<p>Il piatto mediterraneo non è una vacanza in Grecia, ma un modello pratico: molta verdura, contorni integrali, legumi, pesce e grassi di qualità.</p><h2>Come si presenta il piatto</h2><ul><li>Metà piatto: verdura.</li><li>Un quarto: contorno integrale.</li><li>Un quarto: proteine.</li><li>Grasso: un cucchiaio d’olio d’oliva o una manciata di noci.</li></ul><p><em>VitaScope · Stile di vita · Non sostituisce le cure mediche individuali.</em></p>`,
    meta_description: "Alimentazione equilibrata senza estremi: piatto mediterraneo a casa.",
  },
  pl: {
    title: "Zrównoważona dieta bez skrajności: talerz śródziemnomorski w domu",
    excerpt: "Zapomnijcie o drastycznych dietach. Talerz śródziemnomorski da się przenieść do kuchni domowej — oliwa, sezonowe warzywa i realistyczny plan tygodnia.",
    content: `<p>Talerz śródziemnomorski to nie wakacje w Grecji, lecz praktyczny model: dużo warzyw, pełnoziarniste dodatki, rośliny strączkowe, ryby i dobre tłuszcze.</p><h2>Jak wygląda talerz</h2><ul><li>Połowa: warzywa.</li><li>Ćwierć: dodatek pełnoziarnisty.</li><li>Ćwierć: białko.</li><li>Tłuszcz: łyżka oliwy lub garść orzechów.</li></ul><p><em>VitaScope · Styl życia · Informacje nie zastępują indywidualnej opieki medycznej.</em></p>`,
    meta_description: "Zrównoważona dieta bez skrajności: talerz śródziemnomorski w domu.",
  },
  ro: {
    title: "Alimentație echilibrată fără extreme: farfuria mediteraneană acasă",
    excerpt: "Uitați dietele drastice. Farfuria mediteraneană se traduce în bucătăria de acasă — ulei de măsline, legume de sezon și un plan săptămânal realist.",
    content: `<p>Farfuria mediteraneană nu este o vacanță în Grecia, ci un model practic: multe legume, garnituri integrale, leguminoase, pește și grăsimi bune.</p><h2>Cum arată farfuria</h2><ul><li>Jumătate: legume.</li><li>Un sfert: garnitură integrală.</li><li>Un sfert: proteină.</li><li>Grăsime: o lingură de ulei de măsline sau un pumn de nuci.</li></ul><p><em>VitaScope · Stil de viață · Nu înlocuiește îngrijirea medicală individuală.</em></p>`,
    meta_description: "Alimentație echilibrată fără extreme: farfuria mediteraneană acasă.",
  },
  hu: {
    title: "Kiegyensúlyozott étkezés szélsőségek nélkül: mediterrán tányér otthon",
    excerpt: "Felejtse el a drasztikus diétákat. A mediterrán tányér átültethető a házi konyhába — olívaolaj, szezonális zöldség és reális heti terv.",
    content: `<p>A mediterrán tányér nem nyaralás Görögországban, hanem gyakorlati modell: sok zöldség, teljes kiőrlésű köret, hüvelyesek, hal és jó zsírok.</p><h2>Így néz ki a tányér</h2><ul><li>A fele: zöldség.</li><li>Negyede: teljes kiőrlésű köret.</li><li>Negyede: fehérje.</li><li>Zsír: egy kanál olívaolaj vagy egy marék dió.</li></ul><p><em>VitaScope · Életmód · Nem helyettesíti az egyéni orvosi ellátást.</em></p>`,
    meta_description: "Kiegyensúlyozott étkezés szélsőségek nélkül: mediterrán tányér otthon.",
  },
  ru: {
    title: "Сбалансированное питание без крайностей: средиземноморская тарелка дома",
    excerpt: "Забудьте о жёстких диетах. Средиземноморскую тарелку можно перенести на домашнюю кухню — оливковое масло, сезон овощей и реалистичный недельный план.",
    content: `<p>Средиземноморская тарелка — не отпуск в Греции, а практическая модель: много овощей, цельнозерновые гарниры, бобовые, рыба и качественные жиры.</p><h2>Как выглядит тарелка</h2><ul><li>Половина: овощи.</li><li>Четверть: цельнозерновой гарнир.</li><li>Четверть: белок.</li><li>Жир: ложка оливкового масла или горсть орехов.</li></ul><p><em>VitaScope · Образ жизни · Информация не заменяет индивидуальную медицинскую помощь.</em></p>`,
    meta_description: "Сбалансированное питание без крайностей: средиземноморская тарелка дома.",
  },
  uk: {
    title: "Збалансоване харчування без крайнощів: середземноморська тарілка вдома",
    excerpt: "Забудьте про жорсткі дієти. Середземноморську тарілку можна перенести на домашню кухню — оливкова олія, сезонні овочі й реалістичний тижневий план.",
    content: `<p>Середземноморська тарілка — не відпустка в Греції, а практична модель: багато овочів, цільнозернові гарніри, бобові, риба і якісні жири.</p><h2>Як виглядає тарілка</h2><ul><li>Половина: овочі.</li><li>Чверть: цільнозерновий гарнір.</li><li>Чверть: білок.</li><li>Жир: ложка оливкової олії або жменя горіхів.</li></ul><p><em>VitaScope · Спосіб життя · Інформація не замінює індивідуальну медичну допомогу.</em></p>`,
    meta_description: "Збалансоване харчування без крайнощів: середземноморська тарілка вдома.",
  },
  be: {
    title: "Збалансаванае харчаванне без крайнасцяў: міжземнаморская талерка дома",
    excerpt: "Забудзьце пра жорсткія дыеты. Міжземнаморскую талерку можна перанесці на хатнюю кухню — аліўкавы алей, сезонныя гародніна і рэалістычны тыднёвы план.",
    content: `<p>Міжземнаморская талерка — не адпачынак у Грэцыі, а практычная мадэль: шмат гародніны, цэльназерневыя гарніры, бабовыя, рыба і якасныя тлушчы.</p><h2>Як выглядае талерка</h2><ul><li>Палова: гародніна.</li><li>Чвэрць: цэльназерневы гарнір.</li><li>Чвэрць: бялок.</li><li>Тлушч: лыжка аліўкавага алею або жменя арэхаў.</li></ul><p><em>VitaScope · Лад жыцця · Інфармацыя не замяняе індывідуальную медыцынскую дапамогу.</em></p>`,
    meta_description: "Збалансаванае харчаванне без крайнасцяў: міжземнаморская талерка дома.",
  },
  ko: {
    title: "극단 없는 균형 식사: 집에서의 지중해식 접시",
    excerpt: "극단적 다이어트는 잊으세요. 지중해식 접시는 집 요리로 옮길 수 있습니다 — 올리브유, 제철 채소, 현실적인 주간 계획.",
    content: `<p>지중해식 접시는 그리스 휴가가 아니라 실용 모형입니다. 채소, 통곡 곁들임, 콩류, 생선, 좋은 지방.</p><h2>접시의 구성</h2><ul><li>절반: 채소.</li><li>4분의 1: 통곡 곁들임.</li><li>4분의 1: 단백질.</li><li>지방: 올리브유 한 숟갈 또는 견과 한 줌.</li></ul><p><em>VitaScope · 생활습관 · 개인 의료를 대체하지 않습니다.</em></p>`,
    meta_description: "극단 없는 균형 식사: 집에서의 지중해식 접시.",
  },
  vi: {
    title: "Ăn cân bằng không cực đoan: đĩa Địa Trung Hải ở nhà",
    excerpt: "Quên chế độ khắc nghiệt. Đĩa Địa Trung Hải chuyển được sang bếp nhà — dầu ô liu, rau theo mùa và kế hoạch tuần thực tế.",
    content: `<p>Đĩa Địa Trung Hải không phải kỳ nghỉ ở Hy Lạp, mà là mô hình thực tế: nhiều rau, món phụ nguyên cám, đậu, cá và chất béo tốt.</p><h2>Đĩa trông thế nào</h2><ul><li>Một nửa: rau.</li><li>Một phần tư: món phụ nguyên cám.</li><li>Một phần tư: đạm.</li><li>Chất béo: một thìa dầu ô liu hoặc một nắm hạt.</li></ul><p><em>VitaScope · Lối sống · Không thay chăm sóc y tế cá nhân.</em></p>`,
    meta_description: "Ăn cân bằng không cực đoan: đĩa Địa Trung Hải ở nhà.",
  },
  id: {
    title: "Makan seimbang tanpa ekstrem: piring Mediterania di rumah",
    excerpt: "Lupakan diet drastis. Piring Mediterania bisa diterjemahkan ke dapur rumah — minyak zaitun, sayur musim, dan rencana mingguan yang realistis.",
    content: `<p>Piring Mediterania bukan liburan di Yunani, melainkan model praktis: banyak sayur, lauk gandum utuh, kacang-kacangan, ikan, dan lemak berkualitas.</p><h2>Tampilan piring</h2><ul><li>Setengah: sayur.</li><li>Seperempat: lauk gandum utuh.</li><li>Seperempat: protein.</li><li>Lemak: sendok minyak zaitun atau genggam kacang.</li></ul><p><em>VitaScope · Gaya hidup · Tidak menggantikan perawatan medis pribadi.</em></p>`,
    meta_description: "Makan seimbang tanpa ekstrem: piring Mediterania di rumah.",
  },
  ja: {
    title: "極端のないバランス食：家庭の地中海プレート",
    excerpt: "過激なダイエットは忘れましょう。地中海プレートは家庭料理に移せます — オリーブオイル、旬の野菜、現実的な週間計画。",
    content: `<p>地中海プレートはギリシャ旅行ではなく、実用モデルです。野菜、全粒の付け合わせ、豆、魚、良質な脂質。</p><h2>皿の内訳</h2><ul><li>半分：野菜。</li><li>四分の一：全粒の付け合わせ。</li><li>四分の一：たんぱく質。</li><li>脂質：オリーブオイル一杯かナッツ一握り。</li></ul><p><em>VitaScope · 生活習慣 · 個別の医療の代替ではありません。</em></p>`,
    meta_description: "極端のないバランス食：家庭の地中海プレート。",
  },
  "zh-CN": {
    title: "不过度的均衡饮食：家里的地中海餐盘",
    excerpt: "忘掉极端节食。地中海餐盘可以落到家常菜里 — 橄榄油、时令蔬菜和现实的一周计划。",
    content: `<p>地中海餐盘不是去希腊度假，而是实用模型：大量蔬菜、全谷物配菜、豆类、鱼和优质脂肪。</p><h2>盘子怎么摆</h2><ul><li>一半：蔬菜。</li><li>四分之一：全谷物配菜。</li><li>四分之一：蛋白质。</li><li>脂肪：一勺橄榄油或一把坚果。</li></ul><p><em>VitaScope · 生活方式 · 不能替代个性化医疗。</em></p>`,
    meta_description: "不过度的均衡饮食：家里的地中海餐盘。",
  },
});

const HEALTHSPAN = pack({
  cs: {
    title: "Healthspan: co je důkaz a co je hype v dlouhověkosti",
    excerpt: "Spánek, pohyb, výživa a biomarkery — praktický rámec longevity bez biohackingové magie.",
    content: `<p>Dlouhověkost není o jednom suplementu. Healthspan — roky strávené ve zdraví — stojí na spánku, pohybu, stravě a kontrole rizik.</p><h2>Co má silnou evidenci</h2><ul><li>Pravidelný aerobní a silový pohyb.</li><li>7–9 hodin kvalitního spánku.</li><li>Kontrola krevního tlaku, lipidů a glykémie.</li></ul><p><em>VitaScope · Dlouhověkost · Edukační obsah, ne individuální doporučení.</em></p>`,
    meta_description: "Healthspan a dlouhověkost: důkaz vs. hype, spánek, pohyb a biomarkery.",
  },
  en: {
    title: "Healthspan: what is evidence and what is hype in longevity",
    excerpt: "Sleep, movement, nutrition and biomarkers — a practical longevity frame without biohacking magic.",
    content: `<p>Longevity is not one supplement. Healthspan — years spent in health — rests on sleep, movement, food and risk control.</p><h2>What has strong evidence</h2><ul><li>Regular aerobic and strength training.</li><li>7–9 hours of good sleep.</li><li>Control of blood pressure, lipids and glycaemia.</li></ul><p><em>VitaScope · Longevity · Educational content, not personal advice.</em></p>`,
    meta_description: "Healthspan and longevity: evidence versus hype, sleep, movement and biomarkers.",
  },
  sk: {
    title: "Healthspan: čo je dôkaz a čo je hype v dlhovekosti",
    excerpt: "Spánok, pohyb, výživa a biomarkery — praktický rámec longevity bez biohackingovej mágie.",
    content: `<p>Dlhovekosť nie je o jednom supplémente. Healthspan — roky strávené v zdraví — stojí na spánku, pohybe, strave a kontrole rizík.</p><h2>Čo má silnú evidenciu</h2><ul><li>Pravidelný aeróbny a silový pohyb.</li><li>7–9 hodín kvalitného spánku.</li><li>Kontrola krvného tlaku, lipidov a glykémie.</li></ul><p><em>VitaScope · Dlhovekosť · Edukačný obsah, nie individuálne odporúčanie.</em></p>`,
    meta_description: "Healthspan a dlhovekosť: dôkaz vs. hype, spánok, pohyb a biomarkery.",
  },
  de: {
    title: "Healthspan: was Evidenz ist und was Hype in der Langlebigkeit",
    excerpt: "Schlaf, Bewegung, Ernährung und Biomarker — ein praktischer Rahmen ohne Biohacking-Magie.",
    content: `<p>Langlebigkeit ist kein einzelnes Supplement. Healthspan — Jahre in Gesundheit — steht auf Schlaf, Bewegung, Ernährung und Risikokontrolle.</p><h2>Was starke Evidenz hat</h2><ul><li>Regelmäßiges Ausdauer- und Krafttraining.</li><li>7–9 Stunden guter Schlaf.</li><li>Kontrolle von Blutdruck, Lipiden und Glykämie.</li></ul><p><em>VitaScope · Langlebigkeit · Bildungsinhalt, keine individuelle Empfehlung.</em></p>`,
    meta_description: "Healthspan und Langlebigkeit: Evidenz gegen Hype, Schlaf, Bewegung, Biomarker.",
  },
  fr: {
    title: "Healthspan : ce qui est preuve et ce qui est battage dans la longévité",
    excerpt: "Sommeil, mouvement, nutrition et biomarqueurs — un cadre pratique sans magie du biohacking.",
    content: `<p>La longévité n’est pas un complément unique. L’healthspan — les années en santé — repose sur le sommeil, le mouvement, l’alimentation et le contrôle des risques.</p><h2>Ce qui a des preuves solides</h2><ul><li>Mouvement aérobie et musculation réguliers.</li><li>7–9 heures de bon sommeil.</li><li>Contrôle de la tension, des lipides et de la glycémie.</li></ul><p><em>VitaScope · Longévité · Contenu éducatif, pas un conseil individuel.</em></p>`,
    meta_description: "Healthspan et longévité : preuves contre battage, sommeil, mouvement, biomarqueurs.",
  },
  es: {
    title: "Healthspan: qué es evidencia y qué es bombo en la longevidad",
    excerpt: "Sueño, movimiento, nutrición y biomarcadores — un marco práctico sin magia del biohacking.",
    content: `<p>La longevidad no es un solo suplemento. El healthspan — años en salud — se sostiene en sueño, movimiento, comida y control de riesgos.</p><h2>Lo que tiene evidencia fuerte</h2><ul><li>Movimiento aeróbico y de fuerza regular.</li><li>7–9 horas de buen sueño.</li><li>Control de tensión, lípidos y glucemia.</li></ul><p><em>VitaScope · Longevidad · Contenido educativo, no un consejo individual.</em></p>`,
    meta_description: "Healthspan y longevidad: evidencia frente a bombo, sueño, movimiento, biomarcadores.",
  },
  it: {
    title: "Healthspan: cosa è evidenza e cosa è hype nella longevità",
    excerpt: "Sonno, movimento, nutrizione e biomarcatori — un quadro pratico senza magia del biohacking.",
    content: `<p>La longevità non è un integratore unico. L’healthspan — gli anni in salute — poggia su sonno, movimento, cibo e controllo dei rischi.</p><h2>Cosa ha evidenze solide</h2><ul><li>Movimento aerobico e di forza regolari.</li><li>7–9 ore di buon sonno.</li><li>Controllo di pressione, lipidi e glicemia.</li></ul><p><em>VitaScope · Longevità · Contenuto educativo, non un consiglio individuale.</em></p>`,
    meta_description: "Healthspan e longevità: evidenze contro hype, sonno, movimento, biomarcatori.",
  },
  pl: {
    title: "Healthspan: co jest dowodem, a co hype’em w długowieczności",
    excerpt: "Sen, ruch, żywienie i biomarkery — praktyczne ramy longevity bez magii biohackingu.",
    content: `<p>Długowieczność to nie jeden suplement. Healthspan — lata spędzone w zdrowiu — opiera się na śnie, ruchu, jedzeniu i kontroli ryzyka.</p><h2>Co ma mocne dowody</h2><ul><li>Regularny ruch tlenowy i siłowy.</li><li>7–9 godzin dobrego snu.</li><li>Kontrola ciśnienia, lipidów i glikemii.</li></ul><p><em>VitaScope · Długowieczność · Treść edukacyjna, nie indywidualna rada.</em></p>`,
    meta_description: "Healthspan i długowieczność: dowód kontra hype, sen, ruch, biomarkery.",
  },
  ro: {
    title: "Healthspan: ce este evidență și ce este hype în longevitate",
    excerpt: "Somn, mișcare, nutriție și biomarkeri — un cadru practic fără magia biohackingului.",
    content: `<p>Longevitatea nu este un singur supliment. Healthspan — anii petrecuți în sănătate — stă pe somn, mișcare, alimentație și controlul riscurilor.</p><h2>Ce are evidențe solide</h2><ul><li>Mișcare aerobică și de forță regulată.</li><li>7–9 ore de somn bun.</li><li>Controlul tensiunii, lipidelor și glicemiei.</li></ul><p><em>VitaScope · Longevitate · Conținut educațional, nu sfat individual.</em></p>`,
    meta_description: "Healthspan și longevitate: evidență versus hype, somn, mișcare, biomarkeri.",
  },
  hu: {
    title: "Healthspan: mi a bizonyíték, és mi a hype a hosszú életben",
    excerpt: "Alvás, mozgás, táplálkozás és biomarkerek — gyakorlati keret biohacking-varázslat nélkül.",
    content: `<p>A hosszú élet nem egyetlen étrend-kiegészítő. A healthspan — az egészségben töltött évek — alváson, mozgáson, étkezésen és rizikókontrollon áll.</p><h2>Aminek erős a bizonyítéka</h2><ul><li>Rendszeres aerob és erősítő mozgás.</li><li>7–9 óra minőségi alvás.</li><li>Vérnyomás, lipidek és vércukor ellenőrzése.</li></ul><p><em>VitaScope · Hosszú élet · Oktatási tartalom, nem egyéni tanács.</em></p>`,
    meta_description: "Healthspan és hosszú élet: bizonyíték a hype ellen, alvás, mozgás, biomarkerek.",
  },
  ru: {
    title: "Healthspan: что доказано, а что хайп в долголетии",
    excerpt: "Сон, движение, питание и биомаркеры — практическая рамка без магии биохакинга.",
    content: `<p>Долголетие — не одна добавка. Healthspan — годы в здоровье — стоит на сне, движении, питании и контроле рисков.</p><h2>У чего сильная доказательная база</h2><ul><li>Регулярная аэробная и силовая нагрузка.</li><li>7–9 часов качественного сна.</li><li>Контроль давления, липидов и гликемии.</li></ul><p><em>VitaScope · Долголетие · Образовательный материал, не индивидуальная рекомендация.</em></p>`,
    meta_description: "Healthspan и долголетие: доказательства против хайпа, сон, движение, биомаркеры.",
  },
  uk: {
    title: "Healthspan: що є доказом, а що хайпом у довголітті",
    excerpt: "Сон, рух, харчування і біомаркери — практична рамка без магії біохакінгу.",
    content: `<p>Довголіття — не одна добавка. Healthspan — роки в здоров’ї — стоїть на сні, русі, харчуванні і контролі ризиків.</p><h2>Що має сильну доказову базу</h2><ul><li>Регулярне аеробне і силове навантаження.</li><li>7–9 годин якісного сну.</li><li>Контроль тиску, ліпідів і глікемії.</li></ul><p><em>VitaScope · Довголіття · Освітній зміст, не індивідуальна порада.</em></p>`,
    meta_description: "Healthspan і довголіття: докази проти хайпу, сон, рух, біомаркери.",
  },
  be: {
    title: "Healthspan: што ёсць доказам, а што хайпам у даўгалецці",
    excerpt: "Сон, рух, харчаванне і біямаркеры — практычная рамка без магіі біяхакінгу.",
    content: `<p>Даўгалецце — не адна дабаўка. Healthspan — гады ў здароўі — стаіць на сне, руху, харчаванні і кантролі рызык.</p><h2>Што мае моцную доказную базу</h2><ul><li>Рэгулярная аэробная і сілавая нагрузка.</li><li>7–9 гадзін якаснага сну.</li><li>Кантроль ціску, ліпідаў і глікеміі.</li></ul><p><em>VitaScope · Даўгалецце · Адукацыйны змест, не індывідуальная парада.</em></p>`,
    meta_description: "Healthspan і даўгалецце: доказы супраць хайпу, сон, рух, біямаркеры.",
  },
  ko: {
    title: "Healthspan: 장수에서 근거와 과장은 무엇인가",
    excerpt: "수면, 움직임, 영양, 바이오마커 — 바이오해킹 마법 없는 실질적 틀.",
    content: `<p>장수는 한 가지 보충제가 아닙니다. Healthspan — 건강하게 보내는 해 — 는 수면, 움직임, 식사, 위험 관리에 달립니다.</p><h2>근거가 강한 것</h2><ul><li>규칙적인 유산소와 근력 운동.</li><li>질 좋은 수면 7–9시간.</li><li>혈압, 지질, 혈당 관리.</li></ul><p><em>VitaScope · 장수 · 교육 콘텐츠, 개인 조언 아님.</em></p>`,
    meta_description: "Healthspan과 장수: 근거 대 과장, 수면, 움직임, 바이오마커.",
  },
  vi: {
    title: "Healthspan: đâu là bằng chứng, đâu là thổi phồng trong trường thọ",
    excerpt: "Ngủ, vận động, dinh dưỡng và biomarker — khung thực tế không phép thuật biohacking.",
    content: `<p>Trường thọ không phải một thực phẩm bổ sung. Healthspan — số năm sống khỏe — dựa trên ngủ, vận động, ăn uống và kiểm soát nguy cơ.</p><h2>Điều có bằng chứng mạnh</h2><ul><li>Vận động aerobic và sức mạnh đều đặn.</li><li>7–9 giờ ngủ chất lượng.</li><li>Kiểm soát huyết áp, lipid và đường huyết.</li></ul><p><em>VitaScope · Trường thọ · Nội dung giáo dục, không phải lời khuyên cá nhân.</em></p>`,
    meta_description: "Healthspan và trường thọ: bằng chứng đối lại thổi phồng, ngủ, vận động, biomarker.",
  },
  id: {
    title: "Healthspan: mana bukti dan mana hype dalam umur panjang",
    excerpt: "Tidur, gerak, gizi, dan biomarker — kerangka praktis tanpa sihir biohacking.",
    content: `<p>Umur panjang bukan satu suplemen. Healthspan — tahun yang dihabiskan dalam sehat — berdiri pada tidur, gerak, makanan, dan kontrol risiko.</p><h2>Yang punya bukti kuat</h2><ul><li>Gerak aerobik dan kekuatan yang teratur.</li><li>7–9 jam tidur berkualitas.</li><li>Kontrol tekanan darah, lipid, dan glikemia.</li></ul><p><em>VitaScope · Umur panjang · Konten edukasi, bukan saran pribadi.</em></p>`,
    meta_description: "Healthspan dan umur panjang: bukti versus hype, tidur, gerak, biomarker.",
  },
  ja: {
    title: "Healthspan：長寿で根拠は何か、誇張は何か",
    excerpt: "睡眠、動き、栄養、バイオマーカー — バイオハッキングの魔法なしの実践枠。",
    content: `<p>長寿は一つのサプリではありません。Healthspan — 健康に過ごす年 — は睡眠、動き、食事、リスク管理に立ちます。</p><h2>根拠が強いこと</h2><ul><li>定期的な有酸素と筋力の動き。</li><li>質の良い睡眠 7–9 時間。</li><li>血圧、脂質、血糖の管理。</li></ul><p><em>VitaScope · 長寿 · 教育コンテンツであり、個別助言ではありません。</em></p>`,
    meta_description: "Healthspan と長寿：根拠対誇張、睡眠、動き、バイオマーカー。",
  },
  "zh-CN": {
    title: "Healthspan：长寿里什么是证据、什么是炒作",
    excerpt: "睡眠、运动、营养与生物标志物 — 没有生物黑客魔法的实用框架。",
    content: `<p>长寿不是一种补剂。Healthspan — 健康度过的年岁 — 建立在睡眠、运动、饮食和风险控制上。</p><h2>证据较强的方面</h2><ul><li>规律有氧与力量训练。</li><li>7–9 小时优质睡眠。</li><li>控制血压、血脂与血糖。</li></ul><p><em>VitaScope · 长寿 · 教育内容，非个性化建议。</em></p>`,
    meta_description: "Healthspan 与长寿：证据对照炒作，睡眠、运动、生物标志物。",
  },
});

const NEWS = pack({
  cs: {
    title: "Novinky: prevence v Česku — co sledovat tento měsíc",
    excerpt: "Přehled aktuálních témat veřejného zdraví pro čtenáře VitaScope — bez senzace, s kontextem.",
    content: `<p>Redakce VitaScope sleduje zprávy zdravotnických autorit a převádí je do srozumitelného kontextu.</p><h2>Na co se soustředit</h2><ul><li>Sezónní očkování a respirační infekce.</li><li>Screeningové programy a účast veřejnosti.</li><li>Bezpečnost léčiv a regulační novinky.</li></ul><p><em>VitaScope · Novinky · Krátký redakční přehled.</em></p>`,
    meta_description: "Aktuální přehled prevence a veřejného zdraví.",
  },
  en: {
    title: "News: prevention this month — what to watch",
    excerpt: "A short public-health round-up for VitaScope readers — no sensationalism, with context.",
    content: `<p>The VitaScope desk follows health authorities and turns the news into a clear context for readers.</p><h2>What to focus on</h2><ul><li>Seasonal vaccination and respiratory infections.</li><li>Screening programmes and public participation.</li><li>Medicine safety and regulatory updates.</li></ul><p><em>VitaScope · News · A short editorial briefing.</em></p>`,
    meta_description: "A current round-up of prevention and public health.",
  },
  sk: {
    title: "Novinky: prevencia — čo sledovať tento mesiac",
    excerpt: "Prehľad aktuálnych tém verejného zdravia pre čitateľov VitaScope — bez senzácie, s kontextom.",
    content: `<p>Redakcia VitaScope sleduje správy zdravotníckych autorít a prevádza ich do zrozumiteľného kontextu.</p><h2>Na čo sa sústrediť</h2><ul><li>Sezónne očkovanie a respiračné infekcie.</li><li>Skríningové programy a účasť verejnosti.</li><li>Bezpečnosť liekov a regulačné novinky.</li></ul><p><em>VitaScope · Novinky · Krátky redakčný prehľad.</em></p>`,
    meta_description: "Aktuálny prehľad prevencie a verejného zdravia.",
  },
  de: {
    title: "Nachrichten: Prävention in diesem Monat — worauf achten",
    excerpt: "Ein kurzer Überblick zur öffentlichen Gesundheit für VitaScope-Leser — ohne Sensationsmache.",
    content: `<p>Die VitaScope-Redaktion verfolgt Gesundheitsbehörden und setzt Meldungen in einen klaren Kontext.</p><h2>Worauf Sie achten sollten</h2><ul><li>Saisonale Impfung und Atemwegsinfekte.</li><li>Screening-Programme und Teilnahme der Öffentlichkeit.</li><li>Arzneimittelsicherheit und regulatorische Neuigkeiten.</li></ul><p><em>VitaScope · Nachrichten · Kurzes redaktionelles Briefing.</em></p>`,
    meta_description: "Aktueller Überblick zu Prävention und öffentlicher Gesundheit.",
  },
  fr: {
    title: "Actualités : la prévention ce mois-ci — quoi suivre",
    excerpt: "Un tour d’horizon santé publique pour les lecteurs de VitaScope — sans sensationnalisme.",
    content: `<p>La rédaction VitaScope suit les autorités sanitaires et remet les informations dans un contexte clair.</p><h2>Sur quoi se concentrer</h2><ul><li>Vaccination saisonnière et infections respiratoires.</li><li>Programmes de dépistage et participation du public.</li><li>Sécurité des médicaments et nouveautés réglementaires.</li></ul><p><em>VitaScope · Actualités · Bref point éditorial.</em></p>`,
    meta_description: "Tour d’horizon actuel de la prévention et de la santé publique.",
  },
  es: {
    title: "Noticias: prevención este mes — qué vigilar",
    excerpt: "Un resumen de salud pública para lectores de VitaScope — sin sensacionalismo.",
    content: `<p>La redacción de VitaScope sigue a las autoridades sanitarias y sitúa las noticias en un contexto claro.</p><h2>En qué centrarse</h2><ul><li>Vacunación estacional e infecciones respiratorias.</li><li>Programas de cribado y participación pública.</li><li>Seguridad de medicamentos y novedades regulatorias.</li></ul><p><em>VitaScope · Noticias · Breve informe editorial.</em></p>`,
    meta_description: "Resumen actual de prevención y salud pública.",
  },
  it: {
    title: "Notizie: prevenzione questo mese — cosa seguire",
    excerpt: "Una rassegna di salute pubblica per i lettori di VitaScope — senza sensazionalismo.",
    content: `<p>La redazione VitaScope segue le autorità sanitarie e mette le notizie in un contesto chiaro.</p><h2>Su cosa concentrarsi</h2><ul><li>Vaccinazione stagionale e infezioni respiratorie.</li><li>Programmi di screening e partecipazione del pubblico.</li><li>Sicurezza dei farmaci e novità regolatorie.</li></ul><p><em>VitaScope · Notizie · Breve briefing redazionale.</em></p>`,
    meta_description: "Rassegna attuale di prevenzione e salute pubblica.",
  },
  pl: {
    title: "Aktualności: profilaktyka w tym miesiącu — co śledzić",
    excerpt: "Krótki przegląd zdrowia publicznego dla czytelników VitaScope — bez sensacji.",
    content: `<p>Redakcja VitaScope śledzi komunikaty władz zdrowotnych i przekłada je na jasny kontekst.</p><h2>Na czym się skupić</h2><ul><li>Szczepienia sezonowe i infekcje oddechowe.</li><li>Programy przesiewowe i udział społeczeństwa.</li><li>Bezpieczeństwo leków i nowości regulacyjne.</li></ul><p><em>VitaScope · Aktualności · Krótki briefing redakcyjny.</em></p>`,
    meta_description: "Aktualny przegląd profilaktyki i zdrowia publicznego.",
  },
  ro: {
    title: "Știri: prevenție luna aceasta — ce merită urmărit",
    excerpt: "Un scurt tur de sănătate publică pentru cititorii VitaScope — fără senzațional.",
    content: `<p>Redacția VitaScope urmărește autoritățile de sănătate și pune știrile într-un context clar.</p><h2>Pe ce să vă concentrați</h2><ul><li>Vaccinare sezonieră și infecții respiratorii.</li><li>Programe de screening și participarea publicului.</li><li>Siguranța medicamentelor și noutăți de reglementare.</li></ul><p><em>VitaScope · Știri · Scurt briefing editorial.</em></p>`,
    meta_description: "Privire actuală asupra prevenției și sănătății publice.",
  },
  hu: {
    title: "Hírek: megelőzés ebben a hónapban — mire figyeljen",
    excerpt: "Rövid népegészségügyi körkép a VitaScope olvasóinak — szenzáció nélkül.",
    content: `<p>A VitaScope szerkesztősége követi az egészségügyi hatóságokat, és világos kontextusba helyezi a híreket.</p><h2>Mire koncentráljon</h2><ul><li>Szezonális oltás és légúti fertőzések.</li><li>Szűrőprogramok és a nyilvánosság részvétele.</li><li>Gyógyszerbiztonság és szabályozási újdonságok.</li></ul><p><em>VitaScope · Hírek · Rövid szerkesztőségi összefoglaló.</em></p>`,
    meta_description: "Aktuális körkép a megelőzésről és a népegészségről.",
  },
  ru: {
    title: "Новости: профилактика в этом месяце — на что смотреть",
    excerpt: "Краткий обзор общественного здоровья для читателей VitaScope — без сенсаций.",
    content: `<p>Редакция VitaScope следит за сообщениями органов здравоохранения и ставит новости в понятный контекст.</p><h2>На чём сосредоточиться</h2><ul><li>Сезонная вакцинация и респираторные инфекции.</li><li>Скрининговые программы и участие публики.</li><li>Безопасность лекарств и регуляторные новости.</li></ul><p><em>VitaScope · Новости · Краткий редакционный обзор.</em></p>`,
    meta_description: "Актуальный обзор профилактики и общественного здоровья.",
  },
  uk: {
    title: "Новини: профілактика цього місяця — на що зважати",
    excerpt: "Короткий огляд громадського здоров’я для читачів VitaScope — без сенсацій.",
    content: `<p>Редакція VitaScope стежить за повідомленнями органів охорони здоров’я і ставить новини в зрозумілий контекст.</p><h2>На чому зосередитися</h2><ul><li>Сезонна вакцинація і респіраторні інфекції.</li><li>Скринінгові програми і участь публіки.</li><li>Безпека ліків і регуляторні новини.</li></ul><p><em>VitaScope · Новини · Короткий редакційний огляд.</em></p>`,
    meta_description: "Актуальний огляд профілактики та громадського здоров’я.",
  },
  be: {
    title: "Навіны: прафілактыка ў гэтым месяцы — на што звяртаць увагу",
    excerpt: "Кароткі агляд грамадскага здароўя для чытачоў VitaScope — без сенсацый.",
    content: `<p>Рэдакцыя VitaScope сочыць за паведамленнямі органаў аховы здароўя і ставіць навіны ў зразумелы кантэкст.</p><h2>На чым засяродзіцца</h2><ul><li>Сезонная вакцынацыя і рэспіраторныя інфекцыі.</li><li>Скрынінгавыя праграмы і ўдзел публікі.</li><li>Бяспека лекаў і рэгулятарныя навіны.</li></ul><p><em>VitaScope · Навіны · Кароткі рэдакцыйны агляд.</em></p>`,
    meta_description: "Актуальны агляд прафілактыкі і грамадскага здароўя.",
  },
  ko: {
    title: "뉴스: 이번 달 예방 — 무엇을 볼까",
    excerpt: "VitaScope 독자를 위한 짧은 공중보건 정리 — 선정성 없이.",
    content: `<p>VitaScope 편집부는 보건 당국을 따르고 소식을 분명한 맥락으로 옮깁니다.</p><h2>어디에 집중할지</h2><ul><li>계절 예방접종과 호흡기 감염.</li><li>선별 프로그램과 대중의 참여.</li><li>의약품 안전과 규제 소식.</li></ul><p><em>VitaScope · 뉴스 · 짧은 편집 브리핑.</em></p>`,
    meta_description: "예방과 공중보건의 현재 정리.",
  },
  vi: {
    title: "Tin: phòng ngừa tháng này — nên theo dõi gì",
    excerpt: "Tóm tắt y tế công cộng ngắn cho độc giả VitaScope — không giật gân.",
    content: `<p>Tòa soạn VitaScope theo dõi cơ quan y tế và đặt tin vào ngữ cảnh rõ.</p><h2>Tập trung vào đâu</h2><ul><li>Tiêm theo mùa và nhiễm trùng hô hấp.</li><li>Chương trình tầm soát và sự tham gia của công chúng.</li><li>An toàn thuốc và tin quy định.</li></ul><p><em>VitaScope · Tin tức · Tóm tắt biên tập ngắn.</em></p>`,
    meta_description: "Tóm tắt hiện tại về phòng ngừa và y tế công cộng.",
  },
  id: {
    title: "Berita: pencegahan bulan ini — apa yang perlu dipantau",
    excerpt: "Ringkasan kesehatan masyarakat singkat untuk pembaca VitaScope — tanpa sensasi.",
    content: `<p>Meja redaksi VitaScope mengikuti otoritas kesehatan dan menempatkan berita dalam konteks yang jelas.</p><h2>Fokus pada apa</h2><ul><li>Vaksinasi musiman dan infeksi pernapasan.</li><li>Program skrining dan partisipasi publik.</li><li>Keamanan obat dan kabar regulasi.</li></ul><p><em>VitaScope · Berita · Briefing redaksi singkat.</em></p>`,
    meta_description: "Ringkasan terkini pencegahan dan kesehatan masyarakat.",
  },
  ja: {
    title: "ニュース：今月の予防 — 何を見るか",
    excerpt: "VitaScope 読者向けの短い公衆衛生まとめ — 扇情なし。",
    content: `<p>VitaScope 編集部は保健当局を追い、知らせをわかりやすい文脈に置き直します。</p><h2>何に集中するか</h2><ul><li>季節のワクチンと呼吸器感染症。</li><li>検診プログラムと市民の参加。</li><li>医薬品の安全と規制の動き。</li></ul><p><em>VitaScope · ニュース · 短い編集ブリーフィング。</em></p>`,
    meta_description: "予防と公衆衛生の当面のまとめ。",
  },
  "zh-CN": {
    title: "新闻：本月预防 — 该看什么",
    excerpt: "给 VitaScope 读者的公共卫生短讯 — 不做耸动。",
    content: `<p>VitaScope 编辑部跟踪卫生当局，把消息放进清楚的背景里。</p><h2>该关注什么</h2><ul><li>季节接种与呼吸道感染。</li><li>筛查项目与公众参与。</li><li>药品安全与监管动态。</li></ul><p><em>VitaScope · 新闻 · 短编辑简报。</em></p>`,
    meta_description: "预防与公共卫生的当前综述。",
  },
});

export const DEMO_ARTICLE_I18N: Record<string, Record<CopyLocale, DemoArticleCopy>> = {
  "verejnost-zivotni-styl-zdravy-spanek": SLEEP,
  "verejnost-prevence-screening-a-ockovani": PREVENTION,
  "verejnost-nemoci-kdy-vyhledat-lekare": SYMPTOMS,
  "verejnost-rozhovor-kardiolog-prevence-srdce": CARDIO,
  "verejnost-zivotni-styl-vyziva-bez-extremu": DIET,
  "demo-dlouhovekost-healthspan-zaklady": HEALTHSPAN,
  "demo-novinky-prevence-v-cesku": NEWS,
};

export function isDemoMagazineSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return slug.trim().toLowerCase() in DEMO_ARTICLE_I18N;
}

export function getDemoArticleTranslation(
  slug: string | null | undefined,
  locale?: string | null
): DemoArticleCopy | null {
  if (!slug) return null;
  const row = DEMO_ARTICLE_I18N[slug.trim().toLowerCase()];
  if (!row) return null;
  const key = pickCopyLocale(locale);
  return row[key] ?? row.en;
}

export function demoArticleLocaleTag(locale?: string | null): string {
  const key = pickCopyLocale(locale);
  return key === "en" ? "en" : key;
}
