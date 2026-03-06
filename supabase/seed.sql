-- Seed initial malus types (Generic)
INSERT INTO public.malus_types (name, amount, icon, description, is_active)
VALUES 
('Microfono aperto', 0.50, '🎤', 'Dimenticare il microfono aperto in zoom/meet', true),
('Caffè versato', 1.00, '☕', 'Macchiare la postazione o il pavimento', true),
('Ritardo riunione', 0.50, '⏰', 'Arrivare in ritardo a una riunione', true),
('Micronde aperto', 1.00, '🍲', 'Lasciare il microonde aperto dopo l\'uso (puzza!)', true),
('Social Taboo', 0.50, '📱', 'Usare Instagram/TikTok per motivi non lavorativi', true);

-- Legendary Individual Malus Rules (from Wine2Digital Legacy)
INSERT INTO public.malus_types (name, amount, icon, description, is_active)
VALUES
('Zio Can / Mona / Fra', 0.50, '🗣️', 'Uso eccessivo di intercalari veneti (Giorgia style)', true),
('Cute / Fuah / Daaaamn', 0.50, '✨', 'Uso eccessivo di espressioni "cute" (Karla style)', true),
('Air play drums', 1.00, '🥁', 'Suonare la batteria immaginaria durante il lavoro (Simone style)', true),
('Phone/Glasses lost', 1.00, '🕶️', 'Perdere continuamente occhiali o cellulare (Anselmo style)', true),
('Memoria Storica', 0.50, '🏛️', 'Stevie definisce Marina "pilastro/memoria storica"', true),
('Trust Me Trigger', 1.00, '🤝', 'Stevie dice "trust me" pianificando podcast (Beatrice/Roza style)', true),
('Institutional Photos', 2.00, '📸', 'Dover fare foto istituzionali improvvise (Federico style)', true),
('Hat Change', 1.00, '🧢', 'Cambio di cappello durante l\'orario lavorativo (Richard style)', true),
('Beard Stroke', 0.50, '🧔', 'Simone si accarezza la barba pensieroso', true),
('Screaming Andrea', 1.00, '📣', 'Chiamare un Andrea 3 volte urlando (Manuela style)', true),
('Philosophical Loop', 1.00, '🧠', 'Iniziare discorsi filosofici/sociologici a caso (Darra style)', true),
('Mammacara', 0.50, '👵', 'Esclamazione "mammacara" (Veronica style)', true),
('Frozen Lunch', 1.00, '❄️', 'Mangiare qualcosa dal reparto surgelati (Anselmo style)', true);
