UX/UI State of the Art 2026 : Redéfinition Visuelle du Pipeline Clerivo
Directive Stratégique de Design pour un CRM Immobilier Premium
1. Synthèse Exécutive : L'Esthétique "Linear" dans le Contexte de 2026
La refonte visuelle du module Pipeline de Clerivo ne constitue pas une simple mise à jour cosmétique ; elle représente un alignement stratégique sur les standards d'interface utilisateur qui définiront l'année 2026. La demande explicite d'une esthétique "Apple-like/Linear" impose des contraintes de haute fidélité visuelle, caractérisées par une densité d'information élevée, une hiérarchie typographique rigoureuse et une utilisation sophistiquée des matériaux numériques.1 La contrainte critique du projet — l'immutabilité de la structure de données (Backend et API figés) — transforme cet exercice en un défi d'ingéniosité frontend : nous devons transcender la donnée brute pour créer du sens uniquement par la manipulation du rendu visuel (CSS, React Components).
En 2026, l'état de l'art du design SaaS a migré du minimalisme plat vers ce que l'on qualifie de "Pragmatisme Spatial" et d'"Utilité Liquide".2 Les interfaces ne sont plus des pages statiques mais des environnements dynamiques où la lumière, la profondeur et la texture jouent des rôles fonctionnels. Pour Clerivo, cela signifie que la vue Kanban doit évoluer d'un simple tableau de gestion de tâches vers un cockpit financier immersif. L'objectif n'est plus seulement de lire des données, mais de les ressentir "pré-attentivement" grâce à des signaux visuels ambiants qui réduisent la charge cognitive de l'agent immobilier.
Ce rapport détaille une architecture visuelle fondée sur trois piliers fondamentaux : la grille "Bento" pour la structuration modulaire de l'information 4, le "Liquid Glass" pour la hiérarchisation des plans de profondeur 5, et un système de "Micro-HUD" (Heads-Up Display) qui convertit les métadonnées textuelles en indicateurs graphiques intuitifs. Chaque recommandation formulée dans ce document respecte scrupuleusement la contrainte technique : aucune nouvelle propriété de données n'est requise. Nous exploitons exclusivement les props existants (Nom, Avatar, Montant, Titre, Date, Score) pour générer une expérience utilisateur de classe mondiale.
2. Philosophie de Design : Déconstruction de l'Esthétique "Linear" 2026
Pour atteindre le niveau de sophistication visuelle des produits "Apple-like" ou de l'application Linear, il est impératif de comprendre que cette esthétique ne repose pas sur l'absence d'éléments, mais sur une maîtrise absolue de la "physique" de l'interface. En 2026, l'écran n'est plus considéré comme une feuille de papier blanche, mais comme un assemblage de matériaux translucides et réactifs.
2.1. Le Matériau "Liquid Glass" et la Profondeur Sémantique
L'évolution majeure des interfaces de gestion de flux en 2026 réside dans l'abandon des gris opaques au profit de matériaux translucides complexes. Le concept de "Liquid Glass" ne sert pas uniquement de décoration ; il fournit un contexte spatial. Dans notre refonte, les colonnes du Kanban ne sont pas des conteneurs solides, mais des surfaces de "verre givré" traitées avec des filtres de flou d'arrière-plan (backdrop-filter: blur(20px)). Cette translucidité permet aux teintes subtiles de l'arrière-plan global de l'application de transparaître, créant une sensation d'unité et de fluidité.3
La gestion de la lumière est globale et non locale. Les ombres portées ne sont plus de simples dégradés de noir (rgba(0,0,0,0.5)), mais des lueurs diffuses colorées qui suggèrent l'élévation des cartes par rapport au plan de base. Cette approche, souvent qualifiée de "Lumière Ambiante", permet de distinguer les éléments interactifs des éléments statiques sans recourir à des bordures lourdes qui fatiguent l'œil.3 Le guide de style conceptuel rejette les séparateurs rigides au profit de variations de luminance : un élément est défini par sa réaction à la lumière virtuelle de l'interface, renforçant l'impression d'un outil "premium" et tangible.
Le choix des couleurs pour ce matériau de verre liquide est crucial. Nous nous éloignons du blanc pur (#FFFFFF) pour adopter des nuances de "Gris Fonctionnel" teintées. En mode clair, la surface de base est un gris froid très pâle (#F5F5F7), tandis que les cartes conservent un blanc pur pour maximiser le contraste. En mode sombre, l'inversion n'est pas arithmétique ; nous utilisons des gris profonds enrichis de bleu (#0E1012) pour éviter l'austérité du noir absolu, tout en maintenant une lisibilité optimale des textes.
2.2. L'Architecture Bento : La Grille comme Narrateur
La structure de données figée de Clerivo nous oblige à repenser l'organisation spatiale pour créer de la valeur. L'esthétique "Bento UI", inspirée des boîtes à lunch japonaises et popularisée par Apple et Microsoft, est la solution idoine pour 2026.4 Contrairement aux listes verticales traditionnelles, la grille Bento compartimente l'information en cellules asymétriques mais cohérentes.
Chaque carte Kanban devient une micro-grille. Au lieu d'empiler le Nom, le Titre et le Montant les uns sur les autres, nous définissons des zones dédiées dans un canevas 2x3. Cette modularité permet de guider l'œil de l'utilisateur selon un parcours précis : d'abord l'identité (Avatar), ensuite le signal d'urgence (Indicateur Visuel), puis le contexte (Titre du bien), et enfin la valeur (Montant). Cette disposition exploite le modèle de lecture en "F" et réduit la fatigue décisionnelle en rendant la structure de chaque carte prévisible et scannable.4
L'adoption de la grille Bento s'accompagne d'une règle stricte d'espacement. Le rythme visuel est dicté par une grille de 4px/8px. Les espaces entre les cellules internes de la carte sont fixés à 8px, tandis que les marges externes ("padding") sont généreuses (16px ou 20px), créant cette sensation "aérée" demandée par la cible. Les coins sont fortement arrondis (rayons de 12px à 24px), ce qui adoucit les jonctions et modernise instantanément l'apparence globale, la rendant plus tactile et organique.7
2.3. La Typographie comme Structure et Hiérarchie
Dans l'esthétique "Linear", la typographie remplace les lignes et les bordures comme principal séparateur de contenu. La police de caractères devient l'échafaudage de l'interface. Pour Clerivo, l'utilisation de la famille Inter (ou d'une néo-grotesque similaire comme San Francisco ou Geist) est recommandée pour sa lisibilité sur écran et sa neutralité moderne.1
La hiérarchie ne s'établit pas par la taille, mais par la graisse et la couleur (valeurs de gris). Une étiquette de champ n'est pas nécessairement plus petite, mais elle est traitée en text-secondary (gris moyen), tandis que la donnée elle-même est en text-primary (noir ou blanc haute densité). Pour les données financières, qui sont le cœur du métier immobilier, nous imposons l'utilisation de chiffres tabulaires (font-variant-numeric: tabular-nums). Cela garantit que les montants s'alignent parfaitement verticalement d'une carte à l'autre, évoquant la rigueur des terminaux financiers professionnels.10
L'approche typographique inclut également une gestion fine de l'interlettrage (letter-spacing). Les titres en majuscules (si utilisés pour les en-têtes de colonnes) doivent être légèrement espacés pour favoriser la lecture, tandis que les corps de texte denses bénéficient d'un interlettrage plus serré (négatif) pour créer des blocs de texte compacts et graphiques. C'est ce niveau de détail micro-typographique qui différencie une application standard d'une solution "Premium".
3. La "Super-Carte" Candidat : Architecture d'un Micro-HUD
Le cœur de l'expérience Clerivo réside dans la carte Kanban. Dans une interface CRM traditionnelle, cette carte est un conteneur passif de texte. Dans notre refonte 2026, elle se métamorphose en une "Super-Carte", une micro-application autonome qui visualise l'état du candidat en temps réel.9 La contrainte de ne pas modifier le backend nous oblige à utiliser les props existants — Nom, Avatar, Montant, Titre, Date, Score de Solvabilité — comme matières premières pour une reconstruction visuelle totale.
3.1. Stratégie de Disposition Bento (Le Grid 2x3)
Nous abandonnons la liste verticale pour une disposition en grille Bento qui organise les données disparates en zones de cohérence cognitive. La carte, bien que limitée en largeur (généralement 300px), est divisée spatialement pour maximiser la densité d'information sans sacrifier la lisibilité.
Zone de Grille
Position
Donnée Source
Fonction Visuelle & Cognitive
Zone 1 : Identité
Haut Gauche
Avatar + Nom
L'ancrage humain. C'est le point d'entrée visuel.
Zone 2 : Signal
Haut Droite
Score Solvabilité
Le "Micro-HUD". Remplace le texte par un indicateur visuel (Anneau).
Zone 3 : Contexte
Milieu (Full Width)
Titre du Bien
L'objet de la transaction. Traité comme un "Tag" ou un élément contextuel.
Zone 4 : Urgence
Bas Gauche
Date
Indicateur de fraîcheur. Codé chromatiquement pour signaler le retard.
Zone 5 : Valeur
Bas Droite
Montant/Revenu
La "Hero Metric". L'élément le plus visible pour motiver l'action.
Cette disposition permet une lecture diagonale rapide : de l'humain (Haut Gauche) vers la valeur (Bas Droite), traversant le contexte du bien.
3.2. Zone 1 & 2 : L'Identité et le Halo de Solvabilité (Micro-HUD)
L'innovation visuelle la plus critique pour répondre à la demande de "Signaux Visuels" est la suppression pure et simple du texte "Solvabilité Faible" ou "Score: 650". L'Avatar de l'utilisateur devient le support de cette information cruciale.11
Nous enveloppons l'avatar (ou les initiales) dans un anneau SVG dynamique. Ce n'est pas une simple bordure, mais une visualisation de données circulaire. La logique frontend, basée sur le prop Score, détermine l'apparence de cet anneau :
? Score > 750 (Excellent) : L'anneau est complet (360 degrés), d'une couleur verte lumineuse (#34D399). Un subtil badge "check" peut intersecter l'anneau, validant visuellement le profil.
? Score 600-749 (Bon) : L'anneau est partiel (75% de la circonférence), de couleur bleue (#3B82F6), indiquant un potentiel solide mais non parfait.
? Score < 600 (Risque) : L'anneau est rouge (#EF4444) et, détail crucial, son trait est "pointillé" ou fragmenté (stroke-dasharray). Cette rupture visuelle communique instantanément la notion de "fragilité" ou de "risque" sans qu'il soit nécessaire de lire un chiffre.13
L'interaction joue un rôle clé ici. Le chiffre précis du score est masqué par défaut pour réduire le bruit visuel ("Visual Noise"). Il n'apparaît qu'au survol de la souris (Hover), se superposant à l'avatar avec un effet de flou d'arrière-plan. C'est le principe de la "Divulgation Progressive" ("Progressive Disclosure"), essentiel aux interfaces modernes.14
3.3. Zone 3 : Le Contexte Immobilier (Traitement Typographique)
Le titre du bien (ex: "Appartement T3 Centre") a tendance à encombrer visuellement la carte. Pour alléger la présentation :
? Solution Visuelle : Nous traitons cette information comme un "Tag" ou une métadonnée secondaire.
? Stylisation : Une police de taille réduite (13px), une graisse moyenne (font-weight: 500) et une couleur grise (#6B7280). L'ajout d'une icône de dossier ou de maison très discrète (opacité 0.5) précède le texte, catégorisant visuellement l'information comme "L'Objet" du deal. L'utilisation de text-overflow: ellipsis garantit que les titres longs ne brisent pas la grille Bento.
3.4. Zone 5 : La Valeur Héroïque (Impact Financier)
Pour un agent immobilier, le montant de la commission ou de la vente est la métrique reine. Elle doit dominer la hiérarchie visuelle.
? Stylisation : C'est l'élément le plus grand de la carte. Nous utilisons Inter Display en 15px ou 16px, avec une graisse font-weight: 600.
? Ancrage Visuel : Alignée en bas à droite, cette donnée ancre la carte. C'est la "Bottom Line", au sens propre comme au figuré.
? Formatage Monétaire : Pour accentuer la lisibilité des chiffres, le symbole de la devise (€ ou $) est traité dans une nuance plus claire de gris et une taille légèrement inférieure (0.8em). Cela permet aux chiffres eux-mêmes de "pop" visuellement, facilitant la comparaison rapide des montants entre les cartes.15
4. Indicateurs Visuels : Un Système de Communication "No-Text"
La requête utilisateur pose une question fondamentale : "Comment remplacer le texte par du visuel?". Dans un dashboard haute performance, la lecture est une friction. Un label textuel "En retard" demande un traitement cognitif. Une teinte rouge est perçue instantanément par le cerveau reptilien. Nous mettons en place un Système de Signaux basé entièrement sur l'interprétation frontend des props existants.
4.1. Le Spectre de Solvabilité (L'Anneau Avatar)
Comme décrit précédemment, le prop Solvency Score pilote l'Anneau Avatar. Le détail de conception est ici primordial. L'anneau ne doit pas être un simple trait plat.
? Piste d'Arrière-plan : Un anneau gris très pâle (opacité 0.2) dessine le cercle complet, représentant le potentiel (100%).
? Trait de Premier Plan : L'indicateur coloré se superpose.
? Terminaison du Trait (Linecap) : Nous utilisons stroke-linecap: round pour donner une apparence moderne et organique, évitant les terminaisons carrées rigides.
? Lueur (Glow) : En mode sombre, l'anneau projette une ombre portée de la même couleur (box-shadow), créant un effet de tube néon subtil qui renforce la lisibilité sur fond noir.13
4.2. Le Signal de "Décroissance Temporelle" (Prop Date)
Le prop Date indique généralement la dernière interaction ou la création du deal. L'information "12/02/2026" est abstraite ; elle ne communique pas l'urgence.
? La Solution Visuelle : Teinte Ambiante d'Arrière-plan.
? Logique Frontend :
? Si (DateDuJour - DateDeal) > 7 jours (Attention requise) :
? Le fond de la carte perd sa neutralité blanche/vitrée.
? Il adopte une teinte très subtile, chaude (rgba(255, 59, 48, 0.03)).
? Un point pulsant (3px) apparaît discrètement à côté de la date.
? Si (DateDuJour - DateDeal) > 30 jours (Deal Stagnant/Froid) :
? L'opacité globale de la carte chute à 0.6. La carte semble visuellement "s'effacer" ou "se refroidir", signalant qu'elle est en train de mourir. C'est une métaphore visuelle puissante de l'inactivité.17
4.3. Le Signal de "Poids du Deal" (Prop Montant)
Tous les deals ne se valent pas. Une transaction à 1M€ doit peser visuellement plus lourd qu'une location à 800€.
? Solution Visuelle : L'Indicateur Barométrique.
? Sur le bord supérieur absolu de la carte, une ligne ultra-fine (2px) s'affiche, semblable à une barre de progression.
? Ligne Or (Gradient Métallique) : Pour les deals situés dans le top 10% (calculé par le frontend sur la base des cartes affichées).
? Ligne Argent : Pour la moyenne.
? Aucune Ligne : Pour les petits montants.
? Ce signal permet à un directeur d'agence de scanner le tableau et d'identifier immédiatement les "Pépites" sans lire un seul chiffre.



5. Le Conteneur Liquide : En-têtes de Colonne et Physique du Pipeline
L'en-tête de colonne est le "Centre de Commandement" pour chaque étape du pipeline (ex: "Négociation", "Visite"). En 2026, ces en-têtes ne sont plus de simples étiquettes ; ils deviennent des Résumés Financiers Actifs qui gamifient le processus de vente.19
5.1. L'En-tête "Sticky" en Verre Liquide
L'effet "Wow" demandé pour les colonnes s'obtient par la combinaison de la position "Sticky" (l'en-tête reste visible lors du défilement) et du traitement de matériau.
? Visuel : L'en-tête est une surface flottante avec un flou intense (backdrop-filter: blur(24px)). Il flotte littéralement au-dessus des cartes qui défilent en dessous.
? Structure de l'Information :
1. Nom de l'Étape : (ex: "Visite en cours") - Typographie grasse, contraste élevé.
2. Le Compteur "Pilule" : Un badge discret en forme de pilule, adjacent au titre, affiche le nombre de cartes (ex: "12"). Ce badge est codé par couleur selon l'étape (Bleu pour Nouveaux, Orange pour Négociation, Vert pour Closing), créant un repère visuel rapide.
3. Le Total Financier (L'élément "Sexy") : C'est l'ajout majeur. Sous le titre, une métrique plus petite mais distincte affiche la somme de tous les montants des deals présents dans cette colonne (ex: "2.4M€ Potentiels").
? Impact Psychologique : Cela transforme la colonne d'une "Liste de Tâches" en un "Seau de Revenus". L'agent ne déplace pas une tâche ; il déplace de la valeur financière vers la colonne de clôture.
5.2. Profondeur et Séparation
Pour renforcer l'effet de superposition :
? Le Rail (Background) : La zone derrière les cartes n'est pas blanche. Elle est d'un gris très léger (#F5F5F7 en mode clair).
? Ombres Portées : Les cartes projettent une ombre douce (box-shadow: 0 4px 12px rgba(0,0,0,0.08)), les détachant du fond.
? Séparation de l'En-tête : Une bordure de 1px en bas de l'en-tête assure la démarcation, mais c'est le flou qui effectue le travail cognitif de dire à l'utilisateur "Le contenu passe derrière ceci".7
5.3. Narration Spatiale au Défilement (Scroll Storytelling)
Une micro-interaction avancée consiste à compacter l'en-tête lors du défilement.
? Concept : Lorsque l'utilisateur fait défiler une longue liste, l'en-tête se réduit en hauteur. Le "Total Financier" s'estompe ou se réduit, et le "Nom de l'Étape" diminue en taille (scale down), maximisant l'espace écran pour les cartes. C'est un motif standard des systèmes d'exploitation mobiles appliqué ici au SaaS de bureau pour une fluidité accrue.7
6. Typographie et Micro-Typographie : L'Excellence du Détail
Pour atteindre l'esthétique "Premium" demandée, le choix et le traitement de la typographie sont aussi importants que les visuels eux-mêmes. Le texte est l'interface.
6.1. Le Choix de la Fonte : Inter Display
La famille de polices Inter est devenue le standard de facto pour les interfaces modernes. Cependant, pour 2026, nous recommandons l'utilisation spécifique de Inter Display pour les grands titres et les chiffres clés. Cette variante possède des espacements plus serrés et des formes plus expressives qui fonctionnent mieux à grande taille, apportant ce caractère "éditorial" souvent absent des CRM classiques.21 Pour le corps de texte et les petits labels (11px-13px), la version Inter standard reste préférable pour sa lisibilité (x-height élevée).
6.2. Chiffres Tabulaires pour la Finance
L'erreur la plus commune dans les designs de CRM est l'utilisation de chiffres proportionnels (où le "1" est plus étroit que le "8"). Dans un contexte financier :
? La Règle : Tous les montants, scores et dates doivent impérativement utiliser font-feature-settings: "tnum" on, "cv05" on.
? L'Effet : Les chiffres s'alignent verticalement comme dans un tableau Excel, même au sein des cartes Bento. Cela communique instantanément une impression de rigueur et de précision professionnelle. L'œil peut comparer les montants ("120k" vs "450k") beaucoup plus rapidement si les positions des milliers sont alignées.
7. Guide d'Implémentation Technique : Le Contournement du "Backend Figé"
Puisque nous ne pouvons pas toucher à l'API, toutes les transformations doivent se produire dans la couche Client (React/CSS). Voici la stratégie d'ingénierie visuelle.
7.1. Ingestion et Transformation des Données (Le Pattern Décorateur)
Le composant React de la carte (PipelineCard) doit agir comme un décorateur intelligent.
1. Réception des Props : Le composant reçoit les données brutes (Nom, Date, Score, etc.).
2. Couche de Calcul (Memoized) :
? Traitement Date : Calcul de const daysDiff = today - props.date. Cela pilote la classe CSS de l'arrière-plan.
? Traitement Score : Mappage de props.score vers les variables CSS --ring-color et --ring-dashoffset.
? Traitement Devise : Formatage de props.amount en format court (450k€) pour l'affichage carte, et format long (450 000,00 €) pour les infobulles (tooltips).
3. Rendu Visuel : Ces valeurs dérivées sont passées aux styled-components (ou classes Tailwind) pour générer l'interface.
7.2. Système de Couleurs et Mode Sombre
L'esthétique "Apple/Linear" repose sur une palette de gris sophistiquée, et non sur du noir pur.
? Canevas (Background App) : #F7F8FA (Gris Froid) - Jamais blanc pur.
? Surface Carte : #FFFFFF (Blanc Pur).
? Texte Primaire : #1A1D21 (Charbon Profond).
? Texte Secondaire : #6F7681 (Gris Moyen Froid).
? Texte Tertiaire (Labels) : #9CA3AF.
Mode Sombre Premium : Les agents immobiliers travaillent souvent tard. Le mode sombre est une exigence d'expérience utilisateur.
? Stratégie : Ne pas simplement inverser les couleurs.
? Surface Sombre : #141517 (Riche, presque noir, teinté de bleu nuit).
? Carte Sombre : #1F2125 (Légèrement plus clair).
? Lueurs : Les anneaux de solvabilité doivent "émettre" de la lumière. Utilisez filter: drop-shadow(...) sur le SVG pour simuler l'incandescence sur le fond sombre, créant un effet de tableau de bord de voiture de luxe.
7.3. Performance et Fluidité
L'utilisation intensive de backdrop-filter: blur() est coûteuse en ressources GPU.
? Optimisation : Appliquer le flou lourd uniquement sur l'En-tête Sticky et les modales superposées. Pour les fonds de cartes individuels, utiliser des couleurs opaques ou semi-opaques simples pour garantir un défilement à 60fps, même sur les ordinateurs portables moins puissants des agents en déplacement.
8. Conclusion
L'état de l'art 2026 pour le Pipeline de Clerivo ne réside pas dans l'ajout de fonctionnalités, mais dans l'augmentation de la densité d'information utile tout en réduisant la charge cognitive. En passant du "Texte" aux "Signaux Visuels" (Anneau de Solvabilité), en adoptant la structure de grille "Bento", et en exploitant la physique du "Liquid Glass", Clerivo peut atteindre l'esthétique "Apple-like" premium demandée, purement par une refonte frontend. Le résultat est un CRM qui ne ressemble plus à une base de données, mais à un instrument de haute précision pour la conversion des ventes.
Sources des citations
1. How we redesigned the Linear UI (part ?) - Linear, consulté le février 8, 2026, https://linear.app/now/how-we-redesigned-the-linear-ui
2. UX UI Design Trend for 2026 - Medium, consulté le février 8, 2026, https://medium.com/@digitalaspira/ux-ui-design-trend-for-2026-99d874b2abe2
3. Blog | 10 UI/UX Trends That Will Shape 2026 - Orizon Design, consulté le février 8, 2026, https://www.orizon.co/blog/10-ui-ux-trends-that-will-shape-2026
4. Bento Grid Design: How to Create Modern Modular Layouts in 2026 - Landdding, consulté le février 8, 2026, https://landdding.com/blog/blog-bento-grid-design-guide
5. 15 Important UI UX Design Trends of 2026 - Tenet, consulté le février 8, 2026, https://www.wearetenet.com/blog/ui-ux-design-trends
6. Bento UI: Design Examples, Trend Explanation, and Creative Tips - DepositPhotos Blog, consulté le février 8, 2026, https://blog.depositphotos.com/bento-ui.html
7. The top web design trends of 2026 | Haddington & Haddington, consulté le février 8, 2026, https://www.haddingtoncreative.com/post/the-top-web-design-trends-of-2026
8. Flat, brutalist, glassy: Do UX design trends even matter ..., consulté le février 8, 2026, https://blog.logrocket.com/ux-design/flat-brutalist-glassy-do-ux-design-trends-even-matter/
9. UX/UI Case Study: Real Estate CRM Dashboard Design | by Arman Hossain Somoy, consulté le février 8, 2026, https://armansomoy.medium.com/ux-ui-case-study-real-real-estate-crm-18ea8cd1cfe1
10. 10 Best Fonts for UI Design 2026 - Complete Typography Guide, consulté le février 8, 2026, https://www.designmonks.co/blog/best-fonts-for-ui-design
11. Clear and Simple Dashboard Design Ideas | Medium, consulté le février 8, 2026, https://medium.com/@theymakedesign/dashboard-design-ideas-clear-simple-vol-256-b346bd9cb7b2
12. 2024 | Credit Card Management App - UI/UX Design Challenge project - Uxcel, consulté le février 8, 2026, https://app.uxcel.com/showcase/credit-card-management-app-uiux-design-challenge-371
13. credit score ui design - Dribbble, consulté le février 8, 2026, https://dribbble.com/search/credit-score-ui-design
14. B2B SaaS UX Design in 2026: Challenges & Patterns, consulté le février 8, 2026, https://www.onething.design/post/b2b-saas-ux-design
15. Credit Pros SaaS Dashboard & UI UX Design - Rondesignlab, consulté le février 8, 2026, https://rondesignlab.com/cases/credit-pros-saas-dashboard-ui-ux-design
16. robsalasco/awesome-stars: A curated list of my GitHub stars!, consulté le février 8, 2026, https://github.com/robsalasco/awesome-stars
17. The Ultimate Guide to Building a Status Page in 2026 (+Templates) - UptimeRobot, consulté le février 8, 2026, https://uptimerobot.com/knowledge-hub/monitoring/building-a-status-page-ultimate-guide/
18. Status indicators - Carbon Design System, consulté le février 8, 2026, https://carbondesignsystem.com/patterns/status-indicator-pattern/
19. What is a Kanban Board and How to Use One | Miro, consulté le février 8, 2026, https://miro.com/kanban/what-is-a-kanban-board/
20. Blazor Kanban Header Template | Custom Headers | Syncfusion, consulté le février 8, 2026, https://blazor.syncfusion.com/demos/kanban/header-template/
21. 15 Designer-Approved Picks: Fonts That Define Typography Trends 2026 - Medium, consulté le février 8, 2026, https://medium.com/@sellsuiteshop/15-designer-approved-picks-fonts-that-define-typography-trends-2026-583e6ef8ab49
