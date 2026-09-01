param(
    [string]$OutputRoot = "assets\production\style-checks"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot

function Resolve-Asset([string]$relativePath) {
    $path = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing style-check asset: $relativePath"
    }
    return $path
}

function Load-Bitmap([string]$relativePath) {
    return [System.Drawing.Bitmap]::new((Resolve-Asset $relativePath))
}

function Draw-Tiled($graphics, $bitmap, [System.Drawing.Rectangle]$area, [int]$tileSize = 32) {
    for ($y = $area.Top; $y -lt $area.Bottom; $y += $tileSize) {
        for ($x = $area.Left; $x -lt $area.Right; $x += $tileSize) {
            $graphics.DrawImage($bitmap, [System.Drawing.Rectangle]::new($x, $y, $tileSize, $tileSize))
        }
    }
}

function Draw-Nearest($graphics, $bitmap, [System.Drawing.Rectangle]$destination) {
    $oldMode = $graphics.InterpolationMode
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.DrawImage($bitmap, $destination, 0, 0, $bitmap.Width, $bitmap.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.InterpolationMode = $oldMode
}

function Draw-Label($graphics, [string]$text, [int]$x, [int]$y, [int]$size = 13, [bool]$bold = $false) {
    $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
    $font = [System.Drawing.Font]::new("Segoe UI", $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#F6EBD8"))
    $graphics.DrawString($text, $font, $brush, $x, $y)
    $font.Dispose()
    $brush.Dispose()
}

function Draw-Character($graphics, [string]$name, [int]$x, [int]$y, [int]$scale = 2) {
    $relative = "assets\production\characters\$name\frames\idle_down_0.png"
    $sprite = Load-Bitmap $relative
    Draw-Nearest $graphics $sprite ([System.Drawing.Rectangle]::new($x, $y, 32 * $scale, 48 * $scale))
    $sprite.Dispose()
}

New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot $OutputRoot) | Out-Null

$canvas = [System.Drawing.Bitmap]::new(1120, 680, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#172638"))
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

Draw-Label $graphics "PACETOWN CHARACTER / WORLD COMPATIBILITY" 32 18 22 $true
Draw-Label $graphics "Runtime-size scene test • 32px world grid • 32x48 character frames • integer scaling only" 34 48 13 $false

$exterior = [System.Drawing.Rectangle]::new(32, 86, 512, 544)
$interior = [System.Drawing.Rectangle]::new(576, 86, 512, 544)
$panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#263A4C"))
$graphics.FillRectangle($panelBrush, $exterior)
$graphics.FillRectangle($panelBrush, $interior)
$panelBrush.Dispose()

Draw-Label $graphics "CAMPUS + RECOVERY GARDEN" 52 100 16 $true
Draw-Label $graphics "Ghost Data 32px ground • Pix-Quest nature at exact 2x" 52 123 12 $false

$grass = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Floor Tiles 32x32\A Grass.png"
$concrete = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Floor Tiles 32x32\Concrete.png"
$outsideArea = [System.Drawing.Rectangle]::new(48, 150, 480, 456)
Draw-Tiled $graphics $grass $outsideArea 32
$pathArea = [System.Drawing.Rectangle]::new(240, 150, 96, 456)
Draw-Tiled $graphics $concrete $pathArea 32

$treeTop = Load-Bitmap "assets\third-party\custom-license\pix-quest-free\Pix-Quest Tileset Free v1.1\v1.0\Pix-Quest Tiles Sorted and Labeled\Scenery Tiles, Item Sprites, and Animations\Tree_A top.png"
$treeBottom = Load-Bitmap "assets\third-party\custom-license\pix-quest-free\Pix-Quest Tileset Free v1.1\v1.0\Pix-Quest Tiles Sorted and Labeled\Scenery Tiles, Item Sprites, and Animations\Tree_A bottom.png"
$bush = Load-Bitmap "assets\third-party\custom-license\pix-quest-free\Pix-Quest Tileset Free v1.1\v1.0\Pix-Quest Tiles Sorted and Labeled\Scenery Tiles, Item Sprites, and Animations\Small Bush.png"
foreach ($tree in @(@(78,190), @(432,184), @(82,432), @(428,438))) {
    Draw-Nearest $graphics $treeBottom ([System.Drawing.Rectangle]::new($tree[0], $tree[1] + 32, 32, 32))
    Draw-Nearest $graphics $treeTop ([System.Drawing.Rectangle]::new($tree[0], $tree[1], 32, 32))
}
foreach ($plant in @(@(132,230), @(392,280), @(124,500), @(390,526))) {
    Draw-Nearest $graphics $bush ([System.Drawing.Rectangle]::new($plant[0], $plant[1], 32, 32))
}
Draw-Character $graphics "player" 166 350 1
Draw-Character $graphics "sky" 272 306 1
Draw-Character $graphics "mira" 386 370 1
Draw-Label $graphics "Player" 160 400 12 $true
Draw-Label $graphics "Sky" 276 356 12 $true
Draw-Label $graphics "Mira" 382 420 12 $true

Draw-Label $graphics "STUDENT COMMON ROOM" 596 100 16 $true
Draw-Label $graphics "Ghost Data school props • PaceTown warm-neutral grade" 596 123 12 $false

$wood = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Floor Tiles 32x32\Wood Tile Pattern 1.png"
$insideArea = [System.Drawing.Rectangle]::new(592, 150, 480, 456)
Draw-Tiled $graphics $wood $insideArea 32

$wallBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#D9C9AA"))
$trimBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#765444"))
$graphics.FillRectangle($wallBrush, 592, 150, 480, 116)
$graphics.FillRectangle($trimBrush, 592, 250, 480, 16)
$wallBrush.Dispose()
$trimBrush.Dispose()

$chalkLeft = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Classroom 32x32\Chalkboard (Left Side).png"
$chalkRight = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Classroom 32x32\Chalkboard (Right Side).png"
Draw-Nearest $graphics $chalkLeft ([System.Drawing.Rectangle]::new(724, 194, 32, 32))
Draw-Nearest $graphics $chalkRight ([System.Drawing.Rectangle]::new(756, 194, 32, 32))

$bookshelfLeft = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Classroom 32x32\Bookshelf L1.png"
$bookshelfRight = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Classroom 32x32\Bookshelf R1.png"
Draw-Nearest $graphics $bookshelfLeft ([System.Drawing.Rectangle]::new(628, 194, 32, 32))
Draw-Nearest $graphics $bookshelfRight ([System.Drawing.Rectangle]::new(1024, 194, 32, 32))

$desk = Load-Bitmap "assets\third-party\cc-by-sa-4.0\ghost-data-school\16 Bit School Asset Pack\Classroom 32x32\Small Wooden Desk.png"
foreach ($position in @(@(630,350), @(780,340), @(930,360), @(680,500), @(880,510))) {
    Draw-Nearest $graphics $desk ([System.Drawing.Rectangle]::new($position[0], $position[1], 32, 32))
}
Draw-Character $graphics "goh" 632 300 1
Draw-Character $graphics "sky" 782 290 1
Draw-Character $graphics "mira" 932 310 1
Draw-Label $graphics "Goh" 636 334 12 $true
Draw-Label $graphics "Sky" 786 324 12 $true
Draw-Label $graphics "Mira" 932 344 12 $true

foreach ($item in @($grass, $concrete, $treeTop, $treeBottom, $bush, $wood, $chalkLeft, $chalkRight, $bookshelfLeft, $bookshelfRight, $desk)) {
    $item.Dispose()
}

$outputPath = Join-Path (Join-Path $projectRoot $OutputRoot) "pacetown-character-world-compatibility.png"
$canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$canvas.Dispose()

# A second board magnifies identity and single-pixel detail without pretending
# the enlarged size is the runtime scale.
$closeups = [System.Drawing.Bitmap]::new(1120, 420, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$closeGraphics = [System.Drawing.Graphics]::FromImage($closeups)
$closeGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#172638"))
$closeGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$closeGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
Draw-Label $closeGraphics "PACETOWN PRODUCTION CHARACTER LOCKS" 32 18 22 $true
Draw-Label $closeGraphics "4x inspection only • every runtime frame remains 32x48 with genuine transparency" 34 48 13 $false

$names = @("player", "mira", "kai", "sol", "sky", "goh")
$labels = @("Player", "Mira", "Kai", "Sol", "Sky", "Goh")
for ($i = 0; $i -lt $names.Count; $i++) {
    $x = 48 + ($i * 176)
    $cardBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#263A4C"))
    $closeGraphics.FillRectangle($cardBrush, $x, 86, 144, 286)
    $cardBrush.Dispose()
    Draw-Character $closeGraphics $names[$i] ($x + 8) 106 4
    Draw-Label $closeGraphics $labels[$i] ($x + 12) 306 16 $true
}
Draw-Label $closeGraphics "Sky: centre-parted black hair • round glasses • dusty rose • cream • sky-blue apron" 48 386 12 $false
Draw-Label $closeGraphics "Mira: adult neko-maid librarian • glasses • ears + tail • navy/cream • teal bow + bell" 592 386 12 $false

$closeupPath = Join-Path (Join-Path $projectRoot $OutputRoot) "pacetown-character-closeups.png"
$closeups.Save($closeupPath, [System.Drawing.Imaging.ImageFormat]::Png)
$closeGraphics.Dispose()
$closeups.Dispose()

Write-Output "Generated $outputPath"
Write-Output "Generated $closeupPath"
