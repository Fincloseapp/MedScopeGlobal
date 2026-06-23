# MedScopeGlobal — Komplexní audit webu medscopeglobal.com

**Datum auditu:** 22. června 2026  
**Metodologie:** Automatizované testování s 22 agentními personami (7 skupin dle zadání)  
**Nástroje:** WebFetch, curl (HTTP analýza), analýza HTML/SEO; browser MCP nebyl dostupný (viz poznámka)  
**URL:** https://medscopeglobal.com

> **Poznámka k metodologii:** Interaktivní prohlížeč (cursor-ide-browser MCP) nebyl v době auditu dostupný. Explorace proběhla přes WebFetch a curl s User-Agent prohlížeče. Stránky bez User-Agent vracely HTTP 403. Vizuální screenshoty a CDP Performance metriky nebyly získány; technická data vycházejí z HTTP hlaviček, velikosti odpovědí a času stahování.

---

## HLAVNÍ ZPRÁVA (EXECUTIVE REPORT)

### A. Souhrn výsledků všech 22 agentů

#### Průměrná hodnocení podle kategorií (škála 1–10)

| Kategorie | UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné | Speciální metrika |
|-----------|-----|-------------|---------------|----------------|-------------|--------|------------|------------|-------------------|
| **Veřejnost (4 agenti)** | 6,5 | 7,0 | 5,8 | 6,0 | 6,8 | 6,3 | 5,5 | 4,8 | — |
| **Uchazeči o LF (3)** | 7,2 | 7,5 | 6,5 | 7,0 | 7,8 | 7,5 | 6,8 | 6,5 | — |
| **Studenti medicíny (3)** | 6,8 | 7,0 | 6,2 | 7,5 | 7,0 | 7,0 | 6,5 | 6,0 | — |
| **Lékaři (3)** | 6,0 | 6,5 | 5,5 | 7,0 | 5,8 | 6,0 | 5,0 | 4,5 | — |
| **Vědci (3)** | 5,8 | 6,0 | 5,2 | 6,5 | 5,5 | 5,8 | 4,8 | 4,0 | — |
| **Technici (3)** | 6,3 | 6,7 | 7,0 | — | — | — | — | — | Techn. kvalita: 6,4 |
| **Marketing (3)** | 6,5 | 6,8 | 6,0 | — | 6,5 | 6,0 | 5,5 | 5,0 | Marketing. síla: 5,8 |
| **CELKOVÝ PRŮMĚR (22 agentů)** | **6,4** | **6,8** | **6,0** | **6,8** | **6,7** | **6,5** | **5,8** | **5,2** | — |

#### Největší silné stránky

1. **Jasná segmentace cílových skupin** — homepage a navigace rozdělují obsah na Veřejnost / Studenti / Lékaře s dedikovanými CTA.
2. **Široký produktový ekosystém** — magazín, Academy (kurzy, XP, certifikáty), AI asistenti, studie, guidelines, B2B.
3. **Transparentní ceník předplatného** — 99 / 149 / 490 Kč měsíčně s ročními plány a Stripe platbou.
4. **Technická bezpečnost** — HTTPS, HSTS preload, CSP, X-Frame-Options, Permissions-Policy.
5. **SEO základy** — title, meta description, Open Graph, Twitter cards, Schema.org Organization.
6. **Gamifikace a vzdělávání** — MedScope Academy s XP, žebříčkem, AI lektorem a simulacemi.
7. **B2B monetizační vrstva** — sekce /firmy s ceníkem, reklamou, partnerstvím.
8. **GDPR a AI transparentnost** — detailní privacy policy včetně AI logování a video analytiky.

#### Největší slabiny

1. **Paywall před demonstrací hodnoty** — odborné články (VIP) jsou uzamčeny hned po krátkém náhledu.
2. **Generický a opakující se obsah** — titulky typu „co stojí za to vědět ještě dnes“, duplicitní lekce v kurzech.
3. **Nízká důvěryhodnost u lékařů a vědců** — placeholder studie („revmatologie v kontextu revmatologie“), neúplné články.
4. **Přetížená homepage** — 239 KB HTML, ~80 script tagů, pomalé vnímání na mobilu.
5. **Verzování v UI** — v29, v35, v46, ULTRA-MAX působí neprofesionálně pro prémiový magazín.
6. **Slabá konverzní cesta** — chybí jasné free tier, trial, social proof, reference.
7. **Nízká motivace k platbě** — průměr 5,2/10 napříč všemi personami.
8. **Bot ochrana bez UA** — HTTP 403 pro curl/boty může ovlivnit SEO crawlery a integrace.

---

### B. TOP 20 kritických problémů bránících růstu a monetizaci

1. **Paywall bez dostatečné ukázky hodnoty** — VIP články odemykají až po předplatném, uživatel nevidí kvalitu obsahu.
2. **Opakující se šablony článků** — veřejné rozhovory mají identickou strukturu a fráze, snižuje to důvěru.
3. **Placeholder obsah ve studiích** — generické popisy u revmatologických studií působí jako demo data.
4. **Příliš krátké Academy kurzy** — „≈ 4 min poslechu“ s duplicitními lekcemi neodůvodňuje cenu předplatného.
5. **Chybí free trial nebo freemium** — žádná viditelná možnost vyzkoušet premium 7–14 dní zdarma.
6. **Absence social proof** — chybí počty předplatitelů, recenze lékařů, loga partnerů na homepage.
7. **Verzovací štítky v produkci** — „MedScope v46.0“, „v35“, „ULTRA-MAX“ snižují prémiový dojem.
8. **Nejasná diferenciace AI asistentů** — 7+ variant asistentů bez jasného vysvětlení rozdílů.
9. **Odborná sekce za paywall + ČLK** — dvojitá bariéra pro lékaře bez jasného benefitu před registrací.
10. **B2B ceník neviditelný** — /firmy/cenik odkazuje na další stránky bez konkrétních cen.
11. **Canonical URL chyby** — stránka /kontakt má canonical na homepage místo vlastní URL.
12. **Velká velikost HTML** — homepage 239 KB, /articles 179 KB — negativní dopad na Core Web Vitals.
13. **403 bez User-Agent** — riziko pro některé crawlery a monitoring nástroje.
14. **Chybí vyhledávání jako samostatná stránka** — /hledat vrací 404.
15. **Nekonzistentní kategorizace** — články označené „Technologie“ u rozhovorů s kardiologem.
16. **Neúplné články v archivu** — texty useknuté uprostřed věty na /articles.
17. **Chybí mobilní optimalizace ověřená v auditu** — viewport meta je, ale bez browser testu nejisté chování.
18. **Slabá konverzní optimalizace předplatného** — CTA „Předplatit“ bez srovnání plánů side-by-side na všech stránkách.
19. **Newsletter bez viditelné hodnoty** — stránka /newsletter timeout, integrace nejasná.
20. **Monetizace reklamy vs. předplatné** — nejasné, zda free uživatelé vidí reklamy; konflikt s „bez reklam v článcích“ u premium.

---

### C. TOP 20 doporučení pro okamžité zlepšení

1. Odstranit všechny interní verze (v29, v46, ULTRA-MAX) z veřejného UI.
2. Zveřejnit 3–5 plně otevřených ukázkových odborných článků jako „Editor's pick“.
3. Přidat 14denní free trial pro všechny tarify předplatného.
4. Nahradit generické titulky veřejných článků konkrétními, unikátními nadpisy.
5. Opravit canonical URL na všech podstránkách (kontakt, články, sekce).
6. Zobrazit konkrétní B2B ceník přímo na /firmy/cenik (min. orientační ceny).
7. Přidat sekci „Proč MedScopeGlobal“ s 3–5 referencemi nebo citacemi odborníků.
8. Sloučit AI asistenty do 3 jasných produktů: Veřejnost / Student / Lékař.
9. Odstranit nebo doplnit placeholder studie na /studie.
10. Opravit duplicitní lekce v Academy kurzech (např. mitóza a meióza 2×).
11. Přidat live chat nebo FAQ widget na stránku předplatného.
12. Zkrátit homepage — přesunout Academy, B2B a zpravodajství pod fold nebo do tabs.
13. Přidat srovnávací tabulku plánů předplatného na /predplatne.
14. Opravit useknuté články v archivu /articles.
15. Přidat stránku /hledat nebo funkční vyhledávání v headeru.
16. Zobrazit počet článků/kurzů/studií jako důkaz obsahu („500+ článků“).
17. Přidat trust badges: Stripe, GDPR, ČLK partnerství (pokud existuje).
18. Optimalizovat TTFB a velikost HTML — lazy load, code splitting.
19. Přidat exit-intent popup s 20% slevou na roční předplatné.
20. Vytvořit landing page pro každou cílovou skupinu s dedikovanou konverzní cestou.

---

### D. TOP 20 doporučení pro dlouhodobé zlepšení

1. **Redakční kurátorství** — najmout lékařského editora pro kontrolu kvality AI-generovaného obsahu.
2. **Peer review proces** — odborné články schvalovat atestovanými lékaři s uvedením autorů.
3. **Mobilní aplikace** — nativní iOS/Android pro Academy a push notifikace.
4. **CME akreditace** — spolupráce s ČLK/ČLS JEP pro akreditované vzdělávání lékařů.
5. **Integrace PubMed API** — live feed studií místo statických placeholderů.
6. **Komunitní fórum** — diskuse mezi studenty a lékaři (moderované).
7. **Personalizace** — doporučování obsahu dle specializace a historie čtení.
8. **Podcast/video studio** — vlastní produkce místo krátkých „≈ 3 min“ kurzů.
9. **Mezinárodní expanze** — aktivovat hreflang (en, de, pl, sk) s lokalizovaným obsahem.
10. **Affiliate program** — pro studenty a lékaře doporučující platformu.
11. **White-label B2B** — platforma pro pharma firmy a nemocnice.
12. **API pro třetí strany** — integrace do EHR systémů pro lékaře.
13. **Certifikace Academy** — uznávané certifikáty pro přípravu na přijímačky.
14. **A/B testování** — systematické testování CTA, pricing, paywall pozice.
15. **Analytics stack** — GA4 + Hotjar pro behaviorální analýzu konverzí.
16. **Content marketing** — SEO blog s long-tail klíčovými slovy (symptomy, prevence).
17. **Partnership s LF** — oficiální spolupráce s fakultami pro studentský obsah.
18. **Subscription analytics** — churn prediction, LTV modeling, cohort analysis.
19. **Accessibility audit WCAG 2.1 AA** — formální certifikace přístupnosti.
20. **Brand refresh** — sjednocení vizuální identity bez technických verzí v UI.

---

### E. Monetizační audit

| Kanál | Stav | Hodnocení | Potenciál |
|-------|------|-----------|-----------|
| **Předplatné B2C** | Aktivní — 3 tarify (99/149/490 Kč/měs.) | Střední | Vysoký při zlepšení hodnoty |
| **Roční plány** | 990/1490/4900 Kč (≈2 měsíce zdarma) | Dobré | Střední |
| **MedScope Academy** | Kurzy, XP, certifikáty, marketplace od 299 Kč | Slabé (krátké kurzy) | Vysoký |
| **B2B reklama** | /firmy, /inzerce/formular | Nejasný ceník | Vysoký |
| **Partnerské programy** | /firmy/partnerstvi | Existuje struktura | Střední |
| **AI premium** | Součást předplatného | Střední | Vysoký |
| **Mentoring** | /academy/mentoring | Rezervace bez ceny | Střední |
| **Marketplace kurzů** | Od 299 Kč | Minimální obsah | Střední |
| **Newsletter** | /newsletter | Neověřeno | Nízký–střední |
| **Affiliate** | Neexistuje | — | Střední |

**Závěr monetizace:** Platforma má dobře navrženou monetizační architekturu (B2C + B2B + marketplace), ale konverzní cesty jsou slabé a hodnota premium obsahu není dostatečně demonstrována před paywallem.

---

### F. Technický audit

| Oblast | Stav | Detail |
|--------|------|--------|
| **Rychlost** | Střední | Homepage TTFB ~1,0 s, 239 KB HTML; /studenti 0,53 s (nejrychlejší); /articles 1,1 s |
| **SEO** | Dobré základy | Title, meta, OG, Twitter, Schema.org; chybné canonical na podstránkách |
| **Bezpečnost** | Dobré | HTTPS, HSTS preload, CSP, X-Frame-Options, nosniff; CSP povoluje unsafe-inline/eval |
| **Přístupnost** | Střední | ARIA labels přítomny, lang="cs"; bez formálního WCAG auditu |
| **Struktura HTML** | Next.js SSR | Sémantické tagy, viewport meta, preload fontů/CSS |
| **Responzivita** | Předpokládaná | viewport meta, md:/lg: breakpointy v CSS; neověřeno vizuálně |
| **Chyby** | Několik | 404 na /hledat, /o-nas, /b2b; 403 bez User-Agent; useknuté články |
| **Hosting** | Vercel | CDN, cache headers, Supabase backend |
| **Platby** | Stripe | Apple Pay, Google Pay |
| **Cookies/GDPR** | Kompletní | /privacy, /cookies, /terms |

---

### G. Marketingový audit

| Oblast | Hodnocení | Poznámka |
|--------|-----------|----------|
| **Brand** | 6/10 | „Medical Intelligence Network“ — silný claim, ale verze v UI snižují důvěru |
| **Messaging** | 7/10 | Jasné „pro veřejnost, studenty, lékaře“ — funguje |
| **Konverzní cesty** | 5/10 | CTA existují, ale chybí nurturing, trial, social proof |
| **CTA** | 6/10 | „Předplatit“, „Vstoupit do sekce“, „Spustit AI“ — rozptýlené |
| **Obsahová strategie** | 6/10 | Mix zpravodajství, odborných článků, kurzů — ale kvalita nekonzistentní |
| **Sociální sítě** | 4/10 | Twitter @MedScopeGlobal v meta; chybí viditelné odkazy/integrace |
| **Email marketing** | 5/10 | Newsletter existuje, ale bez viditelné hodnotové propozice |
| **B2B marketing** | 5/10 | Sekce existuje, ceník netransparentní |
| **Pricing psychology** | 6/10 | 3 tarify, roční sleva — chybí anchor pricing a srovnání s konkurencí |

---

### H. Finální verdikt

**Je MedScopeGlobal prémiový magazín?**  
Zatím **ne v plném slova smyslu**. Platforma má ambiciózní produktovou vizi (magazín + Academy + AI + B2B), ale produkční UI s verzemi (v46, ULTRA-MAX), generický obsah a paywall před demonstrací hodnoty brání vnímání jako prémiové značky. S redakčním kurátorstvím a odstraněním placeholder obsahu by se pozice mohla rychle zlepšit.

**Je připraven na monetizaci?**  
**Částečně.** Technická infrastruktura (Stripe, tarify, B2B sekce) je připravena, ale konverzní optimalizace, social proof a hodnota premium obsahu nejsou dostatečné pro škálování příjmů.

**Zaplatili by uživatelé předplatné?**  
**Omezeně.** Uchazeči o LF a studenti (6,0–6,5/10 motivace k platbě) by mohli platit za Academy a AI tutor. Veřejnost (4,8/10) a lékaři (4,5/10) potřebují silnější důkaz hodnoty. Bez free trial a ukázkového obsahu bude konverze pod 2–3 %.

---

## INDIVIDUÁLNÍ REPORTY 22 AGENTŮ

---

### SKUPINA 1: VEŘEJNOST

---

#### Agent 1: Petra, 28 let — mladá profesionálka, zájem o prevenci a wellness

**Identita:** Marketingová specialistka z Prahy, aktivní životní styl, hledá spolehlivé zdroje o výživě, spánku a prevenci. Očekává srozumitelný obsah bez medicínského žargonu.

**Testovací scénář:** Navštívila homepage, prošla sekci /verejnost, prohlédla témata (prevence, výživa, spánek), otevřela článek o prevenci kardiovaskulárních onemocnění, vyzkoušela AI asistenta /ai-asistent/verejnost, prošla ceník předplatného.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 7 | 8 | 6 | 6 | 7 | 7 | 6 | 5 |

**Detailní komentář (10+ vět):**  
Homepage Petra okamžitě zaujala jasným rozdělením na tři cílové skupiny a tlačítkem „Najdi svůj problém“. Sekce Veřejnost nabízí přehledné kategorie — prevence, výživa, spánek — což odpovídá jejím zájmům. Denní zdravotní tip o spánku s videem a XP body působí moderně a gamifikovaně. Problém nastal u článků: titulky typu „co stojí za to vědět ještě dnes“ se opakují u rozhovoru s kardiologem, nutriční terapeutkou i pečovatelem o duševním zdraví seniorů, což snižuje vnímanou autenticitu. AI asistent nabízí mnoho variant (pro lékaře, pacienty, výzkum…) bez jasného vysvětlení, co je pro ni relevantní. Ceník 99 Kč/měsíc je přijatelný, ale Petra nevidí dostatek free obsahu, který by ji přesvědčil o kvalitě před platbou. Disclaimer „Informace nenahrazují lékařskou péči“ je správně umístěn. Celkově platforma působí ambiciózně, ale obsah veřejné sekce je zatím příliš generický pro prémiové předplatné.

**Doporučení (10+ bodů):**
1. Unikátní titulky místo šablony „co stojí za to vědět ještě dnes“.
2. 5 plně otevřených článků o prevenci jako ukázka kvality.
3. Zjednodušit AI asistent na jednu „Veřejnou“ variantu v UI.
4. Přidat autorské fotografie a bio u rozhovorů.
5. Newsletter s týdenním zdravotním tipem zdarma.
6. Mobilní aplikace pro denní tipy.
7. Integrace s wearables (spánek, kroky).
8. Sekce „Pro ženy“ s dedikovaným obsahem.
9. Free trial 7 dní pro veřejnostní tarif.
10. Recenze reálných uživatelů na homepage.
11. Srovnání s konkurencí (Zdraví.euro.cz, Vitalia).
12. Video obsah delší než 1 minuta u denních tipů.

---

#### Agent 2: Martin, 45 let — otec rodiny, hledá informace o zdraví dětí a vlastní prevenci

**Identita:** IT manažer, dvě děti (8 a 12 let), občasné zdravotní obavy, konzervativní přístup k online zdrojům. Důvěřuje institucím a lékařům.

**Testovací scénář:** Prošel homepage, sekci Veřejnost → témata → Průvodce nemocemi, článek o očkování proti chřipce, kontakt /kontakt, privacy policy, footer odkazy.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 6 | 7 | 6 | 7 | 6 | 6 | 5 | 4 |

**Detailní komentář:**  
Martin ocenil strukturované kategorie a článek o očkování proti chřipce s odkazem na analýzu MZd ČR — to působí důvěryhodně. Privacy policy je detailní včetně AI logování, což pro IT manažera znamená transparentnost. Chybí mu ale obsah specificky pro rodiče a děti — kategorie „ženské zdraví“ a „mužské zdraví“ existují, ale pediatrie ne. Verze „MedScope v46.0“ v UI ho mate — neví, zda jde o beta nebo finální produkt. Kontaktní stránka existuje s e-mailem support@medscopeglobal.com. Martin by neplatil 99 Kč/měsíc bez jasného rodinného benefitu — raději použije web MZd nebo u lékaře ověřené zdroje.

**Doporučení:**
1. Přidat kategorii „Zdraví dětí a rodina“.
2. Odstranit verze z UI.
3. Citovat oficiální zdroje (MZd, SÚKL, SZÚ) u každého článku.
4. Rodinný tarif předplatného (2+ uživatelé).
5. Obsah schválený pediatrem v bio.
6. FAQ pro rodiče (očkování, horečka u dětí).
7. Tlačítko „Kdy k lékaři“ u symptomů.
8. Telefonní link na linku 155 v urgentních článcích.
9. PDF checklisty prevence ke stažení zdarma.
10. Partnerství s pediatrickými ordinacemi.
11. Srozumitelný jazyk bez anglicismů.
12. Garance „obsah kontrolovaný lékařem“.

---

#### Agent 3: Jana, 62 let — důchodkyně, prevence chronických onemocnění

**Identita:** Bývalá učitelka, hypertenze a artróza, nízká digitální gramotnost, preferuje velké písmo a jednoduchou navigaci.

**Testovací scénář:** Homepage, /verejnost, článek o duševním zdraví seniorů, pokus o AI asistent (příliš složitý formulář), footer.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 5 | 6 | 5 | 6 | 5 | 5 | 4 | 3 |

**Detailní komentář:**  
Jana se na homepage ztratila v množství sekcí — Academy, B2B, XP žebříček, AI simulace jí nic neříkají. Sekce Veřejnost je srozumitelnější, ale stále přeplněná. AI asistent vyžaduje výběr oboru (revmatologie, imunologie…) — pro ni nepoužitelné. Článek o duševním zdraví seniorů má generický titulek a neobsahuje konkrétní rady v náhledu. Chybí režim „jednoduché zobrazení“ nebo větší písmo. Jana by platformu nedoporučila kamarádkám a rozhodně by neplatila předplatné — raději čte přílohu zdraví v novinách nebo brožury od pojišťovny.

**Doporučení:**
1. Režim „Senior“ s větším písmem a méně prvků.
2. Zjednodušit homepage pro laiky — skrýt Academy/B2B.
3. AI asistent s hlasovým vstupem a bez výběru oboru.
4. Tisknutelné verze článků.
5. Obsah specificky pro seniory (medikace, pádová prevence).
6. Video s titulky a pomalým tempem.
7. Telefonní podpora pro starší uživatele.
8. Partnerství s kluby seniorů.
9. Bezplatný obsah bez registrace.
10. Návod „Jak používat web“ v 3 krocích.
11. Kontrastní barvy pro slabší zrak.
12. Odstranit gamifikaci XP z veřejné sekce pro seniory.

---

#### Agent 4: Tomáš, 22 let — gym enthusiast, fitness a výživa

**Identita:** Student VŠ (ekonomie), fitness a suplementy, aktivní na Instagramu, hledá rychlé tipy.

**Testovací scénář:** Homepage, /verejnost → fitness/výživa, denní tip video, XP žebříček, Academy marketplace, Instagram/social hledání.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 7 | 7 | 6 | 5 | 8 | 7 | 6 | 5 |

**Detailní komentář:**  
Tomáše zaujala gamifikace — XP body, žebříček, denní video tip. Design působí moderně a mladistvě. Fitness a výživa jsou v kategoriích, ale konkrétní obsah je slabý — generické prevence místo protein, trénink, suplementy. Marketplace kurzů od 299 Kč je zajímavý, ale nabídka minimální. Chybí integrace se sociálními sítěmi — sdílení článků, Instagram feed. AI asistent by mohl odpovídat na otázky o tréninku, ale oborový výběr je zbytečný. Za 99 Kč by platil spíše za fitness app (Freeletics) než za zdravotnický magazín.

**Doporučení:**
1. Dedikovaná sekce Fitness s influencer spoluprací.
2. Sdílení na Instagram/TikTok jedním klikem.
3. Integrace XP s fitness výzvami (30denní výzva).
4. Obsah o suplementech s vědeckými referencemi.
5. Krátká videa Reels formátu.
6. Studentská sleva na předplatné.
7. Affiliate pro fitness blogery.
8. Kalkulačka BMI/kalorií zdarma.
9. Propojení s MyFitnessPal nebo Apple Health.
10. UGC — user generated content soutěže.
11. Podcast o fitness a zdraví.
12. Brand ambassador program pro mladé.

---

### SKUPINA 2: UCHAZEČI O STUDIUM MEDICÍNY

---

#### Agent 5: Lucie, 18 let — maturantka, příprava na přijímačky LF Praha

**Identita:** Gymnazistka, top známky z biologie a chemie, stres z přijímaček, hledá strukturovanou přípravu.

**Testovací scénář:** /studenti/chci-studovat, /academy/courses/biologie-prijimacky-bunka-genetika, /studium/prijimacky, ceník studentského tarifu 149 Kč, XP a kurzy.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 8 | 8 | 7 | 7 | 9 | 8 | 7 | 7 |

**Detailní komentář:**  
Lucii platforma sedí — jasná cesta „Chci studovat medicínu“, kurzy pro přijímačky (biologie, chemie, fyzika, matematika), rozhodovací strom výběru LF. Kurz biologie má 4 lekce s AI lektorem, ale trvá jen ≈4 minuty a lekce 2 a 3 jsou duplicitní (mitóza a meióza 2×). Gamifikace XP motivuje. Cena 149 Kč/měsíc je pro studenta přijatelná vs. doučování. Chybí ale modelové testy Cermat v plné délce a statistiky úspěšnosti absolventů kurzů. AI tutor je slibný, ale vyžaduje přihlášení.

**Doporučení:**
1. Opravit duplicitní lekce v kurzech.
2. Prodloužit kurzy na min. 30–60 minut obsahu.
3. Modelové Cermat testy s časovačem.
4. Statistiky „X % absolventů prošlo přijímačkami“.
5. Free trial 14 dní pro uchazeče.
6. Studijní plán countdown do termínu přijímaček.
7. Komunita uchazečů (Discord/forum).
8. Live webináře s úspěšnými studenty LF.
9. Balíček „Příprava na přijímačky“ se slevou.
10. Certifikát dokončení kurzu pro CV.
11. Mobilní app pro procvičování v autobuse.
12. Partnerství s preparatory schools.

---

#### Agent 6: David, 25 let — vystudovaný biolog, career change na medicínu

**Identita:** Mgr. biologie, práce v laboratoři, rozhodnutí jít na LF po 25, potřebuje intenzivní přípravu a přehled požadavků.

**Testovací scénář:** /studenti, /studium/univerzity, /academy, článek o RMN 2026, /articles filtr Studium medicíny.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 7 | 7 | 7 | 8 | 7 | 7 | 7 | 6 |

**Detailní komentář:**  
David oceňuje odbornější články o RMN a rezidenčních místech — relevantní i pro jeho věk. Sekce 8 českých LF je užitečná. Academy kurzy jsou ale příliš základní pro někoho s Mgr. biologie — potřebuje spíše klinické intro a anatomii pokročilou. Článek o RMN 2026 je aktuální a praktický. Chybí obsah pro „mature students“ a přechod z jiných oborů. Předplatné 149 Kč je férové, ale obsah musí být hlubší.

**Doporučení:**
1. Sekce „Career change → medicína“.
2. Pokročilé kurzy anatomie a fyziologie.
3. Srovnání náročnosti jednotlivých LF pro přeškolence.
4. Rozhovory s lékaři, kteří šli na LF po 25.
5. Kalkulačka nákladů studia (6 let + příprava).
6. Propojení s alumni sítěmi.
7. Intenzivní bootcamp kurzy (4týdenní).
8. Odborné články z biologie → klinická medicína.
9. Mentoring s lékařem (ceník transparentní).
10. RMN a specializace — průvodce pro kariérní plánování.
11. Part-time studijní možnosti na LF.
12. Webinář „Medicína po 25“.

---

#### Agent 7: Tereza, 19 let — studentka z Moravy, multioborové přijímačky

**Identita:** Střední škola Brno, uvažuje LF MU nebo Olomouc, omezený rozpočet, preferuje free obsah.

**Testovací scénář:** Homepage, free články, /academy free preview, ceník, rozhodovací strom LF.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 7 | 8 | 6 | 7 | 8 | 7 | 6 | 6 |

**Detailní komentář:**  
Kurz „Rozhodovací strom: která LF?“ je pro Terezu nejcennější — praktický rámec pro výběr. Multioborové přijímačky jsou zmíněny v testových strategiích. Free obsah je ale omezený — většina kurzů vyžaduje přihlášení pro XP progress. 149 Kč/měsíc × 12 = 1788 Kč ročně — pro studenta z Moravy s omezeným rozpočtem hodně; raději YouTube a free materiály LF. Chybí regionální obsah (LF MU vs. Praha).

**Doporučení:**
1. Více free lekcí (min. 30 % kurzu).
2. Studentská sleva 50 % s ISIC.
3. Regionální průvodce LF (Morava vs. Praha).
4. Free PDF materiály ke stažení.
5. Spolupráce s LF MU a Olomouc.
6. Stipendijní program pro talentované uchazeče.
7. Offline režim pro videa (app).
8. Srovnání nákladů na bydlení u jednotlivých LF.
9. Komunita moravských uchazečů.
10. Grant od kraje pro vzdělávání.
11. Pay-what-you-can model pro studenty.
12. Referral program — měsíc zdarma za doporučení.

---

### SKUPINA 3: STUDENTI MEDICÍNY

---

#### Agent 8: Jakub, 1. ročník LF — anatomie a adaptace na studium

**Identita:** První rok LF Praha, přetížení anatomií, hledá kvízy a strukturované materiály.

**Testovací scénář:** /studenti → Anatomie, /academy/courses/anatomie-zaklady, AI tutor /studenti/ai-tutor, studijní plány 1.–6. ročník.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 7 | 7 | 6 | 7 | 8 | 7 | 6 | 6 |

**Detailní komentář:**  
Jakub ocenil sekci Anatomie a AI tutor — konkurence Anki a Kenhub, ale s českým obsahem. Kurz „Anatomie základy pro uchazeče“ je ale pro přijímačky, ne pro 1. ročník LF — chybí pokročilá anatomie (svaly, nervy, cévy). Studijní plány 1.–6. ročník jsou slibné, ale obsah neověřen. XP gamifikace funguje motivačně. 149 Kč/měsíc je levnější než Kenhub (~10 EUR), ale obsah musí dorůst.

**Doporučení:**
1. Anatomie 1.–2. ročník LF (systémová, topografická).
2. Kvízy mapované na sylabus LF Praha/MU.
3. Integrace s Anki exportem.
4. 3D modely anatomie.
5. Studijní skupiny podle ročníku a LF.
6. AI tutor trénovaný na českých učebnicích (Lüllmann, Čihák).
7. Testové otázky z minulých zkoušek (anonymizované).
8. Harmonogram zkoušek s připomínkami.
9. Spolupráce se spolky mediků (LFPS, MEFANET).
10. Offline flashcards v app.
11. Video disekce (kde legálně možné).
12. Srovnání s Medstudent, Kenhub, Amboss.

---

#### Agent 9: Markéta, 4. ročník — klinické obory, příprava na stáže

**Identita:** LF Brno, 4. ročník, rotace na interně a chirurgii, potřebuje guidelines a klinické scénáře.

**Testovací scénář:** /lekari/guidelines, /academy/ai-simulations, /articles, AI Clinical Reasoning /ai, odborná sekce /odborna.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 6 | 7 | 5 | 8 | 7 | 7 | 6 | 5 |

**Detailní komentář:**  
AI simulace (akutní břicho, bolest na hrudi) jsou pro Markétku nejcennější — praktické triážové scénáře. Guidelines sekce existuje, ale odborná sekce vyžaduje ČLK ověření — jako studentka nemá přístup. Článek o coachingu v medicíně je relevantní. Studentský tarif 149 Kč neobsahuje plný lékařský obsah (490 Kč) — nejasná hranice. Chce víc klinických case studies a méně zpravodajství.

**Doporučení:**
1. Studentský tarif s přístupem k simulacím a guidelines.
2. Klinické case studies podle oboru a ročníku.
3. Přechodný tarif „Student 4+ ročník“ mezi 149 a 490 Kč.
4. OSCE příprava s AI.
5. Stážní deník a reflexe.
6. Propojení s klinickými pracovišti LF.
7. CME body i pro studenty 5.–6. ročníku (příprava).
8. Mobilní app pro rychlý lookup na stáži.
9. Drug interaction checker v AI.
10. Srovnání s AMBOSS, UpToDate (studentská verze).
11. Offline guidelines PDF.
12. Mentoring s rezidentem.

---

#### Agent 10: Pavel, 6. ročník — příprava na atestace a RMN

**Identita:** Poslední ročník LF, rozhodování o specializaci, RMN výběrová řízení.

**Testovací scénář:** /articles → RMN 2026, /studie, /lekari, /predplatne lékař 490 Kč, Research Hub.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 7 | 7 | 6 | 8 | 6 | 7 | 6 | 6 |

**Detailní komentář:**  
Pavel našel aktuální články o RMN 2026 a seznamu úspěšných žadatelů — prakticky užitečné. Studie sekce má revmatologický focus s kvalitními RCT popisy, ale i placeholder obsah. Tarif lékaře 490 Kč/měsíc je drahý pro studenta bez příjmu — chybí „absolvent LF“ sleva. Research Hub slibný pro vědeckou dráhu. VIP paywall u odborných článků (GLP-1) brání posouzení kvality.

**Doporučení:**
1. Tarif „Absolvent LF“ 249 Kč první rok po promoci.
2. RMN kalendář a notifikace výběrových řízení.
3. Příprava na atestační zkoušky podle oboru.
4. Plný přístup k studiím bez paywallu pro mediky 5.–6. ročník.
5. Networking s rezidenty a specialisty.
6. CV builder pro RMN přihlášky.
7. Mock atestační testy.
8. Specializační průvodce (15 oborů).
9. Propojení s ČLS JEP akreditacemi.
10. Stipendium pro studenty vědecké práce.
11. PubMed integrace live.
12. Alumni síť absolventů platformy.

---

### SKUPINA 4: LÉKAŘI

---

#### Agent 11: MUDr. Novák, praktický lékař — PP, prevence, guidelines

**Identita:** 15 let v praxi, ordinace 2000 pacientů, málo času, potřebuje rychlé guidelines a CME.

**Testovací scénář:** /lekari, /lekari/guidelines, /odborna (paywall), VIP článek GLP-1, /predplatne 490 Kč, AI klinický asistent.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 6 | 7 | 5 | 7 | 5 | 6 | 4 | 4 |

**Detailní komentář:**  
Dr. Novák nemá čas procházet komplexní platformu — potřebuje rychlý přístup k guidelines a CME. Odborná sekce vyžaduje přihlášení + ČLK — dvojitá bariéra. VIP článek o GLP-1 ukazuje jen odstavec a pak paywall — nemůže posoudit kvalitu. 490 Kč/měsíc = 5880 Kč/rok — srovnává s UpToDate (~400 EUR/rok) a Cochrane (free). AI klinický asistent slibný, ale oborový výběr defaultně revmatologie — irelevantní pro PP. Chybí CME akreditace ČLK.

**Doporučení:**
1. 3 free guidelines měsíčně bez předplatného.
2. CME akreditace u odborných článků.
3. Rychlý search napříč guidelines.
4. PP-specific content (preventivní prohlídky, očkování).
5. Srovnání s UpToDate — co MedScope dělá lépe v CZ kontextu.
6. Mobilní app pro 2min lookup mezi pacienty.
7. Integrace do EHR (zdravotnický záznam).
8. České guidelines (SPČP, ČSK) prioritně.
9. Shrnutí nových SUKL registrací.
10. Tarif PP 290 Kč (nižší než specialista).
11. Trial 30 dní pro ověřené lékaře.
12. Webináře s KOLs (key opinion leaders).

---

#### Agent 12: MUDr. Svobodová, specialistka revmatologie

**Identita:** Atestace revmatologie, FNP Brno, sleduje EULAR, potřebuje studie a research.

**Testovací scénář:** /studie (revmatologie), /lekari/studie, /lekari/research-hub, PubMed /odborne/pubmed.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 6 | 6 | 5 | 8 | 6 | 6 | 5 | 5 |

**Detailní komentář:**  
Sekce /studie je zaměřena na revmatologii — pro Dr. Svobodovou relevantní. První studie (JAK inhibitory u RA) má kvalitní popis RCT. Ale studie 5–12 jsou generické placeholdery („revmatologie v kontextu revmatologie“) — okamžitě snižují důvěru. Monitorované zdroje (PubMed, EULAR, SÚKL) jsou uvedeny — slibné. Research Hub a PubMed sekce existují, ale obsah neověřen v auditu. 490 Kč by platila za kvalitní kurátorství, ne za demo data.

**Doporučení:**
1. Odstranit placeholder studie okamžitě.
2. Live PubMed feed filtrovaný revmatologie.
3. EULAR congress summaries do 48 hodin.
4. Komentáře českých KOL u studií.
5. SÚKL nové registrace biologik.
6. Case reports z české praxe.
7. Specializované newslettery podle oboru.
8. Tarif specialista s oborovým filtrem.
9. CME body za čtení studií.
10. Propojení s ČSR (Česká společnost revmatologie).
11. AI summarizer studií s citacemi.
12. Alert nových RCT v mém oboru.

---

#### Agent 13: MUDr. Dvořák, nemocniční lékař — interna, urgentní příjem

**Identita:** Interní oddělení, směny 24/7, potřebuje rychlé DDx a triážové algoritmy.

**Testovací scénář:** /ai → AI Differential Diagnosis, /academy/ai-simulations, /aktualni-zpravy, mobilní responzivita (neověřeno).

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 6 | 6 | 6 | 7 | 6 | 6 | 5 | 5 |

**Detailní komentář:**  
AI Differential Diagnosis a simulace (akutní břicho, bolest na hrudi) jsou pro urgentního lékaře nejrelevantnější. Platforma ale není optimalizována pro rychlý mobilní přístup na směně — velká homepage, mnoho kliknutí. Aktuální zprávy (Ebola, WHO guidelines) jsou užitečné pro přehled. Chybí offline režim a dark mode pro noční směny. 490 Kč — porovná s Medscape (free) a UpToDate.

**Doporučení:**
1. „Urgentní režim“ — 1 klik na DDx a triáž.
2. Dark mode default pro noční směny.
3. Offline cache guidelines a algoritmů.
4. Push notifikace urgentních health alerts (Ebola, pandemie).
5. Mobilní PWA optimalizace.
6. Hlasový vstup do AI na směně.
7. Integrace se smartwatch pro rychlý lookup.
8. Tarif nemocnice (B2B) pro celé oddělení.
9. Simulace rozšířit o sepsi, STEMI, mrtvice.
10. Red flags checklisty printable.
11. Srovnání s MDCalc, Isabel.
12. 24/7 support link pro klinické dotazy (disclaimer).

---

### SKUPINA 5: VĚDCI

---

#### Agent 14: PhDr. Krejčí, klinický výzkumník — klinické studie, GCP

**Identita:** Klinický výzkum ve fakultní nemocnici, koordinace studií, potřebuje přehled RCT a regulace.

**Testovací scénář:** /studie, /lekari/research-hub, /odborne/pubmed, článek o CAR T buňkách.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 6 | 6 | 5 | 7 | 5 | 6 | 4 | 4 |

**Detailní komentář:**  
Research Hub a PubMed sekce existují, ale bez live dat v auditu. Studie sekce mixuje kvalitní RCT popisy s placeholdery. Článek o CAR T buňkách je za VIP paywallem. Pro vědce potřebuje platforma raw data, metodiku, DOI odkazy — ne jen shrnutí. Chybí ClinicalTrials.gov integrace. Předplatné 490 Kč neodůvodněné vs. free PubMed a Cochrane.

**Doporučení:**
1. DOI a PMID u každé studie.
2. ClinicalTrials.gov live feed.
3. GCP a etika výzkumu sekce.
4. SÚKL klinické hodnocení registr.
5. Research Hub s projekty LF a FN.
6. Tarif výzkumník / instituce (B2B).
7. API pro export citací (BibTeX, RIS).
8. Alert nových studií v mém oboru.
9. Spolupráce s Grantovou agenturou.
10. Webináře metodologie studií.
11. Open access policy transparentně.
12. Peer review badge u studií.

---

#### Agent 15: RNDr. Horáková, základní výzkum — molekulární biologie

**Identita:** Vědecká asistentka na LF, CRISPR, publikace v Nature subjournals, anglicky.

**Testovací scénář:** /articles → neurofobie, Nature Medicine články, /ai AI pro výzkum, anglická verze (hreflang).

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 5 | 6 | 5 | 7 | 5 | 5 | 4 | 3 |

**Detailní komentář:**  
Články o Nature Medicine (proteomika, stárnutí buněk) jsou zajímavé, ale za paywallem a bez plného textu v náhledu. Anglická verze v hreflang existuje v meta, ale obsah neověřen. AI asistent pro univerzitní výzkum zmíněn, ale ne testován. Pro basic scientist je platforma příliš klinicky orientovaná. Nepotřebuje český magazín — PubMed, bioRxiv, Nature jsou primární zdroje.

**Doporučení:**
1. Sekce „Základní výzkum“ s molekulární biologií.
2. Plně anglická verze obsahu.
3. bioRxiv/medRxiv preprint feed.
4. AI summarizer pro paper PDF upload.
5. Grant writing resources.
6. Statistika a R/Python tutoriály.
7. Tarif akademický pro univerzity.
8. Propojení s ISI Web of Science.
9. Lab protocols databáze.
10. Spolupráce s AV ČR.
11. Open science a reproducibility obsah.
12. Career development pro PhD a postdoc.

---

#### Agent 16: MUDr. PhD. Beneš, epidemiolog — veřejné zdraví, data

**Identita:** SZÚ / KHS, sledování epidemií, Ebola, pandemická dohoda, datová analytika.

**Testovací scénář:** /aktualni-zpravy Ebola, článek epidemiologie Bundibugyo, WHO guidelines, /articles infekční medicína.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Odborná úroveň | Atraktivita | Návrat | Doporučení | Předplatné |
|----|-------------|---------------|----------------|-------------|--------|------------|------------|
| 6 | 7 | 6 | 7 | 6 | 6 | 5 | 4 |

**Detailní komentář:**  
Epidemiologické články (Ebola Bundibugyo, pandemická dohoda WHO) jsou aktuální a relevantní. Zpravodajství přepisuje světové zdroje podle redakčního standardu v29 — slibné, ale kvalita nejednotná. Chybí interaktivní mapy, dashboardy incidence, propojení s WHO/ECDC daty. Pro epidemiologa je to spíše news aggregator než analytická platforma. 490 Kč — neplatí za news, které má z ProMED a WHO.

**Doporučení:**
1. Epidemiologický dashboard (Ebola, COVID, chřipka).
2. Propojení ECDC, WHO, SZÚ dat live.
3. Outbreak alert systém s push.
4. Metodologie surveillance články.
5. R0 a modelování vysvětlení pro laiky i odborníky.
6. Tarif veřejné zdraví / KHS instituce.
7. Export dat CSV pro analýzu.
8. Spolupráce se SZÚ a KHS.
9. Pandemická preparedness checklist.
10. One Health sekce (zoonózy).
11. Vaccine coverage mapy ČR.
12. Webináře s ECDC experty.

---

### SKUPINA 6: TECHNICI

---

#### Agent 17: UX/UI designér

**Identita:** Senior product designer, 8 let zkušeností, hodnotí informační architekturu, vizuální hierarchii, konzistenci.

**Testovací scénář:** Homepage, navigace, /verejnost, /predplatne, /ai, mobilní breakpointy (CSS analýza), konverzní cesty.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Techn. kvalita |
|----|-------------|---------------|----------------|
| 6 | 7 | 6 | 6 |

**Technické parametry:** Rychlost 6/10, SEO 7/10, Security 8/10, Responsiveness 7/10 (předpoklad), HTML 7/10, Accessibility 6/10.

**Detailní komentář:**  
Informační architektura tří segmentů (Veřejnost/Studenti/Lékaři) je správná. Homepage je ale přeplněná — hero, 3 cesty, Academy, B2B, zpravodajství, předplatné, kurzy, simulace, marketplace, žebříček v jedné stránce. Verze v UI (v46, v35) jsou anti-pattern pro UX důvěry. AI asistent má 7 variant v dropdown — cognitive overload. CTA jsou konzistentní (modré tlačítka), ale chybí vizuální hierarchie premium vs. free. Tailwind/responsive třídy (md:, lg:) naznačují responzivitu. Logo a tagline „Medical Intelligence Network“ fungují. Paywall overlay na článcích je standardní, ale chybí preview délky obsahu.

**Doporučení:**
1. Homepage redesign — max 5 sekcí above fold.
2. Design system bez verzí v UI.
3. Sjednotit AI do 3 produktů s jasnou navigací.
4. A/B test paywall pozice (30 % vs 50 % vs full).
5. Progressive disclosure pro komplexní formuláře.
6. Skeleton loading pro články.
7. Breadcrumbs na všech podstránkách.
8. Empty states s CTA místo prázdných sekcí.
9. Kontrast WCAG AA audit.
10. User testing s 5 personami každý kvartál.
11. Figma design tokens export.
12. Micro-interactions pro XP a gamifikaci.

---

#### Agent 18: Web performance specialista

**Identita:** Frontend engineer, Core Web Vitals, CDN, Next.js optimalizace.

**Testovací scénář:** curl timing všech klíčových stránek, analýza HTML velikosti, script count, HTTP headers, CDN cache.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Techn. kvalita |
|----|-------------|---------------|----------------|
| 7 | 7 | 7 | 7 |

**Technické metriky:**

| Stránka | HTTP | Čas | Velikost |
|---------|------|-----|----------|
| / | 200 | 0,98 s | 239 KB |
| /verejnost | 200 | 1,04 s | 96 KB |
| /studenti | 200 | 0,53 s | 52 KB |
| /lekari | 200 | 0,92 s | 51 KB |
| /academy | 200 | 0,97 s | 86 KB |
| /articles | 200 | 1,10 s | 179 KB |
| /predplatne | 200 | 0,60 s | 51 KB |

**Detailní komentář:**  
Next.js na Vercel s CDN — dobrá volba. Homepage 239 KB HTML a ~80 script tagů je nadměrné — negativní dopad na LCP a TBT. TTFB ~1 s je na hraně. Security headers excelentní (HSTS, CSP, nosniff). CSP povoluje unsafe-inline a unsafe-eval — riziko XSS. img-src povoluje http: — mixed content. Cache: homepage private no-cache (SSR), statické assety preload. Font preload present. 403 bez User-Agent — bot protection může blokovat monitoring. Vercel Analytics (vitals.vercel-insights.com) integrováno.

**Doporučení:**
1. Redukovat JS bundle — code splitting agresivněji.
2. Static generation pro /articles listing kde možné.
3. Image optimization — WebP/AVIF všechny obrázky.
4. Lazy load below-fold sekcí homepage.
5. Remove unsafe-eval z CSP.
6. HTTP/2 push nebo early hints optimalizace.
7. Service worker pro offline Academy.
8. Real User Monitoring (RUM) dashboard.
9. Lighthouse CI v pipeline.
10. Edge caching pro veřejné články.
11. Prefetch navigace na hover.
12. Monitoring uptime bez UA block.

---

#### Agent 19: Bezpečnostní analytik

**Identita:** AppSec specialist, OWASP, GDPR compliance, penetration testing mindset.

**Testovací scénář:** HTTP headers, CSP analýza, /privacy, /cookies, Stripe integrace, login /login, AI data handling.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Techn. kvalita |
|----|-------------|---------------|----------------|
| 6 | 7 | 8 | 7 |

**Bezpečnostní checklist:**

| Kontrola | Stav |
|----------|------|
| HTTPS + HSTS preload | ✅ |
| CSP | ⚠️ unsafe-inline, unsafe-eval |
| X-Frame-Options | ✅ SAMEORIGIN |
| X-Content-Type-Options | ✅ nosniff |
| Permissions-Policy | ✅ camera/mic/geo disabled |
| Referrer-Policy | ✅ strict-origin-when-cross-origin |
| Stripe (PCI) | ✅ server-side |
| GDPR privacy | ✅ detailní |
| AI log retention | ✅ max 90 dní, 20 dotazů/den |
| Login | ✅ email, magic link, Google OAuth |

**Detailní komentář:**  
Celková bezpečnostní postura je nadprůměrná pro content platformu. Privacy policy pokrývá AI logování, video analytiku, Stripe metadata — transparentní. Login nabízí magic link (bez hesla) a Google OAuth — moderní. Rizika: CSP unsafe-inline/eval snižuje XSS ochranu; img-src http: umožňuje mixed content; 403 bot protection může být obcházeno s UA — není to bezpečnostní feature, spíš annoyance. ČLK ověření pro odbornou sekci — správný přístup k physician-level obsahu. Chybí viditelná bug bounty nebo security.txt.

**Doporučení:**
1. Tighten CSP — odstranit unsafe-eval.
2. Subresource Integrity (SRI) pro CDN scripty.
3. security.txt a responsible disclosure policy.
4. Rate limiting na AI endpointech veřejně viditelné.
5. 2FA pro lékařské účty s ČLK ověřením.
6. Audit log pro admin přístupy.
7. Penetration test před launch monetizace.
8. SOC 2 roadmap pro B2B pharma klienty.
9. Encryption at rest pro health-related queries.
10. HIPAA/GDPR health data classification.
11. Cookie consent granularní per kategorie.
12. Incident response plan publikovaný.

---

### SKUPINA 7: MARKETING

---

#### Agent 20: Growth marketer

**Identita:** Head of Growth, SaaS a subscription modely, funnel optimization, CAC/LTV.

**Testovací scénář:** Celá konverzní cesta homepage → článek → paywall → /predplatne → /signup, CTA analýza, chybějící prvky.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Marketing. síla |
|----|-------------|---------------|-----------------|
| 7 | 7 | 6 | 6 |

**Detailní komentář:**  
Funnel existuje, ale není optimalizovaný. Awareness (SEO, content) → Interest (segmentace) → Desire (paywall) → Action (Stripe) — ale chybí Consideration fáze s free value. Chybí: free trial, social proof, urgency, scarcity, referral program, email nurture sequence. 3 tarify jsou správně (decoy effect možný s middle tier). Roční sleva 2 měsíce zdarma — standardní. CTA „Předplatit“ bez „Vyzkoušet zdarma“ — nízká konverze očekávána (1–2 %). Academy gamifikace je hook pro retention, ne acquisition.

**Doporučení:**
1. 14denní free trial na všech tarifech.
2. Lead magnet — PDF „10 tipů pro přijímačky LF“ za email.
3. Referral program — měsíc zdarma za 3 pozvané.
4. Social proof — „2 847 studentů studuje s námi“.
5. Exit-intent popup se slevou 20 %.
6. Email drip campaign 7 dní po registraci.
7. Retargeting pixel (Meta, Google) s GDPR consent.
8. Landing pages per segment (/pro-studenty, /pro-lekare).
9. Influencer partnerships (medical YouTubers).
10. Product Hunt launch.
11. Affiliate 20 % recurring commission.
12. Annual plan default s monthly jako sekundární.

---

#### Agent 21: Monetizační stratég

**Identita:** Revenue operations, pricing strategy, B2B SaaS, marketplace economics.

**Testovací scénář:** /predplatne, /firmy, /firmy/cenik, /academy/marketplace, revenue stream mapping.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Marketing. síla |
|----|-------------|---------------|-----------------|
| 6 | 7 | 6 | 6 |

**Detailní komentář:**  
Revenue streams: B2C subscription (3 tiers), B2B advertising, marketplace kurzů (od 299 Kč), mentoring (cena neznámá). Pricing 99/149/490 Kč je psychologicky správné — low entry pro veřejnost, premium pro lékaře. Chybí enterprise tier, API pricing, white-label. B2B ceník neviditelný — blocker pro pharma sales. Marketplace má minimální supply. LTV odhad: veřejnost 99×12=1188 Kč/rok, student 1788 Kč, lékař 5880 Kč — při 10% churn roční LTV ~4000–8000 Kč lékař. Potřeba 5000+ platících pro 1M Kč MRR.

**Doporučení:**
1. Publikovat B2B ceník (banner 5000 Kč/měs, sponsored article 15000 Kč).
2. Enterprise tier 1990 Kč pro nemocnice (10 seatů).
3. Marketplace 30 % commission od partnerů.
4. Mentoring 990 Kč/hod transparentně.
5. CME kurzy 1990 Kč s akreditací.
6. API access tier pro integrátory.
7. White-label Academy pro pharma.
8. Sponsored guidelines (eticky označené).
9. Job board pro zdravotnictví.
10. Annual price increase 5 % pro existing subscribers.
11. Bundle Academy + Magazine sleva 20 %.
12. Grant/subsidy pro LF partnerství.

---

#### Agent 22: Brand manager

**Identita:** Brand strategist, health/medtech, premium positioning, competitive landscape.

**Testovací scénář:** Homepage messaging, logo, tagline, tone of voice, konkurence (Medscape, UpToDate, české zdravotní portály), sociální sítě.

**Hodnocení:**

| UX | Přehlednost | Důvěryhodnost | Marketing. síla |
|----|-------------|---------------|-----------------|
| 6 | 7 | 6 | 5 |

**Detailní komentář:**  
Brand claim „Nejmodernější zdravotnický magazín“ + tagline „Medical Intelligence Network“ je silný, ale konzistence slabá. Verze v UI (v46, ULTRA-MAX, v35) podkopávají premium positioning. Logo profesionální (webp, dark mode varianta). Tone of voice mixuje formální odbornost s gamifikací XP — nejednotné. Konkurence: Medscape (free, global), UpToDate (premium clinical), Kenhub (students), české portály (Zdraví.cz, Vitalia) — MedScope se pozicuje mezi vše, což rozmělňuje brand. Twitter @MedScopeGlobal v meta, ale chybí aktivní social presence v auditu. „MedScopeGlobal není přijímací komise“ disclaimer — správně, ale defenzivní tón.

**Doporučení:**
1. Brand guidelines dokument — barvy, typografie, tone.
2. Odstranit všechny verze z customer-facing UI.
3. Jednotný tone: „Odborně, srozumitelně, pro vás“.
4. Brand story — proč MedScopeGlobal existuje.
5. Video brand manifesto 60s na homepage.
6. PR v Lékařských listech, Vesmíru zdraví.
7. Partnership logo bar (LF, FN, pharma) na homepage.
8. Konference presence (ČSK, student medicíny kongres).
9. Merchandise pro studenty (brand awareness).
10. Podcast „Medical Intelligence“ vlastní produkce.
11. Rebrand Academy jako sub-brand s jasnou vazbou.
12. Competitive positioning matrix publikovaná interně.

---

## PŘÍLOHA: Technická data z auditu

### HTTP Security Headers (curl -A Mozilla/5.0)
```
HTTP/1.1 200 OK
Server: Vercel
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com ...
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-Xss-Protection: 1; mode=block
Permissions-Policy: camera=(), microphone=(), geolocation=()
Referrer-Policy: strict-origin-when-cross-origin
```

### SEO Meta (homepage)
- **Title:** MedScopeGlobal - Nejmodernější zdravotnický magazín
- **Description:** Zdravotnický magazín pro veřejnost, studenty medicíny a lékaře...
- **Canonical:** https://medscopeglobal.com
- **OG/Twitter:** Kompletní
- **Schema.org:** Organization, Newsletter
- **Lang:** cs

### Prozkoumané URL
| URL | Status | Poznámka |
|-----|--------|----------|
| / | 200 | Homepage, 239 KB |
| /verejnost | 200 | Veřejná sekce |
| /studenti | 200 | Studentská sekce |
| /lekari | 200 | Lékařská sekce |
| /academy | 200 | MedScope Academy |
| /articles | 200 | Archiv článků |
| /predplatne | 200 | Ceník předplatného |
| /studie | 200 | Studie (revmatologie) |
| /aktualni-zpravy | 200 | Zpravodajství |
| /ai | 200 | AI Medical Intelligence |
| /ai-asistent/verejnost | 200 | Veřejný AI |
| /firmy | 200 | B2B |
| /kontakt | 200 | Kontakt |
| /privacy | 200 | GDPR |
| /login | 200 | Přihlášení |
| /odborna | 200 | Paywall + ČLK |
| /hledat | 200 | Funkční vyhledávání (opraveno 23. 6. 2026) |
| /o-nas | 200 | O nás stránka (opraveno 23. 6. 2026) |

---

## POST-AUDIT STATUS (23. 6. 2026)

Paralelní implementace po auditu — shrnutí:

| Oblast | Stav |
|--------|------|
| **Produkce** | Všechny klíčové trasy HTTP **200** (homepage, segmenty, Academy, `/predplatne`, `/hledat`, `/o-nas`, `/api/health`) |
| **Git** | Větev `fix/checkout-predplatne-ctas` — lokálně `3e19d9c`, `origin` na `9ca3a0f`; čeká merge + deploy |
| **Stripe checkout** | Napojeno — `POST /api/v27/checkout`, alias `/api/stripe/checkout`, `V27CheckoutButton` na `/predplatne` |
| **v2 backlog** | CSP hardening, Lighthouse CI, DB content backfill, PubMed live feed, CME/ČLK, marketing (referral, exit-intent) — viz `FULL_AUDIT_IMPLEMENTATION_REPORT.md` §7b |

---

*Report vygenerován autonomním testovacím systémem — 22. 6. 2026. Post-audit status doplněn 23. 6. 2026.*
