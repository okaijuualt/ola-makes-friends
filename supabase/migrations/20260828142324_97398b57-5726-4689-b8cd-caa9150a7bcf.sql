
CREATE TABLE public.country_time_profiles (
  country_code text PRIMARY KEY,
  country_name text NOT NULL,
  timezone text NOT NULL,
  utc_offset text,
  business_hours_start time NOT NULL DEFAULT '09:00',
  business_hours_end time NOT NULL DEFAULT '18:00',
  working_days int[] NOT NULL DEFAULT '{1,2,3,4,5}',
  lunch_start time,
  lunch_end time,
  peak_hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_call_hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_whatsapp_hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_email_hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_contact_days int[] NOT NULL DEFAULT '{2,3,4}',
  holidays jsonb NOT NULL DEFAULT '[]'::jsonb,
  cultural_notes text,
  data_confidence text NOT NULL DEFAULT 'baixa',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.country_time_profiles TO anon;
GRANT SELECT ON public.country_time_profiles TO authenticated;
GRANT ALL ON public.country_time_profiles TO service_role;

ALTER TABLE public.country_time_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis de horario sao publicos para leitura"
ON public.country_time_profiles FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.country_time_profiles
(country_code, country_name, timezone, utc_offset, business_hours_start, business_hours_end, lunch_start, lunch_end, peak_hours, best_call_hours, best_whatsapp_hours, best_email_hours, best_contact_days, holidays, cultural_notes, data_confidence) VALUES
('BR','Brasil','America/Sao_Paulo','UTC-3','09:00','18:00','12:00','13:30','[{"start":"09:30","end":"11:30"},{"start":"14:30","end":"17:00"}]','[{"start":"10:00","end":"11:30"},{"start":"15:00","end":"17:00"}]','[{"start":"09:30","end":"11:30"},{"start":"14:00","end":"18:00"}]','[{"start":"08:30","end":"10:00"}]','{2,3,4}','["01-01","04-21","05-01","09-07","10-12","11-02","11-15","12-25"]','Tom cordial e informal. WhatsApp é canal padrão de negócios. Evitar segunda de manhã e sexta à tarde.','alta'),
('PT','Portugal','Europe/Lisbon','UTC+0/+1','09:00','18:00','13:00','14:00','[{"start":"10:00","end":"12:30"},{"start":"15:00","end":"17:30"}]','[{"start":"10:00","end":"12:00"},{"start":"15:00","end":"17:00"}]','[{"start":"10:00","end":"12:30"},{"start":"15:00","end":"18:00"}]','[{"start":"09:00","end":"10:30"}]','{2,3,4}','["01-01","04-25","05-01","06-10","08-15","12-25"]','Comunicação mais formal que no Brasil. Almoço estendido é comum.','alta'),
('US','Estados Unidos','America/New_York','UTC-5/-4','09:00','17:00','12:00','13:00','[{"start":"09:00","end":"11:00"},{"start":"14:00","end":"16:00"}]','[{"start":"09:00","end":"11:00"},{"start":"16:00","end":"17:00"}]','[{"start":"10:00","end":"16:00"}]','[{"start":"07:30","end":"09:00"}]','{2,3,4}','["01-01","07-04","11-27","12-25"]','E-mail é o canal preferido. Objetividade alta; evitar mensagens longas.','alta'),
('CA','Canadá','America/Toronto','UTC-5/-4','09:00','17:00','12:00','13:00','[{"start":"09:00","end":"11:30"},{"start":"14:00","end":"16:00"}]','[{"start":"09:30","end":"11:30"}]','[{"start":"10:00","end":"16:00"}]','[{"start":"08:00","end":"09:30"}]','{2,3,4}','["01-01","07-01","12-25","12-26"]','Semelhante aos EUA, tom levemente mais formal.','media'),
('MX','México','America/Mexico_City','UTC-6','09:00','18:00','14:00','15:30','[{"start":"10:00","end":"13:30"},{"start":"16:00","end":"18:00"}]','[{"start":"10:00","end":"13:00"}]','[{"start":"10:00","end":"18:00"}]','[{"start":"09:00","end":"10:30"}]','{2,3,4}','["01-01","09-16","11-20","12-25"]','Almoço tarde e longo. WhatsApp muito usado para negócios.','alta'),
('AR','Argentina','America/Argentina/Buenos_Aires','UTC-3','09:00','18:00','13:00','14:00','[{"start":"10:00","end":"12:30"},{"start":"15:00","end":"18:00"}]','[{"start":"10:00","end":"12:30"}]','[{"start":"10:00","end":"18:00"}]','[{"start":"09:00","end":"10:30"}]','{2,3,4}','["01-01","05-25","07-09","12-25"]','Relacionamento antes da proposta. WhatsApp amplamente aceito.','media'),
('CL','Chile','America/Santiago','UTC-4/-3','09:00','18:00','13:30','15:00','[{"start":"10:00","end":"13:00"},{"start":"15:30","end":"17:30"}]','[{"start":"10:00","end":"12:30"}]','[{"start":"10:00","end":"18:00"}]','[{"start":"08:30","end":"10:00"}]','{2,3,4}','["01-01","09-18","09-19","12-25"]','Tom formal em primeiro contato.','media'),
('CO','Colômbia','America/Bogota','UTC-5','08:00','18:00','12:00','14:00','[{"start":"09:00","end":"11:30"},{"start":"14:30","end":"17:00"}]','[{"start":"09:00","end":"11:30"}]','[{"start":"09:00","end":"18:00"}]','[{"start":"07:30","end":"09:00"}]','{2,3,4}','["01-01","07-20","08-07","12-25"]','Jornada começa cedo. WhatsApp é o canal dominante.','media'),
('ES','Espanha','Europe/Madrid','UTC+1/+2','09:00','18:30','14:00','15:30','[{"start":"10:00","end":"13:30"},{"start":"16:00","end":"18:00"}]','[{"start":"10:00","end":"13:00"}]','[{"start":"10:00","end":"18:30"}]','[{"start":"08:30","end":"10:00"}]','{2,3,4}','["01-01","05-01","08-15","10-12","12-25"]','Almoço tarde. Agosto tem atividade comercial bem reduzida.','alta'),
('GB','Reino Unido','Europe/London','UTC+0/+1','09:00','17:30','13:00','14:00','[{"start":"09:30","end":"11:30"},{"start":"14:00","end":"16:30"}]','[{"start":"09:30","end":"11:30"}]','[{"start":"10:00","end":"16:30"}]','[{"start":"07:30","end":"09:00"}]','{2,3,4}','["01-01","12-25","12-26"]','E-mail formal preferido; WhatsApp raramente usado em B2B.','alta'),
('FR','França','Europe/Paris','UTC+1/+2','09:00','18:00','12:30','14:00','[{"start":"09:30","end":"12:00"},{"start":"14:30","end":"17:00"}]','[{"start":"09:30","end":"11:30"}]','[{"start":"10:00","end":"17:00"}]','[{"start":"08:30","end":"10:00"}]','{2,3,4}','["01-01","05-01","07-14","08-15","12-25"]','Formalidade alta. Agosto costuma ter baixa atividade.','alta'),
('DE','Alemanha','Europe/Berlin','UTC+1/+2','08:00','17:00','12:00','13:00','[{"start":"08:30","end":"11:30"},{"start":"13:30","end":"16:00"}]','[{"start":"08:30","end":"11:00"}]','[{"start":"09:00","end":"16:00"}]','[{"start":"07:00","end":"08:30"}]','{2,3,4}','["01-01","05-01","10-03","12-25","12-26"]','Pontualidade e objetividade valorizadas. Contato fora do expediente é malvisto.','alta'),
('IT','Itália','Europe/Rome','UTC+1/+2','09:00','18:00','13:00','14:30','[{"start":"09:30","end":"12:30"},{"start":"15:00","end":"17:30"}]','[{"start":"09:30","end":"12:00"}]','[{"start":"10:00","end":"18:00"}]','[{"start":"08:30","end":"10:00"}]','{2,3,4}','["01-01","04-25","05-01","08-15","12-25"]','Agosto com baixa atividade. Relacionamento pessoal importa.','media'),
('NL','Países Baixos','Europe/Amsterdam','UTC+1/+2','08:30','17:00','12:00','13:00','[{"start":"09:00","end":"11:30"},{"start":"13:30","end":"16:00"}]','[{"start":"09:00","end":"11:00"}]','[{"start":"09:00","end":"16:30"}]','[{"start":"07:30","end":"09:00"}]','{2,3,4}','["01-01","04-27","12-25","12-26"]','Direto ao ponto. Sexta-feira costuma ter agenda reduzida.','media'),
('AE','Emirados Árabes Unidos','Asia/Dubai','UTC+4','09:00','18:00','13:00','14:00','[{"start":"09:30","end":"12:30"},{"start":"15:00","end":"17:30"}]','[{"start":"09:30","end":"12:00"}]','[{"start":"10:00","end":"18:00"}]','[{"start":"08:00","end":"09:30"}]','{1,2,3}','["01-01","12-02"]','Semana útil de segunda a sexta, com sexta reduzida. Ramadã altera fortemente as janelas.','media'),
('IN','Índia','Asia/Kolkata','UTC+5:30','10:00','19:00','13:30','14:30','[{"start":"10:30","end":"13:00"},{"start":"15:00","end":"18:30"}]','[{"start":"11:00","end":"13:00"},{"start":"15:30","end":"18:00"}]','[{"start":"10:00","end":"20:00"}]','[{"start":"09:00","end":"10:30"}]','{2,3,4}','["01-26","08-15","10-02"]','WhatsApp muito usado. Jornada começa e termina mais tarde.','media'),
('AU','Austrália','Australia/Sydney','UTC+10/+11','09:00','17:00','12:30','13:30','[{"start":"09:00","end":"11:30"},{"start":"14:00","end":"16:00"}]','[{"start":"09:00","end":"11:00"}]','[{"start":"09:30","end":"16:30"}]','[{"start":"07:30","end":"09:00"}]','{2,3,4}','["01-01","01-26","04-25","12-25","12-26"]','Tom informal mas objetivo. Fuso distante da América Latina.','media'),
('JP','Japão','Asia/Tokyo','UTC+9','09:00','18:00','12:00','13:00','[{"start":"10:00","end":"11:30"},{"start":"14:00","end":"17:00"}]','[{"start":"10:00","end":"11:30"}]','[{"start":"10:00","end":"17:00"}]','[{"start":"08:30","end":"10:00"}]','{2,3,4}','["01-01","05-03","05-05","11-03","11-23"]','Formalidade alta; e-mail preferido a ligação em primeiro contato.','media'),
('DEFAULT','Perfil padrão (país sem dado específico)','UTC','UTC+0','09:00','18:00','12:00','13:00','[{"start":"10:00","end":"12:00"},{"start":"15:00","end":"17:00"}]','[{"start":"10:00","end":"12:00"}]','[{"start":"10:00","end":"17:00"}]','[{"start":"08:30","end":"10:00"}]','{2,3,4}','[]','Sem dado local específico. Estimativa genérica de horário comercial.','baixa');
