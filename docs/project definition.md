# Aufgabenbeschreibung
Diese Aufgabe ist so konzipiert, dass sie (in einer Miniatur-Version) die Art von Problemen simuliert, mit denen wir arbeiten. Sie soll deine Herangehensweise an Problemlösungen und deine Fähigkeiten im Umgang mit unserem Tech-Stack testen. Versuche, für jeden Teil des Problems die besten Tools aus unserem Tech-Stack zu wählen. Die Aufgabe sollte in weniger als 10 Stunden abgeschlossen werden können.

# Szenario
Wir haben einen großen Datensatz mit Bankinformationen von Nutzern. Jede Nacht wollen wir die neuen Informationen einmal verarbeiten. Es gibt 3 mögliche Prozesse:
  1. Finde den neuen Kontostand für jedes Bankkonto (unter Verwendung der neuen Transaktionen in der Datenbank, die beim letzten Abrufen noch nicht vorhanden waren).
  2. Berechne das Nettovermögen jeder Person (Summe der Kontostände aller ihrer Bankkonten).
  3. Berechne den maximalen Betrag, den eine Person von ihren Freunden leihen kann.

Leihen wird wie folgt definiert:
   - Wenn du einen Freund hast, dessen Kontostand höher als deiner ist, kannst du die Differenz zwischen deinem Kontostand und dem seines Freundes leihen.

Wir haben die folgenden Entitäten:
  - Person (mit den Attributen: ID, Name, E-Mail), die mit anderen Personen durch eine bidirektionale "has_friend"-Beziehung verbunden ist.
   - Bankkonto (mit den Attributen: IBAN und aktueller Kontostand), das mit einer Person verbunden ist.
   - Banktransaktionen (mit den Attributen: IBAN  der anderen Person und Betrag, positiv oder negativ), die durch einen externen Service täglich in der Datenbank aktualisiert werden. Natürlich mit einem Bankkonto verknüpft.

# Aufgabe
Erstelle eine kleine Backend-Anwendung, die die folgenden Aufgaben ausführt:
   - Implementiere einen HTTP-Webhook-Endpunkt, der Benachrichtigungen empfängt. Der Webhook liefert eine process_id, und basierend auf dieser ID sollen die entsprechenden Prozesse ausgeführt werden. Wichtig: Jeder Prozess muss zuerst die vorangegangenen Prozesse ausführen. Beispiel: Wenn die process_id den Wert 3 hat, müssen zuerst die Prozesse 1 und 2 ausgeführt werden, damit der dritte Prozess die korrekten Ergebnisse liefert.
   - Stelle die notwendigen Endpunkte bereit, um die Personen- und Bankdaten abzufragen. Strukturiere das Projekt nach deinem Ermessen.
   - Erstelle einen zusätzlichen Endpunkt, der eine Person-ID entgegennimmt und den maximalen Betrag zurückgibt, den diese Person von ihren Freunden leihen kann.
   - Stelle sicher, dass du Schritte zur Ausführung und zum Testen des Codes angibst. Bitte stelle auch einige Mock-Daten bereit, wie du es für am einfachsten hältst.

# Tech-Stack
   - Versuche, NestJS, TypeORM, gremlinjs, Docker, OpenAPI und alle anderen Tools zu verwenden, die dir bei der Lösung der Aufgabe helfen können. Verwende Yarn für das Paketmanagement.

# Tipps
   - Du kannst Docker-Container für PostgreSQL und/oder eine Gremlin-Instanz verwenden.
   - Nutze die verfügbaren NestJS-Funktionen zum Einrichten einer Anwendung, z. B. $ nest generate <schematic> <name> [options], aber strukturiere das Projekt nach deinem Ermessen.
   - Es ist erlaubt, ChatGPT, CoPilot oder jedes andere AI-Tool zu nutzen, das dir beim Erstellen des Boilerplate-Codes und beim Setup der Anwendung hilft.
   - Erlaube es dem Nutzer, mit der Anwendung über Swagger, Postman, ein dediziertes Frontend oder ein anderes ähnliches Tool zu interagieren. Stelle sicher, dass du Schritte zum Ausführen und Testen der Anwendung bereitstellst.

# Zusätzliche Hinweise
   - Vergewissere dich, dass alle Teile des Systems gut dokumentiert sind, damit die Implementierung einfach getestet und nachvollzogen werden kann.
   - Bei der Erstellung von Mock-Daten hast du freie Hand – verwende, was für dich am einfachsten und schnellsten ist.
   - Es ist in Ordnung, wenn einige Teile der Aufgabe nicht vollständig definiert sind. Wähle die Interpretation, die für dich am meisten Sinn ergibt und zum Umfang des Projekts passt. Stelle sicher, dass du diese Entscheidungen dokumentierst, wo es nötig ist.

Bitte lad den Code auf einem zugänglichen Repository deiner Wahl hoch und gib uns Bescheid wenn du bereit bist das Ergebnis dem Team vorzustellen.