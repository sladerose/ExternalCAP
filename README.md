# External CA - Operations Dashboard & Sites Down

This project is a SAP CAP (Cloud Application Programming Model) application deployed to SAP BTP Cloud Foundry. It provides an Overview Page (OVP) dashboard and a "Sites Down" view for monitoring external CA activities.

## Deployment on SAP BTP Cloud Foundry

### Final Application URL
`https://ath-internal-eu-development-dev-externalca-approuter.cfapps.eu10-004.hana.ondemand.com/`

---

## Infrastructure and Architecture

The application uses a standalone AppRouter for authentication (XSUAA) and routing.

```
┌─────────────────────┐
│   AppRouter         │ ← Entry Point (XSUAA Auth)
│  (externalca-       │
│   approuter)        │
└──────────┬──────────┘
           │
           ├─── /odata/v4/external/* → Backend Service (externalca-srv)
           │
           └─── /* → HTML5 Repository Runtime
                     ├─ /externalcaovp-1.0.0/ (Operations Dashboard)
                     └─ /externalcasitesdown-1.0.0/ (Sites Down View)
```

## Key Technical Decisions & Fixes

### 1. Authentication Configuration
Configured `xs-security.json` with wildcard `redirect-uris` to ensure seamless login flow across different Cloud Foundry environments.

### 2. DateTime Formatting
Handled Supabase/Postgres timestamp precision issues:
- **Backend**: Standardized on `.toISOString()` in `srv/external-service.js`.
- **Frontend**: Implemented a custom `formatDate` formatter in UI5 controllers to clean microsecond precision and format dates for the UI.

### 3. OData V4 Compatibility
- Used `targetType: 'any'` in UI5 bindings to prevent automatic (and failing) OData V2-style type conversions.
- Removed legacy OData V2 event listeners (`attachRequestCompleted`, `attachRequestFailed`) from controllers.

## Development and Deployment

### Prerequisites
- [Cloud Foundry CLI](https://github.com/cloudfoundry/cli/releases)
- Multi-target Application (MTA) Build Tool (`mbt`)
- CF Multi-Apps Plugin (`cf install-plugin multiapps`)

### Build and Deploy
```bash
# Build the MTA archive
mbt build

# Deploy to Cloud Foundry
cf deploy mta_archives/externalca_1.0.0.mtar
```

## Verification

✅ AppRouter serves `sites_down` as the default application.
✅ Authentication is enforced via XSUAA.
✅ DateTime formatting is verified and functional.
✅ OData V4 bindings are correctly implemented.
