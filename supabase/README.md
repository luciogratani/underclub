# Configurazione Supabase per Technoroom

Questa guida spiega come configurare Supabase per il sistema di prenotazione dell'evento Technoroom.

## 1. Creazione del Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto
3. Scegli un nome per il progetto (es. "technoroom-prenotazioni")
4. Seleziona la regione più vicina al tuo pubblico
5. Imposta una password sicura per il database

## 2. Configurazione delle Variabili d'Ambiente

Dopo aver creato il progetto, copia le credenziali dalla dashboard:

```bash
# Nel file .env.local del tuo progetto Next.js
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Esecuzione dello Schema del Database

1. Nella dashboard Supabase, vai alla sezione **SQL Editor**
2. Copia e incolla il contenuto del file `schema.sql`
3. Esegui la query

Questo creerà:
- Tabella `prenotazioni` per salvare le prenotazioni
- Tabella `disponibilita` per tracciare i posti disponibili
- Policy RLS per la sicurezza
- Funzione `crea_prenotazione()` per gestire le prenotazioni atomicamente

## 4. Verifica della Configurazione

Dopo aver eseguito lo schema:

1. Vai a **Table Editor** e verifica che le tabelle siano state create
2. Controlla che la tabella `disponibilita` abbia una riga con 50 posti per tranche1 e 150 per tranche2
3. Vai a **Authentication > Policies** per verificare che le policy RLS siano attive

## 5. Test della Connessione

Il sistema è progettato per funzionare anche senza Supabase (con fallback ai valori di default). Per testare:

1. Senza Supabase configurato: il sistema usa valori di default (50/150 posti)
2. Con Supabase configurato: recupera i dati reali dal database

## Sicurezza

Il sistema utilizza:
- **Row Level Security (RLS)** per limitare l'accesso ai dati
- **Policy anonime** per permettere inserimenti pubblici
- **Validazione lato client e server** per garantire l'integrità dei dati
- **Funzione RPC sicura** per gestire le prenotazioni atomicamente

## Funzione `crea_prenotazione()`

La funzione RPC gestisce:
1. Verifica disponibilità posti
2. Genera codice prenotazione univoco
3. Inserisce la prenotazione
4. Decrementa la disponibilità (tutto in una transazione atomica)

## Monitoraggio

Puoi monitorare le prenotazioni attraverso:
- **Table Editor** in Supabase per vedere le prenotazioni
- **SQL Editor** per query personalizzate
- **Realtime** se vuoi aggiornamenti in tempo reale

## Backup e Recovery

Supabase fornisce automaticamente:
- Backup giornalieri
- Point-in-time recovery
- Replica in tempo reale

## Troubleshooting

**Problema**: Il form non salva le prenotazioni
- Verifica che le variabili d'ambiente siano configurate correttamente
- Controlla i log del browser per errori di connessione
- Verifica che le policy RLS permettano l'inserimento

**Problema**: Disponibilità non si aggiorna
- Verifica che la tabella `disponibilita` abbia i valori iniziali
- Controlla che la funzione RPC stia decrementando correttamente

**Problema**: Codici prenotazione duplicati
- La funzione genera codici casuali e verifica l'univocità
- In caso di collisioni frequenti, il codice si rigenera automaticamente
