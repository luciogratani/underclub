-- Schema Supabase per il sistema di prenotazione Technoroom

-- Abilita RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Tabella prenotazioni
CREATE TABLE IF NOT EXISTS prenotazioni (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cognome VARCHAR(255) NOT NULL,
    data_nascita DATE, -- Campo presente nel tipo ma non nel form attuale
    email VARCHAR(255) NOT NULL UNIQUE,
    tranche VARCHAR(20) NOT NULL CHECK (tranche IN ('tranche1', 'tranche2', 'tranche3')),
    codice_prenotazione VARCHAR(6) NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    stato VARCHAR(20) DEFAULT 'confermata' CHECK (stato IN ('confermata', 'checkin', 'annullata')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modifica la tabella esistente per essere singleton
-- Prima eliminiamo il constraint di primary key se esiste
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints
               WHERE table_name = 'disponibilita' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE disponibilita DROP CONSTRAINT disponibilita_pkey;
    END IF;
END $$;

-- Aggiungiamo una colonna singleton_id se non esiste e impostiamola come primary key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'disponibilita' AND column_name = 'singleton_id') THEN
        ALTER TABLE disponibilita ADD COLUMN singleton_id INTEGER DEFAULT 1;
        ALTER TABLE disponibilita ADD CONSTRAINT singleton_check CHECK (singleton_id = 1);
        ALTER TABLE disponibilita ADD PRIMARY KEY (singleton_id);
    END IF;
END $$;

-- Assicuriamoci che ci sia sempre una sola riga
INSERT INTO disponibilita (tranche1, tranche2, singleton_id)
VALUES (50, 150, 1)
ON CONFLICT (singleton_id) DO NOTHING;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_prenotazioni_email ON prenotazioni(email);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_codice ON prenotazioni(codice_prenotazione);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_stato ON prenotazioni(stato);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_tranche ON prenotazioni(tranche);

-- Trigger per aggiornare updated_at (con controllo esistenza)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Rimuovi trigger esistenti se presenti
DROP TRIGGER IF EXISTS update_prenotazioni_updated_at ON prenotazioni;
DROP TRIGGER IF EXISTS update_disponibilita_updated_at ON disponibilita;

-- Ricrea i trigger
CREATE TRIGGER update_prenotazioni_updated_at
    BEFORE UPDATE ON prenotazioni
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disponibilita_updated_at
    BEFORE UPDATE ON disponibilita
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Abilita RLS
ALTER TABLE prenotazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilita ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti se presenti
DROP POLICY IF EXISTS "Users can insert their own prenotazione" ON prenotazioni;
DROP POLICY IF EXISTS "Users can read their own prenotazione" ON prenotazioni;
DROP POLICY IF EXISTS "Everyone can read disponibilita" ON disponibilita;
DROP POLICY IF EXISTS "Authenticated users can update disponibilita" ON disponibilita;

-- Policy per prenotazioni: gli utenti anonimi possono solo inserire
-- (per creare nuove prenotazioni)
CREATE POLICY "Users can insert their own prenotazione" ON prenotazioni
    FOR INSERT WITH CHECK (true);

-- Policy per prenotazioni: gli utenti anonimi possono leggere solo le proprie prenotazioni
CREATE POLICY "Users can read their own prenotazione" ON prenotazioni
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Policy per disponibilità: tutti possono leggere (per controllare posti disponibili)
CREATE POLICY "Everyone can read disponibilita" ON disponibilita
    FOR SELECT USING (true);

-- Policy per disponibilità: solo authenticated users possono aggiornare
-- (per decrementare i posti quando si fa una prenotazione)
CREATE POLICY "Authenticated users can update disponibilita" ON disponibilita
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Funzione per creare una prenotazione con controllo disponibilità
CREATE OR REPLACE FUNCTION crea_prenotazione(
    p_nome VARCHAR(255),
    p_cognome VARCHAR(255),
    p_email VARCHAR(255),
    p_tranche VARCHAR(20)
) RETURNS JSON AS $$
DECLARE
    v_codice VARCHAR(6);
    v_prenotazione_id UUID;
    v_disponibilita_attuale INTEGER;
    prenotazione_record prenotazioni%ROWTYPE;
BEGIN
    -- Verifica disponibilità
    SELECT
        CASE
            WHEN p_tranche = 'tranche1' THEN tranche1
            WHEN p_tranche = 'tranche2' THEN tranche2
            ELSE 0
        END INTO v_disponibilita_attuale
    FROM disponibilita
    LIMIT 1;

    IF v_disponibilita_attuale <= 0 THEN
        RAISE EXCEPTION 'Posti esauriti per la tranche selezionata';
    END IF;

    -- Genera codice prenotazione unico
    LOOP
        SELECT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)) INTO v_codice;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM prenotazioni WHERE codice_prenotazione = v_codice);
    END LOOP;

    -- Inserisci prenotazione e recupera tutti i dati
    INSERT INTO prenotazioni (nome, cognome, email, tranche, codice_prenotazione)
    VALUES (p_nome, p_cognome, p_email, p_tranche, v_codice)
    RETURNING * INTO prenotazione_record;

    -- Decrementa disponibilità
    IF p_tranche = 'tranche1' THEN
        UPDATE disponibilita SET tranche1 = tranche1 - 1 WHERE singleton_id = 1;
    ELSIF p_tranche = 'tranche2' THEN
        UPDATE disponibilita SET tranche2 = tranche2 - 1 WHERE singleton_id = 1;
    END IF;

    -- Restituisci tutti i dati della prenotazione
    RETURN row_to_json(prenotazione_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per recuperare una prenotazione tramite codice (sicura)
CREATE OR REPLACE FUNCTION get_prenotazione_by_codice(
    p_codice VARCHAR(6)
) RETURNS JSON AS $$
DECLARE
    prenotazione_record prenotazioni%ROWTYPE;
BEGIN
    -- Cerca la prenotazione con il codice fornito
    SELECT * INTO prenotazione_record
    FROM prenotazioni
    WHERE codice_prenotazione = UPPER(p_codice)
    LIMIT 1;

    -- Se non trovata, restituisci null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Restituisci i dati della prenotazione in formato JSON
    RETURN row_to_json(prenotazione_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
