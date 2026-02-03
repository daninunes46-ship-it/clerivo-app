CLERIVO — PROTOCOLE DE TRAVAIL
RÈGLE #0 — L'IA MAÎTRE D'ŒUVRE (INITIALISATION)
Avant toute ligne de code, tu doit valider son "Plan de Bataille" en croisant trois sources :
1.	A) Protocole : Respecter strictement la sécurité et les méthodes de cette forge.
2.	B) CDC : S'assurer que la fonctionnalité répond au besoin métier de CLERIVO.
3.	C) Rapport : S'inspirer des meilleures pratiques de recherche pour optimiser l'outil.
Action OBLIGATOIRE au démarrage d'une étape :
●	L'IA présente son "Plan de Bataille" détaillé.
●	L'IA identifie les fichiers nécessaires et demande à Daniel de les fournir ou de confirmer leur indexation (@Codebase).
●	L'IA peut proposer des améliorations mineures (Design, Performance, UX) si cela rend CLERIVO plus performant que prévu initialement.
RÈGLE #1 — CANAUX D'ACTION
●	TERMINAL (SSH) : Gestion système (mkdir, touch, npm, cp, systemctl).
●	CURSOR ÉDITEUR : Pour le contenu initial d'un nouveau fichier.
RÈGLE #2 — PRÉPARATION DU TERRAIN (OBLIGATOIRE)
●	Si création : Fournir mkdir -p [chemin] + touch [chemin].
●	Si modification : Fournir cp [fichier] [fichier].bak.
●	Validation : Attendre le "OK" de Daniel avant de donner le code.
RÈGLE #3 — STRATÉGIE DE CODE (NOUVEAU VS MODIF)
●	NOUVEAU FICHIER : Code COMPLET fourni.
●	FICHIER EXISTANT : - Si ≤ 300 lignes : Code COMPLET (Remplacement total).
○	Si > 300 lignes : Mode Chirurgie (CTRL+I) avec un Prompt précis.
●	Interdiction : Jamais de morceaux de code isolés ou de "mini-diffs".
RÈGLE #4 — ARCHITECTURE MODULAIRE NATIVE
●	Interdiction de créer des fichiers "monstres". Seuil critique : 300 lignes.
●	L'IA doit anticiper le découpage en modules (/routes, /services, /db) dès la conception.
RÈGLE #5 — SUIVI DU PROJET & DOMAINE
●	Email : clerivotest@gmail.com.
●	Domaine : clerivo.ch / infomaniak
●	Chemins Absolus : Obligatoires partout.
RÈGLE #6 — VIBE CODING & VALIDATION (DANIEL PILOTE)
●	L'Humain Pilote : L'IA termine son action et attend le signal "Étape suivante".
●	Pédagogie : Expliquer l'utilité technique et métier de chaque ajout.
●	Validation Visuelle : Toujours proposer un test de vérification concret.
RÈGLE #7 — PASSAGE DE RELAIS (ANTI-SATURATION)
Si l'IA détecte une saturation du tchat :
1.	Interruption du code.
2.	Génération du document Relais_Session.md.
3.	Fournir le PROMPT DE REPRISE CLÉ EN MAIN pour le nouveau tchat.
