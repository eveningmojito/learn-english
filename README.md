# Let's learn English!

Giochi con audio per imparare l'inglese, pensati per bambini italiani della scuola primaria.

## Online

Il sito è pubblicato su GitHub Pages: https://eveningmojito.github.io/learn-english/
Ogni modifica caricata sul ramo `main` viene pubblicata automaticamente.

## Avvio in locale

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

**Monete e La mia casa**
- Ogni partita finita dà monete: (stelle + 1) × 1 al livello 1–2, × 2 al livello 3–4, × 3 al livello 5–6 e nelle Avventure.
- Con le monete si costruisce la propria casa: stanze, quadratini e piani in più, mobili, oggetti e animali.
- Per comprare qualcosa bisogna dire come si chiama in inglese (quiz a 3 risposte); toccando le stanze se ne sente il nome.
- L'orsetto dà missioni in inglese ("Put a lamp in the kitchen!") che valgono 20 monete.
- Monete, statistiche e casa restano salvate nel browser del dispositivo.

- L'audio usa le voci del browser (Web Speech API), quindi non servono file audio.
- È una PWA: dopo `npm run build` e `npm run preview` si può installare sul telefono e funziona anche offline.

## Aggiungere esercizi

Tutti i contenuti stanno in `src/data/`, che fa da archivio degli esercizi: per aggiungerne non serve toccare il codice dei giochi.

| File | Cosa contiene |
| --- | --- |
| `words.ts` | Argomenti e parole dei livelli 1–2 e 3–4 (inglese, italiano, emoji) |
| `advanced.ts` | Argomenti e parole del livello 5–6 |
| `sentences.ts` | Frasi di "Costruisci la frase", un elenco per argomento |
| `stories.ts` | Storie delle Avventure: scene, dialoghi ed esercizi |
| `levels.ts` | Quali argomenti, giochi e avventure compaiono in ogni livello |
| `shop.ts` | Stanze, mobili, oggetti e animali della casa, con prezzi |

- **Nuove parole o frasi**: aggiungi una riga all'elenco giusto. Nei livelli 3–4 e 5–6 usa parole singole in minuscolo, così funzionano nei giochi di spelling; le frasi vanno senza punteggiatura.
- **Nuovo argomento**: crealo in `words.ts` o `advanced.ts` e aggiungilo a una sezione in `levels.ts`.
- **Nuova avventura**: copia una storia in `stories.ts` e aggiungila all'elenco `stories`; compare da sola nel livello 5–6. Gli sfondi disponibili sono in `src/components/Scenery.tsx`.

Ogni partita sceglie parole e frasi diverse dalle ultime usate, finché non le ha proposte tutte (la memoria resta nel browser).
