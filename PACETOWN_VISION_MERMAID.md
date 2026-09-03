# PaceTown Vision — Mermaid Diagram Suite

This diagram suite visualizes the complete vision defined in `PACETOWN_PROJECT_VISION.md` and the implementation behavior specified in `PaceTown_Hackathon_Implementation_Plan.md`.

The vision is split into focused diagrams so each flow remains readable and renderable. Together, they describe the track alignment, player experience, workload logic, guided work, recovery system, IRL quests, photo-derived Keepsakes, town mechanics, progression, safeguards, and technical architecture.

## 1. Track problem to PaceTown outcome

```mermaid
flowchart LR
    track([Stress and Workload Manager])

    subgraph needs ["Track needs"]
        direction TB
        seeLoad["See total load"]
        coverAreas["Cover five demand areas"]
        takeAction["Act before overload grows"]
        rebalanceNeed["Rebalance commitments"]
        recoverNeed["Move toward recovery"]
        mobileNeed["Remain useful on mobile"]
    end

    subgraph response ["PaceTown response"]
        direction TB
        dailyLoad["Explainable Daily Load"]
        loadWeather["Load Weather"]
        backpack["Backpack"]
        workshop["Rebalance Workshop"]
        paceSession["Guided Pace Session"]
        recoveryChoice["Digital or IRL recovery"]
        townList["Accessible Town List"]
        pwa["Local-first PWA"]
    end

    subgraph outcomes ["Student outcomes"]
        direction TB
        understand["Understand pressure"]
        makeSpace["Reduce avoidable load"]
        makeProgress["Progress on real work"]
        regulate["Recover intentionally"]
        returnReady["Return with context"]
        stayEngaged["Keep a comforting tool"]
    end

    track --> seeLoad & coverAreas & takeAction & rebalanceNeed & recoverNeed & mobileNeed
    seeLoad --> dailyLoad
    coverAreas --> loadWeather & backpack
    takeAction --> paceSession
    rebalanceNeed --> workshop
    recoverNeed --> recoveryChoice
    mobileNeed --> townList & pwa

    dailyLoad --> understand
    loadWeather --> understand
    backpack --> understand
    workshop --> makeSpace
    paceSession --> makeProgress
    recoveryChoice --> regulate
    townList --> returnReady
    pwa --> stayEngaged
    makeSpace --> returnReady
    makeProgress --> returnReady
    regulate --> returnReady
    returnReady --> stayEngaged

    style needs fill:#FFECBD,stroke:#FFC943
    style response fill:#C2E5FF,stroke:#3DADFF
    style outcomes fill:#CDF4D3,stroke:#66D575
    style track fill:#DCCCFF,stroke:#874FFF
```

## 2. Complete player experience loop

```mermaid
flowchart TD
    arrive([Open PaceTown])
    demoOrAccount{Entry mode?}
    demoTown["Explore Demo Town"]
    localAccount["Local account"]
    onboarding["Capacity onboarding"]
    commitments[/"Tasks and commitments"/]
    checkIn[/"Optional daily check-in"/]
    calculate["Calculate Daily Load"]
    explain["Explain contributors"]
    townSignal["Show town pressure signals"]
    recommend{Primary response?}
    makeSpace["Make space"]
    handleWork["Handle what remains"]
    recoverFirst["Recover first"]
    rebalance["Review rebalance proposal"]
    session["Run Pace Session"]
    activity["Choose digital or IRL activity"]
    outcome{Student choice?}
    continueWork["Continue"]
    scheduleNext["Schedule next action"]
    recoverMore["Recover longer"]
    stopIntentional["Stop intentionally"]
    save["Save progress and next action"]
    reward["Grant sustainable rewards"]
    worldChange["Grow and calm the town"]
    journal["Record private history"]
    returnLater([Return later])

    arrive --> demoOrAccount
    demoOrAccount -->|"Demo"| demoTown
    demoOrAccount -->|"Account"| localAccount
    localAccount --> onboarding
    demoTown --> commitments
    onboarding --> commitments
    commitments --> checkIn
    checkIn --> calculate
    calculate --> explain
    explain --> townSignal
    townSignal --> recommend
    recommend -->|"Reduce"| makeSpace
    recommend -->|"Work"| handleWork
    recommend -->|"Recover"| recoverFirst
    makeSpace --> rebalance
    handleWork --> session
    recoverFirst --> activity
    rebalance --> outcome
    session --> outcome
    activity --> outcome
    outcome -->|"Continue"| continueWork
    outcome -->|"Later"| scheduleNext
    outcome -->|"Recover"| recoverMore
    outcome -->|"Stop"| stopIntentional
    continueWork --> session
    recoverMore --> activity
    scheduleNext --> save
    stopIntentional --> save
    session --> save
    activity --> save
    save --> reward
    reward --> worldChange
    worldChange --> journal
    journal --> returnLater
    returnLater -.-> arrive

    style recommend fill:#FFECBD,stroke:#FFC943
    style outcome fill:#FFECBD,stroke:#FFC943
    style makeSpace fill:#C2E5FF,stroke:#3DADFF
    style handleWork fill:#C2E5FF,stroke:#3DADFF
    style recoverFirst fill:#C6FAF6,stroke:#5AD8CC
    style worldChange fill:#CDF4D3,stroke:#66D575
```

## 3. Workload understanding and primary-response selection

```mermaid
flowchart LR
    subgraph inputs ["Student context"]
        direction TB
        tasks[/"Tasks"/]
        fixed[/"Fixed commitments"/]
        availability[/"Available minutes"/]
        energy[/"Optional energy"/]
        stress[/"Optional stress"/]
        sleep[/"Optional sleep"/]
    end

    subgraph demands ["Demand model"]
        direction TB
        timeDemand["Time"]
        mentalDemand["Mental"]
        physicalDemand["Physical"]
        socialDemand["Social"]
        errandDemand["Errands"]
    end

    weighting["Weight priority, effort, urgency"]
    capacity["Reduce capacity by fixed time"]
    rawLoad["Compute raw Daily Load"]
    explainLoad["Rank contributors"]
    showLoad["Render planner and Load Weather"]

    canReduce{Can load be reduced?}
    workFits{Does one checkpoint fit?}
    recoveryFirst{Is recovery the best immediate option?}

    makeSpace["Foreground Make space"]
    handleRemain["Foreground Handle what remains"]
    recoverNow["Foreground Recover first"]
    chooseSelf["Choose another response"]

    tasks --> timeDemand & mentalDemand & physicalDemand & socialDemand & errandDemand
    fixed --> timeDemand
    timeDemand & mentalDemand & physicalDemand & socialDemand & errandDemand --> weighting
    availability --> capacity
    fixed --> capacity
    weighting --> rawLoad
    capacity --> rawLoad
    energy --> rawLoad
    stress --> explainLoad
    sleep --> explainLoad
    rawLoad --> explainLoad
    explainLoad --> showLoad
    showLoad --> canReduce
    canReduce -->|"Yes"| makeSpace
    canReduce -->|"No"| workFits
    workFits -->|"Yes"| handleRemain
    workFits -->|"No"| recoveryFirst
    recoveryFirst -->|"Yes"| recoverNow
    recoveryFirst -->|"No"| chooseSelf
    makeSpace --> chooseSelf
    handleRemain --> chooseSelf
    recoverNow --> chooseSelf

    style inputs fill:#D9D9D9,stroke:#B3B3B3
    style demands fill:#FFE0C2,stroke:#FF9E42
    style canReduce fill:#FFECBD,stroke:#FFC943
    style workFits fill:#FFECBD,stroke:#FFC943
    style recoveryFirst fill:#FFECBD,stroke:#FFC943
    style makeSpace fill:#C2E5FF,stroke:#3DADFF
    style handleRemain fill:#DCCCFF,stroke:#874FFF
    style recoverNow fill:#C6FAF6,stroke:#5AD8CC
```

## 4. Consent-based rebalancing

```mermaid
flowchart LR
    overloaded([Overloaded day])
    findMovable["Find flexible work"]
    protectFixed["Lock fixed commitments"]
    checkDeadline{Before deadline?}
    checkSpace{Valid time block?}
    checkMinimum{Useful session length?}
    testMove["Test alternative slot"]
    compare["Compare peak load"]
    better{Improves balance?}
    proposal["Build editable proposal"]
    preview["Show before and after"]
    studentChoice{Student decision?}
    acceptAll["Accept all"]
    acceptSome["Accept selected"]
    editMove["Edit proposal"]
    rejectMove["Reject proposal"]
    applyMove["Apply approved changes"]
    updatePlanner["Update planner"]
    updateSession["Update Pace Session suggestion"]
    updateTown["Lighten Backpack and weather"]
    unchanged["Keep current schedule"]

    overloaded --> findMovable
    overloaded --> protectFixed
    findMovable --> checkDeadline
    protectFixed --> proposal
    checkDeadline -->|"Yes"| checkSpace
    checkDeadline -->|"No"| findMovable
    checkSpace -->|"Yes"| checkMinimum
    checkSpace -->|"No"| findMovable
    checkMinimum -->|"Yes"| testMove
    checkMinimum -->|"No"| findMovable
    testMove --> compare
    compare --> better
    better -->|"Yes"| proposal
    better -->|"No"| findMovable
    proposal --> preview
    preview --> studentChoice
    studentChoice -->|"All"| acceptAll
    studentChoice -->|"Some"| acceptSome
    studentChoice -->|"Edit"| editMove
    studentChoice -->|"Reject"| rejectMove
    editMove --> proposal
    acceptAll --> applyMove
    acceptSome --> applyMove
    applyMove --> updatePlanner
    updatePlanner --> updateSession
    updateSession --> updateTown
    rejectMove --> unchanged

    style protectFixed fill:#D9D9D9,stroke:#B3B3B3
    style studentChoice fill:#FFECBD,stroke:#FFC943
    style applyMove fill:#CDF4D3,stroke:#66D575
    style rejectMove fill:#FFCDC2,stroke:#FF7556
```

## 5. Guided Pace Session lifecycle

```mermaid
flowchart TD
    selectTask([Choose one real task])
    blocker{Identify blocker?}
    unclear["Unclear start"]
    tooLarge["Task too large"]
    missingKnowledge["Missing knowledge"]
    missingMaterials["Missing materials"]
    lowCapacity["Low capacity"]
    perfection["Perfection pressure"]
    manualPath["Skip or describe manually"]
    buildPlan["Build editable work plan"]
    chooseCheckpoint["Choose one checkpoint"]
    defineDone["Confirm definition of done"]
    chooseGuardian["Choose guardian"]
    preChoice{Start or regulate?}
    startSession["Start Pace Session"]
    regulate["Digital or IRL recovery"]
    focusedWork["Focused work area"]
    sessionChoice{What is needed?}
    askHelp["Ask contextual help"]
    reduceScope["Reduce scope"]
    pauseActivity["Pause and regulate"]
    recordProgress["Record progress"]
    sessionOutcome{Session outcome?}
    completed["Completed"]
    partial["Partial"]
    blocked["Blocked"]
    rescheduled["Rescheduled"]
    nextAction["Save easiest next action"]
    transition{Next choice?}
    continueNext["Continue"]
    scheduleLater["Schedule next"]
    recoverLonger["Recover"]
    exitQuest["Exit Quest"]

    selectTask --> blocker
    blocker --> unclear & tooLarge & missingKnowledge & missingMaterials & lowCapacity & perfection & manualPath
    unclear --> buildPlan
    tooLarge --> buildPlan
    missingKnowledge --> buildPlan
    missingMaterials --> buildPlan
    lowCapacity --> buildPlan
    perfection --> buildPlan
    manualPath --> buildPlan
    buildPlan --> chooseCheckpoint
    chooseCheckpoint --> defineDone
    defineDone --> chooseGuardian
    chooseGuardian --> preChoice
    preChoice -->|"Start"| startSession
    preChoice -->|"Regulate"| regulate
    regulate --> startSession
    startSession --> focusedWork
    focusedWork --> sessionChoice
    sessionChoice -->|"Help"| askHelp
    sessionChoice -->|"Smaller"| reduceScope
    sessionChoice -->|"Pause"| pauseActivity
    sessionChoice -->|"Progress"| recordProgress
    askHelp --> focusedWork
    reduceScope --> focusedWork
    pauseActivity --> focusedWork
    recordProgress --> sessionOutcome
    sessionOutcome --> completed & partial & blocked & rescheduled
    completed --> nextAction
    partial --> nextAction
    blocked --> nextAction
    rescheduled --> nextAction
    nextAction --> transition
    transition -->|"Continue"| continueNext
    transition -->|"Later"| scheduleLater
    transition -->|"Recover"| recoverLonger
    transition -->|"Stop"| exitQuest
    continueNext --> chooseCheckpoint
    recoverLonger --> regulate

    style blocker fill:#FFECBD,stroke:#FFC943
    style sessionChoice fill:#FFECBD,stroke:#FFC943
    style sessionOutcome fill:#FFECBD,stroke:#FFC943
    style transition fill:#FFECBD,stroke:#FFC943
    style regulate fill:#C6FAF6,stroke:#5AD8CC
    style nextAction fill:#CDF4D3,stroke:#66D575
```

## 6. Guardian assistance routing

```mermaid
flowchart LR
    need([Student needs help])
    helpType{Help type?}

    subgraph guardians ["Guardian specialties"]
        direction TB
        mira["Mira: Understand"]
        kai["Kai: Plan"]
        sol["Sol: Sustain"]
        sky["Sky: Accompany"]
        goh["Goh: Complete"]
    end

    subgraph actions ["Available actions"]
        direction TB
        interpret["Interpret requirements"]
        explain["Explain or quiz"]
        research["Organize research"]
        prioritize["Prioritize and estimate"]
        rebalance["Rebalance schedule"]
        reduce["Reduce checkpoint scope"]
        protect["Protect a break"]
        bodyDouble["Work alongside"]
        encourage["Gentle check-in"]
        gather["Gather materials"]
        finalCheck["Review submission needs"]
    end

    studentOwns["Student reviews and owns output"]
    saveContext["Save accepted plan and next action"]

    need --> helpType
    helpType -->|"Understand"| mira
    helpType -->|"Plan"| kai
    helpType -->|"Sustain"| sol
    helpType -->|"Accompany"| sky
    helpType -->|"Finish"| goh

    mira --> interpret & explain & research
    kai --> prioritize & rebalance
    sol --> reduce & protect
    sky --> bodyDouble & encourage
    goh --> gather & finalCheck

    interpret --> studentOwns
    explain --> studentOwns
    research --> studentOwns
    prioritize --> studentOwns
    rebalance --> studentOwns
    reduce --> studentOwns
    protect --> studentOwns
    bodyDouble --> studentOwns
    encourage --> studentOwns
    gather --> studentOwns
    finalCheck --> studentOwns
    studentOwns --> saveContext

    style guardians fill:#DCCCFF,stroke:#874FFF
    style actions fill:#C2E5FF,stroke:#3DADFF
    style studentOwns fill:#CDF4D3,stroke:#66D575
```

## 7. Recovery activity choice

```mermaid
flowchart TD
    recovery([Recovery recommended or requested])
    context["Check preference and context"]
    constraints["Check stated access constraints"]
    choices{Suitable paths?}

    subgraph digital ["Do something here"]
        direction TB
        digitalMenu["Digital activity menu"]
        firefly["Firefly Stories"]
        chime["Chime Drift"]
        ripples["Gentle Ripples"]
        warmCup["Warm Cup"]
        lanterns["Night Lanterns"]
    end

    subgraph physical ["Do something away"]
        direction TB
        irlMenu["IRL activity menu"]
        outside["Go outside"]
        move["Move or change posture"]
        prepare["Prepare drink or workspace"]
        errand["Complete one errand"]
        connect["Gentle social check-in"]
        notice["Notice one detail"]
    end

    replacement["Choose another"]
    decline["Not now"]
    participate["Participate without scoring"]
    optionalPhoto{Use a photo?}
    selfConfirm["Self-confirm"]
    photoPath["Photo choice"]
    response{Optional response?}
    lighter["Lighter"]
    same["The same"]
    unsure["Not sure"]
    returnChoice["Resume, reschedule, rest, or stop"]

    recovery --> context
    context --> constraints
    constraints --> choices
    choices -->|"Digital"| digitalMenu
    choices -->|"IRL"| irlMenu
    choices -->|"Another"| replacement
    choices -->|"Decline"| decline
    replacement --> context
    digitalMenu --> firefly & chime & ripples & warmCup & lanterns
    irlMenu --> outside & move & prepare & errand & connect & notice
    firefly & chime & ripples & warmCup & lanterns --> participate
    outside & move & prepare & errand & connect & notice --> participate
    participate --> optionalPhoto
    optionalPhoto -->|"No"| selfConfirm
    optionalPhoto -->|"Yes"| photoPath
    selfConfirm --> response
    photoPath --> response
    response --> lighter & same & unsure
    lighter --> returnChoice
    same --> returnChoice
    unsure --> returnChoice

    style digital fill:#C2E5FF,stroke:#3DADFF
    style physical fill:#C6FAF6,stroke:#5AD8CC
    style choices fill:#FFECBD,stroke:#FFC943
    style optionalPhoto fill:#FFECBD,stroke:#FFC943
    style response fill:#FFECBD,stroke:#FFC943
```

## 8. Digital mini-game behavior

```mermaid
flowchart LR
    trigger([Recovery moment])
    gameChoice{Mini-game?}

    firefly["Firefly Stories"]
    fireflyPlay["Follow story lights"]
    fireflyExit["Return, save thought, or rest"]

    chime["Chime Drift"]
    chimePlay["Watch or tap slow waves"]
    chimeExit["Choose action or rebalance"]

    ripple["Gentle Ripples"]
    ripplePlay["Create ripples and petals"]
    rippleExit["Resume, reduce, or rest"]

    cup["Warm Cup"]
    cupPlay["Pour, stir, and sit"]
    cupExit["Work, schedule, or linger"]

    lantern["Night Lanterns"]
    lanternPlay["Place and light concern"]
    lanternExit["Backpack, Mailbox, or release"]

    common["No score, failure, or forced duration"]
    access["Muted and reduced-motion variants"]
    returnState["Restore Pace Session state"]

    trigger --> gameChoice
    gameChoice -->|"Reflect"| firefly
    gameChoice -->|"Slow transition"| chime
    gameChoice -->|"Sensory pause"| ripple
    gameChoice -->|"Prepare ritual"| cup
    gameChoice -->|"Close thought"| lantern

    firefly --> fireflyPlay --> fireflyExit
    chime --> chimePlay --> chimeExit
    ripple --> ripplePlay --> rippleExit
    cup --> cupPlay --> cupExit
    lantern --> lanternPlay --> lanternExit

    fireflyPlay --> common
    chimePlay --> common
    ripplePlay --> common
    cupPlay --> common
    lanternPlay --> common
    common --> access
    fireflyExit --> returnState
    chimeExit --> returnState
    rippleExit --> returnState
    cupExit --> returnState
    lanternExit --> returnState

    style gameChoice fill:#FFECBD,stroke:#FFC943
    style common fill:#CDF4D3,stroke:#66D575
    style access fill:#C2E5FF,stroke:#3DADFF
```

## 9. Detailed IRL quest catalogue

```mermaid
flowchart LR
    context([Recovery context])
    questChoice{IRL quest?}

    subgraph outdoors ["Outdoor and environment"]
        direction TB
        pocketGreen["Pocket of Green"]
        findSky["Look Up, Find the Sky"]
        gentleLoop["One Gentle Loop"]
        goodDetail["Notice One Good Detail"]
    end

    subgraph preparation ["Preparation and closure"]
        direction TB
        realCup["Make the Warm Cup"]
        readySpace["Ready the Space"]
        safeNote["Put It Somewhere Safe"]
    end

    subgraph practical ["Movement and connection"]
        direction TB
        errandRoute["One Errand, One Route"]
        movementReset["Small Movement Reset"]
        reachOut["Gentle Reach-Out"]
    end

    photoOption["Optional safe photo"]
    selfOption["Self-confirm"]
    completion{Completion?}
    doneQuest["Done"]
    partialQuest["Partly done"]
    changeMind["Changed my mind"]
    anotherQuest["Choose another"]
    equalReward["Equal rewards by method"]
    keepsakeChoice["Optional Pace Keepsake"]
    returnAction["Resume, reschedule, rest, or stop"]

    context --> questChoice
    questChoice --> pocketGreen & findSky & gentleLoop & goodDetail
    questChoice --> realCup & readySpace & safeNote
    questChoice --> errandRoute & movementReset & reachOut
    pocketGreen & findSky & gentleLoop & goodDetail --> photoOption & selfOption
    realCup & readySpace & safeNote --> photoOption & selfOption
    errandRoute & movementReset & reachOut --> photoOption & selfOption
    photoOption --> completion
    selfOption --> completion
    completion --> doneQuest & partialQuest & changeMind & anotherQuest
    doneQuest --> equalReward
    partialQuest --> equalReward
    equalReward --> keepsakeChoice
    keepsakeChoice --> returnAction
    changeMind --> returnAction
    anotherQuest --> questChoice

    style outdoors fill:#CDF4D3,stroke:#66D575
    style preparation fill:#FFE0C2,stroke:#FF9E42
    style practical fill:#C6FAF6,stroke:#5AD8CC
    style questChoice fill:#FFECBD,stroke:#FFC943
    style completion fill:#FFECBD,stroke:#FFC943
```

## 10. Photo verification and Pace Keepsake pipeline

```mermaid
flowchart TD
    questProgress([IRL quest progress])
    confirmChoice{Confirmation method?}
    selfConfirm["Self-confirm"]
    selectPhoto[/"Choose or capture photo"/]
    removeMeta["Remove EXIF and location"]
    privacyScan["Detect sensitive content"]
    privacyIssue{Review needed?}
    cropRedact["Crop, redact, or cancel"]
    verifyChoice{Verify quest?}
    verification["Check visible criteria only"]
    verifyResult{Verification result?}
    passResult["Pass"]
    uncertainResult["Uncertain"]
    failResult["Fail"]
    manualConfirm["Allow manual confirmation"]
    keepChoice{Photo policy?}
    verifyDiscard["Verify and discard"]
    generateDiscard["Create Keepsake and discard original"]
    saveBoth["Save both privately"]
    cancelAll["Cancel and retain nothing"]
    styleImage["Generate PaceTown pixel art"]
    aiAvailable{AI available?}
    aiStyle["AI style transformation"]
    localStyle["Local pixel and palette filter"]
    symbolic["Symbolic fallback"]
    preview["Preview generated result"]
    approve{Approve Keepsake?}
    place["Place in private collection"]
    deleteTemp["Delete temporary input"]
    equalRewards["Keep rewards unchanged"]

    questProgress --> confirmChoice
    confirmChoice -->|"Self"| selfConfirm
    confirmChoice -->|"Photo"| selectPhoto
    selfConfirm --> equalRewards
    selectPhoto --> removeMeta
    removeMeta --> privacyScan
    privacyScan --> privacyIssue
    privacyIssue -->|"Yes"| cropRedact
    privacyIssue -->|"No"| verifyChoice
    cropRedact --> verifyChoice
    verifyChoice -->|"Yes"| verification
    verifyChoice -->|"No"| keepChoice
    verification --> verifyResult
    verifyResult --> passResult & uncertainResult & failResult
    passResult --> keepChoice
    uncertainResult --> manualConfirm
    failResult --> manualConfirm
    manualConfirm --> keepChoice
    keepChoice -->|"Discard"| verifyDiscard
    keepChoice -->|"Keepsake"| generateDiscard
    keepChoice -->|"Both"| saveBoth
    keepChoice -->|"Cancel"| cancelAll
    generateDiscard --> styleImage
    saveBoth --> styleImage
    styleImage --> aiAvailable
    aiAvailable -->|"Yes"| aiStyle
    aiAvailable -->|"No"| localStyle
    localStyle -.-> symbolic
    aiStyle --> preview
    localStyle --> preview
    symbolic --> preview
    preview --> approve
    approve -->|"Yes"| place
    approve -->|"No"| deleteTemp
    place --> deleteTemp
    verifyDiscard --> deleteTemp
    cancelAll --> deleteTemp
    deleteTemp --> equalRewards

    style confirmChoice fill:#FFECBD,stroke:#FFC943
    style privacyIssue fill:#FFECBD,stroke:#FFC943
    style verifyResult fill:#FFECBD,stroke:#FFC943
    style keepChoice fill:#FFECBD,stroke:#FFC943
    style aiAvailable fill:#FFECBD,stroke:#FFC943
    style approve fill:#FFECBD,stroke:#FFC943
    style place fill:#CDF4D3,stroke:#66D575
    style equalRewards fill:#CDF4D3,stroke:#66D575
```

## 11. Keepsake collection and placement

```mermaid
flowchart LR
    keepsake([Approved Pace Keepsake])
    category{Category?}
    gardenCard["Garden"]
    cafeCard["Café"]
    libraryCard["Library"]
    marketCard["Market"]
    pathCard["Path"]
    weatherCard["Weather"]
    postcardCard["Postcard"]
    collection[(Private Collection)]
    placement{Place where?}
    journalPlace["Journal"]
    gardenPlace["Recovery Garden"]
    townPlace["Town decoration"]
    mailboxPlace["Future Mailbox"]
    keepOnly["Collection only"]
    manage["Preview, name, move, download, delete"]
    privacyState["Show original retention state"]
    noPressure["No rarity, trading, feed, or completion target"]

    keepsake --> category
    category --> gardenCard & cafeCard & libraryCard & marketCard & pathCard & weatherCard & postcardCard
    gardenCard --> collection
    cafeCard --> collection
    libraryCard --> collection
    marketCard --> collection
    pathCard --> collection
    weatherCard --> collection
    postcardCard --> collection
    collection --> placement
    placement --> journalPlace & gardenPlace & townPlace & mailboxPlace & keepOnly
    journalPlace --> manage
    gardenPlace --> manage
    townPlace --> manage
    mailboxPlace --> manage
    keepOnly --> manage
    manage --> privacyState
    privacyState --> noPressure

    style category fill:#FFECBD,stroke:#FFC943
    style placement fill:#FFECBD,stroke:#FFC943
    style collection fill:#DCCCFF,stroke:#874FFF
    style noPressure fill:#CDF4D3,stroke:#66D575
```

## 12. Town locations and mechanics

```mermaid
flowchart LR
    student([Student avatar])
    townMap["Campus Grove"]

    subgraph workDistricts ["Work and planning"]
        direction TB
        library["Library and Story Bench"]
        clockTower["Clock Tower"]
        townHall["Town Hall"]
        workshop["Rebalance Workshop"]
        council["Guardian Council"]
    end

    subgraph recoveryDistricts ["Recovery and connection"]
        direction TB
        garden["Garden and Gym pavilion"]
        cafe["Café"]
        park["Park"]
        calmCorner["Calm Corner"]
        home["Home"]
    end

    subgraph continuityDistricts ["Continuity and progress"]
        direction TB
        market["Market"]
        postOffice["Post Office"]
        recoveryGarden["Recovery Garden"]
        futureMailbox["Future Mailbox"]
        backpackPoint["Backpack point"]
        calendarTerminal["Calendar terminal"]
        exitBoard["Exit Quest board"]
    end

    townList["Semantic Town List"]
    scriptedTravel["Scripted avatar travel"]
    locationPanel["Contextual activity panel"]
    quietMode["Quiet Mode"]

    student --> townMap
    student --> townList
    townMap --> library & garden & market
    library --- clockTower --- townHall --- workshop --- council
    garden --- cafe --- park --- calmCorner --- home
    market --- postOffice --- recoveryGarden --- futureMailbox
    futureMailbox --- backpackPoint --- calendarTerminal --- exitBoard
    townMap --> scriptedTravel
    scriptedTravel --> locationPanel
    townList --> locationPanel
    locationPanel --> quietMode

    style workDistricts fill:#C2E5FF,stroke:#3DADFF
    style recoveryDistricts fill:#C6FAF6,stroke:#5AD8CC
    style continuityDistricts fill:#DCCCFF,stroke:#874FFF
```

## 13. Game progression without punishment

```mermaid
flowchart TD
    meaningfulAction([Meaningful student action])
    actionType{Action type?}
    beginSession["Begin planned session"]
    checkpoint["Checkpoint progress"]
    identifyBlocker["Identify blocker"]
    saveNext["Save next action"]
    rebalance["Approve rebalance"]
    recovery["Intentional recovery"]
    safeStop["Stop at boundary"]
    grant["Grant XP, coins, category growth"]
    progression{Use progress?}
    level["Player level"]
    cosmetic["Cosmetic purchase"]
    building["Building upgrade"]
    garden["Recovery Garden growth"]
    postcard["Journal Postcard"]
    world["Residents, wildlife, and activity"]
    safeguards["No decay, streak loss, or pay advantage"]

    meaningfulAction --> actionType
    actionType --> beginSession & checkpoint & identifyBlocker & saveNext & rebalance & recovery & safeStop
    beginSession --> grant
    checkpoint --> grant
    identifyBlocker --> grant
    saveNext --> grant
    rebalance --> grant
    recovery --> grant
    safeStop --> grant
    grant --> progression
    progression --> level & cosmetic & building & garden & postcard
    level --> world
    cosmetic --> world
    building --> world
    garden --> world
    postcard --> world
    world --> safeguards

    style actionType fill:#FFECBD,stroke:#FFC943
    style progression fill:#FFECBD,stroke:#FFC943
    style grant fill:#CDF4D3,stroke:#66D575
    style safeguards fill:#CDF4D3,stroke:#66D575
```

## 14. Accessibility, privacy, and safety gates

```mermaid
flowchart LR
    feature([Any PaceTown feature])

    subgraph access ["Accessibility gate"]
        direction TB
        semantic["Semantic controls"]
        keyboard["Keyboard access"]
        townList["Town List parity"]
        touch["Large touch targets"]
        contrast["Text, icons, and contrast"]
        motion["Reduced motion"]
        audio["Muted audio and visual cues"]
        accessGate["Accessibility approved"]
    end

    subgraph privacy ["Privacy gate"]
        direction TB
        localFirst["Local-first storage"]
        optionalUpload["Optional uploads"]
        separateConsent["Separate consent choices"]
        metadata["Remove metadata"]
        privateMedia["Private media"]
        exportDelete["Export and delete"]
        privacyGate["Privacy approved"]
    end

    subgraph safety ["Safety gate"]
        direction TB
        noDiagnosis["No diagnosis"]
        noMedical["No medical advice"]
        noPunishment["No punishment"]
        noForce["No forced recovery"]
        oneAction["One primary action"]
        studentControl["Student control"]
        academicAgency["Academic agency"]
        safetyGate["Safety approved"]
    end

    release{All gates pass?}
    ship["Include in product"]
    revise["Revise or defer"]

    feature --> semantic & localFirst & noDiagnosis
    semantic & keyboard & townList & touch & contrast & motion & audio --> accessGate
    localFirst & optionalUpload & separateConsent & metadata & privateMedia & exportDelete --> privacyGate
    noDiagnosis & noMedical & noPunishment & noForce & oneAction & studentControl & academicAgency --> safetyGate
    accessGate & privacyGate & safetyGate --> release
    release -->|"Yes"| ship
    release -->|"No"| revise
    revise -.-> feature

    style access fill:#C2E5FF,stroke:#3DADFF
    style privacy fill:#DCCCFF,stroke:#874FFF
    style safety fill:#FFE0C2,stroke:#FF9E42
    style release fill:#FFECBD,stroke:#FFC943
    style ship fill:#CDF4D3,stroke:#66D575
    style revise fill:#FFCDC2,stroke:#FF7556
```

## 15. Local-first product architecture

```mermaid
flowchart LR
    subgraph interfaceLayer ["Experience layer"]
        direction TB
        reactApp["React PWA"]
        townUi["Town interface"]
        plannerUi["Planner"]
        sessionUi["Pace Session"]
        recoveryUi["Recovery activities"]
        collectionUi["Keepsake collection"]
        accessibleUi["Town List"]
    end

    subgraph domainLayer ["Deterministic domain"]
        direction TB
        workloadEngine["Workload engine"]
        rebalanceEngine["Rebalancing engine"]
        questEngine["Quest engine"]
        sessionEngine["Session engine"]
        rewardEngine["Progression engine"]
        fallbackEngine["Local fallback engine"]
    end

    subgraph adapterLayer ["Provider adapters"]
        direction TB
        authAdapter["Auth adapter"]
        taskParser["Task parser adapter"]
        workGuide["Work guide adapter"]
        photoVerifier["Photo verifier adapter"]
        keepsakeGenerator["Keepsake generator adapter"]
        calendarAdapter["Calendar adapter"]
        assetAdapter["Asset repository"]
    end

    indexedDb[(IndexedDB)]
    serviceWorker["PWA service worker"]
    optionalCloud["Optional production services"]

    reactApp --> townUi & plannerUi & sessionUi & recoveryUi & collectionUi & accessibleUi
    townUi --> workloadEngine & rewardEngine
    plannerUi --> workloadEngine & rebalanceEngine
    sessionUi --> sessionEngine
    recoveryUi --> questEngine
    collectionUi --> rewardEngine
    accessibleUi --> workloadEngine & sessionEngine & questEngine

    workloadEngine --> indexedDb
    rebalanceEngine --> indexedDb
    questEngine --> indexedDb
    sessionEngine --> indexedDb
    rewardEngine --> indexedDb
    fallbackEngine --> indexedDb

    reactApp --> authAdapter & taskParser & workGuide & photoVerifier & keepsakeGenerator & calendarAdapter & assetAdapter
    authAdapter & taskParser & workGuide & photoVerifier & keepsakeGenerator & calendarAdapter & assetAdapter --> optionalCloud
    fallbackEngine -.-> taskParser
    fallbackEngine -.-> workGuide
    fallbackEngine -.-> photoVerifier
    fallbackEngine -.-> keepsakeGenerator
    fallbackEngine -.-> calendarAdapter
    reactApp --> serviceWorker
    serviceWorker --> indexedDb

    style interfaceLayer fill:#C2E5FF,stroke:#3DADFF
    style domainLayer fill:#CDF4D3,stroke:#66D575
    style adapterLayer fill:#DCCCFF,stroke:#874FFF
    style optionalCloud fill:#D9D9D9,stroke:#B3B3B3
```

## 16. Hackathon vertical slice

```mermaid
flowchart LR
    seed([Aina demo starts])
    fiveAreas["Show five demand areas"]
    load108["Explain Thursday at 108 percent"]
    townPressure["Render district pressure"]
    backpack["Show weighted Backpack"]
    moveForm["Move flexible admin form"]
    lockFixed["Keep fixed commitments locked"]
    lowerLoad["Lower Thursday load"]
    selectAssignment["Choose database assignment"]
    blocker["Select unclear start"]
    brief["Review seeded brief"]
    checkpoint["Choose entity checkpoint"]
    miraHelp["Ask Mira one question"]
    partial["Record partial ERD progress"]
    saveNext["Save junction entity action"]
    ripples["Use Gentle Ripples"]
    pocketGreen["Choose Pocket of Green"]
    showAlternatives["Show outdoor and indoor paths"]
    photoChoice["Use seeded optional photo"]
    sanitize["Remove metadata and review"]
    generate["Generate Garden Keepsake"]
    approve["Approve private placement"]
    townGrowth["Clear Library and grow plant"]
    journal["Show complete private history"]
    proof([Track problem answered])

    seed --> fiveAreas
    fiveAreas --> load108
    load108 --> townPressure
    townPressure --> backpack
    backpack --> moveForm
    moveForm --> lockFixed
    lockFixed --> lowerLoad
    lowerLoad --> selectAssignment
    selectAssignment --> blocker
    blocker --> brief
    brief --> checkpoint
    checkpoint --> miraHelp
    miraHelp --> partial
    partial --> saveNext
    saveNext --> ripples
    ripples --> pocketGreen
    pocketGreen --> showAlternatives
    showAlternatives --> photoChoice
    photoChoice --> sanitize
    sanitize --> generate
    generate --> approve
    approve --> townGrowth
    townGrowth --> journal
    journal --> proof

    style fiveAreas fill:#FFE0C2,stroke:#FF9E42
    style lowerLoad fill:#CDF4D3,stroke:#66D575
    style partial fill:#C2E5FF,stroke:#3DADFF
    style ripples fill:#C6FAF6,stroke:#5AD8CC
    style pocketGreen fill:#C6FAF6,stroke:#5AD8CC
    style generate fill:#DCCCFF,stroke:#874FFF
    style proof fill:#CDF4D3,stroke:#66D575
```

## 17. Delivery priorities and expansion path

```mermaid
flowchart TD
    foundation([Foundation])
    domain["Tasks, load, plans, sessions"]
    coreFlow["Guided-work vertical slice"]
    townShell["Campus Grove shell"]
    recoveryCore["Gentle Ripples and Pocket of Green"]
    keepsakeCore["One private Keepsake flow"]
    accessibility["Accessibility and local fallback"]
    verification["Automated and visual QA"]
    coreAccepted{Core accepted?}

    fullGames["Complete five mini-games"]
    questExpansion["Expand IRL quest library"]
    gardenExpansion["Expand Recovery Garden"]
    collectionExpansion["Expand Keepsake collection"]
    shopExpansion["Expand cosmetics and shop"]
    environments["Coastal Commons and Night Market"]
    productionAdapters["Supabase, AI, and Calendar"]
    deploy["Deploy and package"]

    foundation --> domain
    domain --> coreFlow
    coreFlow --> townShell
    townShell --> recoveryCore
    recoveryCore --> keepsakeCore
    keepsakeCore --> accessibility
    accessibility --> verification
    verification --> coreAccepted
    coreAccepted -->|"No"| coreFlow
    coreAccepted -->|"Yes"| fullGames & questExpansion & gardenExpansion & collectionExpansion
    fullGames --> shopExpansion
    questExpansion --> shopExpansion
    gardenExpansion --> environments
    collectionExpansion --> environments
    shopExpansion --> productionAdapters
    environments --> productionAdapters
    productionAdapters --> deploy

    style coreAccepted fill:#FFECBD,stroke:#FFC943
    style recoveryCore fill:#C6FAF6,stroke:#5AD8CC
    style keepsakeCore fill:#DCCCFF,stroke:#874FFF
    style deploy fill:#CDF4D3,stroke:#66D575
```
