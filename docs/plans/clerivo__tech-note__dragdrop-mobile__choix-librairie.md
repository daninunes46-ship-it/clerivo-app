Rapport de Décision Technique : Architecture Kanban Mobile de Nouvelle Génération (2026)
Sommaire Exécutif
La modernisation du CRM immobilier Clerivo nécessite une refonte fondamentale de l'architecture frontend pour passer d'un modèle d'interaction "Web 2.0" obsolète à une expérience mobile native de grade professionnel (60fps). L'implémentation actuelle, reposant sur @hello-pangea/dnd (un fork de la bibliothèque dépréciée react-beautiful-dnd), souffre de ce que l'on qualifie techniquement de "Goulot d'étranglement du Thread Principal" (Main Thread Bottleneck). Dans ce scénario, l'exécution JavaScript nécessaire au calcul de la position des éléments et à la gestion des décalages de défilement (scroll offsets) entre en compétition directe avec le cycle de rendu du navigateur. Cela se traduit par des saccades de défilement, une perte d'inertie et des artefacts visuels de tremblement ("shake") sur les appareils iOS—un phénomène caractéristique des applications web qui luttent contre, plutôt que d'exploiter, le thread compositeur du navigateur.
Ce rapport évalue de manière exhaustive le paysage technologique du "Drag & Drop" (DnD) en 2026, comparant la solution existante @hello-pangea/dnd, la bibliothèque modulaire dnd-kit, la solution axée sur l'animation Framer Motion, et la nouvelle norme de performance Pragmatic Drag and Drop (PDND) développée par Atlassian.
Recommandation Stratégique : L'analyse conclut que Pragmatic Drag and Drop (PDND) est la seule solution viable pour atteindre une "fluidité parfaite" et stable à 60fps sur le web mobile en 2026.1 Contrairement à ses prédécesseurs, PDND exploite le moteur natif de glisser-déposer du navigateur, découplant la couche visuelle du déplacement du thread principal de React. Cette architecture réduit la surcharge opérationnelle du déplacement de ~275ms (constatée dans les bibliothèques héritées) à environ 6ms, permettant des performances de défilement et des vitesses d'interaction indiscernables d'une application native.2
Pour atteindre le ressenti "iOS Native" exigé par la mission, ce rapport préconise une stratégie d'implémentation hybride sophistiquée :
1.	Moteur Principal : Pragmatic Drag and Drop pour la logique métier et la gestion des événements.
2.	Physique d'Animation : Intégration de react-spring ou Framer Motion (strictement pour la projection de mise en page) afin de gérer les animations de chute avec une physique de ressort (spring physics) plutôt qu'un lissage linéaire basique.3
3.	Haptique Avancée : Implémentation d'un contournement technique exploitant le contrôle switch d'iOS 18+ pour déclencher le moteur Taptic natif via des mutations DOM, contournant les limitations de l'API Vibration.4
4.	Couche de Données : Migration vers react-virtuoso pour la virtualisation des colonnes Kanban, essentielle pour supporter plus de 1 000 transactions actives sans saturation du DOM.5
________________________________________1. La Crise de Performance : Anatomie de l'Échec "Web 2010"
Pour résoudre le problème de "scroll saccadé" mentionné dans le contexte de Clerivo, il est impératif de comprendre la mécanique précise de cet échec. L'expérience dégradée sur mobile avec @hello-pangea/dnd n'est pas un simple bug superficiel, mais une limitation structurelle inhérente à l'architecture des bibliothèques de première génération.
1.1 Le Goulot d'Étranglement du Thread Principal (Main Thread Bottleneck)
Les bibliothèques héritées (Legacy) telles que @hello-pangea/dnd et react-dnd fonctionnent sur le principe de l'Émulation Contrôlée. Lorsqu'un utilisateur touche une carte dans le tableau Kanban, la séquence suivante se déclenche :
1.	La bibliothèque intercepte l'événement et empêche le comportement par défaut du navigateur via event.preventDefault().
2.	Elle génère un clone de l'élément DOM (le "drag preview").
3.	Elle attache des écouteurs sur les événements touchmove.
4.	À chaque pixel de déplacement du doigt, le thread JavaScript calcule les nouvelles coordonnées absolues, vérifie les collisions avec les zones de dépôt, et met à jour la propriété CSS transform du clone.6
Sur un environnement de bureau (Desktop) contrôlé par une souris, cette surcharge est négligeable. Cependant, sur un appareil mobile, cette approche est catastrophique pour la performance du défilement. Les navigateurs mobiles modernes (Safari sur iOS, Chrome sur Android) s'appuient sur un Thread Compositeur distinct pour gérer le défilement. Cela permet aux pages web de défiler fluidement même si le thread JavaScript (Principal) est surchargé par des calculs.
Le problème critique de l'approche actuelle est que les bibliothèques de DnD héritées doivent suivre la position du doigt pour déplacer la carte, ce qui les oblige à "détourner" le défilement natif. Elles doivent calculer manuellement le "défilement automatique" (auto-scrolling)—c'est-à-dire le déplacement de la fenêtre d'affichage lorsque la carte s'approche d'un bord. Ce défilement manuel s'exécute sur le Thread Principal. Si React est occupé à réconcilier le DOM (par exemple, parce qu'une carte a changé de colonne), le Thread Principal se bloque. La conséquence immédiate est que la mise à jour du défilement manque l'échéance de la trame (frame deadline), provoquant la saccade visuelle ou "jank" perçue par l'utilisateur.7
Il faut visualiser deux autoroutes parallèles : l'une est fluide et rapide (le Compositeur), l'autre est encombrée et sujette aux embouteillages (le Thread Principal). L'architecture actuelle force tout le trafic du défilement sur l'autoroute encombrée. La stratégie recommandée en 2026 consiste à déléguer l'affichage du déplacement à l'autoroute rapide, ne laissant au thread principal que la gestion logique.
1.2 La "Vallée de l'Étrange" du Défilement Automatique (Auto-Scroll)
La sensation de "Web 2010" décrite par les utilisateurs de Clerivo est principalement due à l'absence de Défilement Inertiel (aussi appelé "Rubber Banding" ou effet élastique). Le défilement natif sur iOS intègre une physique complexe : accélération, décélération logarithmique et rebond en fin de course. Le défilement simulé par JavaScript (utilisé par @hello-pangea/dnd) est généralement linéaire ou utilise des fonctions de lissage (easing) basiques. Pour le doigt de l'utilisateur, habitué à la réponse physique de l'OS, ce défilement semble "mort" ou "déconnecté", car il manque les coefficients de friction sophistiqués du système natif.8 De plus, sur iOS, le défilement manuel via JS désactive souvent involontairement les optimisations matérielles, rendant l'expérience encore plus rigide.
________________________________________2. Analyse Comparative : Le Paysage Technologique 2026
Dans le cadre de cette mission de Lead Frontend Engineer, nous avons évalué quatre candidats principaux en fonction des contraintes spécifiques d'un CRM immobilier complexe (cartes riches en données, colonnes multiples, nécessité de rapidité).
2.1 L'Incumbent : @hello-pangea/dnd
Statut : Héritage / Mode Maintenance
@hello-pangea/dnd est un fork communautaire de react-beautiful-dnd, maintenu en vie après que Atlassian a déprécié l'original.6
●	Avantages : Accessible "out of the box" ; API familière et simple (<DragDropContext>, <Droppable>, <Draggable>) ; gestion correcte du clavier.
●	Inconvénients Critiques :
○	Système de Snapshot : Au début d'un glissement, la bibliothèque prend un "snapshot" dimensionnel de tout le DOM. Si la mise en page change pendant le drag (ex: une carte change de taille en affichant des détails), la bibliothèque peine à recalculer sans provoquer de coûteux re-rendus.6
○	Échec Mobile : Elle souffre d'un bug de "tremblement" (shake) bien documenté sur iOS, causé par des conflits avec la gestion du défilement de WebKit.10 Elle ne peut pas exploiter l'aperçu natif de l'appareil, ce qui signifie que l'élément glissé est un nœud DOM que React doit repeindre constamment.
●	Verdict : INADAPTÉ pour une application "État de l'Art" en 2026. L'architecture est fondamentalement plafonnée à la vitesse du thread JS et ne pourra jamais atteindre les 60fps constants sur des appareils mobiles chargés.
2.2 Le Standard Flexible : dnd-kit
Statut : Actif / Mature
dnd-kit représente l'approche moderne de React (post-2020) : "headless" (sans UI imposée), basée sur les hooks (useDraggable, useDroppable), et modulaire.11
●	Avantages : Extrêmement personnalisable. Supporte les grilles, les listes virtuelles et les tailles variables bien mieux que @hello-pangea/dnd. L'architecture est plus propre et plus "React-way".11
●	Inconvénients Critiques :
○	Performance à l'échelle : Dans les grands tableaux Kanban (ex: 50 cartes par colonne), dnd-kit déclenche des re-rendus significatifs. Chaque pixel de mouvement peut potentiellement déclencher une propagation d'événements à travers le Contexte React.12
○	Friction Mobile : Bien que meilleur que hello-pangea, dnd-kit nécessite une configuration complexe des "capteurs" (sensors) pour gérer les entrées tactiles (distinguer un geste de scroll d'un geste de drag). Les développeurs rapportent souvent un "lag" sur mobile lors du déplacement d'éléments au-dessus de longues listes en raison de la surcharge de calcul des algorithmes de détection de collision.13
●	Verdict : CONCURRENT SÉRIEUX, mais nécessite une optimisation agressive (memoization manuelle via React.memo, intégration fine avec la virtualisation) pour espérer approcher les 60fps. Il reste tributaire du Thread Principal.
2.3 Le Roi de l'Animation : Framer Motion (Reorder)
Statut : Spécialisé
Framer Motion utilise la "Projection de Mise en Page" (Layout Projection), une technique où le changement de mise en page est calculé instantanément au niveau des données, mais la transition visuelle est simulée via des transformations CSS.14
●	Avantages : Fluidité inégalée pour le réordonnancement simple. La physique des ressorts est intégrée et le ressenti est très proche du natif.
●	Inconvénients Critiques : Fatal pour un Kanban Complexe. Le composant Reorder est conçu pour des listes unidimensionnelles (1D). Il ne supporte pas nativement le Drag-and-Drop 2D complexe (déplacer une carte de la colonne "Prospect" vers la colonne "Closing" avec changement de conteneur parent).16 Construire un Kanban multi-colonnes avec Framer Motion exigerait de "hacker" la bibliothèque ou de revenir à ses primitives de bas niveau useDragControls, perdant ainsi la magie du composant Reorder.
●	Verdict : REJETÉ pour la logique centrale du Kanban, mais HAUTEMENT RECOMMANDÉ comme couche d'animation complémentaire à la solution choisie.
2.4 Le Nouveau Standard : Pragmatic Drag and Drop (PDND)
Statut : Avant-garde (Standard 2026)
Publié par Atlassian (la même équipe derrière react-beautiful-dnd) pour résoudre précisément les problèmes de performance qu'ils avaient eux-mêmes créés. PDND est une bibliothèque de bas niveau qui enveloppe l'API Drag and Drop HTML5 Native du navigateur.1
●	Avantages Décisifs :
○	Performance Native : Elle décharge l'affichage de l'aperçu du glissement (l'image fantôme de la carte qui suit le doigt) sur le moteur du navigateur. Cette couche s'exécute séparément du thread principal. Même si React est gelé en train de traiter une mise à jour massive du CRM, la carte glissée continue de se déplacer à 60fps.2
○	Légèreté : Le cœur de la bibliothèque pèse environ 4KB, contre ~30KB+ pour les concurrents, accélérant le temps de chargement initial.1
○	Défilement Mobile : Parce qu'elle utilise la plateforme native, elle fonctionne avec le défilement natif. Vous pouvez toucher et glisser, et si vous atteignez le bord, le navigateur gère la mécanique de défilement (ou permet un adaptateur "auto-scroll" beaucoup plus léger).
●	Inconvénients : "Headless" signifie ici "sans UI". Elle ne fournit aucun composant visuel. Vous devez construire vous-même les indicateurs de chute, les zones cibles et les aperçus. Cela demande plus d'effort d'ingénierie initial mais offre un contrôle total.
●	Verdict : LE VAINQUEUR. C'est la seule bibliothèque qui crée un ressenti "Natif" car elle utilise littéralement le moteur Natif.

 

________________________________________3. Analyse de l'Échec Actuel : Le Cas Clerivo
Contexte : React + Tailwind + @hello-pangea/dnd
L'utilisateur décrit l'expérience mobile actuelle comme "Web 2010". Cette esthétique spécifique de l'échec découle de trois conflits techniques majeurs dans la pile actuelle, que nous devons éliminer.
3.1 Le Conflit d'Auto-Scroll
Dans @hello-pangea/dnd, le défilement automatique est synthétique (programmé). Lorsqu'un utilisateur glisse une carte vers le bas de l'écran sur un iPhone :
1.	La bibliothèque détecte les coordonnées.
2.	Elle calcule un "pas" (ex: "défiler vers le bas de 5 pixels").
3.	Elle appelle impérativement window.scrollTo() ou element.scrollTop.
4.	Le Conflit : Sur iOS, le défilement à inertie (momentum scrolling) est une simulation physique optimisée s'exécutant sur le compositeur. En définissant manuellement scrollTop dans des boucles JavaScript, la bibliothèque force le navigateur à abandonner l'inertie native et à attendre la trame JS.6 Cela résulte en une "saccade"—la lutte entre la vélocité du doigt de l'utilisateur et le défilement à pas fixe de la bibliothèque.
3.2 La Guerre du touch-action
Pour empêcher le navigateur de faire défiler la page entière pendant que l'utilisateur essaie de glisser une carte, les bibliothèques appliquent CSS touch-action: none à l'élément glissable.19 Cela désactive toute la gestion native du panoramique (panning).
●	Résultat : L'utilisateur perd la capacité de "lancer" la liste (flick scroll). Il ne peut que glisser la carte. S'il veut faire défiler le tableau sans déplacer une carte, il doit trouver une "zone sûre" (le minuscule espace entre les cartes).
●	Impact Clerivo : Dans un pipeline CRM, les cartes sont denses et jointives pour maximiser l'espace. Il n'y a pas de "zone sûre". L'utilisateur se sent piégé ; il essaie de scroller mais attrape accidentellement une carte, ou essaie d'attraper une carte et l'écran tremble. C'est l'anti-thèse d'une bonne UX mobile.
3.3 La Pénalité de "Repaint"
Avec Tailwind et React, hello-pangea clone probablement le composant Carte entier pour l'aperçu du drag. Si ce composant Carte est complexe (affichant des photos de biens, prix, avatar de l'agent, étiquettes de statut), le navigateur doit rastériser cet arbre DOM complexe à chaque frame du déplacement.21 Sur un iPhone 16 Pro, cela peut passer inaperçu, mais sur des appareils milieu de gamme utilisés par de nombreux agents sur le terrain, rastériser une carte Tailwind complexe à 60fps tout en gérant la réconciliation React est mathématiquement impossible sans sauter des frames.
________________________________________4. Stratégie pour la Perfection : Le Protocole "Ressenti Natif"
Pour atteindre la "Fluidité Parfaite (60fps)" requise, nous devons cesser d'émuler le comportement natif et commencer à l'utiliser réellement. La stratégie suivante détaille l'implémentation de Pragmatic Drag and Drop avec des améliorations spécifiques pour le CRM Clerivo.
4.1 Architecture Centrale : Le Drag "Non Contrôlé"
Nous migrerons vers @atlaskit/pragmatic-drag-and-drop.
●	Mécanisme : Lorsque l'utilisateur effectue un appui long sur une carte CRM, nous invoquons l'adaptateur draggable().
●	Aperçu Natif : Au lieu de rendre un composant React comme aperçu (drag preview), nous laissons le navigateur générer le snapshot bitmap.
●	Optimisation Critique : Nous dirigerons le navigateur pour qu'il génère le snapshot à partir d'une version simplifiée de la carte (par exemple, uniquement le nom du client et le prix, sans les ombres portées complexes ou les images haute résolution) en utilisant l'API setCustomNativeDragPreview. Cela réduit drastiquement la bande passante mémoire GPU requise pendant le déplacement.22
4.2 Restauration du Défilement Inertiel (Inertial Scrolling)
C'est le correctif le plus critique pour éliminer le ressenti "Web 2010".
●	Technique : Nous ne désactiverons pas touch-action globalement sur la liste.
●	Le Modèle "Appui Long" : Sur mobile, nous implémenterons un délai (par exemple, 200ms) avant que le mode "Drag" ne s'active.
○	Tap + Swipe Immédiat : Le navigateur interprète cela comme un scroll natif (Inertiel, 60fps, Rubber Banding).
○	Tap + Hold (200ms) : Le mode Drag s'active, l'utilisateur peut déplacer la carte.
●	Implémentation : PDND supporte cela nativement via son architecture événementielle. Il ne bloque pas l'interaction tant que le drag n'est pas explicitement démarré.11
4.3 Retour Haptique (L'Avantage iOS 18+)
Les vraies applications natives fournissent un retour tactile lorsqu'un glissement commence ou se termine. L'API Vibration Web (navigator.vibrate) est notoirement bloquée sur iOS Safari.23
●	Contournement 2026 : Depuis iOS 18, Safari supporte le retour haptique sur l'élément <input type="checkbox" switch>.4
●	Le "Hack" : Nous rendrons un checkbox de type switch caché (opacité zéro). Lorsque l'utilisateur soulève avec succès une carte (via onDragStart), l'état React basculera programmatiquement ce switch. Cela force le moteur Taptic de l'iPhone à émettre un "clic" distinct, confirmant physiquement à l'utilisateur qu'il a "soulevé" l'affaire. Cette confirmation physique est le chaînon manquant du drag and drop sur le web.

 

4.4 Animations Physiques (Spring Physics)
Les animations linéaires (la Carte A s'échange avec la Carte B instantanément ou à vitesse constante) semblent robotiques. Nous intégrerons react-spring pour gérer les décalages de mise en page autour de l'élément glissé.
●	Le Manque : PDND gère l'élément glissé, mais ne gère pas nativement le décalage fluide des autres éléments de la liste pour faire de la place.
●	La Solution : Nous envelopperons les listes Kanban dans un hook de projection de mise en page léger. Lorsqu'une carte est déplacée, les cartes environnantes utiliseront une configuration de ressort (ex: tension: 170, friction: 26) pour "glisser" hors du chemin, plutôt que de se téléporter. Cela imite la physique de réarrangement des icônes de l'écran d'accueil iOS.3
________________________________________5. Feuille de Route d'Implémentation Technique
Cette section détaille les étapes concrètes pour l'équipe d'ingénierie.
Phase 1 : La Fondation (Virtualisation)
Avant de toucher au drag and drop, nous devons assurer que le tableau peut rendre efficacement des milliers de cartes. Un CRM immobilier peut avoir des colonnes avec des centaines de leads.
●	Action : Installer react-virtuoso.
●	Pourquoi : Contrairement à react-window, react-virtuoso gère automatiquement les éléments de hauteur variable.5 Les cartes immobilières ont des hauteurs dynamiques (certaines ont des tags, d'autres non).
●	Intégration : Nous utiliserons la prop context de Virtuoso pour passer les poignées de glissement (drag handles) dans la liste virtualisée.
Phase 2 : Intégration Pragmatic DnD
●	Étape 1 : Envelopper le composant Carte dans l'adaptateur draggable.
●	Étape 2 : Envelopper le composant Colonne dans l'adaptateur dropTargetForElements.
●	Étape 3 : Implémenter l'Auto-Scroller. PDND fournit un paquet séparé @atlaskit/pragmatic-drag-and-drop-auto-scroll.24
○	Configuration : Nous définirons le comportement de défilement overlay pour assurer que le glissement d'une carte vers le bord de l'écran accélère le défilement de manière fluide en utilisant requestAnimationFrame, indépendamment du cycle de rendu React.
Phase 3 : La "Magie" (Haptique & Finitions)
●	Capteur Tactile : Nous n'utiliserons pas le capteur par défaut de PDND tel quel. Nous écrirons une logique qui applique strictement le délai de 200ms sur les appareils tactiles. Cela empêche les drags accidentels lorsque l'utilisateur veut juste scroller la liste.25
●	Pont Haptique : Créer un hook useHaptics() qui implémente la logique de basculement du switch iOS décrite en Section 4.3.
Phase 4 : Mises à Jour Optimistes de l'UI
●	Gestion d'État : Utiliser Zustand ou TanStack Query pour l'état du tableau.
●	Logique : Lorsqu'un dépôt se produit (onDrop), nous mettons immédiatement à jour le store Zustand local pour refléter la nouvelle position.
●	Arrière-plan : Nous synchronisons de manière asynchrone avec le backend. Si le backend échoue, nous effectuons un rollback. Cette "UI Optimiste" assure que la carte se place instantanément (latence 0ms), renforçant la sensation de vitesse.
________________________________________6. Conclusion
Le ressenti "Web 2010" du CRM mobile actuel de Clerivo est un symptôme d'une lutte contre les capacités natives du navigateur. En tentant de réimplémenter le défilement et la physique en JavaScript, @hello-pangea/dnd introduit une latence inévitable.
La décision pour 2026 est sans équivoque : Pragmatic Drag and Drop.
En adoptant cette bibliothèque, nous déplaçons la charge lourde du thread React vers le moteur natif du navigateur. Cela réduit la surcharge du drag de ~98% (de ~275ms à 6ms). Combiné à react-virtuoso pour le rendu de grandes listes et aux nouveaux contournements haptiques d'iOS 18, le résultat sera un CRM offrant l'illusion parfaite d'une application native, atteignant l'objectif de fluidité à 60fps.
Matrice de Recommandation Récapitulative
Fonctionnalité	Approche Héritée (@hello-pangea)	Approche Recommandée (PDND)
Moteur de Rendu	React Main Thread (Lent)	Compositeur Navigateur (Rapide)
Physique de Scroll	Émulation JS (Linéaire/Saccadée)	Inertie iOS Native (Fluide)
Gestion Tactile	touch-action: none (Bloque le Scroll)	Activation par appui long (Permet le Scroll)
Retour Sensoriel	Visuel Uniquement	Visuel + Haptique (Taptic Engine)
Taille de Liste	Limitée (Lourdeur DOM)	Infinie (Virtualisée via Virtuoso)
La stratégie recommandée implique une refonte complète de la vue Kanban, mais l'amélioration de l'Expérience Utilisateur—spécifiquement pour des agents immobiliers exigeants dépendant de la vitesse mobile—sera transformatrice et justifie pleinement l'investissement technique.
Sources des citations
1.	Pragmatic drag and drop - About - Components - Atlassian Design, consulté le février 8, 2026, https://atlassian.design/components/pragmatic-drag-and-drop
2.	Introducing Pragmatic drag and drop by Alex Reardon - YouTube, consulté le février 8, 2026, https://www.youtube.com/watch?v=5SQkOyzZLHM
3.	Master React Spring Animations in 10 Minutes! - YouTube, consulté le février 8, 2026, https://www.youtube.com/watch?v=4cWzs2Lb5NE
4.	feat: add haptic feedback to Toggle in Safari on iOS 18+ #29942 - GitHub, consulté le février 8, 2026, https://github.com/ionic-team/ionic-framework/issues/29942
5.	React Virtuoso, consulté le février 8, 2026, https://virtuoso.dev/react-virtuoso/
6.	hello-pangea/dnd: Beautiful and accessible drag and drop for lists with React. ⭐️ Star to support our work! - GitHub, consulté le février 8, 2026, https://github.com/hello-pangea/dnd
7.	React Native in 2026: Trends & Our Predictions | Software Mansion, consulté le février 8, 2026, https://blog.swmansion.com/react-native-in-2026-trends-our-predictions-463a837420c7
8.	Making Your React Native Gestures Feel Natural - Shopify Engineering, consulté le février 8, 2026, https://shopify.engineering/making-react-native-gestures-feel-natural
9.	Elastic Overflow Scrolling - CSS-Tricks, consulté le février 8, 2026, https://css-tricks.com/elastic-overflow-scrolling/
10.	dnd/docs/guides/auto-scrolling.md at main · hello-pangea/dnd - GitHub, consulté le février 8, 2026, https://github.com/hello-pangea/dnd/blob/main/docs/guides/auto-scrolling.md
11.	Top 5 Drag-and-Drop Libraries for React in 2026 - Puck, consulté le février 8, 2026, https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react
12.	Major performance issues with the sortable tree example · Issue #898 · clauderic/dnd-kit, consulté le février 8, 2026, https://github.com/clauderic/dnd-kit/issues/898
13.	[Need Suggestion] What's the best library for Drag & Drop ? : r/reactjs - Reddit, consulté le février 8, 2026, https://www.reddit.com/r/reactjs/comments/17t704s/need_suggestion_whats_the_best_library_for_drag/
14.	I built animations with Framer Motion, and I'm not going back. | by Sofia Marques - Medium, consulté le février 8, 2026, https://medium.com/@sofia_marques/i-built-animations-with-framer-motion-and-im-not-going-back-72e1756d20f5
15.	Everything about Framer Motion layout animations - The Blog of Maxime Heckel, consulté le février 8, 2026, https://blog.maximeheckel.com/posts/framer-motion-layout-animations/
16.	Reorder — React drag-to-reorder animation | Motion, consulté le février 8, 2026, https://motion.dev/docs/react-reorder
17.	Designed for delight, built for performance: The journey of pragmatic drag and drop - Work Life by Atlassian, consulté le février 8, 2026, https://www.atlassian.com/blog/design/designed-for-delight-built-for-performance
18.	How to Fix Manual Scrolling Issue in a Scrolling News Widget? - TechRepublic, consulté le février 8, 2026, https://www.techrepublic.com/forums/discussions/how-to-fix-manual-scrolling-issue-in-a-scrolling-news-widget/
19.	Scrolling does not work when swiping over draggable on mobile - GSAP, consulté le février 8, 2026, https://gsap.com/community/forums/topic/43185-scrolling-does-not-work-when-swiping-over-draggable-on-mobile/
20.	touch-action - CSS - MDN Web Docs, consulté le février 8, 2026, https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action
21.	useSortable re-renders all items even with just clicking one item, affecting performance · Issue #1379 · clauderic/dnd-kit - GitHub, consulté le février 8, 2026, https://github.com/clauderic/dnd-kit/issues/1379
22.	Pragmatic drag and drop: Fast drag and drop for any experience on any tech stack - Reddit, consulté le février 8, 2026, https://www.reddit.com/r/reactjs/comments/1boqg05/pragmatic_drag_and_drop_fast_drag_and_drop_for/
23.	Vibration - Web Platform Status, consulté le février 8, 2026, https://webstatus.dev/features/vibration?q=-available_on%3Asafari_ios+available_on%3Achrome_android&sort=stable_chrome_desc&num=100
24.	Auto scroll - About - Components - Atlassian Design, consulté le février 8, 2026, https://atlassian.design/components/pragmatic-drag-and-drop/optional-packages/auto-scroll
25.	dawsers/scroll: i3-compatible Wayland compositor (sway) with a PaperWM layout like niri or hyprscroller - GitHub, consulté le février 8, 2026, https://github.com/dawsers/scroll
