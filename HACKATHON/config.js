// config.js - DEBUG VERSION
const CONFIG = {
    SECUREGPT: {
        // Environment - try PREPROD first
        ENVIRONMENT: 'PREPROD',
        
        // From your documentation
        CLIENT_ID: '0l86jisjxs',
        
        // IMPORTANT: Use the exact secret from your documentation
        CLIENT_SECRET: 'GLJrxux3ytbmSOq9GhzB41fvuf6vzhfWKoexHJQvvWlgj57FjU0kkcw8PRwlSLm0', // PREPROD
        // For PROD, change to: 'E39FS4Ma0JBNfdomCZN7HrfcVEIrUcs8tPTlHicwJZy0rghMPFcsBy15n9ZdQbNt'
        
        // API Endpoints - CORRECTED based on your docs
        ENDPOINTS: {
            PREPROD: {
                API_URL: 'https://api-pp.se.axa-go.applications.services.axa-tech.intraxa/ago-m365-securegpt-hub-v1-vrs',
                ONE_ACCOUNT: 'https://onelogin.stg.axa.com' // Note: using .stg for PREPROD
            },
            PROD: {
                API_URL: 'https://api.se.axa-go.applications.services.axa-tech.intraxa/ago-m365-securegpt-hub-v1-vrs',
                ONE_ACCOUNT: 'https://onelogin.stg.axa.com' // Based on your README examples
            }
        },
        
        DEFAULT_MODEL: 'gpt-4o-mini-2024-07-18',
        API_VERSION: '2024-02-01',
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.7,
        SCOPE: 'urn:grp:chatgpt'
    }
};

window.AppConfig = CONFIG;