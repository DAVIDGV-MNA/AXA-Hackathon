javascript
// config.js - ⚠️ PROTOTYPE ONLY - DO NOT DEPLOY WITH REAL SECRETS!
const CONFIG = {
    // SecureGPT API Configuration
    SECUREGPT: {
        // From your documentation - choose your environment
        ENVIRONMENT: 'PREPROD', // or 'PROD', 'INT'
        
        // Client credentials (replace with your actual values)
        CLIENT_ID: '0l86jisjxs', // From your docs
        CLIENT_SECRET: 'YOUR_ACTUAL_CLIENT_SECRET_HERE', // Replace with decrypted secret
        
        // API Endpoints based on environment
        ENDPOINTS: {
            PREPROD: {
                API_URL: 'https://api-pp.se.axa-go.applications.services.axa-tech.intraxa/ago-m365-securegpt-hub-v1-vrs',
                ONE_ACCOUNT: 'https://onelogin.stg.axa.com'
            },
            PROD: {
                API_URL: 'https://api.se.axa-go.applications.services.axa-tech.intraxa/ago-m365-securegpt-hub-v1-vrs',
                ONE_ACCOUNT: 'https://onelogin.axa.com'
            },
            INT: {
                API_URL: 'https://api-int.se.axa-go.applications.services.axa-tech.intraxa/ago-m365-securegpt-hub-v1-vrs',
                ONE_ACCOUNT: 'https://onelogin.stg.axa.com'
            }
        },
        
        // Model Configuration
        DEFAULT_MODEL: 'gpt-4o-mini-2024-07-18', // or any available model
        API_VERSION: '2024-02-01',
        
        // Request Settings
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.7,
        SCOPE: 'urn:grp:chatgpt'
    },
    
    // App Settings
    APP: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        SUPPORTED_FILES: ['.pdf', '.doc', '.docx', '.txt', '.md'],
        CONVERSATION_HISTORY_LIMIT: 20 // Keep last 20 messages for context
    }
};

// Export for use in main app
window.AppConfig = CONFIG;
