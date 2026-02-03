Clerivo - Cahier des charges (CDC) Master

Co-agent immobilier pour la location en Suisse (ClawdBot + IA)

Version : v1.1.0 (FINAL)
Date : 2026-02-03
Destinataire : Daniel Nunes (investisseur)
Objectif : document de référence unique pour concevoir, développer et livrer Clerivo.

1. Contexte et objectifs
Clerivo est une plateforme "local first" hébergée sur Raspberry Pi, conçue pour réduire la charge administrative d'une agence immobilière suisse, principalement sur le parcours locatif (de la demande initiale à la sortie du locataire).
La stratégie produit est volontairement pragmatique : priorité aux fonctions qui font gagner du temps, réduisent les oublis, et augmentent le taux de dossiers complets, plutôt qu'aux démonstrations spectaculaires difficiles à maintenir.
Ce CDC consolide les meilleurs éléments des 8 plans de bataille fournis, en les filtrant par utilité quotidienne et faisabilité technique sur une architecture locale.
1.1 Objectifs mesurables
•	Réduire le temps de traitement des demandes entrantes (email) et obtenir une inbox exploitable en continu.
•	Augmenter le taux de dossiers complets et envoyables (pack candidature) sans relances manuelles répétitives.
•	Réduire les no-show et la friction de planification des visites.
•	Standardiser la sélection (règles simples) et la collaboration en agence (attribution, historique, audit).
•	Garantir un niveau de sécurité adapté à des données sensibles (poursuites, salaires, pièces d'identité).
2. Périmètre et principes
2.1 Périmètre fonctionnel
•	Parcours locatif suisse : recherche/qualification, visite, dépôt dossier, analyse/attribution, signature & garanties, état des lieux, vie du bail, sortie.
•	Messagerie : ingestion email, classement, résumé, brouillons, pièces jointes.
•	Dossier candidat : portail de dépôt, checklist dynamique, pack candidature.
•	Agenda : synchronisation et planification des visites.
•	Dashboard : vue opérationnelle (aujourd'hui, alertes, pipeline).
•	Collaboration : multi-utilisateurs, rôles, permissions, journal d'audit.
2.2 Principes directeurs
•	Adoption d'abord : l'agent doit vivre dans 3 écrans max (Inbox, Pipeline, Dossier).
•	Automatisation invisible : le maximum d'actions se déclenche en arrière-plan (relances, statuts, tâches).
•	Local first : données et logique sur l'infrastructure locale ; accès pro via HTTPS sans exposer le Raspberry.
•	Sécurité par conception : chiffrement, contrôle d'accès, journaux, sauvegardes et politique de rétention.
•	IA assistée et vérifiable : l'IA propose, l'humain valide ; pas de refus automatique.

2.3 Périmètre par versions (validé)
•	V1 - adoption agence (livrable prioritaire)
•	Modules visibles : Boîte de messagerie 2.0 - Portier de Nuit, Pipeline Location, Swiss Safe, Chronos & Scheduler.
•	Automations invisibles : statuts, tâches, relances basiques, DossierForge (pack candidature 1 clic).
•	Socle agence : TeamOps (multi-utilisateurs, rôles, attribution, audit) + DataVault (chiffrement, sauvegardes, rétention/purge).
•	Intégrations minimales : email (ingestion + envoi) et agenda (synchronisation).
•	V1.1 - productivité et standardisation
•	Sherlock (contrôle qualité) : illisible, manque, incohérence simple, sans décision automatique.
•	SolvencyScore : règles transparentes et configurables (aide à la décision).
•	DocuDrop : modèles versionnés + génération/archivage rapide.
•	Dashboard opérationnel : vue 'aujourd'hui', alertes, KPIs simples.
•	V1.2 - exploitation du bail
•	CautionFlow : suivi garantie demandée / reçue / validée + relances.
•	EDL SnapBook : état des lieux entrée/sortie (photos, réserves, PDF).
•	TenantPulse : tickets locataires (SLA simple) + historique par logement.
•	V1.3 - sortie et relocation
•	ExitNavigator : résiliation, remplaçants, EDL sortie, clôture et restitution garantie.

Verrouillage : le périmètre ci-dessus est validé. Toute demande hors périmètre V1 doit créer une évolution de version (v1.0.3+).
2.4 Critères de validation (Definition of Done)
•	V1 - adoption agence
•	Inbox : ingestion email + threading OK, création lead OK, brouillon IA + validation + envoi OK, pièces jointes rattachées au dossier OK.
•	Dossier : dépôt sécurisé + checklist dynamique + DossierForge (pack candidature) OK.
•	Agenda : prise de RDV + confirmation + relance no-show OK.
•	TeamOps : rôles, attribution, audit (qui a fait quoi) OK.
•	DataVault : chiffrement + sauvegarde/restauration testée + purge dossiers refusés OK.
•	V1.1 - productivité
•	Sherlock : alertes sur dossier incomplet/illisible + fermeture manuelle OK.
•	SolvencyScore : règles configurables + justification courte affichée OK.
•	DocuDrop : génération d'un document type + archivage automatique OK.
•	Dashboard : vue 'aujourd'hui' + alertes + KPIs simples OK.
•	V1.2 - exploitation
•	CautionFlow : états + relances + preuve archivée OK.
•	EDL SnapBook : export PDF signé + photos rattachées OK.
•	TenantPulse : ticket complet (création -> clôture) + historique logement OK.
•	V1.3 - sortie
•	ExitNavigator : workflow sortie complet + documents finaux + clôture OK.

2.5 Dossier complet des fonctions (référence)

2.6 Spécifications minimales par module (V1)
Cette section ajoute un niveau de détail suffisant pour piloter le développement sans transformer le CDC en usine à gaz. Elle définit, pour chaque module V1, les entrées/sorties, les écrans, les règles et les critères d’acceptation.
6.1 Boîte de messagerie 2.0 - Portier de Nuit (V1)
Messagerie 2.0 - exigences V1 supplémentaires
•	Filtrage spam/arnaques (ClawdBot) : classification automatique avec score de confiance.
•	Règles : spam certain -> archiver automatiquement + log ; incertain -> file 'À vérifier' ; légitime -> flux normal.
•	Sécurité : jamais d'envoi automatique ; brouillon IA uniquement ; validation humaine obligatoire (V1).
•	Historique : chaque thread est tracé, rattaché au candidat et/ou au bien, et synchronisé avec Pipeline Location.
•	Statuts messagerie : non-lu / à traiter / en attente / relancé / terminé + synchronisation (au minimum) avec les statuts du pipeline.
•	Multilingue Suisse : détection FR/DE (V1) et brouillon dans la langue du message ; traduction interne optionnelle sans altérer le contenu légal.
•	Relances : timers configurables ; relance auto possible uniquement sur messages légitimes (pas de spam) et avec coupe-circuit.
•	But : traiter les fils entrants, produire des brouillons IA, et synchroniser automatiquement le pipeline et les dossiers.
•	Entrées : emails (IMAP/API), pièces jointes, règles de tri, templates de réponse.
•	Sorties : statuts + tâches, brouillons (jamais envoyés sans validation), pièces vers Swiss Safe, logs d’audit.
•	Écrans : (1) Inbox threads (filtres statut/bien/assigné) ; (2) Vue thread (messages + résumé IA + actions rapides) ; (3) Composer (brouillon IA + variables + validation) ; (4) Panneau contexte (candidat/bien + checklist + prochaines tâches).
•	Règles : threading par conversation ; chaque thread peut être rattaché à 0..1 bien et 0..N candidats ; toute action écrit un audit trail.
•	Garde-fous : V1 = 100% human-in-the-loop (aucun envoi automatique).
•	Contrats minimaux : /api/inbox/list (threads), /api/inbox/thread/:id, /api/inbox/draft (créer), /api/inbox/send (envoyer), /api/inbox/attach (vers Swiss Safe).
•	Acceptation : 1) un email crée/alimente un thread ; 2) le résumé IA + actions proposées apparaissent ; 3) un brouillon peut être validé et envoyé ; 4) une pièce jointe est stockée et rattachée au bon dossier ; 5) le pipeline se met à jour.
6.2 Pipeline Location (V1)
•	But : visualiser l’état de chaque candidature par bien, avec attribution, alertes et historique.
•	Statuts : nouveau → visite → dossier incomplet → dossier prêt → transmis → retenu/refusé (configurable).
•	Écrans : vue par bien, vue candidat, timeline actions (qui/quand).
•	Acceptation : changement de statut depuis Inbox et depuis Pipeline ; attribution + audit ; alertes ‘dossier bloqué’.
6.3 Swiss Safe (V1)
•	But : collecte sécurisée et centralisée des documents sensibles, avec checklist Suisse et versions.
•	Checklist dynamique : profil (permis, salarié/indépendant, couple, garant, colocation) → liste attendue.
•	Contrôle qualité : lisible, complet, format, date/validité ; versioning et remplacement.
•	Acceptation : un lien de dépôt est généré ; les documents déposés apparaissent dans le dossier ; indicateur dossier prêt mis à jour.
6.4 Chronos & Scheduler (V1)
•	But : planifier visites et relances no-show avec intégration agenda.
•	Règles : créneaux groupés, confirmation automatique, relance J-1/J-0 ; annulation/replanification 1 clic.
•	Acceptation : création d’un RDV depuis Inbox ; notification envoyée ; statut visite mis à jour ; note de visite enregistrée.
6.5 DossierForge (automation V1)
•	But : générer un pack candidature (PDF récap + pièces) et piloter relances pièces manquantes/expirées.
•	Acceptation : pack généré en 1 clic, stocké, et attachable à un email ; indicateur vert/orange/rouge avec raison.
6.6 TeamOps + DataVault (socle V1)
•	TeamOps : rôles, permissions, assignation, commentaires internes, audit (qui a fait quoi, quand).
•	DataVault : chiffrement, sauvegardes/restauration testée, politique de conservation, purge dossiers non retenus, logs sécurité, HTTPS reverse proxy sans exposer le Raspberry.
•	Acceptation : 2 utilisateurs simultanés ; audit consultable ; restauration d’une sauvegarde validée en test.
Note : Sherlock, SolvencyScore, DocuDrop, Dashboard restent en V1.1 (cf. périmètre par versions).
A) Modules visibles (V1 - usage quotidien)
•	Boîte de messagerie 2.0 - Portier de Nuit : inbox unifiée + tri + actions + brouillons IA (validation humaine).
•	Pipeline Location : vue par bien/statut + assignation + alertes + historique des actions.
•	Swiss Safe : portail dépôt sécurisé + checklist Suisse + contrôle qualité + versions.
•	Chronos & Scheduler : RDV visites + confirmations + relances + replanification 1 clic.
B) Automations invisibles (V1 - obligatoires)
•	DossierForge : pack candidature 1 clic (PDF récap + pièces) + relances pièces manquantes/expirées + indicateur dossier prêt.
•	Moteur tâches : création de tâches et statuts à partir des messages (garde-fous, traçabilité).
C) Productivité & standardisation (V1.1)
•	Sherlock (contrôle qualité) : incohérences simples + 'à vérifier' (jamais refus automatique).
•	SolvencyScore : scoring transparent et configurable + justification courte.
•	DocuDrop : modèles versionnés + génération/archivage automatique.
•	Dashboard : vue 'aujourd'hui', alertes, KPIs simples.
D) Exploitation du bail (V1.2)
•	CautionFlow : suivi garantie demandée/reçue/validée + relances + preuves.
•	EDL SnapBook : EDL entrée/sortie (photos, réserves, signatures, export PDF).
•	TenantPulse : tickets locataires + SLA simple + historique logement.
E) Sortie & relocation (V1.3)
•	ExitNavigator : résiliation, remplaçants, EDL sortie, clôture, restitution garantie.
F) Exigences non négociables (socle agence)
•	TeamOps : multi-utilisateurs, rôles, assignation, commentaires internes, audit.
•	DataVault : chiffrement, sauvegardes/restauration testée, rétention/purge, logs sécurité, HTTPS via reverse proxy (Raspberry jamais exposé).
3. Acteurs, rôles et droits
•	Agent : traite l'inbox, planifie les visites, suit les candidatures.
•	Gestionnaire/Manager : suit le pipeline, attribue, pilote les KPIs.
•	Admin technique : gère utilisateurs, intégrations, sécurité, sauvegardes.
•	Candidat (externe) : dépose des pièces via Swiss Safe, reçoit confirmations et relances.
3.1 Rôles (RBAC)
•	Admin : accès total + paramètres sécurité + rétention.
•	Manager : lecture complète + attribution + règles scoring.
•	Agent : accès aux dossiers assignés + actions messagerie/agenda.
•	Lecture seule : audit/consultation.
4. Parcours locatif suisse - flux cible
Ce parcours sert de squelette aux statuts et aux automatisations. Chaque objet (candidat, bien, dossier, évènement) doit pouvoir être rattaché à une étape.
1.	Demande entrante (email/appel) -> qualification -> création lead/candidat.
2.	Proposition de visite -> confirmation -> visite réalisée + notes.
3.	Dépôt de dossier -> contrôle qualité -> dossier prêt.
4.	Transmission à la régie/bailleur -> échanges -> décision (retenu/refusé).
5.	Signature -> garantie de loyer -> entrée (EDL entrée).
6.	Vie du bail -> tickets/demandes.
7.	Sortie -> EDL sortie -> clôture.
4.1 Pièces et informations typiques demandées (Suisse)
Clerivo doit être capable de gérer ces éléments via checklist, versions et dates de validité (les détails varient selon régies et cantons).
•	Extrait du registre des poursuites (souvent exigé, récent : moins de 3 à 6 mois selon pratiques).
•	Pièce d'identité ou permis de séjour (B, C, G, L, etc.).
•	Fiches de salaire récentes (souvent les 3 derniers mois) et/ou contrat de travail.
•	Attestation employeur / lettre de recommandation (selon régie).
•	Attestation d'assurance responsabilité civile (souvent demandée).
•	Formulaire de demande de location complété et signé.
•	Lettre de motivation (option, utile en marché tendu).
•	Justificatif de capacité à fournir une garantie de loyer (compte bloqué ou solution de caution).
4.2 Point conformité - collecte de données
Clerivo doit permettre de configurer le "moment de collecte" (par étape) pour éviter de demander trop tôt des pièces sensibles. Le système doit aussi permettre d'appliquer des politiques de rétention/purge pour les dossiers refusés.
•	Paramètre par agence : pièces demandées à la qualification vs pièces demandées après décision de poursuivre (ex. avant signature).
•	Rétention automatisée : suppression/purge après X jours si candidature non retenue (configurable).
•	Historique/audit : traçabilité des accès et exports de documents.
5. Modules - vue produit (noms + responsabilité)
Les modules sont organisés en trois catégories : modules visibles (V1 adoption), moteur automatique (back-office), et extensions activables ensuite.
5.1 Modules visibles (V1 adoption)
•	Boîte de messagerie 2.0 - Portier de Nuit : inbox unifiée (email) + tri + actions rapides + brouillons IA.
•	Pipeline Location : vue par bien et par statut + attribution + alertes.
•	Swiss Safe : portail sécurisé de dépôt + checklist dynamique + coffre-fort.
•	Chronos & Scheduler : planification des visites + confirmations + relances.
5.2 Moteur automatique (en arrière-plan)
•	DossierForge : pack candidature 1-clic + relances + indicateur dossier prêt.
•	Sherlock (Contrôle Qualité) : incohérences simples + illisibilité + pièces manquantes.
•	SolvencyScore : scoring simple configurable + justification courte.
•	DocuDrop : génération/stockage des documents types et exports.
5.3 Extensions activables ensuite
•	CautionFlow : suivi garantie de loyer (demandée/reçue/validée) + relances + limite à 3 mois de loyer pour habitation (paramètre).
•	EDL SnapBook : état des lieux entrée/sortie (photos, réserves, PDF).
•	TenantPulse : tickets locataires (SLA, historique).
•	ExitNavigator : résiliation, remplaçants, sortie, clôture.
5.4 Socle non négociable
•	TeamOps : collaboration agence (multi-utilisateurs, assignations, commentaires internes).
•	DataVault : sécurité et conformité (chiffrement, logs, sauvegardes, rétention/purge).
6. Spécifications fonctionnelles détaillées
Chaque module est décrit avec : objectif, écrans, actions, règles, données, et critères d'acceptation.
6.1 Boîte de messagerie 2.0 - Portier de Nuit
Objectif
Centraliser les emails et transformer un flux passif en pipeline actionnable. Réduire la lecture inutile en mettant en avant uniquement les messages qui exigent une action.
Écrans
•	Inbox (liste threads) : filtres par statut, bien, assigné, priorité, non-lus.
•	Vue thread : messages + pièces jointes + résumé IA + actions rapides.
•	Panneau contexte : fiche candidat/bien + checklist pièces + prochaines tâches.
•	Composer : brouillon IA, modèles, variables, validation, envoi.
Portée messagerie (coeur Clerivo)
•	Ingestion : IMAP (lecture) + SMTP (envoi) ou API fournisseur (Gmail/M365) selon compte client.
Duo ClawdBot + IA (options activables)
•	Auto-tri : classification automatique par intention (visite, dossier, garantie, EDL, réclamation, résiliation) avec niveau de confiance.
•	Garde-fous : jamais d'envoi automatique sans validation en V1 (mode 100% humain-in-the-loop).
•	Multilingue FR/DE : détection langue + brouillon dans la langue du candidat, sans altérer le contenu légal.
•	Auto-création tâches : créer des tâches (pipeline) à partir d'un mail (ex. 'demander extrait poursuites').
•	Auto-relances : si pas de réponse X jours, relance automatique (avec garde-fous).
•	Auto-brouillons : réponses prêtes + variables (nom, adresse, créneaux) + ton paramétrable (agence).
•	Auto-résumé : 3 lignes + points d'action + pièces manquantes détectées.
•	Recherche : plein texte (objet + corps + pièces) avec filtres (bien, candidat, statut, dates).
•	Actions rapides : demander pièce manquante, proposer RDV, envoyer lien Swiss Safe, générer pack DossierForge, refuser proprement.
•	Réponse assistée : brouillon IA + validation humaine + envoi + journalisation (qui a envoyé quoi).
•	Pièces jointes : extraction + contrôle (format, lisibilité) + stockage dans Swiss Safe (versions, dates de validité).
•	Classement : statuts (à qualifier / à compléter / dossier prêt / en attente / terminé) + tags + assignation collaborateur.
•	Threading : regroupement par conversation, détection de sujet, rattachement automatique à un bien et/ou un candidat.
•	Inbox (liste) : filtres, recherche, statuts, tags, assignation.
•	Détail message : résumé du fil, pièces jointes, actions rapides, brouillon IA.
•	Vue thread : historique complet et éléments extraits (dates, adresses, bien, candidat).
Actions utilisateur
•	Attribuer un message/dossier à un collaborateur.
•	Changer le statut (nouveau, à qualifier, en attente documents, visite, dossier prêt, transmis, clos).
•	Générer un brouillon IA et valider/éditer la réponse.
•	Envoyer une demande de pièces manquantes (template).
•	Créer/planifier une visite depuis le message.
Règles métier
•	Aucune réponse automatique : un brouillon doit être validé explicitement.
•	Chaque message doit être rattaché à un thread ; un thread peut être rattaché à un candidat et éventuellement à un bien.
•	Le système propose un statut par défaut à l'ingestion (nouveau) puis un statut recommandé.
•	Pièces jointes : extraction et rattachement au coffre-fort du candidat.
Données principales
•	messages, threads, contacts (candidats), biens, tâches, pièces jointes.
•	embedding (option) pour recherche contextuelle locale dans SQLite.
Critères d'acceptation
•	Un email entrant apparaît dans l'inbox en moins de 60 secondes après réception (si IMAP actif).
•	Le détail affiche un résumé du fil et une proposition d'action.
•	L'utilisateur peut répondre depuis Clerivo et la réponse est visible dans le thread.
•	Une pièce jointe peut être enregistrée dans le coffre-fort candidat en un clic.
6.2 Pipeline Location
Objectif
Offrir une vue immédiate de l'état des candidatures par bien et par étape, avec responsabilités et alertes.
Écrans
•	Vue pipeline par bien (colonnes par statut).
•	Vue liste candidats (tri/filtre, assignation).
•	Détail bien (candidats, visites, documents, historique).
Actions utilisateur
•	Déplacer un candidat d'un statut à l'autre.
•	Attribuer un candidat à un agent.
•	Marquer une candidature comme retenue/refusée.
•	Créer une tâche de suivi (appel, relance, préparation).
Règles métier
•	Les statuts doivent correspondre au parcours (section 4).
•	Un candidat ne peut pas être 'dossier prêt' si checklist non validée.
•	Chaque action majeure crée une entrée dans audit_log.
Données principales
•	candidats, biens, statuts, assignations, tâches, audit_log.
Critères d'acceptation
•	Le pipeline affiche correctement les volumes par statut.
•	Les alertes remontent les dossiers bloqués (inactivité ou documents expirés).
•	Le manager voit la charge par agent.
6.3 Swiss Safe
Objectif
Collecter des pièces sensibles de manière sécurisée, guidée et traçable, en évitant les échanges email. Supporter des checklists de pièces courantes (poursuites, ID, salaires, RC, etc.) avec dates de validité.
Écrans
•	Portail candidat (externe) : checklist + upload.
•	Vue interne : checklist, validation, versions, expirations.
•	Coffre-fort documents : arborescence par type et par date.
Actions utilisateur
•	Configurer une checklist (modèle) et l'appliquer à un candidat.
•	Envoyer un lien d'accès au portail (token + expiration).
•	Valider/Refuser un document (motif).
•	Demander une nouvelle version (relance).
Règles métier
•	Lien portail à usage limité (expiration, révocation).
•	Contrôle format (PDF/JPG/PNG), taille max, antivirus optionnel.
•	Versioning : conserver l'historique des documents déposés.
•	Dates de validité : ex. poursuites < 3-6 mois (paramétrable).
•	Politique d'accès : seuls les agents autorisés voient les documents.
Données principales
•	documents, document_versions, checklist_items, tokens_portail, validity_rules.
Critères d'acceptation
•	Un candidat peut déposer plusieurs documents sans compte.
•	Chaque document est classé automatiquement par type et date.
•	Un agent peut valider la checklist et marquer le dossier prêt.
6.4 Chronos & Scheduler
Objectif
Planifier les visites rapidement, réduire les no-show, et regrouper intelligemment les tournées.
Écrans
•	Agenda (semaine/jour) avec type d'évènement.
•	Création visite depuis un message ou un bien.
•	Vue tournée (option) : regroupement + temps de trajet.
Actions utilisateur
•	Proposer des créneaux au candidat (lien) et enregistrer la confirmation.
•	Relancer automatiquement avant la visite.
•	Noter la visite (résumé, points clés, prochaine action).
Règles métier
•	Synchronisation calendrier via OAuth2 (Google / Microsoft).
•	Temps de trajet : calcul optionnel via service local (ex. Valhalla en Docker).
•	Un évènement visite doit être rattaché à un bien et un candidat.
Données principales
•	events, calendars, oauth_tokens, travel_cache.
Critères d'acceptation
•	Un RDV confirmé apparaît dans Clerivo et dans le calendrier externe.
•	Relances envoyées selon règles (ex. J-1, H-2).
•	Notes de visite visibles dans le dossier candidat.
6.5 DossierForge
Objectif
Produire un dossier envoyable en un clic : pack PDF + pièces, avec relances automatiques jusqu'à complétude.
Écrans
•	Bouton 'Générer pack candidature' (dans dossier candidat).
•	Vue pack : contenu, ordre, export.
•	Vue relances : historique et prochaines relances.
Actions utilisateur
•	Générer un PDF récapitulatif + assembler les pièces en un dossier unique.
•	Envoyer un email de candidature (template) avec pièces jointes ou lien sécurisé.
•	Programmer/annuler des relances.
Règles métier
•	Le pack doit respecter un ordre stable (ID, poursuites, salaires, autres).
•	Indicateur dossier prêt : vert/orange/rouge + raison unique prioritaire.
•	Toute génération de pack est horodatée et archivée.
Données principales
•	packs, pack_items, exports, templates_email.
Critères d'acceptation
•	Le pack est généré en moins de 10 secondes pour un dossier standard.
•	L'export inclut toutes les pièces validées et exclut les refusées.
•	Le système propose automatiquement un email de candidature.
6.6 Sherlock (Contrôle Qualité)
Objectif
Aider l'agent à repérer les dossiers incomplets ou incohérents sans jouer au détecteur de fraude.
Écrans
•	Panneau 'Qualité dossier' dans le dossier candidat.
•	Liste d'alertes (à vérifier) + explication courte.
Actions utilisateur
•	Afficher alertes : illisible, pages manquantes, nom divergent, date incohérente.
•	Marquer une alerte comme 'vérifiée' ou 'non pertinente'.
Règles métier
•	Pas de décision automatique ; seulement des recommandations.
•	Les règles doivent être simples et explicables en une phrase.
•	Limiter les faux positifs : priorité à l'illisibilité et au manque.
Données principales
•	quality_flags, quality_reviews.
Critères d'acceptation
•	Sur un dossier incomplet, au moins une alerte 'pièce manquante' est générée.
•	Sur un document illisible (OCR faible), une alerte est générée.
•	L'utilisateur peut clôturer une alerte.
6.7 SolvencyScore
Objectif
Standardiser une première lecture de solvabilité à partir de règles configurables et transparentes.
Écrans
•	Configuration règles (admin/manager).
•	Panneau score dans dossier candidat.
Actions utilisateur
•	Calculer score et afficher résultat (ok / à compléter / refus recommandé).
•	Afficher la justification courte (ex. 'loyer > 35% revenu net').
Règles métier
•	Les règles doivent être configurables par agence et auditables.
•	Le score est une aide ; la décision finale reste humaine.
•	Gestion des cas : couple, garant, colocation, indépendant.
Données principales
•	scoring_rules, scoring_results.
Critères d'acceptation
•	Le résultat est identique pour un même dossier (déterministe).
•	Une modification de règle entraîne un recalcul traçable.
6.8 DocuDrop
Objectif
Générer, stocker et retrouver instantanément les documents types liés à la location.
Écrans
•	Bibliothèque de modèles (admin).
•	Génération depuis dossier/bien.
•	Historique des exports.
Actions utilisateur
•	Créer un document depuis un modèle (attestation, consignes, email).
•	Exporter PDF et archiver.
•	Partager via lien sécurisé.
Règles métier
•	Les modèles sont versionnés.
•	Chaque export est archivé et rattaché à un dossier.
Données principales
•	templates, template_versions, generated_docs.
Critères d'acceptation
•	Un modèle peut être créé/modifié sans redéployer le code (stockage DB ou fichiers).
•	Un export est retrouvé via recherche en moins de 2 secondes.
7. UX/UI - Charte et exigences d'expérience
L'UX doit réduire la charge mentale : moins de navigation, plus d'intention. L'interface doit être utilisable sans formation (Zero Learning Curve).
7.1 Structure d'interface
•	3 vues primaires : Inbox, Pipeline, Dossier.
•	Navigation secondaire discrète : Paramètres, Templates, Sécurité, Audit.
•	Command Palette (recherche + actions) accessible au clavier.
•	Bento grid pour les dashboards : cartes hiérarchisées, pas de tableaux denses partout.
•	Cartes KPI “glanceables” : valeur + delta + mini‑graphique (sparklines) + seuils d’alerte.
•	Progressive disclosure : résumé d’abord, détails au clic (pas de surcharge).
•	Zero-friction : actions primaires toujours visibles (1 clic) + raccourcis clavier via Command Palette.
•	États vides & loading : placeholders (skeleton), textes d’aide, jamais d’écran “blanc”.
•	Lisibilité “Apple-like” : grille 8pt, typographie sobre, contrastes élevés, couleurs limitées aux statuts/alertes.
•	Zero Learning Curve (ZLC) : l’utilisateur doit comprendre et agir sans formation ; divulgation progressive stricte (Miller 7±2).
•	Modèles mentaux 2026 : 'Feed' (cartes) + 'Search' (recherche) -> Bento + Command Palette comme navigation principale.
•	Onboarding invisible : aide contextuelle non bloquante, tooltips intelligents, suggestions au bon moment (pas de tour guidé intrusif).
•	Micro‑interactions : feedback immédiat (toast discret, animation courte), états de survol, confirmations non intrusives.
•	Performance perçue : optimistic UI lorsque possible, listes virtualisées, priorité au 'time‑to‑first‑action'.
•	Accessibilité : navigation clavier complète, focus states visibles, contrastes conformes, 'reduced motion' respecté.
•	Responsivité fluide : Bento réarrangé (mobile-first), conservant la hiérarchie (hero cards -> pile).
7.2 Composants standard
•	Cartes KPI : label, valeur, delta, sparkline, clic -> drilldown.
•	Status pills (couleurs sobres) + icônes légères.
•	Timeline d'actions (audit) lisible.
•	Tableaux : tri/filtre, colonnes minimales, sticky header.
•	Gestion pièces jointes : drag & drop, prévisualisation, tags type document.
•	Empty states utiles : proposer l'action suivante.
7.3 Règles de rédaction UI
•	Texte court, pas de jargon technique côté utilisateur.
•	Une action principale par écran.
•	Toute recommandation IA doit être expliquée en une phrase.
7.4 Dashboard (V1.1) - vision Bento/Apple (rendu cible)
•	Objectif : un tableau de bord 'glanceable' (lecture en 10 secondes) et actionnable (1 clic) sans formation.
•	Layout Bento : cellules héro (2x2/2x4) pour l’essentiel, cellules standard (1x1) pour indicateurs, cellules liste (1x2) pour activités.
•	Hiérarchie visuelle : taille = importance ; pas de grille uniforme type bootstrap.
•	Drill‑down : chaque carte ouvre une vue détaillée (filtrée) ; retour immédiat au dashboard.
•	Sparklines : mini‑tendances (7/30 jours) sur cartes KPI ; pas de graphiques lourds en accueil.
•	Command Palette : Cmd/Ctrl+K = accès universel (recherche + actions).
•	Empty states & skeleton : démonstration 'data‑like' + prochaine action proposée ; jamais 'aucune donnée' brut.
•	Qualité Apple‑like : spacing 8pt, typographie cohérente, contrastes, animations <=200ms, feedback immédiat.
•	Critères d’acceptation : (1) lecture 10s, (2) action 1 clic, (3) aucune formation, (4) clavier complet, (5) mobile lisible.
8. Architecture technique (référence)
8.1 Stack cible
•	Backend : Node.js (Express) sur Raspberry Pi.
•	Frontend : React (Vite ou Next selon choix), composants UI cohérents, animations légères.
•	Base : SQLite (WAL) + tables normalisées + journal d'audit.
•	Messagerie : IMAP ingestion + SMTP envoi (ou API provider).
•	Agenda : intégrations via OAuth2 (Google / Microsoft Graph).
•	Recherche contextuelle : embeddings stockés localement (BLOB) + requêtes.
•	Planification trajets (option) : Valhalla via Docker pour temps de trajet.
8.2 Modèle de données - objets
•	users, roles, permissions
•	agencies (multi-tenant), clients (candidats), properties (biens)
•	threads, messages, attachments
•	documents, document_versions, checklists
•	events (agenda), tasks
•	quality_flags, scoring_rules, scoring_results
•	exports/packs, templates
•	audit_log, security_events
9. Sécurité, conformité et exploitation
9.1 Défense en profondeur
•	Chiffrement data-at-rest (LUKS) sur le disque de données.
•	HTTPS obligatoire, reverse proxy, durcissement SSH.
•	RBAC strict + journaux d'audit.
•	Sauvegardes chiffrées + restauration testée.
•	Politique de rétention/purge automatisée (dossiers non retenus).
9.2 Exploitation
•	Services systemd (api, web, workers) + redémarrage auto.
•	Logs centralisés (fichiers) + rotation.
•	Checks de santé (ports, DB, IMAP) + page status.
•	Procédure de mise à jour versionnée et rollback.
10. Roadmap de livraison (phases)
•	Phase V1 Adoption : Boîte de messagerie 2.0 - Portier de Nuit, Pipeline Location, Swiss Safe, Chronos & Scheduler + TeamOps + DataVault.
•	Phase V1.1 Automatisation : DossierForge, Sherlock (qualité), SolvencyScore, DocuDrop.
•	Phase V1.2 Parcours complet : CautionFlow, EDL SnapBook, TenantPulse, ExitNavigator.
•	Phase V1.3 Optimisations : trajets, analytics avancés, amélioration recherche contextuelle.
11. Traçabilité - apports des plans de bataille
Cette section explique comment les 8 plans de bataille ont été exploités et filtrés.
•	Plans 2, 3, 5 : structures de messagerie, tables messages/threads, recherche contextuelle, automatisations. Les aspects anti-fraude agressifs sont repositionnés en contrôle qualité.
•	Plan 7 : calendrier, synchronisation OAuth2, optimisation tournée, base events enrichie.
•	Plan 6 : principes UX (bento grid, command palette, charge mentale).
•	Plan 4 : stratégie sécurité (chiffrement, défense en profondeur, logs, sauvegardes).
•	Plan 8 : Golden record client - retenu comme consolidation des identités et historique, mais limité au besoin opérationnel (pas de collecte inutile).
•	Plan 1 : modules 'spectaculaires' (3D/virtual staging) classés en R&D optionnelle, non inclus en phases V1-V1.2.
12. Références (parcours et pièces - Suisse)
•	Homegate - Extrait du registre des poursuites (usage pour candidatures).
•	SwissCaution - Dossier de location : pièces typiques (poursuites, ID/permis, fiches de salaire).
•	FirstCaution - Checklist demande de location et documents complémentaires (RC, lettre, ancienneté).
•	ASLOCA Vaud - Garantie de loyer (limite 3 mois) et restitution.
•	État de Vaud - Demande d'extrait du registre des poursuites.
•	Préposé fédéral à la protection des données (aide-mémoire sur formulaires de demande de location).
10. Ajouts issus des plans de bataille (périmètre réaliste)
Objectif : intégrer les meilleures pratiques des plans de bataille (productivité, robustesse, qualité UX) sans complexifier inutilement. Les ajouts ci-dessous sont formulés comme exigences vérifiables (UI/UX + comportements + garde-fous), adaptées à une implémentation 100% IA.
10.1 Boîte de messagerie 2.0 – exigences supplémentaires (V1)
•	Recherche sémantique locale (messages + pièces + notes) : retrouver une info même si le mot exact n’est pas connu.
•	Résumé de thread structuré (format fixe) : décisions / blocages / prochaines actions / acteurs (régie, candidat, garant, interne).
•	Triage multi-axes : intention (location/visite/admin/ticket), urgence (échéance), et ton/émotion (adapter le style du brouillon).
•	Timeline de vérité : fusionner email + actions pipeline + dépôts Swiss Safe + événements calendrier dans une vue chronologique unique par dossier.
•	Command Center (clavier) : Command Palette (Ctrl/Cmd+K) pour actions rapides (assigner, snooze, demander pièce, proposer visite, refuser, archiver).
•	Anti-spam/arnaques : classification automatique avec score de confiance ; spam certain → archive + log ; incertain → file “à vérifier” ; légitime → flux normal.
•	Multilingue Suisse (V1) : détection FR/DE et génération de brouillons dans la langue du message (sans traduction “brute”).
•	Relances : uniquement pour messages légitimes ; coupe-circuit ; pas de relance sur spam/arnaques.
10.2 Pipeline Location – ajouts productivité (V1)
•	Next Best Action : chaque carte candidat/bien affiche une action recommandée (1 clic) basée sur l’état (pièce manquante, visite à planifier, réponse régie…).
•	Motif de blocage standardisé : en attente candidat / en attente régie / en attente interne / pièce expirée / conflit planning / autre (obligatoire si statut “bloqué”).
10.3 Swiss Safe – ajouts qualité & friction zéro (V1)
•	Auto-classement + renommage intelligent des fichiers au dépôt (type détecté : fiche salaire, permis, extrait poursuites, RC, etc.).
•	Validité des pièces : règles explicites (ex. extrait poursuites < 3 mois) + alertes “bientôt expiré” + relance automatique.
•	Liens de dépôt sécurisés expirables et révocables (éviter l’échange email de documents sensibles).
•	Option V1 : acceptation d’une attestation provisoire de garantie de loyer (si fournie par le candidat).
10.4 Chronos & Scheduler – ajouts robustesse (V1.1)
•	Créneaux faisables : prise en compte basique du temps de trajet (mode simple) avant validation d’un créneau.
•	Anti-boucle calendrier : déduplication (hash) si synchronisation activée (éviter doublons).
10.5 DossierForge – ajouts “pack envoyable” (V1)
•	Pack candidature inclut une page récap (checklist + preuves de complétude) pour limiter les retours “il manque X”.
•	Snippets + variables : modèles de messages connectés à la messagerie (nom, adresse, date, lien Swiss Safe).
10.6 DataVault – ajout non négociable (V1)
•	Disaster drill : une procédure de sauvegarde + restauration testée (preuve de restauration) avant tout passage en production.
11. Parcours client Suisse – location via agence & couverture Clerivo
Le parcours ci-dessous synthétise les étapes typiques d’une location via régie/agence en Suisse et montre où Clerivo intervient. Objectif : garantir que chaque étape a un point d’appui (messagerie, documents, pipeline, planning, décisions, preuves).
•	1) Recherche & prise de contact (annonce / email / formulaire) — Messagerie 2.0 : tri intention, réponses assistées, actions rapides, création lead + rattachement bien.
•	2) Pré-sélection & questions (conditions, disponibilité, animaux, etc.) — Messagerie 2.0 + snippets + champs variables ; Pipeline : statut “pré-qualif” + Next Best Action.
•	3) Planification visite — Chronos : proposition de créneaux, confirmations, relances, anti no-show.
•	4) Visite & collecte du formulaire de candidature — Chronos : note de visite structurée ; Messagerie : relance dossier ; Pipeline : statut “visite faite”.
•	5) Dépôt dossier (pièces) — Swiss Safe : dépôt sécurisé + checklist Suisse (permis/ID, fiches salaire, extrait poursuites <3 mois, RC…).
•	6) Contrôle qualité & complétude — Swiss Safe + Sherlock (V1.1) ; DossierForge : indicateur “dossier prêt” + page récap.
•	7) Transmission à la régie / décision — DossierForge : pack candidature PDF + pièces ; Messagerie : envoi (après validation) + Pipeline : statut “transmis/retour régie”.
•	8) Garantie de loyer (caution) & signature — CautionFlow (V1.2) ; DocuDrop (V1.1) pour modèles/annexes ; logs DataVault.
•	9) Entrée / état des lieux — EDL SnapBook (V1.2) : preuves photo, réserves, signatures, export PDF.
•	10) Vie du bail (demandes locataire) — TenantPulse (V1.2) : tickets, historique logement, pièces jointes.
•	11) Sortie / relocation — ExitNavigator (V1.3) : préavis, EDL sortie, clés, clôture, restitution garantie.
Gaps traités par cette mise à jour : (a) anti-spam/arnaques automatisé, (b) résumé thread structuré, (c) timeline unifiée, (d) auto-classement documents, (e) preuve de restauration DataVault, (f) Next Best Action dans le pipeline.
