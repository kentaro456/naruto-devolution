# Roster Validation Checklist

Objectif: valider la v1 jouable du projet en testant le roster prioritaire sur le moteur `legacy gameplay + Pixi render`.

Regle de validation:
- un perso est `VALIDE` seulement si gameplay + visuel + FX + audio + absence de crash sont corrects
- tout warning asset Pixi repete, taille incoherente, projectile faux, anim cassée ou erreur console bloque la validation

Environnement de test recommande:
- mode `VS CPU`
- arene simple puis arene chargee en background image
- un test au minimum contre un perso melee et un perso a projectile
- console ouverte

## Statuts
- `[ ]` Non teste
- `[-]` En cours / partiellement bon
- `[x]` Valide

## Tronc commun a tester pour chaque perso

### Boot / selection
- [ ] le portrait et la miniature s'affichent correctement dans la selection
- [ ] l'entree en combat ne provoque ni freeze anormal ni erreur console
- [ ] la taille du perso en combat est coherente
- [ ] l'ombre au sol, l'ancrage au sol et la lecture du sprite sont corrects

### Mouvement / defense
- [ ] marche avant / arriere
- [ ] saut
- [ ] accroupi
- [ ] dash
- [ ] garde
- [ ] reaction au hit
- [ ] reaction au block
- [ ] KO / chute / round end

### Attaques / routes
- [ ] `S` attaque rapide
- [ ] `D` attaque puissante
- [ ] `E` technique / projectile / route associee
- [ ] `G` eveil / transformation si applicable
- [ ] `R` teleport si applicable
- [ ] `1`
- [ ] `2`
- [ ] `3`
- [ ] `4`
- [ ] les enchainements changent bien selon le mapping du perso

### Visuel / Pixi
- [ ] les etats `IDLE`, `WALK`, `JUMP`, `BLOCK`, `HIT`, `SPECIAL` sont lisibles
- [ ] les impacts sont visibles
- [ ] les auras / smears / afterimages sont coherents
- [ ] le projectile a le bon visuel
- [ ] l'overlay special du perso n'est pas double en canvas et en Pixi
- [ ] aucun fallback visuellement casse n'apparait

### Console / stabilite
- [ ] pas de crash runtime
- [ ] pas de `TypeError`
- [ ] pas de spam Pixi asset/cache
- [ ] pas de projectile ou FX utilisant les mauvais assets d'un autre perso

## Roster prioritaire

### Naruto (`naruto`)
Statut: `[-]`

Audit actuel:
- projectile par defaut bien route sur `kunai`
- assets principaux de portrait / select confirms presents
- point de risque restant: validation transformation Kyuubi et lisibilite des speciaux en combat reel

Points specifiques:
- [ ] Rasengan / special principal lisible
- [ ] transformation Kyuubi fonctionne
- [ ] effets d'impact offensifs corrects
- [ ] routes `1-4` ne lancent pas un etat incoherent

### Sasuke (`sasuke`)
Statut: `[-]`

Audit actuel:
- projectile par defaut bien route sur `shuriken`
- asset principal confirme present
- point de risque restant: validation `CS2`, routes Chidori et lecture des speciaux en combat reel

Points specifiques:
- [ ] Chidori / Raikiri-like route visuelle correcte
- [ ] transformation `CS2` fonctionne
- [ ] aura / special bleu cohérent
- [ ] dash / afterimage lisibles

### Kakashi (`kakashi`)
Statut: `[-]`

Audit actuel:
- override de taille present dans le renderer
- projectile de base `kunai` et `hiraishin_kunai` asset present
- theming Pixi bleu deja branche pour les speciaux
- point de risque restant: teleport / Raikiri a valider en combat reel

Points specifiques:
- [ ] Raikiri part avec la bonne anim
- [ ] teleport / dash special lisible
- [ ] taille correcte
- [ ] special names / FX bleus corrects

### Lee (`lee`)
Statut: `[-]`

Audit actuel:
- asset principal confirme present
- pipeline de rendu/timing deja repasse plusieurs fois
- point de risque restant: mappings lourds, lecture des frames et risques de warnings cache en combat reel

Points specifiques:
- [ ] tailles / proportions correctes
- [ ] combos rapides lisibles
- [ ] special type Gate Opening ne casse pas les anims
- [ ] aucun warning frame manquante ne spamme la console

### Itachi (`itachi`)
Statut: `[-]`

Audit actuel:
- override de taille present dans le renderer
- projectile de base bien route sur `shuriken`
- theming Pixi rouge deja branche pour les speciaux
- point de risque restant: validation teleport / genjutsu / Mangekyo en combat reel

Points specifiques:
- [ ] speciaux Sharingan / Mangekyo lisibles
- [ ] teinte rouge et FX genjutsu corrects
- [ ] teleport / apparitions ne glitchent pas
- [ ] taille correcte

### Madara (`madara`)
Statut: `[-]`

Audit actuel:
- override de taille present dans le renderer
- asset miniature / stance confirme present
- point de risque restant: calibration visuelle finale en combat reel

Points specifiques:
- [ ] taille correcte en combat
- [ ] pas minuscule, pas gigantesque
- [ ] speciaux lisibles avec aura adaptee
- [ ] enchainements lourds gardent une bonne lecture visuelle

### Gaara (`gaara`)
Statut: `[-]`

Audit actuel:
- override de taille present dans le renderer
- projectile sable route sur `sandburial`
- point de risque restant: lecture visuelle sable + taille finale en combat reel

Points specifiques:
- [ ] taille correcte
- [ ] projectile / sable utilise les bons visuels
- [ ] overlays sable lisibles
- [ ] zone control ne casse pas la lecture du perso

### Gaara Grand Alt (`gaara_grand_alt`)
Statut: `[-]`

Audit actuel:
- override de taille dedie present dans le renderer
- thumbnail et source confirms presents
- point de risque restant: dernier tuning de taille en combat reel

Points specifiques:
- [ ] taille correcte
- [ ] ne reste pas trop petit
- [ ] cadrage / ancrage au sol corrects
- [ ] pas de disproportion entre idle et special

### Minato (`minato`)
Statut: `[-]`

Audit actuel:
- override de taille present dans le renderer
- projectile de base `kunai` bien route
- theming Pixi jaune deja branche pour teleport / special
- point de risque restant: validation Flying Thunder God / teleportation en combat reel

Points specifiques:
- [ ] teleportation lisible
- [ ] FX jaunes coherents
- [ ] combos rapides ne sautent pas d'etat
- [ ] taille correcte

### Kisame (`kisame`)
Statut: `[-]`

Audit actuel:
- projectile `water_shark` route bien sur des assets Kisame
- les frames `kisame__kis_goshokuzame*` existent
- point de risque restant: echelle / offset / fluidite visuelle du projectile en combat reel

Points specifiques:
- [ ] projectile requin utilise les bons assets
- [ ] n'envoie plus Naruto
- [ ] taille correcte
- [ ] effets aqua corrects

### Deidara (`deidara`)
Statut: `[-]`

Audit actuel:
- projectile `CLAY_BIRD` route sur les frames `projectile__c1..c6`
- les assets critiques existent
- point de risque restant: rotation / trail / lisibilite en combat reel

Points specifiques:
- [ ] projectile `CLAY_BIRD` utilise le bon visuel
- [ ] n'envoie plus un sprite du perso lui-meme
- [ ] rotation / trail coherents
- [ ] FX explosions lisibles

### Kimimaro (`kimimaro`)
Statut: `[-]`

Audit actuel:
- le contrat `emitSound()` existe maintenant dans `Fighter`
- le crash connu sur special a ete corrige structurellement
- point de risque restant: verifier l'ensemble du special et des routes de combo en combat reel

Points specifiques:
- [ ] aucun crash `emitSound`
- [ ] attaques d'os lisibles
- [ ] special Bracken Dance ne casse pas l'etat
- [ ] version alternative NS ne casse pas le pipeline

### Kimimaro NS (`ns_kimimaro`)
Statut: `[-]`

Audit actuel:
- meme contrat `emitSound()` corrige cote base
- thumbnail et source confirms presents
- point de risque restant: verifier les differences de mapping NS en combat reel

Points specifiques:
- [ ] boot correct
- [ ] meme verification de combat que Kimimaro principal
- [ ] pas d'erreur runtime en special
- [ ] tailles / mappings corrects

## Checklist de cloture v1
- [ ] tous les persos du roster prioritaire sont au moins `[-]`
- [ ] tous les persos critiques ci-dessus sont `[x]`
- [ ] plus aucun crash combat dans la console
- [ ] plus aucun projectile critique avec mauvais asset
- [ ] plus aucun perso critique avec mauvaise taille
- [ ] plus aucun special critique illisible
- [ ] build et lancement local stables

## Notes de session
- Madara et Gaara ont deja demande un tuning de taille
- Kisame et Deidara ont deja eu des regressions de projectile
- Kimimaro / `ns_kimimaro` ont deja revele un contrat legacy incomplet
- Lee a deja revele des problemes de frames / mapping / cache
