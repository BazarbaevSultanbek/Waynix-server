// const { google } = require('googleapis');
// const { Readable } = require('stream');
// const fs = require('fs');

/*
⚠️ TEMPORARILY DISABLED

Reason:
- OAuth client is not configured
- Secrets removed from repo
- Prevents runtime crashes
*/

// const oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
// );

// oauth2Client.setCredentials({
//     refresh_token: process.env.REFRESH_TOKEN,
// });

// const drive = google.drive({
//     version: 'v3',
//     auth: oauth2Client,
// });

class FileController {
    async uploadFile() {
        throw new Error("File upload is disabled");
    }

    async deleteFile() {
        throw new Error("File delete is disabled");
    }

    async generatePublicUrl() {
        throw new Error("Public URL generation is disabled");
    }
}

module.exports = new FileController();
