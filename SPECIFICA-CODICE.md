# Fanta MasterChef - Specifica e Codice

Branch: dev/finalizzazione-2026
Base: main, commit d2cb6925fa51ad58ec6913296a7b1958a8bfa2f0

## Stato iniziale

- Account: da rifare con username e password, account creati dall'Admin.
- Navigazione: da riallineare a Home, Brigata, Carte, Classifica, Chat, Regolamento.
- Home: parziale.
- Brigata: parziale.
- Classifica: parziale.
- Scheda giocatore e grafici: da completare.
- Carte: acquisto, utilizzo, stati e finestre da implementare.
- Motore punteggi: presente ma da correggere e rendere deterministico.
- Fornelli Spenti: manca il raddoppio della penalita.
- Chef Ombra: logica attuale dipende dallo svelamento e va riallineata alla regola vigente.
- Sostituzione gennaio: da implementare.
- Chat: assente.
- Avvisi e notifiche: assenti.
- Calendario e scadenze: parziali.
- Area Admin: da rifare in modo strutturato.
- Avatar: parziale.
- Regolamento: parziale.
- PWA: manifest presente, service worker da completare.
- Sicurezza dati: verifica Supabase/RLS obbligatoria.
- Asset grafici definitivi: presenti nel repository e da usare senza ridisegnarli.

## Vincoli principali

- Budget sviluppo app: 150 euro massimo.
- Budget individuale Stelle/Carte: 50 euro massimo.
- Sostituzione di gennaio: 10 euro separati dal plafond delle Stelle/Carte.
- Ogni tipo di carta puo essere acquistato una sola volta da ciascun giocatore.
- Ogni acquisto e utilizzo richiede conferma finale.
- Le carte restano nello storico per tutta la stagione.
- Variazione Artusi: solo dopo la puntata.
- Il segreto dello Chef Ombra deve essere protetto anche a livello dati/API.
- Il motore deve calcolare i punteggi dagli eventi della puntata, non da valori finali inseriti manualmente.
- Sono ammessi mezzi punti.
- Pari merito: stessa posizione, senza spareggio.
- Pari merito al primo posto: divisione uguale del relativo montepremi.
- Premi correnti: 80% Premio Artusi e 20% Premio Aperitivo.

## Conflitto da consolidare

Il Registro Master contiene ancora la formulazione secondo cui i punti dello Chef Ombra non entrano nella classifica fino al 31/01/2027. Nel lavoro di finalizzazione e stata invece stabilita una regola piu recente: i punti dell'Ombra entrano normalmente fin dalla prima puntata e lo svelamento non produce un ricalcolo retroattivo.

Questa divergenza deve essere formalmente consolidata nel Registro/regolamento prima della produzione. Il codice non deve contenere una logica ambigua.

## Ordine di sviluppo

1. Sicurezza dati e autorizzazioni.
2. Autenticazione e gestione account.
3. Motore regole e punteggi.
4. Brigata, eliminazioni e sostituzione gennaio.
5. Carte.
6. Classifica, schede e grafici.
7. Chat, avvisi e notifiche.
8. Calendario e scadenze.
9. Area Admin.
10. PWA, test mobile, test di sicurezza e collaudo.
