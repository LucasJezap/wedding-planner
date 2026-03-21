# Checklisty testowe

Ten plik zbiera rzeczy, ktore warto recznie lub automatycznie przetestowac po wdrozeniu nowych modulow.

## Rozszerzony RSVP v1

- sprawdz lookup RSVP poprawnym tokenem
- sprawdz lookup RSVP niepoprawnym tokenem
- sprawdz zapis statusu RSVP: `ATTENDING`
- sprawdz zapis statusu RSVP: `DECLINED`
- sprawdz zapis liczby gosci
- sprawdz zapis liczby dzieci
- sprawdz zapis osoby towarzyszacej
- sprawdz zapis preferencji posilku
- sprawdz zapis alergii i uwag zywieniowych
- sprawdz zapis potrzeby noclegu
- sprawdz zapis transportu na miejsce
- sprawdz zapis transportu powrotnego
- sprawdz zapis wiadomosci do pary
- sprawdz czy po ponownym lookupie odpowiedz RSVP wraca z zapisanymi danymi

## Moduł grup zaproszeń v2

- sprawdz tworzenie grupy zaproszen przez formularz goscia
- sprawdz przypisanie kilku gosci do tej samej grupy
- sprawdz filtrowanie listy gosci po grupie
- sprawdz masowe przypisanie grupy
- sprawdz widok podsumowan grup na ekranie gosci
- sprawdz liczbe miejsc przypisana do grupy
- sprawdz flage `plus-one` na grupie
- sprawdz notatki grupy
- sprawdz automatyczne usuwanie pustej grupy po usunieciu ostatniego goscia
- sprawdz publiczny lookup RSVP dla goscia z grupy
- sprawdz czy publiczny RSVP pokazuje wszystkich czlonkow grupy
- sprawdz czy zapis RSVP aktualizuje cala grupe zaproszenia
- sprawdz czy status RSVP wszystkich czlonkow grupy zmienia sie po wspolnej odpowiedzi

## Vendor CRM v1

- sprawdz tworzenie vendora z nowymi polami CRM
- sprawdz edycje statusu wspolpracy
- sprawdz edycje ownera
- sprawdz edycje daty rezerwacji
- sprawdz edycje terminu follow-up
- sprawdz edycje depozytu
- sprawdz zapis linku do oferty
- sprawdz zapis linku do strony www
- sprawdz zapis linku do Instagrama
- sprawdz widocznosc statusu na karcie vendora
- sprawdz widocznosc ownera na karcie vendora
- sprawdz widocznosc follow-up na karcie vendora
- sprawdz widocznosc depozytu na karcie vendora
- sprawdz ukrycie cen dla roli bez dostepu do pricingu
- sprawdz czy vendor nadal zapisuje kontakt email, telefon i notatki

## Budzet v2

- sprawdz tworzenie wydatku z przypisanym uslugodawca
- sprawdz tworzenie wydatku bez przypisanego uslugodawcy
- sprawdz zapis terminu platnosci
- sprawdz edycje terminu platnosci
- sprawdz widocznosc nazwy uslugodawcy na karcie wydatku
- sprawdz widocznosc terminu platnosci na karcie wydatku
- sprawdz oznaczenie wydatku jako overdue, gdy termin minal i pozostaje kwota do zaplaty
- sprawdz brak overdue, gdy wydatek jest w pelni oplacony
- sprawdz czy po dodaniu platnosci remaining amount liczy sie poprawnie
- sprawdz czy po edycji wydatku powiazanie z vendorem pozostaje poprawne

## Dashboard operacyjny v1

- sprawdz widocznosc karty "Do dopilnowania"
- sprawdz czy liczba brakujacych RSVP pojawia sie w dashboardzie
- sprawdz czy goscie bez przypisanego stolu pojawiaja sie w dashboardzie
- sprawdz czy overdue taski sa oznaczone jako wymagajace uwagi
- sprawdz czy read-only nie widzi sekcji taskowych dashboardu
- sprawdz czy witness nie widzi sekcji budzetowych dashboardu
- sprawdz czy vendorzy z follow-up date pojawiaja sie na watchliscie
- sprawdz czy vendorzy BOOKED lub REJECTED nie pojawiaja sie na watchliscie follow-up
- sprawdz czy alerty platnosci pokazuja overdue i upcoming wydatki
- sprawdz czy alerty platnosci nie sa widoczne dla roli bez dostepu do budzetu
- sprawdz linki przejscia z dashboardu do odpowiednich modulow
