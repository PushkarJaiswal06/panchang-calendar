Add-Type -AssemblyName System.Runtime.WindowsRuntime
function Await($op) { [System.WindowsRuntimeSystemExtensions]::AsTask($op).GetAwaiter().GetResult() }
[Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages | Select-Object LanguageTag,DisplayName | Format-Table -AutoSize
