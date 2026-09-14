# Autenticazione — architettura definitiva

## Obiettivo

L'app deve usare **username + password** per il login. Gli account non vengono creati autonomamente dai giocatori: sono creati dall'Admin.

## Vincoli

- username immutabile;
- display name modificabile liberamente dall'utente;
- display name non necessariamente univoco;
- password gestita dall'Admin in caso di reset;
- messaggio unico in caso di login fallito: `Credenziali non valide.`;
- nessuna registrazione pubblica;
- l'Admin resta anche un normale giocatore;
- un account disattivato non può accedere e non compare nelle normali viste di gioco; i dati restano conservati per un'eventuale riattivazione.

## Implementazione tecnica prevista

Supabase Auth usa email/telefono come identificativo nativo per `signInWithPassword`. Per rispettare il requisito username senza chiedere email ai giocatori, il frontend dovrà risolvere lo username in un'identità Auth interna prima del login oppure usare una funzione server-side autorizzata che effettui questa risoluzione.

La risoluzione dello username **non deve esporre l'email interna** al client.

La creazione/reset degli utenti deve avvenire esclusivamente tramite operazioni privilegiate lato server/Admin; non va inserita alcuna service-role key nel frontend.

## Stato

Questo documento definisce il contratto applicativo. L'integrazione definitiva con Supabase richiede accesso al progetto attualmente usato dall'app, che al momento non è visibile al connector Supabase.

Non viene quindi simulata una falsa implementazione client-side dello username finché auth e RLS non sono verificabili sul database reale.
