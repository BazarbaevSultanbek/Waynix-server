const { google } = require("googleapis");
const { Readable } = require("stream");

class GoogleDriveService {
  constructor() {
    this._drive = null;
  }

  _getCredentials() {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
    }

    try {
      return JSON.parse(raw);
    } catch {
      // Handles env values where newlines are escaped
      return JSON.parse(raw.replace(/\\n/g, "\n"));
    }
  }

  _getDriveClient() {
    if (this._drive) return this._drive;

    const credentials = this._getCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    this._drive = google.drive({ version: "v3", auth });
    return this._drive;
  }

  async uploadBuffer({
    buffer,
    mimeType,
    fileName,
    folderId = process.env.GOOGLE_DRIVE_FOLDER_ID,
    makePublic = String(process.env.GOOGLE_DRIVE_PUBLIC || "true") === "true",
  }) {
    if (!folderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured");
    }

    const drive = this._getDriveClient();
    const stream = Readable.from(buffer);

    const createRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: "id,name,mimeType",
      supportsAllDrives: true,
    });

    const fileId = createRes.data.id;

    if (makePublic) {
      await drive.permissions.create({
        fileId,
        requestBody: { role: "reader", type: "anyone" },
        supportsAllDrives: true,
      });
    }

    return {
      fileId,
      url: `https://drive.google.com/uc?id=${fileId}`,
      webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
    };
  }
}

module.exports = new GoogleDriveService();
