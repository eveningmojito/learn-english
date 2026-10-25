# Let's learn English!

Giochi con audio per imparare l'inglese, pensati per bambini italiani della scuola primaria.

## Avvio

```bash
npm install
npm run dev
```

Apri http://localhost:5173 sul PC. Da un telefono sulla stessa rete Wi-Fi usa l'indirizzo "Network" che Vite stampa nel terminale.

## Come funziona

- **Impara**: tocca una carta per sentire la parola in inglese (con traduzione italiana).
- **Gioca**: ascolta la parola e tocca l'immagine giusta. Una stella per ogni risposta giusta al primo colpo; il record per argomento resta salvato nel browser.
- L'audio usa le voci del browser (Web Speech API), quindi non servono file audio.
- È una PWA: dopo `npm run build` e `npm run preview` si può installare sul telefono e funziona anche offline.

## Aggiungere parole

Modifica `src/data/words.ts`: ogni argomento ha un elenco di parole con inglese, italiano ed emoji.
