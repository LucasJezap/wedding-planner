# Usprawnienia projektu Wedding Planner

Ten dokument zbiera rekomendacje rozwoju produktu i jakości projektu.
Ma służyć jako robocza baza do dalszego planowania roadmapy, priorytetów i wdrożeń.

## Kontekst

Aktualny projekt ma solidne fundamenty:

- sensowny podział na `services`, `server`, `features`
- szeroki zakres modułów: goście, budżet, timeline, seating, vendorzy, import, public RSVP, access
- testy jednostkowe i integracyjne przechodzą
- `typecheck` przechodzi
- `build` przechodzi
- `lint` przechodzi z warningami

Projekt jest więc dobrą bazą, ale dziś jest bliżej dopracowanego MVP / planner workspace niż pełnego, operacyjnego systemu do prowadzenia organizacji ślubu.

## Główne kierunki rozwoju

Największy potencjał usprawnień jest w czterech obszarach:

- pogłębienie realnych workflow dla pary i wedding plannera
- lepsze doświadczenie gościa i obsługi RSVP
- większa dojrzałość operacyjna i bezpieczeństwo
- product polish oraz quality of life dla codziennej pracy

## Priorytet 1: Najważniejsze usprawnienia produktowe

### 1. Rozszerzony RSVP

Status: zakonczone - wersja 2 wdrozona.

Obecny publiczny RSVP został rozszerzony względem pierwotnej wersji i nie jest już tylko prostym `status + token`.

Aktualnie wdrożone:

- status RSVP
- liczba potwierdzonych miejsc
- liczba dzieci
- osoba towarzysząca
- preferowany posiłek
- alergie i uwagi żywieniowe
- transport na miejsce
- transport powrotny
- potrzeba noclegu / informacji o noclegu
- wiadomość do pary

Kolejne sensowne rozszerzenia tego modułu:

Warto dodać:

- potwierdzenie RSVP przez email
- przypomnienia dla osób bez odpowiedzi
- deadline RSVP widoczny dla gościa
- household / invitation groups dla wspólnej odpowiedzi rodzinnej
- logikę zależną od typu zaproszenia, np. czy plus-one jest dozwolony
- lepszy wgląd tych odpowiedzi w panelu admina
- dodatkowe pytania do gościa

To jest jedno z najbardziej praktycznych rozszerzeń dla tego typu produktu.

Oznaczenie roadmapowe:

- [x] Rozszerzony RSVP v1

### 2. Model grup zaproszeń / household

Status: zakonczone - wersja 1 wdrozona.

Obecny model został rozszerzony o realną encję grupy zaproszeń powiązaną z gośćmi.

Aktualnie wdrożone:

- encja grupy zaproszeń w modelu danych
- przypisanie gościa do grupy zaproszeń
- liczba miejsc przypisana do grupy
- flaga plus-one na poziomie grupy
- notatki do grupy
- filtrowanie gości po grupach
- podsumowanie grup na ekranie gości
- automatyczne tworzenie grup przy przypisaniu
- automatyczne czyszczenie pustych grup po usunięciu / przepięciu ostatniego gościa
- wspólna odpowiedź RSVP na poziomie całej grupy
- publiczny lookup pokazujący członków grupy
- publiczny zapis RSVP aktualizujący cały household

Korzyści:

- wspólne RSVP dla par i rodzin
- łatwiejsze zarządzanie plus-one
- prostsza wysyłka zaproszeń
- czytelniejsze grupowanie przy stołach
- lepsza obsługa dzieci i rodzin wieloosobowych

Kolejne sensowne rozszerzenia:

- adres korespondencyjny grupy / household
- opiekun grupy / główny kontakt
- dzieci jako członkowie household
- wysyłka komunikacji per grupa

Samo `groupName` nie było wystarczające na realne przypadki biznesowe, więc ten etap został już zastąpiony relacją domenową.

Oznaczenie roadmapowe:

- [x] Moduł grup zaproszeń v2

### 3. Rozbudowany vendor CRM

Status: zakonczone - wersja 1 wdrozona.

Vendorzy zostali rozszerzeni z prostego katalogu kontaktów do pierwszej wersji CRM.

Aktualnie wdrożone:

- status współpracy
- owner po stronie pary
- data rezerwacji
- termin follow-up
- depozyt
- link do oferty
- strona www
- Instagram
- prezentacja statusu i follow-up na kartach vendorów

Do dodania:

- data podpisania umowy
- ocena / notatki po rozmowach
- historia kontaktu
- checklista deliverables
- deadline’y materiałów od vendorów
- załączniki: umowy, PDF-y, wyceny, moodboardy

To jeden z najbardziej wartościowych modułów do rozbudowy.

Oznaczenie roadmapowe:

- [x] Vendor CRM v1

### 4. Budżet jako cashflow manager

Status: zakonczone - wersja 2 wdrozona.

Budżet jest dobrą bazą i został rozszerzony o pierwszy etap bardziej operacyjnego workflow finansowego.

Aktualnie wdrożone:

- powiązanie wydatku z usługodawcą
- termin płatności na poziomie wydatku
- prezentacja powiązanego vendora na karcie wydatku
- prezentacja terminu płatności
- oznaczenie wydatków przeterminowanych, gdy nadal mają kwotę do opłacenia
- alerty płatności w dashboardzie operacyjnym

Do dodania:

- depozyty
- waluta i ewentualnie wiele walut
- faktury / rachunki / załączniki
- miesięczny cashflow
- plan vs actual w czasie
- przewidywany koszt końcowy

Taki moduł byłby dużo bardziej przydatny w codziennym prowadzeniu przygotowań.

Oznaczenie roadmapowe:

- [x] Budzet v2

### 5. Taski z prawdziwym workflow

Status: czesciowo zakonczone - wdrozono checklisty / subtaski v1 oraz workflow v2 czesciowe.

Aktualnie wdrozone:

- checklisty / subtaski na zadaniu
- edycja checklisty w formularzu taska
- oznaczanie punktow checklisty jako wykonane bez wychodzenia z listy zadan
- podglad postepu checklisty na karcie zadania
- template'y taskow do szybkiego startu
- tagi taskow
- zaleznosci miedzy taskami
- presetowe widoki zadaniowe, np. overdue / next 14 days / open checklist

Obecny task manager warto rozszerzyć o:

- zależności między zadaniami
- szablony tasków
- automatyczne zadania zależne od daty ślubu
- komentarze
- przypomnienia
- recurring reminders
- właściciela zadania
- etykiety / tagi
- widok kalendarzowy
- widok Kanban

Płaska lista z terminem i priorytetem wystarcza na początek, ale szybko przestaje być wygodna przy większej liczbie zadań.

Oznaczenie roadmapowe:

- [x] Task workflow v1 - checklisty / subtaski
- [x] Task workflow v2 - templates, tags, dependencies

### 6. System powiadomień

Projekt bardzo skorzysta na warstwie aktywnych przypomnień.

Do rozważenia:

- przypomnienia o RSVP
- przypomnienia o taskach z terminem
- przypomnienia o płatnościach
- przypomnienia o wygasających zaproszeniach użytkowników
- follow-up do vendorów
- daily / weekly digest
- preferencje powiadomień per user

Bez tego aplikacja pozostaje bardziej repozytorium danych niż aktywnym narzędziem pracy.

### 6a. Dashboard operacyjny

Status: zakonczone - wersja 1 wdrozona.

Dashboard zostal rozszerzony z ogolnego przegladu do bardziej praktycznego command center.

Aktualnie wdrozone:

- sekcja "do dopilnowania" z laczna liczba otwartych tematow
- watchlista brakujacych RSVP
- lista gosci bez przypisanego stolu
- sekcja zadan wymagajacych uwagi z oznaczeniem overdue
- lista follow-upow do vendorow
- alerty platnosci z overdue i upcoming due date
- wykorzystanie danych z RSVP, seating, vendor CRM i budzetu w jednym miejscu

Do dodania:

- ostatnie zmiany / activity feed
- szybkie akcje bez przechodzenia do modulu
- dzienny widok "co dzis"
- digest mailowy lub push z alertami

Oznaczenie roadmapowe:

- [x] Dashboard operacyjny v1

### 7. Activity log / audit log

Przy wielu użytkownikach bardzo przydatna będzie historia zmian.

Przykłady:

- kto zmienił RSVP
- kto przeniósł gościa do innego stołu
- kto zmienił budżet
- kto wysłał zaproszenie do użytkownika
- kto zmienił rolę lub dane vendora

To daje większe bezpieczeństwo i porządek operacyjny.

### 8. Observability i monitoring

Warto dodać:

- Sentry lub podobne narzędzie do error tracking
- structured logging
- alerty produkcyjne
- podstawowe metryki błędów i wydajności
- trace dla krytycznych requestów

To ważne szczególnie, jeśli projekt ma być rozwijany w kierunku bardziej produkcyjnego narzędzia.

### 9. Rate limiting i ochrona endpointów publicznych

Status: czesciowo zakonczone - wdrozono rate limiting v1.

Aktualnie wdrozone:

- rate limiting dla publicznego lookup RSVP
- rate limiting dla publicznego zapisu RSVP
- rate limiting dla logowania
- odpowiedzi `429` dla ograniczonych endpointow publicznych

Publiczne endpointy RSVP, lookup oraz logowanie powinny mieć dodatkowe zabezpieczenia.

Do wdrożenia:

- rate limiting
- throttling
- ograniczenie prób dla token lookup
- ograniczenie prób logowania
- sensowne logowanie nadużyć
- opcjonalnie captcha lub anti-bot na publicznych flow

To ważne z perspektywy bezpieczeństwa i stabilności.

Oznaczenie roadmapowe:

- [x] Rate limiting v1

## Priorytet 2: Quality of Life dla codziennej pracy

### 10. Globalne wyszukiwanie i quick actions

Wyszukiwanie przez:

- gości
- vendorów
- zadania
- stoły
- eventy timeline

Do tego szybkie akcje:

- dodaj gościa
- dodaj task
- dodaj wydatek
- przejdź do vendora
- przejdź do stołu / eventu / kategorii budżetu

To bardzo poprawia ergonomię.

### 11. Saved views i bardziej zaawansowane filtry

Przykłady:

- goście bez RSVP
- goście bez stołu
- vendorzy bez umowy
- wydatki bez płatności
- zadania na najbliższe 14 dni
- overdue tasks
- timeline widoczny dla gości

Dobrze byłoby pozwolić użytkownikom zapisywać własne widoki.

### 12. Więcej bulk actions

Status: czesciowo zakonczone - wdrozono bulk actions dla taskow.

Aktualnie wdrozone:

- masowa zmiana statusow taskow dla zaznaczonych rekordow
- zaznaczanie wszystkich widocznych taskow

Warto dodać zbiorcze operacje w większej liczbie modułów:

- przypisanie grup gości
- wysyłka przypomnień RSVP
- przypisanie stołów
- masowa zmiana statusów tasków
- masowa zmiana kategorii vendorów
- masowe tagowanie rekordów

Oznaczenie roadmapowe:

- [x] Bulk actions v1 - taski

### 13. Autosave i draft recovery

Status: czesciowo zakonczone - wdrozono autosave draftu dla timeline.

Aktualnie wdrozone:

- draft recovery dla formularza wydarzenia timeline
- automatyczne przywracanie szkicu po odswiezeniu strony

Szczególnie przy dłuższych formularzach i edycjach:

- public site content
- FAQ
- vendor notes
- budget notes
- task descriptions

Utrata wpisanych danych to bardzo zły UX, a autosave daje dużą poprawę jakości pracy.

Oznaczenie roadmapowe:

- [x] Autosave v1 - timeline

### 14. Undo / recent changes

Szczególnie przy:

- importach
- seating planie
- zmianach RSVP
- budżecie

Przynajmniej prosty mechanizm:

- ostatnie zmiany
- cofnięcie ostatniej operacji
- podgląd co zostało zmienione

### 15. Lepszy dashboard operacyjny

Status: zakonczone - wdrozono dashboard v2.

Aktualnie wdrozone:

- sekcja szybkich akcji
- sekcja "co dzis" dla taskow, wydarzen, platnosci i follow-upow
- activity feed z ostatnimi zmianami na podstawie aktualizacji rekordow
- filtry per owner / odpowiedzialny dla taskow, vendor follow-upow i activity feed
- watchlista vendorow bez uzupelnionych danych kontaktowych
- sekcja "najblizsze decyzje do podjecia" z linkami do odpowiednich modulow
- osobna sekcja nadchodzacych platnosci na najblizsze 14 dni
- osobna sekcja zadan po terminie

Dashboard powinien bardziej odpowiadać na pytanie: co dziś wymaga uwagi?

Warto dodać:

- brakujące RSVP
- goście bez przypisanych stołów
- ostatnie aktywności

Oznaczenie roadmapowe:

- [x] Dashboard v2 - activity feed, today, quick actions, owner filters, vendor contact watchlist, decision queue, upcoming payments, overdue tasks

### 16. Widok kalendarzowy i eksport do kalendarzy

Status: czesciowo zakonczone - wdrozono eksport `.ics` v1.

Aktualnie wdrozone:

- eksport `.ics` dla pelnego kalendarza planera
- eksport `.ics` dla publicznego planu dnia dla gosci
- przyciski eksportu w module taskow, timeline i na stronie publicznej

Do rozważenia:

- widok kalendarzowy tasków i timeline
- eksport `.ics`
- synchronizacja z Google Calendar
- synchronizacja z Apple Calendar

To mocno podnosi praktyczność produktu.

Oznaczenie roadmapowe:

- [x] Calendar export v1 - `.ics`

### 17. Ustawienia użytkownika

Przydatne ustawienia:

- waluta
- format daty
- strefa czasowa
- preferowany język
- preferencje powiadomień
- domyślne widoki

### 18. Lepsze doświadczenie mobile

Shell i UI wyglądają dobrze, ale warto rozwinąć mobile workflow:

- szybsze quick actions
- lepsze formularze na telefonie
- bardziej operacyjny dashboard mobilny
- łatwiejsza nawigacja między modułami
- wygodniejsze zarządzanie seatingiem na tabletach

## Priorytet 3: Funkcje branżowe i rozszerzenia domenowe

### 19. Public wedding site 2.0

Status: czesciowo zakonczone - wdrozono public site 2.0 v1.

Aktualnie wdrozone:

- blok logistyczny dla gosci: parking
- blok logistyczny dla gosci: noclegi
- blok logistyczny dla gosci: prezenty
- blok logistyczny dla gosci: transport
- blok kontaktu koordynacyjnego

Warto rozbudować publiczną stronę ślubu o:

- mapę i dojazd
- parking
- noclegi
- prezenty / lista prezentów
- FAQ edytowalne w UI
- plan dnia dla gości
- kontakt do świadków lub koordynatora
- informacje transportowe
- galerie i zdjęcia
- dress code board

Oznaczenie roadmapowe:

- [x] Public site 2.0 v1 - logistics blocks

### 20. Communication center

Moduł komunikacji z gośćmi:

- segmentacja odbiorców
- wysyłka przypomnień RSVP
- komunikaty do wybranych grup
- wiadomości logistyczne
- eksport kontaktów
- historia komunikacji

### 21. Seating intelligence

Seating planner można rozwinąć o:

- sugestie rozmieszczenia
- wykrywanie konfliktów
- łączenie rodzin i grup
- oznaczenie dzieci i seniorów
- ograniczenia dietetyczne
- wizualne ostrzeżenia przy błędnym przypisaniu

### 22. Timeline day-of mode

Tryb na dzień ślubu:

- running order
- buffer times
- call sheet
- lista kontaktów awaryjnych
- wersja do druku
- status realizacji wydarzeń
- tryb dla koordynatora on-site

### 23. Vendor portal / vendor brief generator

Nie musi to być pełny portal od razu.

Wystarczy zacząć od:

- generowania briefu dla usługodawcy
- godzin i adresów
- danych kontaktowych on-site
- checklisty dostaw
- zakresu odpowiedzialności

### 24. Checklist templates

Szablony planowania zależne od:

- rodzaju ślubu
- liczby gości
- stylu wydarzenia
- lokalizacji / kraju
- rodzaju ceremonii

To świetny feature onboardingowy i sprzedażowy.

### 25. Dokumenty i załączniki

Warto dodać warstwę dokumentów:

- umowy
- wyceny
- inspiracje
- PDF-y
- zdjęcia
- pliki od vendorów

Najlepiej z przypięciem do konkretnych encji.

### 26. Notes i comments jako pełnoprawna funkcja

Obecny model pojedynczej notatki na encję jest ograniczony.

Lepiej docelowo dodać:

- wiele notatek
- komentarze
- historię wpisów
- autora wpisu
- timestampy
- wzmianki

### 27. Rozszerzone profile gości

Do rozważenia:

- historia kontaktu
- relacja do pary
- adres korespondencyjny
- informacje o dzieciach
- dodatkowe preferencje
- ważne uwagi organizacyjne

### 28. Import / export 2.0

Kolejne usprawnienia:

- pełny eksport snapshotu danych
- backup / restore
- diff preview przed importem
- walidacja konfliktów
- zapamiętywanie mapowania kolumn
- raport z wyniku importu

## Priorytet 4: Product polish i engineering quality

### 29. Uzupełnienie README

Status: zakonczone - README uzupelnione.

Aktualnie wdrozone:

- opis produktu
- stack
- sposob uruchomienia lokalnie i w Dockerze
- kluczowe zmienne srodowiskowe
- dane demo
- skrypty developerskie
- informacje o seedzie i migracjach
- sekcja testowania i coverage
- opis struktury projektu
- linki do dokumentacji architektury i runtime

Wczesniej `README.md` byl jeszcze domyslny.

Warto dodać:

- opis produktu
- stack
- sposób uruchomienia
- zmienne środowiskowe
- seed danych
- testowanie
- deployment
- strukturę projektu

Oznaczenie roadmapowe:

- [x] README projektu

### 30. Twardszy quality gate dla lint

Obecnie lint przechodzi z warningami. Warto zdecydować:

- albo warningi są regularnie czyszczone
- albo lint powinien failować również na warningach

To zapobiega stopniowemu psuciu hygiene kodu.

### 31. Szerszy zakres coverage

Coverage threshold jest bardzo dobry, ale warto rozszerzyć coverage również o:

- `server/**`
- auth
- krytyczne route handlers
- bardziej wrażliwe scenariusze publiczne

### 32. Szersze E2E

Dołożyć scenariusze E2E dla:

- expired invitation
- resend invite
- role boundaries
- import rollback / error handling
- public RSVP błędny token
- session expiry
- edge cases w seating plannerze

### 33. Soft delete / archive

Zamiast tylko twardego usuwania warto wspierać:

- archive
- restore
- ukrywanie nieaktywnych rekordów

To daje większe bezpieczeństwo operacyjne.

### 34. Feature flags

Przy większej liczbie modułów przydadzą się feature flagi:

- bezpieczniejsze rollouty
- łatwiejsze testy nowych funkcji
- możliwość stopniowego udostępniania

### 35. Empty states i onboarding

Warto dopracować:

- onboarding nowego użytkownika
- checklistę pierwszego uruchomienia
- sample data dostępne z UI
- podpowiedzi co uzupełnić jako pierwsze

### 36. Product analytics

Warto mierzyć:

- z których modułów użytkownicy korzystają
- gdzie odpadają
- jak wygląda completion rate RSVP
- które funkcje są najczęściej używane
- gdzie pojawia się najwięcej błędów

To pomoże sensownie ustawiać roadmapę.

## Sugerowana kolejność wdrożeń

Jeśli celem jest maksymalny zwrot z inwestycji, rozsądna kolejność wygląda tak:

1. rozszerzony RSVP
2. household / invitation groups
3. vendor CRM
4. budżet z terminami płatności i alertami
5. taski z subtaskami i reminderami
6. dashboard operacyjny
7. activity log
8. monitoring i rate limiting
9. communication center
10. dokumenty i załączniki

## Notatka końcowa

Największa wartość projektu jest dziś w tym, że ma już szeroką bazę funkcjonalną i sensowną architekturę.
Najbardziej opłacalne kolejne kroki to nie tyle dokładanie przypadkowych funkcji, ile pogłębianie tych modułów, które użytkownik będzie otwierał codziennie:

- RSVP
- goście
- vendorzy
- budżet
- taski
- dashboard

Na tych obszarach warto oprzeć dalszą roadmapę produktu.
