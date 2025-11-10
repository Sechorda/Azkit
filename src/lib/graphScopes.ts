// Graph permission scope presets for Connect-MgGraph interactive login.
// Default admin-focused scopes (modify users, groups, calendars, files, directory objects)
export const DEFAULT_GRAPH_SCOPES: string[] = [
  "User.ReadWrite.All",
  "Group.ReadWrite.All",
  "Directory.ReadWrite.All",
  "Calendars.ReadWrite",
  "Files.ReadWrite.All"
];

// Comprehensive list of available Microsoft Graph scopes
export const ALL_AVAILABLE_SCOPES: string[] = [
  // User and Profile
  "User.Read",
  "User.ReadWrite",
  "User.ReadBasic.All",
  "User.Read.All",
  "User.ReadWrite.All",
  "User.Invite.All",
  "User.Export.All",
  "User.ManageIdentities.All",

  // Groups
  "Group.Read.All",
  "Group.ReadWrite.All",
  "Group.Create",
  "GroupMember.Read.All",
  "GroupMember.ReadWrite.All",

  // Directory
  "Directory.Read.All",
  "Directory.ReadWrite.All",
  "Directory.AccessAsUser.All",

  // Applications
  "Application.Read.All",
  "Application.ReadWrite.All",
  "Application.ReadWrite.OwnedBy",

  // Calendars
  "Calendars.Read",
  "Calendars.ReadWrite",
  "Calendars.Read.Shared",
  "Calendars.ReadWrite.Shared",

  // Files and Sites
  "Files.Read",
  "Files.ReadWrite",
  "Files.Read.All",
  "Files.ReadWrite.All",
  "Sites.Read.All",
  "Sites.ReadWrite.All",
  "Sites.Manage.All",
  "Sites.FullControl.All",

  // Mail
  "Mail.Read",
  "Mail.ReadWrite",
  "Mail.Read.Shared",
  "Mail.ReadWrite.Shared",
  "Mail.Send",
  "Mail.Send.Shared",
  "MailboxSettings.Read",
  "MailboxSettings.ReadWrite",

  // Contacts
  "Contacts.Read",
  "Contacts.ReadWrite",
  "Contacts.Read.Shared",
  "Contacts.ReadWrite.Shared",

  // People
  "People.Read",
  "People.Read.All",

  // Notes
  "Notes.Read",
  "Notes.ReadWrite",
  "Notes.Create",
  "Notes.ReadWrite.CreatedByApp",
  "Notes.Read.All",
  "Notes.ReadWrite.All",

  // Tasks
  "Tasks.Read",
  "Tasks.ReadWrite",
  "Tasks.Read.Shared",
  "Tasks.ReadWrite.Shared",

  // Devices
  "Device.Read",
  "Device.Read.All",
  "Device.ReadWrite.All",

  // Identity and Access
  "IdentityRiskEvent.Read.All",
  "IdentityRiskyUser.Read.All",
  "IdentityRiskyUser.ReadWrite.All",
  "IdentityUserFlow.Read.All",
  "IdentityUserFlow.ReadWrite.All",

  // Policies
  "Policy.Read.All",
  "Policy.ReadWrite.ApplicationConfiguration",
  "Policy.ReadWrite.AuthenticationFlows",
  "Policy.ReadWrite.AuthenticationMethod",

  // Reports
  "Reports.Read.All",
  "AuditLog.Read.All",

  // Security
  "SecurityEvents.Read.All",
  "SecurityEvents.ReadWrite.All",
  "ThreatIndicators.ReadWrite.OwnedBy",

  // App Role Assignments
  "AppRoleAssignment.ReadWrite.All",

  // Service Principal
  "ServicePrincipalEndpoint.Read.All",
  "ServicePrincipalEndpoint.ReadWrite.All",

  // Teams
  "Team.ReadBasic.All",
  "Team.Read.All",
  "Team.ReadWrite.All",
  "TeamSettings.Read.All",
  "TeamSettings.ReadWrite.All",
  "Channel.ReadBasic.All",
  "Channel.Read.All",
  "Channel.ReadWrite.All",
  "ChannelSettings.Read.All",
  "ChannelSettings.ReadWrite.All",

  // Chat and Calls
  "Chat.Read",
  "Chat.ReadWrite",
  "Chat.Read.All",
  "Chat.ReadWrite.All",
  "Calls.Read.All",
  "Calls.ReadWrite.All",

  // Education
  "EduAssignments.Read",
  "EduAssignments.ReadWrite",
  "EduRoster.Read",
  "EduRoster.ReadWrite",

  // Print
  "PrintJob.Read.All",
  "PrintJob.ReadWrite.All",
  "Printer.Read.All",
  "Printer.ReadWrite.All"
];

// Get all optional scopes (everything except defaults)
export const OPTIONAL_GRAPH_SCOPES = ALL_AVAILABLE_SCOPES.filter(
  scope => !DEFAULT_GRAPH_SCOPES.includes(scope)
);

// Utility to merge selected optional scopes with defaults
export function buildScopes(selectedOptional: Set<string>): string[] {
  return [
    ...DEFAULT_GRAPH_SCOPES,
    ...OPTIONAL_GRAPH_SCOPES.filter(s => selectedOptional.has(s))
  ];
}
