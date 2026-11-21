' Silent background launcher for OBS Social Widget Live Sync Server (Windows)
' Double-click to run server.mjs without a visible console window.
Option Explicit

Dim fso, shell, scriptDir, nodeCheck, cmd
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = scriptDir

' Check if Node.js is available
On Error Resume Next
nodeCheck = shell.Run("cmd /c where node >nul 2>nul", 0, True)
If Err.Number <> 0 Or nodeCheck <> 0 Then
  MsgBox "Node.js 18+ was not found in PATH." & vbCrLf & _
         "Install Node.js from https://nodejs.org/ or use index.html directly in OBS as a Local File.", _
         vbExclamation, "OBS Social Widget"
  WScript.Quit 1
End If
On Error GoTo 0

' Start server.mjs hidden (window style 0) and write stdout/stderr to obs-widget.log
cmd = "cmd /c ""cd /d """ & scriptDir & """ && node server.mjs > obs-widget.log 2>&1"""
shell.Run cmd, 0, False
