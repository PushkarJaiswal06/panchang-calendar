Add-Type -AssemblyName System.Runtime.WindowsRuntime
function Await($op) { [System.WindowsRuntimeSystemExtensions]::AsTask($op).GetAwaiter().GetResult() }
$path = 'c:\Users\Pushkar Jaiswal\Downloads\indian-traditional-panchang-calendar\src\data\calendar\Screenshot (394).png'
$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($path))
$stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read))
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream))
$bitmap = Await ($decoder.GetSoftwareBitmapAsync())
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
$result = Await ($engine.RecognizeAsync($bitmap))
$result.Text
