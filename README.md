# Let's learn English!

Giochi con audio per imparare l'inglese, pensati per bambini italiani della scuola primaria.

## Avvio

```bash
npm install
npm run dev
```

Apri http://localhost:5173 sul PC. Da un telefono sulla stessa rete Wi-Fi usa l'indirizzo "Network" che Vite stampa nel terminale.

## Come funziona

Nella schermata iniziale si sceglie il livello (la scelta resta salvata).

**Livello 1–2: ascolto e figure**
- Argomenti: animali, colori, frutta e cibo, numeri.
- Feste e stagioni: autunno, Halloween, inverno, Natale, Carnevale, primavera, Pasqua, estate, compleanno.
- **Impara**: tocca una carta per sentire la parola in inglese (con traduzione italiana).
- **Ascolta e tocca**: ascolta la parola e tocca l'immagine giusta.

**Livello 3–4: lettura e spelling**
- Argomenti del livello 1–2 più il corpo, i vestiti, la scuola, il tempo e la casa.
- **Leggi e scegli**: leggi la parola scritta e tocca l'immagine giusta.
- **Lettera mancante**: scegli la lettera che manca nella parola.
- **Scrivi la parola**: ascolta e componi la parola con le lettere mescolate.

**Livello 5–6: dettato e frasi**
- Argomenti: i mestieri, sport, azioni, la città, emozioni, trasporti (con parole e frasi).
- **Traduci**: leggi la parola italiana e scegli quella inglese giusta.
- **Dettato**: ascolta la parola (senza immagine) e scrivila; tra le lettere ce ne sono alcune in più.
- **Costruisci la frase**: metti in ordine le parole per formare la frase inglese.

In ogni gioco si guadagna una stella per ogni risposta giusta al primo colpo; il record di ogni gioco resta salvato nel browser.

- L'audio usa le voci del browser (Web Speech API), quindi non servono file audio.
- È una PWA: dopo `npm run build` e `npm run preview` si può installare sul telefono e funziona anche offline.

## Aggiungere parole

Modifica `src/data/words.ts` (livelli 1–2 e 3–4) o `src/data/advanced.ts` (livello 5–6, con le frasi): ogni argomento ha un elenco di parole con inglese, italiano ed emoji. Negli argomenti dei livelli 3–4 e 5–6 usa solo parole singole in minuscolo, così funzionano nei giochi di spelling.
