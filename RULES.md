# Ticket Naming & Categorization Rules

## Naming Rules

- Start the summary with the affected system or application (e.g., "Outlook", "VPN", "Printer")
- Follow with a dash and a concise description of the issue
- Use the format: `[System/App] - [Brief description]`
- Remove greetings, pleasantries, and filler words from the original subject
- Keep summaries under 80 characters
- Use sentence case (capitalize first word only, plus proper nouns)

### Special Cases

- New user setup: `New User Setup - [Full Name]`
- User offboarding: `User Offboarding - [Full Name]`
- Password reset: `Password Reset - [Username or Full Name]`
- Hardware request: `Hardware Request - [Item] for [User]`

## Category Rules

Assign the category based on the primary topic of the ticket. Use the mapping below as guidance:

| If the ticket mentions...                          | Assign category...          |
|----------------------------------------------------|-----------------------------|
| Email, Outlook, Exchange, mailbox, calendar         | Email & Collaboration       |
| Network, WiFi, VPN, internet, DNS, firewall         | Networking & Connectivity   |
| Printer, scanning, fax                              | Printing & Peripherals      |
| Password, MFA, login, locked out, permissions        | User Account & Access       |
| New user, onboarding, new hire, new starter          | User Onboarding             |
| Termination, offboarding, leaver, disable account    | User Offboarding            |
| Backup, restore, disaster recovery                   | Backup & Recovery           |
| Slow, performance, crash, freeze, blue screen        | Hardware                    |
| Software install, update, license, application       | Software & Licensing        |
| Virus, malware, phishing, breach, security           | Security & Compliance       |
| Monitor, keyboard, mouse, laptop, desktop, dock      | Hardware                    |

If none of the above clearly match, use `General Support`.

## Examples

**Input:** "hey my outlook isnt working i cant send emails plz help"
**Output:** Summary: `Outlook - Unable to send emails` | Category: `Email & Collaboration`

**Input:** "Need to set up a new laptop and accounts for John Smith starting Monday"
**Output:** Summary: `New User Setup - John Smith` | Category: `User Onboarding`

**Input:** "the internet keeps dropping out in the warehouse"
**Output:** Summary: `Network - Intermittent connectivity loss in warehouse` | Category: `Networking & Connectivity`

**Input:** "Can you install Adobe Acrobat Pro on my machine?"
**Output:** Summary: `Software Install - Adobe Acrobat Pro` | Category: `Software & Licensing`
