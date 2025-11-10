# AzGraphBackend.ps1
# Local PowerShell HTTP backend that connects to Microsoft Graph once (interactive)
# and reuses the same session to execute whitelisted MgGraph commands.
# Run with: pwsh -File ./scripts/AzGraphBackend.ps1 -Port 8080
# Endpoints:
#   - GET    /connect      -> triggers Connect-MgGraph interactive login (popup/browser/device code)
#   - POST   /run          -> body { "cmd": "Get-MgUser", "params": { "Top": 5 } }
#   - GET    /status       -> returns connection status/context
#   - GET    /env          -> returns environment info and mode (Server or Client)
#   - DELETE /disconnect   -> disconnects MgGraph (optional)
#   - OPTIONS /*           -> CORS preflight
# CORS: default origin http://localhost:5173 (change via -AllowedOrigins)

Param(
  [int]$Port = 8080,
  [string[]]$Scopes = @("User.Read.All"),
  [string[]]$AllowedOrigins = @("http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3001")
)

# ===== Configuration =====
# Whitelisted commands and allowed parameters (extend as needed)
$Script:CmdWhitelist = @{
  "Get-MgUser"             = @{ AllowedParams = @("Top","Filter","Select","Search","ConsistencyLevel") }
  "Get-MgGroup"            = @{ AllowedParams = @("Top","Filter","Select") }
  "Get-MgGroupMember"      = @{ AllowedParams = @("GroupId","Top","Filter","Select") }
  "Get-MgServicePrincipal" = @{ AllowedParams = @("Top","Filter","Select") }
  "Get-MgDevice"           = @{ AllowedParams = @("Top","Filter","Select") }
  "Get-MgDriveItem"        = @{ AllowedParams = @("DriveId","ItemId","Top","Filter","Select") }
}

# ===== Globals =====
$Script:Listener = $null

# ===== Helpers =====
function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $ts = (Get-Date).ToString("s")
  Write-Host "[$ts][$Level] $Message"
}

function Ensure-GraphModule {
  try {
    Import-Module Microsoft.Graph -ErrorAction Stop | Out-Null
    return $true
  } catch {
    Write-Log "Microsoft.Graph module not found. Install with: Install-Module Microsoft.Graph -Scope AllUsers" "ERROR"
    return $false
  }
}

function Is-Connected {
  try {
    $ctx = Get-MgContext -ErrorAction Stop
    return ($null -ne $ctx)
  } catch { return $false }
}

function Add-CorsHeaders {
  param([System.Net.HttpListenerResponse]$Response, [System.Net.HttpListenerRequest]$Request = $null)
  
  # Allow all origins for local development
  if ($Request -and $Request.Headers["Origin"]) {
    $origin = $Request.Headers["Origin"]
    if ($AllowedOrigins -contains $origin) {
      $Response.Headers["Access-Control-Allow-Origin"] = $origin
    } else {
      # For local development, be permissive with localhost/127.0.0.1
      if ($origin -match "^https?://(localhost|127\.0\.0\.1)(:\d+)?$") {
        $Response.Headers["Access-Control-Allow-Origin"] = $origin
      } else {
        $Response.Headers["Access-Control-Allow-Origin"] = $AllowedOrigins[0]
      }
    }
  } else {
    # Fallback to permissive for local dev
    $Response.Headers["Access-Control-Allow-Origin"] = "*"
  }
  
  $Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
  $Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
  $Response.Headers["Access-Control-Max-Age"] = "3600"
}

function Write-JsonResponse {
  param(
    [System.Net.HttpListenerResponse]$Response,
    [Parameter(Mandatory=$true)]$Object,
    [int]$StatusCode = 200,
    [string]$Tag = "",
    [System.Net.HttpListenerRequest]$Request = $null
  )
  Add-CorsHeaders -Response $Response -Request $Request
  $Response.ContentType = "application/json"
  $Response.StatusCode = $StatusCode
  $json = $Object | ConvertTo-Json -Depth 12

  # Log response JSON to terminal
  try {
    $preview = if ($null -ne $json -and $json.Length -gt 4000) { $json.Substring(0,4000) + "... (truncated)" } else { $json }
    if ([string]::IsNullOrWhiteSpace($Tag)) {
      Write-Host "[API] $StatusCode => $preview"
    } else {
      Write-Host "[API] $Tag $StatusCode => $preview"
    }
  } catch {}

  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Read-RequestBodyJson {
  param([System.Net.HttpListenerRequest]$Request)
  if (-not $Request.HasEntityBody) { return $null }
  $sr = New-Object IO.StreamReader($Request.InputStream, $Request.ContentEncoding)
  try {
    $raw = $sr.ReadToEnd()
  } finally {
    $sr.Close()
  }
  if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
  try {
    return ConvertFrom-Json -InputObject $raw
  } catch {
    throw "Invalid JSON body."
  }
}

function Handle-Connect {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response
  Write-Log "Received /connect request" "INFO"
  
  try {
    Write-Log "Checking if already connected..." "INFO"
    if (Is-Connected) {
      Write-Log "Already connected, getting context..." "INFO"
      $ctx = Get-MgContext
      Write-JsonResponse -Response $resp -Object @{ ok = $true; alreadyConnected = $true; context = ($ctx | Select-Object Account, TenantId, AppName, Scopes) } -Tag 'GET /connect already connected'
      return
    }
    
    Write-Log "Not connected. Sending manual authentication instructions..." "INFO"
    
    # Return immediate response with manual auth instructions
    Write-JsonResponse -Response $resp -Object @{ 
      ok = $false; 
      status = "auth_required";
      message = "Authentication required. Please run 'Connect-MgGraph -Scopes $($Scopes -join ',')' in the PowerShell console where this script is running, then call /status to verify connection."
      command = "Connect-MgGraph -Scopes $($Scopes -join ',')"
    } -StatusCode 202 -Tag 'GET /connect requires manual auth'
    
    Write-Log "===== MANUAL AUTHENTICATION REQUIRED =====" "INFO"
    Write-Log "Please run the following command in this console:" "INFO"
    Write-Log "Connect-MgGraph -Scopes $($Scopes -join ',')" "INFO"
    Write-Log "Then call /status endpoint to verify the connection." "INFO"
    Write-Log "===============================================" "INFO"
  } catch {
    Write-Log "Error in Handle-Connect: $($_.Exception.Message)" "ERROR"
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = $_.Exception.Message } -StatusCode 500 -Tag 'GET /connect error'
  }
}

function Handle-ConnectPost {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response

  if (-not (Ensure-GraphModule)) {
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = "Microsoft.Graph module is missing. Install-Module Microsoft.Graph" } -StatusCode 500 -Tag 'POST /connect error'
    return
  }

  try {
    $body = Read-RequestBodyJson -Request $Context.Request
    $scopes = $null
    if ($body -and $body.PSObject.Properties.Name -contains "scopes") {
      $s = $body.scopes
      if ($s -is [string]) { $scopes = @($s) }
      elseif ($s -is [System.Collections.IEnumerable]) { $scopes = @($s) }
    }
    if (-not $scopes -or $scopes.Count -eq 0) {
      $scopes = $Scopes
    }

    Write-Log "Starting authentication with custom scopes: $($scopes -join ', ')" "INFO"

    # Run authentication directly in the main PowerShell process to preserve user session
    try {
      Write-Log "Attempting interactive authentication with custom scopes..." "INFO"
      Connect-MgGraph -Scopes $scopes -NoWelcome -ErrorAction Stop
      Write-Log "Interactive authentication successful" "INFO"
    } catch {
      Write-Log "Interactive login failed: $($_.Exception.Message). Trying device code..." "WARN"
      try {
        Connect-MgGraph -Scopes $scopes -UseDeviceCode -NoWelcome -ErrorAction Stop
        Write-Log "Device code authentication successful" "INFO"
      } catch {
        Write-Log "Device code authentication also failed: $($_.Exception.Message)" "ERROR"
        throw "Authentication failed: $($_.Exception.Message)"
      }
    }

    $ctx = Get-MgContext
    Write-JsonResponse -Response $resp -Object @{ ok = $true; context = ($ctx | Select-Object Account, TenantId, AppName, Scopes) } -Tag 'POST /connect'
  } catch {
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = $_.Exception.Message } -StatusCode 500 -Tag 'POST /connect error'
  }
}

function Invoke-WhitelistedGraphCommand {
  param(
    [Parameter(Mandatory=$true)][string]$Command,
    [hashtable]$Params
  )
  if (-not $Script:CmdWhitelist.ContainsKey($Command)) {
    return @{ ok = $false; error = "Command '$Command' not allowed." }
  }
  if (-not (Is-Connected)) {
    return @{ ok = $false; error = "Not connected. Call /connect first." }
  }
  $allowed = $Script:CmdWhitelist[$Command].AllowedParams
  $safeParams = @{}
  if ($Params) {
    foreach ($k in $Params.Keys) {
      if ($allowed -contains $k) {
        $safeParams[$k] = $Params[$k]
      }
    }
  }
  # Special header for advanced query consistency if provided
  if ($safeParams.ContainsKey("ConsistencyLevel") -and $safeParams["ConsistencyLevel"] -eq "eventual") {
    $null = Set-Item -Path Env:ConsistencyLevel -Value "eventual"
  } else {
    if (Test-Path Env:ConsistencyLevel) { Remove-Item Env:ConsistencyLevel -ErrorAction SilentlyContinue }
  }
  try {
    $raw = & $Command @safeParams | ConvertTo-Json -Depth 12
    $data = if ($raw) { ConvertFrom-Json $raw } else { $null }
    return @{ ok = $true; data = $data }
  } catch {
    return @{
      ok = $false
      error = $_.Exception.Message
      details = @{
        category = $_.CategoryInfo.Category
        fullyQualifiedErrorId = $_.FullyQualifiedErrorId
        stack = $_.ScriptStackTrace
      }
    }
  }
}

function Handle-Run {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response
  if (-not (Ensure-GraphModule)) {
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = "Microsoft.Graph module is missing. Install-Module Microsoft.Graph" } -StatusCode 500
    return
  }
  try {
    $body = Read-RequestBodyJson -Request $Context.Request
    if (-not $body) { throw "Empty body." }
    $cmd = $body.cmd
    $params = $body.params
    if (-not $cmd) { throw "Missing 'cmd'." }
    $result = Invoke-WhitelistedGraphCommand -Command $cmd -Params $params
    $status = if ($result.ok) { 200 } else { 400 }
    Write-JsonResponse -Response $resp -Object $result -StatusCode $status -Tag 'POST /run'
  } catch {
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = $_.Exception.Message } -StatusCode 400 -Tag 'POST /run error'
  }
}

function Handle-Local {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response
  try {
    $body = Read-RequestBodyJson -Request $Context.Request
    if (-not $body) { throw "Empty body." }
    $command = $body.command
    if (-not $command) { throw "Missing 'command'." }
    
    Write-Log "Executing local command: $command" "INFO"
    
    # Execute the command in the current PowerShell session
    try {
      # Capture all output streams
      $output = @()
      $errors = @()
      $warnings = @()
      
      # Create a script block from the command and execute it in the global scope
      $scriptBlock = [ScriptBlock]::Create($command)
      $result = & $scriptBlock 2>&1
      
      # Process the result streams
      foreach ($item in $result) {
        if ($item -is [System.Management.Automation.ErrorRecord]) {
          $errors += $item.ToString()
        } elseif ($item -is [System.Management.Automation.WarningRecord]) {
          $warnings += $item.ToString()
        } else {
          $output += $item
        }
      }
      
      $response = @{
        ok = $true
        output = $output
        errors = $errors
        warnings = $warnings
        hasErrors = $errors.Count -gt 0
      }
      
      Write-JsonResponse -Response $resp -Object $response -StatusCode 200 -Tag 'POST /local'
    } catch {
      Write-Log "Error executing command: $($_.Exception.Message)" "ERROR"
      Write-JsonResponse -Response $resp -Object @{ 
        ok = $false; 
        error = $_.Exception.Message;
        details = @{
          category = $_.CategoryInfo.Category
          fullyQualifiedErrorId = $_.FullyQualifiedErrorId
          stack = $_.ScriptStackTrace
        }
      } -StatusCode 400 -Tag 'POST /local error'
    }
  } catch {
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = $_.Exception.Message } -StatusCode 400 -Tag 'POST /local parse error'
  }
}

function Handle-Status {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response
  $connected = Is-Connected
  $ctx = $null
  if ($connected) {
    try { $ctx = Get-MgContext | Select-Object Account, TenantId, AppName, Scopes } catch {}
  }
  Write-JsonResponse -Response $resp -Object @{ ok = $true; connected = $connected; context = $ctx } -Tag 'GET /status'
}

function Handle-Env {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response
  try {
    $isWindows = $IsWindows
    $mode = "Client"
    $details = @{}

    if ($isWindows) {
      try {
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop
        # ProductType: 1 = Workstation, 2 = Domain Controller, 3 = Server
        $pt = [int]$os.ProductType
        $caption = [string]$os.Caption
        $version = [string]$os.Version
        $build = [string]$os.BuildNumber
        $details = @{
          caption = $caption
          version = $version
          build = $build
          productType = $pt
        }
        if ($pt -eq 2 -or $pt -eq 3 -or $caption -match "Server") {
          $mode = "Server"
        }
      } catch {
        # If CIM fails, best-effort using registry
        try {
          $edition = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -ErrorAction SilentlyContinue).EditionID
          if ($edition -match "Server") { $mode = "Server" }
          $details.edition = $edition
        } catch {}
      }
    } else {
      # Non-Windows treated as Client
      $details.platform = [System.Environment]::OSVersion.Platform.ToString()
    }

    Write-JsonResponse -Response $resp -Object @{ ok = $true; mode = $mode; details = $details } -Tag 'GET /env'
  } catch {
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = $_.Exception.Message } -StatusCode 500 -Tag 'GET /env error'
  }
}

function Handle-Disconnect {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response
  try {
    if (Is-Connected) { Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null }
    Write-JsonResponse -Response $resp -Object @{ ok = $true } -Tag 'DELETE /disconnect'
  } catch {
    Write-JsonResponse -Response $resp -Object @{ ok = $false; error = $_.Exception.Message } -StatusCode 500 -Tag 'DELETE /disconnect error'
  }
}

function Handle-Options {
  param([System.Net.HttpListenerContext]$Context)
  $resp = $Context.Response
  Add-CorsHeaders -Response $resp
  $resp.StatusCode = 204
  $resp.Close()
}

function Route-Request {
  param([System.Net.HttpListenerContext]$Context)
  $req = $Context.Request
  $resp = $Context.Response
  $path = $req.Url.AbsolutePath.ToLowerInvariant()

  try {
    switch ($req.HttpMethod) {
      "OPTIONS" { Handle-Options -Context $Context; return }
      "GET" {
        switch ($path) {
          "/connect" { Handle-Connect -Context $Context; break }
          "/status"  { Handle-Status -Context $Context; break }
          "/env"     { Handle-Env -Context $Context; break }
          default {
            Write-JsonResponse -Response $resp -Object @{ ok = $false; error = "Not Found" } -StatusCode 404
          }
        }
      }
      "POST" {
        switch ($path) {
          "/connect" { Handle-ConnectPost -Context $Context; break }
          "/run" { Handle-Run -Context $Context; break }
          "/local" { Handle-Local -Context $Context; break }
          default {
            Write-JsonResponse -Response $resp -Object @{ ok = $false; error = "Not Found" } -StatusCode 404
          }
        }
      }
      "DELETE" {
        switch ($path) {
          "/disconnect" { Handle-Disconnect -Context $Context; break }
          default {
            Write-JsonResponse -Response $resp -Object @{ ok = $false; error = "Not Found" } -StatusCode 404
          }
        }
      }
      default {
        Write-JsonResponse -Response $resp -Object @{ ok = $false; error = "Method Not Allowed" } -StatusCode 405
      }
    }
  } catch {
    try {
      Write-JsonResponse -Response $resp -Object @{ ok = $false; error = $_.Exception.Message } -StatusCode 500
    } catch {}
  } finally {
    try { $resp.Close() } catch {}
  }
}

function Start-HttpServer {
  param([int]$Port)
  $prefix = "http://127.0.0.1:$Port/"
  $listener = [System.Net.HttpListener]::new()
  $listener.Prefixes.Add($prefix)
  $listener.Start()
  $Script:Listener = $listener
  Write-Log "Listening on $prefix"
  try {
    while ($listener.IsListening) {
      $context = $listener.GetContext()
      Route-Request -Context $context
    }
  } finally {
    try { $listener.Stop() } catch {}
    try { $listener.Close() } catch {}
  }
}

function Stop-HttpServer {
  if ($Script:Listener) {
    try { $Script:Listener.Stop() } catch {}
    try { $Script:Listener.Close() } catch {}
    $Script:Listener = $null
  }
}

# Graceful shutdown on Ctrl+C / process exit
$null = Register-EngineEvent PowerShell.Exiting -Action {
  Write-Log "Shutting down..." "INFO"
  Stop-HttpServer
}

# ===== Main =====
Write-Log "AzGraphBackend starting..."
Write-Log "Allowed origin: $($AllowedOrigins -join ', ')"
Write-Log "Scopes: $($Scopes -join ', ')"
Start-HttpServer -Port $Port
