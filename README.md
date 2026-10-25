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

**Livello 2–3: lettura e spelling**
- Argomenti del livello 1–2 più il corpo, i vestiti, la scuola, il tempo e la casa.
- **Leggi e scegli**: leggi la parola scritta e tocca l'immagine giusta.
- **Lettera mancante**: scegli la lettera che manca nella parola.
- **Scrivi la parola**: ascolta e componi la parola con le lettere mescolate.

In ogni gioco si guadagna una stella per ogni risposta giusta al primo colpo; il record di ogni gioco resta salvato nel browser.

- L'audio usa le voci del browser (Web Speech API), quindi non servono file audio.
- È una PWA: dopo `npm run build` e `npm run preview` si può installare sul telefono e funziona anche offline.

## Aggiungere parole

Modifica `src/data/words.ts`: ogni argomento ha un elenco di parole con inglese, italiano ed emoji. Negli argomenti del livello 2–3 usa solo parole singole in minuscolo, così funzionano nei giochi di spelling.
