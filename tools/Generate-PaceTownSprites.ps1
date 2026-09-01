param(
    [string]$OutputRoot = "assets\production\characters"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Color([string]$hex) {
    return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function Brush([string]$hex) {
    return [System.Drawing.SolidBrush]::new((Color $hex))
}

function FillRect($graphics, [string]$hex, [int]$x, [int]$y, [int]$w, [int]$h) {
    $brush = Brush $hex
    $graphics.FillRectangle($brush, $x, $y, $w, $h)
    $brush.Dispose()
}

function FillEllipse($graphics, [string]$hex, [int]$x, [int]$y, [int]$w, [int]$h) {
    $brush = Brush $hex
    $graphics.FillEllipse($brush, $x, $y, $w, $h)
    $brush.Dispose()
}

function Pixel($bitmap, [string]$hex, [int]$x, [int]$y) {
    if ($x -ge 0 -and $x -lt $bitmap.Width -and $y -ge 0 -and $y -lt $bitmap.Height) {
        $bitmap.SetPixel($x, $y, (Color $hex))
    }
}

function Tone([string]$hex, [double]$factor) {
    $source = Color $hex
    $red = [Math]::Max(0, [Math]::Min(255, [int]($source.R * $factor)))
    $green = [Math]::Max(0, [Math]::Min(255, [int]($source.G * $factor)))
    $blue = [Math]::Max(0, [Math]::Min(255, [int]($source.B * $factor)))
    return "#{0:X2}{1:X2}{2:X2}" -f $red, $green, $blue
}

function Add-FinalPixelDetail($frame, $spec, [string]$direction, [int]$phase, [string]$action) {
    # The base silhouette is authored on a 16x24 grid for clean animation. This
    # pass adds true 32x48 single-pixel accents so it sits beside the selected
    # Kauzz/Ghost Data world art instead of looking like a uniformly 2x-scaled icon.
    $hairLight = Tone $spec.Hair 1.28
    $hairShade = Tone $spec.HairDark 0.88
    $skinLight = Tone $spec.Skin 1.12
    $skinShade = Tone $spec.Skin 0.82
    $topLight = Tone $spec.Top 1.18
    $topShade = Tone $spec.Top 0.76
    $pantsLight = Tone $spec.Pants 1.16
    $shoeLight = Tone $spec.Shoes 1.20

    $bob = if ($action -eq "walk" -and ($phase % 2) -eq 1) { 2 } else { 0 }
    $headTop = 6 + $bob

    if ($direction -eq "down") {
        foreach ($point in @(@(12,1), @(13,1), @(14,0), @(17,0), @(18,1), @(19,1))) {
            Pixel $frame $hairLight ($point[0] + 2) ($headTop + $point[1])
        }
        Pixel $frame $hairShade 10 ($headTop + 7)
        Pixel $frame $skinLight 14 ($headTop + 7)
        Pixel $frame $skinShade 21 ($headTop + 11)
        Pixel $frame $skinShade 16 ($headTop + 13)
        Pixel $frame "#C87372" 13 ($headTop + 11)
        Pixel $frame "#C87372" 19 ($headTop + 11)
    } elseif ($direction -eq "up") {
        13..17 | ForEach-Object { Pixel $frame $hairLight $_ ($headTop + 2) }
        Pixel $frame $hairShade 21 ($headTop + 10)
    } elseif ($direction -eq "left") {
        Pixel $frame $hairLight 12 ($headTop + 1)
        Pixel $frame $hairLight 13 ($headTop + 1)
        Pixel $frame $skinLight 12 ($headTop + 8)
        Pixel $frame $skinShade 19 ($headTop + 11)
    } else {
        Pixel $frame $hairLight 18 ($headTop + 1)
        Pixel $frame $hairLight 19 ($headTop + 1)
        Pixel $frame $skinLight 19 ($headTop + 8)
        Pixel $frame $skinShade 12 ($headTop + 11)
    }

    # Clothing folds, cuffs, and shoe highlights are deliberately restrained:
    # the project uses a soft cozy palette, not high-contrast arcade shading.
    Pixel $frame $topLight 11 (22 + $bob)
    Pixel $frame $topLight 12 (22 + $bob)
    Pixel $frame $topShade 21 (30 + $bob)
    Pixel $frame $topShade 8 (27 + $bob)
    Pixel $frame $topShade 25 (27 + $bob)
    Pixel $frame $skinLight 8 (31 + $bob)
    Pixel $frame $skinShade 27 (33 + $bob)
    Pixel $frame $pantsLight 13 (37 + $bob)
    Pixel $frame $pantsLight 20 (37 + $bob)
    Pixel $frame $shoeLight 12 (42 + $bob)
    Pixel $frame $shoeLight 21 (42 + $bob)
    Pixel $frame $spec.Outline 10 (44 + $bob)
    Pixel $frame $spec.Outline 23 (44 + $bob)

    switch ($spec.Name) {
        "sky" {
            # Sky identity lock: black centre-parted hair, round glasses,
            # dusty-rose cardigan, cream shirt, and sky-blue apron.
            if ($direction -eq "down") {
                Pixel $frame "#49546B" 15 ($headTop + 1)
                Pixel $frame "#49546B" 18 ($headTop + 1)
                Pixel $frame $spec.Skin 16 $headTop
                Pixel $frame $spec.Skin 17 $headTop
                Pixel $frame "#EFF4F4" 13 ($headTop + 7)
                Pixel $frame "#EFF4F4" 20 ($headTop + 7)
            }
            Pixel $frame "#79A9C5" 13 (27 + $bob)
            Pixel $frame "#79A9C5" 20 (27 + $bob)
            Pixel $frame "#315E7C" 12 (33 + $bob)
            Pixel $frame "#315E7C" 21 (33 + $bob)
            Pixel $frame "#E4BC62" 12 (25 + $bob)
            Pixel $frame "#E4BC62" 21 (25 + $bob)
        }
        "mira" {
            # Mira identity lock: adult neko-maid librarian; navy/cream uniform,
            # teal bow and bell, glasses, ears, and tail.
            Pixel $frame "#FFF3DA" 12 (25 + $bob)
            Pixel $frame "#FFF3DA" 21 (25 + $bob)
            Pixel $frame "#277887" 15 (22 + $bob)
            Pixel $frame "#277887" 18 (22 + $bob)
            Pixel $frame "#D6A64A" 17 (24 + $bob)
            if ($direction -eq "down") {
                Pixel $frame "#F1BAA5" 12 ($headTop - 1)
                Pixel $frame "#F1BAA5" 21 ($headTop - 1)
                Pixel $frame "#EFF4F4" 13 ($headTop + 7)
                Pixel $frame "#EFF4F4" 20 ($headTop + 7)
            }
        }
        "kai" {
            Pixel $frame "#E3B34B" 19 (27 + $bob)
            Pixel $frame "#6F421D" 18 (29 + $bob)
        }
        "sol" {
            Pixel $frame "#EBC34A" 13 (20 + $bob)
            Pixel $frame "#9CBC67" 20 (25 + $bob)
        }
        "goh" {
            Pixel $frame "#6F8D67" 12 (23 + $bob)
            Pixel $frame "#36553B" 18 (28 + $bob)
        }
        "player" {
            Pixel $frame "#A8B27C" 12 (24 + $bob)
            Pixel $frame "#D7B878" 17 (26 + $bob)
        }
    }

    if ($action -eq "concerned" -and $direction -eq "down") {
        Pixel $frame "#6A3543" 13 ($headTop + 8)
        Pixel $frame "#6A3543" 20 ($headTop + 8)
    }
    if ($action -eq "happy" -and $direction -eq "down") {
        Pixel $frame "#F1A0A0" 12 ($headTop + 11)
        Pixel $frame "#F1A0A0" 21 ($headTop + 11)
    }
}

function Draw-LowResCharacter($spec, [string]$direction, [int]$phase, [string]$action) {
    $bitmap = [System.Drawing.Bitmap]::new(16, 24, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    $bob = if ($action -eq "walk" -and ($phase % 2) -eq 1) { 1 } else { 0 }
    $legA = 0
    $legB = 0
    if ($action -eq "walk") {
        switch ($phase % 4) {
            0 { $legA = -1; $legB = 1 }
            1 { $legA = 0;  $legB = 0 }
            2 { $legA = 1;  $legB = -1 }
            3 { $legA = 0;  $legB = 0 }
        }
    }

    FillEllipse $graphics "#553C4A60" 4 21 8 2

    if ($action -eq "sit") {
        FillRect $graphics $spec.Pants 5 17 7 3
        FillRect $graphics $spec.Shoes 4 20 4 2
        FillRect $graphics $spec.Shoes 10 20 4 2
    } else {
        FillRect $graphics $spec.Pants (6 + $legA) (17 + $bob) 3 4
        FillRect $graphics $spec.Pants (9 + $legB) (17 + $bob) 3 4
        FillRect $graphics $spec.Shoes (5 + $legA) (20 + $bob) 4 2
        FillRect $graphics $spec.Shoes (9 + $legB) (20 + $bob) 4 2
    }

    if ($direction -eq "up" -and $spec.Name -eq "player") {
        FillRect $graphics "#503D62" 4 (10 + $bob) 8 7
        FillRect $graphics "#77597F" 5 (11 + $bob) 6 4
        FillRect $graphics "#C58A4A" 7 (12 + $bob) 2 1
    } else {
        FillRect $graphics $spec.Outline 4 (10 + $bob) 8 7
        FillRect $graphics $spec.Top 5 (10 + $bob) 6 7
        FillRect $graphics $spec.Shirt 7 (10 + $bob) 2 6
    }

    $armY = 11 + $bob
    $leftArmX = 3
    $rightArmX = 12
    if ($action -eq "interact") {
        if ($phase -eq 0) { $rightArmX = 13; $armY = 10 } else { $leftArmX = 2; $armY = 10 }
    }
    FillRect $graphics $spec.Top $leftArmX $armY 2 5
    FillRect $graphics $spec.Top $rightArmX $armY 2 5
    FillRect $graphics $spec.Skin $leftArmX (15 + $bob) 2 2
    FillRect $graphics $spec.Skin $rightArmX (15 + $bob) 2 2

    if ($action -eq "phone") {
        FillRect $graphics "#18283A" 11 10 2 4
        Pixel $bitmap "#66C4D2" 11 11
    }

    if ($spec.Name -eq "mira") {
        FillRect $graphics "#F0DDC4" 5 (11 + $bob) 6 4
        FillRect $graphics "#1F6170" 7 (10 + $bob) 2 2
        FillRect $graphics "#B98B42" 8 (11 + $bob) 1 1
        if ($direction -ne "up") {
            Pixel $bitmap $spec.Hair 14 (14 + $bob)
            Pixel $bitmap $spec.Hair 15 (15 + $bob)
            Pixel $bitmap $spec.Hair 14 (16 + $bob)
        }
    }
    if ($spec.Name -eq "sky") {
        FillRect $graphics "#477DA3" 5 (12 + $bob) 6 5
        Pixel $bitmap "#D3A24B" 6 (12 + $bob)
        Pixel $bitmap "#D3A24B" 10 (12 + $bob)
    }
    if ($spec.Name -eq "kai") {
        Pixel $bitmap "#D9A234" 10 (13 + $bob)
        Pixel $bitmap "#D9A234" 9 (14 + $bob)
    }
    if ($spec.Name -eq "sol") {
        FillRect $graphics "#DEA52D" 5 (9 + $bob) 6 2
        Pixel $bitmap "#8FB34A" 10 (12 + $bob)
    }
    if ($spec.Name -eq "goh") {
        Pixel $bitmap "#476544" 5 (10 + $bob)
        Pixel $bitmap "#476544" 6 (11 + $bob)
        Pixel $bitmap "#476544" 7 (12 + $bob)
        Pixel $bitmap "#476544" 8 (13 + $bob)
    }

    $headY = 3 + $bob
    if ($spec.Name -eq "mira") {
        Pixel $bitmap $spec.Hair 5 (1 + $bob)
        Pixel $bitmap $spec.Hair 6 (2 + $bob)
        Pixel $bitmap $spec.Hair 10 (2 + $bob)
        Pixel $bitmap $spec.Hair 11 (1 + $bob)
        Pixel $bitmap "#C67F6A" 6 (2 + $bob)
        Pixel $bitmap "#C67F6A" 10 (2 + $bob)
    }

    if ($direction -eq "up") {
        FillRect $graphics $spec.Hair 5 $headY 7 7
        FillRect $graphics $spec.HairDark 6 ($headY + 1) 5 5
    } elseif ($direction -eq "left" -or $direction -eq "right") {
        $hx = if ($direction -eq "left") { 5 } else { 6 }
        FillRect $graphics $spec.Hair $hx $headY 6 7
        FillRect $graphics $spec.Skin $hx ($headY + 2) 5 5
        if ($direction -eq "left") {
            Pixel $bitmap $spec.Eye ($hx + 1) ($headY + 4)
            FillRect $graphics $spec.HairDark ($hx + 4) $headY 2 5
        } else {
            Pixel $bitmap $spec.Eye ($hx + 3) ($headY + 4)
            FillRect $graphics $spec.HairDark $hx $headY 2 5
        }
    } else {
        FillRect $graphics $spec.Hair 5 $headY 7 7
        FillRect $graphics $spec.Skin 6 ($headY + 2) 5 5
        FillRect $graphics $spec.HairDark 5 $headY 2 4
        FillRect $graphics $spec.HairDark 10 $headY 2 3
        Pixel $bitmap $spec.Eye 7 ($headY + 4)
        Pixel $bitmap $spec.Eye 9 ($headY + 4)
        if ($action -eq "talk" -and ($phase % 2) -eq 1) {
            Pixel $bitmap "#8E3E47" 8 ($headY + 6)
        } elseif ($action -eq "happy") {
            Pixel $bitmap "#8E3E47" 8 ($headY + 5)
        } elseif ($action -eq "concerned") {
            Pixel $bitmap "#6C3C42" 8 ($headY + 6)
        }
    }

    if ($spec.Glasses -and $direction -ne "up") {
        $gy = $headY + 3
        if ($direction -eq "down") {
            Pixel $bitmap "#202533" 6 $gy; Pixel $bitmap "#202533" 7 $gy
            Pixel $bitmap "#202533" 9 $gy; Pixel $bitmap "#202533" 10 $gy
            Pixel $bitmap "#202533" 8 $gy
            Pixel $bitmap "#202533" 6 ($gy + 1); Pixel $bitmap "#202533" 10 ($gy + 1)
        } else {
            $gx = if ($direction -eq "left") { 5 } else { 9 }
            FillRect $graphics "#202533" $gx $gy 3 1
        }
    }

    if ($spec.Name -eq "sky" -and $direction -eq "down") {
        Pixel $bitmap "#11151E" 7 $headY
        Pixel $bitmap "#11151E" 9 $headY
        Pixel $bitmap $spec.Skin 8 $headY
    }

    if ($action -eq "breathe") {
        Pixel $bitmap "#7FC7D3" 14 (8 + $phase)
        Pixel $bitmap "#B5E0D5" 15 (7 + $phase)
    }

    $graphics.Dispose()
    return $bitmap
}

function Scale-Frame($low) {
    $frame = [System.Drawing.Bitmap]::new(32, 48, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($frame)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.DrawImage($low, [System.Drawing.Rectangle]::new(0, 0, 32, 48), 0, 0, 16, 24, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()
    return $frame
}

$characters = @(
    @{ Name="player"; Skin="#B96F42"; Hair="#6B2E35"; HairDark="#3C1E2A"; Eye="#302130"; Outline="#172638"; Top="#6D8052"; Shirt="#EFE3CC"; Pants="#303742"; Shoes="#D6C6A8"; Glasses=$false },
    @{ Name="mira"; Skin="#D78B62"; Hair="#382B35"; HairDark="#201B25"; Eye="#49313B"; Outline="#172638"; Top="#273A59"; Shirt="#EFE3CC"; Pants="#2C3550"; Shoes="#4A3328"; Glasses=$true },
    @{ Name="kai"; Skin="#D58B5F"; Hair="#77432F"; HairDark="#47291F"; Eye="#493026"; Outline="#172638"; Top="#B57529"; Shirt="#EFE3CC"; Pants="#312D35"; Shoes="#5A3625"; Glasses=$false },
    @{ Name="sol"; Skin="#A96137"; Hair="#3A2927"; HairDark="#241B1D"; Eye="#332127"; Outline="#172638"; Top="#66733B"; Shirt="#EFE3CC"; Pants="#4F5C31"; Shoes="#503827"; Glasses=$false },
    @{ Name="sky"; Skin="#D98C61"; Hair="#171820"; HairDark="#0E1017"; Eye="#282735"; Outline="#172638"; Top="#92566A"; Shirt="#EFE3CC"; Pants="#6A5948"; Shoes="#4B3527"; Glasses=$true },
    @{ Name="goh"; Skin="#C47A49"; Hair="#24242B"; HairDark="#15161D"; Eye="#30242A"; Outline="#172638"; Top="#9B4930"; Shirt="#EFE3CC"; Pants="#30353D"; Shoes="#4A3328"; Glasses=$false }
)

$framePlan = New-Object System.Collections.Generic.List[object]
foreach ($direction in @("down", "left", "right", "up")) {
    0..1 | ForEach-Object { $framePlan.Add(@{ Name="idle_${direction}_$_"; Direction=$direction; Phase=$_; Action="idle" }) }
}
foreach ($direction in @("down", "left", "right", "up")) {
    0..3 | ForEach-Object { $framePlan.Add(@{ Name="walk_${direction}_$_"; Direction=$direction; Phase=$_; Action="walk" }) }
}
foreach ($direction in @("down", "left", "right", "up")) {
    0..1 | ForEach-Object { $framePlan.Add(@{ Name="talk_${direction}_$_"; Direction=$direction; Phase=$_; Action="talk" }) }
}
0..1 | ForEach-Object { $framePlan.Add(@{ Name="interact_down_$_"; Direction="down"; Phase=$_; Action="interact" }) }
$framePlan.Add(@{ Name="sit_down_0"; Direction="down"; Phase=0; Action="sit" })
$framePlan.Add(@{ Name="phone_down_0"; Direction="down"; Phase=0; Action="phone" })
0..1 | ForEach-Object { $framePlan.Add(@{ Name="breathe_down_$_"; Direction="down"; Phase=$_; Action="breathe" }) }
$framePlan.Add(@{ Name="concerned_down_0"; Direction="down"; Phase=0; Action="concerned" })
$framePlan.Add(@{ Name="happy_down_0"; Direction="down"; Phase=0; Action="happy" })

$columns = 8
$rows = [Math]::Ceiling($framePlan.Count / $columns)
$sheetWidth = $columns * 32
$sheetHeight = $rows * 48

foreach ($spec in $characters) {
    $characterDir = Join-Path $OutputRoot $spec.Name
    $framesDir = Join-Path $characterDir "frames"
    New-Item -ItemType Directory -Force -Path $framesDir | Out-Null

    $sheet = [System.Drawing.Bitmap]::new($sheetWidth, $sheetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
    $sheetGraphics.Clear([System.Drawing.Color]::Transparent)
    $sheetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $sheetGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    $atlasFrames = [ordered]@{}
    for ($i = 0; $i -lt $framePlan.Count; $i++) {
        $plan = $framePlan[$i]
        $low = Draw-LowResCharacter $spec $plan.Direction $plan.Phase $plan.Action
        $frame = Scale-Frame $low
        Add-FinalPixelDetail $frame $spec $plan.Direction $plan.Phase $plan.Action
        $x = ($i % $columns) * 32
        $y = [Math]::Floor($i / $columns) * 48
        $sheetGraphics.DrawImageUnscaled($frame, $x, $y)
        $framePath = Join-Path $framesDir ($plan.Name + ".png")
        $frame.Save($framePath, [System.Drawing.Imaging.ImageFormat]::Png)
        $atlasFrames[$plan.Name + ".png"] = [ordered]@{
            frame = [ordered]@{ x=$x; y=$y; w=32; h=48 }
            rotated = $false
            trimmed = $false
            spriteSourceSize = [ordered]@{ x=0; y=0; w=32; h=48 }
            sourceSize = [ordered]@{ w=32; h=48 }
        }
        $frame.Dispose()
        $low.Dispose()
    }

    $sheetGraphics.Dispose()
    $sheetPath = Join-Path $characterDir ($spec.Name + "-production-sheet.png")
    $sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $sheet.Dispose()

    $atlas = [ordered]@{
        frames = $atlasFrames
        meta = [ordered]@{
            app = "PaceTown deterministic sprite generator"
            version = "1.1"
            image = ($spec.Name + "-production-sheet.png")
            format = "RGBA8888"
            size = [ordered]@{ w=$sheetWidth; h=$sheetHeight }
            scale = "1"
        }
    }
    $atlas | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $characterDir ($spec.Name + "-atlas.json")) -Encoding UTF8

    $animations = [ordered]@{}
    foreach ($direction in @("down", "left", "right", "up")) {
        $animations["idle_$direction"] = [ordered]@{ frames=@("idle_${direction}_0.png", "idle_${direction}_1.png"); frameRate=2; repeat=-1 }
        $animations["walk_$direction"] = [ordered]@{ frames=@("walk_${direction}_0.png", "walk_${direction}_1.png", "walk_${direction}_2.png", "walk_${direction}_3.png"); frameRate=8; repeat=-1 }
        $animations["talk_$direction"] = [ordered]@{ frames=@("talk_${direction}_0.png", "talk_${direction}_1.png"); frameRate=4; repeat=-1 }
    }
    $animations["interact_down"] = [ordered]@{ frames=@("interact_down_0.png", "interact_down_1.png"); frameRate=4; repeat=0 }
    $animations["breathe_down"] = [ordered]@{ frames=@("breathe_down_0.png", "breathe_down_1.png"); frameRate=1; repeat=-1 }
    $animations["sit_down"] = [ordered]@{ frames=@("sit_down_0.png"); frameRate=1; repeat=0 }
    $animations["phone_down"] = [ordered]@{ frames=@("phone_down_0.png"); frameRate=1; repeat=0 }
    $animations["concerned_down"] = [ordered]@{ frames=@("concerned_down_0.png"); frameRate=1; repeat=0 }
    $animations["happy_down"] = [ordered]@{ frames=@("happy_down_0.png"); frameRate=1; repeat=0 }
    $animations | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $characterDir ($spec.Name + "-animations.json")) -Encoding UTF8
}

$manifest = [ordered]@{
    generatedAt = (Get-Date).ToString("o")
    cell = [ordered]@{ width=32; height=48 }
    characters = @($characters | ForEach-Object { $_.Name })
    frameCountPerCharacter = $framePlan.Count
    directions = @("down", "left", "right", "up")
    notes = @(
        "Sky preserves center-parted black hair, round glasses, dusty-rose cardigan, cream shirt, and sky-blue apron.",
        "Mira is an adult neko-maid librarian with cat ears, tail, glasses, navy-and-cream uniform, teal ribbon, and bell.",
        "All PNGs use genuine alpha and exact 32x48 frame cells.",
        "All sheets use an 8-column grid and nearest-neighbour pixel construction.",
        "Version 1.1 adds true 32x48 single-pixel lighting, fabric, face, and identity accents for world-art compatibility."
    )
}
New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $OutputRoot "production-sprite-manifest.json") -Encoding UTF8

Write-Output "Generated $($characters.Count) character sheets with $($framePlan.Count) frames each at $OutputRoot"
