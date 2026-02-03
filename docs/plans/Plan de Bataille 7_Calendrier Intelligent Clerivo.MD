Plan de Bataille Fusionné : Le "Chronos" Optimisé – Orchestrateur Spatio-Temporel
Objectif : Créer un calendrier qui ne se contente pas de stocker des créneaux, mais qui comprend la géographie, calcule les trajets en temps réel et optimise les tournées de l'agent, le tout hébergé localement ("Local First").
1. La Philosophie : Du "Conteneur" au "Stratège"
Nous abandonnons l'idée du calendrier comme simple grille passive. Le système devient un Ordonnanceur Spatio-Temporel.
•	Conscience du Conflit Invisible : Un créneau libre sur l'agenda n'est pas forcément un créneau disponible physiquement (temps de trajet).
•	Arbitrage Logistique : Le système doit être capable de dire "Non" ou de proposer mieux ("Si vous allez à Nyon, groupez avec le client B qui est à 5 min").
________________________________________
2. Architecture Technique (La Stack "Local First" sur Pi 5)
L'infrastructure repose sur Docker pour garantir la stabilité et la souveraineté. Nous éliminons les dépendances Cloud coûteuses.
2.1. Le Triptyque Moteur (Backend)
1.	Moteur de Routage (Valhalla) :
o	Pourquoi : Contrairement à OSRM (trop gourmand en RAM), Valhalla utilise une structure en "tuiles" idéale pour le Raspberry Pi 5 (8/16Go RAM).
o	Rôle : Calcule les matrices de temps/distance et les isochrones (zones atteignables en 15 min).
o	Configuration : Docker gis-ops/docker-valhalla avec carte Suisse pré-chargée.
2.	Géocodeur Local (Photon) :
o	Pourquoi : Plus léger que Nominatim. Basé sur Elasticsearch, il tolère les fautes de frappe ("Fribourg Rue Lausanne").
o	Rôle : Convertit "Café du Commerce, Bulle" en coordonnées GPS pour Valhalla.
3.	Optimiseur de Tournées (VROOM) :
o	Ajout Stratégique : C'est le cerveau mathématique qui réorganise l'ordre des visites pour minimiser les km (Problème du Voyageur de Commerce).
o	Intégration : Fonctionne en tandem avec Valhalla via Docker.
2.2. Synchronisation "Hybride" (Google/Outlook uniquement)
Nous écartons Apple/iCloud pour l'instant (trop complexe/instable).
•	Protocole : Utilisation des API officielles (Google Node.js Client / Microsoft Graph) via OAuth2.
•	Stratégie "Server-Side" : Le Raspberry Pi synchronise en tâche de fond (Cron job), assurant que l'agenda est à jour même si l'ordinateur de l'agent est éteint.
•	Détection de doublons : Hachage des événements pour éviter les boucles infinies de synchronisation.
________________________________________
3. Le Cœur de la Donnée : Schéma SQLite "Chaîné"
C'est l'innovation majeure du Plan 7, conservée ici. Un événement n'est pas un îlot isolé, c'est un maillon d'une chaîne logistique.
Structure de la table events enrichie : 
•	Le Temps : start_time, end_time.
•	L'Espace : location_lat, location_lon, travel_mode.
•	Le Chaînage (Linkage) :
o	previous_event_id : Quel est le RDV précédent ? 
o	travel_time_to : Combien de temps pour venir du précédent ? (Calculé par Valhalla) .
o	buffer_before : Marge de sécurité (ex: 15 min pour se garer).
o	cluster_id : Groupe géographique (calculé par Turf.js pour regrouper les RDV proches).
________________________________________
4. Algorithmes d'Intelligence (Le Cerveau)
4.1. Détection de Conflit (Le "Hard Check")
Avant d'accepter un RDV, le système vérifie la viabilité physique via deux inéquations strictes : 
1.	Amont : Fin du RDV précédent + Trajet + Marge < Début du Nouveau RDV.
2.	Aval : Fin du Nouveau RDV + Trajet + Marge < Début du RDV suivant. Si une condition échoue, le créneau est marqué "Physiquement Impossible" (Rouge).
4.2. Algorithme de "Scoring" pour Proposition (Le "Smart Slotting")
Au lieu de juste dire "Libre", le système attribue un score aux créneaux libres:
•	Base : 100 points.
•	Malus Trajet : -1 point par minute de route inutile.
•	Bonus Cluster : +20 points si le RDV est dans la même ville qu'un RDV existant (Densification).
•	Résultat : Le système suggère : "Mardi 14h00 est optimal (Score 110 - Vous êtes déjà dans le quartier)".
4.3. IA Sémantique (Traitement des Emails)
•	Extraction Temporelle : Utilisation de la librairie chrono-node (rapide et déterministe) pour convertir "mardi prochain" en date réelle.
•	Analyse d'Intention : Utilisation d'un petit LLM local (Ollama/TinyLlama) ou API (GPT-4o-mini) pour comprendre si c'est une "Visite" (30 min) ou une "Signature" (90 min).
________________________________________
5. Interface Utilisateur : Le "Bento Grid" Réactif
L'interface doit rendre cette complexité invisible pour l'agent.
•	Technologie : React + FullCalendar.
•	Innovation Visuelle - Les "Travel Buffers" :
o	Les trajets ne sont pas invisibles. Ils apparaissent comme des blocs grisés (Background Events) avant chaque RDV.
o	Ces blocs sont dynamiques : si vous déplacez un RDV, le bloc trajet s'étire ou rétrécit en temps réel grâce à Valhalla.
•	Feedback Immédiat :
o	Si un RDV est glissé (Drag & Drop) sur une zone impossible (trajet trop long), le bloc devient Rouge Pulsant (Résistance visuelle).
•	Panneau Latéral "Actions" :
o	Liste les propositions de l'IA ("Mme Dupont demande une visite... Conflit détecté... Proposer 14h00 ?").
________________________________________
6. Feuille de Route d'Implémentation (Roadmap Simplifiée)
1.	Phase 1 : Socle "Local First" (Semaines 1-2)
o	Installation Docker (Valhalla + Photon + VROOM).
o	Mise en place de la DB SQLite avec le schéma "chaîné".
o	Livrable : Une API locale qui répond "45 min" quand on demande un temps de trajet Lausanne-Bulle.
2.	Phase 2 : Synchronisation & Logique (Semaines 3-4)
o	Création du CalendarService en Node.js.
o	Connexion OAuth2 Google/Microsoft (sans iCloud).
o	Implémentation du calcul de "Scoring" des créneaux.
o	Livrable : Un backend qui connait l'agenda réel et sait calculer les conflits.
3.	Phase 3 : Interface React & Visualisation (Semaines 5-6)
o	Intégration FullCalendar.
o	Affichage des "Background Events" (Temps de trajet).
o	Pop-ups de résolution de conflit ("Impossible, temps de trajet insuffisant").
o	Livrable : Le Dashboard Clerivo complet.

