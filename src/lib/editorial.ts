import type { Locale } from '@/lib/types';

export type EditorialCopy = {
  eyebrow?: string;
  headline: string;
  body: string;
};

const CATEGORY_COPY: Record<string, { it: EditorialCopy; en: EditorialCopy }> = {
  women: {
    it: {
      eyebrow: 'Donna',
      headline: 'Intimates per ogni giorno.',
      body: 'Una selezione curata di reggiseni, slip e lingerie: comfort preciso, linee morbide, brand che parlano italiano di eleganza.',
    },
    en: {
      eyebrow: 'Women',
      headline: 'Intimates for every day.',
      body: 'A curated edit of bras, knickers and lingerie—precise comfort, soft lines, brands that speak the language of quiet elegance.',
    },
  },
  men: {
    it: {
      eyebrow: 'Uomo',
      headline: 'Essenziale, senza sforzo.',
      body: 'Boxer, brief e tops pensati per la quotidianità: tessuti tecnici, tagli puliti, una quiete che si indossa.',
    },
    en: {
      eyebrow: 'Men',
      headline: 'Essential, effortless.',
      body: 'Boxers, briefs and tops for daily wear—technical fabrics, clean cuts, a quiet confidence you put on.',
    },
  },
  kids: {
    it: {
      eyebrow: 'Bambini',
      headline: 'Morbido come il gioco.',
      body: 'Intimo, canottiere e pigiami in cotone gentile sulla pelle dei più piccoli. Cuciture piatte, colori sereni, cura da boutique.',
    },
    en: {
      eyebrow: 'Kids',
      headline: 'As soft as play.',
      body: 'Underwear, undershirts and pyjamas in cotton that’s gentle on little skin. Flat seams, calm colours, boutique care.',
    },
  },
  'kids-underwear': {
    it: {
      eyebrow: 'Intimo bimbo',
      headline: 'La prima base.',
      body: 'Slip in cotone morbido, cuciture piatte e vestibilità comoda per accompagnare ogni giornata di gioco.',
    },
    en: {
      eyebrow: 'Kids underwear',
      headline: 'The first layer.',
      body: 'Soft cotton briefs with flat seams and easy fit, made to follow every day of play.',
    },
  },
  'kids-undershirts': {
    it: {
      eyebrow: 'Canottiere',
      headline: 'Leggerezza quotidiana.',
      body: 'Canottiere in cotone traspirante, perfette come strato sotto tutto. Semplici, morbide, resistenti al lavaggio.',
    },
    en: {
      eyebrow: 'Undershirts',
      headline: 'Everyday lightness.',
      body: 'Breathable cotton undershirts, perfect as a base under everything. Simple, soft, wash after wash.',
    },
  },
  'kids-pyjamas': {
    it: {
      eyebrow: 'Pigiami',
      headline: 'Il rituale della buonanotte.',
      body: 'Pigiami in jersey caldo con stampe delicate. Comfort che accompagna dolcemente verso il sonno.',
    },
    en: {
      eyebrow: 'Pyjamas',
      headline: 'The goodnight ritual.',
      body: 'Warm jersey pyjamas with gentle prints. Comfort that eases the way into sleep.',
    },
  },
  'kids-socks': {
    it: {
      eyebrow: 'Calze bimbo',
      headline: 'Piccoli passi.',
      body: 'Calze in cotone elasticizzato con polsino comfort. Multipack pensati per la settimana intera.',
    },
    en: {
      eyebrow: 'Kids socks',
      headline: 'Little steps.',
      body: 'Stretch cotton socks with a comfort cuff. Multipacks made for the whole week.',
    },
  },
  bras: {
    it: {
      eyebrow: 'Reggiseni',
      headline: 'Sostegno che non si vede.',
      body: 'Dalla soft cup al balconcino: forme che rispettano il corpo, dettagli che restano discreti sotto i vestiti.',
    },
    en: {
      eyebrow: 'Bras',
      headline: 'Support you don’t see.',
      body: 'From soft cup to balconette—shapes that honour the body, details that stay discreet under clothes.',
    },
  },
  knickers: {
    it: {
      eyebrow: 'Slip',
      headline: 'La base di tutto.',
      body: 'Tagli essenziali e tessuti che restano sulla pelle tutto il giorno. Una collezione pensata per ripetere, non per esibire.',
    },
    en: {
      eyebrow: 'Knickers',
      headline: 'The foundation of everything.',
      body: 'Essential cuts and fabrics made for all-day wear. A collection meant to repeat, not to perform.',
    },
  },
  lingerie: {
    it: {
      eyebrow: 'Lingerie',
      headline: 'Intimità in luce.',
      body: 'Body, set e pezzi speciali: pizzo, seta e linee che trasformano la sera senza alzare la voce.',
    },
    en: {
      eyebrow: 'Lingerie',
      headline: 'Intimacy in soft light.',
      body: 'Bodies, sets and special pieces—lace, silk and lines that elevate the evening without raising the volume.',
    },
  },
  knitwear: {
    it: {
      eyebrow: 'Maglieria',
      headline: 'Morbidezza strutturata.',
      body: 'Maglie e pezzi da casa che uniscono comfort e presenza. Una texture che si sente prima di vedersi.',
    },
    en: {
      eyebrow: 'Knitwear',
      headline: 'Structured softness.',
      body: 'Knits and lounge pieces that balance comfort and presence. Texture you feel before you see.',
    },
  },
  nightwear: {
    it: {
      eyebrow: 'Notte',
      headline: 'Il rituale della sera.',
      body: 'Camicie da notte e pigiami con la stessa cura della giornata: linee lunghe, tessuti che respirano, quiete.',
    },
    en: {
      eyebrow: 'Nightwear',
      headline: 'The evening ritual.',
      body: 'Nightdresses and sleepwear with the same care as daywear—long lines, breathing fabrics, quiet.',
    },
  },
  boxers: {
    it: {
      eyebrow: 'Boxer',
      headline: 'Libertà misurata.',
      body: 'Tagli moderni, elastici invisibili, tessuti che seguono il movimento senza trattenere.',
    },
    en: {
      eyebrow: 'Boxers',
      headline: 'Measured freedom.',
      body: 'Modern cuts, invisible elastics, fabrics that follow movement without holding back.',
    },
  },
  briefs: {
    it: {
      eyebrow: 'Slip uomo',
      headline: 'Precisione quotidiana.',
      body: 'Forme essenziali e vestibilità sicura. Il dettaglio che fa la differenza è ciò che non si nota.',
    },
    en: {
      eyebrow: 'Briefs',
      headline: 'Daily precision.',
      body: 'Essential shapes and secure fit. The detail that matters is the one you don’t notice.',
    },
  },
  tops: {
    it: {
      eyebrow: 'Tops',
      headline: 'Strato dopo strato.',
      body: 'Canotte e t-shirt pensate come base: purezza di linea, comfort che regge l’intera giornata.',
    },
    en: {
      eyebrow: 'Tops',
      headline: 'Layer by layer.',
      body: 'Vests and tees designed as a base—clean lines, comfort that carries the whole day.',
    },
  },
  easywear: {
    it: {
      eyebrow: 'Easywear',
      headline: 'Casa, senza compromessi.',
      body: 'Pezzi da indossare appena fuori dal ritmo: morbidi, ordinati, pronti a restare.',
    },
    en: {
      eyebrow: 'Easywear',
      headline: 'Home, without compromise.',
      body: 'Pieces for the moment you step out of pace—soft, ordered, ready to stay.',
    },
  },
  socks: {
    it: {
      eyebrow: 'Calze',
      headline: 'Il dettaglio finale.',
      body: 'Calze scelte per texture e durata. Un piccolo gesto che chiude l’abito.',
    },
    en: {
      eyebrow: 'Socks',
      headline: 'The finishing detail.',
      body: 'Socks chosen for texture and longevity. A small gesture that completes the look.',
    },
  },
  swimsuits: {
    it: {
      eyebrow: 'Mare',
      headline: 'Luce e movimento.',
      body: 'Costumi con linee nette e tessuti che tengono. Una selezione per chi cerca presenza anche al sole.',
    },
    en: {
      eyebrow: 'Swim',
      headline: 'Light and movement.',
      body: 'Swimwear with clean lines and fabrics that hold. A selection for presence under the sun.',
    },
  },
};

const BRAND_COPY: Record<string, { it: EditorialCopy; en: EditorialCopy }> = {
  'la-perla': {
    it: {
      headline: 'Lusso italiano, da sempre.',
      body: 'La Perla porta a HARIMI la tradizione del corsetto reinventata: pizzo prezioso, silhouette scultoree, un’eleganza che non chiede permesso.',
    },
    en: {
      headline: 'Italian luxury, always.',
      body: 'La Perla brings to HARIMI the tradition of the corset reinvented—precious lace, sculptural silhouettes, elegance that never asks permission.',
    },
  },
  thirdlove: {
    it: {
      headline: 'Fit che ascolta.',
      body: 'ThirdLove nasce dal bisogno di taglie vere. Su HARIMI trovi supporto intelligente e design contemporaneo, senza rumore.',
    },
    en: {
      headline: 'Fit that listens.',
      body: 'ThirdLove grew from the need for real sizes. At HARIMI: intelligent support and contemporary design, without noise.',
    },
  },
  'calvin-klein': {
    it: {
      headline: 'Minimalismo iconico.',
      body: 'Calvin Klein: linee nette, logo discreto, una modernità che resta. Essenziali per chi cerca chiarezza sotto i vestiti.',
    },
    en: {
      headline: 'Iconic minimalism.',
      body: 'Calvin Klein: clean lines, quiet logo, modernity that lasts. Essentials for clarity under clothes.',
    },
  },
  'victorias-secret': {
    it: {
      headline: 'Glamour accessibile.',
      body: 'Victoria’s Secret su HARIMI: seduzione soft, comfort aggiornato, pezzi che attraversano stagione e umore.',
    },
    en: {
      headline: 'Accessible glamour.',
      body: 'Victoria’s Secret at HARIMI—soft seduction, updated comfort, pieces that move through season and mood.',
    },
  },
  'agent-provocateur': {
    it: {
      headline: 'Audacia raffinata.',
      body: 'Agent Provocateur: lingerie come dichiarazione. Tagli teatrali, dettagli couture, una presenza che non si scusa.',
    },
    en: {
      headline: 'Refined audacity.',
      body: 'Agent Provocateur—lingerie as a statement. Theatrical cuts, couture detail, presence that never apologises.',
    },
  },
  'savage-x-fenty': {
    it: {
      headline: 'Inclusione con stile.',
      body: 'Savage X Fenty porta energia e inclusività. Colori, taglie e attitude: intimates che festeggiano il corpo.',
    },
    en: {
      headline: 'Inclusion with style.',
      body: 'Savage X Fenty brings energy and inclusivity. Colour, size and attitude—intimates that celebrate the body.',
    },
  },
  aerie: {
    it: {
      headline: 'Comfort senza filtri.',
      body: 'Aerie è soft life: tessuti elastici, messaggi positivi, pezzi pensati per sentirsi a casa nella propria pelle.',
    },
    en: {
      headline: 'Comfort, unfiltered.',
      body: 'Aerie is soft living—stretch fabrics, positive codes, pieces made to feel at home in your own skin.',
    },
  },
  'hanky-panky': {
    it: {
      headline: 'Lace che resta.',
      body: 'Hanky Panky: pizzo signature, comfort leggendario. Un classico americano con anima da indossare ogni giorno.',
    },
    en: {
      headline: 'Lace that stays.',
      body: 'Hanky Panky—signature lace, legendary comfort. An American classic with an everyday soul.',
    },
  },
};

function fallbackCategory(slug: string, name: string, locale: Locale): EditorialCopy {
  if (locale === 'it') {
    return {
      eyebrow: name,
      headline: `${name}, selezionati per te.`,
      body: `Scopri la selezione HARIMI di ${name.toLowerCase()}: pezzi curati, brand di qualità, un’esperienza di shopping editoriale.`,
    };
  }
  return {
    eyebrow: name,
    headline: `${name}, selected for you.`,
    body: `Discover HARIMI’s edit of ${name.toLowerCase()}—curated pieces, quality brands, an editorial shopping experience.`,
  };
}

function fallbackBrand(name: string, locale: Locale): EditorialCopy {
  if (locale === 'it') {
    return {
      headline: `${name} su HARIMI.`,
      body: `Una selezione curata di ${name}: pezzi essenziali e speciali, presentati con la stessa cura della boutique.`,
    };
  }
  return {
    headline: `${name} at HARIMI.`,
    body: `A curated selection of ${name}—essentials and special pieces, presented with boutique care.`,
  };
}

export function categoryEditorial(
  slug: string,
  name: string,
  locale: Locale,
): EditorialCopy {
  const entry = CATEGORY_COPY[slug];
  if (entry) return entry[locale];
  return fallbackCategory(slug, name, locale);
}

export function brandEditorial(slug: string, name: string, locale: Locale): EditorialCopy {
  const entry = BRAND_COPY[slug];
  if (entry) return entry[locale];
  return fallbackBrand(name, locale);
}

export type FaqItem = { q: string; a: string };

const CATEGORY_FAQ: Record<string, { it: FaqItem[]; en: FaqItem[] }> = {
  bras: {
    it: [
      {
        q: 'Come scelgo la taglia giusta di reggiseno?',
        a: 'Misura sottoseno e seno, poi consulta la guida alle taglie presente su ogni scheda prodotto. In caso di dubbio tra due taglie, scegli la coppa più grande e il giro più aderente.',
      },
      {
        q: 'Qual è la differenza tra balconcino e push-up?',
        a: 'Il balconcino solleva e distribuisce il seno con una scollatura orizzontale, ideale sotto scolli ampi. Il push-up aggiunge volume grazie a imbottiture graduate.',
      },
      {
        q: 'Come lavo i miei reggiseni?',
        a: 'Consigliamo il lavaggio a mano o in rete a 30°, senza candeggina né asciugatrice. Le indicazioni precise sono nelle note di cura di ogni prodotto.',
      },
      {
        q: 'Posso restituire un reggiseno?',
        a: 'Sì: hai 30 giorni per il reso, purché il capo sia integro con etichette. Trovi tutti i dettagli nella pagina spedizioni e resi.',
      },
    ],
    en: [
      {
        q: 'How do I choose the right bra size?',
        a: 'Measure underbust and bust, then check the size guide on each product page. If you sit between two sizes, choose the larger cup and the snugger band.',
      },
      {
        q: 'What is the difference between balconette and push-up?',
        a: 'A balconette lifts and spreads the bust with a horizontal neckline, ideal under wide necklines. A push-up adds volume through graduated padding.',
      },
      {
        q: 'How should I wash my bras?',
        a: 'We recommend hand washing or a laundry net at 30°C, no bleach and no tumble drying. Exact instructions are in each product’s care notes.',
      },
      {
        q: 'Can I return a bra?',
        a: 'Yes: you have 30 days to return, provided the piece is unworn with labels attached. Full details are on the shipping and returns page.',
      },
    ],
  },
  knickers: {
    it: [
      {
        q: 'Come scelgo la taglia degli slip?',
        a: 'Fai riferimento alla tabella taglie sulla scheda prodotto: misura fianchi e vita e confrontala con la guida. La vestibilità è regolare su tutta la selezione.',
      },
      {
        q: 'Quali materiali sono disponibili?',
        a: 'Cotone per l’uso quotidiano, microfibra invisibile sotto i capi aderenti, pizzo per le occasioni. Ogni scheda indica la composizione completa.',
      },
      {
        q: 'Posso restituire l’intimo?',
        a: 'Per ragioni igieniche accettiamo il reso solo su capi integri con etichette e sigillo. Hai 30 giorni dalla consegna.',
      },
    ],
    en: [
      {
        q: 'How do I choose my knicker size?',
        a: 'Use the size table on the product page: measure hips and waist and match them to the guide. Fit is true to size across the selection.',
      },
      {
        q: 'Which fabrics are available?',
        a: 'Cotton for the everyday, invisible microfibre under close-fitting clothes, lace for occasions. Each product page lists the full composition.',
      },
      {
        q: 'Can I return underwear?',
        a: 'For hygiene reasons we accept returns only on unworn pieces with labels and seal intact. You have 30 days from delivery.',
      },
    ],
  },
};

function fallbackFaq(name: string, locale: Locale): FaqItem[] {
  const lower = name.toLowerCase();
  if (locale === 'it') {
    return [
      {
        q: `Come scelgo la taglia giusta di ${lower}?`,
        a: 'Ogni scheda prodotto include una guida alle taglie dettagliata con le misure in centimetri. In caso di dubbio, il nostro servizio clienti è a disposizione.',
      },
      {
        q: `Quali materiali usate per ${lower}?`,
        a: 'Selezioniamo tessuti di qualità — cotone, microfibra, pizzo e seta a seconda del capo. La composizione completa è indicata su ogni scheda prodotto.',
      },
      {
        q: 'Quanto costa la spedizione e in quanto arriva?',
        a: 'La spedizione standard arriva in 2–4 giorni lavorativi. Il costo esatto viene calcolato al checkout prima del pagamento.',
      },
      {
        q: 'Posso effettuare un reso?',
        a: 'Sì: hai 30 giorni per il reso, purché il capo sia integro con etichette. Trovi tutti i dettagli nella pagina spedizioni e resi.',
      },
    ];
  }
  return [
    {
      q: `How do I choose the right size of ${lower}?`,
      a: 'Each product page includes a detailed size guide with measurements in centimetres. If in doubt, our customer care team is happy to help.',
    },
    {
      q: `Which fabrics do you use for ${lower}?`,
      a: 'We select quality fabrics — cotton, microfibre, lace and silk depending on the piece. The full composition is listed on every product page.',
    },
    {
      q: 'How much is shipping and how long does it take?',
      a: 'Standard shipping arrives in 2–4 working days. The exact cost is calculated at checkout before payment.',
    },
    {
      q: 'Can I make a return?',
      a: 'Yes: you have 30 days to return, provided the piece is unworn with labels attached. Full details are on the shipping and returns page.',
    },
  ];
}

export function categoryFaq(slug: string, name: string, locale: Locale): FaqItem[] {
  const entry = CATEGORY_FAQ[slug];
  if (entry) return entry[locale];
  return fallbackFaq(name, locale);
}
